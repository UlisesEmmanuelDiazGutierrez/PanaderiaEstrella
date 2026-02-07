/**
 * COMPONENTES UI - TODOS EN UN ARCHIVO
 */

import React from "react";
import {
  ShoppingCart,
  User,
  LogOut,
  LogIn,
  Bell,
  Package,
  Sun,
  Moon,
  X,
  CreditCard,
  MapPin,
  Tag,
  Clock,
  CheckCircle,
  Phone,
  Mail,
  Truck,
  AlertTriangle,
} from "lucide-react";

// ==========================================
// COMPONENTE: LOGIN
// ==========================================
export function LoginView({
  onLogin,
  loading,
  show2FA,
  code2FA,
  setCode2FA,
  onVerify2FA,
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-10 text-center">
            <div className="text-5xl mb-4">🥩</div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Estrella Beef
            </h1>
            <p className="text-red-100 text-sm">Carnes premium a domicilio</p>
          </div>

          {/* Formulario */}
          <div className="px-8 py-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Iniciar Sesión
            </h2>

            <div className="space-y-5">
              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500"
                id="email"
              />
              <input
                type="password"
                placeholder="Contraseña"
                className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500"
                id="password"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    const email = document.getElementById("email").value;
                    const password = document.getElementById("password").value;
                    onLogin(email, password);
                  }
                }}
              />

              <button
                onClick={() => {
                  const email = document.getElementById("email").value;
                  const password = document.getElementById("password").value;
                  onLogin(email, password);
                }}
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 disabled:opacity-50 cursor-pointer transition"
              >
                {loading ? "Ingresando..." : "Ingresar"}
              </button>
            </div>
          </div>
        </div>

        {/* Cuentas de prueba */}
        <div className="mt-6 bg-gray-800 bg-opacity-80 rounded-lg p-4 text-white text-xs">
          <p className="font-semibold mb-2 text-center">
            🔓 Cuentas de Prueba (Contraseña: 123)
          </p>
          <div className="grid gap-2">
            {[
              { email: "cliente@test.com", label: "👤 Cliente" },
              { email: "repartidor@test.com", label: "🚚 Repartidor" },
              { email: "paqueteria@test.com", label: "📦 Paquetería" },
              { email: "admin@test.com", label: "👨‍💼 Admin" },
            ].map((acc) => (
              <button
                key={acc.email}
                onClick={() => {
                  document.getElementById("email").value = acc.email;
                  document.getElementById("password").value = "123";
                }}
                className="bg-gray-700 rounded px-3 py-2 hover:bg-gray-600 cursor-pointer text-left transition"
              >
                <span>{acc.label}:</span>{" "}
                <code className="ml-2 text-[10px]">{acc.email}</code>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal 2FA */}
      {show2FA && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold mb-4">Verificación 2FA</h3>
            <p className="text-gray-600 mb-4">
              Ingresa el código de 6 dígitos enviado a tu email
            </p>
            <input
              type="text"
              maxLength="6"
              value={code2FA}
              onChange={(e) => setCode2FA(e.target.value.replace(/\D/g, ""))}
              onKeyPress={(e) =>
                e.key === "Enter" &&
                code2FA.length === 6 &&
                onVerify2FA(code2FA)
              }
              className="w-full p-4 text-center text-3xl border-2 rounded-lg mb-4 outline-none focus:ring-2 focus:ring-red-500"
              placeholder="000000"
              autoFocus
            />
            <button
              onClick={() => onVerify2FA(code2FA)}
              disabled={code2FA.length !== 6}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold cursor-pointer hover:bg-red-700 disabled:opacity-50 transition"
            >
              Verificar
            </button>
            <p className="text-xs text-center mt-3 text-gray-500">
              💡 Para pruebas usa: 123456
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// COMPONENTE: HEADER
// ==========================================
export function Header({
  user,
  darkMode,
  setDarkMode,
  theme,
  itemCount,
  pendingOrders,
  notifications,
  onShowCart,
  onShowOrders,
  onShowNotifications,
  onLogout,
}) {
  const isAdmin = user?.role === "admin";
  const isCustomer = user?.role === "customer";

  return (
    <header
      className="sticky top-0 border-b shadow-lg z-50"
      style={{ backgroundColor: theme.card, borderColor: theme.border }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer hover:scale-105 transition">
            <div className="text-5xl">🥩</div>
            <div>
              <h1
                className="text-3xl font-extrabold"
                style={{ color: theme.primary }}
              >
                Estrella Beef
              </h1>
              <p className="text-xs" style={{ color: theme.textSecondary }}>
                Carnes premium
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full cursor-pointer hover:scale-110 transition"
              style={{ backgroundColor: theme.bgSecondary }}
              title={darkMode ? "Modo claro" : "Modo oscuro"}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {isCustomer && (
              <>
                <button
                  onClick={onShowNotifications}
                  className="relative p-2 rounded-full cursor-pointer hover:scale-110 transition"
                  style={{ backgroundColor: theme.bgSecondary }}
                  title="Notificaciones"
                >
                  <Bell size={20} />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                      {notifications}
                    </span>
                  )}
                </button>

                <button
                  onClick={onShowOrders}
                  className="relative p-2 rounded-full cursor-pointer hover:scale-110 transition"
                  style={{ backgroundColor: theme.bgSecondary }}
                  title="Mis pedidos"
                >
                  <Package size={20} />
                  {pendingOrders > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {pendingOrders}
                    </span>
                  )}
                </button>
              </>
            )}

            {!isAdmin && isCustomer && (
              <button
                onClick={onShowCart}
                className="relative p-3 rounded-full cursor-pointer hover:scale-110 transition"
                style={{ backgroundColor: theme.primary }}
                title="Carrito"
              >
                <ShoppingCart size={24} className="text-white" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold animate-bounce">
                    {itemCount}
                  </span>
                )}
              </button>
            )}

            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ backgroundColor: theme.bgSecondary }}
            >
              <User size={20} />
              <span
                className="text-sm font-semibold hidden sm:block"
                style={{ color: theme.text }}
              >
                {user.name.split(" ")[0]}
              </span>
            </div>

            <button
              onClick={onLogout}
              className="p-2 rounded-full cursor-pointer hover:scale-110 transition hover:bg-red-100"
              title="Cerrar sesión"
            >
              <LogOut size={20} className="text-red-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// ==========================================
// COMPONENTE: MODAL CARRITO
// ==========================================
export function CartModal({
  cart,
  onUpdateQty,
  onClose,
  onCheckout,
  total,
  weight,
  theme,
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        className="w-full max-w-2xl rounded-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        style={{ backgroundColor: theme.card }}
      >
        <div
          className="p-6 border-b flex justify-between items-center"
          style={{ borderColor: theme.border }}
        >
          <h3
            className="text-2xl font-bold flex items-center gap-3"
            style={{ color: theme.primary }}
          >
            Tu Carrito <ShoppingCart />
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full cursor-pointer hover:bg-gray-200 transition"
            style={{ backgroundColor: theme.bgSecondary }}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-7xl mb-4">🛒</div>
              <p
                className="text-xl font-semibold"
                style={{ color: theme.textSecondary }}
              >
                ¡Aún no has agregado nada!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((i) => (
                <div
                  key={i.id}
                  className="flex gap-4 p-4 rounded-xl items-center border"
                  style={{
                    backgroundColor: theme.bgSecondary,
                    borderColor: theme.border,
                  }}
                >
                  <img
                    src={i.image}
                    alt={i.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold" style={{ color: theme.text }}>
                      {i.name}
                    </h4>
                    <p
                      className="text-sm"
                      style={{ color: theme.textSecondary }}
                    >
                      ${i.price}/kg
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateQty(i.id, i.quantity - 1)}
                      className="w-8 h-8 rounded-full text-white cursor-pointer hover:scale-110 transition"
                      style={{ backgroundColor: theme.primary }}
                    >
                      -
                    </button>
                    <span
                      className="font-bold w-6 text-center"
                      style={{ color: theme.text }}
                    >
                      {i.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQty(i.id, i.quantity + 1)}
                      className="w-8 h-8 rounded-full text-white cursor-pointer hover:scale-110 transition"
                      style={{ backgroundColor: theme.primary }}
                    >
                      +
                    </button>
                  </div>
                  <p
                    className="font-bold text-lg"
                    style={{ color: theme.primary }}
                  >
                    ${(i.price * i.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t" style={{ borderColor: theme.border }}>
            <div className="space-y-2 mb-4">
              <div
                className="flex justify-between"
                style={{ color: theme.textSecondary }}
              >
                <span>Peso total:</span>
                <span className="font-semibold">{weight.toFixed(1)} kg</span>
              </div>
              <div
                className="flex justify-between"
                style={{ color: theme.textSecondary }}
              >
                <span>Método:</span>
                <span className="font-semibold">
                  {weight > 50 ? "📦 Paquetería" : "🚴 Local"}
                </span>
              </div>
              <div
                className="flex justify-between text-3xl font-bold pt-3 border-t"
                style={{ color: theme.primary, borderColor: theme.border }}
              >
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={onCheckout}
              className="w-full py-4 rounded-xl font-bold text-white cursor-pointer hover:scale-105 transition"
              style={{ backgroundColor: theme.primary }}
            >
              Proceder a Pagar <CreditCard className="inline ml-2" size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// COMPONENTE: MODAL CHECKOUT
// ==========================================
export function CheckoutModal({
  cart,
  total,
  weight,
  onClose,
  onCreate,
  theme,
}) {
  const [delivery, setDelivery] = React.useState({
    name: "",
    address: "",
    phone: "",
  });
  const [payment, setPayment] = React.useState("");

  const handleCreate = () => {
    if (!delivery.name || !delivery.address || !delivery.phone || !payment) {
      alert("Completa todos los campos");
      return;
    }
    onCreate(delivery, payment);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[90] flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="max-w-2xl w-full rounded-2xl my-8 shadow-2xl"
        style={{ backgroundColor: theme.card }}
      >
        <div
          className="p-6 border-b flex justify-between items-center"
          style={{ borderColor: theme.border }}
        >
          <h3 className="text-2xl font-bold" style={{ color: theme.primary }}>
            Finalizar Compra
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full cursor-pointer hover:bg-gray-200 transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div
            className="p-4 rounded-xl border"
            style={{
              backgroundColor: theme.bgSecondary,
              borderColor: theme.border,
            }}
          >
            <h4
              className="font-bold text-xl mb-4 flex items-center gap-2"
              style={{ color: theme.primary }}
            >
              <MapPin /> Datos de Entrega
            </h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nombre Completo"
                value={delivery.name}
                onChange={(e) =>
                  setDelivery({ ...delivery, name: e.target.value })
                }
                className="w-full p-3 rounded-lg border outline-none focus:ring-2 focus:ring-red-500"
                style={{
                  backgroundColor: theme.bg,
                  color: theme.text,
                  borderColor: theme.border,
                }}
              />
              <input
                type="text"
                placeholder="Dirección Completa"
                value={delivery.address}
                onChange={(e) =>
                  setDelivery({ ...delivery, address: e.target.value })
                }
                className="w-full p-3 rounded-lg border outline-none focus:ring-2 focus:ring-red-500"
                style={{
                  backgroundColor: theme.bg,
                  color: theme.text,
                  borderColor: theme.border,
                }}
              />
              <input
                type="tel"
                placeholder="Teléfono WhatsApp"
                value={delivery.phone}
                onChange={(e) =>
                  setDelivery({ ...delivery, phone: e.target.value })
                }
                className="w-full p-3 rounded-lg border outline-none focus:ring-2 focus:ring-red-500"
                style={{
                  backgroundColor: theme.bg,
                  color: theme.text,
                  borderColor: theme.border,
                }}
              />
            </div>
          </div>

          <div
            className="p-4 rounded-xl border"
            style={{
              backgroundColor: theme.bgSecondary,
              borderColor: theme.border,
            }}
          >
            <h4
              className="font-bold text-xl mb-4 flex items-center gap-2"
              style={{ color: theme.primary }}
            >
              <CreditCard /> Método de Pago
            </h4>
            <div className="space-y-3">
              {[
                { value: "card", label: "Tarjeta de Crédito/Débito" },
                { value: "transfer", label: "Transferencia Bancaria" },
                { value: "cash", label: "Efectivo al Recibir" },
              ].map((m) => (
                <button
                  key={m.value}
                  onClick={() => setPayment(m.value)}
                  className="w-full p-4 rounded-xl border-2 flex items-center gap-3 cursor-pointer hover:scale-105 transition"
                  style={{
                    borderColor:
                      payment === m.value ? theme.primary : theme.border,
                    backgroundColor:
                      payment === m.value ? `${theme.primary}20` : theme.bg,
                  }}
                >
                  <span
                    className="font-semibold flex-1 text-left"
                    style={{ color: theme.text }}
                  >
                    {m.label}
                  </span>
                  {payment === m.value && (
                    <CheckCircle size={20} className="text-green-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div
            className="p-6 rounded-xl border-2"
            style={{
              backgroundColor: theme.bgSecondary,
              borderColor: theme.primary,
            }}
          >
            <h4
              className="text-xl font-bold mb-3"
              style={{ color: theme.primary }}
            >
              Resumen
            </h4>
            <div className="space-y-2" style={{ color: theme.textSecondary }}>
              <div className="flex justify-between">
                <span>Subtotal ({cart.length} productos):</span>
                <span style={{ color: theme.text }}>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío:</span>
                <span className="text-green-500 font-semibold">GRATIS</span>
              </div>
              <div className="flex justify-between">
                <span>Peso total:</span>
                <span style={{ color: theme.text }}>
                  {weight.toFixed(1)} kg
                </span>
              </div>
              <div
                className="flex justify-between text-3xl font-extrabold pt-3 border-t mt-3"
                style={{ color: theme.primary, borderColor: theme.border }}
              >
                <span>TOTAL:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleCreate}
            className="w-full py-4 rounded-xl font-bold text-xl text-white cursor-pointer hover:scale-105 transition"
            style={{ backgroundColor: "#16a34a" }}
          >
            <CheckCircle className="inline mr-2" size={24} />
            FINALIZAR Y PAGAR
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// COMPONENTE: MIS PEDIDOS
// ==========================================
export function MyOrdersModal({ orders, onClose, theme }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        className="w-full max-w-4xl rounded-2xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col"
        style={{ backgroundColor: theme.card }}
      >
        <div
          className="p-6 border-b flex justify-between items-center"
          style={{ borderColor: theme.border }}
        >
          <h3
            className="text-2xl font-bold flex items-center gap-3"
            style={{ color: theme.primary }}
          >
            <Package /> Mis Pedidos
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full cursor-pointer hover:bg-gray-200 transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package size={64} className="mx-auto mb-4 text-gray-300" />
              <p
                className="text-xl font-semibold"
                style={{ color: theme.textSecondary }}
              >
                No tienes pedidos por ahora
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <div
                  key={o._id}
                  className="p-6 rounded-xl border hover:shadow-lg transition"
                  style={{
                    backgroundColor: theme.bgSecondary,
                    borderColor: theme.border,
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4
                        className="text-lg font-bold"
                        style={{ color: theme.text }}
                      >
                        Pedido #{o._id.slice(-8)}
                      </h4>
                      <p
                        className="text-sm flex items-center gap-1 mt-1"
                        style={{ color: theme.textSecondary }}
                      >
                        <Clock size={14} />
                        {new Date(o.createdAt).toLocaleDateString("es-MX")}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${o.status === "delivered" ? "bg-green-100 text-green-800" : o.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}`}
                    >
                      {o.status.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ color: theme.textSecondary }}>
                    📍 {o.customer.address}
                  </p>
                  <p
                    className="font-bold text-2xl mt-2"
                    style={{ color: theme.primary }}
                  >
                    ${o.total.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
