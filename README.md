# Visitor Management System (VMS)

A robust, full-stack workplace Visitor Management & Security Access Suite simulating real-world enterprise visitor clearance, check-in, check-out, QR e-pass generation, and overstay tracking.

---

## Table of Contents
1. [Overview](#overview)
2. [Problem Statement](#problem-statement)
3. [Features](#features)
4. [Technology Stack](#technology-stack)
5. [Architecture](#architecture)
6. [Project Structure](#project-structure)
7. [Setup Instructions](#setup-instructions)
8. [Running the Application](#running-the-application)
9. [API Documentation](#api-documentation)
10. [User Roles](#user-roles)
11. [Visitor Workflow](#visitor-workflow)
12. [Business Rules](#business-rules)
13. [Error Handling](#error-handling)
14. [Complexity Analysis](#complexity-analysis)
15. [Performance Considerations](#performance-considerations)
16. [Scalability](#scalability)
17. [Security Considerations](#security-considerations)
18. [Screenshots](#screenshots)
19. [Demo Video & Live Walkthrough](#demo-video--live-walkthrough)
20. [Future Improvements](#future-improvements)

---

## Overview

The **Visitor Management System (VMS)** is an end-to-end web application developed to modernize workplace visitor reception, enhance physical security protocols, eliminate manual paper sign-in logs, and provide comprehensive real-time auditability. 

The system provides separate, tailored workflows for **Hosts (Employees)**, **Reception & Security Personnel (Front Desk)**, and **Facility Administrators (Admin)**. It persists data reliably via a decoupled backend **JSON Repository layer**, avoiding external database connection hurdles or cloud credential setups while remaining completely database-agnostic for future production migrations.

---

## Problem Statement

Traditional corporate visitor handling suffers from:
- **Security Gaps**: Manual paper logbooks lack identity verification, photo matching, and real-time validation against authorized host requests.
- **Overstay Blindspots**: Inability to identify when an external guest remains in the facility past their scheduled meeting window.
- **Reception Bottlenecks**: Lengthy registration times at security desks during peak office hours.
- **Unverified Access**: Unclear approval chains between employees scheduling visits and facility managers granting clearance.
- **Audit Deficiencies**: Difficulty tracing historical entries, exits, durations, and approving authorities during compliance audits.

VMS addresses these challenges through a unified digital workspace featuring QR e-pass generation, automated duration tracking, instantaneous overstay alerts, and immutable event auditing.

---

## Features

- **Multi-Role Experience**: Effortlessly switch between `Employee (Host)`, `Front Desk (Security)`, and `Admin (Facilities)` personas.
- **Real-Time Analytics Dashboard**: Live metrics tracking Total Visitors, Expected, Checked In, Concluded Visits, Pending Clearance, and Active Overstays.
- **Advance Visitor Invitations**: Corporate scheduling interface supporting multiple guests, host designation, office locations, meeting purposes, and time window validation.
- **Security Approval Workflow**: Facilities management portal to review, approve, or reject access requests with reason documentation.
- **Instant Pre-Approvals**: Fast-track VIP / vendor passes with guaranteed approval and automated local QR issuance.
- **Client-Side QR Code e-Passes**: High-contrast, printable digital passes encoding unique invitation references locally without third-party API exposure.
- **Reception Check-In Terminal**: Fast lookup by scanning pass QR code or typing Invitation ID, enforcing arrival clearance criteria.
- **Reception Check-Out Terminal**: Real-time on-site queue with live duration calculation and instant pass revocation.
- **Dynamic Overstay Detection**: Non-destructive, runtime timestamp evaluation flagging checked-in visitors whose meeting end window has lapsed.
- **Visitor Registration with Photo**: Flexible identity capture supporting local file upload and live webcam photography with base64 storage.
- **Filterable Directory & Pagination**: Case-insensitive multi-attribute search (name, phone, company, host, invitation ID) with status and office filters.
- **Comprehensive Audit Trail**: Chronological event stream logging actor, role, entity IDs, timestamps, and action metadata.

---

## Technology Stack

### Frontend
- **React.js 18**: Component-based UI with hooks and Context API.
- **Vite 6**: High-speed build tooling and local development server.
- **Tailwind CSS 3**: Clean, corporate utility styling with cohesive typography and subtle micro-interactions.
- **React Router 6**: Client-side routing with layout wrappers and role-filtered navigation.
- **Axios**: Promised-based HTTP client with centralized interceptors for error normalization.
- **Lucide React**: Clean, accessible SVG iconography.
- **qrcode.react**: Client-side SVG QR code generator (no external QR APIs).

### Backend
- **Node.js**: Asynchronous event-driven runtime environment.
- **Express.js 4**: RESTful API framework with centralized routing and middleware.
- **Morgan**: HTTP request logger middleware for server monitoring.
- **CORS & Dotenv**: Cross-Origin Resource Sharing control and environment configuration.

### Data Storage
- **Decoupled JSON Repository Layer**: File-backed storage via Node `fs/promises`.
- **Zero External Dependencies**: Operates out of the box without requiring MongoDB, MySQL, Postgres, Firebase, or Supabase credentials.

---

## Architecture

The system enforces a strict 5-layer decoupled architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                 React Frontend (Vite)                       │
│  Pages | UI Components | Context (Auth/Toast) | Axios Client │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / REST (JSON)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Express REST API Server                     │
│    Routes | Controller Layer | Request & Body Parsing       │
└──────────────────────────────┬──────────────────────────────┘
                               │ Service Method Calls
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Services & Business Logic                   │
│   VisitService | InvitationService | DashboardService etc.  │
│   • Rule Validation • Overstay Evaluation • Audit Logging    │
└──────────────────────────────┬──────────────────────────────┘
                               │ Abstract Data Access
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              JSON Repository (Data Access Layer)            │
│   findAll() | findById() | findOne() | create() | update()   │
└──────────────────────────────┬──────────────────────────────┘
                               │ Asynchronous I/O
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     Local JSON Files                        │
│ employees.json | visitors.json | invitations.json | visits..│
└─────────────────────────────────────────────────────────────┘
```

> **Key Architectural Rule**: The frontend never directly reads or mutates JSON files. All state transitions, validation checks, and persistence operations flow strictly through the Express REST API.

---

## Project Structure

```
visitor-management-system/
├── client/                               # React + Vite Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/                # StatCard, ActivityList
│   │   │   ├── invitation/               # GuestSearch, SelectedGuests
│   │   │   ├── layout/                   # AppLayout, Navbar, PageHeader, Sidebar
│   │   │   ├── ui/                       # Button, Input, Select, Modal, Badge, etc.
│   │   │   └── visitors/                 # VisitorTable, Filters, Modals (Pass, Register, Details)
│   │   ├── context/                      # AuthContext, ToastContext
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx             # Key metrics & today's queue
│   │   │   ├── InviteVisitor.jsx         # Create invitation form
│   │   │   ├── Approvals.jsx             # Admin clearance workflow
│   │   │   ├── PreApproval.jsx           # Instant pre-approved passes
│   │   │   ├── Visitors.jsx              # Full directory with filters
│   │   │   ├── VisitorDetailsPage.jsx    # Detailed profile & history (/visitors/:id)
│   │   │   ├── CheckIn.jsx               # Reception arrival terminal
│   │   │   ├── CheckOut.jsx              # Reception departure terminal
│   │   │   ├── ActivityLogs.jsx          # Security audit trail
│   │   │   ├── Login.jsx                 # Role selection entry screen
│   │   │   └── NotFound.jsx              # 404 fallback page
│   │   ├── services/                     # Axios API clients
│   │   ├── App.jsx                       # Routing configuration
│   │   ├── main.jsx                      # Entrypoint
│   │   └── index.css                     # Global styles
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                               # Node.js + Express Backend
│   ├── controllers/                      # HTTP request handlers
│   │   ├── employeeController.js
│   │   ├── visitorController.js
│   │   ├── invitationController.js
│   │   ├── visitController.js
│   │   ├── dashboardController.js
│   │   └── auditController.js
│   ├── data/                             # Mock persistent JSON storage
│   │   ├── employees.json                # 10 Workplace employee records
│   │   ├── visitors.json                 # 10 Registered visitor profiles
│   │   ├── invitations.json              # 11 Scheduled invitations
│   │   ├── visits.json                   # 9 Tracked visit instances
│   │   └── activityLogs.json             # 15 Immutable audit entries
│   ├── middleware/                       # Central error & 404 handlers
│   │   ├── errorHandler.js
│   │   └── notFound.js
│   ├── repositories/                     # Reusable data access layer
│   │   └── jsonRepository.js
│   ├── routes/                           # Express route definitions
│   ├── services/                         # Core domain logic
│   │   ├── employeeService.js
│   │   ├── visitorService.js
│   │   ├── invitationService.js
│   │   ├── visitService.js
│   │   ├── dashboardService.js
│   │   └── auditService.js
│   ├── test/                             # Automated test suite
│   │   └── vms.test.js                   # 32 unit & integration test cases
│   ├── utils/                            # Date, ID, and validation helpers
│   │   ├── dateUtils.js
│   │   ├── idGenerator.js
│   │   └── validation.js
│   ├── server.js                         # Server entrypoint
│   └── package.json
│
├── README.md                             # Comprehensive technical documentation
├── .gitignore
└── package.json                          # Monorepo startup scripts
```

---

## Setup Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation
Clone or navigate to the repository folder:

```bash
cd visitorMS
```

Install root, client, and server dependencies in one command:

```bash
npm run install:all
```

*(Alternatively, run `npm install` in root, `cd server && npm install`, and `cd client && npm install`)*.

---

## Running the Application

### Option 1: Concurrent Dev Mode (Recommended)
From the root directory, run:

```bash
npm run dev
```

This concurrently starts:
- **Backend API Server**: `http://localhost:5000`
- **Frontend React App**: `http://localhost:3000`

### Option 2: Run Separately in Individual Terminals
- **Terminal 1 (Backend)**:
  ```bash
  cd server
  npm run dev
  ```
- **Terminal 2 (Frontend)**:
  ```bash
  cd client
  npm run dev
  ```

Open your browser and navigate to `http://localhost:3000`.

### Running Automated Tests
To run the automated business rule test suite:

```bash
npm test
```

---

## API Documentation

All responses conform to a unified standard structure:
```json
{
  "success": true,
  "data": { ... },
  "message": "Human readable status string"
}
```

### 1. Dashboard Statistics
- **`GET /api/dashboard/stats`**
  - **Purpose**: Compute live aggregated metrics dynamically from actual visit records.
  - **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "stats": {
          "totalVisitors": 6,
          "expected": 3,
          "checkedIn": 1,
          "checkedOut": 2,
          "pendingApprovals": 1,
          "overstay": 1
        },
        "todayVisitors": [ ... ],
        "recentActivity": [ ... ]
      }
    }
    ```

### 2. Invitations API
- **`GET /api/invitations`**
  - **Query Parameters**: `status`, `date`, `office`, `search`
  - **Response (200 OK)**: Array of populated invitation objects with host and guest profiles.

- **`POST /api/invitations`**
  - **Purpose**: Create a new workplace meeting invitation.
  - **Request Body**:
    ```json
    {
      "eventTitle": "Quarterly Technical Audit",
      "visitType": "Business Guest",
      "office": "Mumbai Goregaon",
      "date": "2026-09-25",
      "startTime": "10:00",
      "endTime": "12:00",
      "hostId": "EMP-001",
      "guestIds": ["VIS-001"],
      "note": "Please report at reception with government ID"
    }
    ```
  - **Response (201 Created)**: Returns created invitation object with ID `INV-2026-XXXXXX`.

- **`PATCH /api/invitations/:id/approve`**
  - **Purpose**: Authorize a pending invitation.
  - **Response (200 OK)**: Status updated to `APPROVED` and audit log emitted.

- **`PATCH /api/invitations/:id/reject`**
  - **Purpose**: Decline a pending invitation.
  - **Request Body**: `{ "reason": "Room capacity exceeded" }`
  - **Response (200 OK)**: Status updated to `REJECTED`.

- **`POST /api/invitations/pre-approve`**
  - **Purpose**: Fast-track VIP or contractor clearance directly into `PRE-APPROVED` status.

### 3. Visits API (Check-In & Check-Out)
- **`GET /api/visits`**
  - **Query Parameters**: `status`, `date`, `office`, `search`
  - **Response (200 OK)**: Returns visit items with dynamic `isOverstay` and `effectiveStatus`.

- **`POST /api/visits/check-in`**
  - **Purpose**: Verify clearance and authorize entry for an approved guest.
  - **Request Body**:
    ```json
    {
      "invitationId": "INV-2026-000001",
      "performedBy": "Front Desk Security",
      "role": "Front Desk"
    }
    ```
  - **Response (200 OK)**: Sets `status = "CHECKED_IN"` and records arrival timestamp.

- **`POST /api/visits/check-out`**
  - **Purpose**: Conclude visit, record departure, and compute total stay duration.
  - **Request Body**:
    ```json
    {
      "visitId": "VST-001",
      "performedBy": "Front Desk Security",
      "role": "Front Desk"
    }
    ```
  - **Response (200 OK)**: Sets `status = "CHECKED_OUT"`, calculates duration (e.g. `"1h 45m"`), and emits departure audit log.

### 4. Visitors API
- **`GET /api/visitors`**: Retrieve all visitor directory profiles.
- **`GET /api/visitors/:id`**: Retrieve single visitor by ID.
- **`POST /api/visitors`**: Register walk-in guest with base64 photo and identity proof.

### 5. Employees & Audit
- **`GET /api/employees`**: Retrieve host employee directory.
- **`GET /api/activity-logs`**: Retrieve filterable audit log stream.

---

## User Roles

The application models three operational personas with role-tailored access:

| Feature | Employee | Front Desk | Admin |
|---------|----------|------------|-------|
| Invite Visitor | ✓ | ✗ | ✓ |
| View Own Visitors | ✓ | ✓ | ✓ |
| View All Visitors | ✗ | ✓ | ✓ |
| Pre-Approve | ✓ | ✗ | ✓ |
| Check-In | ✗ | ✓ | ✓ |
| Check-Out | ✗ | ✓ | ✓ |
| Visitor Registration | ✗ | ✓ | ✓ |
| Approve Visitor | ✓* | ✗ | ✓ |
| Manage Employees | ✗ | ✗ | ✓ |
| Manage Roles | ✗ | ✗ | ✓ |
| Manage Offices | ✗ | ✗ | ✓ |
| Manage Policies | ✗ | ✗ | ✓ |
| View Audit Logs | Limited | Limited | ✓ |
| System Settings | ✗ | ✗ | ✓ |

*Employee approval is only valid for invitations assigned to the host or designated approval workflow; Front Desk cannot approve or reject invitations.*

| Persona | Key Responsibilities & Access |
| :--- | :--- |
| **Employee (Host)** | Schedules visitor invitations, manages personal pre-approvals, views visitor directory, and tracks arrivals for their meetings. |
| **Front Desk (Security)** | Operates Check-In & Check-Out terminals, verifies QR e-passes, monitors on-site occupancy, detects overstays, and registers walk-in visitors. |
| **Administrator (Facilities)** | Full workspace visibility: reviews pending clearance requests, approves/rejects invitations, monitors system audit trails, and audits campus security. |

*Switching between personas can be accomplished instantly via the role selector dropdown in the bottom sidebar or by visiting `/login`.*

---

## Visitor Workflow

```
[Employee] Creates Invitation
        │
        ▼
[Admin] Reviews in Approvals ──────────► [Reject] (Terminates workflow)
        │
        ├─► [Approve]
        │
        ▼
[System] Issues Digital QR e-Pass (INV-2026-XXXXXX)
        │
        ▼
[Front Desk] Verifies QR Pass at Check-In Terminal
        │ (Validates approval, date, & time window)
        ▼
Status: CHECKED_IN ──► Live On-Site Tracking
        │
        ├─► (If current time > scheduledEndTime) ──► Flagged as OVERSTAY ⚠
        │
        ▼
[Front Desk] Verifies Departure at Check-Out Terminal
        │
        ▼
Status: CHECKED_OUT (Calculates total visit duration & logs audit event)
```

---

## Business Rules

1. **No Duplicate Check-In**: A visitor currently in `CHECKED_IN` status cannot be checked in again (HTTP 409 Conflict).
2. **Sequential Departure**: A visitor cannot be checked out before having checked in (HTTP 400 Bad Request).
3. **Rejection Safeguard**: A rejected invitation cannot be checked in under any circumstances (HTTP 403 Forbidden).
4. **Clearance Prerequisite**: Only invitations with `APPROVED` or `PRE-APPROVED` status can pass check-in terminal gates.
5. **Chronological Validity**: Scheduled `endTime` must be strictly after `startTime` (enforced via 24-hour minute conversion).
6. **No Duplicate Guests**: An invitation cannot include the same guest multiple times.
7. **Minimum Guest Requirement**: At least one guest must be attached to an invitation.
8. **No Double Check-Out**: A visit in `CHECKED_OUT` status cannot be checked out again (HTTP 409 Conflict).
9. **Dynamic Overstay**: Overstay status is dynamically evaluated at runtime (`now > scheduledEnd && status === 'CHECKED_IN'`), preventing database pollution on simple read queries.
10. **Immutable Audit Logging**: Every invitation creation, approval, rejection, check-in, and check-out generates a non-destructive audit entry with actor, role, and ISO timestamp.

---

## Error Handling

### Backend Error Normalization
- Handled through centralized middleware (`errorHandler.js`):
  ```json
  {
    "success": false,
    "message": "Cannot check in: This invitation has been REJECTED by management.",
    "statusCode": 403
  }
  ```
- Specific HTTP status codes utilized:
  - `200 OK` / `201 Created`: Successful operations.
  - `400 Bad Request`: Validation failure or illogical state request.
  - `403 Forbidden`: Clearance authorization denial (e.g. rejected pass).
  - `404 Not Found`: Entity not found.
  - `409 Conflict`: Duplicate check-in or checkout attempts.
  - `500 Internal Server Error`: Unhandled server-side exceptions.

### Frontend User Feedback
- Unified Axios response interceptor extracts human-readable error messages.
- Non-intrusive corporate toast notifications (`ToastContext.jsx`) communicate status changes:
  - ✓ **Success**: Green badge notification.
  - ✕ **Error**: Red warning notification.
  - ⚠ **Warning**: Amber badge for validation warnings or overstay notices.
  - ℹ **Info**: Blue information toast.

---

## Complexity Analysis

| Operation | Time Complexity | Space Complexity | Description |
| :--- | :--- | :--- | :--- |
| **Employee Search** | $\mathcal{O}(N)$ | $\mathcal{O}(1)$ | Case-insensitive substring scan across employee array. |
| **Visitor Filtering** | $\mathcal{O}(N)$ | $\mathcal{O}(K)$ | Multi-attribute scan filtering $N$ visits into $K$ matched results. |
| **Entity Hydration Map** | Average $\mathcal{O}(N)$ | $\mathcal{O}(E + V)$ | Maps employees ($E$) and visitors ($V$) into HashMaps for $\mathcal{O}(1)$ lookup during invitation hydration. |
| **Check-In Validation** | $\mathcal{O}(1)$ | $\mathcal{O}(1)$ | Key lookup in repository followed by constant-time state condition checks. |
| **Overstay Detection** | $\mathcal{O}(1)$ | $\mathcal{O}(1)$ | Runtime timestamp comparison against pre-parsed ISO dates. |
| **JSON Read / Write** | $\mathcal{O}(S)$ | $\mathcal{O}(S)$ | Serializing / deserializing JSON file of byte size $S$. |

---

## Performance Considerations

- **Debounced Search & Client Filtering**: Prevents server load spikes while typing in visitor and guest search bars.
- **Dynamic Overstay Evaluation**: Overstay status is computed on the fly rather than running a background cron worker that repeatedly mutates files.
- **Atomic-Style Async File I/O**: The JSON Repository utilizes Node's `fs/promises` to prevent blocking the event loop.
- **Single-Pass Aggregation**: Dashboard statistics are derived in a single traversal over the active dataset.
- **Client-Side QR Generation**: QR codes are rendered as inline SVG vectors on the client machine via `qrcode.react`, eliminating external API roundtrips.

---

## Scalability

### Current Implementation (Prototype / Evaluation)
- **Stack**: Single-instance Node.js + Express with local JSON persistence.
- **Fit**: Ideal for technical evaluations, local staging, offline testing, and small corporate facilities (< 100 daily visitors).

### Production Architecture Evolution
To scale to an enterprise campus network handling thousands of concurrent entries across global branches:

```
                  ┌──────────────────────┐
                  │    Cloudflare CDN    │
                  └──────────┬───────────┘
                             │
                  ┌──────────▼───────────┐
                  │  AWS ALB / NGINX LB  │
                  └──────────┬───────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
  │ Node API #1 │     │ Node API #2 │     │ Node API #3 │
  └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
         ┌───────────────────┴───────────────────┐
         ▼                                       ▼
  ┌─────────────┐                         ┌─────────────┐
  │ PostgreSQL  │                         │ Redis Cache │
  │ Primary DB  │                         │ Active Pass │
  └──────┬──────┘                         └─────────────┘
         │
         ▼
  ┌─────────────┐
  │   AWS S3    │
  │ Photo Vault │
  └─────────────┘
```

1. **Repository Replacement**: The `JsonRepository` interface matches standard ORM repository patterns. It can be swapped for a `PrismaRepository` or `TypeORMRepository` connecting to **PostgreSQL** without altering controller or service business logic.
2. **Object Storage**: Offload base64 visitor photos to an **Amazon S3** bucket, storing only CDN image URLs in the database.
3. **Redis Caching**: Cache active daily visits and authorized invitation IDs in an in-memory **Redis** cache for sub-millisecond check-in validation.
4. **Horizontal Scaling**: Stateless Express containers managed via Kubernetes or AWS ECS behind a load balancer.

---

## Security Considerations

- **CORS Restricted Access**: Cross-origin policies restrict unauthorized origins while allowing standard frontend communication.
- **Payload Size Capping**: JSON and urlencoded body parsers are restricted to 10MB to prevent denial-of-service memory exhaustion while comfortably supporting compressed base64 images.
- **No Direct Filesystem Exposure**: The client never receives server file paths or database handles.
- **Input Sanitization**: All incoming invitation and registration fields are trimmed and validated before processing.
- **No Plaintext Secrets**: The project uses `.env` variables for sensitive runtime ports and configurations with an excluded `.gitignore`.
- **Audit Tamper Resistance**: Activity logs record all state changes with non-updatable unique IDs and timestamps.

---

## Screenshots

| View | Description |
| :--- | :--- |
| **Workplace Dashboard** | High-level metrics, active overstay warning banners, today's arrivals queue, and live activity stream. |
| **Check-In Terminal** | Security reception interface with QR / Pass ID search and instant check-in verification. |
| **Check-Out Terminal** | Live on-site visitor list displaying elapsed stay duration and overstay warning chips. |
| **Digital QR e-Pass** | High-contrast printable visitor badge containing visitor photo, host info, validity window, and QR code. |
| **Approvals Portal** | Facilities workflow cards displaying pending clearance requests with 1-click authorization or rejection. |
| **Visitor Profile View** | Detailed profile at `/visitors/:id` tracking visitor identity, timeline, and associated audit events. |

---

## Demo Video & Live Walkthrough

### Complete End-to-End Evaluation Workflow

Follow this deterministic walkthrough to verify all required features in under 3 minutes:

1. **Login Screen**:
   - Open `http://localhost:3000/login`.
   - Click **Employee** persona.
2. **Invite Visitor**:
   - Navigate to **Invite Visitor** in sidebar.
   - Enter Meeting Title: `"Client Architecture Review"`.
   - Select Visit Type: `"Business Guest"` and Office: `"Mumbai Goregaon"`.
   - In **Search Guest**, type `"Rahul"` and click on **Rahul Sharma** to add him as a guest chip.
   - Click **Create Visitor Invitation**. An invitation pass with ID `INV-2026-XXXXXX` is generated.
3. **Approve Clearance**:
   - Switch role to **Admin** (using the sidebar role pill).
   - Navigate to **Approvals**.
   - Locate the newly created invitation under *Pending Approval Requests*.
   - Click **Approve Visitor**. Confirm the clearance dialog. The digital QR pass is issued.
4. **Front Desk Check-In**:
   - Switch role to **Front Desk**.
   - Navigate to **Check-In Terminal** (`/check-in`).
   - Find Rahul Sharma in *Expected Today* and click **Instant Check-In** (or paste the invitation ID into the search input).
   - Status updates to `CHECKED_IN`.
5. **Observe Dashboard & Overstay Detection**:
   - Navigate to **Dashboard** (`/dashboard`).
   - Notice the **Total Visitors**, **Checked In**, and **Overstay** metrics.
   - An alert banner highlights active overstaying guests (e.g. `VST-001`, scheduled 08:00 - 09:30 AM), demonstrating non-destructive real-time overstay detection.
6. **Front Desk Check-Out**:
   - Navigate to **Check-Out Terminal** (`/check-out`).
   - Find the visitor on campus, click **Check Out**, and confirm departure.
   - Status transitions to `CHECKED_OUT` and the exact elapsed visit duration is calculated and displayed.
7. **Audit Trail**:
   - Navigate to **Activity Logs** (`/activity`).
   - Verify every step of your demo is logged chronologically with timestamps, actor names, and roles.

---

## Future Improvements

- **Facial Recognition Integration**: Integrate facial biometric matching at security turnstiles using WebAssembly.
- **SMS / WhatsApp Notifications**: Automated SMS or WhatsApp dispatch of digital QR passes to visitors upon host approval.
- **Badge Printer Drivers**: Direct thermal printer integration (Zebra / Dymo) via WebUSB.
- **Self-Service Kiosk Mode**: Dedicated touchscreen kiosk flow for tablet-based visitor self check-in.
