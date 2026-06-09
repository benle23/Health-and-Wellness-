import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createEntry,
  getEntries,
  getSettings,
  getWeights,
  removeEntry,
  saveSettings,
  saveWeight,
} from "./api";
import { getWeekDates, toDateKey } from "./date";
import FoodSearchModal from "./components/FoodSearchModal";
import MainGrid from "./components/MainGrid";
import SettingsDrawer from "./components/SettingsDrawer";
import Sidebar from "./components/Sidebar";

const defaultSettings = {
  calorie_goal: 2000,
  protein_target: 140,
  carbs_target: 220,
  fat_target: 65,
};

function App() {
  const [entries, setEntries] = useState([]);
  const [settings, setSettings] = useState(defaultSettings);
  const [weeklyData, setWeeklyData] = useState([]);
  const [weights, setWeights] = useState([]);
  const [foodModalOpen, setFoodModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const today = toDateKey();

  const loadDashboard = useCallback(async () => {
    try {
      setError("");
      const dates = getWeekDates();
      const [todayEntries, savedSettings, weightHistory, ...weekEntries] =
        await Promise.all([
          getEntries(today),
          getSettings(),
          getWeights(14),
          ...dates.map((date) => getEntries(date)),
        ]);

      setEntries(todayEntries);
      setSettings({ ...defaultSettings, ...savedSettings });
      setWeights(weightHistory);
      setWeeklyData(
        dates.map((date, index) => ({
          date,
          calories: weekEntries[index].reduce(
            (total, entry) => total + entry.calories,
            0,
          ),
        })),
      );
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [today]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const totals = useMemo(
    () =>
      entries.reduce(
        (summary, entry) => ({
          calories: summary.calories + entry.calories,
          protein: summary.protein + entry.protein_total,
          carbs: summary.carbs + entry.carbs_total,
          fat: summary.fat + entry.fat_total,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 },
      ),
    [entries],
  );

  const handleLogEntry = async (entry) => {
    try {
      setError("");
      const createdEntry = await createEntry({
        ...entry,
        logged_at: `${today}T12:00:00.000Z`,
      });
      setEntries((current) => [...current, createdEntry]);
      setWeeklyData((current) =>
        current.map((day) =>
          day.date === today
            ? { ...day, calories: day.calories + createdEntry.calories }
            : day,
        ),
      );
      setFoodModalOpen(false);
    } catch (entryError) {
      setError(entryError.message);
    }
  };

  const handleDeleteEntry = async (id) => {
    try {
      setError("");
      await removeEntry(id);
      await loadDashboard();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  const handleSaveSettings = async (nextSettings) => {
    try {
      setError("");
      const saved = await saveSettings(nextSettings);
      setSettings(saved);
      setSettingsOpen(false);
    } catch (settingsError) {
      setError(settingsError.message);
    }
  };

  const handleSaveWeight = async (weight) => {
    try {
      setError("");
      await saveWeight({ weight_kg: weight, logged_at: today });
      setWeights(await getWeights(14));
    } catch (weightError) {
      setError(weightError.message);
    }
  };

  const openFoodModal = () => {
    setSettingsOpen(false);
    setFoodModalOpen(true);
  };

  const openSettings = () => {
    setFoodModalOpen(false);
    setSettingsOpen(true);
  };

  return (
    <div className="app-shell">
      <Sidebar
        totals={totals}
        settings={settings}
        onLogFood={openFoodModal}
        onOpenSettings={openSettings}
      />
      <MainGrid
        entries={entries}
        loading={loading}
        totals={totals}
        settings={settings}
        weeklyData={weeklyData}
        onDeleteEntry={handleDeleteEntry}
        onLogFood={openFoodModal}
      />
      <FoodSearchModal
        open={foodModalOpen}
        onClose={() => setFoodModalOpen(false)}
        onLog={handleLogEntry}
      />
      <SettingsDrawer
        open={settingsOpen}
        settings={settings}
        weights={weights}
        onClose={() => setSettingsOpen(false)}
        onSaveSettings={handleSaveSettings}
        onSaveWeight={handleSaveWeight}
      />
      {error && (
        <button className="error-toast" type="button" onClick={() => setError("")}>
          {error}
        </button>
      )}
    </div>
  );
}

export default App;
