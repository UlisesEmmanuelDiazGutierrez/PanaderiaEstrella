/**
 * app/api/auth/login/route.js
 * Login con bcrypt + 2FA opcional — Supabase/PostgreSQL
 *
 * POST /api/auth/login
 * Body: { email, password }
 *
 * MIGRACIÓN: reemplaza el auth.js viejo que usaba clientPromise de MongoDB.
 * Elimina o renombra app/api/auth/login.js (versión Mongo) y usa solo este archivo.
 */

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

// Rate limiting simple en memoria (se resetea con cada deploy — suficiente para MVP)
const loginAttempts = new Map();

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email y contraseña son requeridos" },
        { status: 400 },
      );
    }

    // ── Rate limiting ──────────────────────────────────────────────────────
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const recentAttempts = (loginAttempts.get(ip) || []).filter(
      (t) => now - t < 900_000, // ventana de 15 min
    );

    if (recentAttempts.length >= 5) {
      return NextResponse.json(
        { success: false, error: "Demasiados intentos. Intenta en 15 minutos" },
        { status: 429 },
      );
    }
    recentAttempts.push(now);
    loginAttempts.set(ip, recentAttempts);

    // ── Buscar usuario en Supabase ─────────────────────────────────────────
    // JOIN: usuarios → usuarios_roles → roles  +  clientes (para clientId)
    const { data: user, error } = await supabase
      .from("usuarios")
      .select(
        `
        id_usuario,
        nombre,
        email,
        password,
        telefono,
        activo,
        metadata,
        usuarios_roles (
          roles ( nombre_rol )
        ),
        clientes ( id_cliente )
      `,
      )
      .eq("email", email.toLowerCase().trim())
      .single();

    // Respuesta genérica para no filtrar si el email existe o no
    if (error || !user) {
      return NextResponse.json(
        { success: false, error: "Credenciales incorrectas" },
        { status: 401 },
      );
    }

    if (!user.activo) {
      return NextResponse.json(
        {
          success: false,
          error: "Usuario desactivado. Contacta al administrador",
        },
        { status: 403 },
      );
    }

    // ── Verificar contraseña ───────────────────────────────────────────────
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Credenciales incorrectas" },
        { status: 401 },
      );
    }

    // Login exitoso → limpiar intentos
    loginAttempts.delete(ip);

    // ── 2FA opcional (guardado en metadata JSONB) ──────────────────────────
    if (user.metadata?.twoFactorEnabled === true) {
      const code2FA = Math.floor(100_000 + Math.random() * 900_000).toString();

      await supabase
        .from("usuarios")
        .update({
          metadata: {
            ...user.metadata,
            twoFactorCode: code2FA,
            twoFactorExpires: new Date(
              Date.now() + 10 * 60 * 1000,
            ).toISOString(),
          },
        })
        .eq("id_usuario", user.id_usuario);

      // TODO: enviar por email (nodemailer / Resend)
      console.log(`[2FA] Código para ${user.email}: ${code2FA}`);

      return NextResponse.json({
        success: true,
        require2FA: true,
        userId: user.id_usuario,
      });
    }

    // ── Respuesta exitosa ──────────────────────────────────────────────────
    const role = user.usuarios_roles?.[0]?.roles?.nombre_rol ?? "customer";

    return NextResponse.json({
      success: true,
      message: "Login exitoso",
      user: {
        id: user.id_usuario,
        name: user.nombre,
        email: user.email,
        role,
        phone: user.telefono ?? null,
        // clientId es útil para filtrar pedidos propios (role = customer)
        clientId: user.clientes?.[0]?.id_cliente ?? null,
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
