const express = require('express');
const router = express.Router();
const visitController = require('../controllers/visitController');
const { requireRoles } = require('../middleware/authorize');

router.get('/', requireRoles(['Employee', 'Front Desk', 'Admin']), visitController.getAllVisits);
router.get('/:id', requireRoles(['Employee', 'Front Desk', 'Admin']), visitController.getVisitById);

// Check-in and Check-out are physical security desk operations (Front Desk & Admin only)
router.post('/check-in', requireRoles(['Front Desk', 'Admin']), visitController.checkIn);
router.post('/:id/check-in', requireRoles(['Front Desk', 'Admin']), visitController.checkIn);
router.post('/:id/check-out', requireRoles(['Front Desk', 'Admin']), visitController.checkOut);

module.exports = router;
