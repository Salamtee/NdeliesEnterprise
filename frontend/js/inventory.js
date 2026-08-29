import apiFetch from './api.js';
import { cache, getUser } from './state.js';
import { formatCurrency, escapeHtml, closeModal, openModal, setFormError, showToast } from './ui.js';
import { loadNotifications } from './notifications.js';

let editingInventoryId = null;

export async function loadCategories() {
  try {
    cache.categories = await apiFetch('/inventory/categories');
  } catch (err) {
    console.error('Failed to load categories', err);
  }
}

export async function loadInventory() {
  try {
    cache.inventory = await apiFetch('/inventory');
    populateCategoryFilter();
    renderInventoryTable();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

export function populateCategoryFilter() {
  const filter = document.getElementById('inventory-category-filter');
  if (!filter) return;
  const current = filter.value || 'all';
  filter.innerHTML =
    '<option value="all">All Categories</option>' +
    cache.categories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
  filter.value = current;
}

export function renderInventoryTable() {
  const tbody = document.getElementById('inventory-table-body');
  if (!tbody) return;

  let items = cache.inventory;
  const filterEl = document.getElementById('inventory-category-filter');
  const filterVal = filterEl ? filterEl.value : 'all';
  if (filterVal && filterVal !== 'all') {
    items = items.filter(i => i.category === filterVal);
  }

  if (items.length === 0) {
    const isCeo = getUser()?.role === 'ceo';
    tbody.innerHTML = `<tr class="empty-row"><td colspan="7">No inventory items yet.${isCeo ? ' Click "Add Item" to get started.' : ''}</td></tr>`;
    return;
  }

  const isCeo = getUser()?.role === 'ceo';
  tbody.innerHTML = items.map(item => {
    const stockBadge = item.quantity < 50
      ? '<span class="badge badge-warning">Low Stock</span>'
      : '<span class="badge badge-success">Good Stock</span>';
    const editBtn = isCeo
      ? `<button class="btn btn-sm btn-outline" onclick="showEditInventoryModal('${item._id}')">Edit</button>`
      : '';
    return `
    <tr>
      <td>${escapeHtml(item.name)}</td>
      <td>${escapeHtml(item.sku)}</td>
      <td>${escapeHtml(item.category)}</td>
      <td>${item.quantity} ${stockBadge}</td>
      <td>${formatCurrency(item.price)}</td>
      <td>${new Date(item.lastRestocked).toLocaleDateString()}</td>
      <td>${editBtn} <button class="btn btn-sm btn-primary" onclick="showRestockModal('${item._id}')">Restock</button></td>
    </tr>`;
  }).join('');
}

function populateNewItemCategoryDropdown() {
  const select = document.getElementById('new-item-category');
  select.innerHTML = cache.categories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
}

export function showAddInventoryModal() {
  if (getUser()?.role !== 'ceo') return;
  editingInventoryId = null;
  document.getElementById('inventoryModalTitle').textContent = 'Add Inventory Item';
  document.getElementById('new-item-name').value = '';
  document.getElementById('new-item-sku').value = '';
  populateNewItemCategoryDropdown();
  document.getElementById('new-item-quantity').value = '';
  document.getElementById('new-item-price').value = '';
  setFormError('inventory-form-error', '');
  openModal('addInventoryModal');
}

export function showEditInventoryModal(id) {
  if (getUser()?.role !== 'ceo') return;
  const item = cache.inventory.find(i => i._id === id);
  if (!item) return;
  editingInventoryId = id;
  document.getElementById('inventoryModalTitle').textContent = 'Edit Inventory Item';
  document.getElementById('new-item-name').value = item.name;
  document.getElementById('new-item-sku').value = item.sku;
  populateNewItemCategoryDropdown();
  document.getElementById('new-item-category').value = item.category;
  document.getElementById('new-item-quantity').value = item.quantity;
  document.getElementById('new-item-price').value = item.price;
  setFormError('inventory-form-error', '');
  openModal('addInventoryModal');
}

export async function saveInventoryItem() {
  const name = document.getElementById('new-item-name').value.trim();
  const sku = document.getElementById('new-item-sku').value.trim();
  const category = document.getElementById('new-item-category').value;
  const quantity = parseInt(document.getElementById('new-item-quantity').value, 10) || 0;
  const price = parseFloat(document.getElementById('new-item-price').value) || 0;

  if (!name || !sku) {
    setFormError('inventory-form-error', 'Please enter a product name and SKU');
    return;
  }

  try {
    if (editingInventoryId) {
      await apiFetch(`/inventory/${editingInventoryId}`, {
        method: 'PUT',
        body: JSON.stringify({ name, sku, category, quantity, price })
      });
      showToast('Item updated');
    } else {
      await apiFetch('/inventory', {
        method: 'POST',
        body: JSON.stringify({ name, sku, category, quantity, price })
      });
      showToast('Item added');
    }
    editingInventoryId = null;
    closeModal('addInventoryModal');
    await loadInventory();
    await loadNotifications();
  } catch (err) {
    setFormError('inventory-form-error', err.message);
  }
}

export function showRestockModal(itemId) {
  const select = document.getElementById('restock-product-select');
  select.innerHTML = cache.inventory
    .map(i => `<option value="${i._id}" ${i._id === itemId ? 'selected' : ''}>${escapeHtml(i.name)} (${i.quantity} in stock)</option>`)
    .join('');
  document.getElementById('restock-quantity-input').value = 50;
  setFormError('restock-form-error', '');
  openModal('restockModal');
}

export async function confirmRestock() {
  const itemId = document.getElementById('restock-product-select').value;
  const qty = parseInt(document.getElementById('restock-quantity-input').value, 10) || 0;

  if (!itemId || qty <= 0) {
    setFormError('restock-form-error', 'Enter a valid quantity');
    return;
  }

  try {
    await apiFetch(`/inventory/${itemId}/restock`, {
      method: 'POST',
      body: JSON.stringify({ quantity: qty })
    });
    showToast('Item restocked');
    closeModal('restockModal');
    await loadInventory();
    await loadNotifications();
  } catch (err) {
    setFormError('restock-form-error', err.message);
  }
}
