import { Router } from "express";
import db from "../db/init.js";

const router = Router();
const allowedSettings = new Set([
  "calorie_goal",
  "protein_target",
  "carbs_target",
  "fat_target",
]);

router.get("/settings", (_request, response) => {
  const settings = Object.fromEntries(
    db
      .prepare("SELECT key, value FROM settings")
      .all()
      .map(({ key, value }) => [key, Number(value)]),
  );
  response.json(settings);
});

router.put("/settings", (request, response) => {
  const values = Object.entries(request.body).filter(([key]) => allowedSettings.has(key));
  if (
    !values.length ||
    values.some(([, value]) => !Number.isFinite(Number(value)) || Number(value) <= 0)
  ) {
    return response.status(400).json({ error: "Settings must be positive numbers." });
  }

  const upsert = db.prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `);
  db.transaction((rows) => rows.forEach(([key, value]) => upsert.run(key, String(value))))(
    values,
  );

  const settings = Object.fromEntries(
    db.prepare("SELECT key, value FROM settings").all().map(({ key, value }) => [key, Number(value)]),
  );
  response.json(settings);
});

router.post("/weight", (request, response) => {
  const weight = Number(request.body.weight_kg);
  const date = String(request.body.logged_at || new Date().toISOString().slice(0, 10));
  if (!Number.isFinite(weight) || weight <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return response.status(400).json({ error: "A positive weight and valid date are required." });
  }

  db.prepare(`
    INSERT INTO weight_log (weight_kg, logged_at) VALUES (?, ?)
    ON CONFLICT(logged_at) DO UPDATE SET weight_kg = excluded.weight_kg
  `).run(weight, date);

  response.status(201).json(
    db.prepare("SELECT * FROM weight_log WHERE logged_at = ?").get(date),
  );
});

router.get("/weight", (request, response) => {
  const days = Math.min(Math.max(Number(request.query.days) || 14, 1), 365);
  const weights = db
    .prepare("SELECT * FROM weight_log ORDER BY logged_at DESC LIMIT ?")
    .all(days)
    .reverse();
  response.json(weights);
});

export default router;
