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
      if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [items, categoryFilter, availabilityFilter, search]);

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
          <h1 className="font-display text-2xl sm:text-3xl font-bold gold-text">Menu Items</h1>
          <p className="text-sm text-cream/50 mt-1">{items.length} items across {categories.length} categories</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold-light to-gold px-4 py-2.5 text-sm font-semibold text-black"
        >
          <LuPlus size={16} /> Add Menu Item
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/40" size={15} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items..."
            className="w-full rounded-xl bg-surface-2/70 border border-black/10 py-2 pl-9 pr-3 text-sm text-cream outline-none focus:border-gold/50"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-xl bg-surface-2/70 border border-black/10 py-2 px-3 text-sm text-cream outline-none focus:border-gold/50"
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
          className="rounded-xl bg-surface-2/70 border border-black/10 py-2 px-3 text-sm text-cream outline-none focus:border-gold/50"
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
          className="flex flex-wrap items-center gap-3 mb-5 rounded-xl gold-border bg-gold/5 px-4 py-3"
        >
          <span className="text-sm text-gold-light font-medium">{selected.size} selected</span>
          <button
            onClick={() => handleBulkAvailability(true)}
            className="flex items-center gap-1 rounded-lg bg-emerald-500/15 text-emerald-400 px-3 py-1.5 text-xs font-medium hover:bg-emerald-500/25"
          >
            <LuCircleCheck size={14} /> Mark Available
          </button>
          <button
            onClick={() => handleBulkAvailability(false)}
            className="flex items-center gap-1 rounded-lg bg-red-500/15 text-red-400 px-3 py-1.5 text-xs font-medium hover:bg-red-500/25"
          >
            <LuCircleX size={14} /> Mark Unavailable
          </button>
          <div className="flex items-center gap-1.5">
            <select
              value={moveTarget}
              onChange={(e) => setMoveTarget(e.target.value)}
              className="rounded-lg bg-surface-2 border border-black/10 py-1.5 px-2 text-xs text-cream"
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
              className="flex items-center gap-1 rounded-lg gold-border text-gold-light px-3 py-1.5 text-xs font-medium hover:bg-gold/10 disabled:opacity-40"
            >
              <LuFolderInput size={14} /> Move
            </button>
          </div>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs text-cream/40 hover:text-cream"
          >
            Clear selection
          </button>
        </motion.div>
      )}

      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

      {loading ? (
        <p className="text-sm text-cream/40">Loading...</p>
      ) : (
        <div className="glass-card gold-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/10 text-left text-xs text-cream/40">
                <th className="p-3 w-10">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && filtered.every((i) => selected.has(i.id))}
                    onChange={selectAllFiltered}
                    className="accent-gold"
                  />
                </th>
                <th className="p-3">Item</th>
                <th className="p-3 hidden sm:table-cell">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-black/5 last:border-0 hover:bg-black/[0.03]">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selected.has(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="accent-gold"
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg overflow-hidden bg-surface-2 shrink-0">
                        {item.image ? (
                          <img src={item.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-cream/20 text-[10px]">
                            No img
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-cream font-medium">{item.name}</p>
                        <p className="text-xs text-cream/40 sm:hidden">{item.category_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 hidden sm:table-cell text-cream/60">{item.category_name}</td>
                  <td className="p-3 text-gold-light font-medium">₹{Number(item.price).toFixed(0)}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleToggleAvailability(item)}
                      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        item.is_available
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-red-500/15 text-red-400"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${item.is_available ? "bg-emerald-400" : "bg-red-400"}`} />
                      {item.is_available ? "Available" : "Unavailable"}
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-cream/50 hover:text-gold-light p-1.5"
                        aria-label="Edit"
                      >
                        <LuPencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="text-cream/50 hover:text-red-400 p-1.5"
                        aria-label="Delete"
                      >
                        <LuTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-cream/40 text-sm">
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
