/**
 * API DE PRODUCTOS (ACTUALIZADA CON FUNCIONES DE ADMIN)
 *
 * GET /api/products - Obtener todos los productos
 * POST /api/products - Crear nuevo producto (admin)
 * PUT /api/products - Actualizar producto existente (admin)
 * DELETE /api/products - Eliminar producto (admin)
 */

import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

/**
 * GET - Obtener productos
 */
export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db("panaderia_db");

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const promo = searchParams.get("promo");
    const search = searchParams.get("search");

    let filter = { isActive: true };

    if (category && category !== "Todo") {
      filter.category = category;
    }

    if (promo === "true") {
      filter.promo = true;
    }

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const products = await db
      .collection("products")
      .find(filter)
      .sort({ category: 1, name: 1 })
      .toArray();

    return NextResponse.json({
      success: true,
      count: products.length,
      data: products,
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

/**
 * POST - Crear nuevo producto (admin)
 */
export async function POST(request) {
  try {
    const body = await request.json();

    // Validar campos requeridos
    const requiredFields = [
      "name",
      "price",
      "weight",
      "image",
      "category",
      "stock",
    ];
    for (const field of requiredFields) {
      if (!body[field] && body[field] !== 0) {
        return NextResponse.json(
          { success: false, error: `El campo '${field}' es obligatorio` },
          { status: 400 },
        );
      }
    }

    // Validar categoría
    const validCategories = ["Pan Dulce", "Pan Salado", "Bollería", "Pasteles"];
    if (!validCategories.includes(body.category)) {
      return NextResponse.json(
        {
          success: false,
          error: "Categoría inválida. Debe ser: Res, Cerdo o Cortes",
        },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("panaderia_db");

    // Crear producto
    const newProduct = {
      name: body.name,
      price: parseFloat(body.price),
      weight: parseFloat(body.weight),
      image: body.image,
      category: body.category,
      stock: parseInt(body.stock),
      promo: body.promo || false,
      description: body.description || "",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("products").insertOne(newProduct);

    return NextResponse.json(
      {
        success: true,
        message: "Producto creado exitosamente",
        data: { _id: result.insertedId, ...newProduct },
      },
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

/**
 * PUT - Actualizar producto existente (admin)
 */
export async function PUT(request) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: "ID del producto es obligatorio" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("panaderia_db");

    // Construir objeto de actualización
    const updateFields = {};
    const allowedFields = [
      "name",
      "price",
      "weight",
      "image",
      "category",
      "stock",
      "promo",
      "description",
      "isActive",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateFields[field] = body[field];
      }
    }

    updateFields.updatedAt = new Date();

    // Actualizar producto
    const result = await db
      .collection("products")
      .updateOne({ _id: new ObjectId(body.id) }, { $set: updateFields });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Producto no encontrado" },
        { status: 404 },
      );
    }

    // Obtener producto actualizado
    const updatedProduct = await db
      .collection("products")
      .findOne({ _id: new ObjectId(body.id) });

    return NextResponse.json({
      success: true,
      message: "Producto actualizado exitosamente",
      data: updatedProduct,
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

/**
 * DELETE - Eliminar producto (soft delete)
 */
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

    const client = await clientPromise;
    const db = client.db("panaderia_db");

    // Soft delete
    const result = await db
      .collection("products")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { isActive: false, updatedAt: new Date() } },
      );

    if (result.matchedCount === 0) {
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
