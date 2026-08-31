import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  LuPlus,
  LuPencil,
  LuTrash2,
  LuSearch,
  LuCircleCheck,
  LuCircleX,
  LuFolderInput,
  LuChevronLeft,
  LuChevronRight,
} from "react-icons/lu";
import { api } from "../../lib/api";
import ItemFormModal from "../../components/admin/ItemFormModal";

const ITEMS_PER_PAGE = 10;

export default function MenuManagement() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [mealFilter, setMealFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [selected, setSelected] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [moveTarget, setMoveTarget] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [its, cats] = await Promise.all([api.getItems(), api.getCategories()]);
      setItems(its);
      setCategories(cats);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Reset pagination to page 1 whenever search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, mealFilter, availabilityFilter]);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (categoryFilter !== "all" && i.category_id !== Number(categoryFilter)) return false;
      if (availabilityFilter === "available" && !i.is_available) return false;
      if (availabilityFilter === "unavailable" && i.is_available) return false;
      if (mealFilter === "breakfast" && !i.is_breakfast) return false;
      if (mealFilter === "lunch" && !i.is_lunch) return false;
      if (mealFilter === "snacks" && !i.is_snacks) return false;
      if (mealFilter === "dinner" && !i.is_dinner) return false;
      if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [items, categoryFilter, availabilityFilter, mealFilter, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const safePage = Math.min(currentPage, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, safePage]);

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelected((prev) => {
      const allSelected = filtered.every((i) => prev.has(i.id));
      if (allSelected) return new Set();
      return new Set(filtered.map((i) => i.id));
    });
  };

  const handleCreate = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setModalOpen(true);
  };

  const handleDelete = async (item) => {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    try {
      await api.deleteItem(item.id);
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleSubmit = async (formData) => {
    if (editingItem) {
      await api.updateItem(editingItem.id, formData);
    } else {
      await api.createItem(formData);
    }
    await load();
  };

  const handleToggleAvailability = async (item) => {
    try {
      await api.setAvailability(item.id, !item.is_available);
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleToggleMealSlot = async (item, mealKey) => {
    try {
      await api.toggleMealSlot(item.id, { [mealKey]: !item[mealKey] });
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleBulkAvailability = async (isAvailable) => {
    if (selected.size === 0) return;
    try {
      await api.bulkAvailability([...selected], isAvailable);
      setSelected(new Set());
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleMove = async () => {
    if (selected.size === 0 || !moveTarget) return;
    try {
      await api.moveCategory([...selected], Number(moveTarget));
      setSelected(new Set());
      setMoveTarget("");
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl sm:text-3xl font-bold text-[#8B0000]">Menu Items Management</h1>
          <p className="text-xs sm:text-sm text-[#4A3825] mt-0.5 sm:mt-1">
            {items.length} total items across {categories.length} categories
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#A6291A] via-[#B8860B] to-[#D4AF37] px-4 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-md hover:from-[#8B0000] hover:to-[#B8860B] transition-all cursor-pointer w-full sm:w-auto"
        >
          <LuPlus size={18} /> Add Menu Item
        </button>
      </div>

      {/* Filters (Mobile friendly grid) */}
      <div className="space-y-2.5 sm:space-y-0 sm:flex sm:flex-wrap sm:gap-3">
        <div className="relative flex-1 min-w-full sm:min-w-[200px]">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B8860B]" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items by name..."
            className="w-full rounded-xl bg-[#FFFDF8] border border-[#B8860B]/30 py-2.5 pl-9 pr-3 text-xs sm:text-sm text-[#2B2013] font-semibold outline-none focus:border-[#A6291A] shadow-xs"
          />
        </div>

        <div className="grid grid-cols-2 sm:flex gap-2">
          {/* Meal Slot Filter Dropdown */}
          <select
            value={mealFilter}
            onChange={(e) => setMealFilter(e.target.value)}
            className="rounded-xl bg-[#FFFDF8] border border-[#B8860B]/30 py-2 px-2.5 text-xs sm:text-sm text-[#2B2013] font-semibold outline-none focus:border-[#A6291A] shadow-xs w-full sm:w-auto"
          >
            <option value="all">🍱 All Meals</option>
            <option value="breakfast">🌅 Breakfast</option>
            <option value="lunch">☀️ Lunch</option>
            <option value="snacks">☕ Snacks</option>
            <option value="dinner">🌙 Dinner</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl bg-[#FFFDF8] border border-[#B8860B]/30 py-2 px-2.5 text-xs sm:text-sm text-[#2B2013] font-semibold outline-none focus:border-[#A6291A] shadow-xs w-full sm:w-auto"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="col-span-2 sm:col-span-1 rounded-xl bg-[#FFFDF8] border border-[#B8860B]/30 py-2 px-2.5 text-xs sm:text-sm text-[#2B2013] font-semibold outline-none focus:border-[#A6291A] shadow-xs w-full sm:w-auto"
          >
            <option value="all">All Status</option>
            <option value="available">Available Only</option>
            <option value="unavailable">Unavailable Only</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selected.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-2 sm:gap-3 rounded-xl border border-[#B8860B]/40 bg-[#FFF8EA] p-3 sm:px-4 sm:py-3 shadow-md"
        >
          <span className="text-xs sm:text-sm text-[#8B0000] font-extrabold w-full sm:w-auto">{selected.size} selected</span>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => handleBulkAvailability(true)}
              className="flex items-center gap-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-1 text-xs font-bold hover:bg-emerald-200"
            >
              <LuCircleCheck size={14} /> Available
            </button>
            <button
              onClick={() => handleBulkAvailability(false)}
              className="flex items-center gap-1 rounded-lg bg-red-100 text-red-900 border border-red-300 px-2.5 py-1 text-xs font-bold hover:bg-red-200"
            >
              <LuCircleX size={14} /> Unavailable
            </button>
          </div>
          <div className="flex items-center gap-1.5 w-full sm:w-auto sm:ml-auto">
            <select
              value={moveTarget}
              onChange={(e) => setMoveTarget(e.target.value)}
              className="flex-1 sm:flex-none rounded-lg bg-[#FAF6EC] border border-[#B8860B]/30 py-1 px-2 text-xs text-[#2B2013] font-semibold"
            >
              <option value="">Move to category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleMove}
              disabled={!moveTarget}
              className="flex items-center gap-1 rounded-lg border border-[#B8860B]/40 text-[#8B0000] px-2.5 py-1 text-xs font-bold hover:bg-[#A6291A]/10 disabled:opacity-40"
            >
              <LuFolderInput size={14} /> Move
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="text-xs text-[#4A3825] hover:text-[#8B0000] font-semibold ml-auto"
            >
              Clear
            </button>
          </div>
        </motion.div>
      )}

      {error && <p className="text-sm text-red-600 font-bold mb-4">{error}</p>}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-sm text-[#4A3825] font-semibold animate-pulse">Loading menu items...</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#B8860B]/30 bg-[#FFFDF8] overflow-hidden shadow-lg flex flex-col">
          {/* Mobile Select-All Bar */}
          <div className="md:hidden flex items-center justify-between p-3 border-b border-[#B8860B]/20 bg-[#FAF6EC] text-xs font-bold text-[#8B6914]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filtered.length > 0 && filtered.every((i) => selected.has(i.id))}
                onChange={selectAllFiltered}
                className="accent-[#A6291A] h-4 w-4 rounded"
              />
              <span>Select All ({filtered.length})</span>
            </label>
            <span className="text-[11px] text-[#4A3825]/70">Showing {paginatedItems.length} on page</span>
          </div>

          {/* Mobile Card List (block on mobile, hidden on desktop) */}
          <div className="block md:hidden divide-y divide-[#B8860B]/15">
            {paginatedItems.map((item) => (
              <div key={item.id} className="p-3.5 space-y-3 hover:bg-[#FFF8EA]/50 transition-colors">
                {/* Top Row: Checkbox, Image, Title & Actions */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selected.has(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    className="accent-[#A6291A] h-4 w-4 rounded mt-1 shrink-0"
                  />
                  <div className="h-14 w-14 rounded-xl overflow-hidden bg-[#F3EAD4] border border-[#B8860B]/30 shrink-0">
                    {item.image ? (
                      <img src={item.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[#8B6914]/40 text-[9px] font-bold text-center px-1">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#2B2013] leading-snug truncate">{item.name}</p>
                    <span className="inline-block mt-0.5 text-[11px] font-semibold text-[#8B6914] bg-[#FAF6EC] px-2 py-0.5 rounded-md border border-[#B8860B]/20">
                      {item.category_name}
                    </span>
                  </div>
                  {/* Edit / Delete Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 rounded-lg text-[#8B6914] bg-[#FAF6EC] border border-[#B8860B]/20 hover:text-[#8B0000] hover:border-[#A6291A] transition-colors"
                      title="Edit"
                    >
                      <LuPencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-2 rounded-lg text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
                      title="Delete"
                    >
                      <LuTrash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Status & Meal Slots Controls */}
                <div className="pt-1 flex flex-col gap-2 bg-[#FAF6EC]/60 p-2.5 rounded-xl border border-[#B8860B]/20">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-[#8B6914] uppercase tracking-wider">
                      Meal Slots (IST)
                    </span>
                    <button
                      onClick={() => handleToggleAvailability(item)}
                      className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold transition-all cursor-pointer ${
                        item.is_available
                          ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                          : "bg-red-100 text-red-900 border border-red-300"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${item.is_available ? "bg-emerald-600 animate-pulse" : "bg-red-600"}`} />
                      {item.is_available ? "Available" : "Unavailable"}
                    </button>
                  </div>

                  {/* Meal Badges in 2x2 grid on mobile */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleToggleMealSlot(item, "is_breakfast")}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-all text-left flex items-center justify-between ${
                        item.is_breakfast
                          ? "bg-amber-100 text-amber-900 border-amber-400"
                          : "bg-white text-gray-400 border-gray-200 line-through opacity-60"
                      }`}
                    >
                      <span>🌅 Breakfast</span>
                      <span className="text-[9px]">{item.is_breakfast ? "✓" : "✗"}</span>
                    </button>

                    <button
                      onClick={() => handleToggleMealSlot(item, "is_lunch")}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-all text-left flex items-center justify-between ${
                        item.is_lunch
                          ? "bg-yellow-100 text-yellow-900 border-yellow-400"
                          : "bg-white text-gray-400 border-gray-200 line-through opacity-60"
                      }`}
                    >
                      <span>☀️ Lunch</span>
                      <span className="text-[9px]">{item.is_lunch ? "✓" : "✗"}</span>
                    </button>

                    <button
                      onClick={() => handleToggleMealSlot(item, "is_snacks")}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-all text-left flex items-center justify-between ${
                        item.is_snacks
                          ? "bg-orange-100 text-orange-900 border-orange-400"
                          : "bg-white text-gray-400 border-gray-200 line-through opacity-60"
                      }`}
                    >
                      <span>☕ Snacks</span>
                      <span className="text-[9px]">{item.is_snacks ? "✓" : "✗"}</span>
                    </button>

                    <button
                      onClick={() => handleToggleMealSlot(item, "is_dinner")}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-all text-left flex items-center justify-between ${
                        item.is_dinner
                          ? "bg-indigo-100 text-indigo-900 border-indigo-400"
                          : "bg-white text-gray-400 border-gray-200 line-through opacity-60"
                      }`}
                    >
                      <span>🌙 Dinner</span>
                      <span className="text-[9px]">{item.is_dinner ? "✓" : "✗"}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="p-8 text-center text-[#6B5238] font-bold text-sm">
                No items match your filters.
              </div>
            )}
          </div>

          {/* Desktop Table View (hidden on mobile, block on md screens) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#B8860B]/20 bg-[#FAF6EC] text-left text-xs font-extrabold text-[#8B6914] uppercase tracking-wider">
                  <th className="p-3 w-10">
                    <input
                      type="checkbox"
                      checked={filtered.length > 0 && filtered.every((i) => selected.has(i.id))}
                      onChange={selectAllFiltered}
                      className="accent-[#A6291A]"
                    />
                  </th>
                  <th className="p-3">Dish / Image</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Meal Visibility Checkboxes (IST)</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item) => (
                  <tr key={item.id} className="border-b border-[#B8860B]/10 last:border-0 hover:bg-[#FFF8EA]/60 transition-colors">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selected.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="accent-[#A6291A]"
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl overflow-hidden bg-[#F3EAD4] border border-[#B8860B]/30 shrink-0">
                          {item.image ? (
                            <img src={item.image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-[#8B6914]/40 text-[10px] font-bold">
                              No Image
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-[#2B2013] font-bold">{item.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-[#4A3825] font-semibold">{item.category_name}</td>
                    
                    {/* Meal Slots Toggle Badges */}
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          title="Toggle Breakfast Visibility"
                          onClick={() => handleToggleMealSlot(item, "is_breakfast")}
                          className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                            item.is_breakfast
                              ? "bg-amber-100 text-amber-900 border-amber-400 shadow-xs"
                              : "bg-gray-100 text-gray-400 border-gray-200 line-through opacity-60"
                          }`}
                        >
                          🌅 Breakfast
                        </button>

                        <button
                          title="Toggle Lunch Visibility"
                          onClick={() => handleToggleMealSlot(item, "is_lunch")}
                          className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                            item.is_lunch
                              ? "bg-yellow-100 text-yellow-900 border-yellow-400 shadow-xs"
                              : "bg-gray-100 text-gray-400 border-gray-200 line-through opacity-60"
                          }`}
                        >
                          ☀️ Lunch
                        </button>

                        <button
                          title="Toggle Evening Snacks Visibility"
                          onClick={() => handleToggleMealSlot(item, "is_snacks")}
                          className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                            item.is_snacks
                              ? "bg-orange-100 text-orange-900 border-orange-400 shadow-xs"
                              : "bg-gray-100 text-gray-400 border-gray-200 line-through opacity-60"
                          }`}
                        >
                          ☕ Snacks
                        </button>

                        <button
                          title="Toggle Dinner Visibility"
                          onClick={() => handleToggleMealSlot(item, "is_dinner")}
                          className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                            item.is_dinner
                              ? "bg-indigo-100 text-indigo-900 border-indigo-400 shadow-xs"
                              : "bg-gray-100 text-gray-400 border-gray-200 line-through opacity-60"
                          }`}
                        >
                          🌙 Dinner
                        </button>
                      </div>
                    </td>

                    <td className="p-3">
                      <button
                        onClick={() => handleToggleAvailability(item)}
                        className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                          item.is_available
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                            : "bg-red-100 text-red-900 border border-red-300"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${item.is_available ? "bg-emerald-600 animate-pulse" : "bg-red-600"}`} />
                        {item.is_available ? "Available" : "Unavailable"}
                      </button>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 rounded-lg text-[#8B6914] hover:bg-[#B8860B]/10 hover:text-[#8B0000] transition-colors"
                          title="Edit Item & Images"
                        >
                          <LuPencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-100 transition-colors"
                          title="Delete Item"
                        >
                          <LuTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#6B5238] font-bold text-sm">
                      No items match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Responsive Pagination Controls Bar */}
          {filtered.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 border-t border-[#B8860B]/20 bg-[#FAF6EC]/90 text-xs text-[#4A3825] font-semibold">
              <div className="text-center sm:text-left">
                Showing{" "}
                <span className="font-extrabold text-[#2B2013]">
                  {(safePage - 1) * ITEMS_PER_PAGE + 1}
                </span>{" "}
                to{" "}
                <span className="font-extrabold text-[#2B2013]">
                  {Math.min(safePage * ITEMS_PER_PAGE, filtered.length)}
                </span>{" "}
                of <span className="font-extrabold text-[#8B0000]">{filtered.length}</span> items
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#B8860B]/30 bg-[#FFFDF8] hover:border-[#A6291A] hover:text-[#8B0000] disabled:opacity-40 transition-all cursor-pointer font-bold"
                >
                  <LuChevronLeft size={15} /> Prev
                </button>

                {/* Mobile: compact indicator / Desktop: full number buttons */}
                <div className="sm:hidden px-2 text-xs font-bold text-[#8B0000]">
                  {safePage} / {totalPages}
                </div>

                <div className="hidden sm:flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    const isActive = pageNum === safePage;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`h-7 w-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? "bg-[#A6291A] text-white shadow-sm scale-105"
                            : "bg-[#FFFDF8] border border-[#B8860B]/20 text-[#4A3825] hover:border-[#A6291A] hover:text-[#8B0000]"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#B8860B]/30 bg-[#FFFDF8] hover:border-[#A6291A] hover:text-[#8B0000] disabled:opacity-40 transition-all cursor-pointer font-bold"
                >
                  Next <LuChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <ItemFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        categories={categories}
        item={editingItem}
      />
    </div>
  );
}
