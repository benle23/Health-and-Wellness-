import { Router } from "express";
import db from "../db.js";

const router = Router();

router.get("/", (request, response) => {
  const query = String(request.query.q || "").trim();
  const foods = query
    ? db
        .prepare("SELECT * FROM foods WHERE name LIKE ? COLLATE NOCASE ORDER BY name LIMIT 20")
        .all(`%${query}%`)
    : db.prepare("SELECT * FROM foods ORDER BY name").all();
  response.json(foods);
});

export default router;
