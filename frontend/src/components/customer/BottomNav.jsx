import { LuHouse, LuSearch, LuLayoutGrid, LuInfo } from "react-icons/lu";

export default function BottomNav({ onHome, onSearch, onCategories, onInfo, active }) {
  const items = [
    { key: "home", label: "Menu", icon: LuHouse, onClick: onHome },
    { key: "search", label: "Search", icon: LuSearch, onClick: onSearch },
    { key: "categories", label: "Categories", icon: LuLayoutGrid, onClick: onCategories },
    { key: "info", label: "Info", icon: LuInfo, onClick: onInfo },
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
