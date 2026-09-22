const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { requireRoles } = require('../middleware/authorize');

router.use(requireRoles(['Employee', 'Admin']));
router.get('/', employeeController.getAllEmployees);
router.get('/:id', employeeController.getEmployeeById);

module.exports = router;
