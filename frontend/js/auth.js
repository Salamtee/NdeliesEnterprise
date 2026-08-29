import apiFetch from './api.js';
import { setSession, clearSession } from './state.js';
import { setFormError } from './ui.js';

let pendingRole = 'ceo';

export function goToLogin() {
  document.getElementById('public-landing').classList.remove('active');
  document.getElementById('login-section').style.display = 'flex';
}

export function backToLanding() {
  document.getElementById('login-section').style.display = 'none';
  document.getElementById('public-landing').classList.add('active');
}

export function selectRole(role, evt) {
  document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('active'));
  if (evt && evt.currentTarget) evt.currentTarget.classList.add('active');
  pendingRole = role;

  if (role === 'ceo') {
    document.getElementById('ceo-login-fields').style.display = 'block';
    document.getElementById('staff-login-fields').style.display = 'none';
  } else {
    document.getElementById('ceo-login-fields').style.display = 'none';
    document.getElementById('staff-login-fields').style.display = 'block';
    populateStaffLoginDropdown();
  }
}

async function populateStaffLoginDropdown() {
  const select = document.getElementById('staff-name-select');
  select.innerHTML = '<option>Loading...</option>';
  try {
    const staff = await apiFetch('/auth/staff-list');
    if (staff.length === 0) {
      select.innerHTML = '<option value="">No staff accounts yet - ask your CEO to add you</option>';
      return;
    }
    select.innerHTML = staff.map(s => `<option value="${s.username}">${s.name}</option>`).join('');
  } catch (err) {
    select.innerHTML = '<option value="">Could not load staff list</option>';
  }
}

export async function login() {
  setFormError('login-form-error', '');
  let username, password;

  if (pendingRole === 'ceo') {
    username = document.getElementById('username').value.trim();
    password = document.getElementById('password').value;
  } else {
    username = document.getElementById('staff-name-select').value;
    password = document.getElementById('staff-password').value;
  }

  if (!username || !password) {
    setFormError('login-form-error', 'Please fill in all fields');
    return;
  }

  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    setSession(data.token, data.user);
    window.dispatchEvent(new CustomEvent('ndelies:login-success'));
  } catch (err) {
    setFormError('login-form-error', err.message);
  }
}

export function logout() {
  if (confirm('Are you sure you want to logout?')) {
    clearSession();
    window.dispatchEvent(new CustomEvent('ndelies:logout'));
  }
}
