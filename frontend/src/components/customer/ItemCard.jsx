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
      className={`glass-card rounded-2xl overflow-hidden group relative transition-all duration-300 hover:shadow-[0_10px_30px_rgba(166,41,26,0.15)] h-full flex flex-col border border-[#B8860B]/25 hover:border-[#A6291A]/60 cursor-pointer bg-[#FFFDF8] ${
        !available ? "opacity-60" : ""
      }`}
    >
      <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-[#F3EAD4]">
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
        <div className="absolute inset-0 bg-gradient-to-t from-[#2B2013]/70 via-transparent to-transparent pointer-events-none" />

        {/* Badges Top Left */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-wrap gap-1.5 max-w-[85%]">
          {item.is_popular && (
            <span className="flex items-center gap-1 rounded-full bg-[#FFFDF8]/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-black text-emerald-800 border border-emerald-400 shadow-md">
              <LuLeaf className="text-emerald-600" /> {t("popular", language)}
            </span>
          )}
          {item.is_chef_recommended && (
            <span className="flex items-center gap-1 rounded-full bg-[#FFFDF8]/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-black text-amber-900 border border-amber-400 shadow-md">
              <GiChefToque className="text-amber-600" /> {t("chefsPick", language)}
            </span>
          )}
          {item.is_new && (
            <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-[#A6291A] to-[#D4AF37] px-2.5 py-0.5 text-[10px] font-black text-white shadow-md">
              <HiSparkles /> {t("newBadge", language)}
            </span>
          )}
        </div>

        {/* Availability Badge Bottom Right */}
        <div className="absolute bottom-2.5 right-2.5 z-10">
          {available ? (
            <span className="flex items-center gap-1 rounded-full bg-[#FFFDF8]/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-400 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" /> {t("available", language)}
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-[#FFFDF8]/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-red-700 border border-red-400 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-red-600" /> {t("notAvailable", language)}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 justify-between bg-gradient-to-b from-[#FFFDF8] via-[#FAF6EC] to-[#F5ECCB] backdrop-blur-md border-t border-[#B8860B]/15">
        <div>
          <h3 className="font-display text-base sm:text-lg font-bold text-[#2B2013] group-hover:text-[#A6291A] transition-colors leading-snug tracking-tight">
            {name}
          </h3>
          {description && (
            <p className="mt-1.5 text-xs sm:text-sm text-[#4A3825] line-clamp-2 leading-relaxed tracking-wide font-medium">
              {description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
