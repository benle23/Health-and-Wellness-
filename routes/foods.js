import { Router } from "express";
import db from "../db/init.js";

const router = Router();

router.get("/", (request, response) => {
  const query = String(request.query.q || "").trim();
  const foods = db
    .prepare(
      `SELECT * FROM foods
       WHERE name LIKE ?
       ORDER BY CASE WHEN name LIKE ? THEN 0 ELSE 1 END, name
       LIMIT 50`,
    )
    .all(`%${query}%`, `${query}%`);

  response.json(foods);
});

export default router;
