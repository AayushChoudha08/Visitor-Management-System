const dashboardService = require('../services/dashboardService');

async function getDashboardStats(req, res, next) {
  try {
    const data = await dashboardService.getDashboardStats(req.user);
    res.json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboardStats
};
