const auditService = require('../services/auditService');

async function getActivityLogs(req, res, next) {
  try {
    const { limit, action, search } = req.query;
    const logs = await auditService.getLogs({ limit, action, search });
    res.json({
      success: true,
      data: logs,
      count: logs.length
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getActivityLogs
};
