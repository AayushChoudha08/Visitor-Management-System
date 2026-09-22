import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ text = 'Loading data...', size = 'md' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10'
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 gap-3 text-slate-500">
      <Loader2 className={`${sizes[size] || sizes.md} animate-spin text-indigo-600`} />
      {text && <p className="text-sm font-medium animate-pulse">{text}</p>}
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, columns = 6 }) => {
  return (
    <div className="w-full animate-pulse divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex items-center gap-4 py-4 px-6">
          <div className="w-10 h-10 bg-slate-200 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 rounded w-1/4" />
            <div className="h-3 bg-slate-100 rounded w-1/3" />
          </div>
          <div className="h-4 bg-slate-100 rounded w-24 hidden md:block" />
          <div className="h-4 bg-slate-100 rounded w-20" />
          <div className="h-7 bg-slate-200 rounded-full w-24" />
        </div>
      ))}
    </div>
  );
};
