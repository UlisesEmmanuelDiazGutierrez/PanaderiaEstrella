/**
 * app/api/auth/register/route.js
 * Registro de usuarios — migrado de MongoDB a Supabase/PostgreSQL
 *
 * POST /api/auth/register
 * Body: { name, email, password, role?, phone?, defaultAddress? }
 */

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

const EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
const VALID_ROLES = ["customer", "delivery", "shipping", "admin"];

export async function POST(request) {
  try {
    const body = await request.json();

    // ── Validaciones ───────────────────────────────────────────────────────
    for (const field of ["name", "email", "password"]) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `El campo '${field}' es obligatorio` },
          { status: 400 },
        );
      }
    }

    if (!EMAIL_REGEX.test(body.email)) {
      return NextResponse.json(
        { success: false, error: "Email inválido" },
        { status: 400 },
      );
    }

    if (body.password.length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: "La contraseña debe tener al menos 3 caracteres",
        },
        { status: 400 },
      );
    }

    const role = body.role || "customer";
    if (!VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { success: false, error: "Rol inválido" },
        { status: 400 },
      );
    }

    // ── Verificar email duplicado ──────────────────────────────────────────
    const { data: existing } = await supabase
      .from("usuarios")
      .select("id_usuario")
      .eq("email", body.email.toLowerCase().trim())
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Este email ya está registrado" },
        { status: 409 },
      );
    }

    // ── Hashear contraseña ─────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // ── Insertar usuario ───────────────────────────────────────────────────
    const { data: newUser, error: userError } = await supabase
      .from("usuarios")
      .insert({
        nombre: body.name.trim(),
        email: body.email.toLowerCase().trim(),
        password: hashedPassword,
        telefono: body.phone || null,
        activo: true,
        metadata: {},
      })
      .select("id_usuario, nombre, email, telefono")
      .single();

    if (userError) throw userError;

    // ── Obtener id del rol ─────────────────────────────────────────────────
    const { data: rolData, error: rolError } = await supabase
      .from("roles")
      .select("id_rol")
      .eq("nombre_rol", role)
      .single();

    if (rolError || !rolData)
      throw new Error(`Rol '${role}' no encontrado en la BD`);

    // ── Asignar rol ────────────────────────────────────────────────────────
    await supabase.from("usuarios_roles").insert({
      id_usuario: newUser.id_usuario,
      id_rol: rolData.id_rol,
    });

    // ── Crear registro específico según rol ────────────────────────────────
    if (role === "customer") {
      await supabase.from("clientes").insert({
        id_usuario: newUser.id_usuario,
        direccion: body.defaultAddress || null,
      });
    } else if (role === "delivery") {
      await supabase.from("repartidores").insert({
        id_usuario: newUser.id_usuario,
        disponible: true,
      });
    } else if (role === "admin") {
      await supabase.from("administradores").insert({
        id_usuario: newUser.id_usuario,
        nivel_acceso: "FULL",
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Usuario registrado exitosamente",
        user: {
          id: newUser.id_usuario,
          name: newUser.nombre,
          email: newUser.email,
          role,
          phone: newUser.telefono,
        },
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
