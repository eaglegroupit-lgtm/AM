import { motion } from "framer-motion";
import { LuLeaf } from "react-icons/lu";
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

export default function ItemCard({ item, index = 0 }) {
  const available = item.is_available;
  const { language } = useLanguage();
  const name = translateItemName(item.name, language);
  const description = translateItemDescription(item.name, item.description, language);
  const currencySymbol = language === "ta" ? "ரூ." : "₹";

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3) }}
      whileHover={{ y: -5 }}
      className={`glass-card rounded-2xl overflow-hidden group relative transition-all duration-300 hover:gold-glow h-full flex flex-col border border-gold/20 hover:border-gold/60 shadow-lg ${
        !available ? "opacity-60" : ""
      }`}
    >
      <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-ink/60">
        <img
          src={item.image || PLACEHOLDER}
          alt={name}
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 ${
            !available ? "grayscale" : ""
          }`}
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10 pointer-events-none" />

        {/* Badges Top Left */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-wrap gap-1.5 max-w-[70%]">
          {item.is_popular && (
            <span className="flex items-center gap-1 rounded-full bg-surface/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-gold-light gold-border shadow-md">
              <LuLeaf className="text-emerald-400" /> {t("popular", language)}
            </span>
          )}
          {item.is_chef_recommended && (
            <span className="flex items-center gap-1 rounded-full bg-surface/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-gold-light gold-border shadow-md">
              <GiChefToque className="text-amber-400" /> {t("chefsPick", language)}
            </span>
          )}
          {item.is_new && (
            <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-gold px-2.5 py-0.5 text-[10px] font-bold text-black shadow-md">
              <HiSparkles /> {t("newBadge", language)}
            </span>
          )}
        </div>

        {/* Price Tag Top Right */}
        {item.price > 0 && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="inline-flex items-center rounded-full bg-black/70 backdrop-blur-md px-2.5 py-1 text-xs font-bold gold-text border border-gold/40 shadow-lg tracking-wide">
              {currencySymbol} {item.price}
            </span>
          </div>
        )}

        {/* Availability Badge Bottom Right */}
        <div className="absolute bottom-2.5 right-2.5 z-10">
          {available ? (
            <span className="flex items-center gap-1 rounded-full bg-black/65 backdrop-blur-md px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/30 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> {t("available", language)}
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-black/65 backdrop-blur-md px-2 py-0.5 text-[10px] font-medium text-red-400 border border-red-500/30 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400" /> {t("notAvailable", language)}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 justify-between bg-gradient-to-b from-surface/80 to-surface/40 backdrop-blur-md">
        <div>
          <h3 className="font-display text-base sm:text-lg font-bold text-cream group-hover:text-gold-light transition-colors leading-snug">
            {name}
          </h3>
          {description && (
            <p className="mt-1 text-xs sm:text-sm text-cream/65 line-clamp-2 leading-relaxed">{description}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
