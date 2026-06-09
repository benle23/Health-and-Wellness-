import { formatLongDate } from "../date";
import FoodLog from "./FoodLog";
import HydrationWidget from "./HydrationWidget";
import WeeklyChart from "./WeeklyChart";
import "./MainGrid.css";

function MainGrid({
  entries,
  loading,
  totals,
  settings,
  weeklyData,
  onDeleteEntry,
  onLogFood,
}) {
  return (
    <main className="main-grid">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">{formatLongDate()}</p>
          <h1>A quieter way to notice.</h1>
        </div>
        <div className="header-summary">
          <span>Consumed</span>
          <strong>{Math.round(totals.calories).toLocaleString()}</strong>
          <span>kcal</span>
        </div>
      </header>
      <FoodLog
        entries={entries}
        loading={loading}
        onDeleteEntry={onDeleteEntry}
        onLogFood={onLogFood}
      />
      <HydrationWidget />
      <WeeklyChart data={weeklyData} goal={settings.calorie_goal} />
    </main>
  );
}

export default MainGrid;
