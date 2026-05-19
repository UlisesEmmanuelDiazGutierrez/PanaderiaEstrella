/**
 * app/api/reports/route.js
 * Reporte de ventas en CSV — migrado de MongoDB a Supabase/PostgreSQL
 *
 * GET /api/reports?period=all|year|month&year=2025&month=12
 */

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "all";
    const year = parseInt(searchParams.get("year")) || new Date().getFullYear();
    const month =
      parseInt(searchParams.get("month")) || new Date().getMonth() + 1;

    // ── Construir filtro de fecha ──────────────────────────────────────────
    let query = supabase
      .from("pedidos")
      .select(
        `
        id_pedido,
        fecha,
        estado,
        total,
        clientes (
          direccion,
          usuarios ( nombre, telefono )
        ),
        detalle_pedidos (
          cantidad,
          precio_unitario,
          productos ( nombre, atributos )
        ),
        pagos ( metodo_pago ),
        envios ( id_repartidor, id_paqueteria )
      `,
      )
      .neq("estado", "cancelado")
      .order("fecha", { ascending: false });

    if (period === "year") {
      query = query.gte("fecha", `${year}-01-01`).lte("fecha", `${year}-12-31`);
    } else if (period === "month") {
      const lastDay = new Date(year, month, 0).getDate();
      const mm = String(month).padStart(2, "0");
      query = query
        .gte("fecha", `${year}-${mm}-01`)
        .lte("fecha", `${year}-${mm}-${lastDay}`);
    }

    const { data: pedidos, error } = await query;
    if (error) throw error;

    // ── Generar CSV ────────────────────────────────────────────────────────
    const headers = [
      "ID Pedido",
      "Fecha",
      "Cliente",
      "Teléfono",
      "Dirección",
      "Total",
      "Método Entrega",
      "Método Pago",
      "Estado",
      "Productos",
    ];

    const rows = pedidos.map((p) => {
      const productos = (p.detalle_pedidos || [])
        .map((d) => {
          const pesoKg = d.productos?.atributos?.peso_g
            ? (d.productos.atributos.peso_g / 1000) * d.cantidad
            : d.cantidad;
          return `${d.productos?.nombre ?? "?"} (${pesoKg}kg)`;
        })
        .join("; ");

      const metodoEntrega = p.envios?.[0]?.id_paqueteria
        ? "Paquetería"
        : "Local";
      const metodoPago =
        {
          tarjeta: "Tarjeta",
          transferencia: "Transferencia",
          efectivo: "Efectivo",
          otro: "Otro",
        }[p.pagos?.[0]?.metodo_pago] ?? "Efectivo";

      return [
        String(p.id_pedido).padStart(8, "0"),
        new Date(p.fecha).toLocaleDateString("es-MX"),
        p.clientes?.usuarios?.nombre ?? "",
        p.clientes?.usuarios?.telefono ?? "",
        p.clientes?.direccion ?? "",
        `$${parseFloat(p.total).toFixed(2)}`,
        metodoEntrega,
        metodoPago,
        p.estado,
        productos,
      ];
    });

    // ── Estadísticas ───────────────────────────────────────────────────────
    const totalVentas = pedidos.reduce((s, p) => s + parseFloat(p.total), 0);
    const totalPedidos = pedidos.length;

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      ),
      "",
      '"RESUMEN"',
      `"Total Pedidos","${totalPedidos}"`,
      `"Total Ventas","$${totalVentas.toFixed(2)}"`,
    ].join("\n");

    const filename = `reporte_ventas_${period}_${year}${period === "month" ? "_" + month : ""}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
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
