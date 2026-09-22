# Deployment Checklist

## Prerequisites

- Node.js 18+ installed
- npm installed
- Access to a filesystem that will persist JSON data

## Required environment variables

Create a `.env` file in the project root or in the `server` directory before running the app if needed.

```env
PORT=5000
```

Frontend runtime uses:

```env
VITE_API_URL=http://localhost:5000/api
```

## Steps

1. Install dependencies:
   ```bash
   npm install
   cd server && npm install
   cd ../client && npm install
   ```
2. Start backend:
   ```bash
   cd server
   npm start
   ```
3. Start frontend:
   ```bash
   cd client
   npm run dev
   ```
4. Verify the API health endpoint:
   ```bash
   http://localhost:5000/api/health
   ```
5. Verify the app loads on the expected front-end URL.
6. Run the test suite:
   ```bash
   cd server && npm test
   ```
7. Run production build:
   ```bash
   cd client && npm run build
   ```

## Deployment note for JSON persistence

This project stores state in local JSON files. That is suitable for a prototype or assignment deployment, but it is not horizontally scalable and is not ideal for multi-instance production systems. If deployed on an ephemeral filesystem, the JSON data must be mounted to a persistent volume or migrated to a database later.

## Verification status

- Backend regression suite: 32 passing, 0 failing.
- Frontend production build: passing.
- Health endpoint: verified HTTP 200 while the backend process was running.
- Server role/session validation and employee record isolation: covered by automated regression tests.
- Sensitive values are not committed to source control.
- Runtime configuration is handled via environment variables.
- Browser responsive, accessibility, QR verification, and network-failure audits: UNVERIFIED and must be completed before a public production launch.
