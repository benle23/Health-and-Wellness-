import { Router } from "express";
import db from "../db/init.js";

const router = Router();
const mealNames = new Set(["Breakfast", "Lunch", "Dinner", "Snack"]);

const entrySelect = `
  SELECT
    entries.id,
    entries.food_id,
    entries.meal,
    entries.quantity_g,
    entries.logged_at,
    foods.name,
    foods.calories_per_100g,
    foods.protein,
    foods.carbs,
    foods.fat,
    ROUND(foods.calories_per_100g * entries.quantity_g / 100.0, 0) AS calories,
    ROUND(foods.protein * entries.quantity_g / 100.0, 1) AS protein_total,
    ROUND(foods.carbs * entries.quantity_g / 100.0, 1) AS carbs_total,
    ROUND(foods.fat * entries.quantity_g / 100.0, 1) AS fat_total
  FROM entries
  JOIN foods ON foods.id = entries.food_id
`;

router.get("/", (request, response) => {
  const date = String(request.query.date || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return response.status(400).json({ error: "A valid YYYY-MM-DD date is required." });
  }

  const entries = db
    .prepare(`${entrySelect} WHERE substr(entries.logged_at, 1, 10) = ? ORDER BY entries.logged_at`)
    .all(date);
  response.json(entries);
});

router.post("/", (request, response) => {
  const { food_id, meal, quantity_g, logged_at } = request.body;
  const quantity = Number(quantity_g);

  if (!Number.isInteger(Number(food_id)) || !mealNames.has(meal) || !Number.isFinite(quantity) || quantity <= 0) {
    return response.status(400).json({ error: "Food, meal, and a positive quantity are required." });
  }

  const food = db.prepare("SELECT id FROM foods WHERE id = ?").get(food_id);
  if (!food) return response.status(404).json({ error: "Food not found." });

  const timestamp = logged_at ? new Date(logged_at) : new Date();
  if (Number.isNaN(timestamp.getTime())) {
    return response.status(400).json({ error: "Invalid logged_at timestamp." });
  }

  const result = db
    .prepare("INSERT INTO entries (food_id, meal, quantity_g, logged_at) VALUES (?, ?, ?, ?)")
    .run(food_id, meal, quantity, timestamp.toISOString());
  const entry = db.prepare(`${entrySelect} WHERE entries.id = ?`).get(result.lastInsertRowid);

  response.status(201).json(entry);
});

router.delete("/:id", (request, response) => {
  const result = db.prepare("DELETE FROM entries WHERE id = ?").run(request.params.id);
  if (!result.changes) return response.status(404).json({ error: "Entry not found." });
  response.status(204).end();
});

export default router;
