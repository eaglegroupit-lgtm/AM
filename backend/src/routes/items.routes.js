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
  };
}

router.get("/", async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT i.*, c.name AS category_name, c.slug AS category_slug
       FROM items i
       JOIN categories c ON c.id = i.category_id
       ORDER BY c.sort_order ASC, i.sort_order ASC, i.id ASC`
    );
    res.json(rows.map(serializeItem));
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
    const { category_id, name, description, price, is_available, is_popular, is_chef_recommended, is_new } = req.body;

    if (!category_id || !name || !name.trim() || price === undefined) {
      return res.status(400).json({ error: "category_id, name and price are required" });
    }

    const category = (await query("SELECT id FROM categories WHERE id = $1", [category_id])).rows[0];
    if (!category) return res.status(400).json({ error: "Invalid category" });

    const maxOrder = Number(
      (await query("SELECT COALESCE(MAX(sort_order), -1) AS m FROM items WHERE category_id = $1", [category_id])).rows[0].m
    );
    const image = req.file ? `/uploads/${req.file.filename}` : "";

    const { rows } = await query(
      `INSERT INTO items
        (category_id, name, description, price, image, is_available, is_popular, is_chef_recommended, is_new, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
      remove_image,
    } = req.body;

    let image = existing.image;
    if (req.file) {
      if (existing.image) fs.unlink(path.join(uploadsDir, path.basename(existing.image)), () => {});
      image = `/uploads/${req.file.filename}`;
    } else if (remove_image === "true" || remove_image === true) {
      if (existing.image) fs.unlink(path.join(uploadsDir, path.basename(existing.image)), () => {});
      image = "";
    }

    const { rows } = await query(
      `UPDATE items SET
        category_id = $1, name = $2, description = $3, price = $4, image = $5,
        is_available = $6, is_popular = $7, is_chef_recommended = $8, is_new = $9,
        updated_at = now()
       WHERE id = $10
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
