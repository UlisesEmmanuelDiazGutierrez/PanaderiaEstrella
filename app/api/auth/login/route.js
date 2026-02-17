/**
 * API DE AUTENTICACIÓN - LOGIN
 *
 * Endpoint para iniciar sesión
 * POST /api/auth/login
 *
 * Body: { email: string, password: string }
 * Response: { success: boolean, user: object, token: string }
 */

import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

/**
 * POST - Iniciar sesión
 * Valida credenciales y retorna datos del usuario
 */
export async function POST(request) {
  try {
    // Obtener credenciales del body
    const body = await request.json();

    // Validar campos requeridos
    if (!body.email || !body.password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email y contraseña son obligatorios",
        },
        { status: 400 },
      );
    }

    // Conectar a MongoDB
    const client = await clientPromise;
    const db = client.db("panaderia_db");

    // Buscar usuario por email
    const user = await db.collection("users").findOne({
      email: body.email.toLowerCase().trim(),
    });

    // Verificar si el usuario existe
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Credenciales incorrectas",
        },
        { status: 401 },
      );
    }

    // Verificar si la cuenta está activa
    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: "Cuenta inactiva. Contacta al administrador",
        },
        { status: 403 },
      );
    }

    // Comparar contraseña
    const isPasswordValid = await bcrypt.compare(body.password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Credenciales incorrectas",
        },
        { status: 401 },
      );
    }

    // Preparar datos del usuario (sin contraseña)
    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      defaultAddress: user.defaultAddress,
    };

    // Retornar respuesta exitosa
    return NextResponse.json({
      success: true,
      message: "Login exitoso",
      user: userData,
    });
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al iniciar sesión",
        message: error.message,
      },
      { status: 500 },
    );
  }
}
