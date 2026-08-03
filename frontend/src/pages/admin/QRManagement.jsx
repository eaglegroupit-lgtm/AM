import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { motion } from "framer-motion";
import { LuDownload, LuCopy, LuCheck, LuRefreshCw } from "react-icons/lu";
import { api } from "../../lib/api";

const THEMES = [
  { id: "classic-gold", label: "Classic Gold", dark: "#0b0b0f", light: "#f3d878" },
  { id: "gold-on-black", label: "Gold on Black", dark: "#d4af37", light: "#0b0b0f" },
  { id: "elegant-white", label: "Elegant White", dark: "#1a1a1a", light: "#ffffff" },
  { id: "midnight", label: "Midnight Navy", dark: "#f3d878", light: "#0a1128" },
];

export default function QRManagement() {
  const [settings, setSettings] = useState(null);
  const [url, setUrl] = useState("");
  const [theme, setTheme] = useState(THEMES[0]);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    api.getSettings().then((s) => {
      setSettings(s);
      setUrl(s.menu_url || window.location.origin);
    });
  }, []);

  useEffect(() => {
    if (!url || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, url, {
      width: 320,
      margin: 2,
      color: { dark: theme.dark, light: theme.light },
      errorCorrectionLevel: "H",
    }).catch(() => {});
  }, [url, theme]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `amutha-surabi-menu-qr-${theme.id}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold gold-text">QR Code Management</h1>
        <p className="text-sm text-cream/50 mt-1">
          Generate, preview and download the QR code that opens your digital menu.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card gold-border rounded-2xl p-6">
          <label className="block text-xs font-medium text-cream/60 mb-1.5">Restaurant Menu URL</label>
          <div className="flex gap-2 mb-6">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 rounded-xl bg-surface-2/70 border border-black/10 py-2.5 px-3 text-sm text-cream outline-none focus:border-gold/50"
            />
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-xl gold-border px-3 text-xs font-medium text-gold-light hover:bg-gold/10"
            >
              {copied ? <LuCheck size={14} /> : <LuCopy size={14} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="text-xs text-cream/40 mb-6">
            This should be the public URL customers land on when they scan the QR code (e.g. your deployed menu
            domain). Update it in <span className="text-gold-light">Settings</span> once you deploy, or edit it here
            for preview purposes.
          </p>

          <label className="block text-xs font-medium text-cream/60 mb-2">QR Theme</label>
          <div className="grid grid-cols-2 gap-3">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t)}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                  theme.id === t.id ? "border-gold/60 bg-gold/10" : "border-black/10 hover:border-black/20"
                }`}
              >
                <span
                  className="h-8 w-8 rounded-md shrink-0 border border-black/10"
                  style={{ background: t.light }}
                >
                  <span className="block h-3 w-3 m-auto mt-2.5 rounded-sm" style={{ background: t.dark }} />
                </span>
                <span className="text-xs font-medium text-cream/80">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card gold-border rounded-2xl p-6 flex flex-col items-center justify-center">
          <motion.div
            key={theme.id + url}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-5 bg-black/5 gold-glow"
          >
            <canvas ref={canvasRef} className="rounded-lg" />
          </motion.div>

          <p className="mt-4 font-display text-sm text-cream/60 text-center">
            Scan to preview {settings?.restaurant_name || "Amutha Surabi Restaurant"}'s digital menu
          </p>

          <div className="flex gap-3 mt-5">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold-light to-gold px-5 py-2.5 text-sm font-semibold text-black"
            >
              <LuDownload size={16} /> Download PNG
            </button>
            <button
              onClick={() => setTheme({ ...theme })}
              className="flex items-center gap-2 rounded-xl gold-border px-4 py-2.5 text-sm font-medium text-gold-light hover:bg-gold/10"
            >
              <LuRefreshCw size={15} /> Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 glass-card gold-border rounded-2xl p-6">
        <h2 className="font-display text-lg font-semibold text-cream mb-2">How to use</h2>
        <ol className="list-decimal list-inside space-y-1.5 text-sm text-cream/60">
          <li>Deploy the customer menu (frontend) and note its public URL.</li>
          <li>Paste that URL above, choose a QR theme, and download the PNG.</li>
          <li>Print the QR code and place it on tables, counters, or entrances.</li>
          <li>Customers scan it with their phone camera — it opens the menu directly, with no login or app needed.</li>
        </ol>
      </div>
    </div>
  );
}
