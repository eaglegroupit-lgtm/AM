// Assigns each menu item a real representative photo based on its dish kind.
// Run with: node src/db/assignKindImages.js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import db from "./db.js";
import { getDishKind } from "../utils/dishKind.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const kindsDir = path.resolve(__dirname, "../../uploads/kinds");

export function assignAllKindImages() {
  const items = db
    .prepare(
      `SELECT i.id, i.name, c.name AS category_name
       FROM items i JOIN categories c ON c.id = i.category_id`
    )
    .all();

  const update = db.prepare("UPDATE items SET image = ? WHERE id = ?");
  let count = 0;

  const assignAll = db.transaction(() => {
    items.forEach((item) => {
      const kind = getDishKind(item.name, item.category_name);
      const file = path.join(kindsDir, `${kind}.jpg`);
      if (!fs.existsSync(file)) {
        console.warn(`Missing photo for kind "${kind}" (item: ${item.name})`);
        return;
      }
      update.run(`/uploads/kinds/${kind}.jpg`, item.id);
      count++;
    });
  });

  assignAll();
  return count;
}

if (process.argv[1] && process.argv[1].endsWith("assignKindImages.js")) {
  const n = assignAllKindImages();
  console.log(`Assigned real photos to ${n} menu items.`);
}
