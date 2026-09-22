export const ROLES = {
  EMPLOYEE: 'Employee',
  FRONT_DESK: 'Front Desk',
  ADMIN: 'Admin'
};

export const PERMISSIONS = {
  [ROLES.EMPLOYEE]: ['dashboard', 'invite', 'approvals', 'preApprovals', 'visitors', 'viewPass'],
  [ROLES.FRONT_DESK]: ['dashboard', 'visitors', 'checkIn', 'checkOut', 'activity', 'registerVisitor', 'viewPass'],
  [ROLES.ADMIN]: ['dashboard', 'invite', 'approvals', 'preApprovals', 'visitors', 'checkIn', 'checkOut', 'activity', 'registerVisitor', 'viewPass', 'admin']
};

export const hasPermission = (role, permission) => Boolean(PERMISSIONS[role]?.includes(permission));

export const rolesFor = (permission) => Object.keys(PERMISSIONS).filter((role) => hasPermission(role, permission));