import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import db from "../db/db.js";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, "../../uploads");

const router = Router();

const toBool = (v) => (v ? 1 : 0);

function serializeItem(item) {
  return {
    ...item,
    is_available: !!item.is_available,
    is_popular: !!item.is_popular,
    is_chef_recommended: !!item.is_chef_recommended,
    is_new: !!item.is_new,
  };
}

// Public: list all items (customer menu consumes this)
router.get("/", (req, res) => {
  const items = db
    .prepare(
      `SELECT i.*, c.name AS category_name, c.slug AS category_slug
       FROM items i
       JOIN categories c ON c.id = i.category_id
       ORDER BY c.sort_order ASC, i.sort_order ASC, i.id ASC`
    )
    .all();
  res.json(items.map(serializeItem));
});

router.get("/:id", (req, res) => {
  const item = db.prepare("SELECT * FROM items WHERE id = ?").get(req.params.id);
  if (!item) return res.status(404).json({ error: "Item not found" });
  res.json(serializeItem(item));
});

router.post("/", requireAuth, upload.single("image"), (req, res) => {
  const { category_id, name, description, price, is_available, is_popular, is_chef_recommended, is_new } = req.body;

  if (!category_id || !name || !name.trim() || price === undefined) {
    return res.status(400).json({ error: "category_id, name and price are required" });
  }

  const category = db.prepare("SELECT id FROM categories WHERE id = ?").get(category_id);
  if (!category) return res.status(400).json({ error: "Invalid category" });

  const maxOrder =
    db.prepare("SELECT MAX(sort_order) AS m FROM items WHERE category_id = ?").get(category_id).m ?? -1;

  const image = req.file ? `/uploads/${req.file.filename}` : "";

  const info = db
    .prepare(
      `INSERT INTO items
        (category_id, name, description, price, image, is_available, is_popular, is_chef_recommended, is_new, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      category_id,
      name.trim(),
      description || "",
      parseFloat(price) || 0,
      image,
      is_available === undefined ? 1 : toBool(is_available === "true" || is_available === true),
      toBool(is_popular === "true" || is_popular === true),
      toBool(is_chef_recommended === "true" || is_chef_recommended === true),
      toBool(is_new === "true" || is_new === true),
      maxOrder + 1
    );

  const item = db.prepare("SELECT * FROM items WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(serializeItem(item));
});

router.put("/:id", requireAuth, upload.single("image"), (req, res) => {
  const existing = db.prepare("SELECT * FROM items WHERE id = ?").get(req.params.id);
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
    if (existing.image) {
      const oldPath = path.join(uploadsDir, path.basename(existing.image));
      fs.unlink(oldPath, () => {});
    }
    image = `/uploads/${req.file.filename}`;
  } else if (remove_image === "true" || remove_image === true) {
    if (existing.image) {
      const oldPath = path.join(uploadsDir, path.basename(existing.image));
      fs.unlink(oldPath, () => {});
    }
    image = "";
  }

  db.prepare(
    `UPDATE items SET
      category_id = ?, name = ?, description = ?, price = ?, image = ?,
      is_available = ?, is_popular = ?, is_chef_recommended = ?, is_new = ?,
      updated_at = datetime('now')
     WHERE id = ?`
  ).run(
    category_id ?? existing.category_id,
    name?.trim() ?? existing.name,
    description ?? existing.description,
    price !== undefined ? parseFloat(price) : existing.price,
    image,
    is_available !== undefined ? toBool(is_available === "true" || is_available === true) : existing.is_available,
    is_popular !== undefined ? toBool(is_popular === "true" || is_popular === true) : existing.is_popular,
    is_chef_recommended !== undefined
      ? toBool(is_chef_recommended === "true" || is_chef_recommended === true)
      : existing.is_chef_recommended,
    is_new !== undefined ? toBool(is_new === "true" || is_new === true) : existing.is_new,
    req.params.id
  );

  const item = db.prepare("SELECT * FROM items WHERE id = ?").get(req.params.id);
  res.json(serializeItem(item));
});

router.delete("/:id", requireAuth, (req, res) => {
  const item = db.prepare("SELECT * FROM items WHERE id = ?").get(req.params.id);
  if (!item) return res.status(404).json({ error: "Item not found" });

  if (item.image) {
    const imgPath = path.join(uploadsDir, path.basename(item.image));
    fs.unlink(imgPath, () => {});
  }

  db.prepare("DELETE FROM items WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

router.patch("/:id/availability", requireAuth, (req, res) => {
  const { is_available } = req.body;
  const item = db.prepare("SELECT * FROM items WHERE id = ?").get(req.params.id);
  if (!item) return res.status(404).json({ error: "Item not found" });

  db.prepare("UPDATE items SET is_available = ?, updated_at = datetime('now') WHERE id = ?").run(
    toBool(is_available),
    req.params.id
  );
  res.json(serializeItem(db.prepare("SELECT * FROM items WHERE id = ?").get(req.params.id)));
});

// Bulk availability toggle: body = { ids: [1,2,3], is_available: true }
router.post("/bulk-availability", requireAuth, (req, res) => {
  const { ids, is_available } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "ids must be a non-empty array" });
  }

  const update = db.prepare("UPDATE items SET is_available = ?, updated_at = datetime('now') WHERE id = ?");
  const bulk = db.transaction(() => {
    ids.forEach((id) => update.run(toBool(is_available), id));
  });
  bulk();

  res.json({ success: true, updated: ids.length });
});

// Move multiple items to a different category
router.post("/move-category", requireAuth, (req, res) => {
  const { ids, category_id } = req.body;
  if (!Array.isArray(ids) || ids.length === 0 || !category_id) {
    return res.status(400).json({ error: "ids and category_id are required" });
  }

  const category = db.prepare("SELECT id FROM categories WHERE id = ?").get(category_id);
  if (!category) return res.status(400).json({ error: "Invalid category" });

  const update = db.prepare(
    "UPDATE items SET category_id = ?, updated_at = datetime('now') WHERE id = ?"
  );
  const bulk = db.transaction(() => {
    ids.forEach((id) => update.run(category_id, id));
  });
  bulk();

  res.json({ success: true, moved: ids.length });
});

export default router;
