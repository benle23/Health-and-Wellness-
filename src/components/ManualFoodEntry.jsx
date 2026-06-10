import { useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import "@/styles/ManualFoodEntry.css";

const emptyFood = {
  name: "",
  calories: "",
  fat: "",
  sugar: "",
  protein: "",
};

function ManualFoodEntry({ meal, onClose }) {
  const { addEntry, setError } = useDashboard();
  const [food, setFood] = useState(emptyFood);

  const updateField = (key, value) => {
    setFood((current) => ({ ...current, [key]: value }));
  };

  const submit = (event) => {
    event.preventDefault();
    if (!food.name.trim() || food.calories === "") {
      setError("Enter a food name and calories.");
      return;
    }

    setError("");
    addEntry({
      ...food,
      meal,
      fat: food.fat || 0,
      sugar: food.sugar || 0,
      protein: food.protein || 0,
    });
    onClose();
  };

  return (
    <form className="manual-food-entry" onSubmit={submit}>
      <div className="manual-entry-header">
        <div>
          <p className="eyebrow">Manual entry</p>
          <h3>Log to {meal}</h3>
        </div>
        <button type="button" onClick={onClose}>Close</button>
      </div>

      <label className="food-name-field">
        <span>Food name</span>
        <input
          autoFocus
          type="text"
          placeholder="Chicken breast"
          value={food.name}
          onChange={(event) => updateField("name", event.target.value)}
        />
      </label>

      <div className="nutrition-fields">
        {[
          ["calories", "Calories", "kcal"],
          ["fat", "Fat", "g"],
          ["sugar", "Sugar", "g"],
          ["protein", "Protein", "g"],
        ].map(([key, label, unit]) => (
          <label key={key}>
            <span>{label}</span>
            <div>
              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="0"
                value={food[key]}
                onChange={(event) => updateField(key, event.target.value)}
              />
              <small>{unit}</small>
            </div>
          </label>
        ))}
      </div>

      <button className="log-food-button" type="submit">Log to {meal}</button>
    </form>
  );
}

export default ManualFoodEntry;
