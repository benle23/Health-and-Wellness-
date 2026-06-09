import { useEffect, useMemo, useState } from "react";
import { api } from "@/api";
import { useDashboard } from "@/context/DashboardContext";
import "@/styles/FoodSearch.css";

function FoodSearch({ meal, onClose }) {
  const { date, refetch, setError, showToast } = useDashboard();
  const [query, setQuery] = useState("");
  const [foods, setFoods] = useState([]);
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState(100);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      api.foods
        .search(query)
        .then(setFoods)
        .catch((requestError) => setError(requestError.message));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [query, setError]);

  useEffect(() => {
    if (selected) setQuantity(selected.serving_g);
  }, [selected]);

  const nutrition = useMemo(() => {
    if (!selected) return null;
    const ratio = Number(quantity || 0) / 100;
    return {
      calories: Math.round(selected.calories_per_100g * ratio),
      protein: Math.round(selected.protein_per_100g * ratio * 10) / 10,
      carbs: Math.round(selected.carbs_per_100g * ratio * 10) / 10,
      fat: Math.round(selected.fat_per_100g * ratio * 10) / 10,
    };
  }, [quantity, selected]);

  const logFood = async () => {
    if (!selected || Number(quantity) <= 0) return;
    try {
      setBusy(true);
      setError("");
      await api.entries.add({
        food_id: selected.id,
        meal,
        quantity_g: Number(quantity),
        date,
      });
      await refetch();
      showToast(`${selected.name} logged`);
      onClose();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  if (selected) {
    return (
      <div className="food-search-panel">
        <button className="back-button" type="button" onClick={() => setSelected(null)}>
          ← {selected.name}
        </button>
        <div className="quantity-panel">
          <label htmlFor={`quantity-${meal}`}>Serving size</label>
          <div className="quantity-field">
            <input
              id={`quantity-${meal}`}
              type="number"
              min="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
            <span>g</span>
          </div>
          <div className="nutrition-preview">
            <span>Calories <strong>{nutrition.calories}</strong></span>
            <span>Protein <strong>{nutrition.protein}g</strong></span>
            <span>Carbs <strong>{nutrition.carbs}g</strong></span>
            <span>Fat <strong>{nutrition.fat}g</strong></span>
          </div>
          <button className="log-food-button" type="button" disabled={busy || Number(quantity) <= 0} onClick={logFood}>
            {busy ? "Logging…" : `Log to ${meal}`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="food-search-panel">
      <div className="search-header">
        <input
          autoFocus
          type="search"
          placeholder="Search foods…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button type="button" onClick={onClose}>Close</button>
      </div>
      <div className="search-results">
        {foods.map((food) => (
          <div className="search-result" key={food.id}>
            <div>
              <strong>{food.name}</strong>
              <span>{food.serving_g}g serving</span>
            </div>
            <span>{Math.round((food.serving_g / 100) * food.calories_per_100g)} kcal</span>
            <button type="button" onClick={() => setSelected(food)}>Add</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FoodSearch;
