import cors from "cors";
import express from "express";
import { initDB } from "./db.js";
import entriesRouter from "./routes/entries.js";
import foodsRouter from "./routes/foods.js";
import settingsRouter from "./routes/settings.js";
import waterRouter from "./routes/water.js";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use("/api/foods", foodsRouter);
app.use("/api/entries", entriesRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/water", waterRouter);

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: "Something went wrong." });
});

initDB();
app.listen(PORT, () => console.log(`Server on :${PORT}`));
