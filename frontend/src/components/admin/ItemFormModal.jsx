import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LuX, LuUpload, LuTrash2 } from "react-icons/lu";

const emptyForm = {
  category_id: "",
  name: "",
  description: "",
  price: "",
  is_available: true,
  is_popular: false,
  is_chef_recommended: false,
  is_new: false,
};

export default function ItemFormModal({ open, onClose, onSubmit, categories, item }) {
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [removeImage, setRemoveImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(
        item
          ? {
              category_id: item.category_id,
              name: item.name,
              description: item.description || "",
              price: item.price,
              is_available: item.is_available,
              is_popular: item.is_popular,
              is_chef_recommended: item.is_chef_recommended,
              is_new: item.is_new,
            }
          : { ...emptyForm, category_id: categories[0]?.id || "" }
      );
      setImageFile(null);
      setImagePreview(item?.image || "");
      setRemoveImage(false);
      setError("");
    }
  }, [open, item, categories]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setRemoveImage(false);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.category_id || !form.name.trim()) {
      setError("Category and name are required.");
      return;
    }

    const fd = new FormData();
    fd.append("category_id", form.category_id);
    fd.append("name", form.name.trim());
    fd.append("description", form.description);
    fd.append("price", form.price !== "" ? form.price : "0");
    fd.append("is_available", form.is_available);
    fd.append("is_popular", form.is_popular);
    fd.append("is_chef_recommended", form.is_chef_recommended);
    fd.append("is_new", form.is_new);
    if (imageFile) fd.append("image", imageFile);
    if (removeImage) fd.append("remove_image", "true");

    setSaving(true);
    try {
      await onSubmit(fd);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[4%] bottom-[4%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-lg z-50 overflow-y-auto rounded-3xl glass-card gold-border gold-glow bg-surface p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-semibold gold-text">
                {item ? "Edit Menu Item" : "Add Menu Item"}
              </h2>
              <button onClick={onClose} className="text-cream/50 hover:text-gold-light">
                <LuX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-cream/60 mb-1.5">Food Image</label>
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-xl overflow-hidden bg-surface-2 border border-black/10 flex items-center justify-center shrink-0">
                    {imagePreview && !removeImage ? (
                      <img src={imagePreview} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <LuUpload className="text-cream/30" size={22} />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="cursor-pointer rounded-lg gold-border px-3 py-1.5 text-xs font-medium text-gold-light hover:bg-gold/10 text-center">
                      Choose Image
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                    {imagePreview && !removeImage && (
                      <button
                        type="button"
                        onClick={() => {
                          setRemoveImage(true);
                          setImageFile(null);
                          setImagePreview("");
                        }}
                        className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
                      >
                        <LuTrash2 size={13} /> Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-cream/60 mb-1.5">Category</label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                  className="w-full rounded-xl bg-surface-2/70 border border-black/10 py-2.5 px-3 text-sm text-cream outline-none focus:border-gold/50"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-cream/60 mb-1.5">Food Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-xl bg-surface-2/70 border border-black/10 py-2.5 px-3 text-sm text-cream outline-none focus:border-gold/50"
                  placeholder="e.g. Paneer Butter Masala"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-cream/60 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full rounded-xl bg-surface-2/70 border border-black/10 py-2.5 px-3 text-sm text-cream outline-none focus:border-gold/50 resize-none"
                  placeholder="Short appetizing description"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-cream/60 mb-1.5">Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  className="w-full rounded-xl bg-surface-2/70 border border-black/10 py-2.5 px-3 text-sm text-cream outline-none focus:border-gold/50"
                  placeholder="0"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Toggle
                  label="Available"
                  checked={form.is_available}
                  onChange={(v) => setForm((f) => ({ ...f, is_available: v }))}
                />
                <Toggle
                  label="Popular"
                  checked={form.is_popular}
                  onChange={(v) => setForm((f) => ({ ...f, is_popular: v }))}
                />
                <Toggle
                  label="Chef Recommended"
                  checked={form.is_chef_recommended}
                  onChange={(v) => setForm((f) => ({ ...f, is_chef_recommended: v }))}
                />
                <Toggle label="New Item" checked={form.is_new} onChange={(v) => setForm((f) => ({ ...f, is_new: v }))} />
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-black/10 py-2.5 text-sm font-medium text-cream/70 hover:bg-black/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-gradient-to-r from-gold-light to-gold py-2.5 text-sm font-semibold text-black disabled:opacity-60"
                >
                  {saving ? "Saving..." : item ? "Save Changes" : "Add Item"}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-xs font-medium transition-colors ${
        checked ? "border-gold/50 bg-gold/10 text-gold-light" : "border-black/10 text-cream/50"
      }`}
    >
      {label}
      <span
        className={`ml-2 flex h-4 w-7 items-center rounded-full transition-colors ${
          checked ? "bg-gold justify-end" : "bg-black/10 justify-start"
        } px-0.5`}
      >
        <span className="h-3 w-3 rounded-full bg-white shadow ring-1 ring-black/10 block" />
      </span>
    </button>
  );
}
