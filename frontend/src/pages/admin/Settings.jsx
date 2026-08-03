import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LuUpload, LuSave, LuKeyRound } from "react-icons/lu";
import { api } from "../../lib/api";

const emptyForm = {
  restaurant_name: "",
  tagline: "",
  address: "",
  phone: "",
  opening_hours: "",
  facebook: "",
  instagram: "",
  whatsapp: "",
  theme_primary: "#D4AF37",
  theme_dark: "#0B0B0F",
  menu_url: "",
};

export default function Settings() {
  const [form, setForm] = useState(emptyForm);
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "" });
  const [pwStatus, setPwStatus] = useState("");

  useEffect(() => {
    api.getSettings().then((s) => {
      setForm({ ...emptyForm, ...s });
      setLogoPreview(s.logo || "");
      setBannerPreview(s.banner || "");
    });
  }, []);

  const field = (key) => ({
    value: form[key] || "",
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ""));
      if (logoFile) fd.append("logo", logoFile);
      if (bannerFile) fd.append("banner", bannerFile);
      const updated = await api.updateSettings(fd);
      setForm({ ...emptyForm, ...updated });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwStatus("");
    try {
      await api.changePassword(pwForm.currentPassword, pwForm.newPassword);
      setPwStatus("success");
      setPwForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setPwStatus(err.message);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold gold-text">Restaurant Settings</h1>
        <p className="text-sm text-cream/50 mt-1">Manage your restaurant profile shown on the digital menu</p>
      </div>

      <form onSubmit={handleSave} className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card gold-border rounded-2xl p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold text-cream mb-1">Profile</h2>

          <Field label="Restaurant Name">
            <input {...field("restaurant_name")} className={inputCls} />
          </Field>
          <Field label="Tagline">
            <input {...field("tagline")} className={inputCls} placeholder="Experience Authentic Taste" />
          </Field>
          <Field label="Address">
            <textarea {...field("address")} rows={2} className={`${inputCls} resize-none`} />
          </Field>
          <Field label="Phone Number">
            <input {...field("phone")} className={inputCls} placeholder="+91 90000 00000" />
          </Field>
          <Field label="Opening Hours">
            <input {...field("opening_hours")} className={inputCls} placeholder="7:30 AM - 10:30 PM" />
          </Field>
          <Field label="Live Menu URL">
            <input {...field("menu_url")} className={inputCls} placeholder="https://your-domain.com" />
          </Field>
        </div>

        <div className="space-y-6">
          <div className="glass-card gold-border rounded-2xl p-6 space-y-4">
            <h2 className="font-display text-lg font-semibold text-cream mb-1">Branding</h2>

            <ImageField
              label="Restaurant Logo"
              preview={logoPreview}
              onChange={(file, url) => {
                setLogoFile(file);
                setLogoPreview(url);
              }}
            />
            <ImageField
              label="Restaurant Banner"
              preview={bannerPreview}
              wide
              onChange={(file, url) => {
                setBannerFile(file);
                setBannerPreview(url);
              }}
            />

            <div className="grid grid-cols-2 gap-3">
              <Field label="Primary (Gold) Color">
                <div className="flex items-center gap-2">
                  <input type="color" {...field("theme_primary")} className="h-9 w-9 rounded-lg border border-black/10 bg-transparent" />
                  <input {...field("theme_primary")} className={inputCls} />
                </div>
              </Field>
              <Field label="Dark Background">
                <div className="flex items-center gap-2">
                  <input type="color" {...field("theme_dark")} className="h-9 w-9 rounded-lg border border-black/10 bg-transparent" />
                  <input {...field("theme_dark")} className={inputCls} />
                </div>
              </Field>
            </div>
          </div>

          <div className="glass-card gold-border rounded-2xl p-6 space-y-4">
            <h2 className="font-display text-lg font-semibold text-cream mb-1">Social Media</h2>
            <Field label="Facebook URL">
              <input {...field("facebook")} className={inputCls} placeholder="https://facebook.com/..." />
            </Field>
            <Field label="Instagram URL">
              <input {...field("instagram")} className={inputCls} placeholder="https://instagram.com/..." />
            </Field>
            <Field label="WhatsApp Link">
              <input {...field("whatsapp")} className={inputCls} placeholder="https://wa.me/91..." />
            </Field>
          </div>
        </div>

        <div className="lg:col-span-2 flex items-center gap-4">
          {error && <p className="text-sm text-red-400">{error}</p>}
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold-light to-gold px-6 py-2.5 text-sm font-semibold text-black disabled:opacity-60"
          >
            <LuSave size={16} /> {saving ? "Saving..." : "Save Settings"}
          </motion.button>
          {saved && <span className="text-sm text-emerald-400">Saved successfully</span>}
        </div>
      </form>

      <div className="glass-card gold-border rounded-2xl p-6 mt-8 max-w-md">
        <h2 className="font-display text-lg font-semibold text-cream mb-4 flex items-center gap-2">
          <LuKeyRound size={17} className="text-gold-light" /> Change Password
        </h2>
        <form onSubmit={handlePasswordChange} className="space-y-3">
          <input
            type="password"
            placeholder="Current password"
            value={pwForm.currentPassword}
            onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
            className={inputCls}
            required
          />
          <input
            type="password"
            placeholder="New password (min 6 characters)"
            value={pwForm.newPassword}
            onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
            className={inputCls}
            required
            minLength={6}
          />
          <button
            type="submit"
            className="rounded-xl gold-border px-5 py-2.5 text-sm font-medium text-gold-light hover:bg-gold/10"
          >
            Update Password
          </button>
          {pwStatus === "success" && <p className="text-sm text-emerald-400">Password updated.</p>}
          {pwStatus && pwStatus !== "success" && <p className="text-sm text-red-400">{pwStatus}</p>}
        </form>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl bg-surface-2/70 border border-black/10 py-2.5 px-3 text-sm text-cream outline-none focus:border-gold/50";

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-cream/60 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function ImageField({ label, preview, onChange, wide }) {
  return (
    <div>
      <label className="block text-xs font-medium text-cream/60 mb-1.5">{label}</label>
      <div className="flex items-center gap-4">
        <div
          className={`rounded-xl overflow-hidden bg-surface-2 border border-black/10 flex items-center justify-center shrink-0 ${
            wide ? "h-16 w-28" : "h-16 w-16"
          }`}
        >
          {preview ? (
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <LuUpload className="text-cream/30" size={18} />
          )}
        </div>
        <label className="cursor-pointer rounded-lg gold-border px-3 py-1.5 text-xs font-medium text-gold-light hover:bg-gold/10">
          Upload
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onChange(file, URL.createObjectURL(file));
            }}
          />
        </label>
      </div>
    </div>
  );
}
