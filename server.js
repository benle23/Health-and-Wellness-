import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "./db/init.js";
import entriesRouter from "./routes/entries.js";
import foodsRouter from "./routes/foods.js";
import settingsRouter from "./routes/settings.js";

const app = express();
const port = process.env.PORT || 3001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use("/api/foods", foodsRouter);
app.use("/api/entries", entriesRouter);
app.use("/api", settingsRouter);

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "dist")));
  app.get("*", (_request, response) => {
    response.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: "Something went wrong." });
});

app.listen(port, () => {
  console.log(`Still API listening on http://localhost:${port}`);
});
