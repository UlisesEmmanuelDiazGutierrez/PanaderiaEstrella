import React, { useState, useMemo, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import {
  User,
  Users,
  ShoppingCart,
  LogOut,
  Sun,
  Moon,
  Plus,
  Edit,
  Trash2,
  FileSpreadsheet,
  CreditCard,
  Tag,
  X,
  Search,
  ArrowUpDown,
  Filter,
  Package,
  Phone,
  Mail,
  Shield,
  Image as ImageIcon,
  Upload,
} from "lucide-react";

// ── Roles ─────────────────────────────────────────────────────────────────────
const ROLES = [
  { value: "customer", label: "Comprador", color: "bg-blue-100 text-blue-800" },
  {
    value: "delivery",
    label: "Repartidor Local",
    color: "bg-green-100 text-green-800",
  },
  {
    value: "shipping",
    label: "Paquetería",
    color: "bg-purple-100 text-purple-800",
  },
  { value: "admin", label: "Administrador", color: "bg-red-100 text-red-800" },
];
const roleInfo = (value) =>
  ROLES.find((r) => r.value === value) ?? {
    label: value,
    color: "bg-gray-100 text-gray-800",
  };

// ── Modal Usuario ─────────────────────────────────────────────────────────────
function UserModal({
  editingUser,
  userForm,
  setUserForm,
  onSave,
  onClose,
  loading,
  theme,
  darkMode,
}) {
  if (!editingUser) return null;
  const inputClass =
    "w-full p-3 rounded-lg border outline-none transition-all focus:ring-2 focus:ring-amber-400";
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        className="w-full max-w-lg rounded-2xl shadow-2xl"
        style={{ backgroundColor: theme.card }}
      >
        <div
          className="p-6 border-b flex justify-between items-center"
          style={{ borderColor: theme.border }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-full"
              style={{
                backgroundColor: darkMode
                  ? "rgba(217,119,6,0.15)"
                  : "rgba(254,243,199,0.8)",
              }}
            >
              <User size={22} style={{ color: theme.primary }} />
            </div>
            <h3 className="text-xl font-bold" style={{ color: theme.text }}>
              Editar Usuario
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-all"
            style={{
              backgroundColor: darkMode
                ? "rgba(156,163,175,0.1)"
                : "rgba(229,231,235,0.5)",
              color: theme.text,
            }}
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {/* Nombre */}
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: theme.text }}
            >
              Nombre completo
            </label>
            <div className="relative">
              <User
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: theme.textSecondary }}
              />
              <input
                type="text"
                value={userForm.name}
                onChange={(e) =>
                  setUserForm({ ...userForm, name: e.target.value })
                }
                className={inputClass + " pl-9"}
                style={{
                  backgroundColor: theme.bgSecondary,
                  color: theme.text,
                  borderColor: theme.border,
                }}
              />
            </div>
          </div>
          {/* Email */}
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: theme.text }}
            >
              Correo electrónico
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: theme.textSecondary }}
              />
              <input
                type="email"
                value={userForm.email}
                onChange={(e) =>
                  setUserForm({ ...userForm, email: e.target.value })
                }
                className={inputClass + " pl-9"}
                style={{
                  backgroundColor: theme.bgSecondary,
                  color: theme.text,
                  borderColor: theme.border,
                }}
              />
            </div>
          </div>
          {/* Teléfono */}
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: theme.text }}
            >
              Teléfono
            </label>
            <div className="relative">
              <Phone
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: theme.textSecondary }}
              />
              <input
                type="tel"
                value={userForm.phone}
                onChange={(e) =>
                  setUserForm({ ...userForm, phone: e.target.value })
                }
                className={inputClass + " pl-9"}
                style={{
                  backgroundColor: theme.bgSecondary,
                  color: theme.text,
                  borderColor: theme.border,
                }}
                placeholder="10 dígitos"
              />
            </div>
          </div>
          {/* Rol */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: theme.text }}
            >
              <Shield size={14} className="inline mr-1" /> Rol del usuario
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setUserForm({ ...userForm, role: r.value })}
                  className={`py-2 px-3 rounded-lg border-2 text-sm font-semibold transition-all ${userForm.role === r.value ? "border-amber-500 bg-amber-50 text-amber-700" : "border-transparent hover:border-gray-300"}`}
                  style={
                    userForm.role !== r.value
                      ? {
                          backgroundColor: theme.bgSecondary,
                          color: theme.text,
                          borderColor: theme.border,
                        }
                      : {}
                  }
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <p
            className="text-xs rounded-lg px-3 py-2"
            style={{
              backgroundColor: darkMode ? "rgba(59,130,246,0.1)" : "#eff6ff",
              color: darkMode ? "#93c5fd" : "#3b82f6",
            }}
          >
            🔒 La contraseña no se puede modificar desde aquí por seguridad.
          </p>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onSave}
            disabled={loading}
            className="flex-1 py-3 rounded-lg font-bold text-white transition-all hover:brightness-110 disabled:opacity-50"
            style={{ backgroundColor: theme.primary }}
          >
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-lg font-bold transition-all hover:brightness-110"
            style={{ backgroundColor: theme.bgSecondary, color: theme.text }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── AdminView ─────────────────────────────────────────────────────────────────
const AdminView = ({
  theme,
  darkMode,
  setDarkMode,
  user,
  setUser,
  products = [],
  orders = [],
  showProductModal,
  setShowProductModal,
  productForm,
  setProductForm,
  editingProduct,
  loading,
  openProductModal,
  saveProduct,
  deleteProduct,
  generateReport,
}) => {
  const [activeSection, setActiveSection] = useState("products");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [promoFilter, setPromoFilter] = useState("all");

  // ── Usuarios ───────────────────────────────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [savingUser, setSavingUser] = useState(false);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "customer",
  });

  const totalSales = orders.reduce((s, o) => s + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;

  // ── Carrusel ───────────────────────────────────────────────────────────────
  const [carouselImages, setCarouselImages] = useState([]);
  const [carouselLoading, setCarouselLoading] = useState(false);
  const [carouselUploading, setCarouselUploading] = useState(false);

  useEffect(() => {
    if (activeSection === "carousel") fetchCarousel();
  }, [activeSection]);

  const fetchCarousel = async () => {
    setCarouselLoading(true);
    try {
      const res = await fetch("/api/carousel");
      const data = await res.json();
      if (data.success) setCarouselImages(data.data);
    } catch {
      toast.error("Error al cargar carrusel");
    } finally {
      setCarouselLoading(false);
    }
  };

  const uploadCarouselImage = async (file) => {
    if (carouselImages.length >= 6) {
      toast.error("Máximo 6 imágenes permitidas");
      return;
    }
    setCarouselUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/carousel", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Imagen agregada");
        fetchCarousel();
      } else toast.error(data.error ?? "Error al subir imagen");
    } catch {
      toast.error("Error de conexión");
    } finally {
      setCarouselUploading(false);
    }
  };

  const deleteCarouselImage = async (id) => {
    if (!window.confirm("¿Eliminar esta imagen del carrusel?")) return;
    try {
      const res = await fetch("/api/carousel", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Imagen eliminada");
        fetchCarousel();
      } else toast.error(data.error ?? "Error al eliminar");
    } catch {
      toast.error("Error de conexión");
    }
  };

  // ── Usuarios CRUD ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeSection === "users" && users.length === 0) fetchUsers();
  }, [activeSection]);

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch("/api/users/");
      const data = await res.json();
      if (data.success) setUsers(data.data);
      else toast.error("Error al cargar usuarios");
    } catch {
      toast.error("Error de conexión");
    } finally {
      setUsersLoading(false);
    }
  };

  const openUserModal = (u) => {
    setEditingUser(u);
    setUserForm({
      name: u.name ?? "",
      email: u.email ?? "",
      phone: u.phone ?? "",
      role: u.role ?? "customer",
    });
    setShowUserModal(true);
  };

  const saveUser = async () => {
    if (!userForm.name || !userForm.email) {
      toast.error("Nombre y correo son obligatorios");
      return;
    }
    setSavingUser(true);
    try {
      const res = await fetch("/api/users/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingUser._id, ...userForm }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Usuario actualizado correctamente");
        setShowUserModal(false);
        setEditingUser(null);
        fetchUsers();
      } else toast.error(data.message ?? "Error al actualizar usuario");
    } catch {
      toast.error("Error de conexión");
    } finally {
      setSavingUser(false);
    }
  };

  const deleteUser = async (u) => {
    if (u._id === user.id || u.email === user.email) {
      toast.error("No puedes eliminar tu propia cuenta");
      return;
    }
    if (
      !window.confirm(
        `¿Eliminar al usuario "${u.name}"?\nEsta acción no se puede deshacer.`,
      )
    )
      return;
    try {
      const res = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: u._id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Usuario eliminado");
        fetchUsers();
      } else toast.error(data.error ?? "Error al eliminar usuario");
    } catch {
      toast.error("Error de conexión");
    }
  };

  const filteredUsers = useMemo(() => {
    let list = [...users];
    if (userSearch) {
      const q = userSearch.toLowerCase();
      list = list.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.phone?.includes(q),
      );
    }
    if (roleFilter !== "all") list = list.filter((u) => u.role === roleFilter);
    return list;
  }, [users, userSearch, roleFilter]);

  // ── Productos ─────────────────────────────────────────────────────────────
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];
    if (searchTerm)
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    if (categoryFilter !== "Todas")
      filtered = filtered.filter((p) => p.category === categoryFilter);
    if (promoFilter === "promo") filtered = filtered.filter((p) => p.promo);
    else if (promoFilter === "no-promo")
      filtered = filtered.filter((p) => !p.promo);
    filtered.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "name") cmp = a.name.localeCompare(b.name);
      else if (sortBy === "price")
        cmp = parseFloat(a.price) - parseFloat(b.price);
      else if (sortBy === "stock")
        cmp = parseFloat(a.stock) - parseFloat(b.stock);
      else if (sortBy === "category")
        cmp = a.category.localeCompare(b.category);
      return sortOrder === "asc" ? cmp : -cmp;
    });
    return filtered;
  }, [products, searchTerm, categoryFilter, sortBy, sortOrder, promoFilter]);

  const toggleSort = (field) => {
    if (sortBy === field) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("Todas");
    setSortBy("name");
    setSortOrder("asc");
    setPromoFilter("all");
  };

  // ── TABS ──────────────────────────────────────────────────────────────────
  const tabs = [
    { key: "products", icon: <Package size={20} />, label: "Productos" },
    { key: "orders", icon: <ShoppingCart size={20} />, label: "Pedidos" },
    { key: "users", icon: <Users size={20} />, label: "Usuarios" },
    { key: "carousel", icon: <ImageIcon size={20} />, label: "Carrusel" },
  ];

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: theme.bgSecondary }}
    >
      <Toaster position="top-right" />

      {/* Navbar */}
      <div
        className="p-4 flex justify-between items-center shadow-lg"
        style={{ backgroundColor: theme.card, color: theme.text }}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">🥖</span>
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
            className="p-2 rounded-full transition-all hover:brightness-110"
            style={{ backgroundColor: theme.bgSecondary }}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={() => setUser(null)}
            className="px-4 py-2 rounded-lg font-semibold transition-all hover:brightness-110"
            style={{ backgroundColor: theme.bgSecondary }}
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-8 max-w-7xl mx-auto">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: "Ventas Totales",
              value: `$${totalSales.toLocaleString("es-MX")}`,
              color: "border-green-500 text-green-600",
              icon: <CreditCard size={18} />,
            },
            {
              label: "Pedidos Activos",
              value: orders.length,
              sub: `${pendingOrders} pendientes`,
              color: "border-blue-500 text-blue-600",
              icon: <ShoppingCart size={18} />,
            },
            {
              label: "Productos",
              value: products.length,
              color: `border-amber-500`,
              icon: <Tag size={18} />,
              valueColor: theme.primary,
            },
            {
              label: "Usuarios",
              value: users.length || "—",
              color: "border-orange-400 text-orange-500",
              icon: <Users size={18} />,
            },
          ].map(({ label, value, sub, color, icon, valueColor }) => (
            <div
              key={label}
              className={`p-6 rounded-xl shadow-lg border-b-4 ${color}`}
              style={{ backgroundColor: theme.card }}
            >
              <p
                className="font-semibold flex items-center gap-2"
                style={{ color: theme.textSecondary }}
              >
                {icon} {label}
              </p>
              <p
                className="text-4xl font-extrabold mt-2"
                style={{ color: valueColor }}
              >
                {value}
              </p>
              {sub && (
                <p
                  className="text-sm mt-1"
                  style={{ color: theme.textSecondary }}
                >
                  {sub}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Tabs + botones de acción */}
        <div className="flex flex-wrap gap-4 mb-8">
          {tabs.map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveSection(key)}
              className="px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all hover:brightness-110 active:scale-95"
              style={{
                backgroundColor:
                  activeSection === key ? theme.primary : theme.bgSecondary,
                color: activeSection === key ? "white" : theme.text,
              }}
            >
              {icon} {label}
            </button>
          ))}
          <div className="flex-1" />
          {activeSection === "products" && (
            <>
              <button
                onClick={() => openProductModal()}
                className="px-6 py-3 rounded-lg font-bold text-white flex items-center gap-2 transition-all hover:brightness-110 active:scale-95"
                style={{ backgroundColor: theme.primary }}
              >
                <Plus size={20} /> Nuevo Producto
              </button>
              {["all", "year", "month"].map((t) => (
                <button
                  key={t}
                  onClick={() => generateReport(t)}
                  className="px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all hover:brightness-110 active:scale-95"
                  style={{
                    backgroundColor: theme.bgSecondary,
                    color: theme.text,
                  }}
                >
                  <FileSpreadsheet size={20} /> Reporte{" "}
                  {t === "all" ? "Total" : t === "year" ? "Año" : "Mes"}
                </button>
              ))}
            </>
          )}
        </div>

        {/* ═══ SECCIÓN: PRODUCTOS ═══ */}
        {activeSection === "products" && (
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
            <div className="mb-6 space-y-4">
              <div className="flex gap-4 items-center flex-wrap">
                <div className="flex-1 min-w-[200px] relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    size={20}
                    style={{ color: theme.textSecondary }}
                  />
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border outline-none"
                    style={{
                      backgroundColor: theme.bgSecondary,
                      color: theme.text,
                      borderColor: theme.border,
                    }}
                  />
                </div>
              </div>
              <div className="flex gap-4 items-center flex-wrap">
                <Filter size={18} style={{ color: theme.textSecondary }} />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg border outline-none"
                  style={{
                    backgroundColor: theme.bgSecondary,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                >
                  <option value="Todas">Todas las categorías</option>
                  <option value="Pan Dulce">Pan Dulce</option>
                  <option value="Pan Salado">Pan Salado</option>
                  <option value="Pasteles">Pasteles</option>
                  <option value="Galletas">Galletas</option>
                </select>
                <select
                  value={promoFilter}
                  onChange={(e) => setPromoFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg border outline-none"
                  style={{
                    backgroundColor: theme.bgSecondary,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                >
                  <option value="all">Todas las promos</option>
                  <option value="promo">Solo promociones</option>
                  <option value="no-promo">Sin promoción</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 rounded-lg border outline-none"
                  style={{
                    backgroundColor: theme.bgSecondary,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                >
                  <option value="name">Ordenar por Nombre</option>
                  <option value="price">Ordenar por Precio</option>
                  <option value="stock">Ordenar por Stock</option>
                  <option value="category">Ordenar por Categoría</option>
                </select>
                <button
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="px-4 py-2 rounded-lg border flex items-center gap-2 transition-all hover:brightness-110"
                  style={{
                    backgroundColor: theme.bgSecondary,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                >
                  <ArrowUpDown size={18} />{" "}
                  {sortOrder === "asc" ? "Ascendente" : "Descendente"}
                </button>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 rounded-lg font-semibold transition-all hover:brightness-110"
                  style={{ backgroundColor: theme.primary, color: "white" }}
                >
                  Resetear
                </button>
              </div>
              <div className="text-sm" style={{ color: theme.textSecondary }}>
                Mostrando {filteredAndSortedProducts.length} de{" "}
                {products.length} productos
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr style={{ borderColor: theme.border }}>
                    {[
                      "Imagen",
                      "Nombre",
                      "Precio",
                      "Stock",
                      "Categoría",
                      "Promo",
                      "Acciones",
                    ].map((h, i) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-medium uppercase cursor-pointer"
                        style={{ color: theme.textSecondary }}
                        onClick={() =>
                          ["Nombre", "Precio", "Stock", "Categoría"].includes(
                            h,
                          ) &&
                          toggleSort(
                            ["name", "price", "stock", "category"][
                              [
                                "Nombre",
                                "Precio",
                                "Stock",
                                "Categoría",
                              ].indexOf(h)
                            ],
                          )
                        }
                      >
                        <div className="flex items-center gap-1">
                          {h}{" "}
                          {sortBy ===
                            ["", "name", "price", "stock", "category", "", ""][
                              i
                            ] && <ArrowUpDown size={14} />}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedProducts.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-4 py-8 text-center"
                        style={{ color: theme.textSecondary }}
                      >
                        No se encontraron productos con los filtros aplicados
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedProducts.map((p) => (
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
                          {p.stock} pzas
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
                              className="p-2 rounded-lg text-blue-600 transition-all"
                              style={{
                                backgroundColor: darkMode
                                  ? "rgba(59,130,246,0.1)"
                                  : "rgba(191,219,254,0.3)",
                              }}
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => deleteProduct(p._id)}
                              className="p-2 rounded-lg text-red-600 transition-all"
                              style={{
                                backgroundColor: darkMode
                                  ? "rgba(239,68,68,0.1)"
                                  : "rgba(254,202,202,0.3)",
                              }}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══ SECCIÓN: PEDIDOS ═══ */}
        {activeSection === "orders" && (
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
                    <tr>
                      {[
                        "ID",
                        "Cliente",
                        "Total",
                        "Peso",
                        "Método",
                        "Estado",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-6 py-3 text-left text-xs font-medium uppercase"
                          style={{ color: theme.textSecondary }}
                        >
                          {h}
                        </th>
                      ))}
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
                        <td className="px-6 py-4" style={{ color: theme.text }}>
                          {o.weight}kg
                        </td>
                        <td className="px-6 py-4" style={{ color: theme.text }}>
                          {o.method === "delivery"
                            ? "🚴 Local"
                            : "📦 Paquetería"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${o.status === "delivered" ? "bg-green-100 text-green-800" : o.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}`}
                          >
                            {o.status === "delivered"
                              ? "Entregado"
                              : o.status === "pending"
                                ? "Pendiente"
                                : o.status === "transit"
                                  ? "En tránsito"
                                  : o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ═══ SECCIÓN: USUARIOS ═══ */}
        {activeSection === "users" && (
          <div
            className="p-6 rounded-xl shadow-lg"
            style={{ backgroundColor: theme.card }}
          >
            <div
              className="flex justify-between items-center border-b pb-4 mb-6"
              style={{ borderColor: theme.border }}
            >
              <h2 className="text-2xl font-bold" style={{ color: theme.text }}>
                Gestión de Usuarios
              </h2>
              <button
                onClick={fetchUsers}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:brightness-110"
                style={{
                  backgroundColor: theme.bgSecondary,
                  color: theme.text,
                }}
              >
                🔄 Actualizar
              </button>
            </div>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex-1 min-w-[200px] relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  size={18}
                  style={{ color: theme.textSecondary }}
                />
                <input
                  type="text"
                  placeholder="Buscar por nombre, correo o teléfono..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border outline-none"
                  style={{
                    backgroundColor: theme.bgSecondary,
                    color: theme.text,
                    borderColor: theme.border,
                  }}
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border outline-none"
                style={{
                  backgroundColor: theme.bgSecondary,
                  color: theme.text,
                  borderColor: theme.border,
                }}
              >
                <option value="all">Todos los roles</option>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <span
                className="flex items-center text-sm px-3"
                style={{ color: theme.textSecondary }}
              >
                {filteredUsers.length} de {users.length} usuarios
              </span>
            </div>

            {usersLoading ? (
              <div className="flex justify-center py-12">
                <svg
                  className="animate-spin h-8 w-8"
                  style={{ color: theme.primary }}
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
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              </div>
            ) : filteredUsers.length === 0 ? (
              <p
                className="text-center py-12"
                style={{ color: theme.textSecondary }}
              >
                {users.length === 0
                  ? "No se encontraron usuarios"
                  : "Sin resultados para tu búsqueda"}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      {["Usuario", "Correo", "Teléfono", "Rol", "Acciones"].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left text-xs font-medium uppercase"
                            style={{ color: theme.textSecondary }}
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const role = roleInfo(u.role);
                      return (
                        <tr
                          key={u._id}
                          className="border-t transition-colors"
                          style={{ borderColor: theme.border }}
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                                style={{ backgroundColor: theme.primary }}
                              >
                                {u.name?.charAt(0).toUpperCase() ?? "?"}
                              </div>
                              <span
                                className="font-medium"
                                style={{ color: theme.text }}
                              >
                                {u.name}
                              </span>
                            </div>
                          </td>
                          <td
                            className="px-4 py-4 text-sm"
                            style={{ color: theme.textSecondary }}
                          >
                            {u.email}
                          </td>
                          <td
                            className="px-4 py-4 text-sm"
                            style={{ color: theme.textSecondary }}
                          >
                            {u.phone || (
                              <span className="italic opacity-50">—</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`px-3 py-1 text-xs font-semibold rounded-full ${role.color}`}
                            >
                              {role.label}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openUserModal(u)}
                                className="p-2 rounded-lg text-blue-600 transition-all flex items-center gap-1 text-sm font-medium"
                                style={{
                                  backgroundColor: darkMode
                                    ? "rgba(59,130,246,0.1)"
                                    : "rgba(191,219,254,0.3)",
                                }}
                              >
                                <Edit size={16} /> Editar
                              </button>
                              {u._id !== user.id && u.email !== user.email && (
                                <button
                                  onClick={() => deleteUser(u)}
                                  className="p-2 rounded-lg text-red-600 transition-all flex items-center gap-1 text-sm font-medium"
                                  style={{
                                    backgroundColor: darkMode
                                      ? "rgba(239,68,68,0.1)"
                                      : "rgba(254,202,202,0.3)",
                                  }}
                                >
                                  <Trash2 size={16} /> Eliminar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ═══ SECCIÓN: CARRUSEL ═══ */}
        {activeSection === "carousel" && (
          <div
            className="p-6 rounded-xl shadow-lg"
            style={{ backgroundColor: theme.card }}
          >
            <div
              className="flex justify-between items-center border-b pb-4 mb-6"
              style={{ borderColor: theme.border }}
            >
              <div>
                <h2
                  className="text-2xl font-bold"
                  style={{ color: theme.text }}
                >
                  Carrusel de Banners
                </h2>
                <p
                  className="text-sm mt-1"
                  style={{ color: theme.textSecondary }}
                >
                  Mínimo 1 imagen, máximo 6. Se rotan automáticamente cada 3
                  segundos.
                </p>
              </div>
              <label
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-white cursor-pointer transition-all hover:brightness-110 ${carouselImages.length >= 6 || carouselUploading ? "opacity-50 cursor-not-allowed" : ""}`}
                style={{ backgroundColor: theme.primary }}
              >
                {carouselUploading ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                ) : (
                  <Upload size={18} />
                )}
                {carouselUploading ? "Subiendo..." : "Subir imagen"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={carouselImages.length >= 6 || carouselUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadCarouselImage(file);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
            <p className="text-sm mb-4" style={{ color: theme.textSecondary }}>
              {carouselImages.length} / 6 imágenes
            </p>

            {carouselLoading ? (
              <div className="flex justify-center py-12">
                <svg
                  className="animate-spin h-8 w-8"
                  style={{ color: theme.primary }}
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
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              </div>
            ) : carouselImages.length === 0 ? (
              <div
                className="text-center py-16 border-2 border-dashed rounded-xl"
                style={{ borderColor: theme.border }}
              >
                <ImageIcon
                  size={48}
                  className="mx-auto mb-3 opacity-30"
                  style={{ color: theme.textSecondary }}
                />
                <p style={{ color: theme.textSecondary }}>
                  No hay imágenes en el carrusel
                </p>
                <p
                  className="text-sm mt-1"
                  style={{ color: theme.textSecondary }}
                >
                  Sube la primera imagen con el botón de arriba
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {carouselImages.map((img, idx) => (
                  <div
                    key={img._id ?? idx}
                    className="relative group rounded-xl overflow-hidden border"
                    style={{ borderColor: theme.border }}
                  >
                    <img
                      src={img.url}
                      alt={img.alt ?? `Banner ${idx + 1}`}
                      className="w-full h-44 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                      <button
                        onClick={() => deleteCarouselImage(img._id)}
                        className="opacity-0 group-hover:opacity-100 transition-all bg-red-600 hover:bg-red-700 text-white p-2 rounded-full"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 px-3 py-1.5 text-white text-xs flex justify-between items-center">
                      <span>Imagen {idx + 1}</span>
                      <button
                        onClick={() => deleteCarouselImage(img._id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══ MODAL: PRODUCTO ═══ */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div
            className="w-full max-w-2xl rounded-2xl shadow-2xl"
            style={{ backgroundColor: theme.card }}
          >
            <div className="p-6 border-b" style={{ borderColor: theme.border }}>
              <div className="flex justify-between items-center">
                <h3
                  className="text-2xl font-bold"
                  style={{ color: theme.text }}
                >
                  {editingProduct ? "Editar Producto" : "Nuevo Producto"}
                </h3>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="p-2 rounded-full transition-all"
                  style={{
                    backgroundColor: darkMode
                      ? "rgba(156,163,175,0.1)"
                      : "rgba(229,231,235,0.5)",
                    color: theme.text,
                  }}
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <form
              onSubmit={saveProduct}
              className="p-6 space-y-4 overflow-y-auto max-h-[70vh]"
            >
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
                    Precio ($)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm({ ...productForm, price: e.target.value })
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
                      setProductForm({ ...productForm, weight: e.target.value })
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
                    Stock (piezas)
                  </label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) =>
                      setProductForm({ ...productForm, stock: e.target.value })
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
                    <option value="Pan Dulce">Pan Dulce</option>
                    <option value="Pan Salado">Pan Salado</option>
                    <option value="Pasteles">Pasteles</option>
                    <option value="Galletas">Galletas</option>
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
                    setProductForm({ ...productForm, promo: e.target.checked })
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
                  className="flex-1 py-3 rounded-lg font-bold text-white transition-all hover:brightness-110"
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
                  className="px-6 py-3 rounded-lg font-bold transition-all hover:brightness-110"
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

      {/* ═══ MODAL: USUARIO ═══ */}
      {showUserModal && (
        <UserModal
          editingUser={editingUser}
          userForm={userForm}
          setUserForm={setUserForm}
          onSave={saveUser}
          onClose={() => {
            setShowUserModal(false);
            setEditingUser(null);
          }}
          loading={savingUser}
          theme={theme}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

export default AdminView;
