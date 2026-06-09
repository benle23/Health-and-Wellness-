import "./MacroBars.css";

const macros = [
  ["protein", "Protein"],
  ["carbs", "Carbs"],
  ["fat", "Fat"],
];

function MacroBars({ totals, settings }) {
  return (
    <div className="macro-bars">
      {macros.map(([key, label]) => {
        const total = totals[key] || 0;
        const target = settings[`${key}_target`] || 1;
        const width = `${Math.min((total / target) * 100, 100)}%`;
        return (
          <div className="macro-row" key={key}>
            <div className="macro-copy">
              <span>{label}</span>
              <span>
                {Math.round(total)} / {target}g
              </span>
            </div>
            <div className="macro-track">
              <span className="macro-fill" style={{ width }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default MacroBars;
