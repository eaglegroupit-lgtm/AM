import { motion } from "framer-motion";
import { CategoryIcon } from "../../lib/categoryIcons";
import { LuLayoutGrid } from "react-icons/lu";
import { useLanguage } from "../../context/LanguageContext";
import { t, translateCategory } from "../../lib/translations";

export default function CategoryTabs({ categories, activeId, onSelect }) {
  const { language } = useLanguage();
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 px-1">
      <TabButton active={activeId === null} onClick={() => onSelect(null)}>
        <LuLayoutGrid size={15} />
        {t("all", language)}
      </TabButton>
      {categories.map((cat) => (
        <TabButton key={cat.id} active={activeId === cat.id} onClick={() => onSelect(cat.id)}>
          <CategoryIcon icon={cat.icon} className="shrink-0" />
          <span className="whitespace-nowrap">{translateCategory(cat.name, language)}</span>
        </TabButton>
      ))}
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${
        active ? "text-black" : "text-cream/70 hover:text-gold-light"
      }`}
    >
      {active && (
        <motion.span
          layoutId="active-tab-pill"
          className="absolute inset-0 rounded-full bg-gradient-to-r from-gold-light to-gold"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      )}
      {!active && <span className="absolute inset-0 rounded-full gold-border bg-surface/40" />}
      <span className="relative flex items-center gap-1.5">{children}</span>
    </button>
  );
}
