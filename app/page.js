"use client";

/**
 * PÁGINA PRINCIPAL - ESTRELLA BEEF (Conectado con MongoDB)
 * 
 * Ahora consume las APIs de MongoDB para:
 * - Autenticación real
 * - Productos desde base de datos
 * - Creación de pedidos persistentes
 */

import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  User,
  Truck,
  Package,
  LogOut,
  X,
  CreditCard,
  MapPin,
  Tag,
  Send,
  Clock,
  CheckCircle,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle as CheckIcon,
} from "lucide-react";

// ==========================================
// COMPONENTE DE MENSAJES (Toast)
// ==========================================
const MessageToast = ({ message, onClose }) => {
  if (!message) return null;

  const isError = message.type === "error";
  const bgColor = isError ? "bg-red-600" : "bg-green-600";
  const Icon = isError ? AlertTriangle : CheckIcon;

  return (
    <div className="fixed top-4 right-4 z-[9999] p-4 max-w-sm w-full">
      <div
        className={`${bgColor} text-white p-4 rounded-xl shadow-lg flex items-start gap-3 border border-white/20`}
      >
        <Icon size={24} className="mt-1 flex-shrink-0" />
        <div className="flex-grow">
          <p className="font-bold">{isError ? "Error" : "Éxito"}</p>
          <p className="text-sm">{message.text}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-white/20 flex-shrink-0"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
function App() {
  // ========== ESTADOS ==========
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [category, setCategory] = useState("Todo");
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [delivery, setDelivery] = useState({ name: "", address: "", phone: "" });
  const [payment, setPayment] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // ========== CARGAR PRODUCTOS AL INICIAR ==========
  useEffect(() => {
    fetchProducts();
  }, []);

  // ========== CARGAR PEDIDOS CUANDO HAY USUARIO ==========
  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  // ========== AUTO-CERRAR MENSAJES ==========
  useEffect(() => {
    if (message && message.type === "success") {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // ========== FUNCIÓN: OBTENER PRODUCTOS ==========
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setMessage({
        type: "error",
        text: "Error al cargar productos"
      });
    }
  };

  // ========== FUNCIÓN: OBTENER PEDIDOS ==========
  const fetchOrders = async () => {
    try {
      let url = '/api/orders';
      
      // Filtrar según rol
      if (user.role === 'customer') {
        url += `?userId=${user.id}`;
      } else if (user.role === 'delivery') {
        url += '?method=delivery';
      } else if (user.role === 'shipping') {
        url += '?method=shipping';
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    }
  };

  // ========== DATOS CALCULADOS ==========
  const categories = ["Todo", "Cortes", "Res", "Cerdo", "Promociones"];

  const filtered =
    category === "Todo"
      ? products
      : category === "Promociones"
      ? products.filter((p) => p.promo)
      : products.filter((p) => p.category === category);

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const weight = cart.reduce((s, i) => s + i.weight * i.quantity, 0);

  // ========== FUNCIÓN: AGREGAR AL CARRITO ==========
  const addToCart = (p) => {
    const exists = cart.find((i) => i.id === p._id);
    if (exists) {
      setCart(
        cart.map((i) =>
          i.id === p._id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setCart([...cart, { 
        id: p._id,
        name: p.name,
        price: p.price,
        weight: p.weight,
        image: p.image,
        quantity: 1 
      }]);
    }
    setMessage({
      type: "success",
      text: `Se agregó 1kg de ${p.name} al carrito.`,
    });
  };

  // ========== FUNCIÓN: ACTUALIZAR CANTIDAD ==========
  const updateQty = (id, qty) => {
    if (qty <= 0) {
      setCart(cart.filter((i) => i.id !== id));
    } else {
      setCart(cart.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
    }
  };

  // ========== FUNCIÓN: LOGIN ==========
  const login = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        setMessage({ type: "success", text: `Bienvenido, ${data.user.name}` });
        setLoginForm({ email: "", password: "" });
      } else {
        setMessage({
          type: "error",
          text: data.error || "Credenciales incorrectas",
        });
      }
    } catch (error) {
      console.error('Error en login:', error);
      setMessage({
        type: "error",
        text: "Error al iniciar sesión. Intenta de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ========== FUNCIÓN: CREAR PEDIDO ==========
  const createOrder = async () => {
    if (!delivery.name || !delivery.address || !delivery.phone || !payment) {
      setMessage({
        type: "error",
        text: "Por favor, completa todos los datos de entrega y pago.",
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          items: cart,
          customer: delivery,
          total,
          weight,
          method: weight > 50 ? "shipping" : "delivery",
          payment,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({
          type: "success",
          text: `Pedido creado exitosamente! Te contactaremos al WhatsApp: ${delivery.phone}`,
        });
        
        // Limpiar y recargar
        setCart([]);
        setShowCart(false);
        setShowCheckout(false);
        setDelivery({ name: "", address: "", phone: "" });
        setPayment("");
        
        // Recargar productos y pedidos
        fetchProducts();
        fetchOrders();
      } else {
        setMessage({
          type: "error",
          text: data.error || "Error al crear pedido",
        });
      }
    } catch (error) {
      console.error('Error al crear pedido:', error);
      setMessage({
        type: "error",
        text: "Error al crear pedido. Intenta de nuevo.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ========== FUNCIÓN: ACTUALIZAR ESTADO DEL PEDIDO ==========
  const updateStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          status: newStatus,
          updatedBy: user.id,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({
          type: "success",
          text: `Pedido actualizado a ${newStatus}`,
        });
        fetchOrders(); // Recargar pedidos
      } else {
        setMessage({
          type: "error",
          text: data.error || "Error al actualizar pedido",
        });
      }
    } catch (error) {
      console.error('Error al actualizar pedido:', error);
      setMessage({
        type: "error",
        text: "Error al actualizar pedido",
      });
    }
  };

  // ==========================================
  // VISTA: LOGIN
  // ==========================================
  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        {message && (
          <MessageToast message={message} onClose={() => setMessage(null)} />
        )}
        <div className="bg-gray-900 p-8 rounded-2xl max-w-md w-full border border-red-800 shadow-2xl">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4 animate-pulse">🥩</div>
            <h1 className="text-3xl font-extrabold text-red-500">
              Estrella Beef
            </h1>
            <p className="text-gray-400">Iniciar Sesión en el Portal</p>
          </div>
          <form onSubmit={login} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={(e) =>
                setLoginForm({ ...loginForm, email: e.target.value })
              }
              className="w-full p-3 bg-gray-800 rounded-lg text-white border border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition duration-200"
              required
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm({ ...loginForm, password: e.target.value })
              }
              className="w-full p-3 bg-gray-800 rounded-lg text-white border border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition duration-200"
              required
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 disabled:opacity-50 text-white py-3 rounded-lg font-bold shadow-red-500/50 shadow-md transform hover:scale-[1.01] transition duration-200"
            >
              {loading ? "Ingresando..." : "Entrar"}
            </button>
          </form>
          <div className="mt-6 text-xs text-gray-500 text-center border-t border-gray-800 pt-4">
            <p className="font-semibold mb-1">
              Cuentas de Prueba (Contraseña: 123):
            </p>
            <p className="grid grid-cols-2 gap-1 text-[10px] sm:text-xs">
              <span>👤 Cliente: cliente@test.com</span>
              <span>🚚 Repartidor: repartidor@test.com</span>
              <span>📦 Paquetería: paqueteria@test.com</span>
              <span>👑 Admin: admin@test.com</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VISTA: REPARTIDOR (DELIVERY)
  // ==========================================
  if (user.role === "delivery") {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        {message && (
          <MessageToast message={message} onClose={() => setMessage(null)} />
        )}
        <div className="bg-blue-900 text-white p-4 flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-3">
            <Truck size={30} className="text-blue-300" />
            <div>
              <h1 className="text-2xl font-bold">Portal Repartidor</h1>
              <p className="text-sm text-blue-200">{user.name}</p>
            </div>
          </div>
          <button
            onClick={() => setUser(null)}
            className="bg-white text-blue-900 px-4 py-2 rounded-lg flex items-center gap-2 font-semibold hover:bg-blue-200 transition"
          >
            <LogOut size={20} /> Salir
          </button>
        </div>
        <div className="p-4 sm:p-8 max-w-4xl mx-auto">
          <h2 className="text-3xl font-extrabold mb-6 text-blue-400 border-b border-blue-800 pb-2">
            Ruta de Entregas (Menos de 50kg)
          </h2>
          {orders.length === 0 && (
            <p className="text-gray-500 text-center p-8">
              No hay pedidos pendientes para reparto local.
            </p>
          )}
          <div className="space-y-6">
            {orders.map((o) => (
              <div
                key={o._id}
                className="bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-blue-500"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-bold text-blue-400">
                    Pedido #{o._id.slice(-6)}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      o.status === "delivered"
                        ? "bg-green-500 text-white"
                        : o.status === "transit"
                        ? "bg-yellow-500 text-gray-900"
                        : "bg-gray-600"
                    }`}
                  >
                    {o.status.toUpperCase()}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-gray-300 mb-4">
                  <p className="flex items-center gap-2">
                    <User size={16} /> Cliente:{" "}
                    <span className="font-semibold">{o.customer.name}</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <MapPin size={16} className="mt-1 flex-shrink-0" />{" "}
                    Dirección:{" "}
                    <span className="font-semibold">{o.customer.address}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone size={16} /> Contacto:{" "}
                    <span className="font-semibold">{o.customer.phone}</span>
                  </p>
                  <p className="flex items-center gap-2 text-lg font-bold">
                    Total: <span className="text-green-400">${o.total}</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-700">
                  {o.status === "pending" && (
                    <button
                      onClick={() => updateStatus(o._id, "picked")}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                    >
                      <Package size={16} /> Recoger
                    </button>
                  )}
                  {o.status === "picked" && (
                    <button
                      onClick={() => updateStatus(o._id, "transit")}
                      className="bg-yellow-600 hover:bg-yellow-700 text-gray-900 px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                    >
                      <Truck size={16} /> En Camino
                    </button>
                  )}
                  {o.status === "transit" && (
                    <button
                      onClick={() => updateStatus(o._id, "delivered")}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                    >
                      <CheckIcon size={16} /> Entregado
                    </button>
                  )}
                  {o.status === "delivered" && (
                    <span className="text-green-400 font-bold flex items-center gap-2">
                      ✓ Completado
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VISTA: PAQUETERÍA (SHIPPING)
  // ==========================================
  if (user.role === "shipping") {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        {message && (
          <MessageToast message={message} onClose={() => setMessage(null)} />
        )}
        <div className="bg-purple-900 text-white p-4 flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-3">
            <Package size={30} className="text-purple-300" />
            <div>
              <h1 className="text-2xl font-bold">Portal Paquetería</h1>
              <p className="text-sm text-purple-200">{user.name}</p>
            </div>
          </div>
          <button
            onClick={() => setUser(null)}
            className="bg-white text-purple-900 px-4 py-2 rounded-lg flex items-center gap-2 font-semibold hover:bg-purple-200 transition"
          >
            <LogOut size={20} /> Salir
          </button>
        </div>
        <div className="p-4 sm:p-8 max-w-4xl mx-auto">
          <h2 className="text-3xl font-extrabold mb-6 text-purple-400 border-b border-purple-800 pb-2">
            Pedidos de Alto Volumen (+50kg)
          </h2>
          {orders.length === 0 && (
            <p className="text-gray-500 text-center p-8">
              No hay pedidos de alto volumen pendientes.
            </p>
          )}
          <div className="space-y-6">
            {orders.map((o) => (
              <div
                key={o._id}
                className="bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 border-purple-500"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-bold text-purple-400">
                    Envío de Carga #{o._id.slice(-6)}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      o.status === "delivered"
                        ? "bg-green-500 text-white"
                        : o.status === "transit"
                        ? "bg-yellow-500 text-gray-900"
                        : "bg-gray-600"
                    }`}
                  >
                    {o.status.toUpperCase()}
                  </span>
                </div>
                <div className="space-y-1 text-sm text-gray-300 mb-4">
                  <p className="flex items-center gap-2">
                    <User size={16} /> Cliente:{" "}
                    <span className="font-semibold">{o.customer.name}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Tag size={16} /> Total:{" "}
                    <span className="text-green-400 font-bold">${o.total}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Package size={16} />{" "}
                    <span className="text-red-400 font-bold">
                      Peso: {o.weight}kg
                    </span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-700">
                  {o.status === "pending" && (
                    <button
                      onClick={() => updateStatus(o._id, "picked")}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                    >
                      <Package size={16} /> En Bodega
                    </button>
                  )}
                  {o.status === "picked" && (
                    <button
                      onClick={() => updateStatus(o._id, "transit")}
                      className="bg-yellow-600 hover:bg-yellow-700 text-gray-900 px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                    >
                      <Truck size={16} /> En Ruta
                    </button>
                  )}
                  {o.status === "transit" && (
                    <button
                      onClick={() => updateStatus(o._id, "delivered")}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                    >
                      <CheckIcon size={16} /> Entregado
                    </button>
                  )}
                  {o.status === "delivered" && (
                    <span className="text-green-400 font-bold flex items-center gap-2">
                      ✓ Completado
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VISTA: ADMINISTRADOR
  // ==========================================
  if (user.role === "admin") {
    const totalSales = orders.reduce((s, o) => s + o.total, 0);
    const pendingOrders = orders.filter((o) => o.status === "pending").length;

    return (
      <div className="min-h-screen bg-gray-100">
        {message && (
          <MessageToast message={message} onClose={() => setMessage(null)} />
        )}
        <div className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-3">
            <User size={30} className="text-red-500" />
            <div>
              <h1 className="text-2xl font-bold">Panel de Administración</h1>
              <p className="text-sm text-gray-400">{user.name}</p>
            </div>
          </div>
          <button
            onClick={() => setUser(null)}
            className="bg-white text-gray-900 px-4 py-2 rounded-lg flex items-center gap-2 font-semibold hover:bg-gray-200 transition"
          >
            <LogOut size={20} /> Salir
          </button>
        </div>
        <div className="p-4 sm:p-8 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-green-500">
              <p className="text-gray-500 font-semibold flex items-center gap-2">
                <CreditCard size={18} /> Ventas Totales
              </p>
              <p className="text-4xl font-extrabold text-green-600 mt-2">
                ${totalSales.toLocaleString("es-MX")}
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-blue-500">
              <p className="text-gray-500 font-semibold flex items-center gap-2">
                <ShoppingCart size={18} /> Pedidos Activos
              </p>
              <p className="text-4xl font-extrabold text-blue-600 mt-2">
                {orders.length}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {pendingOrders} pendientes
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-red-500">
              <p className="text-gray-500 font-semibold flex items-center gap-2">
                <Tag size={18} /> Productos en Venta
              </p>
              <p className="text-4xl font-extrabold text-red-600 mt-2">
                {products.length}
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">
              Detalle de Pedidos
            </h2>
            {orders.length === 0 ? (
              <p className="text-gray-500 text-center py-6">
                Aún no hay pedidos registrados.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Peso
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Método
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((o) => (
                      <tr key={o._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{o._id.slice(-6)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {o.customer.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">
                          ${o.total}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                          {o.weight}kg
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {o.method === "delivery" ? "Local" : "Paquetería"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              o.status === "delivered"
                                ? "bg-green-100 text-green-800"
                                : o.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VISTA: CLIENTE (CUSTOMER)
  // ==========================================
  return (
    <div className="min-h-screen bg-black text-white">
      {message && <MessageToast message={message} onClose={() => setMessage(null)} />}
      
      <header className="sticky top-0 bg-gradient-to-r from-red-900 to-black border-b border-red-800 shadow-2xl z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="text-5xl">🥩</div>
              <div>
                <h1 className="text-3xl font-extrabold text-red-500">Estrella Beef</h1>
                <p className="text-xs text-gray-400">La mejor carne premium a domicilio</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm hidden sm:block text-gray-300">
                Hola, {user.name.split(" ")[0]}
              </span>
              <button onClick={() => setUser(null)} className="bg-gray-800 p-2 rounded-full hover:bg-red-600 transition">
                <LogOut size={20} />
              </button>
              <button onClick={() => setShowCart(true)} className="relative bg-red-600 p-3 rounded-full shadow-lg">
                <ShoppingCart size={24} />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                    {cart.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
          <div className="flex gap-3 mt-4 overflow-x-auto py-2">
            {categories.map((c) => (
              <button 
                key={c} 
                onClick={() => setCategory(c)} 
                className={`px-5 py-2 rounded-full whitespace-nowrap font-semibold ${
                  category === c ? "bg-red-600 text-white" : "bg-gray-800 text-gray-300"
                }`}
              >
                {c === "Promociones" && "🔥 "}{c}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="bg-gradient-to-r from-red-900 to-black py-16 text-center">
        <h2 className="text-4xl font-extrabold mb-4">Cortes Premium a Domicilio</h2>
        <p className="text-lg text-red-300">¡Calidad de restaurante en tu parrilla!</p>
        <div className="flex justify-center gap-8 mt-6">
          <div className="flex items-center gap-2"><Clock size={20} className="text-yellow-400" /> Entrega Rápida</div>
          <div className="flex items-center gap-2"><CheckCircle size={20} className="text-green-400" /> Máxima Frescura</div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <h3 className="text-3xl font-extrabold mb-8 text-red-500">{category}</h3>
        {filtered.length === 0 ? (
          <p className="text-center text-gray-500 py-12">Cargando productos...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((p) => (
              <div key={p._id} className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:scale-105 transition">
                <div className="relative h-48">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  {p.promo && (
                    <div className="absolute top-2 right-2 bg-yellow-500 px-3 py-1 rounded-full text-xs font-bold text-black">
                      OFERTA
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-lg mb-2">{p.name}</h4>
                  <div className="mb-3">
                    <span className="text-3xl font-bold text-red-500">${p.price}</span>
                    <span className="text-sm text-gray-400">/kg</span>
                  </div>
                  <button
                    onClick={() => addToCart(p)}
                    disabled={p.stock === 0}
                    className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 disabled:opacity-50 py-3 rounded-xl font-bold"
                  >
                    {p.stock === 0 ? "Agotado" : "Añadir al Carrito"}
                  </button>
                  <p className="text-xs text-gray-500 mt-2 text-center">Stock: {p.stock}kg</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal del Carrito */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 w-full max-w-2xl rounded-3xl border border-red-800 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-red-900 to-black">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-red-500 flex items-center gap-3">Tu Carrito <ShoppingCart /></h3>
                <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-white bg-gray-800 p-2 rounded-full">
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-7xl mb-4">🛒</div>
                  <p className="text-gray-400 text-xl font-semibold">¡Aún no has agregado nada!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((i) => (
                    <div key={i.id} className="flex gap-4 bg-gray-800 p-4 rounded-xl items-center">
                      <img src={i.image} alt={i.name} className="w-16 h-16 object-cover rounded-lg" />
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">{i.name}</h4>
                        <p className="text-sm text-gray-400">${i.price}/kg</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(i.id, i.quantity - 1)} className="bg-gray-700 w-8 h-8 rounded-full hover:bg-red-600">-</button>
                        <span className="font-bold w-6 text-center">{i.quantity}</span>
                        <button onClick={() => updateQty(i.id, i.quantity + 1)} className="bg-red-600 w-8 h-8 rounded-full hover:bg-red-700">+</button>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-500 text-lg">${(i.price * i.quantity).toFixed(2)}</p>
                        <button onClick={() => updateQty(i.id, 0)} className="text-gray-500 hover:text-red-500 mt-1"><X size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-800">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-gray-400">
                    <span>Peso total:</span>
                    <span className="font-semibold">{weight.toFixed(1)} kg</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Método:</span>
                    <span className="font-semibold text-yellow-400">{weight > 50 ? "📦 Paquetería" : "🚴 Local"}</span>
                  </div>
                  <div className="flex justify-between text-3xl font-bold text-red-500 pt-3 border-t">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
                <button onClick={() => setShowCheckout(true)} className="w-full bg-gradient-to-r from-red-600 to-red-800 py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                  Proceder a Pagar <CreditCard size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Checkout */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-[90] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gray-900 max-w-2xl w-full rounded-2xl border border-red-800 my-8">
            <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-red-900 to-black flex justify-between items-center">
              <h3 className="text-2xl font-bold text-red-500 flex items-center gap-3">Finalizar Compra <Send /></h3>
              <button onClick={() => setShowCheckout(false)} className="text-gray-400 hover:text-white bg-gray-800 p-2 rounded-full">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-8">
              <div className="p-4 bg-gray-800 rounded-xl">
                <h4 className="font-bold text-xl mb-4 text-red-400 flex items-center gap-2"><MapPin /> Datos de Entrega</h4>
                <div className="space-y-3">
                  <input 
                    type="text" 
                    placeholder="Nombre Completo" 
                    value={delivery.name} 
                    onChange={(e) => setDelivery({ ...delivery, name: e.target.value })} 
                    className="w-full p-3 bg-gray-700 rounded-lg text-white focus:border-red-500 outline-none" 
                  />
                  <input 
                    type="text" 
                    placeholder="Dirección Completa" 
                    value={delivery.address} 
                    onChange={(e) => setDelivery({ ...delivery, address: e.target.value })} 
                    className="w-full p-3 bg-gray-700 rounded-lg text-white focus:border-red-500 outline-none" 
                  />
                  <input 
                    type="tel" 
                    placeholder="Teléfono WhatsApp" 
                    value={delivery.phone} 
                    onChange={(e) => setDelivery({ ...delivery, phone: e.target.value })} 
                    className="w-full p-3 bg-gray-700 rounded-lg text-white focus:border-red-500 outline-none" 
                  />
                </div>
              </div>

              <div className="p-4 bg-gray-800 rounded-xl">
                <h4 className="font-bold text-xl mb-4 text-red-400 flex items-center gap-2"><CreditCard /> Método de Pago</h4>
                <div className="space-y-3">
                  {["card", "transfer", "cash"].map((m) => (
                    <button 
                      key={m} 
                      onClick={() => setPayment(m)} 
                      className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 ${
                        payment === m ? "border-red-500 bg-red-900/30" : "border-gray-700 bg-gray-700"
                      }`}
                    >
                      {m === "card" && <CreditCard size={24} className="text-red-500" />}
                      {m === "transfer" && <Phone size={24} className="text-red-500" />}
                      {m === "cash" && <User size={24} className="text-red-500" />}
                      <span className="font-semibold">
                        {m === "card" ? "Tarjeta" : m === "transfer" ? "Transferencia" : "Efectivo"}
                      </span>
                      {payment === m && <CheckIcon size={20} className="text-green-400 ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-xl border-2 border-red-600">
                <h4 className="text-xl font-bold mb-3 text-red-500">Resumen del Pedido</h4>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Subtotal ({cart.length} productos):</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Envío:</span>
                  <span className="text-green-500 font-semibold">GRATIS</span>
                </div>
                <div className="flex justify-between text-3xl font-extrabold text-yellow-400 pt-3 border-t mt-3">
                  <span>TOTAL:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <button 
                onClick={createOrder} 
                disabled={loading} 
                className="w-full bg-gradient-to-r from-green-600 to-green-800 py-4 rounded-xl font-bold text-xl disabled:opacity-50 flex items-center justify-center gap-3"
              >
                <CheckIcon size={24} /> {loading ? "Procesando..." : "FINALIZAR Y PAGAR"}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-gray-900 border-t border-red-900 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-2xl font-bold text-red-500 mb-4">Estrella Beef</p>
          <div className="flex justify-center gap-6 mb-6 text-gray-400">
            <div className="flex items-center gap-2"><Phone size={18} className="text-red-500" /><span className="text-white">33 1234 5678</span></div>
            <div className="flex items-center gap-2"><Mail size={18} className="text-red-500" /><span className="text-white">ventas@estrellabeef.com</span></div>
            <div className="flex items-center gap-2"><MapPin size={18} className="text-red-500" /><span className="text-white">Guadalajara, Jalisco</span></div>
          </div>
          <p className="text-gray-600 text-xs">© 2025 Carnicería Estrella Beef</p>
        </div>
      </footer>
    </div>
  );
}

export default App;