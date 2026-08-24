import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LuX, LuUpload, LuTrash2, LuCheck } from "react-icons/lu";

const emptyForm = {
  category_id: "",
  name: "",
  description: "",
  price: "",
  is_available: true,
  is_popular: false,
  is_chef_recommended: false,
  is_new: false,
  is_breakfast: true,
  is_lunch: true,
  is_snacks: true,
  is_dinner: true,
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
              is_breakfast: item.is_breakfast !== false,
              is_lunch: item.is_lunch !== false,
              is_snacks: item.is_snacks !== false,
              is_dinner: item.is_dinner !== false,
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
    fd.append("is_breakfast", form.is_breakfast);
    fd.append("is_lunch", form.is_lunch);
    fd.append("is_snacks", form.is_snacks);
    fd.append("is_dinner", form.is_dinner);

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
            className="fixed inset-0 z-50 bg-[#1C0F0A]/70 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[3%] bottom-[3%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-lg z-50 overflow-y-auto rounded-3xl border border-[#B8860B]/35 bg-[#FFFDF8] p-6 text-[#2B2013] shadow-2xl"
          >
            <div className="flex items-center justify-between mb-5 border-b border-[#B8860B]/20 pb-3">
              <h2 className="font-display text-xl font-bold text-[#8B0000]">
                {item ? "Edit Menu Item" : "Add Menu Item"}
              </h2>
              <button onClick={onClose} className="text-[#4A3825] hover:text-[#A6291A]">
                <LuX size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#4A3825] mb-1.5">Food Image</label>
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-xl overflow-hidden bg-[#F3EAD4] border border-[#B8860B]/30 flex items-center justify-center shrink-0">
                    {imagePreview && !removeImage ? (
                      <img src={imagePreview} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <LuUpload className="text-[#8B6914]/40" size={22} />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="cursor-pointer rounded-xl border border-[#B8860B]/40 bg-[#FFF8EA] px-3.5 py-1.5 text-xs font-bold text-[#8B0000] hover:bg-[#A6291A]/10 text-center transition-all">
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
                        className="flex items-center gap-1 text-xs text-red-600 font-semibold hover:text-red-700"
                      >
                        <LuTrash2 size={13} /> Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3825] mb-1.5">Category</label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                  className="w-full rounded-xl bg-[#FAF6EC] border border-[#B8860B]/30 py-2.5 px-3 text-sm text-[#2B2013] font-semibold outline-none focus:border-[#A6291A]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3825] mb-1.5">Food Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-xl bg-[#FAF6EC] border border-[#B8860B]/30 py-2.5 px-3 text-sm text-[#2B2013] font-semibold outline-none focus:border-[#A6291A]"
                  placeholder="e.g. Special Ghee Masal Roast"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3825] mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full rounded-xl bg-[#FAF6EC] border border-[#B8860B]/30 py-2.5 px-3 text-sm text-[#2B2013] font-medium outline-none focus:border-[#A6291A] resize-none"
                  placeholder="Short appetizing description"
                />
              </div>

              {/* Creative Meal Slots Selection Matrix (IST Time Based) */}
              <div className="rounded-2xl border border-[#B8860B]/30 bg-[#FAF6EC] p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold text-[#8B6914] uppercase tracking-wider">
                    Meal Visibility Slots (IST Time)
                  </label>
                  <span className="text-[10px] font-semibold text-[#A6291A]">Checked = Visible</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <MealCheckbox
                    icon="🌅"
                    label="Breakfast"
                    timing="07:00 – 11:30 AM"
                    checked={form.is_breakfast}
                    onChange={(v) => setForm((f) => ({ ...f, is_breakfast: v }))}
                  />
                  <MealCheckbox
                    icon="☀️"
                    label="Lunch"
                    timing="11:30 AM – 04:00 PM"
                    checked={form.is_lunch}
                    onChange={(v) => setForm((f) => ({ ...f, is_lunch: v }))}
                  />
                  <MealCheckbox
                    icon="☕"
                    label="Evening Snacks"
                    timing="04:00 – 07:00 PM"
                    checked={form.is_snacks}
                    onChange={(v) => setForm((f) => ({ ...f, is_snacks: v }))}
                  />
                  <MealCheckbox
                    icon="🌙"
                    label="Dinner"
                    timing="07:00 PM – Overnight"
                    checked={form.is_dinner}
                    onChange={(v) => setForm((f) => ({ ...f, is_dinner: v }))}
                  />
                </div>
              </div>

              {/* General Availability & Badges */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Toggle
                  label="Available Now"
                  checked={form.is_available}
                  onChange={(v) => setForm((f) => ({ ...f, is_available: v }))}
                />
                <Toggle
                  label="Popular Dish"
                  checked={form.is_popular}
                  onChange={(v) => setForm((f) => ({ ...f, is_popular: v }))}
                />
                <Toggle
                  label="Chef Recommended"
                  checked={form.is_chef_recommended}
                  onChange={(v) => setForm((f) => ({ ...f, is_chef_recommended: v }))}
                />
                <Toggle
                  label="New Tag"
                  checked={form.is_new}
                  onChange={(v) => setForm((f) => ({ ...f, is_new: v }))}
                />
              </div>

              {error && <p className="text-xs font-bold text-red-600 bg-red-100 p-2 rounded-lg">{error}</p>}

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-[#B8860B]/30 py-2.5 text-sm font-bold text-[#4A3825] hover:bg-[#A6291A]/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#A6291A] via-[#B8860B] to-[#D4AF37] hover:from-[#8B0000] hover:to-[#B8860B] py-2.5 text-sm font-extrabold text-white shadow-md disabled:opacity-60 transition-all cursor-pointer"
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

function MealCheckbox({ icon, label, timing, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
        checked
          ? "border-[#A6291A] bg-[#FFF8EA] text-[#8B0000] font-bold shadow-sm ring-1 ring-[#A6291A]/40"
          : "border-[#B8860B]/20 bg-[#FFFDF8] text-[#6B5238] hover:border-[#B8860B]/40"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <div>
          <p className="text-xs leading-none font-bold">{label}</p>
          <p className="text-[9px] text-[#4A3825]/70 mt-0.5 font-medium">{timing}</p>
        </div>
      </div>

      <div
        className={`h-5 w-5 rounded-md flex items-center justify-center border transition-all ${
          checked
            ? "bg-[#A6291A] border-[#A6291A] text-white shadow-sm"
            : "border-[#B8860B]/40 bg-white"
        }`}
      >
        {checked && <LuCheck size={13} strokeWidth={3} />}
      </div>
    </button>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
        checked ? "border-[#A6291A] bg-[#FFF8EA] text-[#8B0000]" : "border-[#B8860B]/20 text-[#6B5238]"
      }`}
    >
      {label}
      <span
        className={`ml-2 flex h-4 w-7 items-center rounded-full transition-colors ${
          checked ? "bg-[#A6291A] justify-end" : "bg-[#B8860B]/20 justify-start"
        } px-0.5`}
      >
        <span className="h-3 w-3 rounded-full bg-white shadow block" />
      </span>
    </button>
  );
}
