import React from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { ShieldAlert, ArrowLeft, LogOut, Building } from 'lucide-react';

export const RoleRoute = ({ allowedRoles = [], children }) => {
  const { currentRole, currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!allowedRoles.includes(currentRole)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-card p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-600 bg-rose-100/60 px-2.5 py-0.5 rounded-full">
              403 Forbidden • Access Restricted
            </span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Security Clearance Denied
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              The route <code className="font-mono text-slate-800 bg-slate-100 px-1 py-0.5 rounded">{location.pathname}</code> requires authorized access for{' '}
              <strong className="text-slate-800 font-semibold">{allowedRoles.join(' or ')}</strong>.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-left text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Current Persona:</span>
              <span className="font-semibold text-slate-800">{currentUser.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Assigned Role:</span>
              <span className="font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">{currentRole}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Designation:</span>
              <span className="text-slate-600 truncate">{currentUser.title}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              icon={ArrowLeft}
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto"
            >
              Return to My Dashboard
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={LogOut}
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto"
            >
              Switch Role
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};
