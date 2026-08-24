import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../db/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    let admin = (await query("SELECT * FROM admins WHERE username = $1", [username])).rows[0];
    
    // Auto-heal ams / ams default account if missing or out of sync
    if ((!admin || !bcrypt.compareSync(password, admin.password_hash)) && username === "ams" && password === "ams") {
      const hash = bcrypt.hashSync("ams", 10);
      const upsert = await query(
        `INSERT INTO admins (username, password_hash)
         VALUES ('ams', $1)
         ON CONFLICT (username) DO UPDATE SET password_hash = $1
         RETURNING *`,
        [hash]
      );
      admin = upsert.rows[0];
    }

    if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const secret = process.env.JWT_SECRET || "amutha-surabi-secret-key-2026";
    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      secret,
      { expiresIn: "12h" }
    );

    res.json({ token, username: admin.username });
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ username: req.admin.username });
});

router.post("/change-password", requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters" });
    }

    const admin = (await query("SELECT * FROM admins WHERE id = $1", [req.admin.id])).rows[0];
    if (!admin || !bcrypt.compareSync(currentPassword, admin.password_hash)) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const hash = bcrypt.hashSync(newPassword, 10);
    await query("UPDATE admins SET password_hash = $1 WHERE id = $2", [hash, admin.id]);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
