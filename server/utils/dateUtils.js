/**
 * Date and time manipulation utilities for the VMS.
 */

function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Calculates human-readable duration between two ISO timestamp strings.
 * E.g., "2h 30m" or "45m".
 */
function calculateDuration(startIso, endIso) {
  if (!startIso || !endIso) return null;
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  const diffMs = Math.max(0, end - start);

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}m`;
  }
}

/**
 * Dynamically determines whether an active checked-in visit has exceeded its allowed window.
 * Does not mutate persisted JSON, avoiding redundant writes on reads.
 */
function isVisitorOverstaying(visit, invitation) {
  if (!visit || visit.status !== 'CHECKED_IN') {
    return false;
  }

  const visitDate = visit.date || (invitation && invitation.date);
  const endTime = visit.scheduledEndTime || (invitation && invitation.endTime);

  if (!visitDate || !endTime) {
    return false;
  }

  // Construct scheduled end timestamp
  const scheduledEnd = new Date(`${visitDate}T${endTime}:00`);
  const now = new Date();

  // If scheduledEnd is valid and current time is past scheduledEnd
  return now.getTime() > scheduledEnd.getTime();
}

/**
 * Calculates how many minutes overstayed.
 */
function getOverstayMinutes(visit, invitation) {
  if (!isVisitorOverstaying(visit, invitation)) return 0;
  const visitDate = visit.date || (invitation && invitation.date);
  const endTime = visit.scheduledEndTime || (invitation && invitation.endTime);
  const scheduledEnd = new Date(`${visitDate}T${endTime}:00`);
  const now = new Date();
  const diffMs = now.getTime() - scheduledEnd.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60)));
}

/**
 * Validates that endTime is strictly chronologically after startTime.
 * Format expected: "HH:mm" (24-hour).
 */
function isTimeOrderValid(startTime, endTime) {
  if (!startTime || !endTime) return false;
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  return endMinutes > startMinutes;
}

module.exports = {
  getTodayString,
  calculateDuration,
  isVisitorOverstaying,
  getOverstayMinutes,
  isTimeOrderValid
};
