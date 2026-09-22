const { isTimeOrderValid } = require('./dateUtils');

/**
 * Validates payload for creating an invitation.
 * Returns { isValid: boolean, errors: string[] }
 */
function validateInvitationPayload(payload) {
  const errors = [];

  if (!payload.eventTitle || !payload.eventTitle.trim()) {
    errors.push('Event / Meeting Title is required.');
  }

  const validVisitTypes = [
    'Business Guest',
    'Vendor',
    'Personnel',
    'Government Official',
    'Interview',
    'PwC Network Firm',
    'Others'
  ];
  if (!payload.visitType || !validVisitTypes.includes(payload.visitType)) {
    errors.push(`Visit Type must be one of: ${validVisitTypes.join(', ')}.`);
  }

  const validOffices = ['Mumbai Goregaon', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune'];
  if (!payload.office || !validOffices.includes(payload.office)) {
    errors.push(`Office must be one of: ${validOffices.join(', ')}.`);
  }

  if (!payload.date || isNaN(Date.parse(payload.date))) {
    errors.push('A valid meeting date is required.');
  }

  if (!payload.startTime) {
    errors.push('Start Time is required.');
  }

  if (!payload.endTime) {
    errors.push('End Time is required.');
  }

  if (payload.startTime && payload.endTime && !isTimeOrderValid(payload.startTime, payload.endTime)) {
    errors.push('End time must be strictly after start time.');
  }

  if (!payload.guestIds || !Array.isArray(payload.guestIds) || payload.guestIds.length === 0) {
    errors.push('At least one guest must be selected.');
  } else {
    // Check for duplicate guests
    const uniqueGuests = new Set(payload.guestIds);
    if (uniqueGuests.size !== payload.guestIds.length) {
      errors.push('Duplicate guests cannot be added to the same invitation.');
    }
  }

  if (!payload.hostId) {
    errors.push('Host employee is required.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validates payload for registering a visitor.
 */
function validateVisitorRegistration(payload) {
  const errors = [];

  if (!payload.name || !payload.name.trim()) {
    errors.push('Full name is required.');
  }

  if (!payload.phone || !payload.phone.trim()) {
    errors.push('Valid mobile phone number is required.');
  } else if (!/^\+?[\d\s-]{8,15}$/.test(payload.phone.trim())) {
    errors.push('Please provide a valid phone number (8-15 digits).');
  }

  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim())) {
    errors.push('Please provide a valid email address.');
  }

  if (!payload.purpose || !payload.purpose.trim()) {
    errors.push('Purpose of visit is required.');
  }

  if (!payload.hostId) {
    errors.push('Host employee is required.');
  }

  if (!payload.photo || !payload.photo.trim()) {
    errors.push('Visitor photo is required.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateInvitationPayload,
  validateVisitorRegistration
};
