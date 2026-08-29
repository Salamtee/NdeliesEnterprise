import { cache, getUser } from './state.js';
import { formatCurrency, escapeHtml } from './ui.js';

export function renderDashboard() {
  const totalRevenue = cache.sales.reduce((sum, s) => sum + s.total, 0);
  const totalInventoryUnits = cache.inventory.reduce((sum, i) => sum + i.quantity, 0);
  const lowStockCount = cache.inventory.filter(i => i.quantity < 50).length;

  const revenueEl = document.getElementById('dash-total-sales');
  if (revenueEl) revenueEl.textContent = formatCurrency(totalRevenue);

  const invEl = document.getElementById('dash-inventory-items');
  if (invEl) invEl.textContent = totalInventoryUnits.toLocaleString('en-US');

  const staffEl = document.getElementById('dash-staff-count');
  if (staffEl) staffEl.textContent = getUser()?.role === 'ceo' ? cache.staff.length : '—';

  const lowStockEl = document.getElementById('dash-low-stock-count');
  if (lowStockEl) lowStockEl.textContent = lowStockCount;

  renderStockTable();
  renderCategoryChart();
}

function renderStockTable() {
  const tbody = document.getElementById('dashboard-stock-table');
  if (!tbody) return;
  const items = [...cache.inventory].sort((a, b) => a.quantity - b.quantity).slice(0, 5);

  if (items.length === 0) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="4">No inventory items yet.</td></tr>';
    return;
  }

  tbody.innerHTML = items.map(item => {
    const badge = item.quantity < 50
      ? '<span class="badge badge-warning">Low Stock</span>'
      : '<span class="badge badge-success">Good Stock</span>';
    return `
    <tr>
      <td>${escapeHtml(item.name)}</td>
      <td>${item.quantity} units</td>
      <td>${badge}</td>
      <td><button class="btn btn-sm btn-primary" onclick="showRestockModal('${item._id}')">Restock</button></td>
    </tr>`;
  }).join('');
}

function renderCategoryChart() {
  const el = document.getElementById('dashboard-category-chart');
  if (!el) return;

  const totals = {};
  cache.categories.forEach(c => (totals[c] = 0));
  cache.sales.forEach(s => {
    if (s.category) totals[s.category] = (totals[s.category] || 0) + s.total;
  });

  const entries = Object.entries(totals);
  if (entries.length === 0) {
    el.innerHTML = '<p style="color: var(--text-light); font-size: 13px;">No sales data yet.</p>';
    return;
  }

  const max = Math.max(1, ...Object.values(totals));
  el.innerHTML = entries.map(([cat, total]) => `
    <div class="chart-bar">
      <div class="chart-label">${escapeHtml(cat)}</div>
      <div class="chart-bar-bg">
        <div class="chart-bar-fill" style="width: ${Math.max(4, (total / max) * 100)}%;">${formatCurrency(total)}</div>
      </div>
    </div>
  `).join('');
}
