const employeeService = require('../services/employeeService');

async function getAllEmployees(req, res, next) {
  try {
    const { search } = req.query;
    const employees = await employeeService.getAllEmployees(search);
    res.json({
      success: true,
      data: employees,
      count: employees.length
    });
  } catch (err) {
    next(err);
  }
}

async function getEmployeeById(req, res, next) {
  try {
    const { id } = req.params;
    const employee = await employeeService.getEmployeeById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: `Employee with ID '${id}' not found.`
      });
    }
    res.json({
      success: true,
      data: employee
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllEmployees,
  getEmployeeById
};
