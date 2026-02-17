/**
 * API DE REPORTES
 *
 * GET /api/reports?period=all|year|month&year=2025&month=12
 * Genera reportes en formato CSV para Excel
 */

import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

/**
 * GET - Generar reporte de ventas
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "all";
    const year = parseInt(searchParams.get("year")) || new Date().getFullYear();
    const month =
      parseInt(searchParams.get("month")) || new Date().getMonth() + 1;

    const client = await clientPromise;
    const db = client.db("panaderia_db");

    // Construir filtro de fecha
    let dateFilter = {};

    if (period === "year") {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59);
      dateFilter = {
        createdAt: { $gte: startDate, $lte: endDate },
      };
    } else if (period === "month") {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      dateFilter = {
        createdAt: { $gte: startDate, $lte: endDate },
      };
    }

    // Obtener pedidos
    const orders = await db
      .collection("orders")
      .find({ ...dateFilter, status: { $ne: "cancelled" } })
      .sort({ createdAt: -1 })
      .toArray();

    // Generar CSV
    const headers = [
      "ID Pedido",
      "Fecha",
      "Cliente",
      "Teléfono",
      "Dirección",
      "Total",
      "Peso (kg)",
      "Método Entrega",
      "Método Pago",
      "Estado",
      "Productos",
    ];

    const rows = orders.map((order) => {
      const productos = order.items
        .map((item) => `${item.name} (${item.quantity}kg)`)
        .join("; ");

      return [
        order._id.toString().slice(-8),
        new Date(order.createdAt).toLocaleDateString("es-MX"),
        order.customer.name,
        order.customer.phone,
        order.customer.address,
        `$${order.total}`,
        order.weight,
        order.method === "delivery" ? "Local" : "Paquetería",
        order.payment === "card"
          ? "Tarjeta"
          : order.payment === "transfer"
            ? "Transferencia"
            : "Efectivo",
        order.status,
        productos,
      ];
    });

    // Construir CSV
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Calcular estadísticas
    const totalVentas = orders.reduce((sum, o) => sum + o.total, 0);
    const totalPedidos = orders.length;
    const pesoTotal = orders.reduce((sum, o) => sum + o.weight, 0);

    // Agregar resumen al final
    const resumen = `\n\n"RESUMEN"\n"Total Pedidos","${totalPedidos}"\n"Total Ventas","$${totalVentas}"\n"Peso Total","${pesoTotal}kg"`;

    // Retornar CSV
    return new NextResponse(csvContent + resumen, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="reporte_ventas_${period}_${year}${
          period === "month" ? "_" + month : ""
        }.csv"`,
      },
    });
  } catch (error) {
    console.error("Error al generar reporte:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al generar reporte",
        message: error.message,
      },
      { status: 500 },
    );
  }
}
