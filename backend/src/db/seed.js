// Seeds the database with the real menu of Sri / Amutha Surabi Restaurant,
// transcribed from the restaurant's printed menu cards and organized into categories.
// Prices were not printed on the source menu cards (only item names) — sensible
// placeholder prices (INR) have been set and should be corrected from the Admin Dashboard.
import "dotenv/config";
import bcrypt from "bcryptjs";
import { initDb, query, transaction } from "./db.js";

const slugify = (s) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const categories = [
  { name: "Breakfast", icon: "sunrise" },
  { name: "Tiffin & Dosa Varieties", icon: "dosa" },
  { name: "Soups", icon: "soup" },
  { name: "Veg Starters", icon: "starter" },
  { name: "Chinese", icon: "chinese" },
  { name: "North Indian Curry", icon: "curry" },
  { name: "Breads", icon: "bread" },
  { name: "Biryani & Rice", icon: "biryani" },
  { name: "Roast Specials", icon: "roast" },
  { name: "Weekly Specials", icon: "calendar" },
  { name: "House Specials", icon: "star" },
  { name: "Health Beverages", icon: "cup" },
  { name: "Ice Cream Novelties", icon: "icecream" },
  { name: "Ice Cream Sticks", icon: "stick" },
  { name: "Ice Cream Flavours", icon: "scoop" },
];

// [name, description, price, flags]
const itemsByCategory = {
  "Breakfast": [
    ["Idly", "Steamed rice cakes, soft and fluffy, served with sambar & chutney", 40, { popular: true }],
    ["Sambar Idly", "Idly soaked in piping hot sambar", 50],
    ["Vadai", "Crispy golden lentil doughnuts", 40],
    ["Sambar Vadai", "Crispy vadai dunked in sambar", 50],
    ["Pongal", "Comforting rice & moong dal porridge tempered with pepper and cumin", 60, { popular: true }],
    ["Poori Masal", "Puffed fried bread served with spiced potato masal", 70],
    ["Kichadi", "Semolina & vegetable kichadi", 50],
    ["Sevai", "Steamed rice noodles, lightly tempered", 50],
  ],
  "Tiffin & Dosa Varieties": [
    ["Roast", "Classic crisp roasted dosa", 60],
    ["Onion Roast", "Roasted dosa topped with fresh onions", 70, { popular: true }],
    ["Masal Roast", "Roast dosa filled with spiced potato masala", 80, { popular: true }],
    ["Ghee Roast", "Roast dosa finished with pure ghee", 80],
    ["Onion Rava Roast", "Crispy semolina roast loaded with onions", 90],
    ["Ghee Masal Roast", "Ghee roast filled with potato masala", 100],
    ["Cashewnut Rava Roast", "Semolina roast topped with roasted cashews", 110, { chefRecommended: true }],
    ["Uthappam", "Thick savoury rice pancake", 70],
    ["Onion Uthappam", "Uthappam topped with onions", 80],
    ["Tomato Uthappam", "Uthappam topped with tomatoes", 80],
    ["Podi Uthappam", "Uthappam with spiced gunpowder podi", 80],
    ["Ghee Uthappam", "Uthappam finished with ghee", 90],
    ["Veg. Uthappam", "Mixed vegetable topped uthappam", 90],
    ["Chappathi", "Soft whole-wheat flatbread (2 pcs) with kurma", 60],
    ["Onion Chappathi", "Chappathi stuffed with onions", 70],
    ["Parotta", "Layered, flaky Kerala-style parotta (2 pcs)", 60],
    ["Kal Dosai", "Thick, soft, slightly fermented dosa", 70],
    ["Elan Dosai", "Traditional soft, fragrant tender coconut infused dosa", 70],
  ],
  "Soups": [
    ["Veg. Clear Soup", "Light and clear mixed vegetable soup", 70],
    ["Tomato Soup", "Classic creamy tomato soup", 70, { popular: true }],
    ["Sweet Corn Soup", "Sweet corn kernels in a mild veg broth", 80],
    ["Mushroom Soup", "Earthy mushroom soup, velvety texture", 90],
  ],
  "Veg Starters": [
    ["Veg. Cutlet", "Crumb-fried mixed vegetable cutlets", 100],
    ["Finger Chips", "Crispy golden potato fingers", 90, { popular: true }],
    ["Paneer Pakoda", "Deep fried gram-flour battered paneer fritters", 130],
    ["Gobi 65", "Spicy, tangy deep fried cauliflower florets", 110, { popular: true }],
    ["Mushroom 65", "Crispy spiced deep fried mushrooms", 130],
    ["Tomato Fry", "Pan tossed spiced tomato fry", 90],
    ["Masala Papad", "Crisp papad topped with onion-tomato masala", 60],
    ["Kuzhi Paniyaram", "Steamed-fried savoury rice & lentil dumplings", 90],
    ["Idiyappam & Appam", "String hoppers and appam served together", 90],
  ],
  "Chinese": [
    ["Gobi Manchurian", "Cauliflower florets tossed in tangy manchurian sauce", 120, { popular: true }],
    ["Chilly Gobi", "Cauliflower tossed with chilli, capsicum & onion", 120],
    ["Chilly Paneer", "Paneer cubes tossed in spicy Indo-Chinese sauce", 150, { chefRecommended: true }],
    ["Chilly Mushroom", "Mushrooms tossed in spicy chilli-garlic sauce", 140],
    ["Soft Noodles", "Wok tossed veg noodles", 120],
    ["Veg. Spl. Briyani (Chinese style)", "Indo-Chinese style spiced veg biryani", 150],
    ["Chinees Briyani", "Fragrant rice tossed with Chinese-style vegetables", 150],
  ],
  "North Indian Curry": [
    ["Paneer Butter Masala", "Paneer cubes in a rich buttery tomato gravy", 170, { popular: true, chefRecommended: true }],
    ["Green Peas Masala", "Green peas simmered in a spiced onion-tomato gravy", 130],
    ["Gobi Masala", "Cauliflower cooked in a mildly spiced curry", 130],
    ["Aloo Gobi Masala", "Potato & cauliflower cooked with aromatic spices", 130],
    ["Mushroom Masala", "Mushrooms in a spiced curry gravy", 140],
    ["Cheese Masala", "Cottage cheese cubes in a creamy masala gravy", 160],
    ["Malai Kofta", "Fried vegetable & paneer dumplings in a creamy gravy", 170, { chefRecommended: true }],
    ["Mix. Veg Curry", "Seasonal vegetables cooked in a mild curry", 130],
    ["Butter Paneer Masala", "Paneer in a velvety butter-tomato gravy", 180],
    ["Aloo Butter Masala", "Potatoes cooked in a rich buttery gravy", 140],
  ],
  "Breads": [
    ["Naan", "Soft, pillowy tandoor-baked leavened bread", 50],
    ["Butter Naan", "Naan brushed with butter", 60, { popular: true }],
    ["Roti", "Whole wheat tandoor bread", 40],
    ["Romali Roti", "Ultra-thin soft handkerchief bread", 50],
    ["Chola Poori", "Fluffy fried poori served with chickpea masala", 90],
  ],
  "Biryani & Rice": [
    ["Veg. Fried Rice", "Wok tossed rice with fresh vegetables", 110],
    ["Veg. Pulao", "Fragrant basmati rice cooked with mixed vegetables", 120],
    ["Peas Pulao", "Basmati rice cooked with green peas", 120],
    ["Jeera Pulao", "Basmati rice tempered with cumin", 110],
    ["Mushroom Pulao", "Basmati rice cooked with mushrooms", 140],
    ["Kashmir Pulao", "Mildly sweet pulao with fruits & nuts", 150],
    ["Veg. Briyani", "Classic spiced vegetable dum biryani", 150, { popular: true, chefRecommended: true }],
    ["Mushroom Briyani", "Aromatic dum biryani with mushrooms", 160],
    ["Curd Rice", "Comforting curd rice tempered with mustard & curry leaves", 80],
    ["Curd Semia", "Vermicelli tossed in seasoned curd", 80],
    ["Variety Rices", "Assorted South Indian tamarind / lemon / coconut rice", 90],
  ],
  "Roast Specials": [
    ["Cauliflower Roast", "Whole roasted cauliflower in spiced masala", 140],
    ["Mushroom Roast", "Pan roasted mushrooms in dry masala", 150],
    ["Paneer Masal Roast", "Paneer roasted in a dry spiced masala", 170],
    ["Green Peas Masal Roast", "Green peas roasted in a dry spiced masala", 130],
  ],
  "Weekly Specials": [
    ["Set Dosa (Monday Special)", "Soft mini dosas served in a stack of three", 80],
    ["Peas Uthappam (Tuesday Special)", "Uthappam topped with green peas", 90],
    ["Five Taste Uthappam (Wednesday Special)", "Uthappam topped with five signature toppings", 100],
    ["Vanilla Roast (Thursday Special)", "Signature house roast dosa", 90],
    ["Adai - Aviyal (Friday Special)", "Multi-lentil adai served with mixed vegetable aviyal", 100, { chefRecommended: true }],
    ["Chenna Masal Roast (Saturday Special)", "Roast dosa filled with spiced chenna masala", 100],
    ["Veg Omelette (Sunday Special)", "Besan-based vegetarian omelette", 90],
  ],
  "House Specials": [
    ["Chilly Parotta", "Shredded parotta tossed with chilli & spices", 130, { isNew: true }],
    ["Chilly Idly", "Cubed idly tossed in spicy chilli sauce", 100, { isNew: true }],
    ["Kaima Parotta", "Parotta tossed with a rich, minced-vegetable style kaima masala", 140],
    ["Peas Parotta", "Shredded parotta tossed with green peas masala", 130],
    ["Idly Fry", "Pan fried idly tossed with spices", 90],
    ["Gobi Fry", "Dry roasted spiced cauliflower fry", 110],
  ],
  "Health Beverages": [
    ["Bournvita", "Hot malted chocolate drink", 50],
    ["Ragimalt", "Traditional finger-millet health drink", 60],
    ["Lemon Tea", "Refreshing hot lemon tea", 40],
    ["Sukku Coffee", "Traditional dry ginger coffee", 50],
    ["Kalkandu Milk", "Milk sweetened with rock candy", 60],
    ["Badam Milk", "Chilled milk infused with almonds & saffron", 80, { popular: true }],
  ],
  "Ice Cream Novelties": [
    ["Mini Cone", "Bite sized crunchy cone", 30],
    ["Suvai Ball", "Classic ice cream ball", 40],
    ["Sunday Sundae", "Layered sundae with toppings", 90],
    ["Cassata Slice", "Tri-colour cassata ice cream slice", 60],
    ["Malai Kulfi", "Traditional creamy malai kulfi", 60],
    ["Super Cone", "Large classic ice cream cone", 50],
    ["Premium Cassata", "Rich premium cassata ice cream", 80],
    ["Amrit Kalash Kulfi", "Signature rich dry-fruit kulfi", 90, { chefRecommended: true }],
    ["Italian's Touch", "Italian style gourmet ice cream", 100],
    ["Melting Moments", "Soft melt-in-mouth ice cream treat", 80],
    ["Phata Phat", "Fun crackling-topped ice cream novelty", 70],
  ],
  "Ice Cream Sticks": [
    ["Choc-O-Bar", "Classic chocolate coated vanilla stick", 40],
    ["Mini Chocobar", "Bite sized chocolate coated stick", 25],
    ["Nutty Chocobar", "Chocolate coated stick with crunchy nuts", 50],
    ["Mango Duo", "Two layered mango ice cream stick", 45],
    ["Raspberry Duo", "Two layered raspberry ice cream stick", 45],
    ["Orange Duo", "Two layered orange ice cream stick", 45],
    ["Fiesta", "Colourful fruit-flavoured ice cream stick", 50],
  ],
  "Ice Cream Flavours": [
    ["Cassatta", "Classic tri-flavour ice cream", 60],
    ["Vanilla", "Rich and creamy vanilla ice cream", 50],
    ["Strawberry", "Fresh strawberry ice cream", 55],
    ["Pista Green", "Roasted pistachio ice cream", 60],
    ["Mango", "Seasonal mango ice cream", 60, { popular: true }],
    ["Chocolate", "Rich Belgian style chocolate ice cream", 60],
    ["Butter Scotch", "Caramelised butterscotch ice cream", 60],
    ["Black Currant", "Tangy black currant ice cream", 60],
  ],
};

function run() {
  const existingCount = db.prepare("SELECT COUNT(*) AS c FROM categories").get().c;
  if (existingCount > 0) {
    console.log("Database already seeded — skipping. Delete data/menu.sqlite to reseed.");
  } else {
    const insertCategory = db.prepare(
      "INSERT INTO categories (name, slug, icon, sort_order) VALUES (?, ?, ?, ?)"
    );
    const insertItem = db.prepare(`
      INSERT INTO items
        (category_id, name, description, price, image, is_available, is_popular, is_chef_recommended, is_new, sort_order)
      VALUES (?, ?, ?, ?, '', 1, ?, ?, ?, ?)
    `);

    const seedAll = db.transaction(() => {
      categories.forEach((cat, catIndex) => {
        const slug = slugify(cat.name);
        const info = insertCategory.run(cat.name, slug, cat.icon, catIndex);
        const categoryId = info.lastInsertRowid;

        const items = itemsByCategory[cat.name] || [];
        items.forEach(([name, description, price, flags = {}], itemIndex) => {
          insertItem.run(
            categoryId,
            name,
            description,
            price,
            flags.popular ? 1 : 0,
            flags.chefRecommended ? 1 : 0,
            flags.isNew ? 1 : 0,
            itemIndex
          );
        });
      });
    });

    seedAll();
    const totalItems = db.prepare("SELECT COUNT(*) AS c FROM items").get().c;
    console.log(`Seeded ${categories.length} categories and ${totalItems} menu items.`);

    const imagedCount = assignAllKindImages();
    console.log(`Assigned real photos to ${imagedCount} menu items.`);
  }

  const settingsExists = db.prepare("SELECT COUNT(*) AS c FROM settings WHERE id = 1").get().c;
  if (!settingsExists) {
    db.prepare(`
      INSERT INTO settings (id, restaurant_name, tagline, address, phone, opening_hours, menu_url)
      VALUES (1, 'Amutha Surabi Restaurant', 'Experience Authentic Taste',
        '8A, Thadagam Main Road, Edayar Palayam Junction, Coimbatore - 25',
        '', '7:30 AM - 10:30 PM', 'http://localhost:5173')
    `).run();
    console.log("Inserted default settings.");
  }

  const adminExists = db.prepare("SELECT COUNT(*) AS c FROM admins").get().c;
  if (!adminExists) {
    const username = process.env.ADMIN_USERNAME || "admin";
    const password = process.env.ADMIN_PASSWORD || "Amutha@123";
    const hash = bcrypt.hashSync(password, 10);
    db.prepare("INSERT INTO admins (username, password_hash) VALUES (?, ?)").run(username, hash);
    console.log(`Created admin user "${username}". Change the password after first login.`);
  }
}

run();
