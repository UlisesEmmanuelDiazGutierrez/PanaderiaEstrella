/**
 * API DE AUTENTICACIÓN - REGISTRO
 *
 * Endpoint para registrar nuevos usuarios
 * POST /api/auth/register
 *
 * Body: { name, email, password, role (opcional), phone, defaultAddress }
 * Response: { success: boolean, user: object }
 */

import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

/**
 * POST - Registrar nuevo usuario
 */
export async function POST(request) {
  try {
    const body = await request.json();

    // Validar campos requeridos
    const requiredFields = ["name", "email", "password"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `El campo '${field}' es obligatorio`,
          },
          { status: 400 },
        );
      }
    }

    // Validar email
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Email inválido",
        },
        { status: 400 },
      );
    }

    // Validar contraseña (mínimo 3 caracteres)
    if (body.password.length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: "La contraseña debe tener al menos 3 caracteres",
        },
        { status: 400 },
      );
    }

    // Validar rol
    const validRoles = ["customer", "delivery", "shipping", "admin"];
    const role = body.role || "customer";
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        {
          success: false,
          error: "Rol inválido",
        },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("panaderia_db");

    // Verificar si el email ya existe
    const existingUser = await db.collection("users").findOne({
      email: body.email.toLowerCase().trim(),
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Este email ya está registrado",
        },
        { status: 409 },
      );
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(body.password, salt);

    // Crear objeto de usuario
    const newUser = {
      name: body.name.trim(),
      email: body.email.toLowerCase().trim(),
      password: hashedPassword,
      role: role,
      phone: body.phone || "",
      defaultAddress: body.defaultAddress || "",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insertar en la base de datos
    const result = await db.collection("users").insertOne(newUser);

    // Preparar datos del usuario (sin contraseña)
    const userData = {
      id: result.insertedId.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      defaultAddress: newUser.defaultAddress,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Usuario registrado exitosamente",
        user: userData,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al registrar usuario",
        message: error.message,
      },
      { status: 500 },
    );
  }
}
