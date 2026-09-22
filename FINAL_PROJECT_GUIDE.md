# Visitor Management System (VMS)

## Complete Project Guide

This document is the complete technical and operational guide for the current Visitor Management System. It explains what the application does, how the frontend and backend connect, how data moves through the system, what each role can do, how every major workflow works, how to install and run it, and what limitations remain.

## 1. Project Summary

VMS is a full-stack workplace visitor management application. It manages the complete visitor lifecycle:

1. An employee or administrator creates an invitation.
2. A host selects one or more registered visitors.
3. The invitation is approved, rejected, or pre-approved.
4. The system creates scheduled visit records.
5. Front Desk verifies the invitation and checks the visitor in.
6. The system tracks the visitor while on site and detects overstays.
7. Front Desk checks the visitor out and records duration.
8. Audit activity is written to the activity log.
9. Dashboards calculate current statistics from persisted visit data.

The project intentionally uses local JSON files instead of a database. This keeps the project simple and easy to demonstrate, but JSON storage is suitable for a single persistent instance or assignment prototype, not a horizontally scaled production deployment.

## 2. Technology Stack

### Frontend

- React 18
- Vite
- JavaScript/JSX
- Tailwind CSS
- React Router
- Axios
- Lucide React icons
- qrcode.react for client-side QR/e-pass rendering

### Backend

- Node.js
- Express 4
- CommonJS modules
- Morgan request logging
- CORS
- Dotenv
- Node test runner
- Supertest for HTTP tests

### Persistence

- Local JSON files in `server/data/`
- `fs/promises` for asynchronous file access
- Atomic temporary-file writes during repository updates

## 3. System Architecture

The application has five main layers:

```text
Browser
  |
  | React pages and components
  | Axios HTTP requests
  v
Frontend API client
  |
  | /api requests
  | x-user-role and x-user-id session headers
  v
Express server
  |
  | authentication extraction
  | role authorization
  | route dispatch
  v
Controllers
  |
  | request parsing
  | response formatting
  | HTTP status handling
  v
Services
  |
  | business rules
  | validation
  | data relationships
  | audit events
  v
JsonRepository
  |
  | findAll
  | findById
  | findOne
  | create
  | update
  | delete
  v
JSON files in server/data/
```

### Request lifecycle example: check-in

```text
Front Desk clicks Check In
  -> client/src/pages/CheckIn.jsx
  -> client/src/services/visitService.js
  -> Axios request: POST /api/visits/:id/check-in
  -> x-user-role and x-user-id headers added by api.js
  -> server/middleware/authorize.js validates the session
  -> server/routes/visitRoutes.js checks Front Desk/Admin permission
  -> server/controllers/visitController.js builds the trusted operation
  -> server/services/visitService.js validates invitation and visit state
  -> JsonRepository updates server/data/visits.json
  -> auditService writes VISITOR_CHECKED_IN
  -> response returns to Axios
  -> React refreshes the visit list and displays a toast
```

The frontend never directly reads or writes the JSON files.

## 4. Repository Structure

```text
visitorMS/
|-- package.json                 Root scripts for install, dev, start, test
|-- .env.example                 Runtime variable template
|-- README.md                    General project documentation
|-- FINAL_PROJECT_GUIDE.md       This complete handoff guide
|-- FINAL_FEATURE_INVENTORY.md   Feature-by-feature inventory
|-- FINAL_ROLE_PERMISSION_MATRIX.md
|-- FINAL_QA_REPORT.md           Verified QA evidence and remaining gaps
|-- DEPLOYMENT_CHECKLIST.md
|
|-- client/
|   |-- package.json
|   |-- index.html
|   |-- vite.config.js
|   |-- tailwind.config.js
|   |-- postcss.config.js
|   `-- src/
|       |-- main.jsx             React entrypoint
|       |-- App.jsx              Browser routes and RoleRoute wrappers
|       |-- index.css             Global styles
|       |-- auth/permissions.js   Central frontend permission map
|       |-- context/
|       |   |-- AuthContext.jsx   Demo session and persona switching
|       |   `-- ToastContext.jsx   User notifications
|       |-- services/             Axios API wrappers
|       |-- components/           Reusable layout, UI, dashboard, invitation, visitor components
|       `-- pages/                Route-level screens
|
`-- server/
    |-- package.json
    |-- server.js                 Express application entrypoint
    |-- routes/                   Endpoint registration and role gates
    |-- controllers/              HTTP request/response handlers
    |-- services/                 Business logic
    |-- repositories/             JSON data access
    |-- middleware/               Authentication, errors, 404 handling
    |-- utils/                    Dates, validation, ID generation
    |-- data/                     Persistent JSON records
    `-- test/vms.test.js          Automated regression suite
```

## 5. Frontend Application

### Entry and routing

`client/src/main.jsx` mounts the React application. `client/src/App.jsx` creates the browser router, authentication provider, toast provider, and application layout.

The main routes are:

| Route | Page | Allowed roles |
|---|---|---|
| `/login` | Login | Public demo entry |
| `/dashboard` | Dashboard | Employee, Front Desk, Admin |
| `/invite` | InviteVisitor | Employee, Admin |
| `/approvals` | Approvals | Employee, Admin |
| `/pre-approvals` | PreApproval | Employee, Admin |
| `/visitors` | Visitors | Employee, Front Desk, Admin |
| `/visitors/:id` | VisitorDetailsPage | Employee, Front Desk, Admin |
| `/check-in` | CheckIn | Front Desk, Admin |
| `/check-out` | CheckOut | Front Desk, Admin |
| `/activity` | ActivityLogs | Front Desk, Admin |

`RoleRoute` blocks direct navigation to a route when the current role is not allowed. The backend independently checks every protected API request.

### Centralized frontend permissions

`client/src/auth/permissions.js` is the frontend permission source of truth. It contains:

- The three role names.
- Permissions assigned to each role.
- `hasPermission(role, permission)` for action checks.
- `rolesFor(permission)` for route and navigation checks.

The sidebar, route definitions, guest registration button, visitor operational buttons, and dashboard action buttons use this permission map.

### Authentication model

This is a local demonstration authentication model, not production identity authentication.

When a user selects a persona on the Login page, `AuthContext` stores a session in browser `localStorage`:

```json
{
  "userId": "EMP-001",
  "name": "Rahul Sharma",
  "role": "Employee",
  "employeeId": "EMP-001",
  "title": "VP of Engineering (Host)"
}
```

`client/src/services/api.js` reads that session and adds:

```text
x-user-role: Employee
x-user-id: EMP-001
```

to API requests. The backend validates the role and ID combination against the allowed demo identities. Client headers are not treated as trusted identity in a real deployment; a real authentication provider would replace this mechanism.

### Main frontend components

#### Layout components

- `AppLayout`: shared shell around authenticated pages.
- `Sidebar`: role-filtered navigation, persona switcher, profile summary, logout.
- `Navbar`: top-level workspace header.
- `PageHeader`: reusable page title and action area.
- `RoleRoute`: frontend access guard.

#### UI components

- `Button`: consistent action button variants and loading states.
- `Input`: labeled text and date/time fields.
- `Select`: labeled select fields.
- `Modal`: reusable modal surface.
- `ConfirmDialog`: confirmation for destructive or state-changing actions.
- `Badge`: status display.
- `EmptyState`: no-result display.
- `LoadingSpinner`: loading display.

#### Invitation components

- `GuestSearch`: searches registered visitors and selects a guest.
- `SelectedGuests`: displays selected guests and supports removal.

#### Visitor components

- `VisitorTable`: visitor/visit records, status, pagination, details, pass, and operational actions.
- `VisitorFilters`: status, office, date, and search filters.
- `VisitorDetailsModal`: detailed visit information and permitted actions.
- `VisitorPassModal`: QR/e-pass presentation.
- `VisitorRegistrationModal`: walk-in visitor registration with photo capture/upload.

## 6. Backend Application

### Server startup

`server/server.js`:

1. Loads environment variables.
2. Creates the Express app.
3. Enables CORS.
4. Enables JSON and URL-encoded request parsing with a 10 MB limit.
5. Enables Morgan request logging.
6. Extracts and validates the demo identity headers.
7. Registers `/api/health`.
8. Registers all API routers.
9. Registers 404 and centralized error handlers.
10. Listens on `PORT`, defaulting to 5000.

Health endpoint:

```text
GET http://localhost:5000/api/health
```

Successful response:

```json
{
  "status": "healthy",
  "service": "Visitor Management System (VMS) API",
  "timestamp": "2026-09-22T14:32:55.202Z"
}
```

### Middleware

#### `authorize.js`

- Reads `x-user-role` and `x-user-id`.
- Validates that the ID is valid for the role.
- Creates `req.user` only for a valid combination.
- Returns 401 for missing/invalid sessions.
- `requireRoles([...])` returns 403 when an authenticated role is not permitted.

Demo identity rules:

- Employee: `EMP-001` through `EMP-010`
- Front Desk: `SEC-001`
- Admin: `EMP-009`

#### `errorHandler.js`

Converts thrown service errors into a consistent response:

```json
{
  "success": false,
  "message": "Human-readable error",
  "errors": null
}
```

It logs the request and error server-side without returning stack traces to the client.

#### `notFound.js`

Handles unmatched endpoints with a structured 404 response.

## 7. Backend Routes and APIs

All protected routes require the session headers described above.

### Health

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Server health check |

### Dashboard

| Method | Endpoint | Roles | Purpose |
|---|---|---|---|
| GET | `/api/dashboard/stats` | Employee, Front Desk, Admin | Dynamic dashboard statistics and recent activity |

Dashboard calculations come from persisted visits and invitations. The service filters visits to the current calendar date and calculates:

- `totalVisitors`
- `expected`
- `checkedIn`
- `checkedOut`
- `pendingApprovals`
- `overstay`

Employee dashboards are scoped to the authenticated employee host.

### Employees

| Method | Endpoint | Roles | Purpose |
|---|---|---|---|
| GET | `/api/employees` | Employee, Admin | Host directory lookup |
| GET | `/api/employees/:id` | Employee, Admin | Employee detail |

The current implementation provides employee directory reads. Full employee CRUD, role assignment, office management, and policy management are not implemented as separate APIs.

### Visitors

| Method | Endpoint | Roles | Purpose |
|---|---|---|---|
| GET | `/api/visitors` | Employee, Front Desk, Admin | Search visitor profiles |
| GET | `/api/visitors/:id` | Employee, Front Desk, Admin | Visitor profile detail |
| POST | `/api/visitors` | Front Desk, Admin | Register walk-in visitor |
| PATCH | `/api/visitors/:id` | Front Desk, Admin | Update visitor profile |

Visitor search checks name, email, phone, company, and ID number.

Registration validates required fields and stores an optional base64/photo URL value.

### Invitations

| Method | Endpoint | Roles | Purpose |
|---|---|---|---|
| GET | `/api/invitations` | Employee, Front Desk, Admin | List invitations with filters |
| GET | `/api/invitations/:id` | Employee, Front Desk, Admin | Invitation detail |
| POST | `/api/invitations` | Employee, Admin | Create standard invitation |
| POST | `/api/invitations/pre-approve` | Employee, Admin | Create pre-approved invitation |
| PATCH | `/api/invitations/:id/pre-approve` | Employee, Admin | Registered route for pre-approval flow |
| PATCH | `/api/invitations/:id/approve` | Employee, Admin | Approve pending invitation |
| PATCH | `/api/invitations/:id/reject` | Employee, Admin | Reject pending invitation |

Employee list and detail responses are scoped to the authenticated employee host. An Employee creating an invitation cannot substitute another host ID; the backend uses the authenticated employee ID.

For approval/rejection, an Employee can act only on their own hosted invitation. Admin can act organization-wide. Front Desk cannot approve or reject.

### Visits

| Method | Endpoint | Roles | Purpose |
|---|---|---|---|
| GET | `/api/visits` | Employee, Front Desk, Admin | Visit search and filtering |
| GET | `/api/visits/:id` | Employee, Front Desk, Admin | Visit detail |
| POST | `/api/visits/check-in` | Front Desk, Admin | Check in by invitation/visitor reference |
| POST | `/api/visits/:id/check-in` | Front Desk, Admin | Check in a specific visit |
| POST | `/api/visits/:id/check-out` | Front Desk, Admin | Check out a specific visit |

Employee list/detail results are restricted to the employee's host ID. Front Desk and Admin can access operational records allowed by their role.

### Activity logs

| Method | Endpoint | Roles | Purpose |
|---|---|---|---|
| GET | `/api/activity-logs` | Front Desk, Admin | Read security/audit activity |

Employees cannot access unrestricted activity logs.

### Admin configuration

| Method | Endpoint | Roles | Purpose |
|---|---|---|---|
| GET | `/api/admin/config` | Admin | Read system configuration |
| PATCH | `/api/admin/config` | Admin | Update system configuration |

## 8. Data Model and Relationships

### `employees.json`

Stores host and administrator directory records.

Important fields:

- `id`
- `name`
- `email`
- `phone`
- `department`
- `designation`
- `office`
- `avatar`

### `visitors.json`

Stores reusable visitor profiles.

Important fields:

- `id`
- `name`
- `email`
- `phone`
- `company`
- `idType`
- `idNumber`
- `photo`
- `createdAt`

### `invitations.json`

Stores the business request created by a host.

Important fields:

- `id`
- `eventTitle`
- `visitType`
- `office`
- `date`
- `startTime`
- `endTime`
- `hostId`
- `guestIds`
- `note`
- `status`
- `createdAt`
- approval/rejection metadata when applicable

Invitation status values include:

- `PENDING`
- `APPROVED`
- `REJECTED`
- `PRE-APPROVED`

### `visits.json`

Stores one visit lifecycle record per invitation guest.

Important fields:

- `id`
- `invitationId`
- `visitorId`
- `hostId`
- `office`
- `date`
- `scheduledStartTime`
- `scheduledEndTime`
- `checkInTime`
- `checkOutTime`
- `duration`
- `status`
- `notes`

Visit status values include:

- `EXPECTED`
- `CHECKED_IN`
- `CHECKED_OUT`
- `REJECTED`

`OVERSTAY` is a calculated effective status for an active checked-in visit whose scheduled end time has passed. The stored visit remains `CHECKED_IN` until checkout, preserving the underlying lifecycle state.

### `activityLogs.json`

Stores audit events such as:

- `INVITATION_CREATED`
- `INVITATION_APPROVED`
- `INVITATION_REJECTED`
- `PRE_APPROVAL_CREATED`
- `VISITOR_REGISTERED`
- `VISITOR_CHECKED_IN`
- `VISITOR_CHECKED_OUT`

Each log includes an action, actor, role, timestamp, related record IDs, and details.

### Relationship map

```text
Employee.id
  -> Invitation.hostId
  -> Visit.hostId

Visitor.id
  -> Invitation.guestIds[]
  -> Visit.visitorId

Invitation.id
  -> Visit.invitationId
  -> ActivityLog.invitationId

Visitor.id
  -> ActivityLog.visitorId
```

The service layer populates relationships for frontend responses. JSON files store IDs rather than duplicated full entity objects.

## 9. Role Model

### Employee / Host

Business purpose: manage visitors coming to the employee.

Employee can:

- Login/logout in demo mode.
- View a host-focused dashboard.
- Create invitations.
- Search and select registered visitors.
- Add/remove multiple guests.
- View their own invitation records.
- View their own visit records.
- Pre-approve visitors.
- View visitor details and passes.
- Approve/reject their own hosted invitations according to the current workflow.

Employee cannot:

- Check visitors in or out.
- Register walk-in visitors.
- View another employee's private invitation or visit records.
- View unrestricted activity logs.
- Manage system configuration.
- Manage employee accounts or global policies.

### Front Desk / Security

Business purpose: control physical visitor entry and exit.

Front Desk can:

- View operational visitor records.
- Search visitors and invitations.
- View expected visitors.
- Verify approved/pre-approved visitors.
- Check visitors in.
- Check visitors out.
- Monitor overstays.
- Register walk-in visitors.
- Capture visitor photos.
- View security-relevant activity logs.

Front Desk cannot:

- Create invitations.
- Approve or reject business invitations.
- Manage employees.
- Change roles.
- Manage system configuration.

### Admin

Business purpose: manage the organization and VMS.

Admin can:

- View organization-wide dashboards and records.
- Approve/reject invitations.
- Create invitations and pre-approvals when needed.
- Register visitors.
- Check visitors in or out when administrative intervention is required.
- View activity logs.
- Access admin configuration endpoints.
- Review organization-wide data.

The current repository contains admin configuration endpoints and employee directory access, but does not contain complete CRUD pages for offices, visitor types, policies, reports, or employee activation/deactivation.

## 10. Main Business Workflows

### Standard invitation

1. Employee opens `/invite`.
2. Employee fills event title, visit type, office, date, start/end time, host, note, and guests.
3. `validateInvitationPayload` rejects missing fields, invalid times, missing guests, or invalid structure.
4. Frontend posts to `POST /api/invitations`.
5. Backend forces an Employee's `hostId` to the authenticated employee ID.
6. `InvitationService` creates an invitation with `PENDING` status.
7. One `EXPECTED` visit is created per guest.
8. An invitation audit event is written.
9. The created invitation and populated host/guest data are returned.

### Approval

1. Authorized Employee or Admin opens `/approvals`.
2. Pending invitations are loaded.
3. Admin can review organization-wide pending records.
4. Employee sees records assigned to that employee.
5. Approve or reject opens a confirmation dialog.
6. Backend validates the current state is `PENDING`.
7. Approved invitations become `APPROVED` and receive approval metadata.
8. Rejected invitations become `REJECTED`; matching visits also become `REJECTED`.
9. Audit activity is written.

Invalid transitions such as Approved -> Approved or Rejected -> Approved are rejected.

### Pre-approval

1. Employee or Admin opens `/pre-approvals`.
2. Visitor and meeting details are entered.
3. Backend creates the invitation directly with `PRE-APPROVED` status.
4. Scheduled visit records are created.
5. The visitor pass modal displays the resulting invitation reference and QR code.

### Check-in

1. Front Desk opens `/check-in` or selects an expected visit from the directory.
2. The operator supplies an invitation or visit reference.
3. Backend finds the visit and associated invitation.
4. It rejects unknown invitations, rejected invitations, pending invitations, already checked-in visits, and checked-out visits.
5. Approved and pre-approved visits are updated to `CHECKED_IN`.
6. `checkInTime` is recorded using an ISO timestamp.
7. `VISITOR_CHECKED_IN` is written to the audit log.
8. The frontend refreshes its data after the request completes.

### Check-out

1. Front Desk opens `/check-out` or selects an active visit.
2. The operator confirms departure.
3. Backend rejects missing, expected, or already checked-out visits.
4. The visit becomes `CHECKED_OUT`.
5. `checkOutTime` is recorded.
6. Duration is calculated from check-in to check-out.
7. `VISITOR_CHECKED_OUT` is written.
8. The frontend refreshes the list and dashboard.

### Overstay

1. `dateUtils.isVisitorOverstaying` checks only active `CHECKED_IN` visits.
2. It compares the current time with the visit's scheduled date and end time.
3. The service adds `isOverstay`, `overstayMinutes`, and `effectiveStatus` to the response.
4. The underlying visit remains `CHECKED_IN` until checkout.
5. After checkout, the historical record remains `CHECKED_OUT` and retains its timestamps and duration.

### Walk-in registration

1. Front Desk or Admin opens the visitor registration modal.
2. Required visitor identity fields are validated.
3. Optional file or webcam photo data is submitted.
4. Backend validates the payload and creates a visitor profile.
5. A `VISITOR_REGISTERED` audit event is written.
6. The visitor becomes searchable for future invitations.

## 11. Validation and Business Rules

Current important rules include:

- Event title is required.
- Office, date, visit type, start time, end time, host, and at least one guest are required for an invitation.
- End time must be after start time.
- A rejected invitation cannot be checked in.
- Only Approved or Pre-Approved invitations can be checked in.
- A visit cannot be checked in twice.
- A checked-out visit cannot be checked in again.
- A visitor cannot be checked out before checking in.
- A visitor cannot be checked out twice.
- Invalid role/user sessions are rejected.
- Employees cannot read another employee's invitation or visit record.
- Front Desk cannot create invitations or approve/reject invitations.
- Employee cannot call check-in/check-out APIs.

## 12. API Client Services

Frontend service files keep API calls separate from page components:

- `api.js`: Axios instance, base URL, session headers, normalized errors.
- `dashboardService.js`: dashboard stats.
- `employeeService.js`: employee lookup.
- `visitorService.js`: visitor list, detail, registration, update.
- `invitationService.js`: invitation list, create, approve, reject, pre-approve.
- `visitService.js`: visit list, detail, check-in, check-out.
- `auditService.js`: activity log access.

This structure lets pages focus on rendering and user interaction while service files define endpoint calls.

## 13. Error Handling

The backend uses these general statuses:

- `200 OK`: successful read/update/action.
- `201 Created`: successful creation.
- `400 Bad Request`: invalid input or invalid state transition.
- `401 Unauthorized`: missing or invalid session.
- `403 Forbidden`: valid session but role/action is not allowed.
- `404 Not Found`: resource or route does not exist.
- `409 Conflict`: duplicate state operation such as checking in twice or checking out twice.
- `500 Internal Server Error`: unexpected server-side failure.

The frontend Axios interceptor converts server and network errors into user-facing messages. Network failures use a message similar to:

```text
Unable to reach the server. Please ensure the backend is running.
```

## 14. Installation and Running

### Requirements

- Node.js 18 or newer.
- npm.
- A writable filesystem for `server/data/`.

### Install all packages

From the project root:

```bash
npm run install:all
```

Equivalent manual installation:

```bash
npm install
cd server
npm install
cd ../client
npm install
```

### Environment variables

Root `.env.example`:

```env
PORT=5000
VITE_API_URL=http://localhost:5000/api
```

`PORT` configures the Express server. `VITE_API_URL` configures the frontend API base URL. In Vite, variables used by the browser must use the `VITE_` prefix.

### Development mode

Run both applications from the root:

```bash
npm run dev
```

Or run them separately:

```bash
cd server
npm run dev
```

```bash
cd client
npm run dev
```

Default URLs:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- Health: `http://localhost:5000/api/health`

### Production frontend build

```bash
cd client
npm run build
```

The output is written to `client/dist/`.

### Backend production start

```bash
cd server
npm start
```

### Tests

From the root:

```bash
npm test
```

Directly in the server:

```bash
cd server
npm test
```

## 15. Root Scripts

| Script | Command | Purpose |
|---|---|---|
| `npm run install:all` | Installs root, server, and client packages | Initial setup |
| `npm run dev` | Starts server and client concurrently | Development |
| `npm run server` | Starts server dev mode | Backend only |
| `npm run client` | Starts client dev mode | Frontend only |
| `npm start` | Starts server | Runtime backend |
| `npm test` | Runs server tests | Regression testing |

## 16. Testing Evidence

The current verified automated baseline is:

- Backend test suite: 32 passing, 0 failing.
- Frontend production build: passing.
- Backend health endpoint: HTTP 200 while server is running.
- JSON files: valid JSON with unique primary IDs.
- Invalid role/user combinations: tested and rejected with 401.
- Unauthenticated dashboard/invitation reads: tested and rejected with 401.
- Employee invitation and visit list/detail isolation: tested.
- Duplicate check-in and duplicate check-out rules: tested.
- Front Desk and Employee authorization boundaries: tested.

Browser-level audits for every requested viewport, accessibility, QR verification behavior, network failure recovery, and full browser console review remain `UNVERIFIED` unless manually executed in a browser session.

## 17. Data Persistence and Safety

`JsonRepository` reads the target JSON file for each operation and writes updates through a temporary file followed by rename. This reduces the chance of leaving a partially written JSON file after a normal write failure.

However, JSON storage has important limitations:

- It is not a transactional database.
- It is not safe for many concurrent writers.
- It is not horizontally scalable.
- It requires a persistent disk in deployment.
- Ephemeral hosting platforms can erase records after restart or redeploy.
- A future production system should migrate to a transactional database while preserving the service interfaces.

Do not delete or replace `server/data/` during a demonstration unless a reset is intentional. Live browser testing changes the JSON records.

## 18. Security Model and Limitations

Implemented protections:

- Backend route role gates.
- Validated role/user combinations.
- Employee host-level data isolation.
- Trusted server-side actor identity instead of request-body actor fields.
- Consistent 401/403 responses.
- No stack traces returned to frontend clients.
- Configurable frontend API URL.

Demo limitations:

- Login is persona selection, not real authentication.
- There are no passwords, sessions, JWTs, refresh tokens, or external identity providers.
- Client localStorage can be edited by a user.
- CORS is currently permissive for local development.
- JSON files contain application state directly on disk.
- A real deployment requires HTTPS, real authentication, restrictive CORS, secret management, rate limiting, and a database or transactional persistence layer.

## 19. Known Scope Boundaries

The current implementation does not provide complete standalone pages or APIs for every possible enterprise feature. The following are documented boundaries rather than hidden assumptions:

- Full employee create/update/deactivate management is not implemented.
- Complete office management is not implemented.
- Global visitor-type management is not implemented.
- Policy management is not implemented.
- Dedicated reports and trend pages are not implemented beyond dashboard statistics.
- Settings are represented by the existing admin configuration endpoints, not a complete settings console.
- QR generation is implemented in the client pass modal; deep QR scanner/device validation requires further browser/device testing.
- Responsive, accessibility, and browser-console audits require manual browser execution across the requested viewport matrix.

## 20. Recommended Demonstration Sequence

### Employee

1. Open `/login`.
2. Select Employee.
3. Open Dashboard.
4. Open Invite Visitor.
5. Search/select a visitor.
6. Create an invitation.
7. Open Approvals and review the host-owned request.
8. Open Pre-Approvals to create a fast-track pass.
9. Open My Visitors.
10. Confirm Check-In and Check-Out actions are not visible.
11. Refresh the page and verify records persist.
12. Logout.

### Front Desk

1. Select Front Desk.
2. Open Dashboard.
3. Search expected visitors.
4. Verify invitation status.
5. Check in an approved/pre-approved visitor.
6. Refresh and verify the checked-in state remains stable.
7. Open Check-Out.
8. Check out the visitor.
9. Confirm duration and activity log.
10. Register a walk-in visitor.
11. Logout.

### Admin

1. Select Admin.
2. Review the organization dashboard.
3. Open Approvals.
4. Approve or reject pending invitations.
5. Review Visitors and visits.
6. Check operational records when necessary.
7. Open Activity Logs.
8. Open admin configuration endpoints/pages available in the current build.
9. Logout.

## 21. Final Status

The current repository has:

- A working React/Vite frontend.
- A working Express backend.
- JSON persistence with repository abstraction.
- Three role personas with differentiated UI and backend authorization.
- Invitation, approval, pre-approval, visitor registration, check-in, check-out, overstay, QR display, search, filtering, dashboard, and audit workflows.
- 32 passing backend regression tests.
- A passing frontend production build.
- Updated feature, role, QA, and deployment documentation.

The application is ready for demonstration and single-instance deployment within the JSON persistence limitation. It should not be described as fully production-secure authentication or horizontally scalable until the demo identity model and JSON persistence are replaced.
