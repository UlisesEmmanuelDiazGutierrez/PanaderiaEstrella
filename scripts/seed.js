/**
 * SCRIPT DE INICIALIZACIÓN DE DATOS (SEED) - PANADERÍA
 *
 * Este script pobla la base de datos con datos iniciales:
 * - Usuarios de prueba
 * - Productos de panadería
 *
 * Para ejecutar:
 * node scripts/seed.js
 * o
 * node seed.js
 */
require("dotenv").config({ path: ".env.local" });

const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

// URI de MongoDB desde variables de entorno
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = "panaderia_db"; //

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

// Productos de panadería
const products = [
  // PAN DULCE
  {
    name: "Concha de Chocolate",
    price: 12,
    weight: 80,
    image: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=400",
    category: "Pan Dulce",
    stock: 50,
    promo: false,
    description: "Pan dulce tradicional mexicano con cubierta de chocolate",
    isActive: true,
  },
  {
    name: "Concha de Vainilla",
    price: 12,
    weight: 80,
    image: "https://images.unsplash.com/photo-1586985289906-406988974504?w=400",
    category: "Pan Dulce",
    stock: 50,
    promo: true,
    description: "Pan dulce tradicional mexicano con cubierta de vainilla",
    isActive: true,
  },
  {
    name: "Ojo de Buey",
    price: 15,
    weight: 90,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400",
    category: "Pan Dulce",
    stock: 30,
    promo: false,
    description: "Pan dulce relleno de jalea de frutas",
    isActive: true,
  },
  {
    name: "Cuernito",
    price: 13,
    weight: 70,
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400",
    category: "Pan Dulce",
    stock: 40,
    promo: false,
    description: "Pan dulce en forma de cuerno espolvoreado con azúcar",
    isActive: true,
  },
  {
    name: "Polvorones",
    price: 10,
    weight: 60,
    image: "https://images.unsplash.com/photo-1558030006-450675393462?w=400",
    category: "Pan Dulce",
    stock: 60,
    promo: true,
    description: "Galletas suaves cubiertas de azúcar glass",
    isActive: true,
  },
  {
    name: "Oreja",
    price: 14,
    weight: 75,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400",
    category: "Pan Dulce",
    stock: 45,
    promo: false,
    description: "Hojaldre en forma de oreja con azúcar caramelizada",
    isActive: true,
  },

  // PAN SALADO
  {
    name: "Bolillo",
    price: 5,
    weight: 60,
    image: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400",
    category: "Pan Salado",
    stock: 100,
    promo: false,
    description: "Pan blanco tradicional mexicano, perfecto para tortas",
    isActive: true,
  },
  {
    name: "Telera",
    price: 6,
    weight: 80,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400",
    category: "Pan Salado",
    stock: 80,
    promo: false,
    description: "Pan ovalado ideal para tortas y molletes",
    isActive: true,
  },
  {
    name: "Pan de Ajo",
    price: 18,
    weight: 100,
    image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400",
    category: "Pan Salado",
    stock: 25,
    promo: true,
    description: "Pan artesanal con mantequilla y ajo fresco",
    isActive: true,
  },
  {
    name: "Baguette",
    price: 20,
    weight: 250,
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400",
    category: "Pan Salado",
    stock: 35,
    promo: false,
    description: "Baguette francesa crujiente por fuera, suave por dentro",
    isActive: true,
  },
  {
    name: "Pan Integral",
    price: 25,
    weight: 500,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400",
    category: "Pan Salado",
    stock: 20,
    promo: false,
    description: "Pan de caja integral con semillas",
    isActive: true,
  },

  // BOLLERÍA
  {
    name: "Croissant Mantequilla",
    price: 25,
    weight: 70,
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400",
    category: "Bollería",
    stock: 30,
    promo: false,
    description: "Croissant francés hojaldrado con mantequilla",
    isActive: true,
  },
  {
    name: "Croissant Chocolate",
    price: 30,
    weight: 80,
    image: "https://images.unsplash.com/photo-1623334044303-241021148842?w=400",
    category: "Bollería",
    stock: 25,
    promo: true,
    description: "Croissant relleno de chocolate belga",
    isActive: true,
  },
  {
    name: "Dona Glaseada",
    price: 20,
    weight: 65,
    image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400",
    category: "Bollería",
    stock: 40,
    promo: false,
    description: "Dona esponjosa con glaseado de azúcar",
    isActive: true,
  },
  {
    name: "Churros",
    price: 15,
    weight: 100,
    image: "https://images.unsplash.com/photo-1541599468348-e96984315921?w=400",
    category: "Bollería",
    stock: 50,
    promo: true,
    description: "Churros tradicionales con azúcar y canela",
    isActive: true,
  },
  {
    name: "Rol de Canela",
    price: 28,
    weight: 90,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400",
    category: "Bollería",
    stock: 30,
    promo: false,
    description: "Rollo de canela con glaseado de queso crema",
    isActive: true,
  },

  // PASTELES
  {
    name: "Pastel de Tres Leches",
    price: 450,
    weight: 1500,
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
    category: "Pasteles",
    stock: 5,
    promo: false,
    description: "Pastel empapado en tres leches (8 porciones)",
    isActive: true,
  },
  {
    name: "Pastel de Chocolate",
    price: 500,
    weight: 1800,
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
    category: "Pasteles",
    stock: 3,
    promo: true,
    description: "Pastel de chocolate con ganache (10 porciones)",
    isActive: true,
  },
  {
    name: "Gelatina Mosaico",
    price: 180,
    weight: 800,
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400",
    category: "Pasteles",
    stock: 8,
    promo: false,
    description: "Gelatina mosaico con crema (6 porciones)",
    isActive: true,
  },
  {
    name: "Pay de Queso",
    price: 350,
    weight: 1200,
    image: "https://images.unsplash.com/photo-1533910534207-90f31029a78e?w=400",
    category: "Pasteles",
    stock: 6,
    promo: true,
    description: "Pay de queso estilo Nueva York (8 porciones)",
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
      }),
    );

    const usersResult = await db
      .collection("users")
      .insertMany(usersWithHashedPasswords);

    console.log(`✅ ${usersResult.insertedCount} usuarios insertados`);
    users.forEach((u) =>
      console.log(`   - ${u.name} (${u.email}) - Rol: ${u.role}`),
    );
    console.log("");

    // ====================================
    // INSERTAR PRODUCTOS
    // ====================================
    console.log("🥖 Insertando productos de panadería...");

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
      console.log(`   - ${p.name} ($${p.price}) - Stock: ${p.stock} piezas`),
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
    console.log(`   - Base de datos: ${DB_NAME}`);
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
