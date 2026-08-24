import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";
import {
  LuLeaf,
  LuMaximize2,
  LuZoomIn,
  LuZoomOut,
  LuRefreshCw,
  LuSparkles,
} from "react-icons/lu";
import { GiChefToque } from "react-icons/gi";
import { HiSparkles } from "react-icons/hi2";
import { useLanguage } from "../../context/LanguageContext";
import { t, translateItemName, translateItemDescription } from "../../lib/translations";

const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'>
      <rect width='100%' height='100%' fill='#f3ead4'/>
      <text x='50%' y='50%' font-family='Georgia' font-size='22' fill='#b8860b' text-anchor='middle' dy='.3em'>Amutha Surabi</text>
    </svg>
  `);

const ZOOM_LEVELS = [1.0, 1.5, 2.0, 2.5];

export default function ItemDetailModal({ item, onClose }) {
  const { language } = useLanguage();
  const [zoomIndex, setZoomIndex] = useState(0);
  const [isFullViewOpen, setIsFullViewOpen] = useState(false);
  const [fullViewZoom, setFullViewZoom] = useState(1);

  // Keyboard shortcut for escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (isFullViewOpen) setIsFullViewOpen(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullViewOpen, onClose]);

  if (!item) return null;

  const name = translateItemName(item.name, language);
  const description = translateItemDescription(item.name, item.description, language);
  const itemImage = item.image || PLACEHOLDER;
  const currentZoom = ZOOM_LEVELS[zoomIndex];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Soft Warm Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#1C0F0A]/75 backdrop-blur-md"
        />

        {/* Royal Cream & Gold Dialog Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 25 }}
          transition={{ type: "spring", damping: 26, stiffness: 320 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-[#B8860B]/35 bg-gradient-to-b from-[#FFFDF8] via-[#FAF6EC] to-[#F5ECCB] text-[#2B2013] shadow-[0_12px_50px_rgba(166,41,26,0.18)] z-10 my-auto max-h-[92vh] flex flex-col"
        >
          {/* Top Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#B8860B]/20 bg-[#FFF8EA]/80 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2.5 w-2.5 rounded-full bg-[#A6291A] shadow-[0_0_8px_#a6291a] animate-pulse" />
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#8B6914]">
                {t("liveMenu", language)} • {t("viewDetails", language)}
              </span>
            </div>

            <button
              onClick={onClose}
              className="rounded-full p-2 text-[#4A3825] hover:text-[#8B0000] hover:bg-[#A6291A]/10 transition-all focus:outline-none ring-1 ring-[#B8860B]/30 hover:ring-[#A6291A]"
              title={t("close", language)}
            >
              <IoClose size={22} />
            </button>
          </div>

          <div className="overflow-y-auto custom-scrollbar p-6 space-y-6">
            {/* Interactive Image & Zoom Section */}
            <div className="relative rounded-2xl overflow-hidden bg-[#F3EAD4] border border-[#B8860B]/30 shadow-lg group">
              {/* Main Image Viewport with Zoom Scale */}
              <div
                className="relative h-64 sm:h-84 w-full overflow-hidden flex items-center justify-center cursor-pointer select-none"
                onClick={() => setIsFullViewOpen(true)}
              >
                <motion.img
                  key={`zoom-${currentZoom}`}
                  src={itemImage}
                  alt={name}
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 1, scale: currentZoom }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="h-full w-full object-cover transition-transform duration-500 ease-out rounded-xl"
                  onError={(e) => {
                    e.currentTarget.src = PLACEHOLDER;
                  }}
                />

                {/* Gradient Light Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#2B2013]/60 via-transparent to-black/10 pointer-events-none" />

                {/* Hint badge top-left */}
                <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 rounded-full bg-[#FFFDF8]/90 border border-[#B8860B]/40 px-3 py-1 text-[11px] font-bold text-[#8B6914] backdrop-blur-md shadow-md">
                  <LuSparkles size={13} className="text-[#A6291A]" />
                  <span>{t("clickToZoom", language)}</span>
                </div>

                {/* Full View Expand Trigger */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFullViewOpen(true);
                  }}
                  className="absolute bottom-3.5 right-3.5 flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#A6291A] via-[#B8860B] to-[#D4AF37] hover:from-[#8B0000] hover:to-[#B8860B] text-white px-4 py-2 text-xs font-extrabold shadow-lg transition-all hover:scale-105"
                >
                  <LuMaximize2 size={15} />
                  <span>{t("fullView", language)}</span>
                </button>
              </div>

              {/* Zoom Controls Bar */}
              <div className="px-4 py-3 bg-[#FFFDF8]/95 border-t border-[#B8860B]/20 backdrop-blur-md flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#4A3825]">
                  <LuZoomIn size={16} className="text-[#A6291A]" />
                  <span>{t("zoomView", language)}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {ZOOM_LEVELS.map((lvl, idx) => (
                    <button
                      key={lvl}
                      onClick={() => setZoomIndex(idx)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                        idx === zoomIndex
                          ? "bg-[#A6291A] text-white border-[#A6291A] shadow-md scale-105"
                          : "bg-[#FFF8EA] text-[#4A3825] border-[#B8860B]/30 hover:border-[#A6291A] hover:text-[#8B0000]"
                      }`}
                    >
                      {lvl}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Dish Info & Description Section */}
            <div className="space-y-4 pt-1">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-black bg-gradient-to-r from-[#8B0000] via-[#A6291A] to-[#B8860B] bg-clip-text text-transparent leading-tight tracking-tight">
                  {name}
                </h2>

                {/* Badges Pill Row */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {item.is_popular && (
                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs px-3.5 py-1 font-bold shadow-sm">
                      <LuLeaf className="text-emerald-700" /> {t("popular", language)}
                    </span>
                  )}
                  {item.is_chef_recommended && (
                    <span className="flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-950 text-xs px-3.5 py-1 font-bold shadow-sm">
                      <GiChefToque className="text-amber-700" /> {t("chefsPick", language)}
                    </span>
                  )}
                  {item.is_new && (
                    <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#A6291A] to-[#D4AF37] text-white text-xs px-3.5 py-1 font-black shadow-sm">
                      <HiSparkles /> {t("newBadge", language)}
                    </span>
                  )}
                </div>
              </div>

              {description && (
                <div className="pt-3 border-t border-[#B8860B]/20">
                  <p className="text-sm sm:text-base text-[#3D2C1E] leading-relaxed tracking-wide font-medium">
                    {description}
                  </p>
                </div>
              )}

              {/* Status Bar */}
              <div className="pt-3 flex items-center justify-between text-xs text-[#6B5238] border-t border-[#B8860B]/15">
                <span className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      item.is_available
                        ? "bg-emerald-600 shadow-[0_0_8px_#059669] animate-pulse"
                        : "bg-red-600"
                    }`}
                  />
                  <span className="font-bold text-[#2B2013]">
                    {item.is_available ? t("available", language) : t("notAvailable", language)}
                  </span>
                </span>
                <span className="font-display font-bold text-[#A6291A]">Amutha Surabi Authentic Taste</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Full-Screen Lightbox View (Burgundy Wine & Sandstone Backdrop) */}
        <AnimatePresence>
          {isFullViewOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-60 bg-[#1A0A0E]/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-6 text-white"
            >
              {/* Full View Top Bar */}
              <div className="flex items-center justify-between z-10 bg-black/40 p-3 rounded-2xl border border-amber-500/20 backdrop-blur-md">
                <div>
                  <h3 className="font-display text-xl font-bold bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent">
                    {name}
                  </h3>
                  <p className="text-xs text-amber-200/80">{t("fullView", language)} ({fullViewZoom}x)</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFullViewZoom((z) => Math.max(1, z - 0.5))}
                    disabled={fullViewZoom <= 1}
                    className="rounded-xl bg-white/10 border border-amber-500/30 p-2.5 text-amber-200 hover:bg-amber-400 hover:text-black transition-all disabled:opacity-40"
                    title={t("zoomOut", language)}
                  >
                    <LuZoomOut size={18} />
                  </button>

                  <button
                    onClick={() => setFullViewZoom((z) => Math.min(3, z + 0.5))}
                    disabled={fullViewZoom >= 3}
                    className="rounded-xl bg-white/10 border border-amber-500/30 p-2.5 text-amber-200 hover:bg-amber-400 hover:text-black transition-all disabled:opacity-40"
                    title={t("zoomIn", language)}
                  >
                    <LuZoomIn size={18} />
                  </button>

                  <button
                    onClick={() => setFullViewZoom(1)}
                    className="rounded-xl bg-white/10 border border-amber-500/30 p-2.5 text-amber-200 hover:bg-amber-400 hover:text-black transition-all"
                    title="Reset Zoom"
                  >
                    <LuRefreshCw size={18} />
                  </button>

                  <button
                    onClick={() => setIsFullViewOpen(false)}
                    className="rounded-xl bg-red-950/80 border border-red-500/40 p-2.5 text-red-300 hover:bg-red-500 hover:text-white transition-all ml-2"
                    title={t("close", language)}
                  >
                    <IoClose size={20} />
                  </button>
                </div>
              </div>

              {/* Full View Main Image */}
              <div className="relative flex-1 flex items-center justify-center overflow-hidden my-4">
                <motion.img
                  key={`lightbox-${fullViewZoom}`}
                  src={itemImage}
                  alt={name}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: fullViewZoom, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="max-h-[82vh] max-w-full object-contain cursor-zoom-in rounded-2xl shadow-[0_0_80px_rgba(212,175,55,0.2)] border border-amber-500/30"
                  onClick={() => setFullViewZoom((z) => (z >= 2.5 ? 1 : z + 0.5))}
                  onError={(e) => {
                    e.currentTarget.src = PLACEHOLDER;
                  }}
                />
              </div>

              {/* Full View Footer Bar */}
              <div className="flex items-center justify-center gap-3 z-10 max-w-md mx-auto w-full">
                <div className="flex items-center gap-2 rounded-xl bg-white/10 border border-amber-500/30 px-4 py-2 text-xs font-semibold text-amber-200 backdrop-blur-md">
                  <span>{t("clickToZoom", language)}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
}
