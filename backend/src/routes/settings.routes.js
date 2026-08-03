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

router.get("/", (req, res) => {
  const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get();
  res.json(settings);
});

router.put(
  "/",
  requireAuth,
  upload.fields([{ name: "logo", maxCount: 1 }, { name: "banner", maxCount: 1 }]),
  (req, res) => {
    const existing = db.prepare("SELECT * FROM settings WHERE id = 1").get();

    const fields = [
      "restaurant_name",
      "tagline",
      "address",
      "phone",
      "opening_hours",
      "facebook",
      "instagram",
      "whatsapp",
      "theme_primary",
      "theme_dark",
      "menu_url",
    ];

    const next = { ...existing };
    fields.forEach((f) => {
      if (req.body[f] !== undefined) next[f] = req.body[f];
    });

    if (req.files?.logo?.[0]) {
      if (existing.logo) fs.unlink(path.join(uploadsDir, path.basename(existing.logo)), () => {});
      next.logo = `/uploads/${req.files.logo[0].filename}`;
    }
    if (req.files?.banner?.[0]) {
      if (existing.banner) fs.unlink(path.join(uploadsDir, path.basename(existing.banner)), () => {});
      next.banner = `/uploads/${req.files.banner[0].filename}`;
    }

    db.prepare(
      `UPDATE settings SET
        restaurant_name = ?, tagline = ?, logo = ?, banner = ?, address = ?, phone = ?,
        opening_hours = ?, facebook = ?, instagram = ?, whatsapp = ?,
        theme_primary = ?, theme_dark = ?, menu_url = ?
       WHERE id = 1`
    ).run(
      next.restaurant_name,
      next.tagline,
      next.logo,
      next.banner,
      next.address,
      next.phone,
      next.opening_hours,
      next.facebook,
      next.instagram,
      next.whatsapp,
      next.theme_primary,
      next.theme_dark,
      next.menu_url
    );

    res.json(db.prepare("SELECT * FROM settings WHERE id = 1").get());
  }
);

export default router;
