# Final Feature Inventory

This inventory reflects the current verified state of the Visitor Management System after the role audit and backend fix.

| Feature | Page | Component | API | Role | Keep/Remove | Reason |
|---|---|---|---|---|---|---|
| Login / Role switch | Login | Login | n/a | Employee, Front Desk, Admin | Keep | Required entry point for role-based workspaces |
| Logout | Layout / Navbar | Sidebar | n/a | Employee, Front Desk, Admin | Keep | Required session termination |
| Dashboard | Dashboard | StatCard, ActivityList | GET /api/dashboard | Employee, Front Desk, Admin | Keep | Core role-based overview |
| Sidebar navigation | AppLayout | Sidebar | n/a | Employee, Front Desk, Admin | Keep | Role-aware navigation |
| Navbar / user header | AppLayout | Navbar | n/a | Employee, Front Desk, Admin | Keep | Workspace context |
| Role route guard | App.jsx | RoleRoute | n/a | Employee, Front Desk, Admin | Keep | enforces frontend authorization |
| Employee directory lookup | Invite / PreApproval | GuestSearch / employeeService | GET /api/employees | Employee, Admin | Keep | Needed for host selection and guest invitation workflows |
| Guest search | Invite / PreApproval | GuestSearch | GET /api/visitors?search= | Employee, Admin | Keep | Select valid visitor profiles |
| Invite visitor | InviteVisitor | InviteVisitor | POST /api/invitations | Employee, Admin | Keep | Primary employee host function |
| Add/remove guest from invitation | InviteVisitor | SelectedGuests | n/a | Employee, Admin | Keep | Multi-guest invitations |
| Invitation status view | Invitations / dashboard | various | GET /api/invitations | Employee, Admin | Keep | Track request state |
| Invitation approval | Approvals | Approval list | PATCH /api/invitations/:id/approve | Employee, Admin | Keep | Host/admin approval path |
| Invitation rejection | Approvals | Approval list | PATCH /api/invitations/:id/reject | Employee, Admin | Keep | Prevent unauthorized access |
| Pre-approval | PreApproval | PreApproval | POST /api/invitations/pre-approve | Employee, Admin | Keep | Fast-track VIP/vendor clearance |
| Visitor registration | Visitors / registration modal | VisitorRegistrationModal | POST /api/visitors | Front Desk, Admin | Keep | Walk-in registration workflow |
| Capture photo | VisitorRegistrationModal | file upload / webcam handling | n/a | Front Desk, Admin | Keep | Identity capture |
| Visitor directory | Visitors | VisitorTable | GET /api/visitors | Employee, Front Desk, Admin | Keep | Search and operational review |
| Visitor detail view | VisitorDetailsPage | VisitorDetailsModal | GET /api/visitors/:id | Employee, Front Desk, Admin | Keep | Detailed record inspection |
| Visitor pass modal | VisitorPassModal | QR display | n/a | Employee, Front Desk, Admin | Keep | QR/e-pass display |
| Check-in | CheckIn | CheckIn | POST /api/visits/:id/check-in | Front Desk, Admin | Keep | Security entry control |
| Check-out | CheckOut | CheckOut | POST /api/visits/:id/check-out | Front Desk, Admin | Keep | Security exit control |
| Expected visitors | Dashboard / CheckIn | various | GET /api/visits | Front Desk, Admin | Keep | Daily operations overview |
| Overstay detection | Dashboard / visitors | service logic | GET /api/visits?status=OVERSTAY | Front Desk, Admin | Keep | Required security monitoring |
| Search and filters | Visitors | VisitorFilters | GET /api/visits | Employee, Front Desk, Admin | Keep | Record filtering |
| Activity log view | ActivityLogs | ActivityList | GET /api/activity-logs | Front Desk, Admin | Keep | Security audit trail |
| Employee management | n/a | n/a | GET /api/employees | Admin only | Keep | System administration capability |
| Admin configuration | n/a | n/a | GET/PATCH /api/admin/config | Admin | Keep | System settings management |
| Reports / stats | Dashboard / admin view | dashboard stats | GET /api/dashboard | Employee, Front Desk, Admin | Keep | Consolidated metrics |
| Validation helpers | server/utils/validation.js | validation logic | n/a | all | Keep | Business rule enforcement |
| JSON repository | server/repositories/jsonRepository.js | repository layer | n/a | all | Keep | Seeded persistence model |
| ID generation | server/utils/idGenerator.js | utility | n/a | all | Keep | Unique resource IDs |
| Data isolation enforcement | server middleware + services | authorize + service filters | all protected APIs | all | Keep | Required security and access separation |

## Removed or constrained items

- Unrestricted employee self-management routes were not kept as broad employee operating functions; access is limited to role-appropriate directory and invitation workflows.
- Front Desk is not allowed to create invitations or modify employee configuration.
- Employee role is not allowed to check in or check out visitors.
- Admin route access is protected with backend role enforcement.
