import React, { useState, useMemo } from "react";

import { Toaster } from "react-hot-toast";
import {
  User,
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
} from "lucide-react";

const AdminView = ({
  theme,
  darkMode,
  setDarkMode,
  user,
  setUser,
  products,
  orders,
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

  const totalSales = orders.reduce((s, o) => s + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === "pending").length;

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (categoryFilter !== "Todas") {
      filtered = filtered.filter((p) => p.category === categoryFilter);
    }

    if (promoFilter === "promo") {
      filtered = filtered.filter((p) => p.promo);
    } else if (promoFilter === "no-promo") {
      filtered = filtered.filter((p) => !p.promo);
    }

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "price":
          comparison = parseFloat(a.price) - parseFloat(b.price);
          break;
        case "stock":
          comparison = parseFloat(a.stock) - parseFloat(b.stock);
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [products, searchTerm, categoryFilter, sortBy, sortOrder, promoFilter]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
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

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: theme.bgSecondary }}
    >
      <Toaster position="top-right" />
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
            <p className="text-sm mt-1" style={{ color: theme.textSecondary }}>
              {pendingOrders} pendientes
            </p>
          </div>
          <div
            className="p-6 rounded-xl shadow-lg border-b-4"
            style={{ backgroundColor: theme.card, borderColor: theme.primary }}
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
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setActiveSection("products")}
            className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all hover:brightness-110 active:scale-95 ${activeSection === "products" ? "text-white" : ""}`}
            style={{
              backgroundColor:
                activeSection === "products"
                  ? theme.primary
                  : theme.bgSecondary,
              color: activeSection === "products" ? "white" : theme.text,
            }}
          >
            <Package size={20} /> Productos
          </button>
          <button
            onClick={() => setActiveSection("orders")}
            className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all hover:brightness-110 active:scale-95 ${activeSection === "orders" ? "text-white" : ""}`}
            style={{
              backgroundColor:
                activeSection === "orders" ? theme.primary : theme.bgSecondary,
              color: activeSection === "orders" ? "white" : theme.text,
            }}
          >
            <ShoppingCart size={20} /> Pedidos
          </button>
          <div className="flex-1"></div>
          <button
            onClick={() => openProductModal()}
            className="px-6 py-3 rounded-lg font-bold text-white flex items-center gap-2 transition-all hover:brightness-110 active:scale-95"
            style={{ backgroundColor: theme.primary }}
          >
            <Plus size={20} /> Nuevo Producto
          </button>
          <button
            onClick={() => generateReport("all")}
            className="px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all hover:brightness-110 active:scale-95"
            style={{ backgroundColor: theme.bgSecondary, color: theme.text }}
          >
            <FileSpreadsheet size={20} /> Reporte Total
          </button>
          <button
            onClick={() => generateReport("year")}
            className="px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all hover:brightness-110 active:scale-95"
            style={{ backgroundColor: theme.bgSecondary, color: theme.text }}
          >
            <FileSpreadsheet size={20} /> Reporte Año
          </button>
          <button
            onClick={() => generateReport("month")}
            className="px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all hover:brightness-110 active:scale-95"
            style={{ backgroundColor: theme.bgSecondary, color: theme.text }}
          >
            <FileSpreadsheet size={20} /> Reporte Mes
          </button>
        </div>
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
                    className="absolute left-3 top-1/2 transform -translate-y-1/2"
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
                <div className="flex items-center gap-2">
                  <Filter size={18} style={{ color: theme.textSecondary }} />
                  <span
                    className="text-sm font-semibold"
                    style={{ color: theme.text }}
                  >
                    Filtros:
                  </span>
                </div>
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
                  <option value="Res">Res</option>
                  <option value="Cerdo">Cerdo</option>
                  <option value="Cortes">Cortes</option>
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
                  <ArrowUpDown size={18} />
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
                    <th
                      className="px-4 py-3 text-left text-xs font-medium uppercase cursor-pointer"
                      style={{ color: theme.textSecondary }}
                      onClick={() => toggleSort("name")}
                    >
                      <div className="flex items-center gap-1">
                        Imagen {sortBy === "name" && <ArrowUpDown size={14} />}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium uppercase cursor-pointer"
                      style={{ color: theme.textSecondary }}
                      onClick={() => toggleSort("name")}
                    >
                      <div className="flex items-center gap-1">
                        Nombre {sortBy === "name" && <ArrowUpDown size={14} />}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium uppercase cursor-pointer"
                      style={{ color: theme.textSecondary }}
                      onClick={() => toggleSort("price")}
                    >
                      <div className="flex items-center gap-1">
                        Precio {sortBy === "price" && <ArrowUpDown size={14} />}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium uppercase cursor-pointer"
                      style={{ color: theme.textSecondary }}
                      onClick={() => toggleSort("stock")}
                    >
                      <div className="flex items-center gap-1">
                        Stock {sortBy === "stock" && <ArrowUpDown size={14} />}
                      </div>
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-medium uppercase cursor-pointer"
                      style={{ color: theme.textSecondary }}
                      onClick={() => toggleSort("category")}
                    >
                      <div className="flex items-center gap-1">
                        Categoría{" "}
                        {sortBy === "category" && <ArrowUpDown size={14} />}
                      </div>
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
                              className="p-2 rounded-lg text-blue-600 transition-all"
                              style={{
                                backgroundColor: darkMode
                                  ? "rgba(59, 130, 246, 0.1)"
                                  : "rgba(191, 219, 254, 0.3)",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = darkMode
                                  ? "rgba(59, 130, 246, 0.25)"
                                  : "rgba(191, 219, 254, 1)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = darkMode
                                  ? "rgba(59, 130, 246, 0.1)"
                                  : "rgba(191, 219, 254, 0.3)";
                              }}
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => deleteProduct(p._id)}
                              className="p-2 rounded-lg text-red-600 transition-all"
                              style={{
                                backgroundColor: darkMode
                                  ? "rgba(239, 68, 68, 0.1)"
                                  : "rgba(254, 202, 202, 0.3)",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = darkMode
                                  ? "rgba(239, 68, 68, 0.25)"
                                  : "rgba(254, 202, 202, 1)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = darkMode
                                  ? "rgba(239, 68, 68, 0.1)"
                                  : "rgba(254, 202, 202, 0.3)";
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
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${o.status === "delivered" ? "bg-green-100 text-green-800" : o.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}`}
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
        )}
      </div>
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
                      ? "rgba(156, 163, 175, 0.1)"
                      : "rgba(229, 231, 235, 0.5)",
                    color: theme.text,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = darkMode
                      ? "rgba(156, 163, 175, 0.25)"
                      : "rgba(229, 231, 235, 1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = darkMode
                      ? "rgba(156, 163, 175, 0.1)"
                      : "rgba(229, 231, 235, 0.5)";
                  }}
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
                    Precio ($/unidad)
                  </label>
                  <input
                    type="number"
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
                    Peso estimado (g)
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
                    <option value="Bollería">Bollería</option>
                    <option value="Pasteles">Pasteles</option>
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
    </div>
  );
};

export default AdminView;
