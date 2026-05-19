import React, { useState, useMemo, useEffect, useRef } from "react";
import { Toaster, toast } from "react-hot-toast";
import {
  ShoppingCart,
  LogOut,
  X,
  CreditCard,
  Sun,
  Moon,
  Send,
  MapPin,
  Phone,
  Mail,
  User,
  CheckCircle as CheckIcon,
  Search,
  ArrowUpDown,
  Filter,
  LogIn,
  UserPlus,
} from "lucide-react";

// Normaliza _id → id para compatibilidad con Supabase
const getId = (obj) => obj?.id ?? obj?._id;

// ── Mini formulario de registro inline ───────────────────────────────────────
const RegisterInline = ({ onBack }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password || !form.phone) {
      toast.error("Completa todos los campos");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("¡Cuenta creada! Ya puedes iniciar sesión 🎉");
        onBack();
      } else {
        toast.error(data.message || "Error al crear cuenta");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500";

  return (
    <div className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={onBack}
          className="text-amber-600 hover:text-amber-700 text-sm font-semibold"
        >
          ← Volver
        </button>
        <span className="text-sm font-bold text-gray-700">Crear cuenta</span>
      </div>
      <div className="space-y-2.5">
        <input
          type="text"
          placeholder="Nombre completo"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className={inputCls}
        />
        <input
          type="email"
          placeholder="Correo electrónico"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className={inputCls}
        />
        <input
          type="tel"
          placeholder="Teléfono (10 dígitos)"
          maxLength={10}
          value={form.phone}
          onChange={(e) =>
            setForm({
              ...form,
              phone: e.target.value.replace(/\D/g, "").slice(0, 10),
            })
          }
          className={inputCls}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className={inputCls}
        />
        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={form.confirmPassword}
          onChange={(e) =>
            setForm({ ...form, confirmPassword: e.target.value })
          }
          onKeyDown={(e) => e.key === "Enter" && handleRegister()}
          className={inputCls}
        />
        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 transition-all"
        >
          {loading ? "Creando cuenta..." : "Registrarse"}
        </button>
      </div>
    </div>
  );
};

// ── Dropdown de login + registro ──────────────────────────────────────────────
const LoginDropdown = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [localForm, setLocalForm] = useState({ email: "", password: "" });
  const [localLoading, setLocalLoading] = useState(false);

  const handleInlineLogin = async () => {
    if (!localForm.email || !localForm.password) return;
    setLocalLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(localForm),
      });
      const data = await res.json();
      if (data.success && data.user) onLoginSuccess(data.user);
      else toast.error(data.message || "Correo o contraseña incorrectos");
    } catch {
      toast.error("Error de conexión");
    } finally {
      setLocalLoading(false);
    }
  };

  if (mode === "register")
    return <RegisterInline onBack={() => setMode("login")} />;

  return (
    <div className="p-5">
      <div className="text-center mb-4">
        <div className="text-3xl mb-1">🥖</div>
        <p className="text-sm font-semibold text-gray-700">
          Panadería Artesanal
        </p>
      </div>
      <div className="space-y-3">
        <input
          type="email"
          value={localForm.email}
          onChange={(e) =>
            setLocalForm({ ...localForm, email: e.target.value })
          }
          className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="correo@ejemplo.com"
        />
        <input
          type="password"
          value={localForm.password}
          onChange={(e) =>
            setLocalForm({ ...localForm, password: e.target.value })
          }
          onKeyDown={(e) => e.key === "Enter" && handleInlineLogin()}
          className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="Contraseña"
        />
        <button
          onClick={handleInlineLogin}
          disabled={localLoading}
          className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 transition-all"
        >
          {localLoading ? "Ingresando..." : "Ingresar"}
        </button>

        {/* Divider */}
        <div className="relative my-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-white text-gray-400">
              ¿No tienes cuenta?
            </span>
          </div>
        </div>

        {/* Botón registro */}
        <button
          onClick={() => setMode("register")}
          className="w-full flex items-center justify-center gap-2 border-2 border-amber-500 text-amber-600 py-2.5 rounded-lg font-semibold text-sm hover:bg-amber-50 transition-all"
        >
          <UserPlus size={16} /> Crear cuenta gratis
        </button>
      </div>
      <p className="mt-3 text-center text-xs text-gray-400">
        Prueba:{" "}
        <code className="bg-gray-100 px-1 rounded">cliente@test.com</code> / 123
      </p>
    </div>
  );
};

// ── Componente principal ──────────────────────────────────────────────────────
const CustomerView = ({
  theme,
  darkMode,
  setDarkMode,
  user,
  setUser,
  onLoginSuccess,
  cart,
  setCart,
  products = [],
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
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const loginDropdownRef = useRef(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [qtyPickerOpen, setQtyPickerOpen] = useState({});
  const [qtyInput, setQtyInput] = useState({});

  // ── Carrusel ──────────────────────────────────────────────────────────────
  const [carouselImages, setCarouselImages] = useState([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [dragStartX, setDragStartX] = useState(null);
  const autoPlayRef = useRef(null);

  useEffect(() => {
    fetch("/api/carousel")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data.length) setCarouselImages(d.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (carouselImages.length < 2) return;
    autoPlayRef.current = setInterval(
      () => setCarouselIndex((i) => (i + 1) % carouselImages.length),
      3000,
    );
    return () => clearInterval(autoPlayRef.current);
  }, [carouselImages]);

  const carouselNext = () => {
    clearInterval(autoPlayRef.current);
    setCarouselIndex((i) => (i + 1) % carouselImages.length);
  };
  const carouselPrev = () => {
    clearInterval(autoPlayRef.current);
    setCarouselIndex(
      (i) => (i - 1 + carouselImages.length) % carouselImages.length,
    );
  };
  const handleDragStart = (e) =>
    setDragStartX(e.touches?.[0]?.clientX ?? e.clientX);
  const handleDragEnd = (e) => {
    if (dragStartX === null) return;
    const diff = dragStartX - (e.changedTouches?.[0]?.clientX ?? e.clientX);
    if (Math.abs(diff) > 40) diff > 0 ? carouselNext() : carouselPrev();
    setDragStartX(null);
  };

  // ── Cerrar dropdown al click fuera ───────────────────────────────────────
  useEffect(() => {
    const close = (e) => {
      if (
        loginDropdownRef.current &&
        !loginDropdownRef.current.contains(e.target)
      )
        setShowLoginDropdown(false);
    };
    if (showLoginDropdown) document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [showLoginDropdown]);

  const categories = [
    "Todo",
    "Pan Dulce",
    "Pan Salado",
    "Pasteles",
    "Galletas",
    "Promociones",
  ];

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;
    if (category === "Promociones") filtered = filtered.filter((p) => p.promo);
    else if (category !== "Todo")
      filtered = filtered.filter((p) => p.category === category);
    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.category.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    const sorted = [...filtered];
    if (sortBy === "price")
      sorted.sort((a, b) =>
        sortOrder === "asc" ? a.price - b.price : b.price - a.price,
      );
    else if (sortBy === "name")
      sorted.sort((a, b) =>
        sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name),
      );
    return sorted;
  }, [products, category, searchTerm, sortBy, sortOrder]);

  const resetFilters = () => {
    setSearchTerm("");
    setSortBy("default");
    setSortOrder("asc");
    setCategory("Todo");
  };

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  // Método por número de piezas: 1–25 repartidor local, 26+ paquetería
  const totalPiezas = cart.reduce((s, i) => s + i.quantity, 0);
  const metodoEntrega = totalPiezas > 25 ? "shipping" : "delivery";

  // ── Confirmar pedido (solo efectivo) ─────────────────────────────────────
  const handlePay = async () => {
    const errors = {};
    if (!delivery.name) errors.name = true;
    if (!delivery.address) errors.address = true;
    if (!delivery.phone || delivery.phone.replace(/\D/g, "").length !== 10)
      errors.phone = true;
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error("Completa los campos obligatorios marcados en rojo");
      return;
    }
    createOrder();
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: theme.bg, color: theme.text }}
    >
      <Toaster position="top-right" />

      {/* ── Header ── */}
      <header
        className="sticky top-0 border-b shadow-2xl z-50"
        style={{ backgroundColor: theme.card, borderColor: theme.border }}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="text-4xl">🥖</div>
              <div className="hidden sm:block">
                <h1
                  className="text-2xl font-extrabold leading-tight"
                  style={{ color: theme.primary }}
                >
                  Panadería Artesanal
                </h1>
                <p className="text-xs" style={{ color: theme.textSecondary }}>
                  Pan fresco recién horneado
                </p>
              </div>
            </div>

            {/* Búsqueda */}
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                size={18}
                style={{ color: theme.textSecondary }}
              />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border outline-none transition-all text-sm"
                style={{
                  backgroundColor: theme.bgSecondary,
                  color: theme.text,
                  borderColor: theme.border,
                }}
              />
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full transition-all hover:brightness-110"
                style={{ backgroundColor: theme.bgSecondary }}
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {user ? (
                <>
                  <span
                    className="text-sm hidden md:block"
                    style={{ color: theme.textSecondary }}
                  >
                    Hola, {user.name.split(" ")[0]}
                  </span>
                  <button
                    onClick={() => setUser(null)}
                    className="p-2 rounded-full transition-all hover:brightness-110"
                    style={{ backgroundColor: theme.bgSecondary }}
                  >
                    <LogOut size={18} />
                  </button>
                </>
              ) : (
                <div className="relative" ref={loginDropdownRef}>
                  <button
                    onClick={() => setShowLoginDropdown((v) => !v)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-white text-sm transition-all hover:brightness-110"
                    style={{ backgroundColor: theme.primary }}
                  >
                    <LogIn size={16} />
                    <span className="hidden sm:inline">Ingresar</span>
                    <svg
                      className={`w-3 h-3 transition-transform ${showLoginDropdown ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {showLoginDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-[310px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-[200] overflow-hidden">
                      <div className="absolute -top-2 right-4 w-4 h-4 bg-white rotate-45 border-l border-t border-gray-100 z-10" />
                      <LoginDropdown
                        onLoginSuccess={(userData) => {
                          onLoginSuccess?.(userData);
                          setShowLoginDropdown(false);
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => setShowCart(true)}
                className="relative p-2.5 rounded-full transition-all hover:brightness-110"
                style={{ backgroundColor: theme.primary }}
              >
                <ShoppingCart size={20} className="text-white" />
                {totalPiezas > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {totalPiezas}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Categorías */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className="px-4 py-1.5 rounded-full whitespace-nowrap font-semibold text-sm transition-all hover:brightness-110 flex-shrink-0"
                style={{
                  backgroundColor:
                    category === c ? theme.primary : theme.bgSecondary,
                  color: category === c ? "white" : theme.text,
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Carrusel ── */}
      {carouselImages.length > 0 && (
        <div
          className="relative overflow-hidden select-none"
          style={{ height: "280px" }}
          onMouseDown={handleDragStart}
          onMouseUp={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchEnd={handleDragEnd}
        >
          {carouselImages.map((img, idx) => (
            <div
              key={img._id ?? idx}
              className="absolute inset-0 transition-opacity duration-700"
              style={{
                opacity: idx === carouselIndex ? 1 : 0,
                pointerEvents: idx === carouselIndex ? "auto" : "none",
              }}
            >
              <img
                src={img.url}
                alt={img.alt ?? `Banner ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          ))}
          {carouselImages.length > 1 && (
            <>
              <button
                onClick={carouselPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-10 h-10 flex items-center justify-center z-10 text-xl"
              >
                ‹
              </button>
              <button
                onClick={carouselNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-10 h-10 flex items-center justify-center z-10 text-xl"
              >
                ›
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {carouselImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCarouselIndex(i)}
                    className={`h-2 rounded-full transition-all ${i === carouselIndex ? "bg-white w-6" : "bg-white/50 w-2"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Filtros ── */}
      <div className="container mx-auto px-4 py-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-all hover:brightness-110"
          style={{
            backgroundColor: theme.bgSecondary,
            color: theme.text,
            borderColor: theme.border,
          }}
        >
          <Filter size={16} /> Filtros {showFilters ? "▲" : "▼"}
        </button>
        {showFilters && (
          <div
            className="mt-3 p-4 rounded-xl border space-y-3"
            style={{
              backgroundColor: theme.bgSecondary,
              borderColor: theme.border,
            }}
          >
            <div className="flex flex-wrap gap-3 items-center">
              <span
                className="text-sm font-semibold"
                style={{ color: theme.text }}
              >
                Ordenar por:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-lg border outline-none text-sm"
                style={{
                  backgroundColor: theme.bg,
                  color: theme.text,
                  borderColor: theme.border,
                }}
              >
                <option value="default">Predeterminado</option>
                <option value="name">Nombre</option>
                <option value="price">Precio</option>
              </select>
              {sortBy !== "default" && (
                <button
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="px-3 py-2 rounded-lg border flex items-center gap-2 text-sm transition-all hover:brightness-110"
                  style={{
                    backgroundColor: theme.bg,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                >
                  <ArrowUpDown size={16} />{" "}
                  {sortOrder === "asc" ? "Ascendente" : "Descendente"}
                </button>
              )}
              <button
                onClick={resetFilters}
                className="ml-auto px-3 py-2 rounded-lg font-semibold text-sm hover:brightness-110"
                style={{ backgroundColor: theme.primary, color: "white" }}
              >
                Limpiar
              </button>
            </div>
            <p className="text-xs" style={{ color: theme.textSecondary }}>
              Mostrando {filteredAndSortedProducts.length} de {products.length}{" "}
              productos
            </p>
          </div>
        )}
      </div>

      {/* ── Grid de Productos ── */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-8">
          <h3
            className="text-3xl font-extrabold"
            style={{ color: theme.primary }}
          >
            {category}
          </h3>
          {searchTerm && (
            <p className="text-sm" style={{ color: theme.textSecondary }}>
              Resultados para: "{searchTerm}"
            </p>
          )}
        </div>

        {filteredAndSortedProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-7xl mb-4">🔍</div>
            <p
              className="text-xl font-semibold"
              style={{ color: theme.textSecondary }}
            >
              {products.length === 0
                ? "Cargando productos..."
                : "No se encontraron productos"}
            </p>
            {searchTerm && (
              <button
                onClick={resetFilters}
                className="mt-4 px-6 py-3 rounded-xl font-semibold text-white hover:brightness-110"
                style={{ backgroundColor: theme.primary }}
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredAndSortedProducts.map((p) => (
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
                    className="font-bold text-lg mb-1"
                    style={{ color: theme.text }}
                  >
                    {p.name}
                  </h4>
                  {p.description && (
                    <p
                      className="text-xs mb-2 line-clamp-2"
                      style={{ color: theme.textSecondary }}
                    >
                      {p.description}
                    </p>
                  )}
                  <div className="mb-3">
                    <span
                      className="text-2xl font-bold"
                      style={{ color: theme.primary }}
                    >
                      ${p.price}
                    </span>
                    <span
                      className="text-sm ml-1"
                      style={{ color: theme.textSecondary }}
                    >
                      / pieza
                    </span>
                  </div>

                  {/* Selector de cantidad */}
                  {qtyPickerOpen[p._id] ? (
                    <div className="mt-1">
                      <p
                        className="text-xs font-semibold mb-1.5 text-center"
                        style={{ color: theme.textSecondary }}
                      >
                        ¿Cuántas piezas?
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setQtyInput((prev) => ({
                              ...prev,
                              [p._id]: Math.max(1, (prev[p._id] ?? 1) - 1),
                            }))
                          }
                          className="w-9 h-9 rounded-full font-bold text-white flex-shrink-0 hover:brightness-110 flex items-center justify-center text-lg"
                          style={{ backgroundColor: theme.primary }}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={qtyInput[p._id] ?? 1}
                          onChange={(e) => {
                            const v = parseInt(e.target.value, 10);
                            if (!isNaN(v) && v >= 1)
                              setQtyInput((prev) => ({ ...prev, [p._id]: v }));
                          }}
                          className="flex-1 text-center font-bold py-2 rounded-lg border outline-none"
                          style={{
                            backgroundColor: theme.bg,
                            color: theme.text,
                            borderColor: theme.primary,
                          }}
                        />
                        <button
                          onClick={() =>
                            setQtyInput((prev) => ({
                              ...prev,
                              [p._id]: (prev[p._id] ?? 1) + 1,
                            }))
                          }
                          className="w-9 h-9 rounded-full font-bold text-white flex-shrink-0 hover:brightness-110 flex items-center justify-center text-lg"
                          style={{ backgroundColor: theme.primary }}
                        >
                          +
                        </button>
                      </div>
                      <p
                        className="text-xs text-center mt-1.5 font-semibold"
                        style={{ color: theme.primary }}
                      >
                        = $
                        {((qtyInput[p._id] ?? 1) * parseFloat(p.price)).toFixed(
                          2,
                        )}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() =>
                            setQtyPickerOpen((prev) => ({
                              ...prev,
                              [p._id]: false,
                            }))
                          }
                          className="flex-1 py-2 rounded-xl font-semibold text-sm border hover:brightness-110"
                          style={{
                            borderColor: theme.border,
                            color: theme.textSecondary,
                            backgroundColor: theme.bg,
                          }}
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => {
                            const qty = qtyInput[p._id] ?? 1;
                            const existing = cart.find(
                              (c) => c.id === p._id || c._id === p._id,
                            );
                            if (existing) {
                              setCart((prev) =>
                                prev.map((c) =>
                                  c.id === p._id || c._id === p._id
                                    ? { ...c, quantity: c.quantity + qty }
                                    : c,
                                ),
                              );
                            } else {
                              setCart((prev) => [
                                ...prev,
                                {
                                  id: p._id,
                                  name: p.name,
                                  price: p.price,
                                  weight: p.weight ?? 0,
                                  image: p.image,
                                  quantity: qty,
                                },
                              ]);
                            }
                            toast.success(
                              `${qty} ${qty === 1 ? "pieza" : "piezas"} de ${p.name} al carrito 🛒`,
                            );
                            setQtyPickerOpen((prev) => ({
                              ...prev,
                              [p._id]: false,
                            }));
                            setQtyInput((prev) => ({ ...prev, [p._id]: 1 }));
                          }}
                          className="flex-1 py-2 rounded-xl font-bold text-white text-sm hover:brightness-110"
                          style={{ backgroundColor: theme.primary }}
                        >
                          ✓ Agregar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setQtyInput((prev) => ({
                          ...prev,
                          [p._id]: prev[p._id] ?? 1,
                        }));
                        setQtyPickerOpen((prev) => ({
                          ...prev,
                          [p._id]: true,
                        }));
                      }}
                      className="w-full py-3 rounded-xl font-bold text-white hover:brightness-110"
                      style={{ backgroundColor: theme.primary }}
                    >
                      {cart.find((c) => c.id === p._id || c._id === p._id)
                        ? "＋ Agregar más"
                        : "Añadir al Carrito"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal Carrito ── */}
      {showCart && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowCart(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            style={{ backgroundColor: theme.card, borderColor: theme.primary }}
          >
            <div
              className="p-4 sm:p-6 border-b flex-shrink-0 flex justify-between items-center"
              style={{ borderColor: theme.border }}
            >
              <h3
                className="text-xl font-bold flex items-center gap-2"
                style={{ color: theme.primary }}
              >
                Tu Carrito <ShoppingCart />
              </h3>
              <button
                onClick={() => setShowCart(false)}
                className="p-2 rounded-full hover:brightness-110"
                style={{ backgroundColor: theme.bgSecondary }}
              >
                <X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4 sm:p-6">
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
                <div className="space-y-3">
                  {cart.map((i) => (
                    <div
                      key={i.id}
                      className="flex gap-3 p-3 rounded-xl items-center border"
                      style={{
                        backgroundColor: theme.bgSecondary,
                        borderColor: theme.border,
                      }}
                    >
                      <img
                        src={i.image}
                        alt={i.name}
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-bold truncate text-sm"
                          style={{ color: theme.text }}
                        >
                          {i.name}
                        </p>
                        <p
                          className="text-xs font-semibold"
                          style={{ color: theme.primary }}
                        >
                          ${i.price} c/u
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <button
                            onClick={() => updateQty(i.id, i.quantity - 1)}
                            className="w-7 h-7 rounded-full font-bold text-white flex items-center justify-center"
                            style={{ backgroundColor: theme.primary }}
                          >
                            −
                          </button>
                          <span
                            className="font-bold w-6 text-center text-sm"
                            style={{ color: theme.text }}
                          >
                            {i.quantity}
                          </span>
                          <button
                            onClick={() => updateQty(i.id, i.quantity + 1)}
                            className="w-7 h-7 rounded-full font-bold text-white flex items-center justify-center"
                            style={{ backgroundColor: theme.primary }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p
                          className="font-bold text-sm"
                          style={{ color: theme.primary }}
                        >
                          ${(i.price * i.quantity).toFixed(2)}
                        </p>
                        <button
                          onClick={() => updateQty(i.id, 0)}
                          className="mt-1 hover:brightness-75"
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
                className="p-4 sm:p-5 border-t flex-shrink-0"
                style={{ borderColor: theme.border }}
              >
                {/* Método de entrega por piezas */}
                <div
                  className="mb-3 p-3 rounded-lg text-sm"
                  style={{ backgroundColor: theme.bgSecondary }}
                >
                  <div className="flex justify-between items-center">
                    <span style={{ color: theme.textSecondary }}>
                      Piezas totales:
                    </span>
                    <span className="font-bold" style={{ color: theme.text }}>
                      {totalPiezas}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span style={{ color: theme.textSecondary }}>Entrega:</span>
                    <span className="font-semibold text-xs">
                      {metodoEntrega === "delivery"
                        ? "🚴 Repartidor local (1–25 pzas)"
                        : "📦 Paquetería (26+ pzas)"}
                    </span>
                  </div>
                </div>
                <div
                  className="flex justify-between text-2xl font-bold mb-4"
                  style={{ color: theme.primary }}
                >
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => {
                    if (!user) {
                      setShowCart(false);
                      setShowLoginDropdown(true);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    } else {
                      setShowCheckout(true);
                    }
                  }}
                  className="w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 hover:brightness-110"
                  style={{ backgroundColor: theme.primary }}
                >
                  {user ? "Proceder a Pagar" : "Inicia sesión para pagar"}{" "}
                  <CreditCard size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modal Checkout — scrolleable, no se sale de pantalla ── */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[90] overflow-y-auto">
          <div className="min-h-full flex items-start justify-center p-4 py-8">
            <div
              className="max-w-lg w-full rounded-2xl border shadow-2xl"
              style={{
                backgroundColor: theme.card,
                borderColor: theme.primary,
              }}
            >
              {/* Header */}
              <div
                className="p-5 border-b flex justify-between items-center rounded-t-2xl"
                style={{ borderColor: theme.border }}
              >
                <h3
                  className="text-xl font-bold flex items-center gap-2"
                  style={{ color: theme.primary }}
                >
                  <Send size={20} /> Finalizar Compra
                </h3>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="p-2 rounded-full hover:brightness-110"
                  style={{ backgroundColor: theme.bgSecondary }}
                >
                  <X size={22} />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Resumen rápido */}
                <div
                  className="p-3 rounded-xl border flex justify-between items-center"
                  style={{
                    backgroundColor: theme.bgSecondary,
                    borderColor: theme.border,
                  }}
                >
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: theme.text }}
                    >
                      {totalPiezas} piezas en tu pedido
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: theme.textSecondary }}
                    >
                      {metodoEntrega === "delivery"
                        ? "🚴 Entrega local (1–25 pzas)"
                        : "📦 Paquetería (26+ pzas)"}
                    </p>
                  </div>
                  <p
                    className="text-2xl font-extrabold"
                    style={{ color: theme.primary }}
                  >
                    ${total.toFixed(2)}
                  </p>
                </div>

                {/* Datos de entrega */}
                <div
                  className="p-4 rounded-xl border"
                  style={{
                    backgroundColor: theme.bgSecondary,
                    borderColor: theme.border,
                  }}
                >
                  <h4
                    className="font-bold text-base mb-4 flex items-center gap-2"
                    style={{ color: theme.primary }}
                  >
                    <MapPin size={18} /> Datos de Entrega
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label
                        className="text-xs font-semibold mb-1 block"
                        style={{
                          color: fieldErrors.name
                            ? "#ef4444"
                            : theme.textSecondary,
                        }}
                      >
                        Nombre Completo <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Tu nombre"
                        value={delivery.name}
                        onChange={(e) => {
                          setDelivery({ ...delivery, name: e.target.value });
                          if (e.target.value)
                            setFieldErrors((p) => ({ ...p, name: false }));
                        }}
                        className="w-full p-3 rounded-lg border outline-none text-sm"
                        style={{
                          backgroundColor: theme.bg,
                          color: theme.text,
                          borderColor: fieldErrors.name
                            ? "#ef4444"
                            : theme.border,
                        }}
                      />
                      {fieldErrors.name && (
                        <p className="text-xs text-red-500 mt-1">
                          Campo obligatorio
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        className="text-xs font-semibold mb-1 block"
                        style={{
                          color: fieldErrors.address
                            ? "#ef4444"
                            : theme.textSecondary,
                        }}
                      >
                        Dirección <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Calle, número, colonia"
                        value={delivery.address}
                        onChange={(e) => {
                          setDelivery({ ...delivery, address: e.target.value });
                          if (e.target.value)
                            setFieldErrors((p) => ({ ...p, address: false }));
                        }}
                        className="w-full p-3 rounded-lg border outline-none text-sm"
                        style={{
                          backgroundColor: theme.bg,
                          color: theme.text,
                          borderColor: fieldErrors.address
                            ? "#ef4444"
                            : theme.border,
                        }}
                      />
                      {fieldErrors.address && (
                        <p className="text-xs text-red-500 mt-1">
                          Campo obligatorio
                        </p>
                      )}
                    </div>
                    <div>
                      <label
                        className="text-xs font-semibold mb-1 block"
                        style={{
                          color: fieldErrors.phone
                            ? "#ef4444"
                            : theme.textSecondary,
                        }}
                      >
                        Teléfono WhatsApp{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="10 dígitos"
                        value={delivery.phone}
                        maxLength={10}
                        onChange={(e) => {
                          const d = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10);
                          setDelivery({ ...delivery, phone: d });
                          if (d.length === 10)
                            setFieldErrors((p) => ({ ...p, phone: false }));
                        }}
                        className="w-full p-3 rounded-lg border outline-none text-sm"
                        style={{
                          backgroundColor: theme.bg,
                          color: theme.text,
                          borderColor: fieldErrors.phone
                            ? "#ef4444"
                            : theme.border,
                        }}
                      />
                      <p
                        className="text-xs mt-1"
                        style={{
                          color: fieldErrors.phone
                            ? "#ef4444"
                            : theme.textSecondary,
                        }}
                      >
                        {delivery.phone?.length ?? 0}/10
                        {fieldErrors.phone && " — Requerido"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pago — solo efectivo */}
                <div
                  className="p-4 rounded-xl border"
                  style={{
                    backgroundColor: theme.bgSecondary,
                    borderColor: theme.border,
                  }}
                >
                  <h4
                    className="font-bold text-base mb-3 flex items-center gap-2"
                    style={{ color: theme.primary }}
                  >
                    <CreditCard size={18} /> Método de Pago
                  </h4>
                  <div
                    className="p-4 rounded-xl border-2 flex items-center gap-3"
                    style={{
                      borderColor: theme.primary,
                      backgroundColor: `${theme.primary}15`,
                    }}
                  >
                    <span className="text-2xl">💵</span>
                    <div>
                      <p
                        className="font-semibold text-sm"
                        style={{ color: theme.text }}
                      >
                        Efectivo contra entrega
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: theme.textSecondary }}
                      >
                        Pagas cuando recibes tu pedido
                      </p>
                    </div>
                    <CheckIcon size={20} className="ml-auto text-green-500" />
                  </div>
                </div>

                {/* Desglose */}
                <div
                  className="p-4 rounded-xl border-2"
                  style={{
                    backgroundColor: theme.bgSecondary,
                    borderColor: theme.primary,
                  }}
                >
                  <h4
                    className="font-bold text-base mb-3"
                    style={{ color: theme.primary }}
                  >
                    Resumen
                  </h4>
                  {cart.map((i) => (
                    <div
                      key={i.id}
                      className="flex justify-between text-sm mb-1"
                      style={{ color: theme.textSecondary }}
                    >
                      <span>
                        {i.name} × {i.quantity}
                      </span>
                      <span style={{ color: theme.text }}>
                        ${(i.price * i.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div
                    className="flex justify-between text-sm mt-2 pt-2 border-t"
                    style={{
                      color: theme.textSecondary,
                      borderColor: theme.border,
                    }}
                  >
                    <span>Envío:</span>
                    <span className="text-green-500 font-semibold">GRATIS</span>
                  </div>
                  <div
                    className="flex justify-between text-2xl font-extrabold pt-2 mt-2 border-t"
                    style={{ color: theme.primary, borderColor: theme.border }}
                  >
                    <span>TOTAL:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Botón confirmar */}
                <button
                  onClick={handlePay}
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-bold text-lg text-white disabled:opacity-50 flex items-center justify-center gap-3 hover:brightness-110"
                  style={{ backgroundColor: theme.primary }}
                >
                  <CheckIcon size={22} />
                  {loading ? "Procesando..." : "CONFIRMAR PEDIDO 🥖"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer
        className="border-t py-8 mt-16"
        style={{ backgroundColor: theme.card, borderColor: theme.border }}
      >
        <div className="container mx-auto px-4 text-center">
          <p
            className="text-2xl font-bold mb-4"
            style={{ color: theme.primary }}
          >
            🥖 Panadería Artesanal
          </p>
          <div className="flex flex-wrap justify-center gap-6 mb-4">
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
            © 2025 Panadería Artesanal — Pan fresco cada día
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CustomerView;
