/**
 * Role-Based Access Control (RBAC) and Identity Middleware for VMS
 */

function authenticateUser(req, res, next) {
  const roleHeader = req.headers['x-user-role'];
  const userIdHeader = req.headers['x-user-id'];

  const role = typeof roleHeader === 'string' ? roleHeader.trim() : '';
  const userId = typeof userIdHeader === 'string' ? userIdHeader.trim() : '';

  const identities = {
    Employee: new Set(Array.from({ length: 10 }, (_, index) => `EMP-${String(index + 1).padStart(3, '0')}`)),
    'Front Desk': new Set(['SEC-001']),
    Admin: new Set(['EMP-009'])
  };
  const names = {
    'EMP-001': 'Rahul Sharma',
    'SEC-001': 'Security Reception Desk',
    'EMP-009': 'Rajesh Patel'
  };

  if (!role && !userId) {
    req.user = null;
    return next();
  }

  if (!identities[role] || !userId || !identities[role].has(userId)) {
    req.user = null;
    return res.status(401).json({
      success: false,
      message: 'Invalid role session. Please select a valid role session.'
    });
  }

  req.user = {
    id: userId,
    role,
    name: names[userId] || (role === 'Front Desk' ? 'Front Desk Security' : 'Authorized User')
  };

  next();
}

/**
 * Enforces role membership on protected endpoints.
 * Returns 401 when the request is unauthenticated and 403 when the role is not allowed.
 */
function requireRoles(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please select a valid role session.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This operation requires one of the following roles: [${allowedRoles.join(', ')}]. Current role: '${req.user.role}'.`
      });
    }
    next();
  };
}

module.exports = {
  authenticateUser,
  requireRoles
};
