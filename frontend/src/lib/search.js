import { itemTranslations } from "./translations.js";

// Spelling / transliteration variants only (same dish, different spelling or script).
// Keep these strict: never map one dish to a different dish, or results get noisy.
const FOOD_SYNONYMS = {
  dosa: ["dosai", "thosai", "தோசை"],
  dosai: ["dosa", "thosai", "தோசை"],
  thosai: ["dosa", "dosai", "தோசை"],
  தோசை: ["dosa", "dosai"],
  roast: ["ரோஸ்ட்"],
  ரோஸ்ட்: ["roast"],
  uthappam: ["oothappam", "உத்தப்பம்"],
  oothappam: ["uthappam", "உத்தப்பம்"],
  உத்தப்பம்: ["uthappam", "oothappam"],

  idli: ["idly", "இட்லி"],
  idly: ["idli", "இட்லி"],
  இட்லி: ["idly", "idli"],

  vada: ["vadai", "வடை"],
  vadai: ["vada", "வடை"],
  வடை: ["vadai", "vada"],

  puri: ["poori", "பூரி"],
  poori: ["puri", "பூரி"],
  பூரி: ["poori", "puri"],

  pongal: ["பொங்கல்"],
  பொங்கல்: ["pongal"],
  kichadi: ["khichdi", "கிச்சடி"],
  khichdi: ["kichadi", "கிச்சடி"],
  கிச்சடி: ["kichadi", "khichdi"],

  parotta: ["porotta", "barotta", "பரோட்டா"],
  porotta: ["parotta", "barotta", "பரோட்டா"],
  barotta: ["parotta", "porotta", "பரோட்டா"],
  பரோட்டா: ["parotta", "porotta"],

  chapati: ["chappathi", "chapathi", "சப்பாத்தி"],
  chappathi: ["chapati", "chapathi", "சப்பாத்தி"],
  chapathi: ["chappathi", "chapati", "சப்பாத்தி"],
  சப்பாத்தி: ["chappathi", "chapati", "chapathi"],
  roti: ["ரொட்டி"],
  ரொட்டி: ["roti"],
  naan: ["நான்"],

  curd: ["thayir", "தயிர்"],
  thayir: ["curd", "தயிர்"],
  தயிர்: ["curd", "thayir"],

  biryani: ["briyani", "biriyani", "பிரியாணி"],
  briyani: ["biryani", "biriyani", "பிரியாணி"],
  biriyani: ["biryani", "briyani", "பிரியாணி"],
  பிரியாணி: ["biryani", "briyani", "biriyani"],

  coffee: ["kaapi", "காபி"],
  kaapi: ["coffee", "காபி"],
  காபி: ["coffee", "kaapi"],
  tea: ["டீ"],
  டீ: ["tea"],

  paneer: ["பன்னீர்", "பனீர்"],
  பன்னீர்: ["paneer", "பனீர்"],
  பனீர்: ["paneer", "பன்னீர்"],
  mushroom: ["காளான்"],
  காளான்: ["mushroom"],
  gobi: ["கோபி"],
  கோபி: ["gobi"],
  noodles: ["நூடுல்ஸ்"],
  நூடுல்ஸ்: ["noodles"],
  soup: ["சூப்"],
  சூப்: ["soup"],
  sambar: ["சாம்பார்"],
  சாம்பார்: ["sambar"],
  sevai: ["சேவை"],
  சேவை: ["sevai"],
  appam: ["அப்பம்", "ஆப்பம்"],
  அப்பம்: ["appam"],
  paniyaram: ["பணியாரம்"],
  பணியாரம்: ["paniyaram"],
};

/**
 * Normalizes text for lenient searching (lowercased, stripped punctuation, normalized whitespace).
 */
function normalize(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Searches items strictly by dish name (English or Tamil). Descriptions and
 * categories are ignored so results only contain dishes whose name matches.
 *
 * @param {Array} items - All menu items
 * @param {string} rawQuery - The search query entered by the user
 * @param {string} language - Current selected language ('en' or 'ta')
 * @returns {Array} - Filtered and relevance-sorted items
 */
export function searchMenuItems(items, rawQuery, language = "en") {
  const query = normalize(rawQuery);
  if (!query) return items;

  const tokens = query.split(" ").filter(Boolean);

  // Each token may match itself or one of its spelling variants
  const tokenVariants = tokens.map((token) =>
    Array.from(new Set([token, ...(FOOD_SYNONYMS[token] || [])].map(normalize)))
  );

  const scoredResults = [];

  for (const item of items) {
    if (item.is_available === false) continue;

    const engName = normalize(item.name);
    const taName = normalize(itemTranslations[item.name]?.name || "");
    const names = `${engName} ${taName}`;

    // Every token must appear in the dish name
    const matchesAllTokens = tokenVariants.every((variants) =>
      variants.some((v) => names.includes(v))
    );
    if (!matchesAllTokens) continue;

    let score = 0;
    if (engName === query || taName === query) score += 150;
    else if (engName.startsWith(query) || taName.startsWith(query)) score += 100;
    else if (engName.includes(query) || taName.includes(query)) score += 70;

    if (language === "ta" ? taName.includes(query) : engName.includes(query)) score += 15;
    if (item.is_popular) score += 5;

    scoredResults.push({ item, score });
  }

  scoredResults.sort((a, b) => b.score - a.score);
  return scoredResults.map((r) => r.item);
}
