import { Router } from "express";
import db from "../db/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, (req, res) => {
  const totalItems = db.prepare("SELECT COUNT(*) AS c FROM items").get().c;
  const availableItems = db.prepare("SELECT COUNT(*) AS c FROM items WHERE is_available = 1").get().c;
  const unavailableItems = totalItems - availableItems;
  const totalCategories = db.prepare("SELECT COUNT(*) AS c FROM categories").get().c;
  const popularItems = db.prepare("SELECT COUNT(*) AS c FROM items WHERE is_popular = 1").get().c;
  const chefRecommended = db.prepare("SELECT COUNT(*) AS c FROM items WHERE is_chef_recommended = 1").get().c;
  const newItems = db.prepare("SELECT COUNT(*) AS c FROM items WHERE is_new = 1").get().c;

  const itemsPerCategory = db
    .prepare(
      `SELECT c.name, COUNT(i.id) AS count
       FROM categories c
       LEFT JOIN items i ON i.category_id = c.id
       GROUP BY c.id
       ORDER BY c.sort_order ASC`
    )
    .all();

  const recentlyAdded = db
    .prepare(
      `SELECT i.id, i.name, i.created_at, c.name AS category_name
       FROM items i JOIN categories c ON c.id = i.category_id
       ORDER BY i.created_at DESC LIMIT 5`
    )
    .all();

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
});

export default router;
