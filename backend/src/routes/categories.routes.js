import { Router } from "express";
import db from "../db/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const slugify = (s) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// Public: list categories with item counts
router.get("/", (req, res) => {
  const categories = db
    .prepare(
      `SELECT c.*,
        (SELECT COUNT(*) FROM items i WHERE i.category_id = c.id) AS item_count
       FROM categories c
       ORDER BY c.sort_order ASC, c.id ASC`
    )
    .all();
  res.json(categories);
});

router.post("/", requireAuth, (req, res) => {
  const { name, icon } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: "Category name is required" });

  const slug = slugify(name);
  const exists = db.prepare("SELECT id FROM categories WHERE slug = ?").get(slug);
  if (exists) return res.status(409).json({ error: "A category with this name already exists" });

  const maxOrder = db.prepare("SELECT MAX(sort_order) AS m FROM categories").get().m ?? -1;
  const info = db
    .prepare("INSERT INTO categories (name, slug, icon, sort_order) VALUES (?, ?, ?, ?)")
    .run(name.trim(), slug, icon || "", maxOrder + 1);

  const category = db.prepare("SELECT * FROM categories WHERE id = ?").get(info.lastInsertRowid);
  res.status(201).json(category);
});

router.put("/:id", requireAuth, (req, res) => {
  const { name, icon } = req.body;
  const category = db.prepare("SELECT * FROM categories WHERE id = ?").get(req.params.id);
  if (!category) return res.status(404).json({ error: "Category not found" });

  const newName = name?.trim() || category.name;
  const newSlug = slugify(newName);
  const clash = db
    .prepare("SELECT id FROM categories WHERE slug = ? AND id != ?")
    .get(newSlug, req.params.id);
  if (clash) return res.status(409).json({ error: "A category with this name already exists" });

  db.prepare("UPDATE categories SET name = ?, slug = ?, icon = ? WHERE id = ?").run(
    newName,
    newSlug,
    icon ?? category.icon,
    req.params.id
  );

  res.json(db.prepare("SELECT * FROM categories WHERE id = ?").get(req.params.id));
});

router.delete("/:id", requireAuth, (req, res) => {
  const category = db.prepare("SELECT * FROM categories WHERE id = ?").get(req.params.id);
  if (!category) return res.status(404).json({ error: "Category not found" });

  const itemCount = db
    .prepare("SELECT COUNT(*) AS c FROM items WHERE category_id = ?")
    .get(req.params.id).c;
  if (itemCount > 0) {
    return res
      .status(400)
      .json({ error: `Cannot delete category with ${itemCount} item(s). Move or delete the items first.` });
  }

  db.prepare("DELETE FROM categories WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// Reorder: body = { order: [categoryId, categoryId, ...] } in desired sequence
router.post("/reorder", requireAuth, (req, res) => {
  const { order } = req.body;
  if (!Array.isArray(order)) return res.status(400).json({ error: "order must be an array of category IDs" });

  const update = db.prepare("UPDATE categories SET sort_order = ? WHERE id = ?");
  const reorderAll = db.transaction(() => {
    order.forEach((id, index) => update.run(index, id));
  });
  reorderAll();

  res.json({ success: true });
});

export default router;
