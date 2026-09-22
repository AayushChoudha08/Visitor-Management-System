const crypto = require('crypto');

/**
 * Generates formatted, sequence/timestamp-based identifiers for VMS entities.
 */
function generateInvitationId(existingCount = 0) {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `INV-${year}-${String(existingCount + 1).padStart(6, '0')}`;
}

function generateVisitorId(existingCount = 0) {
  const nextNum = existingCount + 1;
  return `VIS-${String(nextNum).padStart(3, '0')}`;
}

function generateVisitId(existingCount = 0) {
  const nextNum = existingCount + 1;
  return `VST-${String(nextNum).padStart(3, '0')}`;
}

function generateLogId(existingCount = 0) {
  const nextNum = existingCount + 1;
  return `LOG-${String(nextNum).padStart(3, '0')}`;
}

module.exports = {
  generateInvitationId,
  generateVisitorId,
  generateVisitId,
  generateLogId
};
