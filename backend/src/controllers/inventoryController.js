const InventoryItem = require('../models/InventoryItem');
const Notification = require('../models/Notification');
const categories = require('../utils/categories');

// GET /api/inventory
exports.list = async (req, res) => {
  const items = await InventoryItem.find().sort({ name: 1 });
  res.json(items);
};

// GET /api/inventory/categories
exports.categories = async (req, res) => {
  res.json(categories);
};

// POST /api/inventory (CEO only)
exports.create = async (req, res) => {
  try {
    const { name, sku, category, quantity, price } = req.body;
    if (!name || !sku || !category) {
      return res.status(400).json({ message: 'Name, SKU and category are required' });
    }

    const existing = await InventoryItem.findOne({ sku: sku.toUpperCase().trim() });
    if (existing) {
      return res.status(409).json({ message: 'An item with that SKU already exists' });
    }

    const item = await InventoryItem.create({
      name: name.trim(),
      sku: sku.toUpperCase().trim(),
      category,
      quantity: Number(quantity) || 0,
      price: Number(price) || 0,
      lastRestocked: new Date()
    });

    await Notification.create({
      type: 'new-item',
      message: `New item added to inventory: <strong>${item.name}</strong> (${item.sku}) — ${item.quantity} units at NLe ${item.price.toFixed(2)}`
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/inventory/:id (CEO only)
exports.update = async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const { name, sku, category, quantity, price } = req.body;
    if (name) item.name = name.trim();
    if (sku) item.sku = sku.toUpperCase().trim();
    if (category) item.category = category;
    if (quantity !== undefined) item.quantity = Number(quantity);
    if (price !== undefined) item.price = Number(price);

    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/inventory/:id/restock
exports.restock = async (req, res) => {
  try {
    const qty = Number(req.body.quantity);
    if (!qty || qty <= 0) {
      return res.status(400).json({ message: 'Enter a valid quantity to restock' });
    }

    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    item.quantity += qty;
    item.lastRestocked = new Date();
    await item.save();

    await Notification.create({
      type: 'restock',
      message: `<strong>${item.name}</strong> restocked: +${qty} units (new total: ${item.quantity})`
    });

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
