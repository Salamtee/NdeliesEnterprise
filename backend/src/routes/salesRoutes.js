const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, salesController.list);
router.post('/', requireAuth, salesController.create);

module.exports = router;
