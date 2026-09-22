const JsonRepository = require('../repositories/jsonRepository');
const { generateLogId } = require('../utils/idGenerator');

class AuditService {
  constructor() {
    this.repo = new JsonRepository('activityLogs.json');
  }

  /**
   * Logs an action in the immutable audit trail.
   */
  async logActivity({ action, invitationId = null, visitorId = null, performedBy = 'System', role = 'System', details = '' }) {
    const existing = await this.repo.findAll();
    const newLog = {
      id: generateLogId(existing.length),
      action,
      invitationId,
      visitorId,
      performedBy,
      role,
      timestamp: new Date().toISOString(),
      details
    };
    return await this.repo.create(newLog);
  }

  /**
   * Retrieves audit logs with optional filtering, sorted chronologically descending.
   */
  async getLogs({ limit = 50, action = null, search = null } = {}) {
    const logs = await this.repo.findAll();
    
    let filtered = [...logs];
    if (action && action !== 'ALL') {
      filtered = filtered.filter((log) => log.action === action);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (log) =>
          (log.performedBy && log.performedBy.toLowerCase().includes(q)) ||
          (log.details && log.details.toLowerCase().includes(q)) ||
          (log.action && log.action.toLowerCase().includes(q)) ||
          (log.invitationId && log.invitationId.toLowerCase().includes(q)) ||
          (log.visitorId && log.visitorId.toLowerCase().includes(q))
      );
    }

    // Sort newest first
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (limit) {
      return filtered.slice(0, Number(limit));
    }
    return filtered;
  }
}

module.exports = new AuditService();
