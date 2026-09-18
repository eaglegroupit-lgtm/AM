import { Router } from "express";
import { query, transaction } from "../db/db.js";
import { requireAuth } from "../middleware/auth.js";
import { getCurrentMealTime } from "../utils/istTime.js";
import { getCached, setCached, invalidateCache } from "../utils/cache.js";

const router = Router();

const DAYS_OF_WEEK = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function getCurrentISTDay() {
  const now = new Date();
  // IST offset is UTC+5:30 -> +330 minutes
  const istOffset = 330 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  return DAYS_OF_WEEK[istDate.getUTCDay()];
}

// GET /api/specials - public endpoint
router.get("/", async (req, res, next) => {
  try {
    const currentDay = getCurrentISTDay();
    const currentMeal = getCurrentMealTime();

    // Fetch all configured specials with item details
    const specialsResult = await query(`
      SELECT
        ds.id AS special_id,
        ds.day_of_week,
        ds.meal_slug,
        ds.sort_order,
        i.id,
        i.category_id,
        i.name,
        i.description,
        i.price,
        i.image,
        i.is_available,
        i.is_popular,
        i.is_chef_recommended,
        i.is_new,
        i.is_breakfast,
        i.is_lunch,
        i.is_snacks,
        i.is_dinner,
        c.name AS category_name,
        c.slug AS category_slug
      FROM daily_specials ds
      JOIN items i ON ds.item_id = i.id
      JOIN categories c ON i.category_id = c.id
      WHERE i.is_available = true
      ORDER BY ds.sort_order ASC, i.name ASC
    `);

    // Group by day_of_week -> meal_slug
    const specialsByDay = {};
    for (const day of DAYS_OF_WEEK) {
      specialsByDay[day] = {
        breakfast: [],
        lunch: [],
        "evening-snacks": [],
        dinner: [],
        all: [],
      };
    }

    for (const row of specialsResult.rows) {
      const day = (row.day_of_week || "").toLowerCase();
      const meal = row.meal_slug || "all";
      if (specialsByDay[day] && specialsByDay[day][meal]) {
        specialsByDay[day][meal].push(row);
      }
    }

    // Determine today's active specials (Admin configured OR Auto-fallback)
    const todaySpecials = { ...specialsByDay[currentDay] };

    // If any meal slot for today has no admin specials, provide auto-selected items from database
    const mealSlots = ["breakfast", "lunch", "evening-snacks", "dinner"];
    const allItemsResult = await query(`
      SELECT
        i.*,
        c.name AS category_name,
        c.slug AS category_slug
      FROM items i
      JOIN categories c ON i.category_id = c.id
      WHERE i.is_available = true
      ORDER BY i.sort_order ASC, i.id ASC
    `);
    const allItems = allItemsResult.rows;

    for (const slot of mealSlots) {
      if (!todaySpecials[slot] || todaySpecials[slot].length === 0) {
        // Filter items available for this meal slot
        const slotItems = allItems.filter((i) => {
          if (slot === "breakfast") return i.is_breakfast !== false;
          if (slot === "lunch") return i.is_lunch !== false;
          if (slot === "evening-snacks") return i.is_snacks !== false;
          if (slot === "dinner") return i.is_dinner !== false;
          return true;
        });

        // Pick 2-3 items deterministically based on day of week + item popularity
        const dayIndex = DAYS_OF_WEEK.indexOf(currentDay);
        const preferred = slotItems.filter((i) => i.is_chef_recommended || i.is_popular);
        const pool = preferred.length >= 3 ? preferred : slotItems;

        const selected = [];
        if (pool.length > 0) {
          const step = Math.max(1, Math.floor(pool.length / 3));
          for (let k = 0; k < 3 && k < pool.length; k++) {
            const idx = (dayIndex * 2 + k * step) % pool.length;
            if (!selected.some((item) => item.id === pool[idx].id)) {
              selected.push({ ...pool[idx], is_auto_special: true });
            }
          }
        }
        todaySpecials[slot] = selected;
      }
    }

    res.json({
      currentDay,
      currentMeal: currentMeal.slug,
      specialsByDay,
      todaySpecials,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/specials - Set specials for a day + meal slot (Admin only)
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { day_of_week, meal_slug, item_ids } = req.body;

    if (!day_of_week || !meal_slug || !Array.isArray(item_ids)) {
      return res.status(400).json({ error: "day_of_week, meal_slug, and item_ids array are required" });
    }

    const day = day_of_week.toLowerCase().trim();
    if (!DAYS_OF_WEEK.includes(day)) {
      return res.status(400).json({ error: `Invalid day_of_week. Must be one of: ${DAYS_OF_WEEK.join(", ")}` });
    }

    await transaction(async (client) => {
      // Clear previous specials for this day and meal
      await client.query(
        "DELETE FROM daily_specials WHERE day_of_week = $1 AND meal_slug = $2",
        [day, meal_slug]
      );

      // Insert new items
      for (let i = 0; i < item_ids.length; i++) {
        const itemId = parseInt(item_ids[i], 10);
        if (!isNaN(itemId)) {
          await client.query(
            `INSERT INTO daily_specials (day_of_week, meal_slug, item_id, sort_order)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (day_of_week, meal_slug, item_id) DO NOTHING`,
            [day, meal_slug, itemId, i]
          );
        }
      }
    });

    invalidateCache("specials");
    res.json({ success: true, message: `Specials updated for ${day} (${meal_slug})` });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/specials - Reset/Clear specials for a day + meal (reverts to automatic random rotation)
router.delete("/", requireAuth, async (req, res, next) => {
  try {
    const { day_of_week, meal_slug } = req.query;

    if (day_of_week && meal_slug) {
      await query(
        "DELETE FROM daily_specials WHERE day_of_week = $1 AND meal_slug = $2",
        [day_of_week.toLowerCase().trim(), meal_slug]
      );
    } else if (day_of_week) {
      await query(
        "DELETE FROM daily_specials WHERE day_of_week = $1",
        [day_of_week.toLowerCase().trim()]
      );
    } else {
      await query("DELETE FROM daily_specials");
    }

    invalidateCache("specials");
    res.json({ success: true, message: "Specials cleared. System will use automatic rotation." });
  } catch (err) {
    next(err);
  }
});

export default router;
