const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', requireAuth, settingsController.get);
router.put('/', requireAuth, requireRole('ceo'), settingsController.update);
router.post('/reset', requireAuth, requireRole('ceo'), settingsController.resetSystem);

module.exports = router;
