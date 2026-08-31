import { motion } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import { t, branchAddresses } from "../../lib/translations";
import LanguageToggle from "./LanguageToggle";

import { Link } from "react-router-dom";
import { LuShieldCheck, LuMapPin } from "react-icons/lu";

export default function Header({ settings, currentMeal }) {
  const { language } = useLanguage();
  const name = settings?.restaurant_name || "Amutha Surabi Restaurant";
  const tagline = settings?.tagline || "Experience Authentic Taste";
  const branches = branchAddresses[language] || branchAddresses.en;

  return (
    <header className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{
          backgroundImage: settings?.banner
            ? `url(${settings.banner})`
            : "radial-gradient(circle at 30% 20%, rgba(184,134,11,0.14), transparent 45%), radial-gradient(circle at 80% 0%, rgba(184,134,11,0.10), transparent 40%)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-ink/80 to-ink" />

      <div className="relative z-20 flex items-center justify-between px-4 pt-4">
        <Link
          to="/admin"
          className="flex items-center gap-1.5 rounded-full border border-[#B8860B]/35 bg-[#FFFDF8]/90 backdrop-blur-md px-3 py-1.5 text-xs font-bold text-[#8B6914] hover:text-[#8B0000] hover:border-[#A6291A] transition-all shadow-sm"
        >
          <LuShieldCheck className="text-[#A6291A]" size={14} />
          <span>Admin</span>
        </Link>
      </div>

      <div className="relative z-10 px-4 pt-3 pb-8 text-center max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full gold-border gold-glow bg-surface/60 backdrop-blur"
        >
          {settings?.logo ? (
            <img src={settings.logo} alt={name} className="h-14 w-14 rounded-full object-cover" />
          ) : (
            <span className="font-display text-3xl font-bold gold-text">
              {name.trim().charAt(0)}
            </span>
          )}
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className={`text-xs sm:text-sm text-gold-light/80 font-medium ${
            language === "ta" ? "tracking-normal" : "uppercase tracking-[0.35em]"
          }`}
        >
          {t("welcomeTo", language)}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-2 font-display text-3xl sm:text-5xl font-bold gold-text leading-tight text-balance"
        >
          {name}
        </motion.h1>

        {/* Two branch addresses: left & right */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-2xl mx-auto text-left"
        >
          {branches.map((b, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-surface/85 backdrop-blur-md border border-[#B8860B]/30 shadow-sm hover:border-[#B8860B]/60 transition-all"
            >
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#A6291A]/10 text-[#A6291A]">
                <LuMapPin size={14} />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] font-bold tracking-wider text-[#8B6914] uppercase">
                  {b.title}
                </span>
                <span className="text-xs font-semibold text-[#2B2013] leading-snug">
                  {b.address}
                </span>
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.55, duration: 0.6 }}
          className="mx-auto mt-4 h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent"
        />

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-3 font-display italic text-sm sm:text-base text-cream/80"
        >
          {tagline}
        </motion.p>
      </div>
    </header>
  );
}
