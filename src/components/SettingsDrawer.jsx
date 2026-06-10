import { useEffect, useState } from "react";
import { useDashboard } from "@/context/DashboardContext";
import "@/styles/SettingsDrawer.css";

function SettingsDrawer({ onClose }) {
  const { settings, updateSettings } = useDashboard();
  const [form, setForm] = useState(settings);

  useEffect(() => setForm(settings), [settings]);

  const save = (event) => {
    event.preventDefault();
    updateSettings(form);
    onClose();
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
          ["fat_goal", "Fat", "g"],
          ["sugar_goal", "Sugar", "g"],
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
        <button className="save-settings" type="submit">Save goals</button>
      </form>
    </section>
  );
}

export default SettingsDrawer;
