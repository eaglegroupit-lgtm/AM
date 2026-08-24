import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { query, transaction } from "../db/db.js";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, "../../uploads");

const router = Router();

const toBool = (v) => Boolean(v === true || v === "true" || v === 1 || v === "1");

function serializeItem(item) {
  return {
    ...item,
    price: Number(item.price),
    is_available: !!item.is_available,
    is_popular: !!item.is_popular,
    is_chef_recommended: !!item.is_chef_recommended,
    is_new: !!item.is_new,
    is_breakfast: item.is_breakfast !== false,
    is_lunch: item.is_lunch !== false,
    is_snacks: item.is_snacks !== false,
    is_dinner: item.is_dinner !== false,
  };
}

import { getCurrentMealTime } from "../utils/istTime.js";

router.get("/", async (req, res, next) => {
  try {
    const currentMeal = getCurrentMealTime();
    const filterCurrent = req.query.meal === "current" || req.query.current_time === "true";

    let sql = `
      SELECT i.*, c.name AS category_name, c.slug AS category_slug
      FROM items i
      JOIN categories c ON c.id = i.category_id
    `;
    const params = [];

    if (filterCurrent) {
      sql += ` WHERE c.slug = $1 OR c.name ILIKE $2 `;
      params.push(currentMeal.slug, `%${currentMeal.name}%`);
    }

    sql += ` ORDER BY c.sort_order ASC, i.sort_order ASC, i.id ASC`;

    const { rows } = await query(sql, params);
    const enriched = rows.map((r) => ({
      ...serializeItem(r),
      is_current_meal: Boolean(r.category_slug === currentMeal.slug || r.category_name?.toLowerCase().includes(currentMeal.slug)),
    }));

    res.setHeader("X-Current-Meal", currentMeal.slug);
    res.setHeader("X-IST-Time", currentMeal.time);
    res.json(enriched);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const item = (await query("SELECT * FROM items WHERE id = $1", [req.params.id])).rows[0];
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(serializeItem(item));
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, upload.single("image"), async (req, res, next) => {
  try {
    const {
      category_id,
      name,
      description,
      price,
      is_available,
      is_popular,
      is_chef_recommended,
      is_new,
      is_breakfast,
      is_lunch,
      is_snacks,
      is_dinner,
    } = req.body;

    if (!category_id || !name || !name.trim()) {
      return res.status(400).json({ error: "category_id and name are required" });
    }

    const category = (await query("SELECT id FROM categories WHERE id = $1", [category_id])).rows[0];
    if (!category) return res.status(400).json({ error: "Invalid category" });

    const maxOrder = Number(
      (await query("SELECT COALESCE(MAX(sort_order), -1) AS m FROM items WHERE category_id = $1", [category_id])).rows[0].m
    );
    
    let image = "";
    if (req.file) {
      image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    } else if (req.body.image) {
      image = req.body.image;
    }

    const { rows } = await query(
      `INSERT INTO items
        (category_id, name, description, price, image, is_available, is_popular, is_chef_recommended, is_new, sort_order, is_breakfast, is_lunch, is_snacks, is_dinner)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        category_id,
        name.trim(),
        description || "",
        parseFloat(price) || 0,
        image,
        is_available === undefined ? true : toBool(is_available),
        toBool(is_popular),
        toBool(is_chef_recommended),
        toBool(is_new),
        maxOrder + 1,
        is_breakfast === undefined ? true : toBool(is_breakfast),
        is_lunch === undefined ? true : toBool(is_lunch),
        is_snacks === undefined ? true : toBool(is_snacks),
        is_dinner === undefined ? true : toBool(is_dinner),
      ]
    );

    res.status(201).json(serializeItem(rows[0]));
  } catch (error) {
    next(error);
  }
});

router.put("/:id", requireAuth, upload.single("image"), async (req, res, next) => {
  try {
    const existing = (await query("SELECT * FROM items WHERE id = $1", [req.params.id])).rows[0];
    if (!existing) return res.status(404).json({ error: "Item not found" });

    const {
      category_id,
      name,
      description,
      price,
      is_available,
      is_popular,
      is_chef_recommended,
      is_new,
      is_breakfast,
      is_lunch,
      is_snacks,
      is_dinner,
      remove_image,
    } = req.body;

    let image = existing.image;
    if (req.file) {
      image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    } else if (remove_image === "true" || remove_image === true) {
      image = "";
    } else if (req.body.image !== undefined) {
      image = req.body.image;
    }

    const { rows } = await query(
      `UPDATE items SET
        category_id = $1, name = $2, description = $3, price = $4, image = $5,
        is_available = $6, is_popular = $7, is_chef_recommended = $8, is_new = $9,
        is_breakfast = $10, is_lunch = $11, is_snacks = $12, is_dinner = $13,
        updated_at = now()
       WHERE id = $14
       RETURNING *`,
      [
        category_id ?? existing.category_id,
        name?.trim() ?? existing.name,
        description ?? existing.description,
        price !== undefined ? parseFloat(price) : existing.price,
        image,
        is_available !== undefined ? toBool(is_available) : existing.is_available,
        is_popular !== undefined ? toBool(is_popular) : existing.is_popular,
        is_chef_recommended !== undefined ? toBool(is_chef_recommended) : existing.is_chef_recommended,
        is_new !== undefined ? toBool(is_new) : existing.is_new,
        is_breakfast !== undefined ? toBool(is_breakfast) : existing.is_breakfast,
        is_lunch !== undefined ? toBool(is_lunch) : existing.is_lunch,
        is_snacks !== undefined ? toBool(is_snacks) : existing.is_snacks,
        is_dinner !== undefined ? toBool(is_dinner) : existing.is_dinner,
        req.params.id,
      ]
    );

    res.json(serializeItem(rows[0]));
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/meals", requireAuth, async (req, res, next) => {
  try {
    const { is_breakfast, is_lunch, is_snacks, is_dinner } = req.body;
    const existing = (await query("SELECT * FROM items WHERE id = $1", [req.params.id])).rows[0];
    if (!existing) return res.status(404).json({ error: "Item not found" });

    const { rows } = await query(
      `UPDATE items SET
        is_breakfast = $1, is_lunch = $2, is_snacks = $3, is_dinner = $4, updated_at = now()
       WHERE id = $5 RETURNING *`,
      [
        is_breakfast !== undefined ? toBool(is_breakfast) : existing.is_breakfast,
        is_lunch !== undefined ? toBool(is_lunch) : existing.is_lunch,
        is_snacks !== undefined ? toBool(is_snacks) : existing.is_snacks,
        is_dinner !== undefined ? toBool(is_dinner) : existing.is_dinner,
        req.params.id,
      ]
    );
    res.json(serializeItem(rows[0]));
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const item = (await query("SELECT * FROM items WHERE id = $1", [req.params.id])).rows[0];
    if (!item) return res.status(404).json({ error: "Item not found" });

    if (item.image) fs.unlink(path.join(uploadsDir, path.basename(item.image)), () => {});
    await query("DELETE FROM items WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id/availability", requireAuth, async (req, res, next) => {
  try {
    const { is_available } = req.body;
    const { rows } = await query(
      "UPDATE items SET is_available = $1, updated_at = now() WHERE id = $2 RETURNING *",
      [toBool(is_available), req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Item not found" });
    res.json(serializeItem(rows[0]));
  } catch (error) {
    next(error);
  }
});

router.post("/bulk-availability", requireAuth, async (req, res, next) => {
  try {
    const { ids, is_available } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "ids must be a non-empty array" });
    }

    await query("UPDATE items SET is_available = $1, updated_at = now() WHERE id = ANY($2::int[])", [
      toBool(is_available),
      ids,
    ]);
    res.json({ success: true, updated: ids.length });
  } catch (error) {
    next(error);
  }
});

router.post("/move-category", requireAuth, async (req, res, next) => {
  try {
    const { ids, category_id } = req.body;
    if (!Array.isArray(ids) || ids.length === 0 || !category_id) {
      return res.status(400).json({ error: "ids and category_id are required" });
    }

    const category = (await query("SELECT id FROM categories WHERE id = $1", [category_id])).rows[0];
    if (!category) return res.status(400).json({ error: "Invalid category" });

    await transaction(async (client) => {
      for (const id of ids) {
        await client.query("UPDATE items SET category_id = $1, updated_at = now() WHERE id = $2", [category_id, id]);
      }
    });

    res.json({ success: true, moved: ids.length });
  } catch (error) {
    next(error);
  }
});

export default router;
