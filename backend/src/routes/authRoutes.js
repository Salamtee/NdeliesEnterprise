const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

router.post('/login', authController.login);
router.get('/staff-list', authController.publicStaffList);
router.get('/me', requireAuth, authController.me);
router.post('/change-password', requireAuth, authController.changePassword);

module.exports = router;
