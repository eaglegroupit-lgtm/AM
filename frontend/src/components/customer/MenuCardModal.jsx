import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiZoomIn,
  FiZoomOut,
  FiRotateCw,
  FiX,
  FiMaximize2,
  FiMinimize2,
  FiRefreshCw,
  FiGlobe,
} from "react-icons/fi";
import { GiScrollQuill } from "react-icons/gi";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../lib/translations";

const CARD_IMAGES = {
  breakfast: {
    titleEn: "Sri Amutha Surabhi - Morning Breakfast",
    titleTa: "ஸ்ரீ அமுத சுரபி - காலை உணவு மெனு",
    en: "/images/menu-cards/breakfast-en.jpg",
    ta: "/images/menu-cards/breakfast-ta.jpg",
  },
  lunch: {
    titleEn: "Sri Amutha Surabhi - Authentic Lunch",
    titleTa: "ஸ்ரீ அமுத சுரபி - மதிய உணவு மெனு",
    en: "/images/menu-cards/lunch-en.jpg",
    ta: "/images/menu-cards/lunch-ta.jpg",
  },
  dinner: {
    titleEn: "Sri Amutha Surabhi - Night Tiffin Special",
    titleTa: "ஸ்ரீ அமுத சுரபி - இரவு நேர டிபன்",
    en: "/images/menu-cards/dinner-en.jpg",
    ta: "/images/menu-cards/dinner-ta.jpg",
  },
};

export default function MenuCardModal({ isOpen, onClose, initialLang = "ta", initialSession = "lunch" }) {
  const { language } = useLanguage();
  const [activeSession, setActiveSession] = useState(initialSession || "lunch");
  const [activeCardLang, setActiveCardLang] = useState(initialLang || (language === "ta" ? "ta" : "en"));
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef(null);

  // Sync initial state when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveSession(initialSession || "lunch");
      setActiveCardLang(initialLang || (language === "ta" ? "ta" : "en"));
      resetTransform();
    }
  }, [isOpen, initialLang, initialSession, language]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") handleZoomIn();
      if (e.key === "-") handleZoomOut();
      if (e.key === "0") resetTransform();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const resetTransform = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.35, 4));
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const next = Math.max(prev - 0.35, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleDoubleClick = () => {
    if (scale > 1.2) {
      resetTransform();
    } else {
      setScale(2.2);
    }
  };

  // Mouse Wheel Zoom
  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setScale((prev) => Math.min(prev + 0.2, 4));
    } else {
      setScale((prev) => {
        const next = Math.max(prev - 0.2, 1);
        if (next === 1) setPosition({ x: 0, y: 0 });
        return next;
      });
    }
  };

  // Mouse / Touch Drag handling
  const handleMouseDown = (e) => {
    if (scale <= 1 && rotation === 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile pan
  const handleTouchStart = (e) => {
    if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const sessionConfig = CARD_IMAGES[activeSession] || CARD_IMAGES.lunch;
  const currentImageSrc = sessionConfig[activeCardLang] || sessionConfig.ta;
  const currentTitle = activeCardLang === "ta" ? sessionConfig.titleTa : sessionConfig.titleEn;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/90 backdrop-blur-md p-2 sm:p-4 select-none"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Top Bar: Title, Session Selector, Language Switcher, Close Button */}
        <div className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-2.5 z-10 bg-black/70 backdrop-blur-md px-3 py-2.5 rounded-2xl border border-[#B8860B]/30 shadow-xl">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#A6291A] to-[#600000] text-[#EEDB91] shadow-md border border-[#B8860B]/40">
              <GiScrollQuill size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-bold text-sm sm:text-base text-[#FDF8EE] leading-tight truncate">
                {currentTitle}
              </h3>
              <p className="text-[11px] text-[#EEDB91]/80 font-medium truncate">
                {t("originalMenuCard", language)} • {t("dragToPan", language)}
              </p>
            </div>
          </div>

          {/* Controls: Session Buttons + Language Toggle + Close */}
          <div className="flex flex-wrap items-center gap-2 ml-auto">
            {/* Session Switcher Pills */}
            <div className="flex items-center bg-[#1A120E] p-1 rounded-xl border border-[#B8860B]/30 shadow-inner">
              {[
                { id: "breakfast", labelEn: "Breakfast", labelTa: "காலை", icon: "🌅" },
                { id: "lunch", labelEn: "Lunch", labelTa: "மதிய உணவு", icon: "☀️" },
                { id: "dinner", labelEn: "Dinner", labelTa: "இரவு டிபன்", icon: "🌙" },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setActiveSession(s.id);
                    resetTransform();
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                    activeSession === s.id
                      ? "bg-gradient-to-r from-[#A6291A] to-[#8B0000] text-white shadow-md ring-1 ring-[#EEDB91]/60"
                      : "text-[#EEDB91]/70 hover:text-white"
                  }`}
                >
                  <span>{s.icon} {language === "ta" ? s.labelTa : s.labelEn}</span>
                </button>
              ))}
            </div>

            {/* Card Language Selector */}
            <div className="flex items-center bg-[#241A15] p-1 rounded-xl border border-[#B8860B]/40 shadow-inner">
              <button
                onClick={() => {
                  setActiveCardLang("ta");
                  resetTransform();
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeCardLang === "ta"
                    ? "bg-gradient-to-r from-[#A6291A] to-[#8B0000] text-white shadow-md"
                    : "text-[#EEDB91]/70 hover:text-[#EEDB91]"
                }`}
              >
                தமிழ்
              </button>
              <button
                onClick={() => {
                  setActiveCardLang("en");
                  resetTransform();
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeCardLang === "en"
                    ? "bg-gradient-to-r from-[#A6291A] to-[#8B0000] text-white shadow-md"
                    : "text-[#EEDB91]/70 hover:text-[#EEDB91]"
                }`}
              >
                English
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/20 hover:scale-105"
              aria-label="Close"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>

        {/* Center Viewer Area */}
        <div
          ref={containerRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onDoubleClick={handleDoubleClick}
          className={`relative flex-1 w-full max-w-5xl flex items-center justify-center overflow-hidden my-2 rounded-2xl bg-[#120D0A]/70 border border-[#B8860B]/20 ${
            scale > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in"
          }`}
        >
          {/* Subtle Watermark/Pattern */}
          <div className="absolute inset-0 pointer-events-none opacity-5 flex items-center justify-center">
            <span className="font-display text-8xl font-black text-[#B8860B]">AMUTHA SURABHI</span>
          </div>

          <motion.div
            animate={{
              scale,
              x: position.x,
              y: position.y,
              rotate: rotation,
            }}
            transition={isDragging ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 26 }}
            className="flex items-center justify-center max-h-full max-w-full"
          >
            <img
              src={currentImageSrc}
              alt={activeCardLang === "ta" ? "இரவு நேர டிபன் மெனு" : "Night Tiffin Menu Card"}
              className="max-h-[75vh] sm:max-h-[80vh] w-auto max-w-full rounded-xl shadow-2xl object-contain pointer-events-none border-2 border-[#B8860B]/40"
              draggable={false}
            />
          </motion.div>

          {/* Scale Indicator Badge */}
          {scale > 1 && (
            <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono font-bold text-[#EEDB91] border border-[#B8860B]/40 pointer-events-none">
              {Math.round(scale * 100)}%
            </div>
          )}
        </div>

        {/* Floating Controls Bar at Bottom */}
        <div className="z-10 flex items-center gap-2 bg-black/80 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-[#B8860B]/40 shadow-2xl">
          {/* Zoom Out */}
          <button
            onClick={handleZoomOut}
            disabled={scale <= 1}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-[#FDF8EE] disabled:opacity-40 disabled:hover:bg-white/10 transition-all cursor-pointer border border-white/10 active:scale-95"
            title={t("zoomOut", language)}
          >
            <FiZoomOut size={18} />
          </button>

          {/* Zoom Level / Reset */}
          <button
            onClick={resetTransform}
            className="px-3 h-10 flex items-center gap-1.5 rounded-xl bg-[#241A15] hover:bg-[#34261F] text-[#EEDB91] text-xs font-bold transition-all cursor-pointer border border-[#B8860B]/40 active:scale-95"
            title={t("resetZoom", language)}
          >
            <FiRefreshCw size={14} className={scale !== 1 || rotation !== 0 ? "text-amber-400" : ""} />
            <span>{Math.round(scale * 100)}%</span>
          </button>

          {/* Zoom In */}
          <button
            onClick={handleZoomIn}
            disabled={scale >= 4}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#A6291A] hover:bg-[#BD3222] text-white disabled:opacity-40 transition-all cursor-pointer shadow-md border border-[#B8860B]/30 active:scale-95"
            title={t("zoomIn", language)}
          >
            <FiZoomIn size={18} />
          </button>

          <div className="h-6 w-px bg-white/20 mx-1" />

          {/* Rotate */}
          <button
            onClick={handleRotate}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-[#FDF8EE] transition-all cursor-pointer border border-white/10 active:scale-95"
            title="Rotate 90°"
          >
            <FiRotateCw size={18} />
          </button>

          {/* Quick Language Toggle */}
          <button
            onClick={() => {
              setActiveCardLang((prev) => (prev === "ta" ? "en" : "ta"));
              resetTransform();
            }}
            className="flex h-10 items-center gap-1.5 px-3 rounded-xl bg-gradient-to-r from-[#A6291A]/80 to-[#8B0000]/80 hover:from-[#A6291A] hover:to-[#8B0000] text-white text-xs font-bold transition-all cursor-pointer border border-[#B8860B]/40 active:scale-95"
            title={t("switchLanguageCard", language)}
          >
            <FiGlobe size={14} className="text-[#EEDB91]" />
            <span>{activeCardLang === "ta" ? "English" : "தமிழ்"}</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
