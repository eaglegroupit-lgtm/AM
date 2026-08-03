// Fetches a specific real photo per menu item (where a good query is defined
// in itemPhotoQueries.js) from Wikimedia Commons, saves it to
// backend/uploads/items/<id>.jpg, and points that item's `image` column at it.
// Items without a specific query, or where no decent photo could be found,
// keep their existing kind-level photo (see assignKindImages.js).
//
// Run with: node src/db/fetchItemPhotos.js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import db from "./db.js";
import { ITEM_QUERIES, ITEM_REUSE } from "./itemPhotoQueries.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const itemsDir = path.resolve(__dirname, "../../uploads/items");
if (!fs.existsSync(itemsDir)) fs.mkdirSync(itemsDir, { recursive: true });

const UA = "AmuthaSurabiMenuProject/1.0 (educational restaurant demo; contact: karthiclatha87@gmail.com)";
const JUNK_RE = /\.(pdf|djvu)$/i;
const JUNK_WORDS = /vocabulary|dictionary|federal register|grammar|gazette|magazine|journal|newspaper|book of|history of|encyclopedia|manual of|report of/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function searchCommons(query) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srnamespace=6&srsearch=${encodeURIComponent(
    query
  )}&format=json&srlimit=8`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  const json = await res.json();
  return (json.query?.search || []).map((r) => r.title);
}

async function getImageUrl(title) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(
    title
  )}&prop=imageinfo&iiprop=url&iiurlwidth=900&format=json`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  const json = await res.json();
  const page = Object.values(json.query?.pages || {})[0];
  const info = page?.imageinfo?.[0];
  return info ? info.thumburl || info.url : null;
}

async function downloadTo(url, filePath) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 5000) throw new Error("File too small, likely an error page");
  fs.writeFileSync(filePath, buf);
}

async function run() {
  const entries = Object.entries(ITEM_QUERIES);
  const results = { ok: [], failed: [] };

  for (const [idStr, query] of entries) {
    const id = Number(idStr);
    try {
      const titles = await searchCommons(query);
      const candidate = titles.find((t) => !JUNK_RE.test(t) && !JUNK_WORDS.test(t));
      if (!candidate) throw new Error("no suitable candidate");

      await sleep(1200);
      const imgUrl = await getImageUrl(candidate);
      if (!imgUrl) throw new Error("no image url");

      await sleep(1200);
      const filePath = path.join(itemsDir, `${id}.jpg`);
      await downloadTo(imgUrl, filePath);

      results.ok.push({ id, query, candidate });
      console.log(`[ok] #${id} "${query}" -> ${candidate}`);
    } catch (err) {
      results.failed.push({ id, query, error: err.message });
      console.log(`[fail] #${id} "${query}": ${err.message}`);
    }
    await sleep(1200);
  }

  // Apply near-duplicate reuse mapping
  for (const [idStr, sourceId] of Object.entries(ITEM_REUSE)) {
    const id = Number(idStr);
    const srcPath = path.join(itemsDir, `${sourceId}.jpg`);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, path.join(itemsDir, `${id}.jpg`));
      console.log(`[reuse] #${id} <- #${sourceId}`);
    }
  }

  // Point each item's image column at its per-item photo if we have one,
  // otherwise leave the existing kind-level photo untouched.
  const update = db.prepare("UPDATE items SET image = ? WHERE id = ?");
  const allIds = db.prepare("SELECT id FROM items").all().map((r) => r.id);
  let updated = 0;
  const applyAll = db.transaction(() => {
    allIds.forEach((id) => {
      const filePath = path.join(itemsDir, `${id}.jpg`);
      if (fs.existsSync(filePath)) {
        update.run(`/uploads/items/${id}.jpg`, id);
        updated++;
      }
    });
  });
  applyAll();

  console.log(`\nDone. ${results.ok.length} fetched, ${results.failed.length} kept fallback, ${updated} items updated in DB.`);
  if (results.failed.length) {
    console.log("Failed queries (kept kind-level photo):", results.failed.map((f) => `#${f.id} ${f.query}`).join(", "));
  }
}

run();
