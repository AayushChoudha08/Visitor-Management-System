import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Building2, Shield, User, UserCheck, ArrowRight, ShieldCheck } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const { switchRole, allRoles } = useAuth();

  const handleSelectRole = (roleId) => {
    switchRole(roleId);
    navigate('/dashboard');
  };

  const getRoleIcon = (roleId) => {
    switch (roleId) {
      case 'Employee':
        return User;
      case 'Front Desk':
        return UserCheck;
      case 'Admin':
      default:
        return Shield;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4 selection:bg-indigo-500 selection:text-white">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-900 to-slate-950 pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg space-y-8 text-center">
        {/* Brand Header */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 mb-4 border border-indigo-400/30">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            SecurePass <span className="text-indigo-400">VMS</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-sm">
            Workplace Visitor Management & Security Access Suite. Select a demo persona to enter.
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="space-y-3 text-left">
          {allRoles.map((role) => {
            const Icon = getRoleIcon(role.id);
            return (
              <div
                key={role.id}
                onClick={() => handleSelectRole(role.id)}
                className="group p-5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500/60 rounded-2xl transition-all duration-200 cursor-pointer shadow-lg hover:shadow-indigo-500/10 flex items-center justify-between"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={role.avatar}
                    alt={role.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-600 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-white group-hover:text-indigo-300 transition">
                        {role.id} Role
                      </h3>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                        {role.name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-snug">
                      {role.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 pl-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 group-hover:bg-indigo-600 text-slate-300 group-hover:text-white flex items-center justify-center transition">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="text-xs text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Evaluation Demo Mode: No credentials required to test all workflows.</span>
        </div>
      </div>
    </div>
  );
};
