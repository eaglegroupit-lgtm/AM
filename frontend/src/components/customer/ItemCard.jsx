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

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3) }}
      whileHover={{ y: -4 }}
      className={`glass-card rounded-2xl overflow-hidden group relative transition-shadow duration-300 hover:gold-glow h-full flex flex-col ${
        !available ? "opacity-55" : ""
      }`}
    >
      <div className="relative h-36 sm:h-40 w-full overflow-hidden">
        <img
          src={item.image || PLACEHOLDER}
          alt={name}
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 ${
            !available ? "grayscale" : ""
          }`}
          onError={(e) => {
            e.currentTarget.src = PLACEHOLDER;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/0 to-black/5" />

        <div className="absolute top-2 left-2 z-10 flex flex-wrap gap-1.5 max-w-[75%]">
          {item.is_popular && (
            <span className="flex items-center gap-1 rounded-full bg-white/85 backdrop-blur px-2 py-0.5 text-[10px] font-semibold text-gold-dark gold-border shadow-sm">
              <LuLeaf className="text-emerald-600" /> {t("popular", language)}
            </span>
          )}
          {item.is_chef_recommended && (
            <span className="flex items-center gap-1 rounded-full bg-white/85 backdrop-blur px-2 py-0.5 text-[10px] font-semibold text-gold-dark gold-border shadow-sm">
              <GiChefToque /> {t("chefsPick", language)}
            </span>
          )}
          {item.is_new && (
            <span className="flex items-center gap-1 rounded-full bg-gold-light/90 px-2 py-0.5 text-[10px] font-bold text-cream shadow-sm">
              <HiSparkles /> {t("newBadge", language)}
            </span>
          )}
        </div>

        <div className="absolute bottom-2 right-2 z-10">
          {available ? (
            <span className="flex items-center gap-1 rounded-full bg-white/88 backdrop-blur px-2.5 py-1 text-[11px] font-medium text-emerald-700 border border-emerald-500/25 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> {t("available", language)}
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-white/88 backdrop-blur px-2.5 py-1 text-[11px] font-medium text-red-700 border border-red-500/25 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> {t("notAvailable", language)}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="font-display text-base sm:text-lg font-semibold text-cream leading-tight">
            {name}
          </h3>
          {description && (
            <p className="mt-1 text-xs sm:text-sm text-cream/55 line-clamp-2">{description}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
