const JsonRepository = require('../repositories/jsonRepository');
const { isVisitorOverstaying, getOverstayMinutes, calculateDuration, getTodayString } = require('../utils/dateUtils');
const { generateVisitId } = require('../utils/idGenerator');
const auditService = require('./auditService');
const visitorService = require('./visitorService');
const employeeService = require('./employeeService');

class VisitService {
  constructor() {
    this.repo = new JsonRepository('visits.json');
    this.invitationsRepo = new JsonRepository('invitations.json');
  }

  /**
   * Retrieves all visits with dynamic overstay detection and populated entities.
   */
  async getAllVisits({ status = null, date = null, office = null, search = null, hostId = null } = {}) {
    const visits = await this.repo.findAll();
    const invitations = await this.invitationsRepo.findAll();
    const visitors = await visitorService.getAllVisitors();
    const employees = await employeeService.getAllEmployees();

    const invMap = new Map(invitations.map((i) => [i.id, i]));
    const visMap = new Map(visitors.map((v) => [v.id, v]));
    const empMap = new Map(employees.map((e) => [e.id, e]));

    let results = visits.map((visit) => {
      const invitation = invMap.get(visit.invitationId) || null;
      const visitor = visMap.get(visit.visitorId) || null;
      const host = empMap.get(visit.hostId) || (invitation && empMap.get(invitation.hostId)) || null;

      const isOverstay = isVisitorOverstaying(visit, invitation);
      const overstayMinutes = isOverstay ? getOverstayMinutes(visit, invitation) : 0;

      // Effective display status: if checked in and time past scheduled end, treat as OVERSTAY
      const effectiveStatus = isOverstay ? 'OVERSTAY' : visit.status;

      return {
        ...visit,
        effectiveStatus,
        isOverstay,
        overstayMinutes,
        visitor,
        host,
        invitation
      };
    });

    if (hostId) {
      results = results.filter((v) => v.hostId === hostId || (v.host && v.host.id === hostId));
    }

    if (status && status !== 'ALL') {
      if (status === 'OVERSTAY') {
        results = results.filter((v) => v.isOverstay);
      } else {
        results = results.filter((v) => v.effectiveStatus === status || v.status === status);
      }
    }

    if (date) {
      results = results.filter((v) => v.date === date);
    }

    if (office && office !== 'ALL') {
      results = results.filter((v) => v.office === office);
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      results = results.filter(
        (v) =>
          (v.visitor && v.visitor.name.toLowerCase().includes(q)) ||
          (v.visitor && v.visitor.phone.toLowerCase().includes(q)) ||
          (v.visitor && v.visitor.email && v.visitor.email.toLowerCase().includes(q)) ||
          (v.visitor && v.visitor.company.toLowerCase().includes(q)) ||
          (v.host && v.host.name.toLowerCase().includes(q)) ||
          (v.invitationId && v.invitationId.toLowerCase().includes(q)) ||
          (v.id && v.id.toLowerCase().includes(q))
      );
    }

    // Sort active visits and overstays to the top, followed by expected, then completed
    const priority = { OVERSTAY: 0, CHECKED_IN: 1, EXPECTED: 2, CHECKED_OUT: 3, REJECTED: 4 };
    results.sort((a, b) => {
      const prioA = priority[a.effectiveStatus] !== undefined ? priority[a.effectiveStatus] : 5;
      const prioB = priority[b.effectiveStatus] !== undefined ? priority[b.effectiveStatus] : 5;
      if (prioA !== prioB) return prioA - prioB;
      return (b.scheduledStartTime || '').localeCompare(a.scheduledStartTime || '');
    });

    return results;
  }

  async getVisitById(id) {
    const visit = await this.repo.findById(id);
    if (!visit) return null;

    const invitation = await this.invitationsRepo.findById(visit.invitationId);
    const visitor = await visitorService.getVisitorById(visit.visitorId);
    const host = await employeeService.getEmployeeById(visit.hostId);

    const isOverstay = isVisitorOverstaying(visit, invitation);
    const overstayMinutes = isOverstay ? getOverstayMinutes(visit, invitation) : 0;
    const effectiveStatus = isOverstay ? 'OVERSTAY' : visit.status;

    return {
      ...visit,
      effectiveStatus,
      isOverstay,
      overstayMinutes,
      visitor,
      host,
      invitation
    };
  }

  /**
   * Executes Front Desk visitor check-in with complete verification of business rules.
   */
  async checkIn({ visitId, invitationId, visitorId, performedBy = 'Front Desk', role = 'Front Desk', notes = '' }) {
    let visit = null;

    if (visitId) {
      visit = await this.repo.findById(visitId);
    } else if (invitationId && visitorId) {
      visit = await this.repo.findOne(
        (v) => v.invitationId === invitationId && v.visitorId === visitorId
      );
    } else if (invitationId) {
      visit = await this.repo.findOne((v) => v.invitationId === invitationId);
    }

    if (!visit) {
      // If no pre-scheduled visit was found, verify if invitation exists
      if (invitationId) {
        const inv = await this.invitationsRepo.findById(invitationId);
        if (!inv) {
          const err = new Error(`Invitation '${invitationId}' does not exist.`);
          err.statusCode = 404;
          throw err;
        }

        const effectiveGuestId = visitorId || inv.guestIds[0];
        const allVisits = await this.repo.findAll();
        visit = {
          id: generateVisitId(allVisits.length),
          invitationId: inv.id,
          visitorId: effectiveGuestId,
          hostId: inv.hostId,
          office: inv.office,
          date: inv.date,
          scheduledStartTime: inv.startTime,
          scheduledEndTime: inv.endTime,
          checkInTime: null,
          checkOutTime: null,
          duration: null,
          status: 'EXPECTED',
          notes: notes || inv.note
        };
        await this.repo.create(visit);
      } else {
        const err = new Error('Visit record or Invitation ID must be provided.');
        err.statusCode = 400;
        throw err;
      }
    }

    const invitation = await this.invitationsRepo.findById(visit.invitationId);
    if (!invitation) {
      const err = new Error(`Associated invitation '${visit.invitationId}' not found.`);
      err.statusCode = 404;
      throw err;
    }

    // Business Rule 1 & 8: Cannot be checked in twice
    if (visit.status === 'CHECKED_IN') {
      const err = new Error(`Visitor is already checked in (at ${visit.checkInTime}).`);
      err.statusCode = 409;
      throw err;
    }

    // Business Rule 9: Already checked out visitor cannot be checked in again under same visit
    if (visit.status === 'CHECKED_OUT') {
      const err = new Error('Visitor has already completed and checked out of this visit.');
      err.statusCode = 400;
      throw err;
    }

    // Business Rule 3: A rejected invitation cannot be checked in
    if (invitation.status === 'REJECTED') {
      const err = new Error('Cannot check in: This invitation has been REJECTED by management.');
      err.statusCode = 403;
      throw err;
    }

    // Business Rule 12: Only approved/pre-approved visitors can enter
    if (invitation.status !== 'APPROVED' && invitation.status !== 'PRE-APPROVED') {
      const err = new Error(
        `Cannot check in: Invitation status is '${invitation.status}'. Only APPROVED or PRE-APPROVED visitors are permitted.`
      );
      err.statusCode = 403;
      throw err;
    }

    // Execute Check-in
    const checkInTime = new Date().toISOString();
    const updatedVisit = await this.repo.update(visit.id, {
      status: 'CHECKED_IN',
      checkInTime,
      notes: notes || visit.notes || 'Checked in at front desk'
    });

    const visitor = await visitorService.getVisitorById(visit.visitorId);
    const visitorName = visitor ? visitor.name : visit.visitorId;

    await auditService.logActivity({
      action: 'VISITOR_CHECKED_IN',
      invitationId: visit.invitationId,
      visitorId: visit.visitorId,
      performedBy,
      role,
      details: `${visitorName} verified and checked in at ${visit.office}`
    });

    return await this.getVisitById(visit.id);
  }

  /**
   * Executes Front Desk visitor check-out and calculates stay duration.
   */
  async checkOut({ visitId, performedBy = 'Front Desk', role = 'Front Desk', notes = '' }) {
    const visit = await this.repo.findById(visitId);
    if (!visit) {
      const err = new Error(`Visit record '${visitId}' does not exist.`);
      err.statusCode = 404;
      throw err;
    }

    // Business Rule 2: Cannot check out before check in
    if (visit.status === 'EXPECTED') {
      const err = new Error('Cannot check out a visitor who has not yet checked in.');
      err.statusCode = 400;
      throw err;
    }

    // Business Rule 9: Cannot check out twice
    if (visit.status === 'CHECKED_OUT') {
      const err = new Error(`Visitor was already checked out at ${visit.checkOutTime}.`);
      err.statusCode = 409;
      throw err;
    }

    const checkOutTime = new Date().toISOString();
    const duration = calculateDuration(visit.checkInTime, checkOutTime);

    const updatedVisit = await this.repo.update(visit.id, {
      status: 'CHECKED_OUT',
      checkOutTime,
      duration: duration || '1m',
      notes: notes ? `${visit.notes ? visit.notes + '. ' : ''}${notes}` : visit.notes
    });

    const visitor = await visitorService.getVisitorById(visit.visitorId);
    const visitorName = visitor ? visitor.name : visit.visitorId;

    await auditService.logActivity({
      action: 'VISITOR_CHECKED_OUT',
      invitationId: visit.invitationId,
      visitorId: visit.visitorId,
      performedBy,
      role,
      details: `${visitorName} checked out. Total visit duration: ${duration || '< 1m'}`
    });

    return await this.getVisitById(visit.id);
  }
}

module.exports = new VisitService();
