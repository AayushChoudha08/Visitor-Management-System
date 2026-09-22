const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireRoles } = require('../middleware/authorize');

// Entire admin route suite requires Admin role
router.use(requireRoles(['Admin']));

router.get('/config', adminController.getSystemConfig);
router.patch('/config', adminController.updateSystemConfig);

module.exports = router;
