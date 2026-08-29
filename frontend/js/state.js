const TOKEN_KEY = 'ndelies_token';
const USER_KEY = 'ndelies_user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// In-memory caches - refetched from the API on load/refresh, not persisted.
export const cache = {
  categories: [],
  inventory: [],
  sales: [],
  staff: [],
  notifications: []
};
