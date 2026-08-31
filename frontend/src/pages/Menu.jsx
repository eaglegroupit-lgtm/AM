import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { GiChefToque, GiStarFormation } from "react-icons/gi";
import { HiSparkles } from "react-icons/hi2";
import { api } from "../lib/api";
import { useLanguage } from "../context/LanguageContext";
import { t, translateItemName, translateItemDescription, branchAddresses } from "../lib/translations";
import { getCurrentMealTime } from "../lib/mealTime";
import Header from "../components/customer/Header";
import SearchBar from "../components/customer/SearchBar";
import LanguageToggle from "../components/customer/LanguageToggle";
import FeaturedRow from "../components/customer/FeaturedRow";
import ItemCard from "../components/customer/ItemCard";
import SkeletonCard from "../components/customer/SkeletonCard";
import BottomNav from "../components/customer/BottomNav";
import InfoSheet from "../components/customer/InfoSheet";
import ItemDetailModal from "../components/customer/ItemDetailModal";

const MEAL_TABS = [
  { id: "all", icon: "🍽️", labelEn: "All", labelTa: "அனைத்தும்" },
  { id: "breakfast", icon: "🌅", labelEn: "Breakfast", labelTa: "காலை உணவு" },
  { id: "lunch", icon: "☀️", labelEn: "Lunch", labelTa: "மதிய உணவு" },
  { id: "evening-snacks", icon: "☕", labelEn: "Snacks", labelTa: "சிற்றுண்டி" },
  { id: "dinner", icon: "🌙", labelEn: "Dinner", labelTa: "இரவு உணவு" },
];

export default function Menu() {
  const { language } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [currentMeal, setCurrentMeal] = useState(() => getCurrentMealTime());
  const [activeMealFilter, setActiveMealFilter] = useState(() => getCurrentMealTime().slug);
  const [infoOpen, setInfoOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const searchRef = useRef(null);
  const topRef = useRef(null);

  // Periodically check IST meal time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMeal(getCurrentMealTime());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [cats, its, settingsData] = await Promise.all([
          api.getCategories(),
          api.getItems(),
          api.getSettings(),
        ]);
        if (cancelled) return;
        setCategories(cats);
        setItems(its);
        setSettings(settingsData);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Helper to check if an item is enabled for a meal slot
  const isItemInMealSlot = (item, mealSlug) => {
    if (mealSlug === "all") return true;
    if (mealSlug === "breakfast") return item.is_breakfast !== false;
    if (mealSlug === "lunch") return item.is_lunch !== false;
    if (mealSlug === "evening-snacks") return item.is_snacks !== false;
    if (mealSlug === "dinner") return item.is_dinner !== false;
    return true;
  };

  // Filter items to only those enabled for the selected meal filter and currently available
  const mealItems = useMemo(() => {
    return items.filter((i) => {
      const isMealMatch = isItemInMealSlot(i, activeMealFilter);
      return isMealMatch && i.is_available;
    });
  }, [items, activeMealFilter]);

  const query = search.trim().toLowerCase();

  const filteredItems = useMemo(() => {
    if (!query) return mealItems;
    return mealItems.filter((i) => {
      const translatedName = translateItemName(i.name, language).toLowerCase();
      const translatedDesc = translateItemDescription(i.name, i.description || "", language).toLowerCase();
      return (
        i.name.toLowerCase().includes(query) ||
        (i.description || "").toLowerCase().includes(query) ||
        translatedName.includes(query) ||
        translatedDesc.includes(query)
      );
    });
  }, [mealItems, query, language]);

  // Items strictly for the current real-time IST meal slot (used for live featured sections)
  const currentISTItems = useMemo(() => {
    return items.filter((i) => {
      const isCurrentISTMatch = isItemInMealSlot(i, currentMeal.slug);
      return isCurrentISTMatch && i.is_available;
    });
  }, [items, currentMeal]);

  // Featured rows (Chef Recommended, Most Popular, Newly Added) strictly based on current IST time slot
  const chefItems = useMemo(() => currentISTItems.filter((i) => i.is_chef_recommended), [currentISTItems]);
  const popularItems = useMemo(() => currentISTItems.filter((i) => i.is_popular), [currentISTItems]);
  const newItems = useMemo(() => currentISTItems.filter((i) => i.is_new), [currentISTItems]);

  const isSearching = query.length > 0;
  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="tamil-menu-bg min-h-screen bg-[#FAF6EC] text-[#2B2013] pb-24 sm:pb-10" ref={topRef}>
      <Header settings={settings} />

      <div className="sticky top-0 z-30 -mt-1 bg-[#FAF6EC]/95 backdrop-blur-xl border-b border-[#B8860B]/20 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 pt-3 pb-2.5 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <SearchBar value={search} onChange={setSearch} inputRef={searchRef} />
            </div>
            <LanguageToggle />
          </div>

          {/* Meal Filter Tabs: All, Breakfast, Lunch, Snacks, Dinner */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {MEAL_TABS.map((tab) => {
              const isSelected = activeMealFilter === tab.id;
              const isCurrentIST = currentMeal.slug === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveMealFilter(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-r from-[#A6291A] via-[#8B0000] to-[#700000] text-white shadow-md ring-2 ring-[#B8860B]/50 scale-[1.03]"
                      : "bg-[#FFFDF8] border border-[#B8860B]/30 text-[#4A3825] hover:border-[#A6291A]/50 hover:text-[#8B0000] shadow-xs"
                  }`}
                >
                  <span className="text-sm">{tab.icon}</span>
                  <span className="tracking-wide">{language === "ta" ? tab.labelTa : tab.labelEn}</span>
                  {isCurrentIST && (
                    <span
                      title="Currently Serving Live (IST)"
                      className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                        isSelected
                          ? "bg-emerald-400/30 text-emerald-100 border border-emerald-300/40"
                          : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {language === "ta" ? "நேரலை" : "Live"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4">
        {error && (
          <div className="mt-8 rounded-2xl border border-red-400/30 bg-red-500/5 p-4 text-sm text-red-300">
            Couldn't load the menu ({error}). Please check your connection and refresh.
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!loading && !error && !isSearching && (
          <>
            <FeaturedRow
              title={t("todaysSpecials", language)}
              icon={<GiChefToque className="text-gold-light" size={22} />}
              items={chefItems}
              onItemClick={setSelectedItem}
            />
            <FeaturedRow
              title={t("mostPopular", language)}
              icon={<GiStarFormation className="text-gold-light" size={22} />}
              items={popularItems}
              onItemClick={setSelectedItem}
            />
            <FeaturedRow
              title={t("newlyAdded", language)}
              icon={<HiSparkles className="text-gold-light" size={22} />}
              items={newItems}
              onItemClick={setSelectedItem}
            />

            {/* Active Meal Section Header */}
            <section className="mt-10">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#B8860B]/25 pb-3 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FAF6EC] border border-[#B8860B]/30 text-lg shadow-xs">
                    {MEAL_TABS.find((t) => t.id === activeMealFilter)?.icon || "🍽️"}
                  </div>
                  <div>
                    <h2 className="font-display text-lg sm:text-xl font-bold text-[#8B0000] leading-tight">
                      {language === "ta"
                        ? `${MEAL_TABS.find((t) => t.id === activeMealFilter)?.labelTa || ""} மெனு`
                        : `${MEAL_TABS.find((t) => t.id === activeMealFilter)?.labelEn || ""} Menu`}
                    </h2>
                    <p className="text-[11px] text-[#8B6914] font-semibold">
                      {currentMeal.slug === activeMealFilter ? (
                        <span className="text-emerald-700 font-bold">● {language === "ta" ? "இப்போது பரிமாறப்படுகிறது (நேரலை)" : "Serving Right Now (IST Live)"}</span>
                      ) : (
                        <span>{language === "ta" ? "முழு உணவு பட்டியல்" : "Browse available items"}</span>
                      )}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-extrabold text-[#8B0000] bg-[#FFF8EA] px-3 py-1 rounded-full border border-[#B8860B]/35 shadow-xs">
                  {mealItems.length} {language === "ta" ? "உணவுகள்" : "Dishes"}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {mealItems.map((item, i) => (
                  <ItemCard key={item.id} item={item} index={i} onClick={setSelectedItem} />
                ))}
              </div>
            </section>
          </>
        )}

        {!loading && !error && isSearching && (
          <section className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-cream">
                {t("resultsFor", language, search)}
              </h2>
              <span className="text-xs text-cream/40">
                {filteredItems.length} {t("found", language)}
              </span>
            </div>
            {filteredItems.length === 0 ? (
              <div className="text-center py-16 text-cream/50">
                <p className="font-display text-lg">{t("noDishesFound", language)}</p>
                <p className="text-sm mt-1">{t("tryDifferent", language)}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {filteredItems.map((item, i) => (
                  <ItemCard key={item.id} item={item} index={i} onClick={setSelectedItem} />
                ))}
              </div>
            )}
          </section>
        )}

        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 border-t border-gold/10 pt-8 pb-4 text-center"
        >
          <p className="font-display gold-text text-lg font-semibold">
            {settings?.restaurant_name || "Amutha Surabi Restaurant"}
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-cream/70 max-w-xl mx-auto">
            {(branchAddresses[language] || branchAddresses.en).map((b, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5">
                <span className="font-bold text-[#8B6914] uppercase text-[10px]">{b.title}:</span>
                <span>{b.address}</span>
              </span>
            ))}
          </div>
          {settings?.opening_hours && <p className="text-xs text-cream/40 mt-2">{settings.opening_hours}</p>}
          <p className="text-[11px] text-cream/25 mt-4">{t("craftedWithLove", language)}</p>
        </motion.footer>
      </main>

      <BottomNav
        onHome={() => {
          setSearch("");
          scrollTo(topRef);
        }}
        onSearch={() => {
          searchRef.current?.focus();
        }}
        onInfo={() => setInfoOpen(true)}
      />

      <InfoSheet open={infoOpen} onClose={() => setInfoOpen(false)} settings={settings} />

      <ItemDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
