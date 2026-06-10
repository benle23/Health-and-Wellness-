import { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import "@/styles/CalorieAdjustment.css";

function CalorieAdjustment({ remaining }) {
  const { settings, adjustCaloriesRemaining, resetCaloriesRemaining } = useDashboard();
  const [amount, setAmount] = useState(100);
  const adjustment = Number(settings.calorie_adjustment || 0);

  const apply = (direction) => {
    const value = Number(amount);
    if (value > 0) adjustCaloriesRemaining(direction * value);
  };

  return (
    <article className="metric-chip calorie-adjustment">
      <div className="adjustment-heading">
        <span>Calories remaining</span>
        <button type="button" onClick={resetCaloriesRemaining} disabled={adjustment === 0}>
          Reset
        </button>
      </div>
      <strong>{Math.round(remaining).toLocaleString()}</strong>
      <div className="adjustment-controls">
        <button type="button" onClick={() => apply(-1)} aria-label="Subtract calories remaining">
          −
        </button>
        <label>
          <span>Adjustment amount</span>
          <input
            type="number"
            min="1"
            step="10"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </label>
        <button type="button" onClick={() => apply(1)} aria-label="Add calories remaining">
          +
        </button>
      </div>
      <small>Daily adjustment {adjustment >= 0 ? "+" : ""}{adjustment.toLocaleString()} kcal</small>
    </article>
  );
}

export default CalorieAdjustment;
