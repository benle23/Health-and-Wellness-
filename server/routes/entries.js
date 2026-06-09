import { Router } from "express";
import db from "../db.js";

const router = Router();
const meals = new Set(["Breakfast", "Lunch", "Dinner", "Snacks"]);

const selectEntries = `
  SELECT
    entries.id,
    entries.food_id,
    foods.name,
    foods.brand,
    entries.meal,
    entries.quantity_g,
    entries.logged_at,
    ROUND(entries.quantity_g / 100.0 * foods.calories_per_100g, 0) AS calories,
    ROUND(entries.quantity_g / 100.0 * foods.protein_per_100g, 1) AS protein,
    ROUND(entries.quantity_g / 100.0 * foods.carbs_per_100g, 1) AS carbs,
    ROUND(entries.quantity_g / 100.0 * foods.fat_per_100g, 1) AS fat
  FROM entries
  JOIN foods ON foods.id = entries.food_id
`;

router.get("/", (request, response) => {
  const date = String(request.query.date || new Date().toISOString().slice(0, 10));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return response.status(400).json({ error: "A valid YYYY-MM-DD date is required." });
  }
  response.json(
    db.prepare(`${selectEntries} WHERE entries.logged_at = ? ORDER BY entries.id`).all(date),
  );
});

router.post("/", (request, response) => {
  const { food_id, meal, quantity_g, date } = request.body;
  const foodId = Number(food_id);
  const quantity = Number(quantity_g);
  const loggedAt = String(date || new Date().toISOString().slice(0, 10));

  if (
    !Number.isInteger(foodId) ||
    !meals.has(meal) ||
    !Number.isFinite(quantity) ||
    quantity <= 0 ||
    !/^\d{4}-\d{2}-\d{2}$/.test(loggedAt)
  ) {
    return response.status(400).json({ error: "Valid food, meal, quantity, and date are required." });
  }
  if (!db.prepare("SELECT id FROM foods WHERE id = ?").get(foodId)) {
    return response.status(404).json({ error: "Food not found." });
  }

  const result = db
    .prepare("INSERT INTO entries (food_id, meal, quantity_g, logged_at) VALUES (?, ?, ?, ?)")
    .run(foodId, meal, quantity, loggedAt);
  response.status(201).json(
    db.prepare(`${selectEntries} WHERE entries.id = ?`).get(result.lastInsertRowid),
  );
});

router.delete("/:id", (request, response) => {
  const result = db.prepare("DELETE FROM entries WHERE id = ?").run(request.params.id);
  if (!result.changes) return response.status(404).json({ error: "Entry not found." });
  response.json({ deleted: true });
});

export default router;
