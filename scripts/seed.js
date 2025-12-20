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
  // 🔥 CORTES PREMIUM (STEAKS CLÁSICOS)
  {
    name: "Ribeye",
    price: 450,
    weight: 1,
    image: "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=400",
    category: "Premium",
    stock: 35,
    promo: true,
    description: "Ribeye con marmoleado excepcional, jugoso y lleno de sabor",
    isActive: true,
  },
  {
    name: "Ribeye Cap (Spinalis)",
    price: 580,
    weight: 1,
    image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400",
    category: "Premium",
    stock: 15,
    promo: true,
    description: "El corte más codiciado del ribeye, extremadamente tierno",
    isActive: true,
  },
  {
    name: "Cowboy Steak",
    price: 520,
    weight: 1.2,
    image: "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400",
    category: "Premium",
    stock: 20,
    promo: false,
    description: "Ribeye con hueso francés, presentación espectacular",
    isActive: true,
  },
  {
    name: "Tomahawk",
    price: 850,
    weight: 1.5,
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400",
    category: "Premium",
    stock: 12,
    promo: true,
    description:
      "Espectacular ribeye con hueso largo tipo hacha, perfecto para compartir",
    isActive: true,
  },
  {
    name: "New York Strip",
    price: 420,
    weight: 1,
    image: "https://images.unsplash.com/photo-1558030006-450675393462?w=400",
    category: "Premium",
    stock: 40,
    promo: false,
    description: "Kansas City steak, equilibrio perfecto entre sabor y terneza",
    isActive: true,
  },
  {
    name: "T-Bone",
    price: 380,
    weight: 1,
    image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400",
    category: "Premium",
    stock: 30,
    promo: false,
    description: "Clásico T-Bone con strip y filet en un solo corte",
    isActive: true,
  },
  {
    name: "Porterhouse",
    price: 480,
    weight: 1.2,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400",
    category: "Premium",
    stock: 25,
    promo: true,
    description: "T-Bone gigante con porción extra de filet mignon",
    isActive: true,
  },
  {
    name: "Filet Mignon",
    price: 550,
    weight: 0.8,
    image: "https://images.unsplash.com/photo-1603039891519-89f49e993c6b?w=400",
    category: "Premium",
    stock: 30,
    promo: false,
    description: "El corte más tierno de la res, textura de mantequilla",
    isActive: true,
  },
  {
    name: "Chateaubriand",
    price: 680,
    weight: 1,
    image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400",
    category: "Premium",
    stock: 18,
    promo: true,
    description: "Centro del tenderloin, perfecto para ocasiones especiales",
    isActive: true,
  },
  {
    name: "Flat Iron Steak",
    price: 290,
    weight: 0.8,
    image: "https://images.unsplash.com/photo-1606851080344-d4c6bc2ed7b9?w=400",
    category: "Premium",
    stock: 45,
    promo: false,
    description: "Segundo corte más tierno, excelente relación calidad-precio",
    isActive: true,
  },
  {
    name: "Denver Steak",
    price: 310,
    weight: 0.8,
    image: "https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?w=400",
    category: "Premium",
    stock: 35,
    promo: false,
    description: "Corte del chuck, tierno y bien marmoleado",
    isActive: true,
  },

  // 🥩 CORTES DEL CHUCK (HOMBRO)
  {
    name: "Chuck Steak",
    price: 180,
    weight: 1,
    image: "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400",
    category: "Res",
    stock: 60,
    promo: false,
    description: "Corte económico ideal para guisar o asar lento",
    isActive: true,
  },
  {
    name: "Chuck Roast",
    price: 160,
    weight: 1.5,
    image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400",
    category: "Res",
    stock: 50,
    promo: true,
    description: "Perfecto para pot roast o barbacoa",
    isActive: true,
  },
  {
    name: "Chuck Eye Steak",
    price: 240,
    weight: 0.9,
    image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400",
    category: "Res",
    stock: 40,
    promo: false,
    description: "Primo del ribeye, muy sabroso y más económico",
    isActive: true,
  },
  {
    name: "Ranch Steak",
    price: 200,
    weight: 0.8,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400",
    category: "Res",
    stock: 45,
    promo: false,
    description: "Tierno y versátil del área del hombro",
    isActive: true,
  },

  // 🥩 CORTES DEL RIB (COSTILLAR)
  {
    name: "Prime Rib",
    price: 480,
    weight: 1.5,
    image: "https://images.unsplash.com/photo-1558030006-450675393462?w=400",
    category: "Res",
    stock: 25,
    promo: true,
    description: "Standing rib roast, el rey de los asados",
    isActive: true,
  },
  {
    name: "Short Ribs",
    price: 280,
    weight: 1,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400",
    category: "Res",
    stock: 55,
    promo: false,
    description: "Costillas cortas estilo americano, ideales para BBQ",
    isActive: true,
  },
  {
    name: "Beef Back Ribs",
    price: 220,
    weight: 1.2,
    image: "https://images.unsplash.com/photo-1606851080344-d4c6bc2ed7b9?w=400",
    category: "BBQ",
    stock: 40,
    promo: true,
    description: "Costillitas de res para ahumar",
    isActive: true,
  },
  {
    name: "Dino Ribs",
    price: 350,
    weight: 1.5,
    image: "https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?w=400",
    category: "BBQ",
    stock: 20,
    promo: true,
    description: "Costillas gigantes tipo Fred Flintstone",
    isActive: true,
  },

  // 🥩 CORTES DEL SIRLOIN (CADERA)
  {
    name: "Top Sirloin Steak",
    price: 260,
    weight: 1,
    image: "https://images.unsplash.com/photo-1603039891519-89f49e993c6b?w=400",
    category: "Res",
    stock: 50,
    promo: false,
    description: "Magro y sabroso, excelente para parrilla",
    isActive: true,
  },
  {
    name: "Tri-Tip",
    price: 240,
    weight: 1,
    image: "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400",
    category: "Res",
    stock: 45,
    promo: true,
    description: "Favorito de California, perfecto para Santa Maria BBQ",
    isActive: true,
  },
  {
    name: "Picanha",
    price: 320,
    weight: 1,
    image: "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=400",
    category: "Res",
    stock: 35,
    promo: false,
    description: "Top sirloin cap, favorito brasileño con capa de grasa",
    isActive: true,
  },

  // 🥩 CORTES DEL FLANK & PLATE
  {
    name: "Skirt Steak (Outside)",
    price: 280,
    weight: 0.8,
    image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400",
    category: "Res",
    stock: 50,
    promo: false,
    description: "Arrachera externa, perfecta para fajitas",
    isActive: true,
  },
  {
    name: "Skirt Steak (Inside)",
    price: 260,
    weight: 0.8,
    image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400",
    category: "Res",
    stock: 55,
    promo: true,
    description: "Arrachera interna, muy sabrosa",
    isActive: true,
  },
  {
    name: "Flank Steak",
    price: 270,
    weight: 1,
    image: "https://images.unsplash.com/photo-1558030006-450675393462?w=400",
    category: "Res",
    stock: 48,
    promo: false,
    description: "Corte magro ideal para marinar",
    isActive: true,
  },
  {
    name: "Hanger Steak",
    price: 290,
    weight: 0.7,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400",
    category: "Res",
    stock: 30,
    promo: false,
    description: "Bistec del carnicero, intenso sabor",
    isActive: true,
  },

  // 🥩 CORTES DEL BRISKET
  {
    name: "Whole Brisket (Packer)",
    price: 280,
    weight: 5,
    image: "https://images.unsplash.com/photo-1606851080344-d4c6bc2ed7b9?w=400",
    category: "BBQ",
    stock: 15,
    promo: true,
    description: "Pecho completo para BBQ Texas style",
    isActive: true,
  },
  {
    name: "Brisket Flat Cut",
    price: 250,
    weight: 2.5,
    image: "https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?w=400",
    category: "BBQ",
    stock: 25,
    promo: false,
    description: "Parte magra del brisket",
    isActive: true,
  },
  {
    name: "Brisket Point Cut",
    price: 270,
    weight: 2,
    image: "https://images.unsplash.com/photo-1603039891519-89f49e993c6b?w=400",
    category: "BBQ",
    stock: 25,
    promo: true,
    description: "Parte grasosa del brisket, ideal para burnt ends",
    isActive: true,
  },
  {
    name: "Burnt Ends",
    price: 320,
    weight: 0.5,
    image: "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400",
    category: "BBQ",
    stock: 20,
    promo: true,
    description: "Cubitos caramelizados del point, oro del BBQ",
    isActive: true,
  },

  // 🥩 CORTES ESPECIALES
  {
    name: "Pastrami Cut",
    price: 240,
    weight: 1,
    image: "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=400",
    category: "Res",
    stock: 30,
    promo: false,
    description: "Corte preparado para hacer pastrami casero",
    isActive: true,
  },
  {
    name: "Corned Beef",
    price: 230,
    weight: 1.5,
    image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400",
    category: "Res",
    stock: 35,
    promo: false,
    description: "Brisket curado para corned beef",
    isActive: true,
  },

  // 🐷 CORTES DE CERDO
  {
    name: "Pork Belly",
    price: 180,
    weight: 1,
    image: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400",
    category: "Cerdo",
    stock: 40,
    promo: true,
    description: "Panceta de cerdo sin curar, perfecta para tocino casero",
    isActive: true,
  },
  {
    name: "Baby Back Ribs",
    price: 220,
    weight: 1.2,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400",
    category: "Cerdo",
    stock: 45,
    promo: true,
    description: "Costillitas baby back, tiernas y jugosas",
    isActive: true,
  },
  {
    name: "St. Louis Ribs",
    price: 200,
    weight: 1.5,
    image: "https://images.unsplash.com/photo-1606851080344-d4c6bc2ed7b9?w=400",
    category: "Cerdo",
    stock: 50,
    promo: false,
    description: "Spare ribs estilo St. Louis, ideales para BBQ",
    isActive: true,
  },
  {
    name: "Pork Shoulder",
    price: 140,
    weight: 2,
    image: "https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?w=400",
    category: "Cerdo",
    stock: 35,
    promo: true,
    description: "Paleta de cerdo para pulled pork",
    isActive: true,
  },
  {
    name: "Pork Chop (Bone-in)",
    price: 160,
    weight: 0.8,
    image: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400",
    category: "Cerdo",
    stock: 55,
    promo: false,
    description: "Chuleta con hueso, jugosa y sabrosa",
    isActive: true,
  },
  {
    name: "Pork Tenderloin",
    price: 190,
    weight: 0.8,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400",
    category: "Cerdo",
    stock: 40,
    promo: false,
    description: "Solomillo de cerdo, corte magro y tierno",
    isActive: true,
  },
  {
    name: "Chorizo Artesanal",
    price: 95,
    weight: 0.5,
    image: "https://images.unsplash.com/photo-1612892483236-52d32a0e0ac1?w=400",
    category: "Cerdo",
    stock: 70,
    promo: false,
    description: "Chorizo artesanal con especias selectas",
    isActive: true,
  },
  {
    name: "Pork Sausage Links",
    price: 110,
    weight: 0.6,
    image: "https://images.unsplash.com/photo-1606851080344-d4c6bc2ed7b9?w=400",
    category: "Cerdo",
    stock: 60,
    promo: true,
    description: "Salchichas de cerdo estilo americano",
    isActive: true,
  },
  {
    name: "Bratwurst",
    price: 130,
    weight: 0.5,
    image: "https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?w=400",
    category: "Cerdo",
    stock: 50,
    promo: false,
    description: "Salchicha alemana de cerdo premium",
    isActive: true,
  },
  {
    name: "Pork Loin Roast",
    price: 170,
    weight: 1.5,
    image: "https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=400",
    category: "Cerdo",
    stock: 30,
    promo: false,
    description: "Lomo de cerdo entero para asar",
    isActive: true,
  },
  {
    name: "Ham Steak",
    price: 150,
    weight: 0.8,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400",
    category: "Cerdo",
    stock: 45,
    promo: true,
    description: "Bistec de jamón, rápido de cocinar",
    isActive: true,
  },
  {
    name: "Pork Jowl",
    price: 120,
    weight: 1,
    image: "https://images.unsplash.com/photo-1606851080344-d4c6bc2ed7b9?w=400",
    category: "Cerdo",
    stock: 25,
    promo: false,
    description: "Cachete de cerdo, ideal para guanciale",
    isActive: true,
  },

  // 🔥 PAQUETES PROMOCIONALES
  {
    name: "Pack Parrillero Deluxe",
    price: 1200,
    weight: 3,
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400",
    category: "Promociones",
    stock: 15,
    promo: true,
    description:
      "Ribeye, NY Strip, costillas y chorizo - Pack completo para parrillada",
    isActive: true,
  },
  {
    name: "BBQ Master Pack",
    price: 950,
    weight: 4,
    image: "https://images.unsplash.com/photo-1606851080344-d4c6bc2ed7b9?w=400",
    category: "Promociones",
    stock: 20,
    promo: true,
    description: "Brisket, ribs, pork shoulder - Todo para tu BBQ",
    isActive: true,
  },
  {
    name: "Combo Familiar",
    price: 750,
    weight: 3.5,
    image: "https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?w=400",
    category: "Promociones",
    stock: 25,
    promo: true,
    description: "Variedad de cortes para toda la familia",
    isActive: true,
  },
  {
    name: "Premium Steakhouse Pack",
    price: 1800,
    weight: 3,
    image: "https://images.unsplash.com/photo-1558030006-450675393462?w=400",
    category: "Promociones",
    stock: 10,
    promo: true,
    description: "Tomahawk, Filet Mignon, y Porterhouse - Experiencia gourmet",
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
