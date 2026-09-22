import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/layout/AppLayout';
import { RoleRoute } from './components/layout/RoleRoute';

import { Dashboard } from './pages/Dashboard';
import { InviteVisitor } from './pages/InviteVisitor';
import { Approvals } from './pages/Approvals';
import { PreApproval } from './pages/PreApproval';
import { Visitors } from './pages/Visitors';
import { CheckIn } from './pages/CheckIn';
import { CheckOut } from './pages/CheckOut';
import { VisitorDetailsPage } from './pages/VisitorDetailsPage';
import { ActivityLogs } from './pages/ActivityLogs';
import { Login } from './pages/Login';
import { NotFound } from './pages/NotFound';
import { rolesFor } from './auth/permissions';

const AppShell = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
        <Route
          path="/dashboard"
          element={<RoleRoute allowedRoles={rolesFor('dashboard')}><Dashboard /></RoleRoute>}
        />
        <Route
          path="/invite"
          element={<RoleRoute allowedRoles={rolesFor('invite')}><InviteVisitor /></RoleRoute>}
        />
        <Route
          path="/approvals"
          element={<RoleRoute allowedRoles={rolesFor('approvals')}><Approvals /></RoleRoute>}
        />
        <Route
          path="/pre-approvals"
          element={<RoleRoute allowedRoles={rolesFor('preApprovals')}><PreApproval /></RoleRoute>}
        />
        <Route
          path="/visitors"
          element={<RoleRoute allowedRoles={rolesFor('visitors')}><Visitors /></RoleRoute>}
        />
        <Route
          path="/visitors/:id"
          element={<RoleRoute allowedRoles={rolesFor('visitors')}><VisitorDetailsPage /></RoleRoute>}
        />
        <Route
          path="/check-in"
          element={<RoleRoute allowedRoles={rolesFor('checkIn')}><CheckIn /></RoleRoute>}
        />
        <Route
          path="/check-out"
          element={<RoleRoute allowedRoles={rolesFor('checkOut')}><CheckOut /></RoleRoute>}
        />
        <Route
          path="/activity"
          element={<RoleRoute allowedRoles={rolesFor('activity')}><ActivityLogs /></RoleRoute>}
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppShell />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
