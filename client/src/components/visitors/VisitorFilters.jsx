import React from 'react';
import { Search, Filter, RotateCcw, Calendar, MapPin } from 'lucide-react';
import { Button } from '../ui/Button';

export const VisitorFilters = ({
  filters,
  onChange,
  onReset,
  totalResults = 0
}) => {
  const hasActiveFilters = Boolean(
    filters.search ||
    (filters.status && filters.status !== 'ALL') ||
    (filters.visitType && filters.visitType !== 'ALL') ||
    (filters.office && filters.office !== 'ALL') ||
    filters.date
  );

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search input */}
        <div className="lg:col-span-2 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search visitor, host, company, phone, ID..."
            value={filters.search || ''}
            onChange={(e) => onChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        {/* Status Dropdown */}
        <div>
          <select
            value={filters.status || 'ALL'}
            onChange={(e) => onChange('status', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="OVERSTAY">⚠️ Overstay Only</option>
            <option value="CHECKED_IN">Checked In</option>
            <option value="EXPECTED">Expected Today</option>
            <option value="CHECKED_OUT">Checked Out</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Office Dropdown */}
        <div>
          <select
            value={filters.office || 'ALL'}
            onChange={(e) => onChange('office', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-slate-700"
          >
            <option value="ALL">All Offices</option>
            <option value="Mumbai Goregaon">Mumbai Goregaon</option>
            <option value="Delhi">Delhi</option>
            <option value="Bangalore">Bangalore</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Pune">Pune</option>
          </select>
        </div>

        {/* Date Filter */}
        <div className="relative">
          <input
            type="date"
            value={filters.date || ''}
            onChange={(e) => onChange('date', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-slate-700"
          />
        </div>
      </div>

      {/* Filter Stats Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>Showing <strong className="text-slate-800 font-semibold">{totalResults}</strong> matching records</span>
          {filters.status === 'OVERSTAY' && (
            <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-bold text-[10px]">
              Active Overstay Filter
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};
