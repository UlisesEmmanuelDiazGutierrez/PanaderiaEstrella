import { NextResponse } from "next/server";

// Datos de prueba en memoria
let orders = [];

// GET - Obtener órdenes
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const method = searchParams.get("method");

  let filteredOrders = orders;

  if (userId) {
    filteredOrders = orders.filter((o) => o.userId === userId);
  } else if (method) {
    filteredOrders = orders.filter((o) => o.method === method);
  }

  return NextResponse.json({
    success: true,
    count: filteredOrders.length,
    data: filteredOrders,
  });
}

// POST - Crear orden
export async function POST(request) {
  try {
    const body = await request.json();

    console.log("📦 Datos recibidos:", JSON.stringify(body, null, 2));

    // Validaciones
    if (!body.userId) {
      console.log("❌ Falta userId");
      return NextResponse.json(
        { success: false, message: "userId es requerido" },
        { status: 400 },
      );
    }

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      console.log("❌ Falta items o está vacío");
      return NextResponse.json(
        { success: false, message: "items es requerido" },
        { status: 400 },
      );
    }

    if (!body.delivery) {
      console.log("❌ Falta delivery");
      return NextResponse.json(
        { success: false, message: "delivery es requerido" },
        { status: 400 },
      );
    }

    if (!body.delivery.name || !body.delivery.address || !body.delivery.phone) {
      console.log("❌ Datos de delivery incompletos");
      return NextResponse.json(
        {
          success: false,
          message: "Datos de entrega incompletos (name, address, phone)",
        },
        { status: 400 },
      );
    }

    if (!body.total) {
      console.log("❌ Falta total");
      return NextResponse.json(
        { success: false, message: "total es requerido" },
        { status: 400 },
      );
    }

    if (!body.weight) {
      console.log("❌ Falta weight");
      return NextResponse.json(
        { success: false, message: "weight es requerido" },
        { status: 400 },
      );
    }

    if (!body.payment) {
      console.log("❌ Falta payment");
      return NextResponse.json(
        { success: false, message: "payment es requerido" },
        { status: 400 },
      );
    }

    if (!body.method) {
      console.log("❌ Falta method");
      return NextResponse.json(
        { success: false, message: "method es requerido" },
        { status: 400 },
      );
    }

    // Crear la orden
    const newOrder = {
      _id: Date.now().toString(),
      userId: body.userId,
      items: body.items.map((item) => ({
        productId: item.id || item.productId,
        name: item.name,
        price: parseFloat(item.price),
        quantity: parseFloat(item.quantity),
        weight: parseFloat(item.weight || 1),
        image: item.image || "",
      })),
      customer: {
        name: body.delivery.name,
        address: body.delivery.address,
        phone: body.delivery.phone,
      },
      total: parseFloat(body.total),
      weight: parseFloat(body.weight),
      payment: body.payment,
      method: body.method,
      status: "pending",
      notes: body.notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orders.push(newOrder);

    console.log("✅ Orden creada exitosamente:", newOrder._id);

    return NextResponse.json(
      {
        success: true,
        data: newOrder,
        message: "Pedido creado exitosamente",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("❌ Error crítico al crear orden:", error);
    console.error("Stack trace:", error.stack);

    return NextResponse.json(
      {
        success: false,
        message: "Error al crear orden",
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// PUT - Actualizar estado de orden
export async function PUT(request) {
  try {
    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, message: "orderId y status son obligatorios" },
        { status: 400 },
      );
    }

    const index = orders.findIndex((o) => o._id === orderId);

    if (index === -1) {
      return NextResponse.json(
        { success: false, message: "Orden no encontrada" },
        { status: 404 },
      );
    }

    orders[index] = {
      ...orders[index],
      status,
      updatedAt: new Date().toISOString(),
    };

    console.log(`✅ Orden ${orderId} actualizada a ${status}`);

    return NextResponse.json({
      success: true,
      data: orders[index],
      message: `Pedido actualizado a ${status}`,
    });
  } catch (error) {
    console.error("Error al actualizar orden:", error);
    return NextResponse.json(
      { success: false, message: "Error al actualizar orden" },
      { status: 500 },
    );
  }
}

// DELETE - Cancelar pedido
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

    const index = orders.findIndex((o) => o._id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, message: "Pedido no encontrado" },
        { status: 404 },
      );
    }

    // Solo permitir cancelar pedidos pendientes
    if (orders[index].status !== "pending") {
      return NextResponse.json(
        {
          success: false,
          message: "Solo se pueden cancelar pedidos pendientes",
        },
        { status: 400 },
      );
    }

    orders[index] = {
      ...orders[index],
      status: "cancelled",
      updatedAt: new Date().toISOString(),
    };

    console.log(`✅ Pedido ${id} cancelado`);

    return NextResponse.json({
      success: true,
      message: "Pedido cancelado exitosamente",
    });
  } catch (error) {
    console.error("Error al cancelar pedido:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error al cancelar pedido",
      },
      { status: 500 },
    );
  }
}
