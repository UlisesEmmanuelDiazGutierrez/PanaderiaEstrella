/**
 * app/api/products/route.js
 * CRUD de productos — migrado de MongoDB a Supabase/PostgreSQL
 *
 * GET    /api/products?category=X&promo=true&search=X
 * POST   /api/products          — crear producto (admin)
 * PUT    /api/products          — actualizar producto (admin)
 * DELETE /api/products?id=X     — soft delete (admin)
 */

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const VALID_CATEGORIES = ["Pan Dulce", "Pan Salado", "Bollería", "Pasteles"];

// ── GET ────────────────────────────────────────────────────────────────────
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const promo = searchParams.get("promo");
    const search = searchParams.get("search");

    // Traer productos con nombre de categoría mediante JOIN
    let query = supabase
      .from("productos")
      .select(
        `
        id_producto,
        nombre,
        descripcion,
        precio,
        stock,
        imagen,
        activo,
        atributos,
        categorias_productos ( nombre )
      `,
      )
      .eq("activo", true)
      .order("nombre", { ascending: true });

    // Filtro por categoría
    if (category && category !== "Todo") {
      // Primero buscamos el id de la categoría
      const { data: cat } = await supabase
        .from("categorias_productos")
        .select("id_categoria")
        .eq("nombre", category)
        .maybeSingle();

      if (cat) query = query.eq("id_categoria", cat.id_categoria);
    }

    // Filtro promo (campo en JSONB atributos)
    if (promo === "true") {
      query = query.eq("atributos->>promo", "true");
    }

    // Búsqueda por nombre (ilike = case-insensitive)
    if (search) {
      query = query.ilike("nombre", `%${search}%`);
    }

    const { data: products, error } = await query;
    if (error) throw error;

    // Normalizar la respuesta para que el frontend reciba la misma forma
    const normalized = products.map((p) => ({
      _id: p.id_producto, // hooks usan product._id
      id: p.id_producto,
      name: p.nombre,
      description: p.descripcion,
      price: parseFloat(p.precio),
      stock: p.stock,
      image: p.imagen,
      category: p.categorias_productos?.nombre ?? null,
      isActive: p.activo,
      // atributos JSONB: peso, alergenos, vegana, etc.
      weight: p.atributos?.peso_g
        ? p.atributos.peso_g / 1000
        : (p.atributos?.peso_kg ?? 1),
      promo: p.atributos?.promo === true,
      atributos: p.atributos,
    }));

    return NextResponse.json({
      success: true,
      count: normalized.length,
      data: normalized,
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener productos",
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

    // Validar campos requeridos
    for (const field of ["name", "price", "category", "stock"]) {
      if (
        body[field] === undefined ||
        body[field] === null ||
        body[field] === ""
      ) {
        return NextResponse.json(
          { success: false, error: `El campo '${field}' es obligatorio` },
          { status: 400 },
        );
      }
    }

    if (!VALID_CATEGORIES.includes(body.category)) {
      return NextResponse.json(
        {
          success: false,
          error: `Categoría inválida. Opciones: ${VALID_CATEGORIES.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Resolver id_categoria
    const { data: cat, error: catError } = await supabase
      .from("categorias_productos")
      .select("id_categoria")
      .eq("nombre", body.category)
      .single();

    if (catError || !cat) {
      return NextResponse.json(
        {
          success: false,
          error: "Categoría no encontrada en la base de datos",
        },
        { status: 400 },
      );
    }

    // Construir atributos JSONB
    const atributos = {
      ...(body.atributos || {}),
      promo: body.promo || false,
      ...(body.weight ? { peso_g: parseFloat(body.weight) * 1000 } : {}),
    };

    const { data: created, error } = await supabase
      .from("productos")
      .insert({
        nombre: body.name,
        descripcion: body.description || null,
        precio: parseFloat(body.price),
        stock: parseInt(body.stock),
        id_categoria: cat.id_categoria,
        imagen: body.image || null,
        activo: true,
        atributos,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      { success: true, message: "Producto creado exitosamente", data: created },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error al crear producto:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al crear producto",
        message: error.message,
      },
      { status: 500 },
    );
  }
}

// ── PUT ────────────────────────────────────────────────────────────────────
export async function PUT(request) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: "ID del producto es obligatorio" },
        { status: 400 },
      );
    }

    const updateFields = {};

    if (body.name !== undefined) updateFields.nombre = body.name;
    if (body.description !== undefined)
      updateFields.descripcion = body.description;
    if (body.price !== undefined) updateFields.precio = parseFloat(body.price);
    if (body.stock !== undefined) updateFields.stock = parseInt(body.stock);
    if (body.image !== undefined) updateFields.imagen = body.image;
    if (body.isActive !== undefined) updateFields.activo = body.isActive;

    // Cambio de categoría
    if (body.category !== undefined) {
      const { data: cat } = await supabase
        .from("categorias_productos")
        .select("id_categoria")
        .eq("nombre", body.category)
        .maybeSingle();

      if (cat) updateFields.id_categoria = cat.id_categoria;
    }

    // Actualizar atributos JSONB (merge)
    if (
      body.promo !== undefined ||
      body.weight !== undefined ||
      body.atributos !== undefined
    ) {
      // Traer atributos actuales primero
      const { data: current } = await supabase
        .from("productos")
        .select("atributos")
        .eq("id_producto", body.id)
        .single();

      updateFields.atributos = {
        ...(current?.atributos || {}),
        ...(body.atributos || {}),
        ...(body.promo !== undefined ? { promo: body.promo } : {}),
        ...(body.weight !== undefined
          ? { peso_g: parseFloat(body.weight) * 1000 }
          : {}),
      };
    }

    const { data: updated, error } = await supabase
      .from("productos")
      .update(updateFields)
      .eq("id_producto", body.id)
      .select()
      .single();

    if (error) throw error;
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Producto no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Producto actualizado exitosamente",
      data: updated,
    });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al actualizar producto",
        message: error.message,
      },
      { status: 500 },
    );
  }
}

// ── DELETE (soft) ──────────────────────────────────────────────────────────
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID del producto es obligatorio" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("productos")
      .update({ activo: false })
      .eq("id_producto", id)
      .select("id_producto")
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json(
        { success: false, error: "Producto no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Producto eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al eliminar producto",
        message: error.message,
      },
      { status: 500 },
    );
  }
}
