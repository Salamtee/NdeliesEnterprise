const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth, requireRole('ceo'));

router.get('/', staffController.list);
router.post('/', staffController.create);
router.put('/:id', staffController.update);
router.delete('/:id', staffController.remove);

module.exports = router;
