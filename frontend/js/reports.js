import { cache } from './state.js';
import { formatCurrency, escapeHtml, openModal } from './ui.js';

function dateRangeStart(period) {
  const now = new Date();
  const start = new Date(now);
  if (period === 'daily') {
    start.setHours(0, 0, 0, 0);
  } else if (period === 'weekly') {
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);
  } else if (period === 'monthly') {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
  } else if (period === 'yearly') {
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
  }
  return start;
}

function salesInPeriod(period) {
  const start = dateRangeStart(period);
  return cache.sales.filter(s => new Date(s.date) >= start);
}

function summarize(sales) {
  const revenue = sales.reduce((sum, s) => sum + s.total, 0);
  const items = sales.reduce((sum, s) => sum + s.quantity, 0);
  return { count: sales.length, items, revenue };
}

export function renderReportsSection() {
  const periods = [
    { key: 'daily', label: 'Daily Report', icon: 'fa-calendar-day' },
    { key: 'weekly', label: 'Weekly Report', icon: 'fa-calendar-week' },
    { key: 'monthly', label: 'Monthly Report', icon: 'fa-calendar' },
    { key: 'yearly', label: 'Yearly Report', icon: 'fa-calendar-alt' }
  ];

  const cardsEl = document.getElementById('report-summary-cards');
  cardsEl.innerHTML = periods.map(p => {
    const stats = summarize(salesInPeriod(p.key));
    return `
    <div class="card">
      <div style="text-align: center;">
        <div style="font-size: 28px; color: var(--secondary-color); margin-bottom: 10px;">
          <i class="fas ${p.icon}"></i>
        </div>
        <h3 style="color: var(--heading-text); margin: 0 0 8px;">${p.label}</h3>
        <p style="color: var(--heading-text); font-size: 20px; font-weight: bold; margin: 0;">${formatCurrency(stats.revenue)}</p>
        <p style="color: var(--text-light); font-size: 12px; margin: 4px 0 0;">${stats.count} sale${stats.count === 1 ? '' : 's'} · ${stats.items} item${stats.items === 1 ? '' : 's'} sold</p>
        <button class="btn btn-sm btn-outline" style="margin-top: 10px; width: 100%;" onclick="showReportDetail('${p.key}')">View Report</button>
      </div>
    </div>`;
  }).join('');

  const categoryTotals = {};
  cache.categories.forEach(c => (categoryTotals[c] = 0));
  cache.sales.forEach(s => {
    if (s.category) categoryTotals[s.category] = (categoryTotals[s.category] || 0) + s.total;
  });
  const maxCatTotal = Math.max(1, ...Object.values(categoryTotals));
  const catEntries = Object.entries(categoryTotals);
  document.getElementById('report-category-chart').innerHTML = catEntries.length
    ? catEntries.map(([cat, total]) => `
        <div class="chart-bar">
          <div class="chart-label">${escapeHtml(cat)}</div>
          <div class="chart-bar-bg">
            <div class="chart-bar-fill" style="width: ${Math.max(4, (total / maxCatTotal) * 100)}%;">${formatCurrency(total)}</div>
          </div>
        </div>
      `).join('')
    : '<p style="color: var(--text-light); font-size: 13px;">No categories configured.</p>';

  const staffTotals = {};
  cache.sales.forEach(s => {
    if (!staffTotals[s.staffName]) staffTotals[s.staffName] = { count: 0, items: 0, revenue: 0 };
    staffTotals[s.staffName].count += 1;
    staffTotals[s.staffName].items += s.quantity;
    staffTotals[s.staffName].revenue += s.total;
  });
  const staffRows = Object.entries(staffTotals).sort((a, b) => b[1].revenue - a[1].revenue);
  document.getElementById('report-staff-body').innerHTML = staffRows.length
    ? staffRows.map(([name, t]) => `
        <tr><td>${escapeHtml(name)}</td><td>${t.count}</td><td>${t.items}</td><td>${formatCurrency(t.revenue)}</td></tr>
      `).join('')
    : '<tr><td colspan="4" style="text-align:center; color: var(--text-light);">No sales recorded yet</td></tr>';

  const productTotals = {};
  cache.sales.forEach(s => {
    if (!productTotals[s.product]) productTotals[s.product] = { units: 0, revenue: 0 };
    productTotals[s.product].units += s.quantity;
    productTotals[s.product].revenue += s.total;
  });
  const productRows = Object.entries(productTotals).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 8);
  document.getElementById('report-top-products-body').innerHTML = productRows.length
    ? productRows.map(([name, t]) => `
        <tr><td>${escapeHtml(name)}</td><td>${t.units}</td><td>${formatCurrency(t.revenue)}</td></tr>
      `).join('')
    : '<tr><td colspan="3" style="text-align:center; color: var(--text-light);">No sales recorded yet</td></tr>';

  const totalUnits = cache.inventory.reduce((sum, i) => sum + i.quantity, 0);
  const inventoryValue = cache.inventory.reduce((sum, i) => sum + i.quantity * i.price, 0);
  const lowStockItems = cache.inventory.filter(i => i.quantity < 50);

  document.getElementById('report-total-skus').textContent = cache.inventory.length;
  document.getElementById('report-total-units').textContent = totalUnits.toLocaleString('en-US');
  document.getElementById('report-inventory-value').textContent = formatCurrency(inventoryValue);
  document.getElementById('report-low-stock-count').textContent = lowStockItems.length;
  document.getElementById('report-low-stock-body').innerHTML = lowStockItems.length
    ? lowStockItems.map(i => `
        <tr>
          <td>${escapeHtml(i.name)}</td>
          <td>${escapeHtml(i.category)}</td>
          <td>${i.quantity}</td>
          <td><span class="badge badge-warning">Low Stock</span></td>
        </tr>
      `).join('')
    : '<tr><td colspan="4" style="text-align:center; color: var(--text-light);">All items are well stocked</td></tr>';
}

export function showReportDetail(period) {
  const labels = {
    daily: "Today's Report",
    weekly: "This Week's Report",
    monthly: "This Month's Report",
    yearly: "This Year's Report"
  };
  const sales = salesInPeriod(period);
  const stats = summarize(sales);

  const productTotals = {};
  sales.forEach(s => {
    if (!productTotals[s.product]) productTotals[s.product] = { units: 0, revenue: 0 };
    productTotals[s.product].units += s.quantity;
    productTotals[s.product].revenue += s.total;
  });
  const productRows = Object.entries(productTotals).sort((a, b) => b[1].revenue - a[1].revenue);

  const staffTotals = {};
  sales.forEach(s => {
    if (!staffTotals[s.staffName]) staffTotals[s.staffName] = { count: 0, revenue: 0 };
    staffTotals[s.staffName].count += 1;
    staffTotals[s.staffName].revenue += s.total;
  });
  const staffRows = Object.entries(staffTotals).sort((a, b) => b[1].revenue - a[1].revenue);

  document.getElementById('reportDetailTitle').textContent = labels[period] || 'Report';
  document.getElementById('reportDetailBody').innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
      <div>
        <div class="metric-label">Revenue</div>
        <div class="metric-value" style="font-size: 18px;">${formatCurrency(stats.revenue)}</div>
      </div>
      <div>
        <div class="metric-label">Sales</div>
        <div class="metric-value" style="font-size: 18px;">${stats.count}</div>
      </div>
      <div>
        <div class="metric-label">Items Sold</div>
        <div class="metric-value" style="font-size: 18px;">${stats.items}</div>
      </div>
    </div>
    <p style="font-weight: 600; color: var(--heading-text); margin-bottom: 8px; font-size: 13px;">Breakdown by Product</p>
    <div class="table-container" style="box-shadow: none; margin-bottom: 20px;">
      <table>
        <thead><tr><th>Product</th><th>Units</th><th>Revenue</th></tr></thead>
        <tbody>
          ${productRows.length ? productRows.map(([name, t]) => `
            <tr><td>${escapeHtml(name)}</td><td>${t.units}</td><td>${formatCurrency(t.revenue)}</td></tr>
          `).join('') : '<tr><td colspan="3" style="text-align:center; color: var(--text-light);">No sales in this period</td></tr>'}
        </tbody>
      </table>
    </div>
    <p style="font-weight: 600; color: var(--heading-text); margin-bottom: 8px; font-size: 13px;">Breakdown by Staff</p>
    <div class="table-container" style="box-shadow: none; margin-bottom: 0;">
      <table>
        <thead><tr><th>Staff</th><th># Sales</th><th>Revenue</th></tr></thead>
        <tbody>
          ${staffRows.length ? staffRows.map(([name, t]) => `
            <tr><td>${escapeHtml(name)}</td><td>${t.count}</td><td>${formatCurrency(t.revenue)}</td></tr>
          `).join('') : '<tr><td colspan="3" style="text-align:center; color: var(--text-light);">No sales in this period</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
  openModal('reportDetailModal');
}
