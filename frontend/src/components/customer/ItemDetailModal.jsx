import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { LuLeaf, LuMaximize2, LuRotateCcw, LuEye, LuCompass } from "react-icons/lu";
import { GiChefToque } from "react-icons/gi";
import { HiSparkles } from "react-icons/hi2";
import { useLanguage } from "../../context/LanguageContext";
import { t, translateItemName, translateItemDescription } from "../../lib/translations";

const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'>
      <rect width='100%' height='100%' fill='#f3ead4'/>
      <text x='50%' y='50%' font-family='Georgia' font-size='20' fill='#b8860b' text-anchor='middle' dy='.3em'>Amutha Surabi</text>
    </svg>
  `);

// Defines the 3 meaningful angle views requested by user: Top View, Right View, and Left View
const ANGLES = [
  {
    id: "top",
    labelEn: "Top View",
    labelTa: "மேல் பார்வை",
    descEn: "Direct overhead top-down perspective",
    descTa: "மேலிருந்து நேரடி பார்வை",
    badge: "Top 90°",
    transform: "perspective(900px) rotateX(46deg) scale(1.15) translateY(-8px)",
    lightOverlay: "radial-gradient(circle at center, rgba(255,255,255,0.22) 0%, transparent 70%)",
    shadow: "0 25px 35px -5px rgba(0, 0, 0, 0.7)",
  },
  {
    id: "right",
    labelEn: "Right View",
    labelTa: "வலது பக்க பார்வை",
    descEn: "Right side angled perspective",
    descTa: "வலது பக்க 3D பார்வை",
    badge: "Right 45°",
    transform: "perspective(900px) rotateY(-36deg) rotateX(10deg) scale(1.18) translateX(12px)",
    lightOverlay: "linear-gradient(to left, rgba(212,175,55,0.2), transparent 60%)",
    shadow: "-20px 20px 30px -5px rgba(0, 0, 0, 0.7)",
  },
  {
    id: "left",
    labelEn: "Left View",
    labelTa: "இடது பக்க பார்வை",
    descEn: "Left side angled perspective",
    descTa: "இடது பக்க 3D பார்வை",
    badge: "Left 45°",
    transform: "perspective(900px) rotateY(36deg) rotateX(10deg) scale(1.18) translateX(-12px)",
    lightOverlay: "linear-gradient(to right, rgba(212,175,55,0.2), transparent 60%)",
    shadow: "20px 20px 30px -5px rgba(0, 0, 0, 0.7)",
  },
];

export default function ItemDetailModal({ item, onClose }) {
  const { language } = useLanguage();
  const [activeAngleIndex, setActiveAngleIndex] = useState(0);
  const [isFullViewOpen, setIsFullViewOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

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
  const activeAngle = ANGLES[activeAngleIndex];
  
  // Custom per-angle image if available, fallback to main item image
  const defaultImage = item.image || PLACEHOLDER;
  const currentAngleImage =
    (item.image_angles?.[activeAngle.id] || item[`image_${activeAngle.id}`]) || defaultImage;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-gold/30 bg-ink/95 text-cream shadow-2xl z-10 my-auto max-h-[90vh] flex flex-col"
        >
          {/* Top Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gold/15 bg-surface/50 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gold animate-ping" />
              <span className="text-xs font-semibold uppercase tracking-widest text-gold-light">
                {t("liveMenu", language)} • {t("viewDetails", language)}
              </span>
            </div>

            <button
              onClick={onClose}
              className="rounded-full p-2 text-cream/70 hover:text-white hover:bg-gold/20 transition-all focus:outline-none"
              title={t("close", language)}
            >
              <IoClose size={22} />
            </button>
          </div>

          <div className="overflow-y-auto custom-scrollbar p-6 space-y-6">
            {/* Image & Angle Viewer Section */}
            <div className="relative rounded-2xl overflow-hidden bg-black/80 border border-gold/20 shadow-2xl group">
              {/* Active Image Display with 3D perspective viewport */}
              <div
                className="relative h-64 sm:h-80 w-full overflow-hidden flex items-center justify-center cursor-pointer select-none perspective-container"
                onClick={() => setIsFullViewOpen(true)}
              >
                <motion.img
                  key={activeAngle.id}
                  src={currentAngleImage}
                  alt={`${name} - ${activeAngle.labelEn}`}
                  initial={{ opacity: 0.5, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    transform: activeAngle.transform,
                    boxShadow: activeAngle.shadow,
                  }}
                  className="h-full w-full object-cover transition-transform duration-500 ease-out rounded-xl"
                  onError={(e) => {
                    e.currentTarget.src = PLACEHOLDER;
                  }}
                />

                {/* Perspective Directional Light Overlay */}
                <div
                  className="absolute inset-0 pointer-events-none transition-all duration-500"
                  style={{ background: activeAngle.lightOverlay }}
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none" />

                {/* Angle Badge Overlay */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="flex items-center gap-1.5 rounded-full bg-gold text-black text-[11px] font-bold px-3 py-1 shadow-lg backdrop-blur-md">
                    <LuCompass size={13} />
                    {language === "ta" ? activeAngle.labelTa : activeAngle.labelEn}
                  </span>
                </div>

                {/* Full View Expand Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFullViewOpen(true);
                  }}
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-xl bg-surface/90 hover:bg-gold hover:text-black border border-gold/40 px-3.5 py-1.5 text-xs font-semibold text-gold-light backdrop-blur-md shadow-lg transition-all"
                >
                  <LuMaximize2 size={14} />
                  <span>{t("fullView", language)}</span>
                </button>
              </div>

              {/* Angle Switcher Controls (Top View, Right View, Left View) */}
              <div className="p-3.5 bg-surface/90 border-t border-gold/15 backdrop-blur-md">
                <div className="text-[11px] font-medium text-cream/70 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-gold-light font-semibold">
                    <LuRotateCcw size={13} /> {t("threeAngles", language)}
                  </span>
                  <span className="text-gold-light/90 font-medium">
                    {language === "ta" ? activeAngle.descTa : activeAngle.descEn}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {ANGLES.map((angle, idx) => {
                    const isActive = idx === activeAngleIndex;
                    return (
                      <button
                        key={angle.id}
                        onClick={() => setActiveAngleIndex(idx)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                          isActive
                            ? "border-gold bg-gold/25 text-gold-light font-bold shadow-lg ring-1 ring-gold/60 scale-[1.02]"
                            : "border-gold/20 bg-ink/40 text-cream/70 hover:border-gold/40 hover:bg-surface hover:text-cream"
                        }`}
                      >
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-gold/90 mb-0.5">
                          {angle.badge}
                        </span>
                        <span>{language === "ta" ? angle.labelTa : angle.labelEn}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Details Section (Prices removed) */}
            <div className="space-y-3">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-cream leading-tight">{name}</h2>
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  {item.is_popular && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-900/40 border border-emerald-500/40 text-emerald-300 text-xs px-3 py-0.5 font-medium">
                      <LuLeaf /> {t("popular", language)}
                    </span>
                  )}
                  {item.is_chef_recommended && (
                    <span className="flex items-center gap-1 rounded-full bg-amber-900/40 border border-amber-500/40 text-amber-300 text-xs px-3 py-0.5 font-medium">
                      <GiChefToque /> {t("chefsPick", language)}
                    </span>
                  )}
                  {item.is_new && (
                    <span className="flex items-center gap-1 rounded-full bg-gold/20 border border-gold/50 text-gold-light text-xs px-3 py-0.5 font-medium">
                      <HiSparkles /> {t("newBadge", language)}
                    </span>
                  )}
                </div>
              </div>

              {description && (
                <p className="text-sm sm:text-base text-cream/80 leading-relaxed pt-3 border-t border-gold/10">
                  {description}
                </p>
              )}

              {/* Status */}
              <div className="pt-2 flex items-center justify-between text-xs text-cream/60">
                <span className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      item.is_available ? "bg-emerald-400 animate-pulse" : "bg-red-500"
                    }`}
                  />
                  {item.is_available ? t("available", language) : t("notAvailable", language)}
                </span>
                <span className="text-gold-light/60">Amutha Surabi Authentic Taste</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Full-Screen Lightbox View */}
        <AnimatePresence>
          {isFullViewOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-60 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6"
            >
              {/* Full View Header */}
              <div className="flex items-center justify-between z-10">
                <div>
                  <h3 className="font-display text-xl font-bold text-cream">{name}</h3>
                  <p className="text-xs text-gold-light">
                    {t("fullView", language)} • {language === "ta" ? activeAngle.labelTa : activeAngle.labelEn} ({activeAngle.badge})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setZoomLevel((z) => (z >= 2 ? 1 : z + 0.5))}
                    className="rounded-full bg-surface border border-gold/30 p-2.5 text-gold-light hover:bg-gold hover:text-black transition-all"
                    title="Zoom"
                  >
                    <LuEye size={20} />
                  </button>
                  <button
                    onClick={() => setIsFullViewOpen(false)}
                    className="rounded-full bg-surface border border-gold/30 p-2.5 text-cream hover:bg-red-500 hover:text-white transition-all"
                    title={t("close", language)}
                  >
                    <IoClose size={22} />
                  </button>
                </div>
              </div>

              {/* Full View Main Image Display */}
              <div className="relative flex-1 flex items-center justify-center overflow-hidden my-4">
                <motion.img
                  key={`full-${activeAngle.id}-${zoomLevel}`}
                  src={currentAngleImage}
                  alt={name}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: zoomLevel, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{ transform: `${activeAngle.transform} scale(${zoomLevel})` }}
                  className="max-h-[80vh] max-w-full object-contain cursor-zoom-in rounded-2xl shadow-2xl border border-gold/20"
                  onClick={() => setZoomLevel((z) => (z >= 2 ? 1 : z + 0.5))}
                  onError={(e) => {
                    e.currentTarget.src = PLACEHOLDER;
                  }}
                />
              </div>

              {/* Full View Bottom Bar: Angle Selection */}
              <div className="flex items-center justify-center gap-3 z-10 max-w-md mx-auto w-full">
                {ANGLES.map((angle, idx) => (
                  <button
                    key={`full-btn-${angle.id}`}
                    onClick={() => setActiveAngleIndex(idx)}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      idx === activeAngleIndex
                        ? "bg-gold text-black border-gold shadow-lg font-bold"
                        : "bg-surface/80 text-cream/80 border-gold/30 hover:border-gold"
                    }`}
                  >
                    {angle.badge} {language === "ta" ? angle.labelTa : angle.labelEn}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
}
