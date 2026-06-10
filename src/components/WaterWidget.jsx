import { useDashboard } from "@/context/DashboardContext";
import "@/styles/WaterWidget.css";

function WaterWidget() {
  const { water, addWater, showToast } = useDashboard();
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
        {Array.from({ length: totalGlasses }, (_, index) => (
          <button
            className={index < water.glasses ? "filled" : ""}
            key={index}
            type="button"
            disabled={water.total_ml >= water.goal_ml}
            onClick={logWater}
            aria-label={water.total_ml >= water.goal_ml ? "One gallon complete" : "Add 250 milliliters"}
          />
        ))}
      </div>
      <span>{water.glasses} / {totalGlasses} glasses ({water.total_ml.toLocaleString()} ml)</span>
    </section>
  );
}

export default WaterWidget;
