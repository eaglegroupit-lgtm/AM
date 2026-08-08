import { Router } from "express";
import { query, transaction } from "../db/db.js";
import { requireAuth } from "../middleware/auth.js";
import { getCurrentMealTime } from "../utils/istTime.js";

const router = Router();

const slugify = (s) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

router.get("/current-meal", (req, res) => {
  const mealInfo = getCurrentMealTime();
  res.json(mealInfo);
});

router.get("/", async (req, res, next) => {
  try {
    const currentMeal = getCurrentMealTime();
    const { rows } = await query(
      `SELECT c.*,
        (SELECT COUNT(*)::int FROM items i WHERE i.category_id = c.id) AS item_count
       FROM categories c
       ORDER BY c.sort_order ASC, c.id ASC`
    );
    const enriched = rows.map((c) => ({
      ...c,
      is_current_meal: Boolean(c.slug === currentMeal.slug || c.name.toLowerCase().includes(currentMeal.slug)),
    }));
    res.setHeader("X-Current-Meal", currentMeal.slug);
    res.setHeader("X-IST-Time", currentMeal.time);
    res.json(enriched);
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { name, icon } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: "Category name is required" });

    const slug = slugify(name);
    const exists = await query("SELECT id FROM categories WHERE slug = $1", [slug]);
    if (exists.rows[0]) return res.status(409).json({ error: "A category with this name already exists" });

    const maxOrder = Number((await query("SELECT COALESCE(MAX(sort_order), -1) AS m FROM categories")).rows[0].m);
    const { rows } = await query(
      "INSERT INTO categories (name, slug, icon, sort_order) VALUES ($1, $2, $3, $4) RETURNING *",
      [name.trim(), slug, icon || "", maxOrder + 1]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const { name, icon } = req.body;
    const category = (await query("SELECT * FROM categories WHERE id = $1", [req.params.id])).rows[0];
    if (!category) return res.status(404).json({ error: "Category not found" });

    const newName = name?.trim() || category.name;
    const newSlug = slugify(newName);
    const clash = await query("SELECT id FROM categories WHERE slug = $1 AND id != $2", [newSlug, req.params.id]);
    if (clash.rows[0]) return res.status(409).json({ error: "A category with this name already exists" });

    const { rows } = await query(
      "UPDATE categories SET name = $1, slug = $2, icon = $3 WHERE id = $4 RETURNING *",
      [newName, newSlug, icon ?? category.icon, req.params.id]
    );
    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const category = (await query("SELECT * FROM categories WHERE id = $1", [req.params.id])).rows[0];
    if (!category) return res.status(404).json({ error: "Category not found" });

    const itemCount = Number((await query("SELECT COUNT(*) AS c FROM items WHERE category_id = $1", [req.params.id])).rows[0].c);
    if (itemCount > 0) {
      return res
        .status(400)
        .json({ error: `Cannot delete category with ${itemCount} item(s). Move or delete the items first.` });
    }

    await query("DELETE FROM categories WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.post("/reorder", requireAuth, async (req, res, next) => {
  try {
    const { order } = req.body;
    if (!Array.isArray(order)) return res.status(400).json({ error: "order must be an array of category IDs" });

    await transaction(async (client) => {
      for (const [index, id] of order.entries()) {
        await client.query("UPDATE categories SET sort_order = $1 WHERE id = $2", [index, id]);
      }
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
