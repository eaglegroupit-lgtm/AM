import { motion } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import { LuGlobe } from "react-icons/lu";

export default function LanguageToggle({ className = "" }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border border-[#B8860B]/35 bg-[#FFFDF8] p-1 shadow-sm shrink-0 backdrop-blur-md ${className}`}
    >
      <button
        type="button"
        onClick={() => setLanguage("en")}
        aria-label="Switch to English"
        className={`relative flex items-center justify-center px-3 py-1.5 rounded-full text-xs font-black transition-colors cursor-pointer select-none ${
          language === "en" ? "text-white" : "text-[#4A3825] hover:text-[#8B0000]"
        }`}
      >
        {language === "en" && (
          <motion.div
            layoutId="activeLangPill"
            transition={{ type: "spring", stiffness: 450, damping: 32 }}
            className="absolute inset-0 rounded-full bg-gradient-to-r from-[#A6291A] via-[#B8860B] to-[#D4AF37] shadow-sm"
          />
        )}
        <span className="relative z-10 flex items-center gap-1.5 tracking-wider">
          <LuGlobe size={13} className={language === "en" ? "text-white" : "text-[#A6291A]"} />
          EN
        </span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage("ta")}
        aria-label="Switch to Tamil"
        className={`relative flex items-center justify-center px-3.5 py-1.5 rounded-full text-xs font-black transition-colors cursor-pointer select-none ${
          language === "ta" ? "text-white" : "text-[#4A3825] hover:text-[#8B0000]"
        }`}
      >
        {language === "ta" && (
          <motion.div
            layoutId="activeLangPill"
            transition={{ type: "spring", stiffness: 450, damping: 32 }}
            className="absolute inset-0 rounded-full bg-gradient-to-r from-[#A6291A] via-[#B8860B] to-[#D4AF37] shadow-sm"
          />
        )}
        <span className="relative z-10 flex items-center gap-1 tracking-normal font-sans">
          தமிழ்
        </span>
      </button>
    </div>
  );
}
