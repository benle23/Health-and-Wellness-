# Apptrack

Apptrack is a refined, browser-based job application workspace for managing opportunities, resume versions, deadlines, recruiter follow-ups, and imported job-search data.

## Features

- Searchable, sortable application pipeline with inline editing and status filters
- Application CRUD with recruiter details, notes, deadlines, and next actions
- PDF resume library with local downloads and application tagging
- PDF text extraction and Google Docs / Google Sheets import workflows
- Urgency-based deadline calendar and follow-up reminders
- CSV export, local data reset, dark/light themes, and responsive navigation
- Browser-only persistence through `localStorage`

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production Build

```bash
npm run build
```

The app uses Next.js static export, so the generated `out/` directory can be hosted on any static site provider. All user data remains in the browser.

## Architecture

- `src/app/page.tsx` contains the client-side application workspace and feature views.
- `src/lib/types.ts` defines the Apptrack domain model.
- `src/lib/seedData.ts` provides first-run sample data and new-application defaults.
- `src/lib/utils.ts` owns CSV, date, download, and Google export helpers.
- `src/app/globals.css` contains the responsive editorial visual system.
