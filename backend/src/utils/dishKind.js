// Classifies a menu item into one of the 23 recognized dish "kinds" so it can
// be paired with a representative real photo (backend/uploads/kinds/<kind>.jpg).
// Classification is category-first (reliable, admin-controlled) and refined
// with a few name keywords for categories that contain visually different
// dishes (e.g. Breakfast has idly, vada, pongal, poori all in one category).
export function getDishKind(name, categoryName) {
  const n = (name || "").toLowerCase();
  const cat = (categoryName || "").toLowerCase();
  const has = (re) => re.test(n);

  if (cat.includes("soup")) return "soup";
  if (cat.includes("north indian curry")) return "curry";
  if (cat.includes("roast specials")) return "roastDry";
  if (cat.includes("bread")) return has(/poori/) ? "poori" : "bread";

  if (cat.includes("breakfast")) {
    if (has(/idl[iy]/)) return "idly";
    if (has(/vad[ae]i/)) return "vada";
    if (has(/pongal|kichadi/)) return "pongalKichadi";
    if (has(/poori/)) return "poori";
    if (has(/sevai/)) return "sevai";
    return "idly";
  }

  if (cat.includes("tiffin")) {
    if (has(/uthappam/)) return "uthappam";
    if (has(/chappathi|parotta/)) return "bread";
    return "dosa";
  }

  if (cat.includes("veg starters")) {
    if (has(/paniyaram|idiyappam|appam/)) return "paniyaram";
    return "starter";
  }

  if (cat.includes("chinese")) {
    if (has(/noodles/)) return "noodles";
    if (has(/briyani|biryani/)) return "biryani";
    return "manchurian";
  }

  if (cat.includes("biryani") || cat.includes("rice")) {
    if (has(/curd rice/)) return "curdRice";
    if (has(/semia/)) return "sevai";
    if (has(/briyani|biryani/)) return "biryani";
    return "rice";
  }

  if (cat.includes("weekly specials")) {
    if (has(/uthappam|adai|omelette/)) return "uthappam";
    return "dosa";
  }

  if (cat.includes("house specials")) {
    if (has(/chilly/)) return "manchurian";
    if (has(/parotta/)) return "bread";
    return "starter";
  }

  if (cat.includes("health beverages")) {
    if (has(/badam|kalkandu/)) return "coldDrink";
    return "hotDrink";
  }

  if (cat.includes("ice cream novelties")) {
    if (has(/kulfi/)) return "iceCreamStick";
    if (has(/cone/)) return "iceCreamCone";
    return "iceCreamScoop";
  }
  if (cat.includes("ice cream sticks")) return "iceCreamStick";
  if (cat.includes("ice cream flavour")) return "iceCreamScoop";

  return "dosa";
}
