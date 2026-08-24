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
      <rect width='100%' height='100%' fill='#12121c'/>
      <text x='50%' y='50%' font-family='Georgia' font-size='20' fill='#d4af37' text-anchor='middle' dy='.3em'>Amutha Surabi</text>
    </svg>
  `);

export default function ItemCard({ item, index = 0, onClick }) {
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
      whileHover={{ y: -6, scale: 1.01 }}
      onClick={() => onClick && onClick(item)}
      className={`glass-card rounded-2xl overflow-hidden group relative transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.25)] h-full flex flex-col border border-amber-500/20 hover:border-amber-400/60 cursor-pointer ${
        !available ? "opacity-60" : ""
      }`}
    >
      <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-black/80">
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
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A12] via-black/30 to-transparent pointer-events-none" />

        {/* Badges Top Left */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-wrap gap-1.5 max-w-[85%]">
          {item.is_popular && (
            <span className="flex items-center gap-1 rounded-full bg-black/80 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-300 border border-emerald-500/40 shadow-md">
              <LuLeaf className="text-emerald-400" /> {t("popular", language)}
            </span>
          )}
          {item.is_chef_recommended && (
            <span className="flex items-center gap-1 rounded-full bg-black/80 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-extrabold text-amber-300 border border-amber-500/40 shadow-md">
              <GiChefToque className="text-amber-400" /> {t("chefsPick", language)}
            </span>
          )}
          {item.is_new && (
            <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 px-2.5 py-0.5 text-[10px] font-black text-black shadow-md">
              <HiSparkles /> {t("newBadge", language)}
            </span>
          )}
        </div>

        {/* Availability Badge Bottom Right */}
        <div className="absolute bottom-2.5 right-2.5 z-10">
          {available ? (
            <span className="flex items-center gap-1 rounded-full bg-black/75 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/40 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> {t("available", language)}
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-black/75 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/40 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-red-400" /> {t("notAvailable", language)}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 justify-between bg-gradient-to-b from-[#12121C] to-[#0A0A10] backdrop-blur-md border-t border-amber-500/10">
        <div>
          <h3 className="font-display text-base sm:text-lg font-bold text-amber-50 group-hover:text-amber-300 transition-colors leading-snug tracking-tight">
            {name}
          </h3>
          {description && (
            <p className="mt-1 text-xs sm:text-sm text-amber-100/70 line-clamp-2 leading-relaxed tracking-wide font-normal">
              {description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
