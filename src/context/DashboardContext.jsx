import { createContext, useContext, useEffect, useMemo, useState } from "react";

const DashboardContext = createContext(null);
const ENTRY_KEY = "nourish.manual.entries";
const SETTINGS_KEY = "nourish.manual.settings";
const CALORIE_GOALS_KEY = "nourish.manual.calorie-goals";
const WATER_KEY = "nourish.manual.water";
const WATER_GOAL_ML = 3785;
const GLASS_ML = 250;

const defaultSettings = {
  calorie_goal: 2000,
  protein_goal: 150,
  carbs_goal: 200,
  fat_goal: 65,
  sugar_goal: 50,
};

const dateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const readStored = (key, fallback) => {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const createId = () =>
  globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function DashboardProvider({ children }) {
  const [date, setDate] = useState(() => dateKey(new Date()));
  const [allEntries, setAllEntries] = useState(() => readStored(ENTRY_KEY, []));
  const [settings, setSettings] = useState(() => ({
    ...defaultSettings,
    ...readStored(SETTINGS_KEY, {}),
  }));
  const [calorieGoalsByDate, setCalorieGoalsByDate] = useState(() =>
    readStored(CALORIE_GOALS_KEY, {}),
  );
  const [waterByDate, setWaterByDate] = useState(() => readStored(WATER_KEY, {}));
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    try {
      window.localStorage.setItem(ENTRY_KEY, JSON.stringify(allEntries));
    } catch {
      setError("Entries could not be saved in this browser.");
    }
  }, [allEntries]);

  useEffect(() => {
    try {
      window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      setError("Goals could not be saved in this browser.");
    }
  }, [settings]);

  useEffect(() => {
    try {
      window.localStorage.setItem(CALORIE_GOALS_KEY, JSON.stringify(calorieGoalsByDate));
    } catch {
      setError("Daily calorie goals could not be saved in this browser.");
    }
  }, [calorieGoalsByDate]);

  useEffect(() => {
    try {
      window.localStorage.setItem(WATER_KEY, JSON.stringify(waterByDate));
    } catch {
      setError("Hydration could not be saved in this browser.");
    }
  }, [waterByDate]);

  const entries = useMemo(
    () => allEntries.filter((entry) => entry.date === date),
    [allEntries, date],
  );
  const currentSettings = useMemo(
    () => ({
      ...settings,
      calorie_goal: Number(calorieGoalsByDate[date] || settings.calorie_goal),
    }),
    [calorieGoalsByDate, date, settings],
  );

  const totalWater = Math.min(Number(waterByDate[date] || 0), WATER_GOAL_ML);
  const water = {
    total_ml: totalWater,
    goal_ml: WATER_GOAL_ML,
    glasses: Math.ceil(totalWater / GLASS_ML),
  };

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2000);
  };

  const addEntry = (entry) => {
    const nextEntry = {
      id: createId(),
      date,
      meal: entry.meal,
      name: entry.name.trim(),
      calories: Number(entry.calories),
      protein: Number(entry.protein),
      carbs: Number(entry.carbs),
      fat: Number(entry.fat),
      sugar: Number(entry.sugar),
    };
    setAllEntries((current) => [...current, nextEntry]);
    showToast(`${nextEntry.name} logged`);
    return nextEntry;
  };

  const removeEntry = (id) => {
    setAllEntries((current) => current.filter((entry) => entry.id !== id));
  };

  const addWater = () => {
    setWaterByDate((current) => ({
      ...current,
      [date]: Math.min(Number(current[date] || 0) + GLASS_ML, WATER_GOAL_ML),
    }));
  };

  const removeWater = () => {
    setWaterByDate((current) => ({
      ...current,
      [date]: Math.max(Number(current[date] || 0) - GLASS_ML, 0),
    }));
  };

  const updateSettings = (nextSettings) => {
    setSettings((current) => ({
      ...current,
      protein_goal: Number(nextSettings.protein_goal),
      carbs_goal: Number(nextSettings.carbs_goal),
      fat_goal: Number(nextSettings.fat_goal),
      sugar_goal: Number(nextSettings.sugar_goal),
    }));
    setCalorieGoalsByDate((current) => ({
      ...current,
      [date]: Number(nextSettings.calorie_goal),
    }));
    showToast("Goals updated");
  };

  const moveDate = (days) => {
    const next = new Date(`${date}T12:00:00`);
    next.setDate(next.getDate() + days);
    setDate(dateKey(next));
  };

  return (
    <DashboardContext.Provider
      value={{
        date,
        entries,
        allEntries,
        settings: currentSettings,
        water,
        error,
        toast,
        addEntry,
        removeEntry,
        addWater,
        removeWater,
        updateSettings,
        setError,
        setDate,
        moveDate,
        showToast,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => useContext(DashboardContext);
