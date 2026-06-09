import { Router } from "express";
import db from "../db.js";

const router = Router();

const getWater = (date) => {
  const total = db
    .prepare("SELECT COALESCE(SUM(amount_ml), 0) AS total_ml FROM water_log WHERE logged_at = ?")
    .get(date).total_ml;
  const goal = Number(db.prepare("SELECT value FROM settings WHERE key = 'water_goal_ml'").get().value);
  return { total_ml: Math.min(total, goal), goal_ml: goal, glasses: Math.ceil(Math.min(total, goal) / 250) };
};

router.get("/", (request, response) => {
  const date = String(request.query.date || new Date().toISOString().slice(0, 10));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return response.status(400).json({ error: "A valid YYYY-MM-DD date is required." });
  }
  response.json(getWater(date));
});

router.post("/", (request, response) => {
  const amount = Number(request.body.amount_ml);
  const date = String(request.body.date || new Date().toISOString().slice(0, 10));
  if (!Number.isInteger(amount) || amount <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return response.status(400).json({ error: "A positive amount and valid date are required." });
  }
  const current = getWater(date);
  const amountToAdd = Math.min(amount, current.goal_ml - current.total_ml);
  if (amountToAdd > 0) {
    db.prepare("INSERT INTO water_log (amount_ml, logged_at) VALUES (?, ?)").run(amountToAdd, date);
  }
  response.status(201).json(getWater(date));
});

export default router;
