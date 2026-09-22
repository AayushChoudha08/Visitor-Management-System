import React, { useState, useEffect } from 'react';
import { Menu, Clock, Plus, ShieldCheck, UserCheck, Sparkles, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';

export const Navbar = ({ onOpenMobileMenu }) => {
  const { currentRole, switchRole, allRoles, logout } = useAuth();
  const navigate = useNavigate();
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 bg-slate-100/80 py-1.5 px-3 rounded-full border border-slate-200/60">
          <MapPin className="w-3.5 h-3.5 text-indigo-600" />
          <span className="font-semibold text-slate-700">HQ Office:</span>
          <span>Mumbai Goregaon (Tech Park Tower 3)</span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Live Clock */}
        <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
          <Clock className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
          <span className="font-mono">{timeStr || 'Loading...'}</span>
        </div>

        {/* Quick Role Switcher Pill */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 px-2 hidden sm:inline">Role:</span>
          {allRoles.map((r) => (
            <button
              key={r.id}
              onClick={() => switchRole(r.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                currentRole === r.id
                  ? 'bg-white text-indigo-600 shadow-2xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {r.id}
            </button>
          ))}
        </div>

        {/* Primary CTA */}
        {currentRole === 'Employee' ? (
          <Button
            size="sm"
            variant="primary"
            icon={Plus}
            onClick={() => navigate('/invite')}
            className="hidden sm:inline-flex"
          >
            Invite Guest
          </Button>
        ) : (
          <Button
            size="sm"
            variant="primary"
            icon={UserCheck}
            onClick={() => navigate('/check-in')}
            className="hidden sm:inline-flex"
          >
            Quick Check-In
          </Button>
        )}

        <Button
          size="sm"
          variant="secondary"
          icon={ShieldCheck}
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="hidden sm:inline-flex"
        >
          Logout
        </Button>
      </div>
    </header>
  );
};
