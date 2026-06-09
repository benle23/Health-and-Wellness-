import Database from "better-sqlite3";

const db = new Database("health.db");
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

const foods = [
  ["Chicken Breast", null, 165, 31, 0, 3.6, 100],
  ["Chicken Thigh", null, 209, 26, 0, 10.9, 100],
  ["Turkey Breast", null, 135, 30, 0, 1, 100],
  ["Lean Ground Beef", null, 250, 26, 0, 15, 100],
  ["Salmon", null, 206, 22.1, 0, 12.4, 100],
  ["Tuna in Water", null, 116, 25.5, 0, 0.8, 100],
  ["Shrimp", null, 99, 24, 0.2, 0.3, 100],
  ["Whole Egg", null, 143, 12.6, 0.7, 9.5, 50],
  ["Egg Whites", null, 52, 10.9, 0.7, 0.2, 100],
  ["Firm Tofu", null, 144, 17.3, 2.8, 8.7, 100],
  ["Tempeh", null, 195, 19.9, 7.6, 11.4, 100],
  ["Greek Yogurt, Nonfat", null, 59, 10.3, 3.6, 0.4, 170],
  ["Cottage Cheese, 2%", null, 84, 11, 4.3, 2.3, 113],
  ["Whey Protein Powder", null, 400, 80, 10, 6, 30],
  ["Brown Rice, Cooked", null, 123, 2.7, 25.6, 1, 150],
  ["White Rice, Cooked", null, 130, 2.7, 28.2, 0.3, 150],
  ["Rolled Oats, Dry", null, 379, 13.2, 67.7, 6.5, 40],
  ["Quinoa, Cooked", null, 120, 4.4, 21.3, 1.9, 150],
  ["Sweet Potato", null, 86, 1.6, 20.1, 0.1, 130],
  ["Russet Potato", null, 79, 2.1, 18.1, 0.1, 173],
  ["Whole Wheat Pasta, Cooked", null, 149, 6, 30.1, 1.7, 140],
  ["Whole Wheat Bread", null, 247, 13, 41, 3.4, 40],
  ["Sourdough Bread", null, 289, 9.7, 56.4, 2.4, 50],
  ["Black Beans, Cooked", null, 132, 8.9, 23.7, 0.5, 130],
  ["Chickpeas, Cooked", null, 164, 8.9, 27.4, 2.6, 130],
  ["Lentils, Cooked", null, 116, 9, 20.1, 0.4, 130],
  ["Banana", null, 89, 1.1, 22.8, 0.3, 118],
  ["Apple", null, 52, 0.3, 13.8, 0.2, 182],
  ["Orange", null, 47, 0.9, 11.8, 0.1, 140],
  ["Blueberries", null, 57, 0.7, 14.5, 0.3, 148],
  ["Strawberries", null, 32, 0.7, 7.7, 0.3, 150],
  ["Avocado", null, 160, 2, 8.5, 14.7, 75],
  ["Olive Oil", null, 884, 0, 0, 100, 14],
  ["Almonds", null, 579, 21.2, 21.6, 49.9, 28],
  ["Walnuts", null, 654, 15.2, 13.7, 65.2, 28],
  ["Peanut Butter", null, 588, 25.1, 20, 50.4, 32],
  ["Cheddar Cheese", null, 403, 24.9, 1.3, 33.1, 28],
  ["Chia Seeds", null, 486, 16.5, 42.1, 30.7, 28],
  ["Broccoli", null, 35, 2.4, 7.2, 0.4, 100],
  ["Spinach", null, 23, 2.9, 3.6, 0.4, 85],
  ["Cucumber", null, 15, 0.7, 3.6, 0.1, 100],
  ["Tomato", null, 18, 0.9, 3.9, 0.2, 123],
  ["Carrots", null, 41, 0.9, 9.6, 0.2, 100],
  ["Bell Pepper", null, 31, 1, 6, 0.3, 100],
  ["Green Beans", null, 35, 1.9, 7.9, 0.3, 100],
  ["Mixed Greens", null, 20, 2, 3, 0.2, 85],
  ["Whole Milk", null, 61, 3.2, 4.8, 3.3, 244],
  ["Orange Juice", null, 45, 0.7, 10.4, 0.2, 248],
  ["Black Coffee", null, 1, 0.1, 0, 0, 240],
  ["Almond Milk, Unsweetened", null, 15, 0.6, 0.6, 1.2, 240],
  ["Dark Chocolate, 70%", null, 598, 7.8, 45.9, 42.6, 20],
  ["Granola Bar", null, 471, 10, 64, 20, 40],
  ["Protein Bar", null, 360, 32, 38, 10, 60],
  ["Rice Cakes", null, 387, 8, 81, 3, 18],
  ["Hummus", null, 166, 7.9, 14.3, 9.6, 30],
  ["Turkey Sandwich", null, 215, 12.5, 24, 7.5, 180],
  ["Chicken Caesar Salad", null, 180, 15, 8, 10, 250],
  ["Vegetable Soup", null, 45, 2, 8, 0.8, 250],
  ["Granola", null, 471, 10, 64, 20, 50],
  ["Honey", null, 304, 0.3, 82.4, 0, 21],
];

export function initDB() {
  if (db.pragma("user_version", { simple: true }) !== 1) {
    db.exec(`
      DROP TABLE IF EXISTS water_log;
      DROP TABLE IF EXISTS weight_log;
      DROP TABLE IF EXISTS entries;
      DROP TABLE IF EXISTS settings;
      DROP TABLE IF EXISTS foods;
    `);
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS foods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      brand TEXT,
      calories_per_100g REAL NOT NULL,
      protein_per_100g REAL NOT NULL DEFAULT 0,
      carbs_per_100g REAL NOT NULL DEFAULT 0,
      fat_per_100g REAL NOT NULL DEFAULT 0,
      serving_g REAL NOT NULL DEFAULT 100
    );
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      food_id INTEGER NOT NULL REFERENCES foods(id),
      meal TEXT NOT NULL CHECK(meal IN ('Breakfast','Lunch','Dinner','Snacks')),
      quantity_g REAL NOT NULL,
      logged_at TEXT NOT NULL DEFAULT (date('now'))
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS water_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount_ml INTEGER NOT NULL,
      logged_at TEXT NOT NULL DEFAULT (date('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(logged_at);
    CREATE INDEX IF NOT EXISTS idx_water_date ON water_log(logged_at);
  `);

  if (db.prepare("SELECT COUNT(*) AS count FROM foods").get().count === 0) {
    const insert = db.prepare(`
      INSERT INTO foods
      (name, brand, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, serving_g)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    db.transaction((rows) => rows.forEach((food) => insert.run(...food)))(foods);
  }

  const insertSetting = db.prepare(
    "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
  );
  [
    ["calorie_goal", "2000"],
    ["protein_goal", "150"],
    ["carbs_goal", "200"],
    ["fat_goal", "65"],
    ["water_goal_ml", "3785"],
  ].forEach((setting) => insertSetting.run(...setting));

  db.pragma("user_version = 1");
}

export default db;
