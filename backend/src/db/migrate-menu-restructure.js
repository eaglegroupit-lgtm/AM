// One-off migration: replaces the 15 dish-type categories with 4 meal-time
// categories (Breakfast, Lunch, Evening Snacks, Dinner) and reloads items
// from the updated defaultData.js. Run manually against the live database:
//   DATABASE_URL=... node src/db/migrate-menu-restructure.js
//
// This wipes and reseeds `categories` and `items` from defaultData.js, so
// any admin edits made through the dashboard (availability toggles, price
// changes, custom uploaded photos) will be lost and replaced by the new
// default structure. `settings` and `admins` are left untouched.
import "dotenv/config";
import { query, transaction, initDb } from "./db.js";
import { defaultCategories, defaultItems } from "./defaultData.js";

async function main() {
  await initDb();

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

  const catCount = Number((await query("SELECT COUNT(*) AS count FROM categories")).rows[0].count);
  const itemCount = Number((await query("SELECT COUNT(*) AS count FROM items")).rows[0].count);
  console.log(`Migration complete: ${catCount} categories, ${itemCount} items.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
