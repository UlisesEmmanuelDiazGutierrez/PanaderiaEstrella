// models/Product.js
/**
 * MODELO DE PRODUCTO
 *
 * Define la estructura de los productos (cortes de carne) en MongoDB.
 * Incluye información de precios, stock, categorías e imágenes.
 *
 * Categorías disponibles:
 * - Res: Cortes de res
 * - Cerdo: Cortes de cerdo
 * - Cortes: Cortes especiales/premium
 */

import mongoose from "mongoose";

// Definir el esquema del producto
const ProductSchema = new mongoose.Schema(
  {
    // Nombre del producto
    name: {
      type: String,
      required: [true, "El nombre del producto es obligatorio"],
      trim: true,
      maxlength: [100, "El nombre no puede exceder 100 caracteres"],
    },

    // Precio por kilogramo
    price: {
      type: Number,
      required: [true, "El precio es obligatorio"],
      min: [0, "El precio no puede ser negativo"],
    },

    // Peso unitario (por defecto 1 kg)
    weight: {
      type: Number,
      default: 1,
      min: [0.1, "El peso mínimo es 0.1 kg"],
    },

    // URL de la imagen del producto
    image: {
      type: String,
      required: [true, "La imagen es obligatoria"],
      trim: true,
    },

    // Categoría del producto
    category: {
      type: String,
      required: [true, "La categoría es obligatoria"],
      enum: ["Res", "Cerdo", "Cortes"],
    },

    // Stock disponible en kilogramos
    stock: {
      type: Number,
      required: [true, "El stock es obligatorio"],
      min: [0, "El stock no puede ser negativo"],
      default: 0,
    },

    // Indicador de promoción
    promo: {
      type: Boolean,
      default: false,
    },

    // Descripción del producto (opcional)
    description: {
      type: String,
      trim: true,
      maxlength: [500, "La descripción no puede exceder 500 caracteres"],
    },

    // Producto activo/visible en la tienda
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
 * ÍNDICE DE BÚSQUEDA
 * Optimiza búsquedas por categoría y estado activo
 */
ProductSchema.index({ category: 1, isActive: 1 });

/**
 * ÍNDICE DE TEXTO
 * Permite búsquedas de texto completo en nombre y descripción
 */
ProductSchema.index({ name: "text", description: "text" });

/**
 * MÉTODO DE INSTANCIA
 * Verifica si hay stock suficiente
 *
 * @param {number} quantity - Cantidad solicitada en kg
 * @returns {boolean} - true si hay stock, false si no
 */
ProductSchema.methods.hasStock = function (quantity) {
  return this.stock >= quantity;
};

/**
 * MÉTODO DE INSTANCIA
 * Reduce el stock del producto
 *
 * @param {number} quantity - Cantidad a reducir en kg
 * @returns {Promise<Object>} - Producto actualizado
 */
ProductSchema.methods.reduceStock = async function (quantity) {
  if (!this.hasStock(quantity)) {
    throw new Error(`Stock insuficiente. Disponible: ${this.stock}kg`);
  }

  this.stock -= quantity;
  return await this.save();
};

/**
 * MÉTODO DE INSTANCIA
 * Aumenta el stock del producto
 *
 * @param {number} quantity - Cantidad a agregar en kg
 * @returns {Promise<Object>} - Producto actualizado
 */
ProductSchema.methods.addStock = async function (quantity) {
  this.stock += quantity;
  return await this.save();
};

/**
 * MÉTODO ESTÁTICO
 * Obtiene productos por categoría
 *
 * @param {string} category - Categoría a filtrar
 * @returns {Promise<Array>} - Lista de productos
 */
ProductSchema.statics.findByCategory = function (category) {
  return this.find({ category, isActive: true }).sort({ name: 1 });
};

/**
 * MÉTODO ESTÁTICO
 * Obtiene productos en promoción
 *
 * @returns {Promise<Array>} - Lista de productos en promoción
 */
ProductSchema.statics.findPromos = function () {
  return this.find({ promo: true, isActive: true }).sort({ price: 1 });
};

/**
 * MÉTODO ESTÁTICO
 * Busca productos por texto
 *
 * @param {string} searchText - Texto a buscar
 * @returns {Promise<Array>} - Lista de productos que coinciden
 */
ProductSchema.statics.searchProducts = function (searchText) {
  return this.find(
    { $text: { $search: searchText }, isActive: true },
    { score: { $meta: "textScore" } }
  ).sort({ score: { $meta: "textScore" } });
};

// Evitar redefinición del modelo en desarrollo (hot reload)
export default mongoose.models.Product ||
  mongoose.model("Product", ProductSchema);
