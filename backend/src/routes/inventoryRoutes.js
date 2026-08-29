const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', requireAuth, inventoryController.list);
router.get('/categories', requireAuth, inventoryController.categories);
router.post('/', requireAuth, requireRole('ceo'), inventoryController.create);
router.put('/:id', requireAuth, requireRole('ceo'), inventoryController.update);
router.post('/:id/restock', requireAuth, inventoryController.restock);

module.exports = router;
