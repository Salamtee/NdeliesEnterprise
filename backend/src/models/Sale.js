const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
    product: { type: String, required: true },
    sku: { type: String },
    category: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    staffName: { type: String, required: true },
    date: { type: Date, default: Date.now },
    status: { type: String, default: 'Completed' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Sale', saleSchema);
