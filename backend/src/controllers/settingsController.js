const Settings = require('../models/Settings');
const Sale = require('../models/Sale');
const Notification = require('../models/Notification');

async function getOrCreateSettings() {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({ maintenanceMode: false });
  }
  return settings;
}

// GET /api/settings
exports.get = async (req, res) => {
  const settings = await getOrCreateSettings();
  res.json(settings);
};

// PUT /api/settings (CEO only)
exports.update = async (req, res) => {
  const settings = await getOrCreateSettings();
  if (typeof req.body.maintenanceMode === 'boolean') {
    settings.maintenanceMode = req.body.maintenanceMode;
  }
  await settings.save();
  res.json(settings);
};

// POST /api/settings/reset (CEO only)
// Clears sales history and notifications for a fresh financial year.
// Inventory and staff accounts are left untouched.
exports.resetSystem = async (req, res) => {
  await Sale.deleteMany({});
  await Notification.deleteMany({});
  res.json({
    message: 'Sales history and notifications cleared for the new year. Inventory and staff accounts were left untouched.'
  });
};
