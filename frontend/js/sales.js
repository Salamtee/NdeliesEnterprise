import apiFetch from './api.js';
import { cache } from './state.js';
import { formatCurrency, escapeHtml, closeModal, openModal, setFormError } from './ui.js';
import { loadInventory } from './inventory.js';
import { loadNotifications } from './notifications.js';

export async function loadSales() {
  cache.sales = await apiFetch('/sales');
  renderSalesTable();
}

export function renderSalesTable() {
  const tbody = document.getElementById('sales-table-body');
  if (!tbody) return;
  if (cache.sales.length === 0) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="7">No sales recorded yet.</td></tr>';
    return;
  }
  tbody.innerHTML = cache.sales.map(s => `
    <tr>
      <td>${new Date(s.date).toLocaleDateString()}</td>
      <td>${escapeHtml(s.product)}</td>
      <td>${s.quantity}</td>
      <td>${formatCurrency(s.price)}</td>
      <td>${formatCurrency(s.total)}</td>
      <td>${escapeHtml(s.staffName)}</td>
      <td><span class="badge badge-success">${escapeHtml(s.status)}</span></td>
    </tr>
  `).join('');
}

function populateSaleCategoryDropdown() {
  const select = document.getElementById('sale-category-select');
  select.innerHTML = cache.categories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
}

export function populateSaleProductDropdown() {
  const category = document.getElementById('sale-category-select').value;
  const select = document.getElementById('sale-product-select');
  const items = cache.inventory.filter(i => i.category === category);

  if (items.length === 0) {
    select.innerHTML = '<option value="">No items in this category</option>';
  } else {
    select.innerHTML = items
      .map(i => `<option value="${i._id}">${escapeHtml(i.name)} (${i.quantity} in stock)</option>`)
      .join('');
  }
  updateSalePriceField();
}

export function updateSalePriceField() {
  const itemId = document.getElementById('sale-product-select').value;
  const item = cache.inventory.find(i => i._id === itemId);
  document.getElementById('sale-price-input').value = item ? item.price.toFixed(2) : '';
}

export function showAddSalesModal() {
  populateSaleCategoryDropdown();
  populateSaleProductDropdown();
  document.getElementById('sale-quantity-input').value = '';
  setFormError('sales-form-error', '');
  openModal('addSalesModal');
}

export async function confirmSale() {
  const itemId = document.getElementById('sale-product-select').value;
  const quantity = parseInt(document.getElementById('sale-quantity-input').value, 10) || 0;
  const price = parseFloat(document.getElementById('sale-price-input').value) || 0;

  if (!itemId || quantity <= 0) {
    setFormError('sales-form-error', 'Please select a product and enter a valid quantity');
    return;
  }

  try {
    const sale = await apiFetch('/sales', {
      method: 'POST',
      body: JSON.stringify({ itemId, quantity, price })
    });
    closeModal('addSalesModal');
    await loadInventory();
    await loadSales();
    await loadNotifications();
    showIndividualStaffReport(sale);
  } catch (err) {
    setFormError('sales-form-error', err.message);
  }
}

function showIndividualStaffReport(sale) {
  const today = new Date(sale.date).toISOString().slice(0, 10);
  const mySalesToday = cache.sales.filter(
    s => s.staffName === sale.staffName && new Date(s.date).toISOString().slice(0, 10) === today
  );
  const todayTotal = mySalesToday.reduce((sum, s) => sum + s.total, 0);
  const todayItems = mySalesToday.reduce((sum, s) => sum + s.quantity, 0);

  document.getElementById('my-staff-report-body').innerHTML = `
    <p style="margin-bottom: 10px;"><strong>Staff:</strong> ${escapeHtml(sale.staffName)}</p>
    <p style="margin-bottom: 10px;"><strong>This Sale:</strong> ${sale.quantity} x ${escapeHtml(sale.product)} @ ${formatCurrency(sale.price)} = ${formatCurrency(sale.total)}</p>
    <hr style="margin: 15px 0; border: none; border-top: 1px solid var(--border-color);">
    <p style="margin-bottom: 10px;"><strong>Today's Summary (${today})</strong></p>
    <p style="margin-bottom: 5px;">Sales made: ${mySalesToday.length}</p>
    <p style="margin-bottom: 5px;">Items sold: ${todayItems}</p>
    <p style="margin-bottom: 5px;">Total revenue: ${formatCurrency(todayTotal)}</p>
  `;
  openModal('myStaffReportModal');
}
