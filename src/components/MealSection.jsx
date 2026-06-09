import { useState } from "react";
import { api } from "@/api";
import FoodSearch from "@/components/FoodSearch";
import { useDashboard } from "@/context/DashboardContext";
import "@/styles/MealSection.css";

const mealRatios = { Breakfast: 0.25, Lunch: 0.3, Dinner: 0.3, Snacks: 0.15 };

function MealSection({ meal, entries }) {
  const { settings, refetch, setError } = useDashboard();
  const [searchOpen, setSearchOpen] = useState(false);
  const calories = entries.reduce((total, entry) => total + entry.calories, 0);
  const target = Math.round((settings.calorie_goal || 2000) * mealRatios[meal]);

  const removeEntry = async (id) => {
    try {
      setError("");
      await api.entries.remove(id);
      await refetch();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <article className="meal-section">
      <header>
        <h2>{meal}</h2>
        <span>{Math.round(calories)} / {target} kcal</span>
      </header>
      {entries.length > 0 && (
        <div className="meal-entries">
          {entries.map((entry) => (
            <div className="food-row" key={entry.id}>
              <div>
                <strong>{entry.name}</strong>
                <span>P {entry.protein}g · C {entry.carbs}g · F {entry.fat}g</span>
              </div>
              <span>{Math.round(entry.quantity_g)}g</span>
              <span>{Math.round(entry.calories)} kcal</span>
              <button type="button" onClick={() => removeEntry(entry.id)} aria-label={`Remove ${entry.name}`}>×</button>
            </div>
          ))}
        </div>
      )}
      {!searchOpen && (
        <button className="add-food-link" type="button" onClick={() => setSearchOpen(true)}>
          + Add Food
        </button>
      )}
      {searchOpen && <FoodSearch meal={meal} onClose={() => setSearchOpen(false)} />}
    </article>
  );
}

export default MealSection;
