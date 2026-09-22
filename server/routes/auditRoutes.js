const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { requireRoles } = require('../middleware/authorize');

router.get('/', requireRoles(['Admin', 'Front Desk']), auditController.getActivityLogs);

module.exports = router;
