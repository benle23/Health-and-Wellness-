# Still

Still is a full-stack calorie and health journal with an intentionally quiet, editorial interface. It combines daily food and macro tracking, hydration, weekly calorie trends, adjustable goals, and a body-weight log in one focused dashboard.

## Features

- Animated daily calorie ring and macro progress
- Searchable local database seeded with 50 common foods
- Meal-grouped food log with quantity and serving controls
- Hydration tracker with lightweight browser persistence
- Seven-day calorie trend drawn with vanilla SVG
- SQLite-backed goals and fourteen-day body-weight history

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The Express API runs on [http://localhost:3001](http://localhost:3001).

## Production Build

```bash
npm run build
NODE_ENV=production npm start
```

The production server serves the built Vite app and API together on port `3001`.

## Architecture

- `src/components/` contains the React dashboard components and component CSS.
- `src/api.js` contains the frontend fetch wrapper and all API calls.
- `db/init.js` creates `health.db`, runs the schema, and seeds foods and defaults.
- `routes/` contains the Express REST endpoints.
- `server.js` initializes the API and serves the production build.

## API

- `GET /api/foods?q=`
- `GET /api/entries?date=YYYY-MM-DD`
- `POST /api/entries`
- `DELETE /api/entries/:id`
- `GET /api/settings`
- `PUT /api/settings`
- `POST /api/weight`
- `GET /api/weight?days=14`
