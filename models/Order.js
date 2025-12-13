// models/Order.js
/**
 * MODELO DE PEDIDO
 *
 * Define la estructura de los pedidos en MongoDB.
 * Incluye items del pedido, información de entrega, método de pago y estados.
 *
 * Estados del pedido:
 * - pending: Pendiente de recoger
 * - picked: Recogido por repartidor/paquetería
 * - transit: En camino al cliente
 * - delivered: Entregado
 * - cancelled: Cancelado
 *
 * Métodos de entrega:
 * - delivery: Reparto local (< 50kg)
 * - shipping: Paquetería (>= 50kg)
 */

import mongoose from "mongoose";

// Subdocumento para items del pedido
const OrderItemSchema = new mongoose.Schema({
  // Referencia al producto
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },

  // Nombre del producto (guardado para historial)
  name: {
    type: String,
    required: true,
  },

  // Precio unitario al momento de la compra
  price: {
    type: Number,
    required: true,
    min: 0,
  },

  // Cantidad en kilogramos
  quantity: {
    type: Number,
    required: true,
    min: 0.1,
  },

  // Peso unitario del producto
  weight: {
    type: Number,
    required: true,
    min: 0.1,
  },

  // URL de la imagen (para historial)
  image: {
    type: String,
    required: true,
  },
});

// Subdocumento para información del cliente
const CustomerInfoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  address: {
    type: String,
    required: true,
    trim: true,
  },

  phone: {
    type: String,
    required: true,
    trim: true,
  },
});

// Definir el esquema del pedido
const OrderSchema = new mongoose.Schema(
  {
    // ID del usuario que hizo el pedido
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Items del pedido
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: function (items) {
          return items.length > 0;
        },
        message: "El pedido debe tener al menos un producto",
      },
    },

    // Información del cliente para entrega
    customer: {
      type: CustomerInfoSchema,
      required: true,
    },

    // Total del pedido en pesos
    total: {
      type: Number,
      required: true,
      min: 0,
    },

    // Peso total del pedido en kg
    weight: {
      type: Number,
      required: true,
      min: 0.1,
    },

    // Método de entrega (basado en peso)
    method: {
      type: String,
      required: true,
      enum: ["delivery", "shipping"],
    },

    // Método de pago
    payment: {
      type: String,
      required: true,
      enum: ["card", "transfer", "cash"],
    },

    // Estado del pedido
    status: {
      type: String,
      required: true,
      enum: ["pending", "picked", "transit", "delivered", "cancelled"],
      default: "pending",
    },

    // ID del repartidor asignado (si aplica)
    deliveryPersonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Historial de cambios de estado
    statusHistory: [
      {
        status: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],

    // Notas adicionales del cliente
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    // Fecha de entrega estimada
    estimatedDelivery: {
      type: Date,
    },

    // Fecha de entrega real
    deliveredAt: {
      type: Date,
    },
  },
  {
    // Agregar timestamps automáticos (createdAt, updatedAt)
    timestamps: true,
  }
);

/**
 * ÍNDICES
 * Optimizan las búsquedas frecuentes
 */
OrderSchema.index({ userId: 1, createdAt: -1 }); // Pedidos por usuario
OrderSchema.index({ status: 1, method: 1 }); // Pedidos por estado y método
OrderSchema.index({ deliveryPersonId: 1, status: 1 }); // Pedidos por repartidor

/**
 * MIDDLEWARE PRE-SAVE
 * Agrega el estado inicial al historial
 */
OrderSchema.pre("save", function (next) {
  // Solo agregar al historial si es un nuevo pedido
  if (this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
    });
  }
  next();
});

/**
 * MÉTODO DE INSTANCIA
 * Actualiza el estado del pedido
 *
 * @param {string} newStatus - Nuevo estado
 * @param {string} userId - ID del usuario que actualiza
 * @returns {Promise<Object>} - Pedido actualizado
 */
OrderSchema.methods.updateStatus = async function (newStatus, userId) {
  // Validar que el nuevo estado sea válido
  const validStatuses = [
    "pending",
    "picked",
    "transit",
    "delivered",
    "cancelled",
  ];
  if (!validStatuses.includes(newStatus)) {
    throw new Error("Estado inválido");
  }

  // Actualizar estado
  this.status = newStatus;

  // Agregar al historial
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    updatedBy: userId,
  });

  // Si se entregó, guardar fecha
  if (newStatus === "delivered") {
    this.deliveredAt = new Date();
  }

  return await this.save();
};

/**
 * MÉTODO DE INSTANCIA
 * Calcula el subtotal del pedido
 *
 * @returns {number} - Subtotal
 */
OrderSchema.methods.calculateSubtotal = function () {
  return this.items.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
};

/**
 * MÉTODO ESTÁTICO
 * Obtiene pedidos por usuario
 *
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} - Lista de pedidos
 */
OrderSchema.statics.findByUser = function (userId) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .populate("items.productId", "name category");
};

/**
 * MÉTODO ESTÁTICO
 * Obtiene pedidos por repartidor
 *
 * @param {string} deliveryPersonId - ID del repartidor
 * @param {string} method - Método de entrega
 * @returns {Promise<Array>} - Lista de pedidos
 */
OrderSchema.statics.findByDeliveryPerson = function (deliveryPersonId, method) {
  return this.find({
    method,
    status: { $in: ["pending", "picked", "transit"] },
  }).sort({ createdAt: -1 });
};

/**
 * MÉTODO ESTÁTICO
 * Obtiene pedidos pendientes por método
 *
 * @param {string} method - Método de entrega ('delivery' o 'shipping')
 * @returns {Promise<Array>} - Lista de pedidos pendientes
 */
OrderSchema.statics.findPendingByMethod = function (method) {
  return this.find({
    method,
    status: { $in: ["pending", "picked", "transit"] },
  }).sort({ createdAt: 1 });
};

/**
 * MÉTODO ESTÁTICO
 * Calcula estadísticas de ventas
 *
 * @param {Date} startDate - Fecha inicial
 * @param {Date} endDate - Fecha final
 * @returns {Promise<Object>} - Estadísticas
 */
OrderSchema.statics.getSalesStats = async function (startDate, endDate) {
  const stats = await this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $ne: "cancelled" },
      },
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalSales: { $sum: "$total" },
        totalWeight: { $sum: "$weight" },
        avgOrderValue: { $avg: "$total" },
      },
    },
  ]);

  return (
    stats[0] || {
      totalOrders: 0,
      totalSales: 0,
      totalWeight: 0,
      avgOrderValue: 0,
    }
  );
};

// Evitar redefinición del modelo en desarrollo (hot reload)
export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
