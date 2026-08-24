import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ensureDbInitialized, seedDefaults, query } from "./db/db.js";
import authRoutes from "./routes/auth.routes.js";
import categoriesRoutes from "./routes/categories.routes.js";
import itemsRoutes from "./routes/items.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import statsRoutes from "./routes/stats.routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

// Auto-initialize DB schema & default seed on API requests without blocking top-level module load
app.use("/api", async (req, res, next) => {
  if (req.path === "/health" || req.path === "/seed") {
    return next();
  }
  try {
    await ensureDbInitialized();
    next();
  } catch (err) {
    console.error("Database initialization failed:", err.message);
    return res.status(500).json({ error: `Database Connection/Initialization Error: ${err.message}` });
  }
});

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Explicit endpoint to feed/seed the live database on demand
app.all("/api/seed", async (req, res) => {
  try {
    const force = req.query.force === "true" || req.body?.force === true;
    await seedDefaults({ force });

    const categoriesCount = Number((await query("SELECT COUNT(*) AS count FROM categories")).rows[0].count);
    const itemsCount = Number((await query("SELECT COUNT(*) AS count FROM items")).rows[0].count);

    res.json({
      success: true,
      message: force ? "Live database re-seeded successfully." : "Live database verified and seeded successfully.",
      stats: { categoriesCount, itemsCount },
    });
  } catch (err) {
    console.error("Manual seed failed:", err);
    res.status(500).json({ error: `Failed to seed database: ${err.message}` });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/items", itemsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/stats", statsRoutes);

// Generic error handler
app.use((err, req, res, next) => {
  if (err) {
    console.error("Express API Error:", err.message);
    const statusCode = err.status || err.statusCode || 500;
    return res.status(statusCode).json({ error: err.message || "Something went wrong" });
  }
  next();
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Amutha Surabi Menu API running on http://localhost:${PORT}`);
  });
}

export default app;
