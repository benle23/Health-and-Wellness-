import "./WeeklyChart.css";

function WeeklyChart({ data, goal }) {
  const chartHeight = 76;
  const max = Math.max(goal, ...data.map((day) => day.calories), 1);

  return (
    <section className="card weekly-chart">
      <header className="weekly-chart-header">
        <div>
          <p className="eyebrow">Seven day rhythm</p>
          <h2 className="card-heading">Calorie trend</h2>
        </div>
        <div className="weekly-legend">
          <span />
          {goal.toLocaleString()} goal
        </div>
      </header>
      <svg viewBox="0 0 350 112" role="img" aria-label="Weekly calorie bar chart">
        <line className="goal-line" x1="0" x2="350" y1={92 - (goal / max) * chartHeight} y2={92 - (goal / max) * chartHeight} />
        {data.map((day, index) => {
          const barHeight = Math.max((day.calories / max) * chartHeight, 2);
          const x = index * 50 + 11;
          const isToday = index === data.length - 1;
          return (
            <g key={day.date}>
              <rect
                className={isToday ? "weekly-bar current" : "weekly-bar"}
                x={x}
                y={92 - barHeight}
                width="20"
                height={barHeight}
                rx="3"
              />
              <text x={x + 10} y="108" textAnchor="middle">
                {new Date(`${day.date}T12:00:00`).toLocaleDateString("en-US", {
                  weekday: "short",
                }).slice(0, 1)}
              </text>
            </g>
          );
        })}
      </svg>
    </section>
  );
}

export default WeeklyChart;
