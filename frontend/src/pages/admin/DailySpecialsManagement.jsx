import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LuSparkles,
  LuPlus,
  LuTrash2,
  LuRefreshCw,
  LuCheck,
  LuArrowUp,
  LuArrowDown,
  LuSearch,
  LuX,
  LuCalendar,
  LuSun,
  LuSunrise,
  LuCoffee,
  LuMoon,
  LuInfo,
} from "react-icons/lu";
import { api } from "../../lib/api";
import { translateItemName, dayTranslations, mealTranslations } from "../../lib/translations";

const DAYS_OF_WEEK = [
  { id: "monday", en: "Monday", ta: "திங்கள்" },
  { id: "tuesday", en: "Tuesday", ta: "செவ்வாய்" },
  { id: "wednesday", en: "Wednesday", ta: "புதன்" },
  { id: "thursday", en: "Thursday", ta: "வியாழன்" },
  { id: "friday", en: "Friday", ta: "வெள்ளி" },
  { id: "saturday", en: "Saturday", ta: "சனி" },
  { id: "sunday", en: "Sunday", ta: "ஞாயிறு" },
];

const MEAL_SLOTS = [
  { id: "breakfast", en: "Breakfast", ta: "காலை உணவு", icon: LuSunrise, emoji: "🌅" },
  { id: "lunch", en: "Lunch", ta: "மதிய உணவு", icon: LuSun, emoji: "☀️" },
  { id: "evening-snacks", en: "Evening Snacks", ta: "மாலை சிற்றுண்டி", icon: LuCoffee, emoji: "☕" },
  { id: "dinner", en: "Night Tiffin / Dinner", ta: "இரவு உணவு", icon: LuMoon, emoji: "🌙" },
];

export default function DailySpecialsManagement() {
  const [specialsData, setSpecialsData] = useState(null);
  const [allItems, setAllItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const [selectedDay, setSelectedDay] = useState("monday");
  const [selectedMeal, setSelectedMeal] = useState("breakfast");

  // Local working list of item IDs for selected (day, meal)
  const [currentSpecialItemIds, setCurrentSpecialItemIds] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Dish picker modal state
  const [pickerOpen, setPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [specialsRes, itemsRes, catsRes] = await Promise.all([
        api.getSpecials(),
        api.getItems(),
        api.getCategories(),
      ]);
      setSpecialsData(specialsRes);
      setAllItems(itemsRes);
      setCategories(catsRes);

      if (specialsRes?.currentDay) {
        setSelectedDay(specialsRes.currentDay);
      }
      if (specialsRes?.currentMeal && MEAL_SLOTS.some((m) => m.id === specialsRes.currentMeal)) {
        setSelectedMeal(specialsRes.currentMeal);
      }
    } catch (err) {
      setError(err.message || "Failed to load specials data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Update working list when day, meal, or specialsData changes
  useEffect(() => {
    if (!specialsData?.specialsByDay) return;
    const daySpecials = specialsData.specialsByDay[selectedDay]?.[selectedMeal] || [];
    const ids = daySpecials.map((s) => s.id);
    setCurrentSpecialItemIds(ids);
    setHasChanges(false);
  }, [selectedDay, selectedMeal, specialsData]);

  // Is this slot currently configured with custom admin items in database?
  const isCustomConfigured = useMemo(() => {
    if (!specialsData?.specialsByDay) return false;
    const daySpecials = specialsData.specialsByDay[selectedDay]?.[selectedMeal] || [];
    return daySpecials.length > 0;
  }, [specialsData, selectedDay, selectedMeal]);

  // If not custom, what auto-generated items does the system show?
  const autoItems = useMemo(() => {
    if (!allItems.length) return [];
    const dayIndex = DAYS_OF_WEEK.findIndex((d) => d.id === selectedDay);
    const slotItems = allItems.filter((i) => {
      if (!i.is_available) return false;
      if (selectedMeal === "breakfast") return i.is_breakfast !== false;
      if (selectedMeal === "lunch") return i.is_lunch !== false;
      if (selectedMeal === "evening-snacks") return i.is_snacks !== false;
      if (selectedMeal === "dinner") return i.is_dinner !== false;
      return true;
    });

    const preferred = slotItems.filter((i) => i.is_chef_recommended || i.is_popular);
    const pool = preferred.length >= 3 ? preferred : slotItems;
    if (!pool.length) return [];

    const selected = [];
    const step = Math.max(1, Math.floor(pool.length / 3));
    for (let k = 0; k < 3 && k < pool.length; k++) {
      const idx = ((dayIndex >= 0 ? dayIndex : 0) * 2 + k * step) % pool.length;
      if (!selected.some((item) => item.id === pool[idx].id)) {
        selected.push(pool[idx]);
      }
    }
    return selected;
  }, [allItems, selectedDay, selectedMeal]);

  // Selected items objects mapped from currentSpecialItemIds
  const currentSpecialItems = useMemo(() => {
    return currentSpecialItemIds
      .map((id) => allItems.find((item) => item.id === id))
      .filter(Boolean);
  }, [currentSpecialItemIds, allItems]);

  const handleAddItem = (itemId) => {
    if (currentSpecialItemIds.includes(itemId)) return;
    setCurrentSpecialItemIds([...currentSpecialItemIds, itemId]);
    setHasChanges(true);
  };

  const handleRemoveItem = (itemId) => {
    setCurrentSpecialItemIds(currentSpecialItemIds.filter((id) => id !== itemId));
    setHasChanges(true);
  };

  const handleMoveItem = (index, direction) => {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= currentSpecialItemIds.length) return;
    const copy = [...currentSpecialItemIds];
    const temp = copy[index];
    copy[index] = copy[newIdx];
    copy[newIdx] = temp;
    setCurrentSpecialItemIds(copy);
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await api.updateSpecials({
        day_of_week: selectedDay,
        meal_slug: selectedMeal,
        item_ids: currentSpecialItemIds,
      });
      setMessage({
        type: "success",
        text: `Saved specials for ${dayTranslations[selectedDay]?.en} (${mealTranslations[selectedMeal]?.en})!`,
      });
      await fetchAll();
      setHasChanges(false);
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setError(err.message || "Failed to save specials");
    } finally {
      setSaving(false);
    }
  };

  const handleResetToAuto = async () => {
    if (!window.confirm(`Reset ${dayTranslations[selectedDay]?.en} ${mealTranslations[selectedMeal]?.en} specials to automatic rotation?`)) {
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await api.resetSpecials({
        day_of_week: selectedDay,
        meal_slug: selectedMeal,
      });
      setMessage({
        type: "info",
        text: `Reset ${dayTranslations[selectedDay]?.en} ${mealTranslations[selectedMeal]?.en} to automatic rotation.`,
      });
      await fetchAll();
      setHasChanges(false);
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setError(err.message || "Failed to reset");
    } finally {
      setSaving(false);
    }
  };

  const handleResetAllWeek = async () => {
    if (!window.confirm("Are you sure you want to reset ALL days & meals across the entire week to automatic rotation?")) {
      return;
    }
    try {
      setSaving(true);
      setError(null);
      await api.resetSpecials();
      setMessage({
        type: "info",
        text: "All week specials have been reset to automatic random rotation.",
      });
      await fetchAll();
      setHasChanges(false);
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setError(err.message || "Failed to reset");
    } finally {
      setSaving(false);
    }
  };

  // Filtered list of candidate items for dish picker
  const pickerCandidates = useMemo(() => {
    return allItems.filter((item) => {
      // Category filter
      if (selectedCategory !== "all" && item.category_id !== parseInt(selectedCategory, 10)) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const taName = translateItemName(item.name, "ta").toLowerCase();
        const enName = item.name.toLowerCase();
        if (!taName.includes(q) && !enName.includes(q)) return false;
      }
      return true;
    });
  }, [allItems, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/15 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500/15 text-amber-600 border border-amber-500/30">
              <LuSparkles size={22} />
            </span>
            <div>
              <h1 className="text-2xl font-bold font-display text-cream">Weekly Daily Specials</h1>
              <p className="text-xs text-cream/60">
                Manage day-wise special dishes (Mon–Sun) for Breakfast, Lunch, Snacks, and Dinner.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetAllWeek}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-semibold transition-colors cursor-pointer"
            title="Clear all manual edits and let system automatically rotate all dishes"
          >
            <LuRefreshCw size={13} />
            Reset Entire Week to Auto
          </button>
        </div>
      </div>

      {/* Notification banner */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`p-3.5 rounded-xl border text-sm font-semibold flex items-center justify-between ${
              message.type === "success"
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-700"
                : "bg-blue-500/15 border-blue-500/30 text-blue-700"
            }`}
          >
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="text-cream/50 hover:text-cream">
              <LuX size={16} />
            </button>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-600 text-sm font-semibold flex items-center justify-between"
          >
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              <LuX size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Day Selector Tabs (Monday to Sunday) */}
      <div className="bg-surface/80 rounded-2xl p-3 border border-gold/15 shadow-sm space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-cream/70 uppercase tracking-wider flex items-center gap-1.5">
            <LuCalendar size={14} className="text-[#8B0000]" />
            Select Day of Week / கிழமை தேர்வு
          </span>
          {specialsData?.currentDay && (
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
              Today (IST): {dayTranslations[specialsData.currentDay]?.en}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = selectedDay === day.id;
            const isToday = specialsData?.currentDay === day.id;
            // Check if this day has any custom configured meals
            const customMealsCount = specialsData?.specialsByDay?.[day.id]
              ? Object.values(specialsData.specialsByDay[day.id]).filter((arr) => arr.length > 0).length
              : 0;

            return (
              <button
                key={day.id}
                onClick={() => setSelectedDay(day.id)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer relative ${
                  isSelected
                    ? "bg-gradient-to-r from-[#A6291A] to-[#8B0000] text-white border-[#B8860B] shadow-md scale-[1.02]"
                    : "bg-surface border-gold/15 text-cream/80 hover:bg-gold/5 hover:border-gold/30"
                }`}
              >
                <span className="font-bold text-sm leading-tight">{day.en}</span>
                <span className={`text-[11px] font-medium leading-tight ${isSelected ? "text-amber-200" : "text-cream/50"}`}>
                  {day.ta}
                </span>

                {/* Badges / indicators */}
                <div className="flex items-center gap-1 mt-1">
                  {isToday && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                        isSelected ? "bg-amber-400 text-ink" : "bg-amber-500/20 text-amber-600"
                      }`}
                    >
                      Today
                    </span>
                  )}
                  {customMealsCount > 0 && (
                    <span
                      title={`${customMealsCount} meal sessions manually customized`}
                      className={`h-2 w-2 rounded-full ${isSelected ? "bg-emerald-300" : "bg-emerald-500"}`}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Meal Session Selector (Breakfast, Lunch, Evening Snacks, Dinner) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {MEAL_SLOTS.map((meal) => {
          const isSelected = selectedMeal === meal.id;
          const isCurrentISTMeal = specialsData?.currentMeal === meal.id;
          const isMealCustom = (specialsData?.specialsByDay?.[selectedDay]?.[meal.id]?.length || 0) > 0;

          return (
            <button
              key={meal.id}
              onClick={() => setSelectedMeal(meal.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-xs shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? "bg-gradient-to-r from-[#8B0000] to-[#600000] text-white border-gold shadow-sm scale-[1.02]"
                  : "bg-surface border-gold/15 text-cream/70 hover:border-gold/30 hover:text-cream"
              }`}
            >
              <span className="text-base">{meal.emoji}</span>
              <div className="text-left">
                <p className="leading-tight">{meal.en}</p>
                <p className={`text-[10px] font-normal leading-tight ${isSelected ? "text-amber-200" : "text-cream/50"}`}>
                  {meal.ta}
                </p>
              </div>
              {isMealCustom && (
                <span className="ml-1 text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded-md font-semibold">
                  Custom
                </span>
              )}
              {isCurrentISTMeal && (
                <span className="ml-1 h-2 w-2 rounded-full bg-amber-400 animate-pulse" title="Current Live IST Meal" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Special Items List for Selected (Day, Meal) */}
      <div className="bg-surface/80 rounded-2xl border border-gold/15 p-5 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gold/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">
                {MEAL_SLOTS.find((m) => m.id === selectedMeal)?.emoji}
              </span>
              <h2 className="text-lg font-bold font-display text-cream">
                {dayTranslations[selectedDay]?.en} {mealTranslations[selectedMeal]?.en} Specials
              </h2>
              <span className="text-xs text-cream/50">
                ({dayTranslations[selectedDay]?.ta} - {mealTranslations[selectedMeal]?.ta})
              </span>
            </div>
            <p className="text-xs text-cream/60 mt-1">
              {currentSpecialItemIds.length > 0
                ? `${currentSpecialItemIds.length} custom special dish(es) set for this session.`
                : "No manual specials set. System is automatically rotating dishes for this day."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isCustomConfigured && (
              <button
                onClick={handleResetToAuto}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/30 text-amber-700 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-semibold transition-colors cursor-pointer"
              >
                <LuRefreshCw size={13} />
                Reset to Auto Rotation
              </button>
            )}

            <button
              onClick={() => setPickerOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:from-amber-700 hover:to-amber-800 text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <LuPlus size={15} />
              Add Special Dish
            </button>
          </div>
        </div>

        {/* Current Items List */}
        {currentSpecialItemIds.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gold/25 p-6 text-center space-y-3 bg-surface-2/40">
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600">
                <LuInfo size={24} />
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-cream">Automatic Rotation Active for {dayTranslations[selectedDay]?.en}</p>
              <p className="text-xs text-cream/60 max-w-md mx-auto mt-1">
                Since no custom items are chosen, customers will see these {autoItems.length} automatically selected popular/special dishes:
              </p>
            </div>

            {/* Preview of auto-generated items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto pt-2">
              {autoItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-surface border border-gold/15 text-left"
                >
                  <img
                    src={item.image || "/images/placeholder.jpg"}
                    alt={item.name}
                    className="h-10 w-10 rounded-lg object-cover border border-gold/15 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-cream truncate">{item.name}</p>
                    <p className="text-[10px] text-cream/50 truncate">{translateItemName(item.name, "ta")}</p>
                    <p className="text-[11px] font-bold text-amber-600">Rs. {item.price}</p>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/15 text-blue-700 border border-blue-500/30 font-semibold">
                    Auto
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setPickerOpen(true)}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gold/15 hover:bg-gold/25 text-cream border border-gold/30 text-xs font-bold transition-all cursor-pointer"
            >
              <LuPlus size={14} />
              Override with Custom Dishes
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {currentSpecialItems.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-2 border border-gold/20 shadow-xs hover:border-gold/40 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-display font-bold text-xs text-cream/40 w-5 text-center">
                    #{index + 1}
                  </span>
                  <img
                    src={item.image || "/images/placeholder.jpg"}
                    alt={item.name}
                    className="h-12 w-12 rounded-xl object-cover border border-gold/15 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-cream truncate">{item.name}</p>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-700 border border-amber-500/30 font-bold">
                        Special
                      </span>
                    </div>
                    <p className="text-xs text-cream/60 truncate">{translateItemName(item.name, "ta")}</p>
                    <p className="text-xs font-bold text-amber-600 mt-0.5">Rs. {item.price}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleMoveItem(index, -1)}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg border border-gold/15 text-cream/60 hover:text-cream hover:bg-gold/10 disabled:opacity-30 cursor-pointer"
                    title="Move Up"
                  >
                    <LuArrowUp size={14} />
                  </button>
                  <button
                    onClick={() => handleMoveItem(index, 1)}
                    disabled={index === currentSpecialItems.length - 1}
                    className="p-1.5 rounded-lg border border-gold/15 text-cream/60 hover:text-cream hover:bg-gold/10 disabled:opacity-30 cursor-pointer"
                    title="Move Down"
                  >
                    <LuArrowDown size={14} />
                  </button>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1.5 rounded-lg border border-red-500/30 text-red-500 hover:bg-red-500/10 cursor-pointer ml-1"
                    title="Remove from specials"
                  >
                    <LuTrash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Save Bar */}
        {hasChanges && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/40"
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
              <span className="text-xs font-bold text-amber-800">
                You have unsaved changes for {dayTranslations[selectedDay]?.en} ({mealTranslations[selectedMeal]?.en})
              </span>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#8B0000] text-white hover:bg-[#A6291A] text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              {saving ? <LuRefreshCw size={14} className="animate-spin" /> : <LuCheck size={14} />}
              Save Specials
            </button>
          </motion.div>
        )}
      </div>

      {/* Dish Picker Modal */}
      <AnimatePresence>
        {pickerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface rounded-2xl border border-gold/20 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-gold/15">
                <div>
                  <h3 className="text-base font-bold font-display text-cream">
                    Choose Dish for {dayTranslations[selectedDay]?.en} {mealTranslations[selectedMeal]?.en}
                  </h3>
                  <p className="text-xs text-cream/60">
                    Search or browse available menu items to add to this day's specials.
                  </p>
                </div>
                <button
                  onClick={() => setPickerOpen(false)}
                  className="p-1.5 rounded-lg text-cream/60 hover:text-cream hover:bg-gold/10"
                >
                  <LuX size={18} />
                </button>
              </div>

              {/* Search & Category Filter */}
              <div className="p-4 border-b border-gold/10 space-y-3 bg-surface-2/50">
                <div className="relative">
                  <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/40" size={16} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search dish name (e.g. Set Dosa, Paneer, Mushroom)..."
                    className="w-full bg-surface pl-9 pr-4 py-2 rounded-xl border border-gold/20 text-xs text-cream placeholder:text-cream/40 focus:outline-hidden focus:border-gold"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/40 hover:text-cream"
                    >
                      <LuX size={14} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 cursor-pointer ${
                      selectedCategory === "all"
                        ? "bg-[#8B0000] text-white"
                        : "bg-surface border border-gold/15 text-cream/70 hover:text-cream"
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(String(cat.id))}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 cursor-pointer ${
                        selectedCategory === String(cat.id)
                          ? "bg-[#8B0000] text-white"
                          : "bg-surface border border-gold/15 text-cream/70 hover:text-cream"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {pickerCandidates.length === 0 ? (
                  <p className="text-center text-xs text-cream/50 py-8">No matching dishes found.</p>
                ) : (
                  pickerCandidates.map((item) => {
                    const isAlreadyAdded = currentSpecialItemIds.includes(item.id);

                    return (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border transition-all ${
                          isAlreadyAdded
                            ? "bg-amber-500/10 border-amber-500/30"
                            : "bg-surface border-gold/15 hover:border-gold/30 hover:bg-gold/5"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={item.image || "/images/placeholder.jpg"}
                            alt={item.name}
                            className="h-10 w-10 rounded-lg object-cover border border-gold/15 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-cream truncate">{item.name}</p>
                            <p className="text-[10px] text-cream/50 truncate">{translateItemName(item.name, "ta")}</p>
                            <p className="text-[11px] font-bold text-amber-600">Rs. {item.price}</p>
                          </div>
                        </div>

                        <div>
                          {isAlreadyAdded ? (
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="px-2.5 py-1 rounded-lg bg-red-500/15 border border-red-500/30 text-red-600 text-xs font-bold hover:bg-red-500/25 cursor-pointer"
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAddItem(item.id)}
                              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-xs font-bold hover:from-emerald-700 hover:to-emerald-800 cursor-pointer shadow-xs"
                            >
                              <LuPlus size={13} />
                              Add
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-3 border-t border-gold/15 bg-surface-2 flex items-center justify-between">
                <span className="text-xs text-cream/60">
                  {currentSpecialItemIds.length} dish(es) currently selected
                </span>
                <button
                  onClick={() => setPickerOpen(false)}
                  className="px-4 py-1.5 rounded-xl bg-[#8B0000] text-white hover:bg-[#A6291A] text-xs font-bold cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
