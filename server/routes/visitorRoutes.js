const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitorController');
const { requireRoles } = require('../middleware/authorize');

router.get('/', requireRoles(['Employee', 'Front Desk', 'Admin']), visitorController.getAllVisitors);
router.get('/:id', requireRoles(['Employee', 'Front Desk', 'Admin']), visitorController.getVisitorById);
router.post('/', requireRoles(['Front Desk', 'Admin']), visitorController.createVisitor);
router.patch('/:id', requireRoles(['Front Desk', 'Admin']), visitorController.updateVisitor);

module.exports = router;
