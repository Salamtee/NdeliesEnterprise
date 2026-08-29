import apiFetch from './api.js';
import { setFormError, showToast } from './ui.js';

export async function loadSettings() {
  try {
    const settings = await apiFetch('/settings');
    const checkbox = document.getElementById('maintenance');
    if (checkbox) checkbox.checked = !!settings.maintenanceMode;
  } catch (err) {
    console.error(err);
  }
}

export async function toggleMaintenance() {
  const checkbox = document.getElementById('maintenance');
  const isEnabled = checkbox.checked;
  try {
    await apiFetch('/settings', { method: 'PUT', body: JSON.stringify({ maintenanceMode: isEnabled }) });
    showToast(isEnabled ? 'Maintenance mode enabled' : 'Maintenance mode disabled');
  } catch (err) {
    checkbox.checked = !isEnabled;
    alert(err.message);
  }
}

export async function resetSystem() {
  const confirmed = confirm(
    '⚠️ WARNING: This will permanently clear all sales history and notifications for a new year.\n\n' +
    'Inventory and staff accounts will NOT be affected.\n\n' +
    'This action cannot be undone. Are you absolutely sure?'
  );
  if (!confirmed) return;

  try {
    const res = await apiFetch('/settings/reset', { method: 'POST' });
    showToast(res.message);
  } catch (err) {
    alert(err.message);
  }
}

export async function changePassword() {
  const currentPassword = document.getElementById('current-password-input').value;
  const newPassword = document.getElementById('new-password-input').value;
  const confirmPassword = document.getElementById('confirm-password-input').value;

  if (!currentPassword || !newPassword) {
    setFormError('password-form-error', 'Please fill in all fields');
    return;
  }
  if (newPassword !== confirmPassword) {
    setFormError('password-form-error', 'New passwords do not match');
    return;
  }

  try {
    await apiFetch('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });
    setFormError('password-form-error', '');
    document.getElementById('current-password-input').value = '';
    document.getElementById('new-password-input').value = '';
    document.getElementById('confirm-password-input').value = '';
    showToast('Password updated successfully');
  } catch (err) {
    setFormError('password-form-error', err.message);
  }
}
