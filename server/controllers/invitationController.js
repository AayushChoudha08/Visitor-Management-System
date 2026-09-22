const invitationService = require('../services/invitationService');

async function getAllInvitations(req, res, next) {
  try {
    const { status, date, office, search } = req.query;
    const isEmployee = req.user && req.user.role === 'Employee';
    const hostId = isEmployee ? req.user.id : req.query.hostId;

    const invitations = await invitationService.getAllInvitations({
      status,
      date,
      office,
      search,
      hostId
    });
    res.json({
      success: true,
      data: invitations,
      count: invitations.length
    });
  } catch (err) {
    next(err);
  }
}

async function getInvitationById(req, res, next) {
  try {
    const { id } = req.params;
    const invitation = await invitationService.getInvitationById(id);
    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: `Invitation with ID '${id}' not found.`
      });
    }
    if (req.user.role === 'Employee' && invitation.hostId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Employees may only view their own invitations.'
      });
    }
    res.json({
      success: true,
      data: invitation
    });
  } catch (err) {
    next(err);
  }
}

async function createInvitation(req, res, next) {
  try {
    const payload = { ...req.body };
    if (req.user.role === 'Employee') {
      payload.hostId = req.user.id;
    }
    const created = await invitationService.createInvitation(payload, req.user.name, req.user.role);
    res.status(201).json({
      success: true,
      data: created,
      message: 'Visitor invitation created successfully.'
    });
  } catch (err) {
    next(err);
  }
}

async function approveInvitation(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await invitationService.approveInvitation(id, req.user.name, req.user.role, req.user);
    res.json({
      success: true,
      data: updated,
      message: 'Visitor approved successfully.'
    });
  } catch (err) {
    next(err);
  }
}

async function rejectInvitation(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const updated = await invitationService.rejectInvitation(id, reason, req.user.name, req.user.role, req.user);
    res.json({
      success: true,
      data: updated,
      message: 'Visitor request rejected.'
    });
  } catch (err) {
    next(err);
  }
}

async function preApproveInvitation(req, res, next) {
  try {
    const payload = { ...req.body };
    if (req.user.role === 'Employee') {
      payload.hostId = req.user.id;
    }
    const created = await invitationService.preApproveInvitation(payload, req.user.name, req.user.role);
    res.status(201).json({
      success: true,
      data: created,
      message: 'Visitor pre-approved successfully with QR pass.'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllInvitations,
  getInvitationById,
  createInvitation,
  approveInvitation,
  rejectInvitation,
  preApproveInvitation
};
