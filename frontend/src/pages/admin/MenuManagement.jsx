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
} from "react-icons/lu";
import { api } from "../../lib/api";
import ItemFormModal from "../../components/admin/ItemFormModal";

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
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#8B0000]">Menu Items Management</h1>
          <p className="text-sm text-[#4A3825] mt-1">{items.length} items across {categories.length} categories</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#A6291A] via-[#B8860B] to-[#D4AF37] px-4 py-2.5 text-sm font-extrabold text-white shadow-md hover:from-[#8B0000] hover:to-[#B8860B] transition-all cursor-pointer"
        >
          <LuPlus size={18} /> Add Menu Item
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B8860B]" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items by name..."
            className="w-full rounded-xl bg-[#FFFDF8] border border-[#B8860B]/30 py-2 pl-9 pr-3 text-sm text-[#2B2013] font-semibold outline-none focus:border-[#A6291A]"
          />
        </div>

        {/* Meal Slot Filter Dropdown */}
        <select
          value={mealFilter}
          onChange={(e) => setMealFilter(e.target.value)}
          className="rounded-xl bg-[#FFFDF8] border border-[#B8860B]/30 py-2 px-3 text-sm text-[#2B2013] font-semibold outline-none focus:border-[#A6291A]"
        >
          <option value="all">🍱 All Meal Slots</option>
          <option value="breakfast">🌅 Breakfast Only</option>
          <option value="lunch">☀️ Lunch Only</option>
          <option value="snacks">☕ Snacks Only</option>
          <option value="dinner">🌙 Dinner Only</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl bg-[#FFFDF8] border border-[#B8860B]/30 py-2 px-3 text-sm text-[#2B2013] font-semibold outline-none focus:border-[#A6291A]"
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
          className="rounded-xl bg-[#FFFDF8] border border-[#B8860B]/30 py-2 px-3 text-sm text-[#2B2013] font-semibold outline-none focus:border-[#A6291A]"
        >
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>
      </div>

      {selected.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-3 mb-5 rounded-xl border border-[#B8860B]/40 bg-[#FFF8EA] px-4 py-3 shadow-md"
        >
          <span className="text-sm text-[#8B0000] font-extrabold">{selected.size} selected</span>
          <button
            onClick={() => handleBulkAvailability(true)}
            className="flex items-center gap-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1.5 text-xs font-bold hover:bg-emerald-200"
          >
            <LuCircleCheck size={14} /> Mark Available
          </button>
          <button
            onClick={() => handleBulkAvailability(false)}
            className="flex items-center gap-1 rounded-lg bg-red-100 text-red-900 border border-red-300 px-3 py-1.5 text-xs font-bold hover:bg-red-200"
          >
            <LuCircleX size={14} /> Mark Unavailable
          </button>
          <div className="flex items-center gap-1.5">
            <select
              value={moveTarget}
              onChange={(e) => setMoveTarget(e.target.value)}
              className="rounded-lg bg-[#FAF6EC] border border-[#B8860B]/30 py-1.5 px-2 text-xs text-[#2B2013] font-semibold"
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
              className="flex items-center gap-1 rounded-lg border border-[#B8860B]/40 text-[#8B0000] px-3 py-1.5 text-xs font-bold hover:bg-[#A6291A]/10 disabled:opacity-40"
            >
              <LuFolderInput size={14} /> Move
            </button>
          </div>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs text-[#4A3825] hover:text-[#8B0000] font-semibold"
          >
            Clear selection
          </button>
        </motion.div>
      )}

      {error && <p className="text-sm text-red-600 font-bold mb-4">{error}</p>}

      {loading ? (
        <p className="text-sm text-[#4A3825] font-semibold">Loading items...</p>
      ) : (
        <div className="rounded-2xl border border-[#B8860B]/30 bg-[#FFFDF8] overflow-hidden shadow-lg">
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
                <th className="p-3 hidden sm:table-cell">Category</th>
                <th className="p-3">Meal Visibility Checkboxes (IST)</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
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
                        <p className="text-xs text-[#4A3825] sm:hidden">{item.category_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 hidden sm:table-cell text-[#4A3825] font-semibold">{item.category_name}</td>
                  
                  {/* Creative Meal Slots Toggle Badges (🌅 Breakfast, ☀️ Lunch, ☕ Evening Snacks, 🌙 Dinner) */}
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
