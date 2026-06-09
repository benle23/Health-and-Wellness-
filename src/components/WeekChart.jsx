import { useEffect, useState } from "react";
import { api } from "@/api";
import { useDashboard } from "@/context/DashboardContext";
import "@/styles/WeekChart.css";

function WeekChart() {
  const [days, setDays] = useState([]);
  const { date, entries } = useDashboard();

  useEffect(() => {
    const dates = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      return date.toLocaleDateString("en-CA");
    });
    Promise.all(dates.map((date) => api.entries.list(date)))
      .then((results) =>
        setDays(
          dates.map((date, index) => ({
            date,
            calories: results[index].reduce((total, entry) => total + entry.calories, 0),
          })),
        ),
      )
      .catch(() => setDays([]));
  }, [date, entries]);

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
