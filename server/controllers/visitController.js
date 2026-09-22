const visitService = require('../services/visitService');

async function getAllVisits(req, res, next) {
  try {
    const { status, date, office, search } = req.query;
    const isEmployee = req.user && req.user.role === 'Employee';
    const hostId = isEmployee ? req.user.id : req.query.hostId;

    const visits = await visitService.getAllVisits({
      status,
      date,
      office,
      search,
      hostId
    });
    res.json({
      success: true,
      data: visits,
      count: visits.length
    });
  } catch (err) {
    next(err);
  }
}

async function getVisitById(req, res, next) {
  try {
    const { id } = req.params;
    const visit = await visitService.getVisitById(id);
    if (!visit) {
      return res.status(404).json({
        success: false,
        message: `Visit record '${id}' not found.`
      });
    }
    if (req.user.role === 'Employee' && visit.hostId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Employees may only view their own visit records.'
      });
    }
    res.json({
      success: true,
      data: visit
    });
  } catch (err) {
    next(err);
  }
}

async function checkIn(req, res, next) {
  try {
    const visitId = req.params.id !== 'check-in' ? req.params.id : null;
    const { invitationId, visitorId, notes } = req.body;

    const checkedInVisit = await visitService.checkIn({
      visitId,
      invitationId,
      visitorId,
      performedBy: req.user.name,
      role: req.user.role,
      notes
    });

    res.json({
      success: true,
      data: checkedInVisit,
      message: 'Visitor checked in successfully.'
    });
  } catch (err) {
    next(err);
  }
}

async function checkOut(req, res, next) {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const checkedOutVisit = await visitService.checkOut({
      visitId: id,
      performedBy: req.user.name,
      role: req.user.role,
      notes
    });

    res.json({
      success: true,
      data: checkedOutVisit,
      message: `Visitor checked out successfully. Duration: ${checkedOutVisit.duration || 'N/A'}`
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllVisits,
  getVisitById,
  checkIn,
  checkOut
};
