import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "@/api";

const DashboardContext = createContext(null);

const dateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function DashboardProvider({ children }) {
  const [date, setDate] = useState(() => dateKey(new Date()));
  const [entries, setEntries] = useState([]);
  const [settings, setSettings] = useState({});
  const [water, setWater] = useState({ total_ml: 0, goal_ml: 3785, glasses: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const refetch = useCallback(async () => {
    try {
      setError("");
      const [nextEntries, nextSettings, nextWater] = await Promise.all([
        api.entries.list(date),
        api.settings.get(),
        api.water.get(date),
      ]);
      setEntries(nextEntries);
      setSettings(nextSettings);
      setWater(nextWater);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    setLoading(true);
    refetch();
  }, [refetch]);

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2000);
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
        settings,
        water,
        loading,
        error,
        toast,
        refetch,
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
