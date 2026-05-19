/**
 * app/api/orders/route.js
 * CRUD de pedidos — migrado de array en memoria a Supabase/PostgreSQL
 *
 * GET    /api/orders?userId=X | ?method=delivery | ?method=shipping
 * POST   /api/orders          — crear pedido + detalle (trigger descuenta stock)
 * PUT    /api/orders          — actualizar estado
 * DELETE /api/orders?id=X     — cancelar pedido (solo si está pendiente)
 */

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// ── GET ────────────────────────────────────────────────────────────────────
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId"); // id_usuario del cliente
    const method = searchParams.get("method"); // "delivery" | "shipping"

    let query = supabase
      .from("pedidos")
      .select(
        `
        id_pedido,
        fecha,
        estado,
        total,
        clientes (
          id_cliente,
          direccion,
          usuarios ( nombre, telefono, email )
        ),
        detalle_pedidos (
          id_detalle,
          cantidad,
          precio_unitario,
          productos ( id_producto, nombre, imagen, atributos )
        ),
        pagos ( metodo_pago, monto ),
        envios (
          estado,
          id_repartidor,
          id_paqueteria,
          paqueterias ( nombre )
        )
      `,
      )
      .order("fecha", { ascending: false });

    // Filtrar por cliente (role = customer)
    if (userId) {
      // Resolver id_cliente desde id_usuario
      const { data: cliente } = await supabase
        .from("clientes")
        .select("id_cliente")
        .eq("id_usuario", userId)
        .maybeSingle();

      if (cliente) {
        query = query.eq("id_cliente", cliente.id_cliente);
      } else {
        return NextResponse.json({ success: true, count: 0, data: [] });
      }
    }

    // Filtrar por método de entrega
    if (method === "delivery") {
      // Pedidos con envío asignado a repartidor (sin paquetería)
      query = query.not("envios.id_repartidor", "is", null);
    } else if (method === "shipping") {
      // Pedidos con paquetería
      query = query.not("envios.id_paqueteria", "is", null);
    }

    const { data: pedidos, error } = await query;
    if (error) throw error;

    // Normalizar al shape que usa el frontend (mismo que venía de MongoDB)
    const normalized = pedidos.map((p) => ({
      _id: p.id_pedido,
      id: p.id_pedido,
      userId: p.clientes?.usuarios ? undefined : null, // no lo usamos en respuesta
      customer: {
        name: p.clientes?.usuarios?.nombre ?? "",
        phone: p.clientes?.usuarios?.telefono ?? "",
        address: p.clientes?.direccion ?? "",
      },
      items: (p.detalle_pedidos || []).map((d) => ({
        productId: d.productos?.id_producto,
        name: d.productos?.nombre,
        price: parseFloat(d.precio_unitario),
        quantity: d.cantidad,
        weight: d.productos?.atributos?.peso_g
          ? d.productos.atributos.peso_g / 1000
          : (d.productos?.atributos?.peso_kg ?? 1),
        image: d.productos?.imagen ?? "",
      })),
      total: parseFloat(p.total),
      payment: p.pagos?.[0]?.metodo_pago ?? "efectivo",
      method: p.envios?.[0]?.id_paqueteria ? "shipping" : "delivery",
      status: p.estado,
      createdAt: p.fecha,
    }));

    return NextResponse.json({
      success: true,
      count: normalized.length,
      data: normalized,
    });
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener pedidos",
        message: error.message,
      },
      { status: 500 },
    );
  }
}

// ── POST ───────────────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const body = await request.json();

    // Validaciones (mismas que antes)
    if (!body.userId)
      return NextResponse.json(
        { success: false, message: "userId es requerido" },
        { status: 400 },
      );
    if (!body.items?.length)
      return NextResponse.json(
        { success: false, message: "items es requerido" },
        { status: 400 },
      );
    if (
      !body.delivery?.name ||
      !body.delivery?.address ||
      !body.delivery?.phone
    )
      return NextResponse.json(
        { success: false, message: "Datos de entrega incompletos" },
        { status: 400 },
      );
    if (!body.total)
      return NextResponse.json(
        { success: false, message: "total es requerido" },
        { status: 400 },
      );
    if (!body.payment)
      return NextResponse.json(
        { success: false, message: "payment es requerido" },
        { status: 400 },
      );
    if (!body.method)
      return NextResponse.json(
        { success: false, message: "method es requerido" },
        { status: 400 },
      );

    // Resolver id_cliente
    const { data: cliente, error: cliError } = await supabase
      .from("clientes")
      .select("id_cliente")
      .eq("id_usuario", body.userId)
      .maybeSingle();

    if (cliError || !cliente) {
      return NextResponse.json(
        { success: false, message: "Cliente no encontrado para este usuario" },
        { status: 404 },
      );
    }

    // Actualizar dirección del cliente si vino nueva
    if (body.delivery.address) {
      await supabase
        .from("clientes")
        .update({ direccion: body.delivery.address })
        .eq("id_cliente", cliente.id_cliente);
    }

    // ── Crear pedido ────────────────────────────────────────────────────────
    const { data: pedido, error: pedidoError } = await supabase
      .from("pedidos")
      .insert({
        id_cliente: cliente.id_cliente,
        estado: "pendiente",
        total: 0, // el trigger lo recalcula al insertar detalles
      })
      .select("id_pedido")
      .single();

    if (pedidoError) throw pedidoError;

    // ── Insertar detalles (el trigger descuenta stock automáticamente) ───────
    const detalles = body.items.map((item) => ({
      id_pedido: pedido.id_pedido,
      id_producto: item.id || item.productId,
      cantidad: Math.ceil(item.quantity), // stock es INTEGER
      precio_unitario: parseFloat(item.price),
    }));

    const { error: detalleError } = await supabase
      .from("detalle_pedidos")
      .insert(detalles);

    // Si el trigger lanza excepción por stock insuficiente, llegará aquí
    if (detalleError) {
      // Revertir: eliminar el pedido vacío
      await supabase.from("pedidos").delete().eq("id_pedido", pedido.id_pedido);
      return NextResponse.json(
        { success: false, message: detalleError.message },
        { status: 409 },
      );
    }

    // ── Registrar pago ──────────────────────────────────────────────────────
    // Mapear método del frontend al CHECK de la tabla
    const metodoPagoMap = {
      card: "tarjeta",
      transfer: "transferencia",
      cash: "efectivo",
      efectivo: "efectivo",
      tarjeta: "tarjeta",
      transferencia: "transferencia",
    };

    await supabase.from("pagos").insert({
      id_pedido: pedido.id_pedido,
      metodo_pago: metodoPagoMap[body.payment] ?? "efectivo",
      monto: parseFloat(body.total),
    });

    // ── Crear envío ─────────────────────────────────────────────────────────
    const envioData = { id_pedido: pedido.id_pedido, estado: "pendiente" };

    if (body.method === "shipping" && body.paqueteriaId) {
      envioData.id_paqueteria = body.paqueteriaId;
    }
    // Para "delivery" se asigna repartidor luego (por el repartidor mismo)

    const { data: envio } = await supabase
      .from("envios")
      .insert(envioData)
      .select("id_envio")
      .single();

    // Detalle de envío con peso
    if (envio && body.weight) {
      await supabase.from("detalle_envio").insert({
        id_envio: envio.id_envio,
        peso_kg: parseFloat(body.weight),
        observaciones: body.notes || null,
      });
    }

    console.log("✅ Pedido creado:", pedido.id_pedido);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: pedido.id_pedido,
          _id: pedido.id_pedido,
          status: "pendiente",
        },
        message: "Pedido creado exitosamente",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error al crear pedido:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error al crear pedido",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// ── PUT ────────────────────────────────────────────────────────────────────
export async function PUT(request) {
  try {
    const { orderId, status } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, message: "orderId y status son obligatorios" },
        { status: 400 },
      );
    }

    const validStatuses = [
      "pendiente",
      "picked",
      "transit",
      "delivered",
      "cancelado",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: `Estado inválido. Opciones: ${validStatuses.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("pedidos")
      .update({ estado: status })
      .eq("id_pedido", orderId)
      .select("id_pedido, estado")
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json(
        { success: false, message: "Orden no encontrada" },
        { status: 404 },
      );
    }

    // Sincronizar estado del envío también
    await supabase
      .from("envios")
      .update({ estado: status === "cancelado" ? "pendiente" : status })
      .eq("id_pedido", orderId);

    console.log(`✅ Pedido ${orderId} → ${status}`);

    return NextResponse.json({
      success: true,
      data: { id: data.id_pedido, status: data.estado },
      message: `Pedido actualizado a ${status}`,
    });
  } catch (error) {
    console.error("Error al actualizar pedido:", error);
    return NextResponse.json(
      { success: false, message: "Error al actualizar pedido" },
      { status: 500 },
    );
  }
}

// ── DELETE (cancelar) ──────────────────────────────────────────────────────
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID del pedido es obligatorio" },
        { status: 400 },
      );
    }

    // Verificar estado actual
    const { data: pedido } = await supabase
      .from("pedidos")
      .select("estado")
      .eq("id_pedido", id)
      .single();

    if (!pedido) {
      return NextResponse.json(
        { success: false, message: "Pedido no encontrado" },
        { status: 404 },
      );
    }

    if (pedido.estado !== "pendiente") {
      return NextResponse.json(
        {
          success: false,
          message: "Solo se pueden cancelar pedidos pendientes",
        },
        { status: 400 },
      );
    }

    await supabase
      .from("pedidos")
      .update({ estado: "cancelado" })
      .eq("id_pedido", id);

    console.log(`✅ Pedido ${id} cancelado`);

    return NextResponse.json({
      success: true,
      message: "Pedido cancelado exitosamente",
    });
  } catch (error) {
    console.error("Error al cancelar pedido:", error);
    return NextResponse.json(
      { success: false, message: "Error al cancelar pedido" },
      { status: 500 },
    );
  }
}
