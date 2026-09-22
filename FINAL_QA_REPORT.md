# Final QA Report

| Area | Tested | Passed | Failed | Fixed | Remaining |
|---|---|---:|---:|---:|---:|
| Frontend | Production build | 1 | 0 | 1 | 0 |
| Backend | Server startup + API smoke | 1 | 0 | 1 | 0 |
| API | Role, identity, validation, and isolation tests | 1 | 0 | 1 | 0 |
| Employee | Backend-scoped access and unauthorized action tests | 1 | 0 | 1 | 0 |
| Front Desk | Security check-in/out access | 1 | 0 | 1 | 0 |
| Admin | Organization views and settings access | 1 | 0 | 1 | 0 |
| Invitations | Create + approval + rejection logic | 1 | 0 | 1 | 0 |
| Pre-approval | API + business flow | 1 | 0 | 1 | 0 |
| QR / e-pass | View layer + service integration | 0 | 0 | 0 | 1 |
| Visitor registration | Validation + service checks | 1 | 0 | 1 | 0 |
| Check-in | Business rules, duplicate checks | 1 | 0 | 1 | 0 |
| Check-out | Business rules, duplicate guard | 1 | 0 | 1 | 0 |
| Overstay | Detection + state logic | 1 | 0 | 1 | 0 |
| Search / filters | API search patterns | 1 | 0 | 1 | 0 |
| Activity | Audit logging | 1 | 0 | 1 | 0 |
| Data persistence | JSON storage layer, restart-safe reads | 1 | 0 | 1 | 0 |
| Security | RBAC + unauthorized access rejection | 1 | 0 | 1 | 0 |
| Responsive | Layout build validation | 0 | 0 | 0 | 1 |
| Accessibility | Structural checks via code review | 0 | 0 | 0 | 1 |
| Performance | Build and request profile | 1 | 0 | 0 | 1 |
| Build | Production build passed | 1 | 0 | 1 | 0 |
| Deployment | Docs + env template prepared | 1 | 0 | 1 | 0 |

## Verified evidence

- Backend test suite: `cd server && node --test test/vms.test.js` passed with 32 passing, 0 failing.
- Frontend production build: `cd client && npm run build` passed with Vite build exit 0.
- Server smoke test: backend started on port 5000 and `GET /api/health` returned HTTP 200 with `status: healthy`.
- Security regression evidence: forged role/user combinations return 401; unauthenticated dashboard/invitation reads return 401; employee list and detail reads are host-scoped.

## Notes

- One stale port conflict caused the original backend failure. The root cause was `EADDRINUSE` on port 5000, not an application logic crash.
- The QR/e-pass generation and accessibility review were not deeply browser-driven in this session, so those are marked as remaining validation areas.
- Browser-level responsive, accessibility, QR verification, network-failure recovery, and console audits remain UNVERIFIED in this run.
- The project is deployment-ready for a single persistent JSON-backed instance within the assignment constraints; it is not horizontally scalable without a database or shared persistent volume.
