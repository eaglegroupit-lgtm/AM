import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LuUtensilsCrossed,
  LuCircleCheck,
  LuCircleX,
  LuFolderTree,
  LuFlame,
  LuChefHat,
  LuSparkles,
} from "react-icons/lu";
import { api } from "../../lib/api";
import StatCard from "../../components/admin/StatCard";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getStats().then(setStats).catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl sm:text-3xl font-bold gold-text">Dashboard</h1>
        <p className="text-sm text-cream/50 mt-1">Overview of your digital menu</p>
      </div>

      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

      {stats && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Menu Items" value={stats.totalItems} icon={LuUtensilsCrossed} tone="gold" />
            <StatCard label="Available Items" value={stats.availableItems} icon={LuCircleCheck} tone="green" />
            <StatCard label="Unavailable Items" value={stats.unavailableItems} icon={LuCircleX} tone="red" />
            <StatCard label="Categories" value={stats.totalCategories} icon={LuFolderTree} tone="blue" />
            <StatCard label="Popular Items" value={stats.popularItems} icon={LuFlame} tone="gold" />
            <StatCard label="Chef Recommended" value={stats.chefRecommended} icon={LuChefHat} tone="gold" />
            <StatCard label="New Items" value={stats.newItems} icon={LuSparkles} tone="gold" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mt-8">
            <div className="glass-card gold-border rounded-2xl p-5">
              <h2 className="font-display text-lg font-semibold text-cream mb-4">Items per Category</h2>
              <div className="space-y-3">
                {stats.itemsPerCategory.map((c) => {
                  const max = Math.max(...stats.itemsPerCategory.map((x) => x.count), 1);
                  return (
                    <div key={c.name}>
                      <div className="flex justify-between text-xs text-cream/60 mb-1">
                        <span>{c.name}</span>
                        <span>{c.count}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-black/5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-gold-light to-gold"
                          style={{ width: `${(c.count / max) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass-card gold-border rounded-2xl p-5">
              <h2 className="font-display text-lg font-semibold text-cream mb-4">Recently Added</h2>
              {stats.recentlyAdded.length === 0 && <p className="text-sm text-cream/40">No items yet.</p>}
              <ul className="space-y-3">
                {stats.recentlyAdded.map((item) => (
                  <li key={item.id} className="flex justify-between items-center text-sm">
                    <div>
                      <p className="text-cream">{item.name}</p>
                      <p className="text-xs text-cream/40">{item.category_name}</p>
                    </div>
                    <span className="text-[11px] text-cream/30">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-8">
            <Link
              to="/admin/items"
              className="rounded-xl bg-gradient-to-r from-gold-light to-gold px-5 py-2.5 text-sm font-semibold text-black"
            >
              Manage Menu Items
            </Link>
            <Link
              to="/admin/categories"
              className="rounded-xl gold-border px-5 py-2.5 text-sm font-medium text-gold-light hover:bg-gold/10"
            >
              Manage Categories
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
