import { useMemo, useState } from "react";
import DailySummary from "@/components/DailySummary";
import MealSection from "@/components/MealSection";
import SettingsDrawer from "@/components/SettingsDrawer";
import Sidebar from "@/components/Sidebar";
import WaterWidget from "@/components/WaterWidget";
import WeekChart from "@/components/WeekChart";
import { useDashboard } from "@/context/DashboardContext";
import "@/styles/App.css";

const meals = ["Breakfast", "Lunch", "Dinner", "Snacks"];

function App() {
  const { date, entries, settings, water, error, toast, moveDate, setDate, setError } =
    useDashboard();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const totals = useMemo(
    () =>
      entries.reduce(
        (sum, entry) => ({
          calories: sum.calories + entry.calories,
          protein: sum.protein + entry.protein,
          carbs: sum.carbs + Number(entry.carbs || 0),
          fat: sum.fat + entry.fat,
          sugar: sum.sugar + entry.sugar,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 },
      ),
    [entries],
  );

  const selectedDate = new Date(`${date}T12:00:00`);
  const isToday = date === new Date().toLocaleDateString("en-CA");
  const dateLabel = `${isToday ? "Today, " : ""}${selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  })}`;

  return (
    <div className="app-shell">
      <Sidebar
        totals={totals}
        settings={settings}
        onToday={() => setDate(new Date().toLocaleDateString("en-CA"))}
        onHistory={() => moveDate(-1)}
        onSettings={() => setSettingsOpen((open) => !open)}
      />
      <main className="dashboard">
        <header className="date-header">
          <div>
            <p className="eyebrow">Daily journal</p>
            <h1>{dateLabel}</h1>
          </div>
          <div className="date-controls">
            <button type="button" onClick={() => moveDate(-1)} aria-label="Previous day">
              ←
            </button>
            <button type="button" onClick={() => moveDate(1)} aria-label="Next day">
              →
            </button>
          </div>
        </header>

        {settingsOpen && <SettingsDrawer onClose={() => setSettingsOpen(false)} />}

        <section className="summary-strip" aria-label="Daily metrics">
          <Metric label="Calories remaining" value={Math.max((settings.calorie_goal || 0) - totals.calories, 0)} />
          <Metric label="Calories consumed" value={totals.calories} />
          <Metric label="Protein" value={`${Math.round(totals.protein)} g`} />
          <Metric label="Water" value={`${water.total_ml} ml`} />
        </section>

        <div className="mobile-summary">
          <DailySummary totals={totals} settings={settings} />
        </div>

        <section className="meals-list">
          {meals.map((meal) => (
            <MealSection key={meal} meal={meal} entries={entries.filter((entry) => entry.meal === meal)} />
          ))}
        </section>

        <WaterWidget />
        <WeekChart />
      </main>

      {error && (
        <button className="error-toast" type="button" onClick={() => setError("")}>
          {error}
        </button>
      )}
      {toast && <div className="success-toast">{toast}</div>}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <article className="metric-chip">
      <span>{label}</span>
      <strong>{typeof value === "number" ? Math.round(value).toLocaleString() : value}</strong>
    </article>
  );
}

export default App;
