import React, { useState, useMemo } from "react";
import { Toaster } from "react-hot-toast";
import {
  ShoppingCart,
  LogOut,
  X,
  CreditCard,
  Clock,
  CheckCircle,
  Sun,
  Moon,
  Send,
  MapPin,
  Phone,
  Mail,
  User,
  Tag,
  CheckCircle as CheckIcon,
  Search,
  ArrowUpDown,
  Filter,
} from "lucide-react";

const CustomerView = ({
  theme,
  darkMode,
  setDarkMode,
  user,
  setUser,
  cart,
  setCart,
  products,
  category,
  setCategory,
  showCart,
  setShowCart,
  showCheckout,
  setShowCheckout,
  delivery,
  setDelivery,
  payment,
  setPayment,
  loading,
  addToCart,
  updateQty,
  createOrder,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    "Todo",
    "Pan Dulce",
    "Pan Salado",
    "Bollería",
    "Pasteles",
    "Promociones",
  ];

  // Filtrado y ordenamiento de productos
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    // Filtro por categoría
    if (category === "Promociones") {
      filtered = filtered.filter((p) => p.promo);
    } else if (category !== "Todo") {
      filtered = filtered.filter((p) => p.category === category);
    }

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.category.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Ordenamiento
    const sorted = [...filtered];
    if (sortBy === "price") {
      sorted.sort((a, b) => {
        const comparison = parseFloat(a.price) - parseFloat(b.price);
        return sortOrder === "asc" ? comparison : -comparison;
      });
    } else if (sortBy === "name") {
      sorted.sort((a, b) => {
        const comparison = a.name.localeCompare(b.name);
        return sortOrder === "asc" ? comparison : -comparison;
      });
    } else if (sortBy === "stock") {
      sorted.sort((a, b) => {
        const comparison = parseFloat(a.stock) - parseFloat(b.stock);
        return sortOrder === "asc" ? comparison : -comparison;
      });
    }

    return sorted;
  }, [products, category, searchTerm, sortBy, sortOrder]);

  const resetFilters = () => {
    setSearchTerm("");
    setSortBy("default");
    setSortOrder("asc");
    setCategory("Todo");
  };

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const weight = cart.reduce((s, i) => s + i.weight * i.quantity, 0);

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
              <div className="text-5xl">🥖</div>
              <div>
                <h1
                  className="text-3xl font-extrabold"
                  style={{ color: theme.primary }}
                >
                  Panadería Artesanal
                </h1>
                <p className="text-xs" style={{ color: theme.textSecondary }}>
                  Pan fresco recién horneado todos los días
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full transition-all hover:brightness-110"
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
                className="p-2 rounded-full transition-all hover:brightness-110"
                style={{ backgroundColor: theme.bgSecondary }}
              >
                <LogOut size={20} />
              </button>
              <button
                onClick={() => setShowCart(true)}
                className="relative p-3 rounded-full transition-all hover:brightness-110"
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

          {/* Categorías */}
          <div className="flex gap-3 mt-4 overflow-x-auto py-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className="px-5 py-2 rounded-full whitespace-nowrap font-semibold transition-all hover:brightness-110"
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

          {/* Barra de búsqueda y filtros */}
          <div className="mt-4 space-y-3">
            <div className="flex gap-3 items-center">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2"
                  size={20}
                  style={{ color: theme.textSecondary }}
                />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all"
                  style={{
                    backgroundColor: theme.bgSecondary,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 rounded-xl border flex items-center gap-2 font-semibold transition-all hover:brightness-110"
                style={{
                  backgroundColor: showFilters
                    ? theme.primary
                    : theme.bgSecondary,
                  color: showFilters ? "#ffffff" : theme.text,
                  borderColor: theme.border,
                }}
              >
                <Filter size={20} /> Filtros
              </button>
            </div>

            {/* Panel de filtros expandible */}
            {showFilters && (
              <div
                className="p-4 rounded-xl border space-y-3"
                style={{
                  backgroundColor: theme.bgSecondary,
                  borderColor: theme.border,
                }}
              >
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => {
                      setSortBy("name");
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    }}
                    className="px-4 py-2 rounded-lg border flex items-center gap-2 font-medium transition-all hover:brightness-110"
                    style={{
                      backgroundColor:
                        sortBy === "name" ? theme.primary : theme.bg,
                      color: sortBy === "name" ? "#ffffff" : theme.text,
                      borderColor: theme.border,
                    }}
                  >
                    <ArrowUpDown size={16} /> Nombre
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("price");
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    }}
                    className="px-4 py-2 rounded-lg border flex items-center gap-2 font-medium transition-all hover:brightness-110"
                    style={{
                      backgroundColor:
                        sortBy === "price" ? theme.primary : theme.bg,
                      color: sortBy === "price" ? "#ffffff" : theme.text,
                      borderColor: theme.border,
                    }}
                  >
                    <ArrowUpDown size={16} /> Precio
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("stock");
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    }}
                    className="px-4 py-2 rounded-lg border flex items-center gap-2 font-medium transition-all hover:brightness-110"
                    style={{
                      backgroundColor:
                        sortBy === "stock" ? theme.primary : theme.bg,
                      color: sortBy === "stock" ? "#ffffff" : theme.text,
                      borderColor: theme.border,
                    }}
                  >
                    <ArrowUpDown size={16} /> Stock
                  </button>
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 rounded-lg border font-medium transition-all hover:brightness-110"
                    style={{
                      backgroundColor: theme.bg,
                      color: theme.text,
                      borderColor: theme.border,
                    }}
                  >
                    <X size={16} className="inline mr-1" /> Limpiar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Productos */}
      <main className="container mx-auto px-4 py-8">
        {filteredAndSortedProducts.length === 0 ? (
          <div
            className="text-center py-16 rounded-xl"
            style={{ backgroundColor: theme.bgSecondary }}
          >
            <p
              className="text-2xl font-bold mb-2"
              style={{ color: theme.text }}
            >
              No se encontraron productos
            </p>
            <p style={{ color: theme.textSecondary }}>
              Intenta con otros filtros o categorías
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedProducts.map((p) => (
              <div
                key={p._id}
                className="rounded-2xl shadow-lg overflow-hidden border transform transition-all hover:scale-105 hover:shadow-2xl"
                style={{
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                }}
              >
                {p.promo && (
                  <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                    🔥 PROMO
                  </div>
                )}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-amber-100 to-orange-100">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3
                    className="font-bold text-lg mb-2 line-clamp-2"
                    style={{ color: theme.text }}
                  >
                    {p.name}
                  </h3>
                  {p.description && (
                    <p
                      className="text-xs mb-3 line-clamp-2"
                      style={{ color: theme.textSecondary }}
                    >
                      {p.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p
                        className="text-2xl font-extrabold"
                        style={{ color: theme.primary }}
                      >
                        ${p.price}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: theme.textSecondary }}
                      >
                        por unidad
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: theme.text }}
                      >
                        {p.stock} disponibles
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => addToCart(p)}
                    className="w-full py-3 rounded-xl font-bold text-white transition-all hover:brightness-110 flex items-center justify-center gap-2"
                    style={{ backgroundColor: theme.primary }}
                  >
                    <ShoppingCart size={20} /> Agregar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Carrito (Modal) */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div
            className="w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden"
            style={{ backgroundColor: theme.card }}
          >
            <div
              className="p-6 flex justify-between items-center border-b"
              style={{ borderColor: theme.border }}
            >
              <h3
                className="text-2xl font-bold flex items-center gap-2"
                style={{ color: theme.primary }}
              >
                <ShoppingCart /> Tu Carrito ({cart.length})
              </h3>
              <button
                onClick={() => setShowCart(false)}
                className="p-2 rounded-full transition-all hover:brightness-110"
                style={{ backgroundColor: theme.bgSecondary }}
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto" style={{ maxHeight: "60vh" }}>
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart
                    size={64}
                    className="mx-auto mb-4"
                    style={{ color: theme.textSecondary }}
                  />
                  <p
                    className="text-xl font-bold"
                    style={{ color: theme.text }}
                  >
                    Tu carrito está vacío
                  </p>
                  <p style={{ color: theme.textSecondary }}>
                    Agrega productos para continuar
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 rounded-xl border"
                      style={{
                        backgroundColor: theme.bgSecondary,
                        borderColor: theme.border,
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4
                          className="font-bold text-lg"
                          style={{ color: theme.text }}
                        >
                          {item.name}
                        </h4>
                        <p
                          className="text-xl font-bold"
                          style={{ color: theme.primary }}
                        >
                          ${item.price} c/u
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() =>
                              updateQty(item.id, item.quantity - 1)
                            }
                            className="w-8 h-8 rounded-lg font-bold transition-all hover:brightness-110"
                            style={{
                              backgroundColor: theme.primary,
                              color: "#ffffff",
                            }}
                          >
                            -
                          </button>
                          <span
                            className="w-12 text-center font-bold"
                            style={{ color: theme.text }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQty(item.id, item.quantity + 1)
                            }
                            className="w-8 h-8 rounded-lg font-bold transition-all hover:brightness-110"
                            style={{
                              backgroundColor: theme.primary,
                              color: "#ffffff",
                            }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className="text-2xl font-extrabold"
                          style={{ color: theme.primary }}
                        >
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <button
                          onClick={() => updateQty(item.id, 0)}
                          className="mt-2 text-red-500 hover:text-red-700 text-sm font-semibold"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                  <div
                    className="border-t pt-4"
                    style={{ borderColor: theme.border }}
                  >
                    <div className="flex justify-between text-xl font-bold mb-4">
                      <span style={{ color: theme.text }}>TOTAL:</span>
                      <span style={{ color: theme.primary }}>
                        ${total.toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setShowCart(false);
                        setShowCheckout(true);
                      }}
                      className="w-full py-4 rounded-xl font-bold text-xl text-white transition-all hover:brightness-110"
                      style={{ backgroundColor: "#16a34a" }}
                    >
                      Proceder al Pago
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Checkout (Modal) */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div
            className="w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden"
            style={{ backgroundColor: theme.card }}
          >
            <div
              className="p-6 flex justify-between items-center border-b"
              style={{ borderColor: theme.border }}
            >
              <h3
                className="text-2xl font-bold flex items-center gap-2"
                style={{ color: theme.primary }}
              >
                Finalizar Compra <Send />
              </h3>
              <button
                onClick={() => setShowCheckout(false)}
                className="p-2 rounded-full transition-all hover:brightness-110"
                style={{ backgroundColor: theme.bgSecondary }}
              >
                <X size={24} />
              </button>
            </div>
            <div
              className="p-6 space-y-8 overflow-y-auto"
              style={{ maxHeight: "calc(90vh - 100px)" }}
            >
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
                      className="w-full p-4 rounded-xl border-2 flex items-center gap-3 transition-all hover:brightness-110"
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
                className="w-full py-4 rounded-xl font-bold text-xl text-white disabled:opacity-50 flex items-center justify-center gap-3 transition-all hover:brightness-110"
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
            Panadería Artesanal
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
              <span style={{ color: theme.text }}>ventas@panaderia.com</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={18} style={{ color: theme.primary }} />
              <span style={{ color: theme.text }}>Guadalajara, Jalisco</span>
            </div>
          </div>
          <p className="text-xs" style={{ color: theme.textSecondary }}>
            © 2025 Panadería Artesanal - Pan fresco todos los días
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CustomerView;
