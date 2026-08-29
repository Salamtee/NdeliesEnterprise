import apiFetch from './api.js';
import { cache } from './state.js';
import { getInitials, escapeHtml, closeModal, openModal, setFormError, showToast } from './ui.js';

let editingStaffId = null;

export async function loadStaff() {
  cache.staff = await apiFetch('/staff');
  renderStaffTable();
  const countEl = document.getElementById('staff-count');
  if (countEl) countEl.textContent = cache.staff.length;
}

export function renderStaffTable() {
  const tbody = document.getElementById('staff-table');
  if (!tbody) return;
  if (cache.staff.length === 0) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="3">No staff members yet. Click "Add Staff Member" to get started.</td></tr>';
    return;
  }
  tbody.innerHTML = cache.staff.map(s => `
    <tr>
      <td>
        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="staff-avatar">${getInitials(s.name)}</div>
          <div>
            <div>${escapeHtml(s.name)}</div>
            <div style="font-size: 11px; color: var(--text-light);">@${escapeHtml(s.username)}</div>
          </div>
        </div>
      </td>
      <td><span class="badge ${s.status === 'Active' ? 'badge-success' : 'badge-danger'}">${s.status}</span></td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="editStaff('${s._id}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="removeStaff('${s._id}')">Remove</button>
      </td>
    </tr>
  `).join('');
}

export function showAddStaffModal() {
  editingStaffId = null;
  document.getElementById('staffModalTitle').textContent = 'Add Staff Member';
  document.getElementById('staff-name-input').value = '';
  document.getElementById('staff-username-input').value = '';
  document.getElementById('staff-username-input').disabled = false;
  document.getElementById('staff-password-input').value = '';
  document.getElementById('staff-password-input').placeholder = 'Set a password';
  document.getElementById('staff-status-field').style.display = 'none';
  setFormError('staff-form-error', '');
  openModal('addStaffModal');
}

export function editStaff(id) {
  const s = cache.staff.find(st => st._id === id);
  if (!s) return;
  editingStaffId = id;
  document.getElementById('staffModalTitle').textContent = 'Edit Staff Member';
  document.getElementById('staff-name-input').value = s.name;
  document.getElementById('staff-username-input').value = s.username;
  document.getElementById('staff-username-input').disabled = true;
  document.getElementById('staff-password-input').value = '';
  document.getElementById('staff-password-input').placeholder = 'Leave blank to keep current password';
  document.getElementById('staff-status-field').style.display = 'block';
  document.getElementById('staff-status-select').value = s.status;
  setFormError('staff-form-error', '');
  openModal('addStaffModal');
}

export async function saveStaff() {
  const name = document.getElementById('staff-name-input').value.trim();
  const username = document.getElementById('staff-username-input').value.trim();
  const password = document.getElementById('staff-password-input').value.trim();

  if (!name || !username) {
    setFormError('staff-form-error', 'Please enter a name and username');
    return;
  }
  if (!editingStaffId && !password) {
    setFormError('staff-form-error', 'Please set a password');
    return;
  }

  try {
    if (editingStaffId) {
      const payload = { name, status: document.getElementById('staff-status-select').value };
      if (password) payload.password = password;
      await apiFetch(`/staff/${editingStaffId}`, { method: 'PUT', body: JSON.stringify(payload) });
      showToast('Staff member updated');
    } else {
      await apiFetch('/staff', { method: 'POST', body: JSON.stringify({ name, username, password }) });
      showToast('Staff member added');
    }
    editingStaffId = null;
    closeModal('addStaffModal');
    await loadStaff();
  } catch (err) {
    setFormError('staff-form-error', err.message);
  }
}

export async function removeStaff(id) {
  if (!confirm('Remove this staff member? This cannot be undone.')) return;
  try {
    await apiFetch(`/staff/${id}`, { method: 'DELETE' });
    await loadStaff();
    showToast('Staff member removed');
  } catch (err) {
    alert(err.message);
  }
}
