const BASE = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

function getToken() {
  return localStorage.getItem("amutha_admin_token");
}

async function request(path, { method = "GET", body, isForm = false, auth = false } = {}) {
  const headers = {};
  if (!isForm) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });

  let data = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(data?.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  // Public
  getCategories: () => request("/categories"),
  getItems: () => request("/items"),
  getSettings: () => request("/settings"),

  // Auth
  login: (username, password) =>
    request("/auth/login", { method: "POST", body: { username, password } }),
  me: () => request("/auth/me", { auth: true }),
  changePassword: (currentPassword, newPassword) =>
    request("/auth/change-password", {
      method: "POST",
      auth: true,
      body: { currentPassword, newPassword },
    }),

  // Admin: categories
  createCategory: (payload) => request("/categories", { method: "POST", auth: true, body: payload }),
  updateCategory: (id, payload) => request(`/categories/${id}`, { method: "PUT", auth: true, body: payload }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: "DELETE", auth: true }),
  reorderCategories: (order) => request("/categories/reorder", { method: "POST", auth: true, body: { order } }),

  // Admin: items
  createItem: (formData) => request("/items", { method: "POST", auth: true, isForm: true, body: formData }),
  updateItem: (id, formData) => request(`/items/${id}`, { method: "PUT", auth: true, isForm: true, body: formData }),
  deleteItem: (id) => request(`/items/${id}`, { method: "DELETE", auth: true }),
  setAvailability: (id, is_available) =>
    request(`/items/${id}/availability`, { method: "PATCH", auth: true, body: { is_available } }),
  bulkAvailability: (ids, is_available) =>
    request("/items/bulk-availability", { method: "POST", auth: true, body: { ids, is_available } }),
  moveCategory: (ids, category_id) =>
    request("/items/move-category", { method: "POST", auth: true, body: { ids, category_id } }),

  // Admin: settings
  updateSettings: (formData) => request("/settings", { method: "PUT", auth: true, isForm: true, body: formData }),

  // Admin: stats
  getStats: () => request("/stats", { auth: true }),
};

export function setToken(token) {
  localStorage.setItem("amutha_admin_token", token);
}
export function clearToken() {
  localStorage.removeItem("amutha_admin_token");
}
export { getToken };
