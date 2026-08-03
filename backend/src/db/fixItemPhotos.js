// Manual corrections after visually auditing every photo fetchItemPhotos.js
// downloaded. Some automated picks were wrong dishes or, critically, non-veg
// photos (fried/tandoori chicken) that must never appear on this pure-veg
// menu. This script removes those, applies a couple of "reuse a sibling's
// good photo" fixes, then re-points every item's `image` column at either
// its per-item photo (if one survives) or its kind-level fallback photo.
//
// Run with: node src/db/fixItemPhotos.js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import db from "./db.js";
import { getDishKind } from "../utils/dishKind.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const itemsDir = path.resolve(__dirname, "../../uploads/items");
const kindsDir = path.resolve(__dirname, "../../uploads/kinds");

// Confirmed wrong/unsuitable — remove so they fall back to the kind photo.
// #36 and #75 were literally fried/tandoori CHICKEN photos — must go.
const REMOVE = [17, 35, 36, 45, 46, 62, 75];

// Reuse a sibling item's (already verified good) photo instead of the
// generic kind fallback — these are near-duplicate dishes.
const REUSE = {
  109: 107, // Nutty Chocobar <- Choc-O-Bar (109's own photo was a messy bitten shot)
  114: 102, // Cassatta <- Premium Cassata (114's own photo was a wrong video screenshot)
};

for (const id of REMOVE) {
  const p = path.join(itemsDir, `${id}.jpg`);
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
    console.log(`Removed uploads/items/${id}.jpg (reverting to kind photo)`);
  }
}

for (const [idStr, sourceId] of Object.entries(REUSE)) {
  const id = Number(idStr);
  const src = path.join(itemsDir, `${sourceId}.jpg`);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(itemsDir, `${id}.jpg`));
    console.log(`Reused #${sourceId}'s photo for #${id}`);
  }
}

const items = db
  .prepare(
    `SELECT i.id, i.name, c.name AS category_name
     FROM items i JOIN categories c ON c.id = i.category_id`
  )
  .all();

const update = db.prepare("UPDATE items SET image = ? WHERE id = ?");
let perItem = 0;
let kindLevel = 0;

const applyAll = db.transaction(() => {
  items.forEach((item) => {
    const perItemPath = path.join(itemsDir, `${item.id}.jpg`);
    if (fs.existsSync(perItemPath)) {
      update.run(`/uploads/items/${item.id}.jpg`, item.id);
      perItem++;
      return;
    }
    const kind = getDishKind(item.name, item.category_name);
    const kindPath = path.join(kindsDir, `${kind}.jpg`);
    if (fs.existsSync(kindPath)) {
      update.run(`/uploads/kinds/${kind}.jpg`, item.id);
      kindLevel++;
    }
  });
});
applyAll();

console.log(`\nDone. ${perItem} items use a specific photo, ${kindLevel} use their category's kind photo.`);
