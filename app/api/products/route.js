/**
 * API DE PRODUCTOS
 *
 * Endpoints para gestionar productos (cortes de carne)
 *
 * GET /api/products - Obtener todos los productos
 * GET /api/products?category=Res - Filtrar por categoría
 * GET /api/products?promo=true - Solo promociones
 * POST /api/products - Crear nuevo producto (admin)
 */

import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

/**
 * GET - Obtener productos
 * Query params opcionales:
 * - category: Filtrar por categoría (Res, Cerdo, Cortes)
 * - promo: Solo promociones (true)
 * - search: Buscar por nombre
 */
export async function GET(request) {
  try {
    // Conectar a MongoDB
    const client = await clientPromise;
    const db = client.db("estrellabeef");

    // Obtener parámetros de búsqueda desde URL
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const promo = searchParams.get("promo");
    const search = searchParams.get("search");

    // Construir filtro de búsqueda
    let filter = { isActive: true }; // Solo productos activos

    // Filtrar por categoría
    if (category && category !== "Todo") {
      filter.category = category;
    }

    // Filtrar por promociones
    if (promo === "true") {
      filter.promo = true;
    }

    // Buscar por nombre (búsqueda insensible a mayúsculas)
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    // Obtener productos de la base de datos
    const products = await db
      .collection("products")
      .find(filter)
      .sort({ category: 1, name: 1 }) // Ordenar por categoría y nombre
      .toArray();

    // Retornar respuesta exitosa
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
      { status: 500 }
    );
  }
}

/**
 * POST - Crear nuevo producto (solo admin)
 * Body requerido:
 * {
 *   name: string,
 *   price: number,
 *   weight: number,
 *   image: string,
 *   category: string,
 *   stock: number,
 *   promo: boolean,
 *   description: string (opcional)
 * }
 */
export async function POST(request) {
  try {
    // Obtener datos del body
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
          {
            success: false,
            error: `El campo '${field}' es obligatorio`,
          },
          { status: 400 }
        );
      }
    }

    // Validar categoría
    const validCategories = ["Res", "Cerdo", "Cortes"];
    if (!validCategories.includes(body.category)) {
      return NextResponse.json(
        {
          success: false,
          error: "Categoría inválida. Debe ser: Res, Cerdo o Cortes",
        },
        { status: 400 }
      );
    }

    // Conectar a MongoDB
    const client = await clientPromise;
    const db = client.db("estrellabeef");

    // Crear objeto de producto
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

    // Insertar en la base de datos
    const result = await db.collection("products").insertOne(newProduct);

    // Retornar producto creado
    return NextResponse.json(
      {
        success: true,
        message: "Producto creado exitosamente",
        data: {
          _id: result.insertedId,
          ...newProduct,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error al crear producto:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al crear producto",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT - Actualizar producto existente
 * Body: { id: string, ...campos a actualizar }
 */
export async function PUT(request) {
  try {
    const body = await request.json();

    // Validar ID
    if (!body.id) {
      return NextResponse.json(
        { success: false, error: "ID del producto es obligatorio" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("estrellabeef");

    // Convertir a ObjectId
    let productFilter;
    try {
      productFilter = { _id: new ObjectId(body.id) };
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "ID de producto inválido" },
        { status: 400 }
      );
    }

    // Construir objeto de actualización (solo campos proporcionados)
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
      .updateOne(productFilter, { $set: updateFields });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Producto actualizado exitosamente",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al actualizar producto",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Eliminar producto (soft delete)
 * Query param: id
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID del producto es obligatorio" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("estrellabeef");

    // Convertir a ObjectId
    let productFilter;
    try {
      productFilter = { _id: new ObjectId(id) };
    } catch (error) {
      return NextResponse.json(
        { success: false, error: "ID de producto inválido" },
        { status: 400 }
      );
    }

    // Soft delete (marcar como inactivo)
    const result = await db.collection("products").updateOne(productFilter, {
      $set: { isActive: false, updatedAt: new Date() },
    });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Producto no encontrado" },
        { status: 404 }
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
      { status: 500 }
    );
  }
}
