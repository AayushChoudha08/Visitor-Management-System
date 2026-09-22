const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const employeeRoutes = require('./routes/employeeRoutes');
const visitorRoutes = require('./routes/visitorRoutes');
const invitationRoutes = require('./routes/invitationRoutes');
const visitRoutes = require('./routes/visitRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const auditRoutes = require('./routes/auditRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { authenticateUser } = require('./middleware/authorize');

const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-role', 'x-user-id']
}));

// Generous 10mb body parser limit for local base64 visitor photo uploads/webcam snaps
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger
app.use(morgan('dev'));

// RBAC identity extraction middleware (populates req.user)
app.use(authenticateUser);

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Visitor Management System (VMS) API',
    timestamp: new Date().toISOString()
  });
});

// REST API Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/activity-logs', auditRoutes);
app.use('/api/admin', adminRoutes);

// Fallthrough 404 and Global Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Start Server
if (require.main === module && process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 VMS Express Server is running on port ${PORT}`);
    console.log(`📡 Base API URL: http://localhost:${PORT}/api`);
    console.log(`=======================================================`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. The VMS backend may already be running at http://localhost:${PORT}/api.`);
      console.error('Stop the existing process or use a different PORT before starting another server instance.');
      process.exitCode = 1;
      return;
    }

    throw err;
  });
}

module.exports = app;
