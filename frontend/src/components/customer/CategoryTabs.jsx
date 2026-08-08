import { motion } from "framer-motion";
import { CategoryIcon } from "../../lib/categoryIcons";
import { LuLayoutGrid } from "react-icons/lu";
import { useLanguage } from "../../context/LanguageContext";
import { t, translateCategory } from "../../lib/translations";

export default function CategoryTabs({ categories, activeId, onSelect, currentMealSlug }) {
  const { language } = useLanguage();
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 px-1">
      <TabButton active={activeId === null} onClick={() => onSelect(null)}>
        <LuLayoutGrid size={15} />
        {t("all", language)}
      </TabButton>
      {categories.map((cat) => {
        const isLiveMeal =
          cat.is_current_meal ||
          (currentMealSlug && cat.slug === currentMealSlug) ||
          (currentMealSlug && cat.name.toLowerCase().includes(currentMealSlug));
        return (
          <TabButton
            key={cat.id}
            active={activeId === cat.id}
            isLiveMeal={isLiveMeal}
            onClick={() => onSelect(cat.id)}
          >
            <CategoryIcon icon={cat.icon} className="shrink-0" />
            <span className="whitespace-nowrap">{translateCategory(cat.name, language)}</span>
            {isLiveMeal && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border border-emerald-500/40 animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {t("servingNow", language)}
              </span>
            )}
          </TabButton>
        );
      })}
    </div>
  );
}

function TabButton({ active, isLiveMeal, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition-all ${
        active ? "text-black font-semibold shadow-md" : "text-cream/70 hover:text-gold-light"
      }`}
    >
      {active && (
        <motion.span
          layoutId="active-tab-pill"
          className="absolute inset-0 rounded-full bg-gradient-to-r from-gold-light to-gold"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      )}
      {!active && (
        <span
          className={`absolute inset-0 rounded-full bg-surface/40 ${
            isLiveMeal ? "border border-emerald-500/40" : "gold-border"
          }`}
        />
      )}
      <span className="relative flex items-center gap-1.5">{children}</span>
    </button>
  );
}
