"use client";

/**
 * PÁGINA PRINCIPAL MODULARIZADA - PANADERÍA ARTESANAL
 * Archivo reducido (~500 líneas) que importa vistas separadas
 * Las rutas de API y funciones se mantienen sin cambios
 */

import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

//Importar vistas modulares (ubicar en src/components/views/)
import LoginView from "@/components/LoginView";
import CustomerView from "@/components/CustomerView";
import AdminView from "@/components/AdminView";
import DeliveryView from "@/components/DeliveryView";
import ShippingView from "@/components/ShippingView";

// NOTA: Descomenta las importaciones arriba cuando copies los archivos
// Por ahora el código funciona sin modularizar

function App() {
  // ========== ESTADOS ==========
  const [darkMode, setDarkMode] = useState(false);
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
  const [loading, setLoading] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    weight: 1,
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

  // ========== EFECTOS ==========
  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  useEffect(() => {
    if (show2FAModal && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      toast.error("El código ha expirado");
      setShow2FAModal(false);
    }
  }, [show2FAModal, countdown]);

  // ========== FUNCIONES API (sin cambios) ==========
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
    toast.success(`${p.name} agregado al carrito`);
  };

  const updateQty = (id, qty) => {
    if (qty <= 0) setCart(cart.filter((i) => i.id !== id));
    else setCart(cart.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
  };

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
        if (data.requires2FA) {
          setTempUserId(data.userId);
          setShow2FAModal(true);
          setCountdown(600);
          toast.success("Código enviado a tu correo");
        } else {
          setUser(data.user);
          toast.success(`Bienvenido, ${data.user.name}`);
        }
      } else {
        toast.error(data.message || "Error al iniciar sesión");
      }
    } catch (error) {
      toast.error("Error en el servidor");
    } finally {
      setLoading(false);
    }
  };

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
        toast.success(`Bienvenido, ${data.user.name}`);
      } else {
        toast.error(data.message || "Código incorrecto");
      }
    } catch (error) {
      toast.error("Error en el servidor");
    } finally {
      setLoading(false);
    }
  };

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
        toast.success("Cuenta creada exitosamente");
        setShowRegisterModal(false);
        setRegisterForm({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          phone: "",
        });
      } else {
        toast.error(data.message || "Error al registrar");
      }
    } catch (error) {
      toast.error("Error en el servidor");
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async () => {
    if (!forgotEmail) {
      toast.error("Ingresa tu correo electrónico");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Código enviado a tu correo");
        setShowForgotModal(false);
      } else {
        toast.error(data.message || "Error al enviar código");
      }
    } catch (error) {
      toast.error("Error en el servidor");
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async () => {
    if (!delivery.name || !delivery.address || !delivery.phone) {
      toast.error("Completa los datos de entrega");
      return;
    }
    if (!payment) {
      toast.error("Selecciona un método de pago");
      return;
    }

    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const weight = cart.reduce((s, i) => s + i.weight * i.quantity, 0);

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
          delivery,
          payment,
          method: weight > 50 ? "shipping" : "delivery",
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("¡Pedido creado exitosamente!");
        setCart([]);
        setShowCart(false);
        setShowCheckout(false);
        setDelivery({ name: "", address: "", phone: "" });
        setPayment("");
        fetchOrders();
      } else {
        toast.error(data.message || "Error al crear pedido");
      }
    } catch (error) {
      toast.error("Error en el servidor");
    } finally {
      setLoading(false);
    }
  };

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
        toast.error("Error al actualizar");
      }
    } catch (error) {
      toast.error("Error en el servidor");
    }
  };

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
        category: "Pan Dulce",
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

      const res = await fetch(url, {
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
        toast.error(data.message || "Error al guardar producto");
      }
    } catch (error) {
      toast.error("Error en el servidor");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm("¿Eliminar este producto?")) return;
    try {
      const res = await fetch("/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Producto eliminado");
        fetchProducts();
      } else {
        toast.error("Error al eliminar");
      }
    } catch (error) {
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
    } catch (error) {
      toast.error("Error al generar reporte");
    }
  };
  // ========== RENDERIZADO CONDICIONAL ==========
  if (!user) {
    return (
      <LoginView
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        handleLogin={login}
        loading={loading}
      />
    );
  }

  if (user.role === "delivery") {
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

  if (user.role === "shipping") {
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

  if (user.role === "admin") {
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

  // Cliente (default)
  return (
    <CustomerView
      theme={theme}
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      user={user}
      setUser={setUser}
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