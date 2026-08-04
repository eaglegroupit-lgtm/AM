import { motion } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";

export default function LanguageToggle({ className = "" }) {
  const { language, toggleLanguage } = useLanguage();
  const isTamil = language === "ta";

  return (
    <button
      onClick={toggleLanguage}
      aria-label="Toggle language between English and Tamil"
      className={`relative flex items-center rounded-full gold-border bg-surface/60 backdrop-blur px-1 py-1 text-xs font-semibold shrink-0 ${className}`}
    >
      <motion.span
        animate={{ x: isTamil ? "100%" : "0%" }}
        transition={{ type: "spring", stiffness: 400, damping: 32 }}
        className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-gradient-to-r from-gold-light to-gold"
      />
      <span className={`relative z-10 px-2.5 py-1 rounded-full transition-colors ${!isTamil ? "text-black" : "text-cream/60"}`}>
        EN
      </span>
      <span className={`relative z-10 px-2.5 py-1 rounded-full transition-colors ${isTamil ? "text-black" : "text-cream/60"}`}>
        தமிழ்
      </span>
    </button>
  );
}
