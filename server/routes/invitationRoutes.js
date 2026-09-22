const express = require('express');
const router = express.Router();
const invitationController = require('../controllers/invitationController');
const { requireRoles } = require('../middleware/authorize');

router.get('/', requireRoles(['Employee', 'Admin', 'Front Desk']), invitationController.getAllInvitations);
router.get('/:id', requireRoles(['Employee', 'Admin', 'Front Desk']), invitationController.getInvitationById);

// Creation & Pre-Approval: Employee and Admin only (Front Desk cannot create invitations)
router.post('/', requireRoles(['Employee', 'Admin']), invitationController.createInvitation);
router.post('/pre-approve', requireRoles(['Employee', 'Admin']), invitationController.preApproveInvitation);
router.patch('/:id/pre-approve', requireRoles(['Employee', 'Admin']), invitationController.preApproveInvitation);

// Clearance Approvals & Rejections: Admin & Host only (Front Desk cannot approve/reject)
router.patch('/:id/approve', requireRoles(['Admin', 'Employee']), invitationController.approveInvitation);
router.patch('/:id/reject', requireRoles(['Admin', 'Employee']), invitationController.rejectInvitation);

module.exports = router;
