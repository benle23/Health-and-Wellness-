import { api } from "@/api";
import { useDashboard } from "@/context/DashboardContext";
import "@/styles/WaterWidget.css";

function WaterWidget() {
  const { date, water, refetch, setError, showToast } = useDashboard();
  const totalGlasses = Math.ceil(water.goal_ml / 250);

  const addWater = async () => {
    try {
      setError("");
      const next = await api.water.add(date);
      await refetch();
      if (next.total_ml >= next.goal_ml) showToast("One gallon complete");
    } catch (requestError) {
      setError(requestError.message);
    }
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
            onClick={addWater}
            aria-label={water.total_ml >= water.goal_ml ? "One gallon complete" : "Add 250 milliliters"}
          />
        ))}
      </div>
      <span>{water.glasses} / {totalGlasses} glasses</span>
    </section>
  );
}

export default WaterWidget;
