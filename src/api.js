const BASE = "/api";

async function req(method, path, body) {
  const response = await fetch(BASE + path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`${method} ${path} → ${response.status}: ${error}`);
  }
  return response.json();
}

export const api = {
  foods: {
    search: (query) =>
      req("GET", query ? `/foods?q=${encodeURIComponent(query)}` : "/foods"),
  },
  entries: {
    list: (date) => req("GET", `/entries?date=${date}`),
    add: (entry) => req("POST", "/entries", entry),
    remove: (id) => req("DELETE", `/entries/${id}`),
  },
  settings: {
    get: () => req("GET", "/settings"),
    update: (data) => req("PUT", "/settings", data),
  },
  water: {
    get: (date) => req("GET", `/water?date=${date}`),
    add: (date) => req("POST", "/water", { amount_ml: 250, date }),
  },
};
