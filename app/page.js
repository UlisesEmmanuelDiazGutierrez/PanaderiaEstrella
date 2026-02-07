"use client";

/**
 * PÁGINA PRINCIPAL - ESTRELLA BEEF
 *
 * Funcionalidades:
 * - Dark/Light Mode
 * - Gestión completa de productos (Admin)
 * - Reportes Excel
 * - Sistema de notificaciones
 * - 4 tipos de usuarios
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
  Moon,
  Sun,
  Plus,
  Edit,
  Trash2,
  FileSpreadsheet,
  Bell,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// ==========================================
// COMPONENTE DE MENSAJES (Toast mejorado)
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
  const [darkMode, setDarkMode] = useState(false); // Light mode por defecto
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [category, setCategory] = useState("Todo");
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [delivery, setDelivery] = useState({
    name: "",
    address: "",
    phone: "",
  });

  // ========== NUEVOS ESTADOS PARA 2FA Y REGISTRO ==========
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [tempUserId, setTempUserId] = useState(null);
  const [code2FA, setCode2FA] = useState("");
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [forgotEmail, setForgotEmail] = useState("");
  const [countdown, setCountdown] = useState(600);

  const [payment, setPayment] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    weight: 1,
    image: "",
    category: "Res",
    stock: "",
    promo: false,
    description: "",
  });

  // ========== THEME COLORS ==========
  const theme = {
    bg: darkMode ? "#000000" : "#ffffff",
    bgSecondary: darkMode ? "#1f2937" : "#f3f4f6",
    text: darkMode ? "#ffffff" : "#000000",
    textSecondary: darkMode ? "#9ca3af" : "#4b5563",
    primary: "#dc2626", // Rojo siempre
    primaryDark: "#991b1b",
    border: darkMode ? "#374151" : "#e5e7eb",
    card: darkMode ? "#111827" : "#ffffff",
  };

  // ========== EFECTOS ==========
  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  useEffect(() => {
    if (message && message.type === "success") {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // EFECTO PARA EL COUNTDOWN DEL CÓDIGO 2FA
  useEffect(() => {
    if (show2FAModal && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      toast.error("El código ha expirado");
      setShow2FAModal(false);
    }
  }, [show2FAModal, countdown]);

  // ========== FUNCIONES API ==========
  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      if (data.success) setProducts(data.data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      toast.error("Error al cargar productos");
    }
  };

  const fetchOrders = async () => {
    try {
      let url = "/api/orders";
      if (user.role === "customer") url += `?userId=${user.id}`;
      else if (user.role === "delivery") url += "?method=delivery";
      else if (user.role === "shipping") url += "?method=shipping";

      const response = await fetch(url);
      const data = await response.json();
      if (data.success) setOrders(data.data);
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
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

  // ========== FUNCIONES CARRITO ==========
  const addToCart = (p) => {
    const exists = cart.find((i) => i.id === p._id);
    if (exists) {
      setCart(
        cart.map((i) =>
          i.id === p._id ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      );
    } else {
      setCart([
        ...cart,
        {
          id: p._id,
          name: p.name,
          price: p.price,
          weight: p.weight,
          image: p.image,
          quantity: 1,
        },
      ]);
    }
    toast.success(`Se agregó 1kg de ${p.name} al carrito`);
  };

  const updateQty = (id, qty) => {
    if (qty <= 0) setCart(cart.filter((i) => i.id !== id));
    else setCart(cart.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
  };

  // ========== FUNCIÓN LOGIN ==========
  const login = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || "Error en el servidor");
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data.success && data.require2FA) {
        setTempUserId(data.userId);
        setShow2FAModal(true);
        setCountdown(600);
        toast.success("Código enviado a tu email");
      } else if (data.success) {
        setUser(data.user);
        toast.success(`Bienvenido, ${data.user.name}`);
      } else {
        toast.error(data.error || "Credenciales incorrectas");
      }
    } catch (error) {
      console.error("Error en login:", error);
      toast.error("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  // ========== VERIFICAR CÓDIGO 2FA ==========
  const verify2FA = async () => {
    if (code2FA.length !== 6) {
      toast.error("El código debe tener 6 dígitos");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: tempUserId, code: code2FA }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || "Error al verificar código");
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setShow2FAModal(false);
        setCode2FA("");
        toast.success(`Bienvenido, ${data.user.name}`);
        setLoginForm({ email: "", password: "" });
      } else {
        toast.error(data.error || "Código inválido");
      }
    } catch (error) {
      console.error("Error en verify-2fa:", error);
      toast.error("Error al verificar código");
    } finally {
      setLoading(false);
    }
  };

  // ========== REENVIAR CÓDIGO 2FA ==========
  const resend2FA = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/resend-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: tempUserId }),
      });

      const data = await response.json();

      if (data.success) {
        setCountdown(600);
        toast.success("Nuevo código enviado");
      } else {
        toast.error(data.error || "Error al reenviar código");
      }
    } catch (error) {
      console.error("Error en resend-2fa:", error);
      toast.error("Error al reenviar código");
    } finally {
      setLoading(false);
    }
  };

  // ========== REGISTRAR USUARIO ==========
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      toast.error("Todos los campos son requeridos");
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (registerForm.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || "Error al registrar");
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data.success) {
        toast.success("¡Registro exitoso! Ya puedes iniciar sesión");
        setShowRegisterModal(false);
        setRegisterForm({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          phone: "",
        });
      } else {
        toast.error(data.error || "Error al registrar");
      }
    } catch (error) {
      console.error("Error en register:", error);
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  // ========== RECUPERAR CONTRASEÑA ==========
  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!forgotEmail) {
      toast.error("Ingresa tu email");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Revisa tu email para restablecer tu contraseña");
        setShowForgotModal(false);
        setForgotEmail("");
      } else {
        toast.error(data.error || "Error al enviar email");
      }
    } catch (error) {
      console.error("Error en forgot-password:", error);
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  // ========== LOGIN CON GOOGLE ==========
  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  // ========== FUNCIÓN CREAR PEDIDO ==========
  const createOrder = async () => {
    if (!delivery.name || !delivery.address || !delivery.phone || !payment) {
      toast.error("Por favor, completa todos los datos");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        toast.success(`Pedido creado! Te contactaremos al: ${delivery.phone}`);
        setCart([]);
        setShowCart(false);
        setShowCheckout(false);
        setDelivery({ name: "", address: "", phone: "" });
        setPayment("");
        fetchProducts();
        fetchOrders();
      } else {
        toast.error(data.error || "Error al crear pedido");
      }
    } catch (error) {
      toast.error("Error al crear pedido");
    } finally {
      setLoading(false);
    }
  };

  // ========== FUNCIÓN ACTUALIZAR ESTADO ==========
  const updateStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: newStatus,
          updatedBy: user.id,
        }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`Pedido actualizado a ${newStatus}`);
        fetchOrders();
      } else {
        toast.error(data.error || "Error al actualizar");
      }
    } catch (error) {
      toast.error("Error al actualizar pedido");
    }
  };

  // ========== FUNCIONES ADMIN - PRODUCTOS ==========
  const openProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        price: product.price,
        weight: product.weight,
        image: product.image,
        category: product.category,
        stock: product.stock,
        promo: product.promo,
        description: product.description || "",
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: "",
        price: "",
        weight: 1,
        image: "",
        category: "Res",
        stock: "",
        promo: false,
        description: "",
      });
    }
    setShowProductModal(true);
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = "/api/products";
      const method = editingProduct ? "PUT" : "POST";
      const body = editingProduct
        ? { ...productForm, id: editingProduct._id }
        : productForm;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(
          editingProduct ? "Producto actualizado" : "Producto creado",
        );
        setShowProductModal(false);
        fetchProducts();
      } else {
        toast.error(data.error || "Error al guardar producto");
      }
    } catch (error) {
      toast.error("Error al guardar producto");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;
    try {
      const response = await fetch(`/api/products?id=${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Producto eliminado");
        fetchProducts();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Error al eliminar producto");
    }
  };

  // ========== FUNCIÓN GENERAR REPORTE EXCEL ==========
  const generateReport = async (period) => {
    try {
      const year = new Date().getFullYear();
      const month = new Date().getMonth() + 1;
      const url = `/api/reports?period=${period}&year=${year}&month=${month}`;

      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `reporte_${period}_${year}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      toast.success("Reporte generado correctamente");
    } catch (error) {
      toast.error("Error al generar reporte");
    }
  };

  // ==========================================
  // VISTA: LOGIN
  // ==========================================
  // ==========================================
  // VISTA: LOGIN (REEMPLAZA desde línea ~437 hasta ~508)
  // ==========================================
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
        <Toaster position="top-right" />

        {/* Patrón de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgb(220, 38, 38) 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>

        <div className="relative w-full max-w-md">
          {/* Card principal */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header con gradiente rojo */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-8 py-10 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg">
                <div className="text-5xl">🥩</div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Estrella Beef
              </h1>
              <p className="text-red-100 text-sm">
                Carnes premium a tu alcance
              </p>
            </div>

            {/* Formulario */}
            <div className="px-8 py-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Iniciar Sesión
              </h2>

              <div className="space-y-5">
                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={loginForm.email}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, email: e.target.value })
                      }
                      className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none"
                      placeholder="tu@email.com"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <input
                      type="password"
                      value={loginForm.password}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, password: e.target.value })
                      }
                      className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none"
                      placeholder="••••••••"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                {/* Recordarme */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className="ml-2 text-gray-600">Recordarme</span>
                  </label>
                  <button
                    type="button"
                    className="text-red-600 hover:text-red-700 font-medium"
                    onClick={() =>
                      toast("Contacta al administrador", { icon: "📧" })
                    }
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                {/* Botón de Login */}
                <button
                  onClick={login}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 transform transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin h-5 w-5 mr-3"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Ingresando...
                    </span>
                  ) : (
                    "Ingresar"
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">
                    o continúa con
                  </span>
                </div>
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">
                    Google
                  </span>
                </button>

                <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="#1877F2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">
                    Facebook
                  </span>
                </button>
              </div>

              {/* Registro */}
              <p className="mt-6 text-center text-sm text-gray-600">
                ¿No tienes cuenta?{" "}
                <button
                  type="button"
                  className="font-medium text-red-600 hover:text-red-700"
                  onClick={() =>
                    toast("Contacta al administrador para crear tu cuenta", {
                      icon: "👋",
                    })
                  }
                >
                  Regístrate aquí
                </button>
              </p>
            </div>
          </div>

          {/* Cuentas de Prueba */}
          <div className="mt-6 bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-lg p-4 text-white text-xs">
            <p className="font-semibold mb-2 text-center">
              🔑 Cuentas de Prueba (Contraseña: 123)
            </p>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between bg-gray-700 bg-opacity-50 rounded px-3 py-2">
                <span>👤 Cliente:</span>
                <code className="bg-gray-900 px-2 py-1 rounded text-[10px] sm:text-xs">
                  cliente@test.com
                </code>
              </div>
              <div className="flex items-center justify-between bg-gray-700 bg-opacity-50 rounded px-3 py-2">
                <span>🚚 Repartidor:</span>
                <code className="bg-gray-900 px-2 py-1 rounded text-[10px] sm:text-xs">
                  repartidor@test.com
                </code>
              </div>
              <div className="flex items-center justify-between bg-gray-700 bg-opacity-50 rounded px-3 py-2">
                <span>📦 Paquetería:</span>
                <code className="bg-gray-900 px-2 py-1 rounded text-[10px] sm:text-xs">
                  paqueteria@test.com
                </code>
              </div>
              <div className="flex items-center justify-between bg-gray-700 bg-opacity-50 rounded px-3 py-2">
                <span>👨‍💼 Admin:</span>
                <code className="bg-gray-900 px-2 py-1 rounded text-[10px] sm:text-xs">
                  admin@test.com
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (user.role === "shipping") {
    return (
      <div
        className="min-h-screen"
        style={{ backgroundColor: theme.bg, color: theme.text }}
      >
        <Toaster position="top-right" />
        <div
          className="p-4 flex justify-between items-center shadow-lg"
          style={{ backgroundColor: "#7c3aed" }}
        >
          <div className="flex items-center gap-3">
            <Package size={30} className="text-purple-300" />
            <div>
              <h1 className="text-2xl font-bold text-white">
                Portal Paquetería
              </h1>
              <p className="text-sm text-purple-200">{user.name}</p>
            </div>
          </div>
          <button
            onClick={() => setUser(null)}
            className="bg-white text-purple-900 px-4 py-2 rounded-lg font-semibold"
          >
            <LogOut size={20} />
          </button>
        </div>
        <div className="p-4 sm:p-8 max-w-4xl mx-auto">
          <h2
            className="text-3xl font-extrabold mb-6 text-purple-400 border-b pb-2"
            style={{ borderColor: theme.border }}
          >
            Pedidos de Alto Volumen (+50kg)
          </h2>
          {orders.length === 0 && (
            <p
              className="text-center p-8"
              style={{ color: theme.textSecondary }}
            >
              No hay pedidos pendientes
            </p>
          )}
          <div className="space-y-6">
            {orders.map((o) => (
              <div
                key={o._id}
                className="p-6 rounded-xl shadow-lg border-l-4 border-purple-500"
                style={{ backgroundColor: theme.card }}
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-bold text-purple-400">
                    Envío #{o._id.slice(-6)}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      o.status === "delivered"
                        ? "bg-green-500"
                        : o.status === "transit"
                          ? "bg-yellow-500 text-gray-900"
                          : "bg-gray-600"
                    }`}
                  >
                    {o.status.toUpperCase()}
                  </span>
                </div>
                <div
                  className="space-y-1 text-sm mb-4"
                  style={{ color: theme.textSecondary }}
                >
                  <p>
                    <User size={16} className="inline" /> Cliente:{" "}
                    <span className="font-semibold">{o.customer.name}</span>
                  </p>
                  <p>
                    <Tag size={16} className="inline" /> Total:{" "}
                    <span className="text-green-400 font-bold">${o.total}</span>
                  </p>
                  <p>
                    <Package size={16} className="inline" /> Peso:{" "}
                    <span className="text-red-400 font-bold">{o.weight}kg</span>
                  </p>
                </div>
                <div
                  className="flex gap-3 mt-4 pt-4 border-t"
                  style={{ borderColor: theme.border }}
                >
                  {o.status === "pending" && (
                    <button
                      onClick={() => updateStatus(o._id, "picked")}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
                    >
                      En Bodega
                    </button>
                  )}
                  {o.status === "picked" && (
                    <button
                      onClick={() => updateStatus(o._id, "transit")}
                      className="bg-yellow-600 hover:bg-yellow-700 text-gray-900 px-4 py-2 rounded-lg font-semibold"
                    >
                      En Ruta
                    </button>
                  )}
                  {o.status === "transit" && (
                    <button
                      onClick={() => updateStatus(o._id, "delivered")}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
                    >
                      Entregado
                    </button>
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
      <div
        className="min-h-screen"
        style={{ backgroundColor: theme.bgSecondary }}
      >
        <Toaster position="top-right" />

        {/* Header */}
        <div
          className="p-4 flex justify-between items-center shadow-lg"
          style={{ backgroundColor: theme.card, color: theme.text }}
        >
          <div className="flex items-center gap-3">
            <User size={30} style={{ color: theme.primary }} />
            <div>
              <h1 className="text-2xl font-bold">Panel de Administración</h1>
              <p className="text-sm" style={{ color: theme.textSecondary }}>
                {user.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full"
              style={{ backgroundColor: theme.bgSecondary }}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setUser(null)}
              className="px-4 py-2 rounded-lg font-semibold"
              style={{ backgroundColor: theme.bgSecondary }}
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div
              className="p-6 rounded-xl shadow-lg border-b-4 border-green-500"
              style={{ backgroundColor: theme.card }}
            >
              <p
                className="font-semibold flex items-center gap-2"
                style={{ color: theme.textSecondary }}
              >
                <CreditCard size={18} /> Ventas Totales
              </p>
              <p className="text-4xl font-extrabold text-green-600 mt-2">
                ${totalSales.toLocaleString("es-MX")}
              </p>
            </div>
            <div
              className="p-6 rounded-xl shadow-lg border-b-4 border-blue-500"
              style={{ backgroundColor: theme.card }}
            >
              <p
                className="font-semibold flex items-center gap-2"
                style={{ color: theme.textSecondary }}
              >
                <ShoppingCart size={18} /> Pedidos Activos
              </p>
              <p className="text-4xl font-extrabold text-blue-600 mt-2">
                {orders.length}
              </p>
              <p
                className="text-sm mt-1"
                style={{ color: theme.textSecondary }}
              >
                {pendingOrders} pendientes
              </p>
            </div>
            <div
              className="p-6 rounded-xl shadow-lg border-b-4"
              style={{
                backgroundColor: theme.card,
                borderColor: theme.primary,
              }}
            >
              <p
                className="font-semibold flex items-center gap-2"
                style={{ color: theme.textSecondary }}
              >
                <Tag size={18} /> Productos
              </p>
              <p
                className="text-4xl font-extrabold mt-2"
                style={{ color: theme.primary }}
              >
                {products.length}
              </p>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-wrap gap-4 mb-8">
            <button
              onClick={() => openProductModal()}
              className="px-6 py-3 rounded-lg font-bold text-white flex items-center gap-2"
              style={{ backgroundColor: theme.primary }}
            >
              <Plus size={20} /> Nuevo Producto
            </button>
            <button
              onClick={() => generateReport("all")}
              className="px-6 py-3 rounded-lg font-bold flex items-center gap-2"
              style={{ backgroundColor: theme.bgSecondary, color: theme.text }}
            >
              <FileSpreadsheet size={20} /> Reporte Total
            </button>
            <button
              onClick={() => generateReport("year")}
              className="px-6 py-3 rounded-lg font-bold flex items-center gap-2"
              style={{ backgroundColor: theme.bgSecondary, color: theme.text }}
            >
              <FileSpreadsheet size={20} /> Reporte Año
            </button>
            <button
              onClick={() => generateReport("month")}
              className="px-6 py-3 rounded-lg font-bold flex items-center gap-2"
              style={{ backgroundColor: theme.bgSecondary, color: theme.text }}
            >
              <FileSpreadsheet size={20} /> Reporte Mes
            </button>
          </div>

          {/* Tabla de Productos */}
          <div
            className="p-6 rounded-xl shadow-lg mb-8"
            style={{ backgroundColor: theme.card }}
          >
            <h2
              className="text-2xl font-bold mb-4 border-b pb-2"
              style={{ color: theme.text, borderColor: theme.border }}
            >
              Gestión de Productos
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr style={{ borderColor: theme.border }}>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium uppercase"
                      style={{ color: theme.textSecondary }}
                    >
                      Imagen
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium uppercase"
                      style={{ color: theme.textSecondary }}
                    >
                      Nombre
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium uppercase"
                      style={{ color: theme.textSecondary }}
                    >
                      Precio
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium uppercase"
                      style={{ color: theme.textSecondary }}
                    >
                      Stock
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium uppercase"
                      style={{ color: theme.textSecondary }}
                    >
                      Categoría
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium uppercase"
                      style={{ color: theme.textSecondary }}
                    >
                      Promo
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium uppercase"
                      style={{ color: theme.textSecondary }}
                    >
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr
                      key={p._id}
                      className="border-t"
                      style={{ borderColor: theme.border }}
                    >
                      <td className="px-4 py-4">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      </td>
                      <td className="px-4 py-4" style={{ color: theme.text }}>
                        {p.name}
                      </td>
                      <td
                        className="px-4 py-4 font-bold"
                        style={{ color: theme.primary }}
                      >
                        ${p.price}
                      </td>
                      <td className="px-4 py-4" style={{ color: theme.text }}>
                        {p.stock}kg
                      </td>
                      <td className="px-4 py-4" style={{ color: theme.text }}>
                        {p.category}
                      </td>
                      <td className="px-4 py-4">
                        {p.promo ? (
                          <span className="px-2 py-1 bg-yellow-500 text-black text-xs rounded-full font-bold">
                            SÍ
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-500 text-white text-xs rounded-full">
                            NO
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openProductModal(p)}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-100"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => deleteProduct(p._id)}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-100"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabla de Pedidos */}
          <div
            className="p-6 rounded-xl shadow-lg"
            style={{ backgroundColor: theme.card }}
          >
            <h2
              className="text-2xl font-bold mb-4 border-b pb-2"
              style={{ color: theme.text, borderColor: theme.border }}
            >
              Detalle de Pedidos
            </h2>
            {orders.length === 0 ? (
              <p
                className="text-center py-6"
                style={{ color: theme.textSecondary }}
              >
                Aún no hay pedidos
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr style={{ borderColor: theme.border }}>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium uppercase"
                        style={{ color: theme.textSecondary }}
                      >
                        ID
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium uppercase"
                        style={{ color: theme.textSecondary }}
                      >
                        Cliente
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium uppercase"
                        style={{ color: theme.textSecondary }}
                      >
                        Total
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium uppercase"
                        style={{ color: theme.textSecondary }}
                      >
                        Peso
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium uppercase"
                        style={{ color: theme.textSecondary }}
                      >
                        Método
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium uppercase"
                        style={{ color: theme.textSecondary }}
                      >
                        Estado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr
                        key={o._id}
                        className="border-t"
                        style={{ borderColor: theme.border }}
                      >
                        <td className="px-6 py-4" style={{ color: theme.text }}>
                          #{o._id.slice(-6)}
                        </td>
                        <td className="px-6 py-4" style={{ color: theme.text }}>
                          {o.customer.name}
                        </td>
                        <td className="px-6 py-4 font-bold text-green-600">
                          ${o.total}
                        </td>
                        <td className="px-6 py-4 text-red-600">{o.weight}kg</td>
                        <td className="px-6 py-4" style={{ color: theme.text }}>
                          {o.method === "delivery" ? "Local" : "Paquetería"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${
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

        {/* Modal de Producto */}
        {showProductModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div
              className="w-full max-w-2xl rounded-2xl shadow-2xl"
              style={{ backgroundColor: theme.card }}
            >
              <div
                className="p-6 border-b"
                style={{ borderColor: theme.border }}
              >
                <div className="flex justify-between items-center">
                  <h3
                    className="text-2xl font-bold"
                    style={{ color: theme.text }}
                  >
                    {editingProduct ? "Editar Producto" : "Nuevo Producto"}
                  </h3>
                  <button
                    onClick={() => setShowProductModal(false)}
                    className="p-2 rounded-full hover:bg-gray-200"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              <form onSubmit={saveProduct} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: theme.text }}
                    >
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) =>
                        setProductForm({ ...productForm, name: e.target.value })
                      }
                      className="w-full p-3 rounded-lg border outline-none"
                      style={{
                        backgroundColor: theme.bgSecondary,
                        color: theme.text,
                        borderColor: theme.border,
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: theme.text }}
                    >
                      Precio ($/kg)
                    </label>
                    <input
                      type="number"
                      value={productForm.price}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          price: e.target.value,
                        })
                      }
                      className="w-full p-3 rounded-lg border outline-none"
                      style={{
                        backgroundColor: theme.bgSecondary,
                        color: theme.text,
                        borderColor: theme.border,
                      }}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: theme.text }}
                    >
                      Peso (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={productForm.weight}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          weight: e.target.value,
                        })
                      }
                      className="w-full p-3 rounded-lg border outline-none"
                      style={{
                        backgroundColor: theme.bgSecondary,
                        color: theme.text,
                        borderColor: theme.border,
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: theme.text }}
                    >
                      Stock (kg)
                    </label>
                    <input
                      type="number"
                      value={productForm.stock}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          stock: e.target.value,
                        })
                      }
                      className="w-full p-3 rounded-lg border outline-none"
                      style={{
                        backgroundColor: theme.bgSecondary,
                        color: theme.text,
                        borderColor: theme.border,
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-2"
                      style={{ color: theme.text }}
                    >
                      Categoría
                    </label>
                    <select
                      value={productForm.category}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          category: e.target.value,
                        })
                      }
                      className="w-full p-3 rounded-lg border outline-none"
                      style={{
                        backgroundColor: theme.bgSecondary,
                        color: theme.text,
                        borderColor: theme.border,
                      }}
                      required
                    >
                      <option value="Res">Res</option>
                      <option value="Cerdo">Cerdo</option>
                      <option value="Cortes">Cortes</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: theme.text }}
                  >
                    URL de Imagen
                  </label>
                  <input
                    type="url"
                    value={productForm.image}
                    onChange={(e) =>
                      setProductForm({ ...productForm, image: e.target.value })
                    }
                    className="w-full p-3 rounded-lg border outline-none"
                    style={{
                      backgroundColor: theme.bgSecondary,
                      color: theme.text,
                      borderColor: theme.border,
                    }}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    required
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: theme.text }}
                  >
                    Descripción
                  </label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full p-3 rounded-lg border outline-none"
                    style={{
                      backgroundColor: theme.bgSecondary,
                      color: theme.text,
                      borderColor: theme.border,
                    }}
                    rows="3"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="promo"
                    checked={productForm.promo}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        promo: e.target.checked,
                      })
                    }
                    className="w-5 h-5"
                  />
                  <label
                    htmlFor="promo"
                    className="text-sm font-medium"
                    style={{ color: theme.text }}
                  >
                    Marcar como promoción
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 rounded-lg font-bold text-white"
                    style={{ backgroundColor: theme.primary }}
                  >
                    {loading
                      ? "Guardando..."
                      : editingProduct
                        ? "Actualizar"
                        : "Crear Producto"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="px-6 py-3 rounded-lg font-bold"
                    style={{
                      backgroundColor: theme.bgSecondary,
                      color: theme.text,
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VISTA: CLIENTE
  // ==========================================
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: theme.bg, color: theme.text }}
    >
      <Toaster position="top-right" />

      {/* Header */}
      <header
        className="sticky top-0 border-b shadow-2xl z-50"
        style={{ backgroundColor: theme.card, borderColor: theme.border }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="text-5xl">🥩</div>
              <div>
                <h1
                  className="text-3xl font-extrabold"
                  style={{ color: theme.primary }}
                >
                  Estrella Beef
                </h1>
                <p className="text-xs" style={{ color: theme.textSecondary }}>
                  La mejor carne premium a domicilio
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full"
                style={{ backgroundColor: theme.bgSecondary }}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <span
                className="text-sm hidden sm:block"
                style={{ color: theme.textSecondary }}
              >
                Hola, {user.name.split(" ")[0]}
              </span>
              <button
                onClick={() => setUser(null)}
                className="p-2 rounded-full"
                style={{ backgroundColor: theme.bgSecondary }}
              >
                <LogOut size={20} />
              </button>
              <button
                onClick={() => setShowCart(true)}
                className="relative p-3 rounded-full"
                style={{ backgroundColor: theme.primary }}
              >
                <ShoppingCart size={24} className="text-white" />
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
                className="px-5 py-2 rounded-full whitespace-nowrap font-semibold transition"
                style={{
                  backgroundColor:
                    category === c ? theme.primary : theme.bgSecondary,
                  color: category === c ? "#ffffff" : theme.text,
                }}
              >
                {c === "Promociones" && "🔥 "}
                {c}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Banner */}
      <div
        className="py-16 text-center border-b"
        style={{ backgroundColor: theme.card, borderColor: theme.border }}
      >
        <h2
          className="text-4xl font-extrabold mb-4"
          style={{ color: theme.text }}
        >
          Cortes Premium a Domicilio
        </h2>
        <p className="text-lg" style={{ color: theme.primary }}>
          ¡Calidad de restaurante en tu parrilla!
        </p>
        <div className="flex justify-center gap-8 mt-6">
          <div
            className="flex items-center gap-2"
            style={{ color: theme.textSecondary }}
          >
            <Clock size={20} style={{ color: theme.primary }} /> Entrega Rápida
          </div>
          <div
            className="flex items-center gap-2"
            style={{ color: theme.textSecondary }}
          >
            <CheckCircle size={20} className="text-green-400" /> Máxima Frescura
          </div>
        </div>
      </div>

      {/* Productos */}
      <div className="container mx-auto px-4 py-12">
        <h3
          className="text-3xl font-extrabold mb-8"
          style={{ color: theme.primary }}
        >
          {category}
        </h3>
        {filtered.length === 0 ? (
          <p
            className="text-center py-12"
            style={{ color: theme.textSecondary }}
          >
            Cargando productos...
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((p) => (
              <div
                key={p._id}
                className="rounded-2xl overflow-hidden border hover:scale-105 transition shadow-lg"
                style={{
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                }}
              >
                <div className="relative h-48">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                  {p.promo && (
                    <div className="absolute top-2 right-2 bg-yellow-500 px-3 py-1 rounded-full text-xs font-bold text-black">
                      OFERTA
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4
                    className="font-bold text-lg mb-2"
                    style={{ color: theme.text }}
                  >
                    {p.name}
                  </h4>
                  <div className="mb-3">
                    <span
                      className="text-3xl font-bold"
                      style={{ color: theme.primary }}
                    >
                      ${p.price}
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: theme.textSecondary }}
                    >
                      /kg
                    </span>
                  </div>
                  <button
                    onClick={() => addToCart(p)}
                    disabled={p.stock === 0}
                    className="w-full py-3 rounded-xl font-bold text-white disabled:opacity-50"
                    style={{ backgroundColor: theme.primary }}
                  >
                    {p.stock === 0 ? "Agotado" : "Añadir al Carrito"}
                  </button>
                  <p
                    className="text-xs text-center mt-2"
                    style={{ color: theme.textSecondary }}
                  >
                    Stock: {p.stock}kg
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Carrito */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div
            className="w-full max-w-2xl rounded-3xl border max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            style={{ backgroundColor: theme.card, borderColor: theme.primary }}
          >
            <div className="p-6 border-b" style={{ borderColor: theme.border }}>
              <div className="flex justify-between items-center">
                <h3
                  className="text-2xl font-bold flex items-center gap-3"
                  style={{ color: theme.primary }}
                >
                  Tu Carrito <ShoppingCart />
                </h3>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 rounded-full"
                  style={{ backgroundColor: theme.bgSecondary }}
                >
                  <X size={24} />
                </button>
              </div>
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
                        <h4
                          className="font-bold text-lg"
                          style={{ color: theme.text }}
                        >
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
                          onClick={() => updateQty(i.id, i.quantity - 1)}
                          className="w-8 h-8 rounded-full text-white"
                          style={{ backgroundColor: theme.primary }}
                        >
                          -
                        </button>
                        <span className="font-bold w-6 text-center">
                          {i.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(i.id, i.quantity + 1)}
                          className="w-8 h-8 rounded-full text-white"
                          style={{ backgroundColor: theme.primary }}
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <p
                          className="font-bold text-lg"
                          style={{ color: theme.primary }}
                        >
                          ${(i.price * i.quantity).toFixed(2)}
                        </p>
                        <button
                          onClick={() => updateQty(i.id, 0)}
                          style={{ color: theme.textSecondary }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {cart.length > 0 && (
              <div
                className="p-6 border-t"
                style={{ borderColor: theme.border }}
              >
                <div className="space-y-2 mb-4">
                  <div
                    className="flex justify-between"
                    style={{ color: theme.textSecondary }}
                  >
                    <span>Peso total:</span>
                    <span className="font-semibold">
                      {weight.toFixed(1)} kg
                    </span>
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
                  onClick={() => setShowCheckout(true)}
                  className="w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2"
                  style={{ backgroundColor: theme.primary }}
                >
                  Proceder a Pagar <CreditCard size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Checkout */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[90] flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="max-w-2xl w-full rounded-2xl border my-8 shadow-2xl"
            style={{ backgroundColor: theme.card, borderColor: theme.primary }}
          >
            <div
              className="p-6 border-b flex justify-between items-center"
              style={{ borderColor: theme.border }}
            >
              <h3
                className="text-2xl font-bold flex items-center gap-3"
                style={{ color: theme.primary }}
              >
                Finalizar Compra <Send />
              </h3>
              <button
                onClick={() => setShowCheckout(false)}
                className="p-2 rounded-full"
                style={{ backgroundColor: theme.bgSecondary }}
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-8">
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
                    className="w-full p-3 rounded-lg border outline-none"
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
                    className="w-full p-3 rounded-lg border outline-none"
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
                    className="w-full p-3 rounded-lg border outline-none"
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
                  {["card", "transfer", "cash"].map((m) => (
                    <button
                      key={m}
                      onClick={() => setPayment(m)}
                      className="w-full p-4 rounded-xl border-2 flex items-center gap-3 transition"
                      style={{
                        borderColor:
                          payment === m ? theme.primary : theme.border,
                        backgroundColor:
                          payment === m ? `${theme.primary}20` : theme.bg,
                      }}
                    >
                      {m === "card" && (
                        <CreditCard
                          size={24}
                          style={{ color: theme.primary }}
                        />
                      )}
                      {m === "transfer" && (
                        <Phone size={24} style={{ color: theme.primary }} />
                      )}
                      {m === "cash" && (
                        <User size={24} style={{ color: theme.primary }} />
                      )}
                      <span
                        className="font-semibold"
                        style={{ color: theme.text }}
                      >
                        {m === "card"
                          ? "Tarjeta"
                          : m === "transfer"
                            ? "Transferencia"
                            : "Efectivo"}
                      </span>
                      {payment === m && (
                        <CheckIcon
                          size={20}
                          className="text-green-400 ml-auto"
                        />
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
                  Resumen del Pedido
                </h4>
                <div
                  className="flex justify-between mb-2"
                  style={{ color: theme.textSecondary }}
                >
                  <span>Subtotal ({cart.length} productos):</span>
                  <span style={{ color: theme.text }}>${total.toFixed(2)}</span>
                </div>
                <div
                  className="flex justify-between mb-2"
                  style={{ color: theme.textSecondary }}
                >
                  <span>Envío:</span>
                  <span className="text-green-500 font-semibold">GRATIS</span>
                </div>
                <div
                  className="flex justify-between text-3xl font-extrabold pt-3 border-t mt-3"
                  style={{ color: theme.primary, borderColor: theme.border }}
                >
                  <span>TOTAL:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={createOrder}
                disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-xl text-white disabled:opacity-50 flex items-center justify-center gap-3"
                style={{ backgroundColor: "#16a34a" }}
              >
                <CheckIcon size={24} />{" "}
                {loading ? "Procesando..." : "FINALIZAR Y PAGAR"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer
        className="border-t py-8 mt-16"
        style={{ backgroundColor: theme.card, borderColor: theme.border }}
      >
        <div className="container mx-auto px-4 text-center">
          <p
            className="text-2xl font-bold mb-4"
            style={{ color: theme.primary }}
          >
            Estrella Beef
          </p>
          <div
            className="flex justify-center gap-6 mb-6"
            style={{ color: theme.textSecondary }}
          >
            <div className="flex items-center gap-2">
              <Phone size={18} style={{ color: theme.primary }} />
              <span style={{ color: theme.text }}>33 1234 5678</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={18} style={{ color: theme.primary }} />
              <span style={{ color: theme.text }}>ventas@estrellabeef.com</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={18} style={{ color: theme.primary }} />
              <span style={{ color: theme.text }}>Guadalajara, Jalisco</span>
            </div>
          </div>
          <p className="text-xs" style={{ color: theme.textSecondary }}>
            © 2025 Carnicería Estrella Beef
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
