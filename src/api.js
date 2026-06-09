const request = async (path, options = {}) => {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || `Request failed with status ${response.status}.`);
  }

  return response.status === 204 ? null : response.json();
};

export const getFoods = (query = "") =>
  request(`/api/foods?q=${encodeURIComponent(query)}`);
export const getEntries = (date) =>
  request(`/api/entries?date=${encodeURIComponent(date)}`);
export const createEntry = (entry) =>
  request("/api/entries", { method: "POST", body: JSON.stringify(entry) });
export const removeEntry = (id) =>
  request(`/api/entries/${id}`, { method: "DELETE" });
export const getSettings = () => request("/api/settings");
export const saveSettings = (settings) =>
  request("/api/settings", { method: "PUT", body: JSON.stringify(settings) });
export const getWeights = (days = 14) => request(`/api/weight?days=${days}`);
export const saveWeight = (weight) =>
  request("/api/weight", { method: "POST", body: JSON.stringify(weight) });
