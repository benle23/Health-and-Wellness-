import Database from "better-sqlite3";

const db = new Database("health.db");
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS foods (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    calories_per_100g REAL NOT NULL,
    protein REAL NOT NULL,
    carbs REAL NOT NULL,
    fat REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    food_id INTEGER NOT NULL,
    meal TEXT NOT NULL CHECK(meal IN ('Breakfast', 'Lunch', 'Dinner', 'Snack')),
    quantity_g REAL NOT NULL CHECK(quantity_g > 0),
    logged_at TEXT NOT NULL,
    FOREIGN KEY (food_id) REFERENCES foods(id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS weight_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    weight_kg REAL NOT NULL CHECK(weight_kg > 0),
    logged_at TEXT NOT NULL UNIQUE
  );

  CREATE INDEX IF NOT EXISTS idx_entries_logged_at ON entries(logged_at);
  CREATE INDEX IF NOT EXISTS idx_weight_logged_at ON weight_log(logged_at);
`);

const foods = [
  ["Apple", 52, 0.3, 13.8, 0.2],
  ["Banana", 89, 1.1, 22.8, 0.3],
  ["Orange", 47, 0.9, 11.8, 0.1],
  ["Blueberries", 57, 0.7, 14.5, 0.3],
  ["Strawberries", 32, 0.7, 7.7, 0.3],
  ["Avocado", 160, 2, 8.5, 14.7],
  ["Broccoli", 35, 2.4, 7.2, 0.4],
  ["Spinach", 23, 2.9, 3.6, 0.4],
  ["Sweet potato", 86, 1.6, 20.1, 0.1],
  ["Russet potato", 79, 2.1, 18.1, 0.1],
  ["Carrots", 41, 0.9, 9.6, 0.2],
  ["Brown rice, cooked", 123, 2.7, 25.6, 1],
  ["White rice, cooked", 130, 2.7, 28.2, 0.3],
  ["Quinoa, cooked", 120, 4.4, 21.3, 1.9],
  ["Rolled oats, dry", 379, 13.2, 67.7, 6.5],
  ["Whole wheat bread", 247, 13, 41, 3.4],
  ["Sourdough bread", 289, 9.7, 56.4, 2.4],
  ["Whole wheat pasta, cooked", 149, 6, 30.1, 1.7],
  ["Black beans, cooked", 132, 8.9, 23.7, 0.5],
  ["Chickpeas, cooked", 164, 8.9, 27.4, 2.6],
  ["Lentils, cooked", 116, 9, 20.1, 0.4],
  ["Chicken breast, cooked", 165, 31, 0, 3.6],
  ["Chicken thigh, cooked", 209, 26, 0, 10.9],
  ["Ground turkey, cooked", 203, 27.4, 0, 9.7],
  ["Lean ground beef, cooked", 250, 26, 0, 15],
  ["Salmon, cooked", 206, 22.1, 0, 12.4],
  ["Tuna, canned in water", 116, 25.5, 0, 0.8],
  ["Shrimp, cooked", 99, 24, 0.2, 0.3],
  ["Egg, whole", 143, 12.6, 0.7, 9.5],
  ["Egg whites", 52, 10.9, 0.7, 0.2],
  ["Tofu, firm", 144, 17.3, 2.8, 8.7],
  ["Tempeh", 195, 19.9, 7.6, 11.4],
  ["Greek yogurt, nonfat", 59, 10.3, 3.6, 0.4],
  ["Cottage cheese, 2%", 84, 11, 4.3, 2.3],
  ["Cheddar cheese", 403, 24.9, 1.3, 33.1],
  ["Whole milk", 61, 3.2, 4.8, 3.3],
  ["Almond milk, unsweetened", 15, 0.6, 0.6, 1.2],
  ["Peanut butter", 588, 25.1, 20, 50.4],
  ["Almonds", 579, 21.2, 21.6, 49.9],
  ["Walnuts", 654, 15.2, 13.7, 65.2],
  ["Chia seeds", 486, 16.5, 42.1, 30.7],
  ["Hummus", 166, 7.9, 14.3, 9.6],
  ["Olive oil", 884, 0, 0, 100],
  ["Butter", 717, 0.9, 0.1, 81.1],
  ["Granola", 471, 10, 64, 20],
  ["Whey protein powder", 400, 80, 10, 6],
  ["Dark chocolate, 70%", 598, 7.8, 45.9, 42.6],
  ["Turkey sandwich", 215, 12.5, 24, 7.5],
  ["Chicken Caesar salad", 180, 15, 8, 10],
  ["Vegetable soup", 45, 2, 8, 0.8],
];

const insertFood = db.prepare(`
  INSERT OR IGNORE INTO foods
  (name, calories_per_100g, protein, carbs, fat)
  VALUES (?, ?, ?, ?, ?)
`);

const seedFoods = db.transaction((rows) => {
  for (const food of rows) insertFood.run(...food);
});
seedFoods(foods);

const insertSetting = db.prepare(
  "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
);
[
  ["calorie_goal", "2000"],
  ["protein_target", "140"],
  ["carbs_target", "220"],
  ["fat_target", "65"],
].forEach((setting) => insertSetting.run(...setting));

export default db;
