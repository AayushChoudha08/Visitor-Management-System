const JsonRepository = require('../repositories/jsonRepository');
const { generateInvitationId, generateVisitId } = require('../utils/idGenerator');
const { validateInvitationPayload } = require('../utils/validation');
const auditService = require('./auditService');
const employeeService = require('./employeeService');
const visitorService = require('./visitorService');

class InvitationService {
  constructor() {
    this.repo = new JsonRepository('invitations.json');
    this.visitsRepo = new JsonRepository('visits.json');
  }

  /**
   * Retrieves all invitations with optional filtering and populated host/guest details.
   */
  async getAllInvitations({ status = null, date = null, office = null, search = null, hostId = null } = {}) {
    const invitations = await this.repo.findAll();
    const employees = await employeeService.getAllEmployees();
    const visitors = await visitorService.getAllVisitors();

    const empMap = new Map(employees.map((e) => [e.id, e]));
    const visMap = new Map(visitors.map((v) => [v.id, v]));

    let results = invitations.map((inv) => {
      const host = empMap.get(inv.hostId) || null;
      const guests = (inv.guestIds || []).map((gid) => visMap.get(gid)).filter(Boolean);
      return {
        ...inv,
        host,
        guests
      };
    });

    if (hostId) {
      results = results.filter((inv) => inv.hostId === hostId);
    }
    if (status && status !== 'ALL') {
      results = results.filter((inv) => inv.status === status);
    }
    if (date) {
      results = results.filter((inv) => inv.date === date);
    }
    if (office && office !== 'ALL') {
      results = results.filter((inv) => inv.office === office);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      results = results.filter(
        (inv) =>
          inv.id.toLowerCase().includes(q) ||
          inv.eventTitle.toLowerCase().includes(q) ||
          (inv.host && inv.host.name.toLowerCase().includes(q)) ||
          (inv.guests && inv.guests.some((g) => g.name.toLowerCase().includes(q) || g.company.toLowerCase().includes(q)))
      );
    }

    // Sort newest created first
    results.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return results;
  }

  async getInvitationById(id) {
    const inv = await this.repo.findById(id);
    if (!inv) return null;

    const host = await employeeService.getEmployeeById(inv.hostId);
    const visitors = await visitorService.getAllVisitors();
    const visMap = new Map(visitors.map((v) => [v.id, v]));
    const guests = (inv.guestIds || []).map((gid) => visMap.get(gid)).filter(Boolean);

    return {
      ...inv,
      host,
      guests
    };
  }

  /**
   * Creates a new standard visitor invitation.
   */
  async createInvitation(payload, performedBy = 'Employee Host', role = 'Employee') {
    const validation = validateInvitationPayload(payload);
    if (!validation.isValid) {
      const err = new Error(validation.errors.join(' '));
      err.statusCode = 400;
      err.errors = validation.errors;
      throw err;
    }

    const allInvs = await this.repo.findAll();
    const id = generateInvitationId(allInvs.length);

    const newInvitation = {
      id,
      eventTitle: payload.eventTitle.trim(),
      visitType: payload.visitType,
      office: payload.office,
      date: payload.date,
      startTime: payload.startTime,
      endTime: payload.endTime,
      hostId: payload.hostId,
      guestIds: payload.guestIds,
      note: payload.note ? payload.note.trim() : '',
      status: payload.status || 'PENDING',
      createdAt: new Date().toISOString()
    };

    const saved = await this.repo.create(newInvitation);

    // Create corresponding scheduled visit record for each guest
    const allVisits = await this.visitsRepo.findAll();
    let visitCount = allVisits.length;
    for (const guestId of payload.guestIds) {
      const visit = {
        id: generateVisitId(visitCount++),
        invitationId: id,
        visitorId: guestId,
        hostId: payload.hostId,
        office: payload.office,
        date: payload.date,
        scheduledStartTime: payload.startTime,
        scheduledEndTime: payload.endTime,
        checkInTime: null,
        checkOutTime: null,
        duration: null,
        status: 'EXPECTED',
        notes: payload.note || ''
      };
      await this.visitsRepo.create(visit);
    }

    await auditService.logActivity({
      action: payload.status === 'PRE-APPROVED' ? 'PRE_APPROVAL_CREATED' : 'INVITATION_CREATED',
      invitationId: id,
      visitorId: payload.guestIds[0],
      performedBy,
      role,
      details: `Created invitation ${id} for "${saved.eventTitle}" (${saved.guestIds.length} guests)`
    });

    return await this.getInvitationById(id);
  }

  /**
   * Approves a pending invitation.
   */
  async approveInvitation(id, performedBy = 'Workplace Admin', role = 'Admin', actor = null) {
    const inv = await this.repo.findById(id);
    if (!inv) {
      const err = new Error(`Invitation ${id} does not exist.`);
      err.statusCode = 404;
      throw err;
    }

    if (actor?.role === 'Employee' && inv.hostId !== actor.id) {
      const err = new Error('Employees may only approve their own invitations.');
      err.statusCode = 403;
      throw err;
    }

    if (inv.status === 'APPROVED') {
      const err = new Error('Invitation is already approved.');
      err.statusCode = 400;
      throw err;
    }

    if (inv.status !== 'PENDING') {
      const err = new Error(`Cannot approve an invitation with status '${inv.status}'.`);
      err.statusCode = 400;
      throw err;
    }

    const updated = await this.repo.update(id, {
      status: 'APPROVED',
      approvedAt: new Date().toISOString(),
      approvedBy: performedBy
    });

    await auditService.logActivity({
      action: 'INVITATION_APPROVED',
      invitationId: id,
      visitorId: inv.guestIds[0] || null,
      performedBy,
      role,
      details: `Approved invitation ${id} for ${inv.eventTitle}`
    });

    return await this.getInvitationById(id);
  }

  /**
   * Rejects a pending invitation.
   */
  async rejectInvitation(id, reason = 'Not specified', performedBy = 'Workplace Admin', role = 'Admin', actor = null) {
    const inv = await this.repo.findById(id);
    if (!inv) {
      const err = new Error(`Invitation ${id} does not exist.`);
      err.statusCode = 404;
      throw err;
    }

    if (actor?.role === 'Employee' && inv.hostId !== actor.id) {
      const err = new Error('Employees may only reject their own invitations.');
      err.statusCode = 403;
      throw err;
    }

    if (inv.status === 'REJECTED') {
      const err = new Error('Invitation is already rejected.');
      err.statusCode = 400;
      throw err;
    }

    if (inv.status !== 'PENDING') {
      const err = new Error(`Cannot reject an invitation with status '${inv.status}'.`);
      err.statusCode = 400;
      throw err;
    }

    const updated = await this.repo.update(id, {
      status: 'REJECTED',
      rejectedAt: new Date().toISOString(),
      rejectedBy: performedBy,
      rejectionReason: reason
    });

    // Mark matching visits as REJECTED
    const allVisits = await this.visitsRepo.findAll((v) => v.invitationId === id);
    for (const v of allVisits) {
      await this.visitsRepo.update(v.id, { status: 'REJECTED' });
    }

    await auditService.logActivity({
      action: 'INVITATION_REJECTED',
      invitationId: id,
      visitorId: inv.guestIds[0] || null,
      performedBy,
      role,
      details: `Rejected invitation ${id}. Reason: ${reason}`
    });

    return await this.getInvitationById(id);
  }

  /**
   * Directly creates an approved visitor pass (Pre-Approval workflow).
   */
  async preApproveInvitation(payload, performedBy = 'Executive Host', role = 'Employee') {
    return await this.createInvitation(
      {
        ...payload,
        status: 'PRE-APPROVED'
      },
      performedBy,
      role
    );
  }
}

module.exports = new InvitationService();
