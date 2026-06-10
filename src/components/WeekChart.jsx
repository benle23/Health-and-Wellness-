import { useDashboard } from "@/context/DashboardContext";
import "@/styles/WeekChart.css";

function WeekChart() {
  const { date, allEntries } = useDashboard();

  const days = Array.from({ length: 7 }, (_, index) => {
    const current = new Date(`${date}T12:00:00`);
    current.setDate(current.getDate() - (6 - index));
    const day = current.toLocaleDateString("en-CA");
    return {
      date: day,
      calories: allEntries
        .filter((entry) => entry.date === day)
        .reduce((total, entry) => total + entry.calories, 0),
    };
  });

  const max = Math.max(...days.map((day) => day.calories), 2000);
  return (
    <section className="week-chart">
      <header>
        <p className="eyebrow">Seven day rhythm</p>
        <h2>Calories logged</h2>
      </header>
      <div className="week-bars">
        {days.map((day) => (
          <div key={day.date}>
            <span style={{ height: `${Math.max((day.calories / max) * 100, 2)}%` }} />
            <small>{new Date(`${day.date}T12:00:00`).toLocaleDateString("en-US", { weekday: "narrow" })}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

export default WeekChart;
