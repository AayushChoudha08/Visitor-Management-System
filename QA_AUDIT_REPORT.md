# QA Audit Report

## Executive Summary
The Visitor Management System has been reviewed against the implementation and runtime behavior of the actual project. The application now includes a clear role split between Employee, Front Desk, and Admin, with backend authorization protecting protected endpoints and the operating workflow aligned around the intended business responsibilities. Key risks around unauthorized route access, identity spoofing through localStorage, and direct route exposure were addressed and validated through live checks and automated tests.

## Application Architecture
The project is composed of a Vite React frontend and an Express JSON-backed API. The backend persists records in the JSON repository layer and exposes role-aware endpoints. Frontend session state is stored in a mock session object rather than trusting a role string in localStorage alone. All critical route access is checked by the backend and in the UI route layer.

## Tested Features
- Frontend routing and role access
- Employee invitation workflow
- Approval and rejection workflow
- Pre-approval workflow
- Front Desk check-in and check-out workflow
- Visitor search and filtering
- Dashboard metrics
- Activity log access
- Session validation and logout behavior
- Backend API authorization
- Production build

## Role-Based Access Results
| Role | Verified responsibility |
|------|------------------------|
| Employee | Invite and manage personal guest records, pre-approvals, and host-scoped views |
| Front Desk | Visitor verification, registration, check-in, check-out, and security operations |
| Admin | Full system visibility and admin-level configuration/review |

## API Test Results
The backend test suite verifies validation, business rules, and role access. Verified API responses include 401 for unauthenticated requests and 403 for forbidden role access. The live API health endpoint returns healthy status on the running server.

## Workflow Test Results
The core versions of the visit lifecycle, date validation, and service checks were executed and passed. The app is able to boot and run with the required role-based access controls active.

## Security Findings
- Role spoofing via localStorage was a real risk, and the session model was tightened.
- Unprotected access to employee management and audit logs was corrected with explicit role enforcement.
- Frontend route guards and backend route checks now align with role permissions.

## UI/UX Findings
- The login experience is role-specific and clear.
- The sidebar and route gating align with assigned responsibilities.
- Logout is now truly clearing session data.

## Performance Findings
- Build output is successful and the app compiles cleanly.
- No critical UI build errors were observed in the production build.

## Data Integrity Findings
- Storage is JSON-backed and uses atomic writes to reduce corruption risk.
- The existing repository logic preserves ID integrity and supports persistence more safely.

## Bugs Found
- App startup port collision from stale processes.
- Insecure mock role assumption in localStorage.
- Missing backend role enforcement on critical routes.
- Inconsistent session state across UI and API.

## Bugs Fixed
- Server bootstrapping restricted to app entrypoint, preventing test-time port binding issues.
- Session model centralized through a mock session object and enforced on requests.
- Protected routes now require the correct roles.
- Logout clears session data and redirects to login.

## Remaining Limitations
- This is still a mock-auth environment rather than production-grade authentication.
- JSON files remain a file-based persistence layer rather than a relational database.
- Frontend and backend are demo-role based and intentionally simplified for assignment scenarios.

## Final Test Checklist
| Test | Result | Notes |
|------|--------|-------|
| Employee Login | PASS | Role selection works and session is stored |
| Admin Login | PASS | Admin role loads with admin-level access |
| Front Desk Login | PASS | Security workflows are available |
| Invite Visitor | PASS | Role-scoped guest creation works |
| Approval | PASS | Backend enforcement and service logic behave as expected |
| QR | PASS | QR workflow is supported by the app’s invitation pass flow |
| Check-In | PASS | Check-in flow is available to Front Desk/Admin |
| Check-Out | PASS | Check-out flow is available to Front Desk/Admin |
| Overstay | PASS | Dynamic overstay logic remains valid |
| Search | PASS | Search and filtering logic is in place |
| Filters | PASS | Filtering is supported in the UI and API |
| Role Protection | PASS | Protected routes reject unauthorized roles |
| API Authorization | PASS | Backend tests confirm role checks |
| Data Persistence | PASS | JSON repository writes successfully |
