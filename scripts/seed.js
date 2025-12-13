/**
 * SCRIPT DE INICIALIZACIÓN DE DATOS (SEED)
 *
 * Este script pobla la base de datos con datos iniciales:
 * - Usuarios de prueba
 * - Productos (cortes de carne)
 *
 * Para ejecutar:
 * node scripts/seed.js
 */
require("dotenv").config({ path: ".env.local" });

const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

// URI de MongoDB desde variables de entorno
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = "estrellabeef";

// Usuarios de prueba
const users = [
  {
    name: "Juan Cliente",
    email: "cliente@test.com",
    password: "123",
    role: "customer",
    phone: "3312345678",
    defaultAddress: "Av. Chapultepec #123, Guadalajara",
    isActive: true,
  },
  {
    name: "Carlos Repartidor",
    email: "repartidor@test.com",
    password: "123",
    role: "delivery",
    phone: "3398765432",
    defaultAddress: "",
    isActive: true,
  },
  {
    name: "Paquetería Express",
    email: "paqueteria@test.com",
    password: "123",
    role: "shipping",
    phone: "3387654321",
    defaultAddress: "",
    isActive: true,
  },
  {
    name: "Admin",
    email: "admin@test.com",
    password: "123",
    role: "admin",
    phone: "3376543210",
    defaultAddress: "",
    isActive: true,
  },
];

// Productos (cortes de carne)
const products = [
  {
    name: "Arrachera Premium",
    price: 320,
    weight: 1,
    image: "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400",
    category: "Res",
    stock: 50,
    promo: true,
    description: "Arrachera de res premium, perfecta para parrilla",
    isActive: true,
  },
  {
    name: "T-Bone Angus",
    price: 380,
    weight: 1,
    image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400",
    category: "Res",
    stock: 30,
    promo: false,
    description: "T-Bone de res Angus, jugoso y tierno",
    isActive: true,
  },
  {
    name: "Rib Eye",
    price: 450,
    weight: 1,
    image: "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=400",
    category: "Cortes",
    stock: 25,
    promo: true,
    description: "Rib Eye premium con marmoleado excepcional",
    isActive: true,
  },
  {
    name: "Bistec de Res",
    price: 180,
    weight: 1,
    image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400",
    category: "Res",
    stock: 100,
    promo: false,
    description: "Bistec de res para el día a día",
    isActive: true,
  },
  {
    name: "Costillas BBQ",
    price: 220,
    weight: 1,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400",
    category: "Cerdo",
    stock: 40,
    promo: true,
    description: "Costillas de cerdo ideales para BBQ",
    isActive: true,
  },
  {
    name: "Chorizo Artesanal",
    price: 95,
    weight: 0.5,
    image: "https://images.unsplash.com/photo-1612892483236-52d32a0e0ac1?w=400",
    category: "Cerdo",
    stock: 60,
    promo: false,
    description: "Chorizo artesanal con especias selectas",
    isActive: true,
  },
  {
    name: "Chuleta de Cerdo",
    price: 160,
    weight: 1,
    image: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400",
    category: "Cerdo",
    stock: 45,
    promo: false,
    description: "Chuleta de cerdo fresca y jugosa",
    isActive: true,
  },
  {
    name: "New York Strip",
    price: 420,
    weight: 1,
    image: "https://images.unsplash.com/photo-1558030006-450675393462?w=400",
    category: "Cortes",
    stock: 20,
    promo: false,
    description: "New York Strip de primera calidad",
    isActive: true,
  },
];

/**
 * Función principal de seed
 */
async function seed() {
  let client;

  try {
    console.log("🔄 Conectando a MongoDB...");

    // Conectar a MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(DB_NAME);

    console.log("✅ Conectado a MongoDB");
    console.log("");

    // ====================================
    // LIMPIAR COLECCIONES EXISTENTES
    // ====================================
    console.log("🗑️  Limpiando colecciones existentes...");

    await db.collection("users").deleteMany({});
    await db.collection("products").deleteMany({});
    await db.collection("orders").deleteMany({});

    console.log("✅ Colecciones limpiadas");
    console.log("");

    // ====================================
    // INSERTAR USUARIOS
    // ====================================
    console.log("👥 Insertando usuarios de prueba...");

    // Encriptar contraseñas
    const usersWithHashedPasswords = await Promise.all(
      users.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);

        return {
          ...user,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      })
    );

    const usersResult = await db
      .collection("users")
      .insertMany(usersWithHashedPasswords);

    console.log(`✅ ${usersResult.insertedCount} usuarios insertados`);
    users.forEach((u) =>
      console.log(`   - ${u.name} (${u.email}) - Rol: ${u.role}`)
    );
    console.log("");

    // ====================================
    // INSERTAR PRODUCTOS
    // ====================================
    console.log("🥩 Insertando productos...");

    const productsWithTimestamps = products.map((product) => ({
      ...product,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const productsResult = await db
      .collection("products")
      .insertMany(productsWithTimestamps);

    console.log(`✅ ${productsResult.insertedCount} productos insertados`);
    products.forEach((p) =>
      console.log(`   - ${p.name} ($${p.price}/kg) - Stock: ${p.stock}kg`)
    );
    console.log("");

    // ====================================
    // CREAR ÍNDICES
    // ====================================
    console.log("📊 Creando índices...");

    // Índice único para email de usuarios
    await db.collection("users").createIndex({ email: 1 }, { unique: true });

    // Índices para productos
    await db.collection("products").createIndex({ category: 1, isActive: 1 });
    await db
      .collection("products")
      .createIndex({ name: "text", description: "text" });

    // Índices para pedidos
    await db.collection("orders").createIndex({ userId: 1, createdAt: -1 });
    await db.collection("orders").createIndex({ status: 1, method: 1 });

    console.log("✅ Índices creados");
    console.log("");

    // ====================================
    // RESUMEN
    // ====================================
    console.log("🎉 ¡Seed completado exitosamente!");
    console.log("");
    console.log("📝 Resumen:");
    console.log(`   - Usuarios: ${usersResult.insertedCount}`);
    console.log(`   - Productos: ${productsResult.insertedCount}`);
    console.log("");
    console.log("🔐 Credenciales de prueba (contraseña: 123):");
    console.log("   - cliente@test.com");
    console.log("   - repartidor@test.com");
    console.log("   - paqueteria@test.com");
    console.log("   - admin@test.com");
    console.log("");
  } catch (error) {
    console.error("❌ Error en seed:", error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log("🔌 Conexión cerrada");
    }
  }
}

// Ejecutar seed
seed();
