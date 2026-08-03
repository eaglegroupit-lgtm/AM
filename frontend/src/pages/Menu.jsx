import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { GiChefToque, GiStarFormation } from "react-icons/gi";
import { HiSparkles } from "react-icons/hi2";
import { api } from "../lib/api";
import Header from "../components/customer/Header";
import SearchBar from "../components/customer/SearchBar";
import CategoryTabs from "../components/customer/CategoryTabs";
import FeaturedRow from "../components/customer/FeaturedRow";
import CategorySection from "../components/customer/CategorySection";
import ItemCard from "../components/customer/ItemCard";
import SkeletonCard from "../components/customer/SkeletonCard";
import BottomNav from "../components/customer/BottomNav";
import InfoSheet from "../components/customer/InfoSheet";

export default function Menu() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [infoOpen, setInfoOpen] = useState(false);

  const searchRef = useRef(null);
  const topRef = useRef(null);
  const categoriesRef = useRef(null);

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

  const query = search.trim().toLowerCase();

  const filteredItems = useMemo(() => {
    let list = items;
    if (activeCategory !== null) list = list.filter((i) => i.category_id === activeCategory);
    if (query) {
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(query) ||
          (i.description || "").toLowerCase().includes(query) ||
          (i.category_name || "").toLowerCase().includes(query)
      );
    }
    return list;
  }, [items, activeCategory, query]);

  const popularItems = useMemo(() => items.filter((i) => i.is_popular && i.is_available), [items]);
  const chefItems = useMemo(() => items.filter((i) => i.is_chef_recommended && i.is_available), [items]);
  const newItems = useMemo(() => items.filter((i) => i.is_new && i.is_available), [items]);

  const isSearching = query.length > 0 || activeCategory !== null;

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="tamil-menu-bg min-h-screen bg-ink pb-24 sm:pb-10" ref={topRef}>
      <Header settings={settings} />

      <div className="sticky top-0 z-30 -mt-1 bg-ink/85 backdrop-blur-xl border-b border-gold/10">
        <div className="max-w-5xl mx-auto px-4 py-3 space-y-3">
          <SearchBar value={search} onChange={setSearch} inputRef={searchRef} />
          <div ref={categoriesRef}>
            <CategoryTabs categories={categories} activeId={activeCategory} onSelect={setActiveCategory} />
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
              title="Today's Specials & Chef Recommended"
              icon={<GiChefToque className="text-gold-light" size={22} />}
              items={chefItems}
            />
            <FeaturedRow
              title="Most Popular"
              icon={<GiStarFormation className="text-gold-light" size={22} />}
              items={popularItems}
            />
            <FeaturedRow
              title="Newly Added"
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
                {query ? `Results for "${search}"` : "Filtered items"}
              </h2>
              <span className="text-xs text-cream/40">{filteredItems.length} found</span>
            </div>
            {filteredItems.length === 0 ? (
              <div className="text-center py-16 text-cream/50">
                <p className="font-display text-lg">No dishes found</p>
                <p className="text-sm mt-1">Try a different search term or category.</p>
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
          <p className="text-[11px] text-cream/25 mt-4">Crafted with love, served with tradition.</p>
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
