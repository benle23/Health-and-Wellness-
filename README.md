# nourish

nourish is a full-stack calorie and health dashboard built around a fast, inline food diary.

## Features

- Inline food search and serving-size flow for every meal
- Searchable SQLite database seeded with 60 common foods
- Live calorie ring, macro bars, meal totals, and daily metrics
- SQLite-backed one-gallon hydration tracker
- Adjustable calorie, macro, and water goals

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Express runs on [http://localhost:3001](http://localhost:3001).

## Architecture

- `server/index.js` mounts the Express API.
- `server/db.js` creates `health.db`, resets incompatible legacy schemas, and seeds defaults.
- `server/routes/` contains foods, entries, settings, and water routes.
- `src/context/DashboardContext.jsx` keeps daily data synchronized through `refetch()`.
- `src/components/MealSection.jsx` and `FoodSearch.jsx` own the inline logging flow.

## API

- `GET /api/foods?q=`
- `GET /api/entries?date=YYYY-MM-DD`
- `POST /api/entries`
- `DELETE /api/entries/:id`
- `GET /api/settings`
- `PUT /api/settings`
- `GET /api/water?date=YYYY-MM-DD`
- `POST /api/water`
