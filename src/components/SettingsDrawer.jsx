import { useEffect, useState } from "react";
import { api } from "@/api";
import { useDashboard } from "@/context/DashboardContext";
import "@/styles/SettingsDrawer.css";

function SettingsDrawer({ onClose }) {
  const { settings, refetch, setError, showToast } = useDashboard();
  const [form, setForm] = useState(settings);
  const [busy, setBusy] = useState(false);

  useEffect(() => setForm(settings), [settings]);

  const save = async (event) => {
    event.preventDefault();
    try {
      setBusy(true);
      setError("");
      await api.settings.update(form);
      await refetch();
      showToast("Goals updated");
      onClose();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="settings-drawer">
      <header>
        <div>
          <p className="eyebrow">Daily intentions</p>
          <h2>Settings</h2>
        </div>
        <button type="button" onClick={onClose}>Close</button>
      </header>
      <form onSubmit={save}>
        {[
          ["calorie_goal", "Calories", "kcal"],
          ["protein_goal", "Protein", "g"],
          ["carbs_goal", "Carbs", "g"],
          ["fat_goal", "Fat", "g"],
          ["water_goal_ml", "Water", "ml"],
        ].map(([key, label, unit]) => (
          <label key={key}>
            <span>{label}</span>
            <input
              type="number"
              min="1"
              value={form[key] || ""}
              onChange={(event) => setForm((current) => ({ ...current, [key]: Number(event.target.value) }))}
            />
            <small>{unit}</small>
          </label>
        ))}
        <button className="save-settings" type="submit" disabled={busy}>{busy ? "Saving…" : "Save goals"}</button>
      </form>
    </section>
  );
}

export default SettingsDrawer;
