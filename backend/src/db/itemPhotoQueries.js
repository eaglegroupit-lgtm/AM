// Per-item Wikimedia Commons search queries used to fetch a more specific
// real photo than the shared "kind" photo (e.g. Podi Uthappam gets an actual
// podi/gunpowder uttapam photo instead of the generic uthappam one).
// Items omitted here keep whichever kind-level photo they already have,
// either because they *are* the canonical version of that dish (e.g. plain
// "Idly", "Roast", "Uthappam") or because no distinct real photo exists for
// that specific preparation.
export const ITEM_QUERIES = {
  2: "idli dipped sambar bowl",
  4: "medu vada sambar bowl",
  5: "ven pongal sambar vada plate",
  7: "rava kichadi upma",

  10: "onion dosa",
  11: "masala dosa potato filling open",
  12: "ghee roast dosa",
  13: "onion rava dosa",
  15: "rava dosa cashew nuts",
  17: "onion uttapam",
  18: "tomato uttapam",
  19: "podi uttapam gunpowder",
  21: "mixed vegetable uttapam",
  22: "chapati stack indian bread",
  24: "kerala parotta layered flaky",
  25: "thick dosa kal dosa",
  26: "dosa banana leaf",

  27: "clear vegetable soup bowl",
  28: "tomato soup bowl cream swirl",
  29: "sweet corn soup bowl",
  30: "mushroom soup bowl cream",

  31: "vegetable cutlet plate",
  32: "french fries potato finger chips",
  33: "paneer pakora fritters",
  34: "gobi 65 fried cauliflower",
  35: "mushroom 65 fried",
  36: "tomato fry south indian",
  37: "masala papad topped",
  39: "appam idiyappam plate",

  41: "chilli gobi dry",
  42: "chilli paneer dry restaurant",
  43: "chilli mushroom dry",
  45: "chinese vegetable fried rice",
  46: "chinese biryani vegetable",

  48: "matar masala curry gravy",
  49: "gobi masala curry gravy",
  50: "aloo gobi curry",
  51: "mushroom masala curry gravy",
  52: "cheese masala curry gravy",
  53: "malai kofta curry",
  54: "mixed vegetable curry gravy",
  56: "shahi aloo curry butter",

  58: "butter naan basket",
  59: "chapati roti indian flatbread",
  60: "rumali roti thin bread",
  61: "chole poori",

  62: "vegetable fried rice plate",
  64: "peas pulao rice",
  65: "jeera rice cumin",
  66: "mushroom pulao rice",
  67: "kashmiri pulao fruit rice",
  69: "mushroom biryani",
  71: "vermicelli curd semiya",
  72: "lemon rice tamarind rice south indian",

  73: "cauliflower dry fry roast",
  74: "mushroom dry fry roast",
  75: "paneer dry masala roast",
  76: "green peas dry masala",

  77: "set dosa stack",
  78: "peas uttapam",
  81: "adai aviyal",
  83: "besan chilla vegetable omelette",

  84: "kothu parotta chilli",
  85: "chilli idli fried",
  88: "fried idli roast",
  89: "gobi fry dry",

  90: "bournvita glass milk",
  91: "ragi malt drink glass",
  92: "lemon tea cup",
  93: "dry ginger coffee sukku kappi",

  97: "ice cream scoop bowl",
  98: "ice cream sundae glass",
  99: "cassata ice cream slice tricolor",
  100: "malai kulfi stick",
  102: "cassata ice cream",
  104: "gourmet ice cream scoop bowl",
  105: "ice cream bowl melting",

  107: "chocolate ice cream bar stick",
  109: "chocolate nut ice cream bar",
  110: "mango ice cream bar stick",
  111: "raspberry ice cream bar stick",
  112: "orange ice cream bar popsicle",

  114: "cassata ice cream slice",
  115: "vanilla ice cream scoop bowl",
  116: "strawberry ice cream scoop bowl",
  117: "pistachio ice cream scoop",
  118: "mango ice cream scoop bowl",
  119: "chocolate ice cream scoop bowl",
  120: "butterscotch ice cream scoop",
  121: "blackcurrant ice cream scoop",
};

// After searches run, copy another item's resolved photo onto these ids
// (near-duplicate dish names where a second search would just waste a
// request and likely return the same picture anyway).
export const ITEM_REUSE = {
  14: 12, // Ghee Masal Roast <- Ghee Roast
  20: 16, // Ghee Uthappam <- Uthappam (kind photo already fine)
  55: 47, // Butter Paneer Masala <- Paneer Butter Masala (same dish, reordered name)
  108: 107, // Mini Chocobar <- Choc-O-Bar
};
