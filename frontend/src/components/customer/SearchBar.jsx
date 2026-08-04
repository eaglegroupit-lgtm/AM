import { LuSearch, LuX } from "react-icons/lu";
import { useLanguage } from "../../context/LanguageContext";
import { t } from "../../lib/translations";

export default function SearchBar({ value, onChange, inputRef }) {
  const { language } = useLanguage();
  return (
    <div className="relative">
      <LuSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gold-light/70" size={18} />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("searchPlaceholder", language)}
        className="w-full rounded-full glass-card gold-border bg-surface/40 py-3 pl-11 pr-10 text-sm text-cream placeholder:text-cream/35 outline-none focus:ring-2 focus:ring-gold/40 transition-shadow"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-cream/50 hover:text-gold-light transition-colors"
        >
          <LuX size={16} />
        </button>
      )}
    </div>
  );
}
