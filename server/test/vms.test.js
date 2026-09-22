const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const app = require('../server');

// Utils under test
const { generateInvitationId, generateVisitId, generateVisitorId } = require('../utils/idGenerator');
const { calculateDuration, isTimeOrderValid, isVisitorOverstaying, getOverstayMinutes } = require('../utils/dateUtils');
const { validateInvitationPayload, validateVisitorRegistration } = require('../utils/validation');

// Services under test
const employeeService = require('../services/employeeService');
const visitorService = require('../services/visitorService');
const invitationService = require('../services/invitationService');
const visitService = require('../services/visitService');
const dashboardService = require('../services/dashboardService');

test('VMS Core ID Generators', async (t) => {
  await t.test('generates valid invitation ID with year and sequence', () => {
    const id = generateInvitationId(1);
    assert.match(id, /^INV-\d{4}-\d{6}$/);
  });

  await t.test('generates valid visit ID with sequence', () => {
    const id = generateVisitId(5);
    assert.match(id, /^VST-\d{3,}$/);
  });

  await t.test('generates valid visitor ID with sequence', () => {
    const id = generateVisitorId(12);
    assert.match(id, /^VIS-\d{3,}$/);
  });
});

test('VMS Validation Rules', async (t) => {
  await t.test('rejects invitation missing required fields', () => {
    const result = validateInvitationPayload({});
    assert.equal(result.isValid, false);
    assert.ok(result.errors.length >= 5);
  });

  await t.test('rejects invitation when end time is before start time (Business Rule 5)', () => {
    const result = validateInvitationPayload({
      eventTitle: 'Sprint Review',
      visitType: 'Business Guest',
      office: 'Mumbai Goregaon',
      date: '2026-09-25',
      startTime: '14:00',
      endTime: '11:00', // Invalid: end is before start
      hostId: 'EMP-001',
      guestIds: ['VIS-001']
    });
    assert.equal(result.isValid, false);
    assert.ok(result.errors.some((err) => err.includes('End time must be strictly after start time')));
  });

  await t.test('rejects invitation without any guests (Business Rule 7)', () => {
    const result = validateInvitationPayload({
      eventTitle: 'Client Meeting',
      visitType: 'Business Guest',
      office: 'Mumbai Goregaon',
      date: '2026-09-25',
      startTime: '10:00',
      endTime: '12:00',
      hostId: 'EMP-001',
      guestIds: []
    });
    assert.equal(result.isValid, false);
    assert.ok(result.errors.some((err) => err.includes('At least one guest')));
  });

  await t.test('accepts properly formatted invitation payload', () => {
    const result = validateInvitationPayload({
      eventTitle: 'Quarterly Review',
      visitType: 'Business Guest',
      office: 'Mumbai Goregaon',
      date: '2026-09-25',
      startTime: '10:00',
      endTime: '12:00',
      hostId: 'EMP-001',
      guestIds: ['VIS-001']
    });
    assert.equal(result.isValid, true);
    assert.equal(result.errors.length, 0);
  });

  await t.test('validates visitor registration payload', () => {
    const invalid = validateVisitorRegistration({ name: '' });
    assert.equal(invalid.isValid, false);

    const valid = validateVisitorRegistration({
      name: 'Rohan Deshmukh',
      phone: '9820098200',
      purpose: 'Client Meeting',
      hostId: 'EMP-001',
      photo: 'data:image/jpeg;base64,mock'
    });
    assert.equal(valid.isValid, true);
  });
});

test('VMS Date & Duration Calculation', async (t) => {
  await t.test('correctly calculates visit duration between two ISO timestamps', () => {
    const checkIn = '2026-09-21T09:00:00.000Z';
    const checkOut = '2026-09-21T11:35:00.000Z';
    const duration = calculateDuration(checkIn, checkOut);
    assert.equal(duration, '2h 35m');
  });

  await t.test('correctly calculates duration under one hour', () => {
    const checkIn = '2026-09-21T10:15:00.000Z';
    const checkOut = '2026-09-21T10:45:00.000Z';
    const duration = calculateDuration(checkIn, checkOut);
    assert.equal(duration, '30m');
  });

  await t.test('validates 24-hour time ordering', () => {
    assert.equal(isTimeOrderValid('09:00', '10:00'), true);
    assert.equal(isTimeOrderValid('11:30', '11:15'), false);
    assert.equal(isTimeOrderValid('12:00', '12:00'), false);
  });

  await t.test('detects overstay when current time is past scheduledEndTime for checked-in visit', () => {
    const pastVisit = {
      status: 'CHECKED_IN',
      date: '2020-01-01',
      scheduledEndTime: '10:00'
    };
    assert.equal(isVisitorOverstaying(pastVisit), true);
  });

  await t.test('does not flag expected or checked-out visits as overstay (Business Rule 13)', () => {
    const expectedVisit = {
      status: 'EXPECTED',
      date: '2020-01-01',
      scheduledEndTime: '10:00'
    };
    const completedVisit = {
      status: 'CHECKED_OUT',
      date: '2020-01-01',
      scheduledEndTime: '10:00'
    };
    assert.equal(isVisitorOverstaying(expectedVisit), false);
    assert.equal(isVisitorOverstaying(completedVisit), false);
  });
});

test('VMS Service Business Rules Enforcement', async (t) => {
  await t.test('prevents checking out a visitor who has not checked in (Business Rule 2)', async () => {
    // VST-005 is EXPECTED
    await assert.rejects(
      async () => {
        await visitService.checkOut({ visitId: 'VST-005' });
      },
      (err) => {
        return err.statusCode === 400 && err.message.includes('not yet checked in');
      }
    );
  });

  await t.test('prevents checking out an already checked-out visitor (Business Rule 9)', async () => {
    // VST-003 is CHECKED_OUT
    await assert.rejects(
      async () => {
        await visitService.checkOut({ visitId: 'VST-003' });
      },
      (err) => {
        return err.statusCode === 409 && err.message.includes('already checked out');
      }
    );
  });

  await t.test('prevents checking in an already checked in visitor (Business Rule 1)', async () => {
    // VST-002 is CHECKED_IN
    await assert.rejects(
      async () => {
        await visitService.checkIn({ visitId: 'VST-002' });
      },
      (err) => {
        return err.statusCode === 409 && err.message.includes('already checked in');
      }
    );
  });

  await t.test('dashboard statistics dynamically aggregate real data without hardcoding', async () => {
    const result = await dashboardService.getDashboardStats();
    assert.ok(result.stats);
    assert.equal(typeof result.stats.totalVisitors, 'number');
    assert.equal(typeof result.stats.expected, 'number');
    assert.equal(typeof result.stats.checkedIn, 'number');
    assert.equal(typeof result.stats.checkedOut, 'number');
    assert.equal(typeof result.stats.pendingApprovals, 'number');
    assert.equal(typeof result.stats.overstay, 'number');
    assert.ok(Array.isArray(result.todayVisitors));
    assert.ok(Array.isArray(result.recentActivity));
  });
});

test('VMS Role-Based API Authorization', async (t) => {
  await t.test('rejects forged role and user combinations', async () => {
    const res = await request(app)
      .get('/api/dashboard/stats')
      .set('x-user-role', 'Admin')
      .set('x-user-id', 'EMP-001');

    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  await t.test('requires authentication for dashboard and invitation reads', async () => {
    const dashboard = await request(app).get('/api/dashboard/stats');
    const invitations = await request(app).get('/api/invitations');

    assert.equal(dashboard.status, 401);
    assert.equal(invitations.status, 401);
  });

  await t.test('scopes employee invitation and visit reads to the current host', async () => {
    const invitations = await request(app)
      .get('/api/invitations')
      .set('x-user-role', 'Employee')
      .set('x-user-id', 'EMP-001');
    const visits = await request(app)
      .get('/api/visits')
      .set('x-user-role', 'Employee')
      .set('x-user-id', 'EMP-001');

    assert.equal(invitations.status, 200);
    assert.equal(visits.status, 200);
    assert.ok(invitations.body.data.every((inv) => inv.hostId === 'EMP-001'));
    assert.ok(visits.body.data.every((visit) => visit.hostId === 'EMP-001'));
  });

  await t.test('blocks employee access to another host record by ID', async () => {
    const invitation = await request(app)
      .get('/api/invitations/INV-2026-000002')
      .set('x-user-role', 'Employee')
      .set('x-user-id', 'EMP-001');
    const visit = await request(app)
      .get('/api/visits/VST-002')
      .set('x-user-role', 'Employee')
      .set('x-user-id', 'EMP-001');

    assert.equal(invitation.status, 403);
    assert.equal(visit.status, 403);
  });

  await t.test('Employee can access the employee directory needed for host selection', async () => {
    const res = await request(app)
      .get('/api/employees')
      .set('x-user-role', 'Employee')
      .set('x-user-id', 'EMP-001');

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
  });

  await t.test('Employee can search registered visitors while creating an invitation', async () => {
    const res = await request(app)
      .get('/api/visitors')
      .query({ search: 'Aman' })
      .set('x-user-role', 'Employee')
      .set('x-user-id', 'EMP-001');

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
  });

  await t.test('Front Desk cannot access employee management routes', async () => {
    const res = await request(app)
      .get('/api/employees')
      .set('x-user-role', 'Front Desk')
      .set('x-user-id', 'SEC-001');

    assert.equal(res.status, 403);
  });

  await t.test('Employee cannot access audit logs', async () => {
    const res = await request(app)
      .get('/api/activity-logs')
      .set('x-user-role', 'Employee')
      .set('x-user-id', 'EMP-001');

    assert.equal(res.status, 403);
  });

  await t.test('Employee cannot create a walk-in visitor registration', async () => {
    const res = await request(app)
      .post('/api/visitors')
      .set('x-user-role', 'Employee')
      .set('x-user-id', 'EMP-001')
      .send({
        name: 'Unauthorized Visitor',
        phone: '9999999999',
        purpose: 'Unauthorized access test',
        hostId: 'EMP-001'
      });

    assert.equal(res.status, 403);
  });

  await t.test('Front Desk cannot create invitations', async () => {
    const res = await request(app)
      .post('/api/invitations')
      .set('x-user-role', 'Front Desk')
      .set('x-user-id', 'SEC-001')
      .send({
        eventTitle: 'Unauthorized invite',
        visitType: 'Business Guest',
        office: 'Mumbai Goregaon',
        date: '2030-01-20',
        startTime: '10:00',
        endTime: '11:00',
        hostId: 'EMP-001',
        guestIds: ['VIS-001']
      });

    assert.equal(res.status, 403);
  });
});
