import { API_BASE_URL } from './config.js';
import { getToken, clearSession } from './state.js';

export default async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch (networkErr) {
    throw new Error('Could not reach the server. Check your connection or try again shortly.');
  }

  let data = null;
  try {
    data = await res.json();
  } catch (parseErr) {
    // No JSON body - fine for some responses
  }

  // Only treat 401 as "session expired" for authenticated requests.
  // During login itself, a 401 just means wrong credentials — don't
  // kick the user back to the landing page.
  if (res.status === 401 && !path.includes('/auth/login')) {
    clearSession();
    window.dispatchEvent(new CustomEvent('ndelies:session-expired'));
  }

  if (!res.ok) {
    const message = (data && data.message) || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
}
