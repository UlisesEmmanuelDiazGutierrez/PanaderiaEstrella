/**
 * API DE LOGIN - VERSIÓN REAL CON MONGODB
 * Reemplaza tu archivo actual en: app/api/auth/login.js
 */

import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";

// Rate limiting simple (en memoria)
const loginAttempts = new Map();

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validación básica
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email y contraseña son requeridos" },
        { status: 400 },
      );
    }

    // Protección contra ataques de fuerza bruta
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const attempts = loginAttempts.get(ip) || [];
    const recentAttempts = attempts.filter((time) => now - time < 900000); // 15 minutos

    if (recentAttempts.length >= 5) {
      return NextResponse.json(
        { success: false, error: "Demasiados intentos. Intenta en 15 minutos" },
        { status: 429 },
      );
    }

    // Registrar intento
    recentAttempts.push(now);
    loginAttempts.set(ip, recentAttempts);

    // Conectar a MongoDB
    const client = await clientPromise;
    const db = client.db("panaderia_db");

    // Buscar usuario por email
    const user = await db.collection("users").findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Credenciales incorrectas" },
        { status: 401 },
      );
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: "Usuario desactivado. Contacta al administrador",
        },
        { status: 403 },
      );
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: "Credenciales incorrectas" },
        { status: 401 },
      );
    }

    // Limpiar intentos exitosos
    loginAttempts.delete(ip);

    // Si el usuario tiene 2FA habilitado
    if (user.twoFactorEnabled) {
      // Generar código 2FA (6 dígitos)
      const code2FA = Math.floor(100000 + Math.random() * 900000).toString();

      // Guardar código temporal en base de datos (expira en 10 minutos)
      await db.collection("users").updateOne(
        { _id: user._id },
        {
          $set: {
            twoFactorCode: code2FA,
            twoFactorExpires: new Date(Date.now() + 10 * 60 * 1000),
          },
        },
      );

      // TODO: Enviar código por email
      // await sendEmail(user.email, "Código de verificación", code2FA);

      console.log(`Código 2FA para ${user.email}: ${code2FA}`); // Solo para desarrollo

      return NextResponse.json({
        success: true,
        require2FA: true,
        userId: user._id.toString(),
      });
    }

    // Actualizar último login
    await db
      .collection("users")
      .updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } });

    // Retornar usuario sin datos sensibles
    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    return NextResponse.json(
      { success: false, error: "Error del servidor" },
      { status: 500 },
    );
  }
}
