const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { requireRoles } = require('../middleware/authorize');

router.get('/stats', requireRoles(['Employee', 'Front Desk', 'Admin']), dashboardController.getDashboardStats);

module.exports = router;
