import { useEffect, useMemo, useState } from "react";
import { getFoods } from "../api";
import "./FoodSearchModal.css";

const meals = ["Breakfast", "Lunch", "Dinner", "Snack"];

function FoodSearchModal({ open, onClose, onLog }) {
  const [query, setQuery] = useState("");
  const [foods, setFoods] = useState([]);
  const [selected, setSelected] = useState(null);
  const [quantity, setQuantity] = useState(100);
  const [unit, setUnit] = useState("grams");
  const [meal, setMeal] = useState("Breakfast");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const timer = setTimeout(() => {
      getFoods(query).then(setFoods).catch(() => setFoods([]));
    }, 80);
    return () => clearTimeout(timer);
  }, [open, query]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setSelected(null);
      setQuantity(100);
      setUnit("grams");
      setSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose, open]);

  const quantityInGrams = unit === "serving" ? Number(quantity) * 100 : Number(quantity);
  const calories = useMemo(
    () =>
      selected
        ? Math.round((selected.calories_per_100g * (quantityInGrams || 0)) / 100)
        : 0,
    [quantityInGrams, selected],
  );

  if (!open) return null;

  const handleSubmit = async () => {
    if (!selected || !quantityInGrams) return;
    setSubmitting(true);
    try {
      await onLog({ food_id: selected.id, meal, quantity_g: quantityInGrams });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-layer" role="presentation" onMouseDown={onClose}>
      <section
        className="food-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="food-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="food-modal-header">
          <div>
            <p className="eyebrow">Add to today</p>
            <h2 id="food-modal-title">Log something nourishing.</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <div className="food-search-wrap">
          <label htmlFor="food-search">Search the pantry</label>
          <input
            id="food-search"
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try oats, salmon, apple…"
          />
        </div>

        <div className="food-results">
          {foods.map((food) => (
            <button
              className={selected?.id === food.id ? "food-result selected" : "food-result"}
              key={food.id}
              type="button"
              onClick={() => setSelected(food)}
            >
              <span>
                <strong>{food.name}</strong>
                <small>
                  P {food.protein} · C {food.carbs} · F {food.fat}
                </small>
              </span>
              <span>
                {food.calories_per_100g}
                <small>kcal / 100g</small>
              </span>
            </button>
          ))}
        </div>

        <div className="food-log-controls">
          <div className="control-group">
            <label htmlFor="quantity">Quantity</label>
            <div className="quantity-control">
              <input
                id="quantity"
                type="number"
                min="0.1"
                step={unit === "grams" ? "1" : "0.5"}
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />
              <div className="unit-toggle" aria-label="Quantity unit">
                <button
                  className={unit === "grams" ? "active" : ""}
                  type="button"
                  onClick={() => setUnit("grams")}
                >
                  grams
                </button>
                <button
                  className={unit === "serving" ? "active" : ""}
                  type="button"
                  onClick={() => {
                    setUnit("serving");
                    setQuantity(1);
                  }}
                >
                  serving
                </button>
              </div>
            </div>
          </div>
          <div className="control-group">
            <label htmlFor="meal">Meal</label>
            <select id="meal" value={meal} onChange={(event) => setMeal(event.target.value)}>
              {meals.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        <footer className="food-modal-footer">
          <p>
            <span>{calories}</span> kcal
          </p>
          <button
            className="primary-button"
            type="button"
            disabled={!selected || !quantityInGrams || submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Logging…" : "Log food"}
          </button>
        </footer>
      </section>
    </div>
  );
}

export default FoodSearchModal;
