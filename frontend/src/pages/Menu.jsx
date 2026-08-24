import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { GiChefToque, GiStarFormation } from "react-icons/gi";
import { HiSparkles } from "react-icons/hi2";
import { api } from "../lib/api";
import { useLanguage } from "../context/LanguageContext";
import { t, translateItemName, translateItemDescription } from "../lib/translations";
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

export default function Menu() {
  const { language } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [currentMeal, setCurrentMeal] = useState(() => getCurrentMealTime());
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

  // Determine active meal category strictly by IST time
  const activeCategoryObj = useMemo(() => {
    if (!categories.length) return null;
    return (
      categories.find(
        (c) =>
          c.is_current_meal ||
          c.slug === currentMeal.slug ||
          c.name.toLowerCase().includes(currentMeal.slug)
      ) || categories[0]
    );
  }, [categories, currentMeal]);

  // Helper to check if an item is enabled for the current IST meal slot
  const isItemInCurrentISTMealSlot = (item, mealSlug) => {
    if (mealSlug === "breakfast") return item.is_breakfast !== false;
    if (mealSlug === "lunch") return item.is_lunch !== false;
    if (mealSlug === "evening-snacks") return item.is_snacks !== false;
    if (mealSlug === "dinner") return item.is_dinner !== false;
    return true;
  };

  // Strictly filter items to only the current active meal menu and checked meal slot
  const mealItems = useMemo(() => {
    if (!activeCategoryObj) return [];
    return items.filter((i) => {
      const isCategoryMatch = i.category_id === activeCategoryObj.id;
      const isMealSlotMatch = isItemInCurrentISTMealSlot(i, currentMeal.slug);
      return isCategoryMatch && isMealSlotMatch;
    });
  }, [items, activeCategoryObj, currentMeal]);

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

  const popularItems = useMemo(() => mealItems.filter((i) => i.is_popular && i.is_available), [mealItems]);
  const chefItems = useMemo(() => mealItems.filter((i) => i.is_chef_recommended && i.is_available), [mealItems]);
  const newItems = useMemo(() => mealItems.filter((i) => i.is_new && i.is_available), [mealItems]);

  const isSearching = query.length > 0;
  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="tamil-menu-bg min-h-screen bg-[#FAF6EC] text-[#2B2013] pb-24 sm:pb-10" ref={topRef}>
      <Header settings={settings} />

      <div className="sticky top-0 z-30 -mt-1 bg-[#FAF6EC]/90 backdrop-blur-xl border-b border-[#B8860B]/20">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <SearchBar value={search} onChange={setSearch} inputRef={searchRef} />
            </div>
            <LanguageToggle />
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

            {/* Complete Menu for the current active meal */}
            <section className="mt-10">
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
          {settings?.address && <p className="text-xs text-cream/40 mt-2 max-w-sm mx-auto">{settings.address}</p>}
          {settings?.opening_hours && <p className="text-xs text-cream/40 mt-1">{settings.opening_hours}</p>}
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
