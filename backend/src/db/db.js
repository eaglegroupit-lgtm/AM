import "dotenv/config";
import pg from "pg";
import bcrypt from "bcryptjs";
import { defaultCategories, defaultItems, defaultSettings } from "./defaultData.js";

const { Pool } = pg;

let _pool = null;

export function getPool() {
  if (!_pool) {
    const rawConnectionString =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_PRISMA_URL ||
      process.env.POSTGRES_URL_NON_POOLING;

    if (!rawConnectionString) {
      throw new Error("Missing DATABASE_URL or POSTGRES_URL environment variable for Postgres connection");
    }

    const connectionString = rawConnectionString.replace(/([?&])sslmode=[^&]*&?/i, "$1").replace(/[?&]$/, "");

    _pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });
  }
  return _pool;
}

export async function query(text, params = []) {
  const p = getPool();
  const result = await p.query(text, params);
  return result;
}

export async function transaction(callback) {
  const p = getPool();
  const client = await p.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function initDb() {
  await query(`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      icon TEXT DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      price NUMERIC NOT NULL DEFAULT 0,
      image TEXT DEFAULT '',
      is_available BOOLEAN NOT NULL DEFAULT true,
      is_popular BOOLEAN NOT NULL DEFAULT false,
      is_chef_recommended BOOLEAN NOT NULL DEFAULT false,
      is_new BOOLEAN NOT NULL DEFAULT false,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      restaurant_name TEXT DEFAULT 'Amutha Surabi Restaurant',
      tagline TEXT DEFAULT 'Experience Authentic Taste',
      logo TEXT DEFAULT '',
      banner TEXT DEFAULT '',
      address TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      opening_hours TEXT DEFAULT '',
      facebook TEXT DEFAULT '',
      instagram TEXT DEFAULT '',
      whatsapp TEXT DEFAULT '',
      theme_primary TEXT DEFAULT '#D4AF37',
      theme_dark TEXT DEFAULT '#0B0B0F',
      menu_url TEXT DEFAULT 'http://localhost:5173'
    );

    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    ALTER TABLE items ADD COLUMN IF NOT EXISTS is_breakfast BOOLEAN NOT NULL DEFAULT true;
    ALTER TABLE items ADD COLUMN IF NOT EXISTS is_lunch BOOLEAN NOT NULL DEFAULT true;
    ALTER TABLE items ADD COLUMN IF NOT EXISTS is_snacks BOOLEAN NOT NULL DEFAULT true;
    ALTER TABLE items ADD COLUMN IF NOT EXISTS is_dinner BOOLEAN NOT NULL DEFAULT true;
  `);
}

export async function seedDefaults(options = {}) {
  const { force = false } = options;
  await initDb();

  if (force) {
    await transaction(async (client) => {
      await client.query("TRUNCATE TABLE items, categories RESTART IDENTITY CASCADE");
      for (const category of defaultCategories) {
        await client.query(
          `INSERT INTO categories (id, name, slug, icon, sort_order)
           VALUES ($1, $2, $3, $4, $5)`,
          [category.id, category.name, category.slug, category.icon || "", category.sort_order]
        );
      }
      for (const item of defaultItems) {
        await client.query(
          `INSERT INTO items
            (category_id, name, description, price, image, is_available, is_popular, is_chef_recommended, is_new, sort_order, is_breakfast, is_lunch, is_snacks, is_dinner)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
          [
            item.category_id,
            item.name,
            item.description || "",
            item.price,
            item.image || "",
            Boolean(item.is_available),
            Boolean(item.is_popular),
            Boolean(item.is_chef_recommended),
            Boolean(item.is_new),
            item.sort_order,
            item.is_breakfast !== false,
            item.is_lunch !== false,
            item.is_snacks !== false,
            item.is_dinner !== false,
          ]
        );
      }
      await client.query("SELECT setval(pg_get_serial_sequence('categories', 'id'), COALESCE((SELECT MAX(id) FROM categories), 1))");
      await client.query("SELECT setval(pg_get_serial_sequence('items', 'id'), COALESCE((SELECT MAX(id) FROM items), 1))");
    });
  } else {
    const categoryCount = Number((await query("SELECT COUNT(*) AS count FROM categories")).rows[0].count);
    if (categoryCount === 0) {
      await transaction(async (client) => {
        for (const category of defaultCategories) {
          await client.query(
            `INSERT INTO categories (id, name, slug, icon, sort_order)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (id) DO NOTHING`,
            [category.id, category.name, category.slug, category.icon || "", category.sort_order]
          );
        }
        for (const item of defaultItems) {
          await client.query(
            `INSERT INTO items
              (category_id, name, description, price, image, is_available, is_popular, is_chef_recommended, is_new, sort_order, is_breakfast, is_lunch, is_snacks, is_dinner)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
            [
              item.category_id,
              item.name,
              item.description || "",
              item.price,
              item.image || "",
              Boolean(item.is_available),
              Boolean(item.is_popular),
              Boolean(item.is_chef_recommended),
              Boolean(item.is_new),
              item.sort_order,
              item.is_breakfast !== false,
              item.is_lunch !== false,
              item.is_snacks !== false,
              item.is_dinner !== false,
            ]
          );
        }
        await client.query("SELECT setval(pg_get_serial_sequence('categories', 'id'), COALESCE((SELECT MAX(id) FROM categories), 1))");
        await client.query("SELECT setval(pg_get_serial_sequence('items', 'id'), COALESCE((SELECT MAX(id) FROM items), 1))");
      });
    } else {
      // Auto-deduplicate any existing items in the database that share the exact dish name
      try {
        const { rows: allDbItems } = await query("SELECT * FROM items ORDER BY id ASC");
        const duplicatesByName = new Map();
        for (const item of allDbItems) {
          const key = item.name.trim().toLowerCase();
          if (!duplicatesByName.has(key)) {
            duplicatesByName.set(key, [item]);
          } else {
            duplicatesByName.get(key).push(item);
          }
        }
        for (const [key, group] of duplicatesByName.entries()) {
          if (group.length > 1) {
            const primary = group[0];
            const is_breakfast = group.some((i) => i.is_breakfast || i.category_id === 1);
            const is_lunch = group.some((i) => i.is_lunch || i.category_id === 2);
            const is_snacks = group.some((i) => i.is_snacks || i.category_id === 3);
            const is_dinner = group.some((i) => i.is_dinner || i.category_id === 4);
            const bestImage = group.find((i) => i.image)?.image || primary.image;
            const is_popular = group.some((i) => i.is_popular);
            const is_chef_recommended = group.some((i) => i.is_chef_recommended);
            const is_new = group.some((i) => i.is_new);

            await query(
              `UPDATE items SET is_breakfast = $1, is_lunch = $2, is_snacks = $3, is_dinner = $4, image = $5, is_popular = $6, is_chef_recommended = $7, is_new = $8 WHERE id = $9`,
              [is_breakfast, is_lunch, is_snacks, is_dinner, bestImage, is_popular, is_chef_recommended, is_new, primary.id]
            );

            const duplicateIds = group.slice(1).map((i) => i.id);
            await query(`DELETE FROM items WHERE id = ANY($1::int[])`, [duplicateIds]);
          }
        }
      } catch (dedupErr) {
        console.warn("Auto-deduplication check skipped:", dedupErr.message);
      }
    }
  }

  const settingsCount = Number((await query("SELECT COUNT(*) AS count FROM settings WHERE id = 1")).rows[0].count);
  if (settingsCount === 0) {
    const settings = defaultSettings || {};
    await query(
      `INSERT INTO settings
        (id, restaurant_name, tagline, logo, banner, address, phone, opening_hours, facebook,
         instagram, whatsapp, theme_primary, theme_dark, menu_url)
       VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (id) DO NOTHING`,
      [
        settings.restaurant_name || "Amutha Surabi Restaurant",
        settings.tagline || "Experience Authentic Taste",
        settings.logo || "",
        settings.banner || "",
        settings.address || "",
        settings.phone || "",
        settings.opening_hours || "",
        settings.facebook || "",
        settings.instagram || "",
        settings.whatsapp || "",
        settings.theme_primary || "#D4AF37",
        settings.theme_dark || "#0B0B0F",
        settings.menu_url || "http://localhost:5173",
      ]
    );
  }

  const username = process.env.ADMIN_USERNAME || "ams";
  const password = process.env.ADMIN_PASSWORD || "ams";
  const hash = bcrypt.hashSync(password, 10);
  await query(
    `INSERT INTO admins (username, password_hash)
     VALUES ($1, $2)
     ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [username, hash]
  );
}

let _initPromise = null;

export async function ensureDbInitialized() {
  if (!_initPromise) {
    _initPromise = seedDefaults().catch((err) => {
      _initPromise = null;
      throw err;
    });
  }
  return _initPromise;
}

export default { query, transaction, initDb, seedDefaults, ensureDbInitialized, getPool };
