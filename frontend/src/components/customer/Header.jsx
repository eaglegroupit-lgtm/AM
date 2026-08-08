import { motion } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../lib/translations";
import LanguageToggle from "./LanguageToggle";

export default function Header({ settings, currentMeal }) {
  const { language } = useLanguage();
  const name = settings?.restaurant_name || "Amutha Surabi Restaurant";
  const tagline = settings?.tagline || "Experience Authentic Taste";

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

      <div className="relative z-20 flex justify-end px-4 pt-4">
        <LanguageToggle />
      </div>

      <div className="relative z-10 px-6 pt-4 pb-10 text-center max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.7, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full gold-border gold-glow bg-surface/60 backdrop-blur"
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

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mx-auto mt-4 h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent"
        />

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="mt-4 font-display italic text-base sm:text-xl text-cream/85"
        >
          {tagline}
        </motion.p>

        {currentMeal && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.5 }}
            className="mt-5 inline-flex items-center gap-2 rounded-full gold-border bg-surface/80 backdrop-blur-md px-4 py-1.5 shadow-lg border border-gold/30"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-xs sm:text-sm font-medium text-cream">
              {language === "ta" ? currentMeal.labelTa : currentMeal.labelEn}
            </span>
          </motion.div>
        )}
      </div>
    </header>
  );
}
