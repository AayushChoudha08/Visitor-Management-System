const JsonRepository = require('../repositories/jsonRepository');
const { getTodayString, isVisitorOverstaying } = require('../utils/dateUtils');
const visitService = require('./visitService');
const invitationService = require('./invitationService');
const auditService = require('./auditService');

class DashboardService {
  constructor() {
    this.invitationsRepo = new JsonRepository('invitations.json');
    this.visitsRepo = new JsonRepository('visits.json');
  }

  /**
   * Calculates dynamic statistics strictly from actual persistent data.
   */
  async getDashboardStats(user = { role: 'Admin', id: 'EMP-009' }) {
    const today = getTodayString();
    let allVisits = await visitService.getAllVisits();
    const allInvitations = await this.invitationsRepo.findAll();

    const isEmployee = user && user.role === 'Employee';

    // If Employee, strictly isolate to their designated visits and invitations
    if (isEmployee) {
      allVisits = allVisits.filter((v) => v.hostId === user.id);
    }
    
    // Show only the current calendar date for the dashboard to avoid count oscillation from stale seeded dates.
    const todayVisits = allVisits.filter((v) => v.date === today);

    // Calculate core metrics
    const totalVisitors = todayVisits.length;
    const expected = todayVisits.filter((v) => v.status === 'EXPECTED').length;
    const checkedIn = todayVisits.filter((v) => v.status === 'CHECKED_IN').length;
    const checkedOut = todayVisits.filter((v) => v.status === 'CHECKED_OUT').length;
    const overstay = todayVisits.filter((v) => v.isOverstay).length;

    // Count pending approvals across invitations (scoped for employee)
    const relevantInvs = isEmployee
      ? allInvitations.filter((inv) => inv.hostId === user.id)
      : allInvitations;
    const pendingApprovals = relevantInvs.filter((inv) => inv.status === 'PENDING').length;

    // Recent activity (scoped for employee)
    const recentActivity = await auditService.getLogs({
      search: isEmployee ? user.name : null,
      limit: 8
    });

    return {
      userRole: user?.role || 'Admin',
      isEmployee,
      stats: {
        totalVisitors,
        expected,
        checkedIn,
        checkedOut,
        pendingApprovals,
        overstay
      },
      todayVisitors: todayVisits,
      recentActivity
    };
  }
}

module.exports = new DashboardService();
