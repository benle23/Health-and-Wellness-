import { Router } from "express";
import db from "../db.js";

const router = Router();
const keys = ["calorie_goal", "protein_goal", "carbs_goal", "fat_goal", "water_goal_ml"];

const readSettings = () =>
  Object.fromEntries(
    db.prepare("SELECT key, value FROM settings").all().map(({ key, value }) => [key, Number(value)]),
  );

router.get("/", (_request, response) => {
  response.json(readSettings());
});

router.put("/", (request, response) => {
  if (keys.some((key) => !Number.isFinite(Number(request.body[key])) || Number(request.body[key]) <= 0)) {
    return response.status(400).json({ error: "All settings must be positive numbers." });
  }
  const upsert = db.prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `);
  db.transaction(() => keys.forEach((key) => upsert.run(key, String(request.body[key]))))();
  response.json(readSettings());
});

export default router;
