import { Router } from "express";
import { query } from "../db/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const count = async (sql, params = []) => Number((await query(sql, params)).rows[0].c);

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const totalItems = await count("SELECT COUNT(*) AS c FROM items");
    const availableItems = await count("SELECT COUNT(*) AS c FROM items WHERE is_available = true");
    const unavailableItems = totalItems - availableItems;
    const totalCategories = await count("SELECT COUNT(*) AS c FROM categories");
    const popularItems = await count("SELECT COUNT(*) AS c FROM items WHERE is_popular = true");
    const chefRecommended = await count("SELECT COUNT(*) AS c FROM items WHERE is_chef_recommended = true");
    const newItems = await count("SELECT COUNT(*) AS c FROM items WHERE is_new = true");

    const itemsPerCategory = (
      await query(
        `SELECT c.name, COUNT(i.id)::int AS count
         FROM categories c
         LEFT JOIN items i ON i.category_id = c.id
         GROUP BY c.id
         ORDER BY c.sort_order ASC`
      )
    ).rows;

    const recentlyAdded = (
      await query(
        `SELECT i.id, i.name, i.created_at, c.name AS category_name
         FROM items i JOIN categories c ON c.id = i.category_id
         ORDER BY i.created_at DESC LIMIT 5`
      )
    ).rows;

    res.json({
      totalItems,
      availableItems,
      unavailableItems,
      totalCategories,
      popularItems,
      chefRecommended,
      newItems,
      itemsPerCategory,
      recentlyAdded,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
