const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, notificationController.list);
router.patch('/mark-all-read', requireAuth, notificationController.markAllRead);
router.delete('/', requireAuth, notificationController.clearAll);

module.exports = router;
