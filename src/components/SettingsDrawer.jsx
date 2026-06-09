import { useEffect, useState } from "react";
import WeightSparkline from "./WeightSparkline";
import "./SettingsDrawer.css";

function SettingsDrawer({
  open,
  settings,
  weights,
  onClose,
  onSaveSettings,
  onSaveWeight,
}) {
  const [form, setForm] = useState(settings);
  const [weight, setWeight] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings, open]);

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose, open]);

  if (!open) return null;

  const updateField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submitSettings = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSaveSettings(form);
    } finally {
      setSaving(false);
    }
  };

  const submitWeight = async (event) => {
    event.preventDefault();
    if (!weight) return;
    await onSaveWeight(Number(weight));
    setWeight("");
  };

  return (
    <div className="drawer-layer" role="presentation" onMouseDown={onClose}>
      <aside
        className="settings-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="settings-header">
          <div>
            <p className="eyebrow">Your intentions</p>
            <h2 id="settings-title">Settings</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <form className="settings-form" onSubmit={submitSettings}>
          <section>
            <p className="settings-section-label">Daily energy</p>
            <label className="settings-field" htmlFor="calorie-goal">
              <span>Calorie goal</span>
              <input
                id="calorie-goal"
                type="number"
                min="1"
                value={form.calorie_goal}
                onChange={(event) => updateField("calorie_goal", event.target.value)}
              />
              <small>kcal</small>
            </label>
          </section>

          <section>
            <p className="settings-section-label">Macro targets</p>
            {[
              ["protein_target", "Protein"],
              ["carbs_target", "Carbohydrates"],
              ["fat_target", "Fat"],
            ].map(([key, label]) => (
              <label className="settings-field" htmlFor={key} key={key}>
                <span>{label}</span>
                <input
                  id={key}
                  type="number"
                  min="1"
                  value={form[key]}
                  onChange={(event) => updateField(key, event.target.value)}
                />
                <small>g</small>
              </label>
            ))}
          </section>

          <button className="primary-button" type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save intentions"}
          </button>
        </form>

        <section className="weight-section">
          <p className="settings-section-label">Body weight · 14 days</p>
          <form className="weight-form" onSubmit={submitWeight}>
            <label htmlFor="weight">Today’s weight</label>
            <div>
              <input
                id="weight"
                type="number"
                min="1"
                step="0.1"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
                placeholder="72.5"
              />
              <span>kg</span>
              <button className="secondary-button" type="submit" disabled={!weight}>
                Record
              </button>
            </div>
          </form>
          <WeightSparkline weights={weights} />
        </section>
      </aside>
    </div>
  );
}

export default SettingsDrawer;
