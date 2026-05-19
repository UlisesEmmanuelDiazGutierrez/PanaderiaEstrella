import React from "react";
import { Toaster } from "react-hot-toast";
import { Package, User, Tag, LogOut } from "lucide-react";

// ── Mapa de estados BD → UI ───────────────────────────────────────────────
// La BD guarda: "pendiente" | "picked" | "transit" | "delivered" | "cancelado"
const STATUS_LABEL = {
  pendiente: "PENDIENTE",
  picked: "EN BODEGA",
  transit: "EN TRÁNSITO",
  delivered: "ENTREGADO",
  cancelado: "CANCELADO",
};

const STATUS_COLOR = {
  pendiente: "bg-gray-600 text-white",
  picked: "bg-blue-500 text-white",
  transit: "bg-yellow-500 text-gray-900",
  delivered: "bg-green-500 text-white",
  cancelado: "bg-red-500 text-white",
};

const ShippingView = ({ theme, user, setUser, orders, updateStatus }) => {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: theme.bg, color: theme.text }}
    >
      <Toaster position="top-right" />

      {/* Header */}
      <div
        className="p-4 flex justify-between items-center shadow-lg"
        style={{ backgroundColor: "#7c3aed" }}
      >
        <div className="flex items-center gap-3">
          <Package size={30} className="text-purple-300" />
          <div>
            <h1 className="text-2xl font-bold text-white">Portal Paquetería</h1>
            <p className="text-sm text-purple-200">{user.name}</p>
          </div>
        </div>
        <button
          onClick={() => setUser(null)}
          className="bg-white text-purple-900 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* Contenido */}
      <div className="p-4 sm:p-8 max-w-4xl mx-auto">
        <h2
          className="text-3xl font-extrabold mb-6 text-purple-400 border-b pb-2"
          style={{ borderColor: theme.border }}
        >
          Pedidos de Alto Volumen (+50kg)
        </h2>

        {orders.length === 0 ? (
          <div className="text-center p-12 bg-purple-50 rounded-xl border-2 border-dashed border-purple-300">
            <Package size={64} className="mx-auto mb-4 text-purple-400" />
            <p className="text-xl font-semibold text-purple-700">
              No hay pedidos pendientes
            </p>
            <p className="text-sm text-purple-600 mt-2">
              Los nuevos pedidos aparecerán aquí automáticamente
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((o) => {
              // Soporta tanto _id (normalizado) como id
              const oid = o._id ?? o.id;
              const status = o.status;

              return (
                <div
                  key={oid}
                  className="p-6 rounded-xl shadow-lg border-l-4 border-purple-500 hover:shadow-xl transition"
                  style={{ backgroundColor: theme.card }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-bold text-purple-400">
                      Envío #{String(oid).slice(-6)}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLOR[status] ?? "bg-gray-600 text-white"}`}
                    >
                      {STATUS_LABEL[status] ?? status?.toUpperCase() ?? "—"}
                    </span>
                  </div>

                  <div
                    className="space-y-2 text-sm mb-4"
                    style={{ color: theme.textSecondary }}
                  >
                    <p className="flex items-center gap-2">
                      <User size={16} style={{ color: "#7c3aed" }} />
                      <span className="font-semibold">Cliente:</span>
                      <span>{o.customer?.name}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Tag size={16} style={{ color: "#7c3aed" }} />
                      <span className="font-semibold">Total:</span>
                      <span className="text-green-400 font-bold">
                        ${o.total}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Package size={16} style={{ color: "#7c3aed" }} />
                      <span className="font-semibold">Peso:</span>
                      <span className="text-red-400 font-bold">
                        {o.weight}kg
                      </span>
                    </p>
                    {o.customer?.address && (
                      <p className="flex items-center gap-2">
                        <span className="font-semibold">📍 Dirección:</span>
                        <span>{o.customer.address}</span>
                      </p>
                    )}
                    {o.customer?.phone && (
                      <p className="flex items-center gap-2">
                        <span className="font-semibold">📞 Teléfono:</span>
                        <span>{o.customer.phone}</span>
                      </p>
                    )}
                  </div>

                  {/* Botones de acción */}
                  <div
                    className="flex gap-3 mt-4 pt-4 border-t"
                    style={{ borderColor: theme.border }}
                  >
                    {/* "pendiente" en Supabase = antes "pending" en Mongo */}
                    {status === "pendiente" && (
                      <button
                        onClick={() => updateStatus(oid, "picked")}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition transform hover:scale-105"
                      >
                        📦 Recibir en Bodega
                      </button>
                    )}
                    {status === "picked" && (
                      <button
                        onClick={() => updateStatus(oid, "transit")}
                        className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-gray-900 px-4 py-3 rounded-lg font-semibold transition transform hover:scale-105"
                      >
                        🚚 Enviar en Ruta
                      </button>
                    )}
                    {status === "transit" && (
                      <button
                        onClick={() => updateStatus(oid, "delivered")}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold transition transform hover:scale-105"
                      >
                        ✅ Confirmar Entrega
                      </button>
                    )}
                    {status === "delivered" && (
                      <div className="flex-1 bg-gray-100 text-gray-600 px-4 py-3 rounded-lg font-semibold text-center">
                        ✅ Envío Completado
                      </div>
                    )}
                    {status === "cancelado" && (
                      <div className="flex-1 bg-red-50 text-red-600 px-4 py-3 rounded-lg font-semibold text-center">
                        ❌ Pedido Cancelado
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShippingView;
