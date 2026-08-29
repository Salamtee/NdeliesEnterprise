const InventoryItem = require('../models/InventoryItem');
const Sale = require('../models/Sale');
const Notification = require('../models/Notification');

const LOW_STOCK_THRESHOLD = 50;

// GET /api/sales
exports.list = async (req, res) => {
  const sales = await Sale.find().sort({ date: -1 });
  res.json(sales);
};

// POST /api/sales
exports.create = async (req, res) => {
  try {
    const { itemId, quantity, price } = req.body;
    const qty = Number(quantity);

    if (!itemId || !qty || qty <= 0) {
      return res.status(400).json({ message: 'Select a product and enter a valid quantity' });
    }

    const item = await InventoryItem.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    if (qty > item.quantity) {
      return res.status(400).json({ message: 'Not enough stock available for this sale' });
    }

    const unitPrice = price !== undefined && price !== null && price !== ''
      ? Number(price)
      : item.price;
    const total = qty * unitPrice;

    item.quantity -= qty;
    await item.save();

    const sale = await Sale.create({
      item: item._id,
      product: item.name,
      sku: item.sku,
      category: item.category,
      quantity: qty,
      price: unitPrice,
      total,
      staff: req.user._id,
      staffName: req.user.name,
      date: new Date(),
      status: 'Completed'
    });

    await Notification.create({
      type: 'sale',
      message: `${req.user.name} sold ${qty} x <strong>${item.name}</strong> for NLe ${total.toFixed(2)}`
    });

    if (item.quantity < LOW_STOCK_THRESHOLD) {
      await Notification.create({
        type: 'low-stock',
        message: `<strong>${item.name}</strong> is running low (${item.quantity} units left) — consider restocking`
      });
    }

    res.status(201).json(sale);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
