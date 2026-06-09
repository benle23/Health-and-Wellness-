import EntryRow from "./EntryRow";
import "./FoodLog.css";

const meals = ["Breakfast", "Lunch", "Dinner", "Snack"];

function FoodLog({ entries, loading, onDeleteEntry, onLogFood }) {
  return (
    <section className="card food-log">
      <header className="food-log-header">
        <div>
          <p className="eyebrow">Today’s food log</p>
          <h2 className="card-heading">What nourished you.</h2>
        </div>
        <button className="secondary-button" type="button" onClick={onLogFood}>
          Add entry
        </button>
      </header>

      <div className="food-log-list">
        {loading && <p className="empty-copy">Opening today’s journal…</p>}
        {!loading && entries.length === 0 && (
          <div className="empty-state">
            <span>0</span>
            <p>Your day is a blank page.</p>
            <button type="button" onClick={onLogFood}>
              Log the first meal
            </button>
          </div>
        )}
        {meals.map((meal) => {
          const mealEntries = entries.filter((entry) => entry.meal === meal);
          if (!mealEntries.length) return null;
          return (
            <section className="meal-group" key={meal}>
              <div className="meal-heading">
                <h3>{meal}</h3>
                <span>
                  {Math.round(
                    mealEntries.reduce((total, entry) => total + entry.calories, 0),
                  )}{" "}
                  kcal
                </span>
              </div>
              {mealEntries.map((entry) => (
                <EntryRow key={entry.id} entry={entry} onDelete={onDeleteEntry} />
              ))}
            </section>
          );
        })}
      </div>
    </section>
  );
}

export default FoodLog;
