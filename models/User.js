// models/User.js
/**
 * MODELO DE USUARIO
 *
 * Define la estructura de los usuarios en MongoDB.
 * Incluye validaciones y métodos para manejar contraseñas.
 *
 * Roles disponibles:
 * - customer: Cliente que compra productos
 * - delivery: Repartidor local (pedidos < 50kg)
 * - shipping: Paquetería (pedidos > 50kg)
 * - admin: Administrador del sistema
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Definir el esquema del usuario
const UserSchema = new mongoose.Schema(
  {
    // Nombre completo del usuario
    name: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
      maxlength: [100, "El nombre no puede exceder 100 caracteres"],
    },

    // Email único para login
    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Por favor ingresa un email válido",
      ],
    },

    // Contraseña encriptada
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      minlength: [3, "La contraseña debe tener al menos 3 caracteres"],
      select: false, // No incluir en queries por defecto (seguridad)
    },

    // Rol del usuario en el sistema
    role: {
      type: String,
      enum: ["customer", "delivery", "shipping", "admin"],
      default: "customer",
    },

    // Teléfono de contacto (opcional)
    phone: {
      type: String,
      trim: true,
    },

    // Dirección por defecto (para clientes)
    defaultAddress: {
      type: String,
      trim: true,
    },

    // Estado de la cuenta
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    // Agregar timestamps automáticos (createdAt, updatedAt)
    timestamps: true,
  }
);

/**
 * MIDDLEWARE PRE-SAVE
 * Encripta la contraseña antes de guardar en la base de datos
 */
UserSchema.pre("save", async function (next) {
  // Solo encriptar si la contraseña fue modificada
  if (!this.isModified("password")) {
    return next();
  }

  try {
    // Generar salt (semilla aleatoria) para encriptar
    const salt = await bcrypt.genSalt(10);
    // Encriptar contraseña
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * MÉTODO DE INSTANCIA
 * Compara una contraseña plana con la encriptada
 *
 * @param {string} candidatePassword - Contraseña a verificar
 * @returns {Promise<boolean>} - true si coincide, false si no
 */
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * MÉTODO ESTÁTICO
 * Busca un usuario por email y verifica su contraseña
 *
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña a verificar
 * @returns {Promise<Object|null>} - Usuario si es válido, null si no
 */
UserSchema.statics.findByCredentials = async function (email, password) {
  // Buscar usuario por email e incluir el campo password
  const user = await this.findOne({ email }).select("+password");

  if (!user) {
    return null;
  }

  // Verificar contraseña
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return null;
  }

  // Retornar usuario sin la contraseña
  user.password = undefined;
  return user;
};

// Evitar redefinición del modelo en desarrollo (hot reload)
export default mongoose.models.User || mongoose.model("User", UserSchema);
