import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  LogOut, 
  ShieldCheck, 
  Sparkles,
  HelpCircle
} from 'lucide-react';

export const Badge = ({ status, className = '', showIcon = true, size = 'md' }) => {
  const normalized = (status || '').toUpperCase();

  const configs = {
    CHECKED_IN: {
      label: 'Checked In',
      icon: CheckCircle2,
      style: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      dot: 'bg-emerald-500'
    },
    CHECKED_OUT: {
      label: 'Checked Out',
      icon: LogOut,
      style: 'bg-slate-100 text-slate-700 border-slate-200',
      dot: 'bg-slate-400'
    },
    OVERSTAY: {
      label: 'Overstay Warning',
      icon: AlertTriangle,
      style: 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse font-bold',
      dot: 'bg-rose-600'
    },
    EXPECTED: {
      label: 'Expected',
      icon: Clock,
      style: 'bg-blue-50 text-blue-700 border-blue-200',
      dot: 'bg-blue-500'
    },
    APPROVED: {
      label: 'Approved',
      icon: ShieldCheck,
      style: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500'
    },
    'PRE-APPROVED': {
      label: 'Pre-Approved',
      icon: Sparkles,
      style: 'bg-purple-50 text-purple-700 border-purple-200 font-semibold',
      dot: 'bg-purple-500'
    },
    PENDING: {
      label: 'Pending Approval',
      icon: Clock,
      style: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500'
    },
    REJECTED: {
      label: 'Rejected',
      icon: XCircle,
      style: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-500'
    },
  };

  const config = configs[normalized] || {
    label: status || 'Unknown',
    icon: HelpCircle,
    style: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400'
  };

  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2'
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border shadow-2xs ${
        config.style
      } ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      {showIcon && <IconComponent className="w-3.5 h-3.5 shrink-0" />}
      <span>{config.label}</span>
    </span>
  );
};
