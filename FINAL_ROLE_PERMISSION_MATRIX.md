# Final Role Permission Matrix

## Role definitions

- Employee / Host: manages their own invitations and visitor activity.
- Front Desk / Security: verifies and controls visitor access in person.
- Admin: manages the organization-wide visitor system and employee/setting functions.

| Capability | Employee | Front Desk | Admin |
|---|---:|---:|---:|
| Login | ✅ | ✅ | ✅ |
| Logout | ✅ | ✅ | ✅ |
| View dashboard | ✅ | ✅ | ✅ |
| View own profile | ✅ | ✅ | ✅ |
| Invite visitor | ✅ | ❌ | ✅ |
| View own invitations | ✅ | ❌ | ✅ |
| Cancel own upcoming invitation | ✅ | ❌ | ✅ |
| Pre-approve visitor | ✅ | ❌ | ✅ |
| View own visitors | ✅ | ❌ | ✅ |
| View own visitor details | ✅ | ❌ | ✅ |
| View own activity | ✅ | ❌ | ✅ |
| Search visitors for invitation setup | ✅ | ❌ | ✅ |
| Check visitor in | ❌ | ✅ | ✅ |
| Check visitor out | ❌ | ✅ | ✅ |
| Register walk-in visitor | ❌ | ✅ | ✅ |
| View expected today / visitors queue | ❌ | ✅ | ✅ |
| View security activity | ❌ | ✅ | ✅ |
| View all organization visitors | ❌ | ✅ (operational records) | ✅ |
| View all invitations | ❌ | ❌ | ✅ |
| View all visits | ❌ | ❌ | ✅ |
| View audit logs | ❌ | ✅ (security-relevant) | ✅ |
| Manage employees | ❌ | ❌ | ✅ |
| Assign roles | ❌ | ❌ | ✅ |
| Manage offices | ❌ | ❌ | ✅ |
| Manage visitor types / policies | ❌ | ❌ | ✅ |
| Configure settings | ❌ | ❌ | ✅ |
| Approve / reject invitations | ✅ (own host approvals) | ❌ | ✅ |
| View other users' private records | ❌ | ❌ | ✅ (organization-wide admin scope) |

## Backend enforcement standard

Protected endpoints enforce a single role gate using the server middleware. Unauthorized access returns 403 with a structured JSON error. Unauthenticated access returns 401.

Examples:

- Employee cannot access POST /api/visits/:id/check-in
- Front Desk cannot access POST /api/invitations
- Admin is allowed to manage system configuration and employee records
- Invalid role/user combinations are rejected with 401 before route authorization.
- Employee invitation and visit list/detail responses are restricted to the authenticated employee host.
