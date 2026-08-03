import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { query } from "../db/db.js";
import { requireAuth } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, "../../uploads");

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const settings = (await query("SELECT * FROM settings WHERE id = 1")).rows[0];
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

router.put(
  "/",
  requireAuth,
  upload.fields([{ name: "logo", maxCount: 1 }, { name: "banner", maxCount: 1 }]),
  async (req, res, next) => {
    try {
      const existing = (await query("SELECT * FROM settings WHERE id = 1")).rows[0];

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

      const nextSettings = { ...existing };
      fields.forEach((f) => {
        if (req.body[f] !== undefined) nextSettings[f] = req.body[f];
      });

      if (req.files?.logo?.[0]) {
        if (existing.logo) fs.unlink(path.join(uploadsDir, path.basename(existing.logo)), () => {});
        nextSettings.logo = `/uploads/${req.files.logo[0].filename}`;
      }
      if (req.files?.banner?.[0]) {
        if (existing.banner) fs.unlink(path.join(uploadsDir, path.basename(existing.banner)), () => {});
        nextSettings.banner = `/uploads/${req.files.banner[0].filename}`;
      }

      const { rows } = await query(
        `UPDATE settings SET
          restaurant_name = $1, tagline = $2, logo = $3, banner = $4, address = $5, phone = $6,
          opening_hours = $7, facebook = $8, instagram = $9, whatsapp = $10,
          theme_primary = $11, theme_dark = $12, menu_url = $13
         WHERE id = 1
         RETURNING *`,
        [
          nextSettings.restaurant_name,
          nextSettings.tagline,
          nextSettings.logo,
          nextSettings.banner,
          nextSettings.address,
          nextSettings.phone,
          nextSettings.opening_hours,
          nextSettings.facebook,
          nextSettings.instagram,
          nextSettings.whatsapp,
          nextSettings.theme_primary,
          nextSettings.theme_dark,
          nextSettings.menu_url,
        ]
      );

      res.json(rows[0]);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
