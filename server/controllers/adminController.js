const employeeService = require('../services/employeeService');
const auditService = require('../services/auditService');

// System-wide default corporate configuration
let systemPolicies = {
  maxPreApprovalsPerDay: 5,
  defaultVisitDurationHours: 2,
  requirePhotoForEntry: true,
  securityCheckInToleranceMinutes: 30,
  allowedOffices: ['Mumbai Goregaon', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune'],
  allowedVisitTypes: [
    'Business Guest',
    'Vendor',
    'Personnel',
    'Government Official',
    'Interview',
    'PwC Network Firm',
    'Others'
  ]
};

class AdminController {
  async getSystemConfig(req, res, next) {
    try {
      const employees = await employeeService.getAllEmployees();
      res.json({
        success: true,
        data: {
          policies: systemPolicies,
          employeesCount: employees.length,
          employees
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async updateSystemConfig(req, res, next) {
    try {
      const { policies } = req.body;
      if (policies) {
        systemPolicies = {
          ...systemPolicies,
          ...policies
        };
      }

      await auditService.logActivity({
        action: 'SYSTEM_SETTINGS_UPDATED',
        performedBy: req.user.name,
        role: req.user.role,
        details: `Updated security policies and campus configuration`
      });

      res.json({
        success: true,
        message: 'Workplace policies updated successfully.',
        data: {
          policies: systemPolicies
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AdminController();
