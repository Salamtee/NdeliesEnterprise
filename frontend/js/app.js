import { initTheme, toggleTheme } from './theme.js';
import { getUser, getToken } from './state.js';
import { closeModal, getInitials } from './ui.js';
import * as auth from './auth.js';
import * as inventoryMod from './inventory.js';
import * as salesMod from './sales.js';
import * as staffMod from './staff.js';
import * as notificationsMod from './notifications.js';
import * as reportsMod from './reports.js';
import * as settingsMod from './settings.js';
import { renderDashboard } from './dashboard.js';

const SECTION_TITLES = {
  dashboard: 'Dashboard',
  staff: 'Manage Staff',
  inventory: 'Inventory Management',
  sales: 'Sales Management',
  notifications: 'Notifications',
  reports: 'Sales Reports',
  settings: 'System Settings'
};

function showSectionByName(section) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(section);
  if (el) el.classList.add('active');

  const titleEl = document.getElementById('page-title');
  if (titleEl) titleEl.textContent = SECTION_TITLES[section] || '';

  if (section === 'notifications') {
    notificationsMod.renderNotificationsSection();
    notificationsMod.markAllNotificationsRead();
  }
  if (section === 'reports') {
    reportsMod.renderReportsSection();
  }
}

function activateNavLink(section) {
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
  const link = document.querySelector(`.nav-link[data-section="${section}"]`);
  if (link) link.classList.add('active');
}

function showSection(section, evt) {
  if (evt) evt.preventDefault();
  showSectionByName(section);
  activateNavLink(section);
}

function openNotificationsSection() {
  notificationsMod.closeNotifDropdown();
  showSectionByName('notifications');
  activateNavLink('notifications');
}

// ---------- App bootstrap ----------
async function enterApp() {
  const user = getUser();
  if (!user) return;

  document.getElementById('login-section').style.display = 'none';
  document.getElementById('public-landing').classList.remove('active');
  document.getElementById('main-app').style.display = 'flex';

  document.getElementById('user-name').textContent = user.name;
  document.getElementById('user-role').textContent = user.role.toUpperCase();
  document.getElementById('user-avatar').textContent = getInitials(user.name);

  const isCeo = user.role === 'ceo';
  document.getElementById('staff-nav').style.display = isCeo ? 'block' : 'none';
  document.getElementById('settings-nav').style.display = isCeo ? 'block' : 'none';
  document.getElementById('add-inventory-btn').style.display = isCeo ? 'inline-flex' : 'none';

  try {
    await inventoryMod.loadCategories();
    await Promise.all([
      inventoryMod.loadInventory(),
      salesMod.loadSales(),
      notificationsMod.loadNotifications(),
      settingsMod.loadSettings(),
      isCeo ? staffMod.loadStaff() : Promise.resolve()
    ]);
  } catch (err) {
    console.error('Failed to load initial data', err);
  }

  renderDashboard();
  showSectionByName('dashboard');
  activateNavLink('dashboard');
}

function exitApp() {
  document.getElementById('main-app').style.display = 'none';
  const usernameEl = document.getElementById('username');
  const passwordEl = document.getElementById('password');
  const staffPasswordEl = document.getElementById('staff-password');
  if (usernameEl) usernameEl.value = '';
  if (passwordEl) passwordEl.value = '';
  if (staffPasswordEl) staffPasswordEl.value = '';
  document.getElementById('login-section').style.display = 'none';
  document.getElementById('public-landing').classList.add('active');
}

// ---------- Global listeners ----------
window.addEventListener('ndelies:login-success', enterApp);
window.addEventListener('ndelies:logout', exitApp);
window.addEventListener('ndelies:session-expired', () => {
  exitApp();
});

document.addEventListener('click', e => {
  const wrapper = document.querySelector('.notif-wrapper');
  if (wrapper && !wrapper.contains(e.target)) {
    notificationsMod.closeNotifDropdown();
  }
});

window.addEventListener('click', event => {
  if (event.target.classList && event.target.classList.contains('modal')) {
    event.target.classList.remove('active');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  if (getToken() && getUser()) {
    enterApp();
  }
});

// ---------- Expose functions for inline onclick= handlers in index.html ----------
window.goToLogin = auth.goToLogin;
window.backToLanding = auth.backToLanding;
window.selectRole = (role, evt) => auth.selectRole(role, evt || window.event);
window.login = auth.login;
window.logout = auth.logout;

window.showSection = (section, evt) => showSection(section, evt || window.event);
window.openNotificationsSection = openNotificationsSection;

window.toggleTheme = toggleTheme;
window.closeModal = closeModal;

window.showAddInventoryModal = inventoryMod.showAddInventoryModal;
window.showEditInventoryModal = inventoryMod.showEditInventoryModal;
window.saveInventoryItem = inventoryMod.saveInventoryItem;
window.showRestockModal = inventoryMod.showRestockModal;
window.confirmRestock = inventoryMod.confirmRestock;
window.renderInventoryTable = inventoryMod.renderInventoryTable;

window.showAddSalesModal = salesMod.showAddSalesModal;
window.populateSaleProductDropdown = salesMod.populateSaleProductDropdown;
window.updateSalePriceField = salesMod.updateSalePriceField;
window.confirmSale = salesMod.confirmSale;

window.showAddStaffModal = staffMod.showAddStaffModal;
window.editStaff = staffMod.editStaff;
window.saveStaff = staffMod.saveStaff;
window.removeStaff = staffMod.removeStaff;

window.toggleNotifDropdown = notificationsMod.toggleNotifDropdown;
window.markAllNotificationsRead = notificationsMod.markAllNotificationsRead;
window.clearAllNotifications = notificationsMod.clearAllNotifications;

window.showReportDetail = reportsMod.showReportDetail;

window.toggleMaintenance = settingsMod.toggleMaintenance;
window.resetSystem = settingsMod.resetSystem;
window.changePassword = settingsMod.changePassword;
