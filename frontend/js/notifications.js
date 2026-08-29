import apiFetch from './api.js';
import { cache } from './state.js';
import { timeAgo } from './ui.js';

const NOTIF_ICONS = {
  'sale': 'fa-shopping-cart',
  'restock': 'fa-boxes',
  'new-item': 'fa-plus',
  'low-stock': 'fa-exclamation-triangle'
};

export async function loadNotifications() {
  try {
    cache.notifications = await apiFetch('/notifications');
    updateNotifBadges();
    renderNotifDropdown();
  } catch (err) {
    console.error('Failed to load notifications', err);
  }
}

function updateNotifBadges() {
  const unread = cache.notifications.filter(n => !n.read).length;
  const topBadge = document.getElementById('notif-badge');
  const sideBadge = document.getElementById('sidebar-notif-badge');
  const bellBtn = document.getElementById('notif-bell-btn');

  [topBadge, sideBadge].forEach(badge => {
    if (!badge) return;
    if (unread > 0) {
      badge.textContent = unread > 99 ? '99+' : unread;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  });

  if (bellBtn) bellBtn.classList.toggle('has-unread', unread > 0);
}

function renderNotifDropdown() {
  const body = document.getElementById('notif-dropdown-body');
  if (!body) return;
  const recent = cache.notifications.slice(0, 8);
  if (recent.length === 0) {
    body.innerHTML = '<div class="notif-empty">No notifications yet</div>';
    return;
  }
  body.innerHTML = recent.map(n => `
    <div class="notif-item ${n.read ? '' : 'unread'}">
      <div class="notif-icon ${n.type}"><i class="fas ${NOTIF_ICONS[n.type] || 'fa-bell'}"></i></div>
      <div class="notif-text">
        <div class="notif-message">${n.message}</div>
        <div class="notif-time">${timeAgo(n.createdAt)}</div>
      </div>
    </div>
  `).join('');
}

export function renderNotificationsSection() {
  const container = document.getElementById('notifications-list-container');
  if (!container) return;
  if (cache.notifications.length === 0) {
    container.innerHTML = '<div class="notif-empty" style="padding: 40px;">No notifications yet. Activity like new sales, restocks and new inventory items will show up here.</div>';
    return;
  }
  container.innerHTML = cache.notifications.map(n => `
    <div class="notif-list-item ${n.read ? '' : 'unread'}">
      <div class="notif-icon ${n.type}"><i class="fas ${NOTIF_ICONS[n.type] || 'fa-bell'}"></i></div>
      <div class="notif-text">
        <div class="notif-message">${n.message}</div>
        <div class="notif-time">${timeAgo(n.createdAt)}</div>
      </div>
    </div>
  `).join('');
}

export function toggleNotifDropdown(evt) {
  if (evt) evt.stopPropagation();
  const dropdown = document.getElementById('notif-dropdown');
  const isOpening = !dropdown.classList.contains('active');
  dropdown.classList.toggle('active');
  if (isOpening) renderNotifDropdown();
}

export function closeNotifDropdown() {
  const dropdown = document.getElementById('notif-dropdown');
  if (dropdown) dropdown.classList.remove('active');
}

export async function markAllNotificationsRead() {
  try {
    await apiFetch('/notifications/mark-all-read', { method: 'PATCH' });
    cache.notifications.forEach(n => (n.read = true));
    updateNotifBadges();
    renderNotifDropdown();
    renderNotificationsSection();
  } catch (err) {
    console.error(err);
  }
}

export async function clearAllNotifications() {
  if (!confirm('Clear all notifications? This cannot be undone.')) return;
  try {
    await apiFetch('/notifications', { method: 'DELETE' });
    cache.notifications = [];
    updateNotifBadges();
    renderNotifDropdown();
    renderNotificationsSection();
  } catch (err) {
    console.error(err);
  }
}
