import "@/styles/DailySummary.css";

const radius = 68;
const circumference = 2 * Math.PI * radius;

function DailySummary({ totals, settings }) {
  const goal = settings.calorie_goal || 2000;
  const progress = Math.min(totals.calories / goal, 1);
  const offset = circumference * (1 - progress);
  const macros = [
    ["Protein", totals.protein, settings.protein_goal || 150],
    ["Carbs", totals.carbs, settings.carbs_goal || 200],
    ["Fat", totals.fat, settings.fat_goal || 65],
  ];

  return (
    <section className="daily-summary" aria-label="Daily calorie and macro summary">
      <div className="summary-ring">
        <svg viewBox="0 0 160 160" role="img" aria-label={`${Math.round(totals.calories)} of ${goal} calories`}>
          <circle className="ring-track" cx="80" cy="80" r={radius} />
          <circle
            className="ring-progress"
            cx="80"
            cy="80"
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div>
          <strong>{Math.round(totals.calories).toLocaleString()}</strong>
          <span>of {goal.toLocaleString()} kcal</span>
        </div>
      </div>
      <div className="macro-summary">
        {macros.map(([label, value, target]) => (
          <div className="macro-item" key={label}>
            <div>
              <span>{label}</span>
              <span>{Math.round(value)}g / {target}g</span>
            </div>
            <div className="macro-track">
              <span style={{ width: `${Math.min((value / target) * 100, 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default DailySummary;
