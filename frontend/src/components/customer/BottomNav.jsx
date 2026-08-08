import { LuHouse, LuSearch, LuLayoutGrid, LuInfo } from "react-icons/lu";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../lib/translations";

export default function BottomNav({ onHome, onSearch, onInfo, active }) {
  const { language } = useLanguage();
  const items = [
    { key: "home", label: t("navMenu", language), icon: LuHouse, onClick: onHome },
    { key: "search", label: t("navSearch", language), icon: LuSearch, onClick: onSearch },
    { key: "info", label: t("navInfo", language), icon: LuInfo, onClick: onInfo },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 sm:hidden">
      <div className="mx-3 mb-3 rounded-2xl glass-card gold-border gold-glow px-2 py-2 flex justify-between">
        {items.map(({ key, label, icon: Icon, onClick }) => (
          <button
            key={key}
            onClick={onClick}
            className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-medium transition-colors ${
              active === key ? "text-gold-light" : "text-cream/50"
            }`}
          >
            <Icon size={19} />
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
