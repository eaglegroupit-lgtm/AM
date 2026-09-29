import { itemTranslations, categoryTranslations } from "./translations.js";

// Comprehensive South Indian food synonyms & transliteration mapping
const FOOD_SYNONYMS = {
  // Dosa variations
  dosa: ["roast", "dosai", "uthappam", "தோசை", "ரோஸ்ட்", "உத்தப்பம்"],
  dosai: ["roast", "dosa", "தோசை", "ரோஸ்ட்"],
  roast: ["dosa", "dosai", "தோசை", "ரோஸ்ட்"],
  thosai: ["dosa", "dosai", "தோசை", "ரோஸ்ட்"],
  தோசை: ["roast", "dosa", "dosai", "ரோஸ்ட்"],
  ரோஸ்ட்: ["roast", "dosa", "dosai", "தோசை"],
  உத்தப்பம்: ["uthappam", "oothappam", "dosa"],
  uthappam: ["oothappam", "dosa", "உத்தப்பம்"],

  // Idly variations
  idli: ["idly", "இட்லி"],
  idly: ["idli", "இட்லி"],
  இட்லி: ["idly", "idli"],

  // Vada variations
  vada: ["vadai", "medu vada", "sambar vada", "வடை"],
  vadai: ["vada", "வடை"],
  வடை: ["vadai", "vada"],

  // Poori variations
  puri: ["poori", "பூரி"],
  poori: ["puri", "பூரி"],
  பூரி: ["poori", "puri"],

  // Pongal / Kichadi
  pongal: ["வெண் பொங்கல்", "பொங்கல்"],
  பொங்கல்: ["pongal"],
  kichadi: ["கிச்சடி", "khichdi"],
  கிச்சடி: ["kichadi"],

  // Parotta variations
  parotta: ["paratha", "porotta", "barotta", "பரோட்டா"],
  paratha: ["parotta", "பரோட்டா"],
  porotta: ["parotta", "பரோட்டா"],
  பரோட்டா: ["parotta", "paratha"],

  // Chappathi / Roti
  chapati: ["chappathi", "chapathi", "roti", "சப்பாத்தி", "ரொட்டி"],
  chappathi: ["chapati", "chapathi", "roti", "சப்பாத்தி"],
  chapathi: ["chappathi", "chapati", "roti", "சப்பாத்தி"],
  roti: ["chappathi", "chapati", "சப்பாத்தி", "ரொட்டி"],
  naan: ["நான்", "roti", "bread"],
  சப்பாத்தி: ["chappathi", "chapati", "roti"],
  ரொட்டி: ["roti", "chappathi"],

  // Rice / Meals
  rice: ["சாதம்", "meals", "briyani", "biryani", "pulao", "curd rice"],
  meals: ["சாப்பாடு", "lunch", "rice"],
  சாப்பாடு: ["meals", "lunch", "rice"],
  சாதம்: ["rice"],
  curd: ["thayir", "தயிர்", "yogurt"],
  thayir: ["curd", "தயிர்"],
  தயிர்: ["curd", "thayir"],

  // Biryani variations
  biryani: ["briyani", "biriyani", "பிரியாணி"],
  briyani: ["biryani", "biriyani", "பிரியாணி"],
  biriyani: ["biryani", "briyani", "பிரியாணி"],
  பிரியாணி: ["biryani", "briyani"],

  // Beverages
  coffee: ["kaapi", "காபி", "filter coffee", "hot drink"],
  kaapi: ["coffee", "காபி"],
  காபி: ["coffee", "kaapi"],
  tea: ["chai", "டீ", "தேநீர்", "lemon tea"],
  chai: ["tea", "டீ"],
  டீ: ["tea", "chai"],

  // Starters & Sides
  paneer: ["பன்னீர்", "பனீர்"],
  பன்னீர்: ["paneer"],
  பனீர்: ["paneer"],
  mushroom: ["காளான்"],
  காளான்: ["mushroom"],
  gobi: ["cauliflower", "காலிஃபிளவர்", "கோபி"],
  cauliflower: ["gobi", "காலிஃபிளவர்", "கோபி"],
  கோபி: ["gobi", "cauliflower"],
  காலிஃபிளவர்: ["cauliflower", "gobi"],

  noodles: ["நூடுல்ஸ்", "maggi", "chowmein"],
  நூடுல்ஸ்: ["noodles"],
  soup: ["சூப்"],
  சூப்: ["soup"],
  sambar: ["சாம்பார்"],
  சாம்பார்: ["sambar"],
  sevai: ["சேவை", "semiya", "vermicelli", "idiyappam"],
  சேவை: ["sevai"],
  appam: ["அப்பம்", "ஆப்பம்", "idiyappam"],
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
 * Searches items intelligently across names, descriptions, categories, translations, and synonyms.
 *
 * @param {Array} items - All menu items
 * @param {string} rawQuery - The search query entered by the user
 * @param {string} language - Current selected language ('en' or 'ta')
 * @param {Array} categories - Category list for mapping
 * @returns {Array} - Filtered and relevance-scored items
 */
export function searchMenuItems(items, rawQuery, language = "en", categories = []) {
  const query = normalize(rawQuery);
  if (!query) return items;

  // Build category ID to name lookup
  const categoryMap = {};
  if (Array.isArray(categories)) {
    categories.forEach((c) => {
      categoryMap[c.id] = c.name;
    });
  }

  // Split query into individual words/tokens
  const tokens = query.split(" ").filter(Boolean);

  // Expand tokens with known food synonyms
  const tokenExpanded = tokens.map((token) => {
    const list = [token];
    if (FOOD_SYNONYMS[token]) {
      list.push(...FOOD_SYNONYMS[token]);
    }
    // Also check if any key in FOOD_SYNONYMS starts with or contains the token
    Object.entries(FOOD_SYNONYMS).forEach(([k, syns]) => {
      if (k.startsWith(token) && !list.includes(k)) {
        list.push(k, ...syns);
      }
    });
    return Array.from(new Set(list.map(normalize)));
  });

  const scoredResults = [];

  for (const item of items) {
    // Only search available items
    if (item.is_available === false) continue;

    const engName = normalize(item.name);
    const taTranslation = itemTranslations[item.name];
    const taName = normalize(taTranslation?.name || "");
    const engDesc = normalize(item.description || "");
    const taDesc = normalize(taTranslation?.description || "");

    const catNameEng = normalize(categoryMap[item.category_id] || "");
    const catNameTa = normalize(categoryTranslations[catNameEng] || "");

    // Combined corpus for multi-token matching
    const fullCorpus = `${engName} ${taName} ${engDesc} ${taDesc} ${catNameEng} ${catNameTa}`;

    // Every token in the query must match at least one synonym in the corpus
    const matchesAllTokens = tokenExpanded.every((synonymGroup) =>
      synonymGroup.some((syn) => fullCorpus.includes(syn))
    );

    if (!matchesAllTokens) continue;

    // Calculate relevance score
    let score = 0;

    // 1. Exact name match gets highest priority
    if (engName === query || taName === query) {
      score += 150;
    } else if (engName.startsWith(query) || taName.startsWith(query)) {
      score += 100;
    } else if (engName.includes(query) || taName.includes(query)) {
      score += 70;
    }

    // 2. Token matches directly in the item name
    tokens.forEach((t) => {
      if (engName.includes(t)) score += 25;
      if (taName.includes(t)) score += 25;
    });

    // 3. Current preferred language match bonus
    if (language === "ta" && taName.includes(query)) {
      score += 15;
    } else if (language === "en" && engName.includes(query)) {
      score += 15;
    }

    // 4. Description match
    if (engDesc.includes(query) || taDesc.includes(query)) {
      score += 20;
    }

    // 5. Category match
    if (catNameEng.includes(query) || catNameTa.includes(query)) {
      score += 15;
    }

    // 6. Popular item slight tie-breaker
    if (item.is_popular) score += 5;

    scoredResults.push({ item, score });
  }

  // Sort by score descending
  scoredResults.sort((a, b) => b.score - a.score);

  return scoredResults.map((r) => r.item);
}
