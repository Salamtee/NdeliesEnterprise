const Notification = require('../models/Notification');

// GET /api/notifications
exports.list = async (req, res) => {
  const notifications = await Notification.find().sort({ createdAt: -1 }).limit(200);
  res.json(notifications);
};

// PATCH /api/notifications/mark-all-read
exports.markAllRead = async (req, res) => {
  await Notification.updateMany({ read: false }, { $set: { read: true } });
  res.json({ message: 'All notifications marked as read' });
};

// DELETE /api/notifications
exports.clearAll = async (req, res) => {
  await Notification.deleteMany({});
  res.json({ message: 'All notifications cleared' });
};
