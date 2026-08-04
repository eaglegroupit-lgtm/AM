import "dotenv/config";
import pg from "pg";
import bcrypt from "bcryptjs";
import { defaultCategories, defaultItems, defaultSettings } from "./defaultData.js";

const { Pool } = pg;

const rawConnectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING;

if (!rawConnectionString) {
  throw new Error("Missing DATABASE_URL or POSTGRES_URL for Postgres connection");
}

// Newer pg-connection-string versions treat a `sslmode=require` query param
// on the URL as an instruction to do full certificate-chain verification
// (equivalent to `verify-full`), which overrides any `ssl` option passed to
// `new Pool()` and fails against Supabase's pooler certificate with
// "self-signed certificate in certificate chain". Strip sslmode from the
// URL and control TLS purely via the explicit `ssl` option below instead.
const connectionString = rawConnectionString.replace(/([?&])sslmode=[^&]*&?/i, "$1").replace(/[?&]$/, "");

export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

export async function query(text, params = []) {
  const result = await pool.query(text, params);
  return result;
}

export async function transaction(callback) {
  const client = await pool.connect();
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
  `);
}

export async function seedDefaults() {
  await initDb();

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
            (category_id, name, description, price, image, is_available, is_popular, is_chef_recommended, is_new, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
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
          ]
        );
      }
      await client.query("SELECT setval(pg_get_serial_sequence('categories', 'id'), COALESCE((SELECT MAX(id) FROM categories), 1))");
      await client.query("SELECT setval(pg_get_serial_sequence('items', 'id'), COALESCE((SELECT MAX(id) FROM items), 1))");
    });
  }

  const settingsCount = Number((await query("SELECT COUNT(*) AS count FROM settings WHERE id = 1")).rows[0].count);
  if (settingsCount === 0) {
    const settings = defaultSettings || {};
    await query(
      `INSERT INTO settings
        (id, restaurant_name, tagline, logo, banner, address, phone, opening_hours, facebook,
         instagram, whatsapp, theme_primary, theme_dark, menu_url)
       VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
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

  const adminCount = Number((await query("SELECT COUNT(*) AS count FROM admins")).rows[0].count);
  if (adminCount === 0) {
    const username = process.env.ADMIN_USERNAME || "admin";
    const password = process.env.ADMIN_PASSWORD || "Amutha@123";
    const hash = bcrypt.hashSync(password, 10);
    await query("INSERT INTO admins (username, password_hash) VALUES ($1, $2)", [username, hash]);
  }

  // Update item images based on dish kind classification for live database items
  await query(`
    UPDATE items i
    SET image = '/images/kinds/' || 
      CASE 
        WHEN c.name ILIKE '%soup%' THEN 'soup'
        WHEN c.name ILIKE '%north indian curry%' THEN 'curry'
        WHEN c.name ILIKE '%roast specials%' THEN 'roastDry'
        WHEN c.name ILIKE '%bread%' AND i.name ILIKE '%poori%' THEN 'poori'
        WHEN c.name ILIKE '%bread%' THEN 'bread'
        WHEN c.name ILIKE '%breakfast%' AND i.name ~* 'idl[iy]' THEN 'idly'
        WHEN c.name ILIKE '%breakfast%' AND i.name ~* 'vad[ae]i' THEN 'vada'
        WHEN c.name ILIKE '%breakfast%' AND i.name ~* 'pongal|kichadi' THEN 'pongalKichadi'
        WHEN c.name ILIKE '%breakfast%' AND i.name ~* 'poori' THEN 'poori'
        WHEN c.name ILIKE '%breakfast%' AND i.name ~* 'sevai' THEN 'sevai'
        WHEN c.name ILIKE '%breakfast%' THEN 'idly'
        WHEN c.name ILIKE '%tiffin%' AND i.name ~* 'uthappam' THEN 'uthappam'
        WHEN c.name ILIKE '%tiffin%' AND i.name ~* 'chappathi|parotta' THEN 'bread'
        WHEN c.name ILIKE '%tiffin%' THEN 'dosa'
        WHEN c.name ILIKE '%veg starters%' AND i.name ~* 'paniyaram|idiyappam|appam' THEN 'paniyaram'
        WHEN c.name ILIKE '%veg starters%' THEN 'starter'
        WHEN c.name ILIKE '%chinese%' AND i.name ~* 'noodles' THEN 'noodles'
        WHEN c.name ILIKE '%chinese%' AND i.name ~* 'briyani|biryani' THEN 'biryani'
        WHEN c.name ILIKE '%chinese%' THEN 'manchurian'
        WHEN (c.name ILIKE '%biryani%' OR c.name ILIKE '%rice%') AND i.name ~* 'curd rice' THEN 'curdRice'
        WHEN (c.name ILIKE '%biryani%' OR c.name ILIKE '%rice%') AND i.name ~* 'semia' THEN 'sevai'
        WHEN (c.name ILIKE '%biryani%' OR c.name ILIKE '%rice%') AND i.name ~* 'briyani|biryani' THEN 'biryani'
        WHEN (c.name ILIKE '%biryani%' OR c.name ILIKE '%rice%') THEN 'rice'
        WHEN c.name ILIKE '%weekly specials%' AND i.name ~* 'uthappam|adai|omelette' THEN 'uthappam'
        WHEN c.name ILIKE '%weekly specials%' THEN 'dosa'
        WHEN c.name ILIKE '%house specials%' AND i.name ~* 'chilly' THEN 'manchurian'
        WHEN c.name ILIKE '%house specials%' AND i.name ~* 'parotta' THEN 'bread'
        WHEN c.name ILIKE '%house specials%' THEN 'starter'
        WHEN c.name ILIKE '%health beverages%' AND i.name ~* 'badam|kalkandu' THEN 'coldDrink'
        WHEN c.name ILIKE '%health beverages%' THEN 'hotDrink'
        WHEN c.name ILIKE '%ice cream novelties%' AND i.name ~* 'kulfi' THEN 'iceCreamStick'
        WHEN c.name ILIKE '%ice cream novelties%' AND i.name ~* 'cone' THEN 'iceCreamCone'
        WHEN c.name ILIKE '%ice cream novelties%' THEN 'iceCreamScoop'
        WHEN c.name ILIKE '%ice cream sticks%' THEN 'iceCreamStick'
        WHEN c.name ILIKE '%ice cream flavour%' THEN 'iceCreamScoop'
        ELSE 'dosa'
      END || '.jpg'
    FROM categories c
    WHERE i.category_id = c.id AND (i.image IS NULL OR i.image = '' OR i.image LIKE '/images/items/%');
  `);
}

export default { query, transaction, initDb, seedDefaults, pool };
