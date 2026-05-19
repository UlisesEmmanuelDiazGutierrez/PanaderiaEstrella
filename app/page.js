"use client";

/**
 * PÁGINA PRINCIPAL MODULARIZADA - PANADERÍA ARTESANAL
 * Archivo orquestador que importa vistas separadas.
 */

import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

import LoginView from "@/components/LoginView";
import CustomerView from "@/components/CustomerView";
import AdminView from "@/components/AdminView";
import DeliveryView from "@/components/DeliveryView";
import ShippingView from "@/components/ShippingView";

// Normaliza _id (Mongo) → id (Supabase), soporta ambos
const getId = (obj) => obj?.id ?? obj?._id;

function App() {
  // ========== ESTADOS ==========
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [hydrated, setHydrated] = useState(false);
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

  // ── Registro ──────────────────────────────────────────────────────────────
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });

  // ── Recuperar contraseña ──────────────────────────────────────────────────
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  // ── 2FA ───────────────────────────────────────────────────────────────────
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [tempUserId, setTempUserId] = useState(null);
  const [code2FA, setCode2FA] = useState("");
  const [countdown, setCountdown] = useState(600);

  const [payment, setPayment] = useState("");
  const [loading, setLoading] = useState(false);

  // ── Formulario de producto ────────────────────────────────────────────────
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    weight: 0.5,
    image: "",
    category: "Pan Dulce",
    stock: "",
    promo: false,
    description: "",
  });

  // ========== THEME ==========
  const theme = {
    bg: darkMode ? "#000000" : "#ffffff",
    bgSecondary: darkMode ? "#1f2937" : "#f3f4f6",
    text: darkMode ? "#ffffff" : "#000000",
    textSecondary: darkMode ? "#9ca3af" : "#4b5563",
    primary: "#d97706",
    primaryDark: "#92400e",
    border: darkMode ? "#374151" : "#e5e7eb",
    card: darkMode ? "#111827" : "#ffffff",
  };

  // ========== HYDRATION / PERSISTENCIA ==========
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("pan_user");
      if (savedUser) setUser(JSON.parse(savedUser));
      const savedDark = localStorage.getItem("darkMode");
      if (savedDark === "true") setDarkMode(true);
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (user) localStorage.setItem("pan_user", JSON.stringify(user));
    else localStorage.removeItem("pan_user");
  }, [user, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode, hydrated]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  // ── Countdown 2FA ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (show2FAModal && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (show2FAModal && countdown === 0) {
      toast.error("El código ha expirado");
      setShow2FAModal(false);
    }
  }, [show2FAModal, countdown]);

  // ========== API ==========
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success) setProducts(data.data);
    } catch {
      toast.error("Error al cargar productos");
    }
  };

  const fetchOrders = async () => {
    try {
      let url = "/api/orders";
      if (user.role === "customer") url += `?userId=${user.id}`;
      else if (user.role === "delivery") url += "?method=delivery";
      else if (user.role === "shipping") url += "?method=shipping";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setOrders(data.data);
    } catch {
      console.error("Error al cargar pedidos");
    }
  };

  // FIX: usa getId(p) para soportar tanto _id (Mongo) como id (Supabase)
  const addToCart = (p) => {
    const pid = getId(p);
    const exists = cart.find((i) => i.id === pid);
    if (exists) {
      setCart(
        cart.map((i) =>
          i.id === pid ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      );
    } else {
      setCart([
        ...cart,
        {
          id: pid,
          name: p.name,
          price: p.price,
          weight: p.weight,
          image: p.image,
          quantity: 1,
        },
      ]);
    }
    toast.success(`Se agregó ${p.name} al carrito 🥖`);
  };

  const updateQty = (id, qty) => {
    if (qty <= 0) setCart(cart.filter((i) => i.id !== id));
    else setCart(cart.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
  };

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = async () => {
    if (!loginForm.email || !loginForm.password) {
      toast.error("Por favor completa todos los campos");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (data.success) {
        // FIX: el route devuelve "require2FA" (sin la 's'), no "requires2FA"
        if (data.require2FA) {
          setTempUserId(data.userId);
          setShow2FAModal(true);
          setCountdown(600);
          toast.success("Código enviado a tu correo");
        } else {
          setUser(data.user);
          toast.success(`Bienvenido, ${data.user.name} 🥖`);
        }
      } else {
        toast.error(data.error || data.message || "Error al iniciar sesión");
      }
    } catch {
      toast.error("Error en el servidor");
    } finally {
      setLoading(false);
    }
  };

  // ── 2FA ────────────────────────────────────────────────────────────────────
  const verify2FA = async () => {
    if (code2FA.length !== 6) {
      toast.error("Ingresa el código de 6 dígitos");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: tempUserId, code: code2FA }),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setShow2FAModal(false);
        toast.success(`Bienvenido, ${data.user.name} 🥖`);
      } else {
        toast.error(data.error || data.message || "Código incorrecto");
      }
    } catch {
      toast.error("Error en el servidor");
    } finally {
      setLoading(false);
    }
  };

  // ── Registro ───────────────────────────────────────────────────────────────
  const register = async () => {
    if (
      !registerForm.name ||
      !registerForm.email ||
      !registerForm.password ||
      !registerForm.phone
    ) {
      toast.error("Por favor completa todos los campos");
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: registerForm.name,
          email: registerForm.email,
          password: registerForm.password,
          phone: registerForm.phone,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Cuenta creada exitosamente 🎉");
        setShowRegisterModal(false);
        setRegisterForm({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          phone: "",
        });
      } else {
        toast.error(data.error || data.message || "Error al crear cuenta");
      }
    } catch {
      toast.error("Error en el servidor");
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot password ────────────────────────────────────────────────────────
  const forgotPassword = async () => {
    if (!forgotEmail) {
      toast.error("Ingresa tu correo electrónico");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Código enviado a tu correo");
        setShowForgotModal(false);
      } else {
        toast.error(data.error || data.message || "Error al enviar código");
      }
    } catch {
      toast.error("Error en el servidor");
    } finally {
      setLoading(false);
    }
  };

  // ── Crear pedido ───────────────────────────────────────────────────────────
  const createOrder = async () => {
    if (!delivery.name || !delivery.address || !delivery.phone) {
      toast.error("Completa los datos de entrega");
      return;
    }
    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const totalPiezas = cart.reduce((s, i) => s + i.quantity, 0);
    const weight = cart.reduce((s, i) => s + (i.weight ?? 0) * i.quantity, 0);

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          items: cart,
          total,
          weight,
          totalPiezas,
          delivery,
          payment: "cash",
          method: totalPiezas > 25 ? "shipping" : "delivery",
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("¡Pedido creado exitosamente! 🥖");
        setCart([]);
        setShowCart(false);
        setShowCheckout(false);
        setDelivery({ name: "", address: "", phone: "" });
        fetchOrders();
      } else {
        toast.error(data.error || data.message || "Error al crear pedido");
      }
    } catch {
      toast.error("Error en el servidor");
    } finally {
      setLoading(false);
    }
  };

  // ── Actualizar estado de pedido ────────────────────────────────────────────
  const updateStatus = async (orderId, status) => {
    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Estado actualizado");
        fetchOrders();
      } else {
        toast.error(data.error || "Error al actualizar");
      }
    } catch {
      toast.error("Error en el servidor");
    }
  };

  // ── Producto modal ─────────────────────────────────────────────────────────
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
        weight: 0.5,
        image: "",
        category: "Pan Dulce",
        stock: "",
        promo: false,
        description: "",
      });
    }
    setShowProductModal(true);
  };

  // FIX: usa getId(editingProduct) en lugar de editingProduct._id
  const saveProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = editingProduct ? "PUT" : "POST";
      const body = editingProduct
        ? { ...productForm, id: getId(editingProduct) }
        : productForm;
      const res = await fetch("/api/products", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(
          editingProduct
            ? "Producto actualizado"
            : "Producto creado exitosamente",
        );
        setShowProductModal(false);
        fetchProducts();
      } else {
        toast.error(data.error || data.message || "Error al guardar producto");
      }
    } catch {
      toast.error("Error en el servidor");
    } finally {
      setLoading(false);
    }
  };

  // FIX: manda el id en la URL (?id=X) en lugar de en el body
  // El route de productos espera: DELETE /api/products?id=X
  const deleteProduct = async (id) => {
    if (!id) {
      toast.error("ID de producto inválido");
      return;
    }
    if (!confirm("¿Eliminar este producto?")) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Producto eliminado");
        fetchProducts();
      } else {
        toast.error(data.error || "Error al eliminar");
      }
    } catch {
      toast.error("Error en el servidor");
    }
  };

  const generateReport = async (type) => {
    try {
      const res = await fetch(`/api/reports?type=${type}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte_${type}_${Date.now()}.xlsx`;
      a.click();
      toast.success("Reporte generado");
    } catch {
      toast.error("Error al generar reporte");
    }
  };

  // ========== RENDERIZADO ==========
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="text-center">
          <div className="text-5xl mb-4">🥖</div>
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (user?.role === "delivery") {
    return (
      <DeliveryView
        theme={theme}
        user={user}
        setUser={setUser}
        orders={orders}
        updateStatus={updateStatus}
      />
    );
  }

  if (user?.role === "shipping") {
    return (
      <ShippingView
        theme={theme}
        user={user}
        setUser={setUser}
        orders={orders}
        updateStatus={updateStatus}
      />
    );
  }

  if (user?.role === "admin") {
    return (
      <AdminView
        theme={theme}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        user={user}
        setUser={setUser}
        products={products}
        orders={orders}
        showProductModal={showProductModal}
        setShowProductModal={setShowProductModal}
        productForm={productForm}
        setProductForm={setProductForm}
        editingProduct={editingProduct}
        loading={loading}
        openProductModal={openProductModal}
        saveProduct={saveProduct}
        deleteProduct={deleteProduct}
        generateReport={generateReport}
      />
    );
  }

  return (
    <CustomerView
      theme={theme}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      user={user}
      setUser={setUser}
      onLoginSuccess={(userData) => setUser(userData)}
      cart={cart}
      setCart={setCart}
      products={products}
      category={category}
      setCategory={setCategory}
      showCart={showCart}
      setShowCart={setShowCart}
      showCheckout={showCheckout}
      setShowCheckout={setShowCheckout}
      delivery={delivery}
      setDelivery={setDelivery}
      payment={payment}
      setPayment={setPayment}
      loading={loading}
      addToCart={addToCart}
      updateQty={updateQty}
      createOrder={createOrder}
    />
  );
}

export default App;
