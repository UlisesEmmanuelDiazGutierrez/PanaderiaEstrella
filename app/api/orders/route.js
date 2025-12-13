/**
 * API DE PEDIDOS
 *
 * Endpoints para gestionar pedidos
 *
 * GET /api/orders - Obtener pedidos (filtrar por usuario/método)
 * POST /api/orders - Crear nuevo pedido
 * PUT /api/orders - Actualizar estado del pedido
 */

import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

/**
 * GET - Obtener pedidos
 * Query params opcionales:
 * - userId: Filtrar por usuario
 * - method: delivery o shipping
 * - status: pending, picked, transit, delivered, cancelled
 */
export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db("estrellabeef");

    // Obtener parámetros de búsqueda
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const method = searchParams.get("method");
    const status = searchParams.get("status");

    // Construir filtro
    let filter = {};

    if (userId) {
      filter.userId = userId;
    }

    if (method) {
      filter.method = method;
    }

    if (status) {
      filter.status = status;
    }

    // Obtener pedidos
    const orders = await db
      .collection("orders")
      .find(filter)
      .sort({ createdAt: -1 }) // Más recientes primero
      .toArray();

    return NextResponse.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener pedidos",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Crear nuevo pedido
 * Body requerido:
 * {
 *   userId: string,
 *   items: [{productId, name, price, quantity, weight, image}],
 *   customer: {name, address, phone},
 *   total: number,
 *   weight: number,
 *   method: string (delivery/shipping),
 *   payment: string (card/transfer/cash)
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json();

    // Validar campos requeridos
    const requiredFields = [
      "userId",
      "items",
      "customer",
      "total",
      "weight",
      "method",
      "payment",
    ];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `El campo '${field}' es obligatorio`,
          },
          { status: 400 }
        );
      }
    }

    // Validar items
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "El pedido debe tener al menos un producto",
        },
        { status: 400 }
      );
    }

    // Validar customer
    if (!body.customer.name || !body.customer.address || !body.customer.phone) {
      return NextResponse.json(
        {
          success: false,
          error: "Datos del cliente incompletos",
        },
        { status: 400 }
      );
    }

    // Validar método de entrega
    if (!["delivery", "shipping"].includes(body.method)) {
      return NextResponse.json(
        {
          success: false,
          error: "Método de entrega inválido",
        },
        { status: 400 }
      );
    }

    // Validar método de pago
    if (!["card", "transfer", "cash"].includes(body.payment)) {
      return NextResponse.json(
        {
          success: false,
          error: "Método de pago inválido",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("estrellabeef");

    // Crear objeto de pedido
    const newOrder = {
      userId: body.userId,
      items: body.items.map((item) => ({
        productId: item.id || item.productId,
        name: item.name,
        price: parseFloat(item.price),
        quantity: parseFloat(item.quantity),
        weight: parseFloat(item.weight),
        image: item.image,
      })),
      customer: {
        name: body.customer.name,
        address: body.customer.address,
        phone: body.customer.phone,
      },
      total: parseFloat(body.total),
      weight: parseFloat(body.weight),
      method: body.method,
      payment: body.payment,
      status: "pending",
      statusHistory: [
        {
          status: "pending",
          timestamp: new Date(),
        },
      ],
      notes: body.notes || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insertar pedido
    const result = await db.collection("orders").insertOne(newOrder);

    // Actualizar stock de productos
    for (const item of body.items) {
      const productId = item.id || item.productId;

      // Intentar convertir a ObjectId si es necesario
      let filter;
      try {
        filter = { _id: new ObjectId(productId) };
      } catch {
        filter = { _id: productId };
      }

      await db.collection("products").updateOne(filter, {
        $inc: { stock: -item.quantity }, // Reducir stock
        $set: { updatedAt: new Date() },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Pedido creado exitosamente",
        data: {
          _id: result.insertedId,
          ...newOrder,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear pedido:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al crear pedido",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT - Actualizar estado del pedido
 * Body: { orderId: string, status: string, updatedBy: string }
 */
export async function PUT(request) {
  try {
    const body = await request.json();

    // Validar campos
    if (!body.orderId || !body.status) {
      return NextResponse.json(
        {
          success: false,
          error: "orderId y status son obligatorios",
        },
        { status: 400 }
      );
    }

    // Validar estado
    const validStatuses = [
      "pending",
      "picked",
      "transit",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Estado inválido",
        },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("estrellabeef");

    // Convertir orderId a ObjectId
    let orderFilter;
    try {
      orderFilter = { _id: new ObjectId(body.orderId) };
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: "ID de pedido inválido",
        },
        { status: 400 }
      );
    }

    // Preparar actualización
    const updateData = {
      status: body.status,
      updatedAt: new Date(),
    };

    // Si se entregó, guardar fecha
    if (body.status === "delivered") {
      updateData.deliveredAt = new Date();
    }

    // Agregar al historial
    const historyEntry = {
      status: body.status,
      timestamp: new Date(),
    };

    if (body.updatedBy) {
      historyEntry.updatedBy = body.updatedBy;
    }

    // Actualizar pedido
    const result = await db.collection("orders").updateOne(orderFilter, {
      $set: updateData,
      $push: { statusHistory: historyEntry },
    });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Pedido no encontrado",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Pedido actualizado a ${body.status}`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error al actualizar pedido:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al actualizar pedido",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Cancelar pedido
 * Query param: id
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID del pedido es obligatorio" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("estrellabeef");

    // Convertir a ObjectId
    let orderFilter;
    try {
      orderFilter = { _id: new ObjectId(id) };
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "ID de pedido inválido" },
        { status: 400 }
      );
    }

    // Obtener pedido para restaurar stock
    const order = await db.collection("orders").findOne(orderFilter);

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    // Solo permitir cancelar pedidos pendientes
    if (order.status !== "pending") {
      return NextResponse.json(
        {
          success: false,
          error: "Solo se pueden cancelar pedidos pendientes",
        },
        { status: 400 }
      );
    }

    // Restaurar stock de productos
    for (const item of order.items) {
      let productFilter;
      try {
        productFilter = { _id: new ObjectId(item.productId) };
      } catch {
        productFilter = { _id: item.productId };
      }

      await db.collection("products").updateOne(productFilter, {
        $inc: { stock: item.quantity }, // Restaurar stock
        $set: { updatedAt: new Date() },
      });
    }

    // Marcar pedido como cancelado
    await db.collection("orders").updateOne(orderFilter, {
      $set: {
        status: "cancelled",
        updatedAt: new Date(),
      },
      $push: {
        statusHistory: {
          status: "cancelled",
          timestamp: new Date(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pedido cancelado exitosamente",
    });
  } catch (error) {
    console.error("Error al cancelar pedido:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al cancelar pedido",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
