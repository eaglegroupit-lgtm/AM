import { useEffect, useState } from "react";
import { Reorder, motion } from "framer-motion";
import { LuPlus, LuPencil, LuTrash2, LuGripVertical, LuCheck, LuX } from "react-icons/lu";
import { CategoryIcon } from "../../lib/categoryIcons";
import { api } from "../../lib/api";

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const cats = await api.getCategories();
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

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await api.createCategory({ name: newName.trim() });
      setNewName("");
      await load();
    } catch (e) {
      alert(e.message);
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const saveEdit = async (cat) => {
    if (!editingName.trim()) return;
    try {
      await api.updateCategory(cat.id, { name: editingName.trim() });
      setEditingId(null);
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDelete = async (cat) => {
    if (cat.item_count > 0) {
      alert(`Cannot delete "${cat.name}" — it still has ${cat.item_count} item(s). Move or delete them first.`);
      return;
    }
    if (!confirm(`Delete category "${cat.name}"?`)) return;
    try {
      await api.deleteCategory(cat.id);
      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleReorder = async (newOrder) => {
    setCategories(newOrder);
    try {
      await api.reorderCategories(newOrder.map((c) => c.id));
    } catch (e) {
      alert(e.message);
      await load();
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold gold-text">Categories</h1>
        <p className="text-sm text-cream/50 mt-1">Drag to reorder how categories appear on the menu</p>
      </div>

      <form onSubmit={handleCreate} className="flex gap-3 mb-6">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name..."
          className="flex-1 rounded-xl bg-surface-2/70 border border-black/10 py-2.5 px-4 text-sm text-cream outline-none focus:border-gold/50"
        />
        <button
          type="submit"
          disabled={creating}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold-light to-gold px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-60"
        >
          <LuPlus size={16} /> Add
        </button>
      </form>

      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

      {loading ? (
        <p className="text-sm text-cream/40">Loading...</p>
      ) : (
        <Reorder.Group axis="y" values={categories} onReorder={handleReorder} className="space-y-2">
          {categories.map((cat) => (
            <Reorder.Item
              key={cat.id}
              value={cat}
              className="glass-card gold-border rounded-xl px-4 py-3 flex items-center gap-3 cursor-grab active:cursor-grabbing"
            >
              <LuGripVertical className="text-cream/30 shrink-0" size={16} />
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-gold-light shrink-0">
                <CategoryIcon icon={cat.icon} size={16} />
              </span>

              {editingId === cat.id ? (
                <input
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit(cat)}
                  className="flex-1 rounded-lg bg-surface-2 border border-gold/40 py-1.5 px-2 text-sm text-cream outline-none"
                />
              ) : (
                <span className="flex-1 text-sm text-cream font-medium">{cat.name}</span>
              )}

              <span className="text-xs text-cream/40 shrink-0">{cat.item_count} items</span>

              <div className="flex items-center gap-1 shrink-0">
                {editingId === cat.id ? (
                  <>
                    <button onClick={() => saveEdit(cat)} className="text-emerald-400 p-1.5">
                      <LuCheck size={16} />
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-cream/40 p-1.5">
                      <LuX size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(cat)} className="text-cream/50 hover:text-gold-light p-1.5">
                      <LuPencil size={15} />
                    </button>
                    <button onClick={() => handleDelete(cat)} className="text-cream/50 hover:text-red-400 p-1.5">
                      <LuTrash2 size={15} />
                    </button>
                  </>
                )}
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}
    </div>
  );
}
