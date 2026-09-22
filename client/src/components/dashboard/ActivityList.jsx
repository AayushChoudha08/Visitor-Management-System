import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  LogOut, 
  UserPlus, 
  ShieldCheck, 
  Sparkles,
  Activity
} from 'lucide-react';

export const ActivityList = ({ activities = [] }) => {
  const getActionIcon = (action) => {
    switch (action) {
      case 'VISITOR_CHECKED_IN':
        return { icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' };
      case 'VISITOR_CHECKED_OUT':
        return { icon: LogOut, color: 'text-slate-600 bg-slate-100 border-slate-200' };
      case 'INVITATION_APPROVED':
        return { icon: ShieldCheck, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' };
      case 'INVITATION_REJECTED':
        return { icon: XCircle, color: 'text-rose-600 bg-rose-50 border-rose-100' };
      case 'PRE_APPROVAL_CREATED':
        return { icon: Sparkles, color: 'text-purple-600 bg-purple-50 border-purple-100' };
      case 'VISITOR_REGISTERED':
      case 'INVITATION_CREATED':
      default:
        return { icon: UserPlus, color: 'text-blue-600 bg-blue-50 border-blue-100' };
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const date = new Date(timestamp);
    const diffSec = Math.max(0, Math.floor((now - date) / 1000));

    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (activities.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-slate-400">
        No recent activity logged yet.
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {activities.map((item) => {
        const { icon: Icon, color } = getActionIcon(item.action);
        return (
          <div key={item.id} className="py-3.5 flex items-start gap-3 hover:bg-slate-50/60 transition rounded-xl px-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 leading-snug">
                {item.details || item.action}
              </p>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                <span className="font-medium text-slate-600">{item.performedBy}</span>
                <span>•</span>
                <span>{formatTimeAgo(item.timestamp)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
