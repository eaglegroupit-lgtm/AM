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
import CategoryTabs from "../components/customer/CategoryTabs";
import LanguageToggle from "../components/customer/LanguageToggle";
import FeaturedRow from "../components/customer/FeaturedRow";
import CategorySection from "../components/customer/CategorySection";
import ItemCard from "../components/customer/ItemCard";
import SkeletonCard from "../components/customer/SkeletonCard";
import BottomNav from "../components/customer/BottomNav";
import InfoSheet from "../components/customer/InfoSheet";

export default function Menu() {
  const { language } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [currentMeal, setCurrentMeal] = useState(() => getCurrentMealTime());
  const [infoOpen, setInfoOpen] = useState(false);

  const searchRef = useRef(null);
  const topRef = useRef(null);
  const categoriesRef = useRef(null);

  // Keep current IST meal time updated periodically
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

        // By default, set the active category to the current IST meal time category
        const istMeal = getCurrentMealTime();
        const matchingCat = cats.find(
          (c) =>
            c.is_current_meal ||
            c.slug === istMeal.slug ||
            c.name.toLowerCase().includes(istMeal.slug)
        );
        if (matchingCat) {
          setActiveCategory(matchingCat.id);
        }
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

  const query = search.trim().toLowerCase();

  // Items like beverages, ice cream and tiffin dishes intentionally appear
  // in more than one meal-time category (e.g. both Breakfast and Dinner), so
  // each has multiple rows sharing the same name. That's fine when browsing
  // a single category, but aggregate views spanning all categories (featured
  // rows, all-category search) need to collapse those back to one card.
  const uniqueItems = useMemo(() => {
    const seen = new Set();
    return items.filter((i) => {
      if (seen.has(i.name)) return false;
      seen.add(i.name);
      return true;
    });
  }, [items]);

  const filteredItems = useMemo(() => {
    let list = activeCategory !== null ? items.filter((i) => i.category_id === activeCategory) : uniqueItems;
    if (query) {
      list = list.filter((i) => {
        const translatedName = translateItemName(i.name, language).toLowerCase();
        const translatedDesc = translateItemDescription(i.name, i.description || "", language).toLowerCase();
        return (
          i.name.toLowerCase().includes(query) ||
          (i.description || "").toLowerCase().includes(query) ||
          (i.category_name || "").toLowerCase().includes(query) ||
          translatedName.includes(query) ||
          translatedDesc.includes(query)
        );
      });
    }
    return list;
  }, [items, uniqueItems, activeCategory, query, language]);

  const popularItems = useMemo(() => uniqueItems.filter((i) => i.is_popular && i.is_available), [uniqueItems]);
  const chefItems = useMemo(() => uniqueItems.filter((i) => i.is_chef_recommended && i.is_available), [uniqueItems]);
  const newItems = useMemo(() => uniqueItems.filter((i) => i.is_new && i.is_available), [uniqueItems]);

  const isSearching = query.length > 0 || activeCategory !== null;

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="tamil-menu-bg min-h-screen bg-ink pb-24 sm:pb-10" ref={topRef}>
      <Header settings={settings} currentMeal={currentMeal} />

      <div className="sticky top-0 z-30 -mt-1 bg-ink/85 backdrop-blur-xl border-b border-gold/10">
        <div className="max-w-5xl mx-auto px-4 py-3 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <SearchBar value={search} onChange={setSearch} inputRef={searchRef} />
            </div>
            <LanguageToggle />
          </div>
          <div ref={categoriesRef}>
            <CategoryTabs
              categories={categories}
              activeId={activeCategory}
              currentMealSlug={currentMeal?.slug}
              onSelect={setActiveCategory}
            />
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
            />
            <FeaturedRow
              title={t("mostPopular", language)}
              icon={<GiStarFormation className="text-gold-light" size={22} />}
              items={popularItems}
            />
            <FeaturedRow
              title={t("newlyAdded", language)}
              icon={<HiSparkles className="text-gold-light" size={22} />}
              items={newItems}
            />

            {categories.map((cat) => (
              <CategorySection
                key={cat.id}
                category={cat}
                items={items.filter((i) => i.category_id === cat.id)}
              />
            ))}
          </>
        )}

        {!loading && !error && isSearching && (
          <section className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-cream">
                {query ? t("resultsFor", language, search) : t("filteredItems", language)}
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
                  <ItemCard key={item.id} item={item} index={i} />
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
          setActiveCategory(null);
          setSearch("");
          scrollTo(topRef);
        }}
        onSearch={() => {
          scrollTo(categoriesRef);
          searchRef.current?.focus();
        }}
        onCategories={() => scrollTo(categoriesRef)}
        onInfo={() => setInfoOpen(true)}
      />

      <InfoSheet open={infoOpen} onClose={() => setInfoOpen(false)} settings={settings} />
    </div>
  );
}
