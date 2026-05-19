/**
 * SEED para Supabase/PostgreSQL — Panadería Estrella
 * Ejecutar: node scripts/seed-supabase.js
 */

require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@supabase/supabase-js");
const bcrypt = require("bcryptjs");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// ── DATOS ──────────────────────────────────────────────────────────────────

const usuarios = [
  {
    nombre: "Juan Cliente",
    email: "cliente@test.com",
    password: "123",
    telefono: "3312345678",
    rol: "customer",
    direccion: "Av. Chapultepec #123, Guadalajara",
  },
  {
    nombre: "Carlos Repartidor",
    email: "repartidor@test.com",
    password: "123",
    telefono: "3398765432",
    rol: "delivery",
  },
  {
    nombre: "Paquetería Express",
    email: "paqueteria@test.com",
    password: "123",
    telefono: "3387654321",
    rol: "shipping",
  },
  {
    nombre: "Admin",
    email: "admin@test.com",
    password: "123",
    telefono: "3376543210",
    rol: "admin",
  },
];

const productos = [
  {
    nombre: "Concha de Chocolate",
    precio: 12,
    peso_g: 80,
    categoria: "Pan Dulce",
    stock: 50,
    promo: false,
    descripcion: "Pan dulce tradicional mexicano con cubierta de chocolate",
    imagen:
      "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=400",
  },
  {
    nombre: "Concha de Vainilla",
    precio: 12,
    peso_g: 80,
    categoria: "Pan Dulce",
    stock: 50,
    promo: true,
    descripcion: "Pan dulce tradicional mexicano con cubierta de vainilla",
    imagen:
      "https://images.unsplash.com/photo-1586985289906-406988974504?w=400",
  },
  {
    nombre: "Ojo de Buey",
    precio: 15,
    peso_g: 90,
    categoria: "Pan Dulce",
    stock: 30,
    promo: false,
    descripcion: "Pan dulce relleno de jalea de frutas",
    imagen:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400",
  },
  {
    nombre: "Cuernito",
    precio: 13,
    peso_g: 70,
    categoria: "Pan Dulce",
    stock: 40,
    promo: false,
    descripcion: "Pan dulce en forma de cuerno espolvoreado con azúcar",
    imagen: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400",
  },
  {
    nombre: "Polvorones",
    precio: 10,
    peso_g: 60,
    categoria: "Pan Dulce",
    stock: 60,
    promo: true,
    descripcion: "Galletas suaves cubiertas de azúcar glass",
    imagen: "https://images.unsplash.com/photo-1558030006-450675393462?w=400",
  },
  {
    nombre: "Oreja",
    precio: 14,
    peso_g: 75,
    categoria: "Pan Dulce",
    stock: 45,
    promo: false,
    descripcion: "Hojaldre en forma de oreja con azúcar caramelizada",
    imagen:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400",
  },
  {
    nombre: "Bolillo",
    precio: 5,
    peso_g: 60,
    categoria: "Pan Salado",
    stock: 100,
    promo: false,
    descripcion: "Pan blanco tradicional mexicano, perfecto para tortas",
    imagen:
      "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400",
  },
  {
    nombre: "Telera",
    precio: 6,
    peso_g: 80,
    categoria: "Pan Salado",
    stock: 80,
    promo: false,
    descripcion: "Pan ovalado ideal para tortas y molletes",
    imagen:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400",
  },
  {
    nombre: "Pan de Ajo",
    precio: 18,
    peso_g: 100,
    categoria: "Pan Salado",
    stock: 25,
    promo: true,
    descripcion: "Pan artesanal con mantequilla y ajo fresco",
    imagen: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400",
  },
  {
    nombre: "Baguette",
    precio: 20,
    peso_g: 250,
    categoria: "Pan Salado",
    stock: 35,
    promo: false,
    descripcion: "Baguette francesa crujiente por fuera, suave por dentro",
    imagen: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400",
  },
  {
    nombre: "Pan Integral",
    precio: 25,
    peso_g: 500,
    categoria: "Pan Salado",
    stock: 20,
    promo: false,
    descripcion: "Pan de caja integral con semillas",
    imagen:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400",
  },
  {
    nombre: "Croissant Mantequilla",
    precio: 25,
    peso_g: 70,
    categoria: "Bollería",
    stock: 30,
    promo: false,
    descripcion: "Croissant francés hojaldrado con mantequilla",
    imagen: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400",
  },
  {
    nombre: "Croissant Chocolate",
    precio: 30,
    peso_g: 80,
    categoria: "Bollería",
    stock: 25,
    promo: true,
    descripcion: "Croissant relleno de chocolate belga",
    imagen:
      "https://images.unsplash.com/photo-1623334044303-241021148842?w=400",
  },
  {
    nombre: "Dona Glaseada",
    precio: 20,
    peso_g: 65,
    categoria: "Bollería",
    stock: 40,
    promo: false,
    descripcion: "Dona esponjosa con glaseado de azúcar",
    imagen: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400",
  },
  {
    nombre: "Churros",
    precio: 15,
    peso_g: 100,
    categoria: "Bollería",
    stock: 50,
    promo: true,
    descripcion: "Churros tradicionales con azúcar y canela",
    imagen:
      "https://images.unsplash.com/photo-1541599468348-e96984315921?w=400",
  },
  {
    nombre: "Rol de Canela",
    precio: 28,
    peso_g: 90,
    categoria: "Bollería",
    stock: 30,
    promo: false,
    descripcion: "Rollo de canela con glaseado de queso crema",
    imagen:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400",
  },
  {
    nombre: "Pastel de Tres Leches",
    precio: 450,
    peso_g: 1500,
    categoria: "Pasteles",
    stock: 5,
    promo: false,
    descripcion: "Pastel empapado en tres leches (8 porciones)",
    imagen:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
  },
  {
    nombre: "Pastel de Chocolate",
    precio: 500,
    peso_g: 1800,
    categoria: "Pasteles",
    stock: 3,
    promo: true,
    descripcion: "Pastel de chocolate con ganache (10 porciones)",
    imagen:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
  },
  {
    nombre: "Gelatina Mosaico",
    precio: 180,
    peso_g: 800,
    categoria: "Pasteles",
    stock: 8,
    promo: false,
    descripcion: "Gelatina mosaico con crema (6 porciones)",
    imagen:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400",
  },
  {
    nombre: "Pay de Queso",
    precio: 350,
    peso_g: 1200,
    categoria: "Pasteles",
    stock: 6,
    promo: true,
    descripcion: "Pay de queso estilo Nueva York (8 porciones)",
    imagen:
      "https://images.unsplash.com/photo-1533910534207-90f31029a78e?w=400",
  },
];

// ── SEED ───────────────────────────────────────────────────────────────────

async function seed() {
  console.log("\n🔄 Iniciando seed en Supabase...\n");

  // 1. Limpiar en orden inverso a las FK
  console.log("🗑️  Limpiando datos existentes...");

  const tablas = [
    ["detalle_envio", "id_detalle_envio"],
    ["envios", "id_envio"],
    ["pagos", "id_pago"],
    ["detalle_pedidos", "id_detalle"],
    ["pedidos", "id_pedido"],
    ["resenas", "id_resena"],
    ["pedidos_promociones", "id"],
    ["direcciones", "id_direccion"],
    ["repartidor_disponibilidad", "id"],
    ["inventario", "id_inventario"],
    ["productos_ingredientes", "id"],
    ["productos", "id_producto"],
    ["clientes", "id_cliente"],
    ["repartidores", "id_repartidor"],
    ["administradores", "id_admin"],
    ["usuarios_roles", "id"],
    ["usuarios", "id_usuario"],
  ];

  for (const [tabla, pk] of tablas) {
    const { error } = await supabase.from(tabla).delete().gte(pk, 0);
    if (error) console.warn(`   ⚠️  ${tabla}: ${error.message}`);
  }
  console.log("✅ Limpieza completa\n");

  // 2. Asegurar roles
  const rolesNecesarios = ["admin", "customer", "delivery", "shipping"];
  for (const nombre_rol of rolesNecesarios) {
    await supabase
      .from("roles")
      .upsert({ nombre_rol }, { onConflict: "nombre_rol" });
  }
  const { data: roles } = await supabase
    .from("roles")
    .select("id_rol, nombre_rol");
  const rolMap = Object.fromEntries(roles.map((r) => [r.nombre_rol, r.id_rol]));
  console.log(`✅ Roles: ${Object.keys(rolMap).join(", ")}`);

  // 3. Asegurar categorías
  for (const nombre of ["Pan Dulce", "Pan Salado", "Bollería", "Pasteles"]) {
    await supabase
      .from("categorias_productos")
      .upsert({ nombre }, { onConflict: "nombre" });
  }
  const { data: cats } = await supabase
    .from("categorias_productos")
    .select("id_categoria, nombre");
  const catMap = Object.fromEntries(
    cats.map((c) => [c.nombre, c.id_categoria]),
  );
  console.log(`✅ Categorías: ${Object.keys(catMap).join(", ")}\n`);

  // 4. Usuarios
  console.log("👥 Insertando usuarios...");
  for (const u of usuarios) {
    const hashed = await bcrypt.hash(u.password, 10);

    const { data: nuevo, error } = await supabase
      .from("usuarios")
      .insert({
        nombre: u.nombre,
        email: u.email,
        password: hashed,
        telefono: u.telefono,
        activo: true,
        metadata: {},
      })
      .select("id_usuario")
      .single();

    if (error) {
      console.warn(`   ⚠️  ${u.email}: ${error.message}`);
      continue;
    }

    const id = nuevo.id_usuario;
    await supabase
      .from("usuarios_roles")
      .insert({ id_usuario: id, id_rol: rolMap[u.rol] });

    if (u.rol === "customer")
      await supabase
        .from("clientes")
        .insert({ id_usuario: id, direccion: u.direccion || null });
    if (u.rol === "delivery")
      await supabase
        .from("repartidores")
        .insert({ id_usuario: id, disponible: true });
    if (u.rol === "admin")
      await supabase
        .from("administradores")
        .insert({ id_usuario: id, nivel_acceso: "FULL" });

    console.log(`   ✅ ${u.nombre} (${u.email}) — ${u.rol}`);
  }

  // 5. Productos
  console.log("\n🥖 Insertando productos...");
  const { data: creados, error: pErr } = await supabase
    .from("productos")
    .insert(
      productos.map((p) => ({
        nombre: p.nombre,
        descripcion: p.descripcion,
        precio: p.precio,
        stock: p.stock,
        id_categoria: catMap[p.categoria],
        imagen: p.imagen,
        activo: true,
        atributos: { peso_g: p.peso_g, promo: p.promo, alergenos: ["gluten"] },
      })),
    )
    .select("nombre");

  if (pErr) {
    console.error("❌ Productos:", pErr.message);
    process.exit(1);
  }
  creados.forEach((p) => console.log(`   ✅ ${p.nombre}`));

  // 6. Resumen
  console.log("\n🎉 ¡Seed completado!\n");
  console.log(
    `   Usuarios:  ${usuarios.length} | Productos: ${creados.length}`,
  );
  console.log("\n🔐 Credenciales (contraseña: 123):");
  usuarios.forEach((u) => console.log(`   ${u.email}  [${u.rol}]`));
  console.log("");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
