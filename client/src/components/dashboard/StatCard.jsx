import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'indigo', // indigo | blue | emerald | slate | amber | rose
  onClick
}) => {
  const variants = {
    indigo: {
      bg: 'bg-white',
      border: 'border-slate-200/80 hover:border-indigo-300',
      iconBg: 'bg-indigo-50 text-indigo-600',
      valueColor: 'text-slate-900',
      accent: 'text-indigo-600'
    },
    blue: {
      bg: 'bg-white',
      border: 'border-slate-200/80 hover:border-blue-300',
      iconBg: 'bg-blue-50 text-blue-600',
      valueColor: 'text-slate-900',
      accent: 'text-blue-600'
    },
    emerald: {
      bg: 'bg-white',
      border: 'border-slate-200/80 hover:border-emerald-300',
      iconBg: 'bg-emerald-50 text-emerald-600',
      valueColor: 'text-emerald-700',
      accent: 'text-emerald-600'
    },
    slate: {
      bg: 'bg-white',
      border: 'border-slate-200/80 hover:border-slate-300',
      iconBg: 'bg-slate-100 text-slate-600',
      valueColor: 'text-slate-900',
      accent: 'text-slate-600'
    },
    amber: {
      bg: 'bg-white',
      border: 'border-slate-200/80 hover:border-amber-300',
      iconBg: 'bg-amber-50 text-amber-600',
      valueColor: 'text-amber-700',
      accent: 'text-amber-600'
    },
    rose: {
      bg: 'bg-rose-50/40',
      border: 'border-rose-200 hover:border-rose-400 animate-pulse',
      iconBg: 'bg-rose-100 text-rose-600',
      valueColor: 'text-rose-700',
      accent: 'text-rose-600'
    }
  };

  const current = variants[variant] || variants.indigo;

  return (
    <div
      onClick={onClick}
      className={`${current.bg} ${current.border} rounded-2xl border p-5 shadow-card hover:shadow-elevated transition-all duration-200 flex flex-col justify-between ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${current.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <span className={`text-3xl font-extrabold tracking-tight ${current.valueColor}`}>{value ?? 0}</span>
        {subtitle && <span className="text-xs text-slate-400">{subtitle}</span>}
      </div>
    </div>
  );
};
