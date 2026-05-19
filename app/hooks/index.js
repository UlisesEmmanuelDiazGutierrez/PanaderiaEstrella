/**
 * hooks/index.js
 * Hooks actualizados para Supabase/PostgreSQL
 *
 * Cambios respecto a la versión MongoDB:
 *  - useCart: product._id → product._id (las APIs normalizan al mismo shape, sin cambios)
 *  - useOrders: pasa clientId (id numérico) en lugar de string ObjectId
 *  - Los estados de pedido usan los valores del CHECK:
 *      pendiente | picked | transit | delivered | cancelado
 *    (antes: pending | cancelled — mapear en el UI si hace falta)
 */

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

// ==========================================
// HOOK DE AUTENTICACIÓN
// ==========================================
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [tempUserId, setTempUserId] = useState(null);
  const [countdown, setCountdown] = useState(600);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
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
    } catch {
      toast.error("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const verify2FA = async (code) => {
    if (code.length !== 6) {
      toast.error("El código debe tener 6 dígitos");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: tempUserId, code }),
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        setShow2FAModal(false);
        toast.success(`Bienvenido, ${data.user.name}`);
      } else {
        toast.error(data.error || "Código incorrecto");
      }
    } catch {
      toast.error("Error al verificar código");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    toast.success("Sesión cerrada");
  };

  return {
    user,
    loading,
    show2FAModal,
    setShow2FAModal,
    countdown,
    setCountdown,
    login,
    verify2FA,
    logout,
  };
}

// ==========================================
// HOOK DE PRODUCTOS
// ==========================================
export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      if (data.success) setProducts(data.data);
    } catch {
      toast.error("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData) => {
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Producto creado");
        await fetchProducts();
        return true;
      }
      toast.error(data.error);
      return false;
    } catch {
      toast.error("Error al crear producto");
      return false;
    }
  };

  const updateProduct = async (id, productData) => {
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...productData, id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Producto actualizado");
        await fetchProducts();
        return true;
      }
      toast.error(data.error);
      return false;
    } catch {
      toast.error("Error al actualizar");
      return false;
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm("¿Eliminar este producto?")) return false;
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Producto eliminado");
        await fetchProducts();
        return true;
      }
      toast.error(data.error);
      return false;
    } catch {
      toast.error("Error al eliminar");
      return false;
    }
  };

  return {
    products,
    loading,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}

// ==========================================
// HOOK DE PEDIDOS
// ==========================================
export function useOrders(user) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let url = "/api/orders";
      // Las APIs reciben id_usuario (integer) para resolver el id_cliente internamente
      if (user.role === "customer") url += `?userId=${user.id}`;
      else if (user.role === "delivery") url += "?method=delivery";
      else if (user.role === "shipping") url += "?method=shipping";

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setOrders(data.data);
    } catch {
      console.error("Error al obtener pedidos");
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData) => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("¡Pedido creado exitosamente!");
        await fetchOrders();
        return true;
      }
      toast.error(data.error || "Error al crear pedido");
      return false;
    } catch {
      toast.error("Error al crear pedido");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          status: newStatus,
          updatedBy: user.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Pedido actualizado a: ${newStatus}`);
        await fetchOrders();
        return true;
      }
      toast.error(data.error);
      return false;
    } catch {
      toast.error("Error al actualizar");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { orders, loading, fetchOrders, createOrder, updateStatus };
}

// ==========================================
// HOOK DE CARRITO
// Sin cambios — el shape de productos lo normaliza la API (/api/products)
// ==========================================
export function useCart() {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    // Soporte tanto para _id (normalizado) como id
    const pid = product._id ?? product.id;
    const exists = cart.find((i) => i.id === pid);
    if (exists) {
      setCart(
        cart.map((i) =>
          i.id === pid ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      );
      toast.success(`Se agregó 1 más de ${product.name}`);
    } else {
      setCart([
        ...cart,
        {
          id: pid,
          name: product.name,
          price: product.price,
          weight: product.weight,
          image: product.image,
          quantity: 1,
        },
      ]);
      toast.success(`${product.name} agregado al carrito`);
    }
  };

  const updateQuantity = (id, qty) => {
    if (qty <= 0) {
      const item = cart.find((i) => i.id === id);
      setCart(cart.filter((i) => i.id !== id));
      toast.success(`${item?.name} eliminado`);
    } else {
      setCart(cart.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
    }
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const weight = cart.reduce((s, i) => s + (i.weight ?? 1) * i.quantity, 0);
  const itemCount = cart.reduce((s, i) => s + i.quantity, 0);

  return {
    cart,
    addToCart,
    updateQuantity,
    clearCart,
    total,
    weight,
    itemCount,
  };
}
