import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { auditService } from '../services/auditService';
import { useToast } from '../context/ToastContext';
import {
  ClipboardList,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  LogOut,
  UserPlus,
  ShieldCheck,
  Sparkles,
  Calendar
} from 'lucide-react';

export const ActivityLogs = () => {
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (actionFilter && actionFilter !== 'ALL') params.action = actionFilter;
      if (search) params.search = search;
      const res = await auditService.getLogs(params);
      setLogs(res.data || []);
    } catch (err) {
      toast.error(err.message || 'Unable to load activity logs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, search]);

  const getActionBadge = (action) => {
    switch (action) {
      case 'VISITOR_CHECKED_IN':
        return { label: 'Checked In', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'VISITOR_CHECKED_OUT':
        return { label: 'Checked Out', color: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'INVITATION_APPROVED':
        return { label: 'Approved', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'INVITATION_REJECTED':
        return { label: 'Rejected', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'PRE_APPROVAL_CREATED':
        return { label: 'Pre-Approved', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'VISITOR_REGISTERED':
        return { label: 'Registered', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'INVITATION_CREATED':
      default:
        return { label: 'Invite Created', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security & Activity Audit Logs"
        subtitle="Immutable chronological history of all visitor invitations, security approvals, entries, and exits."
        action={
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={fetchLogs}
          >
            Refresh Logs
          </Button>
        }
      />

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by actor, visitor name, invitation ID, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="w-full sm:w-60 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
        >
          <option value="ALL">All Event Actions</option>
          <option value="VISITOR_CHECKED_IN">Checked In</option>
          <option value="VISITOR_CHECKED_OUT">Checked Out</option>
          <option value="INVITATION_APPROVED">Approved</option>
          <option value="INVITATION_REJECTED">Rejected</option>
          <option value="INVITATION_CREATED">Invite Created</option>
          <option value="PRE_APPROVAL_CREATED">Pre-Approved</option>
          <option value="VISITOR_REGISTERED">Visitor Registered</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        {isLoading ? (
          <LoadingSpinner text="Retrieving audit stream..." />
        ) : logs.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No audit entries found"
            description="No system activity matches your current search filters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Event ID</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Details & Entity</th>
                  <th className="py-3.5 px-4">Performed By</th>
                  <th className="py-3.5 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => {
                  const badge = getActionBadge(log.action);
                  const dateObj = new Date(log.timestamp);

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-500 font-semibold">
                        {log.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-xs font-semibold text-slate-900">{log.details || log.action}</p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5 font-mono">
                          {log.invitationId && <span>Inv: {log.invitationId}</span>}
                          {log.visitorId && <span>Vis: {log.visitorId}</span>}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="text-xs font-medium text-slate-800">{log.performedBy}</p>
                        <span className="text-[10px] text-indigo-600 font-semibold uppercase">{log.role}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-xs font-mono text-slate-500">
                        <div>{dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        <div className="text-[11px] text-slate-400">
                          {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
