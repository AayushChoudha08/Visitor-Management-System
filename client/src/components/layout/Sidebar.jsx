import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  UserPlus,
  CheckSquare,
  Sparkles,
  Users,
  LogIn,
  ClipboardList,
  Shield,
  LogOut,
  Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../auth/permissions';

export const Sidebar = ({ onClose }) => {
  const { currentRole, currentUser, switchRole, allRoles, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, permission: 'dashboard' },
    { label: 'Invite Visitor', path: '/invite', icon: UserPlus, permission: 'invite' },
    { label: 'Approvals', path: '/approvals', icon: CheckSquare, permission: 'approvals' },
    { label: 'Pre-Approvals', path: '/pre-approvals', icon: Sparkles, permission: 'preApprovals' },
    { label: currentRole === 'Employee' ? 'My Visitors' : 'Visitors Directory', path: '/visitors', icon: Users, permission: 'visitors' },
    { label: 'Check-In Terminal', path: '/check-in', icon: LogIn, permission: 'checkIn' },
    { label: 'Check-Out Terminal', path: '/check-out', icon: LogOut, permission: 'checkOut' },
    { label: 'Activity Logs', path: '/activity', icon: ClipboardList, permission: 'activity' },
  ];

  const visibleNav = navItems.filter((item) => hasPermission(currentRole, item.permission));

  return (
    <aside className="w-72 bg-slate-900 text-slate-100 flex flex-col h-full shrink-0 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
              SecurePass <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-indigo-500/20 text-indigo-400 font-semibold uppercase">VMS</span>
            </h1>
            <p className="text-xs text-slate-400">Workplace Visitor Suite</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Workspace Navigation
        </div>
        {visibleNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Current Active Role Switcher Pill */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1 flex items-center justify-between">
          <span>Active Role</span>
          <span className="text-indigo-400 font-medium">Demo Switch</span>
        </div>
        <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {allRoles.map((r) => (
            <button
              key={r.id}
              onClick={() => switchRole(r.id)}
              className={`py-1 text-[11px] font-medium rounded-lg transition text-center truncate px-1 ${
                currentRole === r.id
                  ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r.id === 'Front Desk' ? 'Desk' : r.id}
            </button>
          ))}
        </div>

        {/* Profile Card */}
        <div className="mt-3.5 flex items-center gap-3 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-9 h-9 rounded-full object-cover border border-slate-700"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{currentUser.title}</p>
          </div>
          <Shield className="w-4 h-4 text-indigo-400 shrink-0" />
        </div>

        {/* Logout Button (Section 9 Requirement) */}
        <button
          onClick={() => {
            if (onClose) onClose();
            logout();
            window.location.href = '/login';
          }}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-900/50 text-xs font-medium transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit / Switch Role</span>
        </button>
      </div>
    </aside>
  );
};
