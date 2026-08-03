import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db/db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  const admin = db.prepare("SELECT * FROM admins WHERE username = ?").get(username);
  if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const token = jwt.sign(
    { id: admin.id, username: admin.username },
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );

  res.json({ token, username: admin.username });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ username: req.admin.username });
});

router.post("/change-password", requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters" });
  }

  const admin = db.prepare("SELECT * FROM admins WHERE id = ?").get(req.admin.id);
  if (!admin || !bcrypt.compareSync(currentPassword, admin.password_hash)) {
    return res.status(401).json({ error: "Current password is incorrect" });
  }

  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare("UPDATE admins SET password_hash = ? WHERE id = ?").run(hash, admin.id);
  res.json({ success: true });
});

export default router;
