import { useDashboard } from "@/context/DashboardContext";
import "@/styles/WaterWidget.css";

function WaterWidget() {
  const { water, addWater, removeWater, showToast } = useDashboard();
  const totalGlasses = Math.ceil(water.goal_ml / 250);

  const logWater = () => {
    addWater();
    if (water.total_ml + 250 >= water.goal_ml) showToast("One gallon complete");
  };

  return (
    <section className="water-widget">
      <header>
        <div>
          <p className="eyebrow">Hydration</p>
          <h2>One gallon intention</h2>
        </div>
        <strong>{water.total_ml.toLocaleString()} / {water.goal_ml.toLocaleString()} ml</strong>
      </header>
      <div className="water-glasses">
        {Array.from({ length: totalGlasses }, (_, index) => {
          const filled = index < water.glasses;
          return (
            <button
              className={filled ? "filled" : ""}
              key={index}
              type="button"
              onClick={filled ? removeWater : logWater}
              aria-label={filled ? "Remove 250 milliliters" : "Add 250 milliliters"}
              title={filled ? "Remove one glass" : "Add one glass"}
            />
          );
        })}
      </div>
      <span>{water.glasses} / {totalGlasses} glasses ({water.total_ml.toLocaleString()} ml) · tap a filled glass to remove</span>
    </section>
  );
}

export default WaterWidget;
