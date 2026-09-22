import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Clock,
  UserCheck,
  UserX,
  AlertTriangle,
  FileCheck,
  RefreshCw,
  Plus,
  LogIn,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { visitService } from '../services/visitService';
import { StatCard } from '../components/dashboard/StatCard';
import { ActivityList } from '../components/dashboard/ActivityList';
import { VisitorTable } from '../components/visitors/VisitorTable';
import { VisitorDetailsModal } from '../components/visitors/VisitorDetailsModal';
import { VisitorPassModal } from '../components/visitors/VisitorPassModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../auth/permissions';

export const Dashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { currentRole } = useAuth();
  const canOperateVisits = hasPermission(currentRole, 'checkIn');

  const [stats, setStats] = useState({
    totalVisitors: 0,
    expected: 0,
    checkedIn: 0,
    checkedOut: 0,
    pendingApprovals: 0,
    overstay: 0
  });
  const [todayVisitors, setTodayVisitors] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [passData, setPassData] = useState(null);
  const [confirmCheckoutVisit, setConfirmCheckoutVisit] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const res = await dashboardService.getStats();
      const data = res.data || {};
      setStats(data.stats || {});
      setTodayVisitors(data.todayVisitors || []);
      setRecentActivity(data.recentActivity || []);
    } catch (err) {
      toast.error(err.message || 'Unable to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCheckIn = async (visit) => {
    try {
      setIsProcessing(true);
      await visitService.checkIn(visit.id, {
        invitationId: visit.invitationId,
        visitorId: visit.visitorId,
        performedBy: currentRole === 'Employee' ? 'Host Employee' : 'Front Desk Security',
        role: currentRole
      });
      toast.success(`${visit.visitor?.name || 'Visitor'} checked in successfully.`);
      await fetchDashboardData();
    } catch (err) {
      toast.error(err.message || 'Failed to check in visitor.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckOut = async () => {
    if (!confirmCheckoutVisit) return;
    try {
      setIsProcessing(true);
      const res = await visitService.checkOut(confirmCheckoutVisit.id, {
        performedBy: currentRole === 'Employee' ? 'Host Employee' : 'Front Desk Security',
        role: currentRole
      });
      toast.success(
        `${confirmCheckoutVisit.visitor?.name || 'Visitor'} checked out. Stay duration: ${res.data?.duration || 'N/A'}`
      );
      setConfirmCheckoutVisit(null);
      await fetchDashboardData();
    } catch (err) {
      toast.error(err.message || 'Failed to check out visitor.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Workplace Overview</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time visitor traffic, building access status, and security alerts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={fetchDashboardData}
            title="Refresh dashboard metrics"
          >
            Refresh
          </Button>

          {currentRole === 'Employee' ? (
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => navigate('/invite')}
            >
              Invite Visitor
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              icon={LogIn}
              onClick={() => navigate('/check-in')}
            >
              Check-In Terminal
            </Button>
          )}
        </div>
      </div>

      {/* Overstay Warning Banner if overstays detected */}
      {stats.overstay > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between shadow-2xs animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-900">
                {stats.overstay} Active Visitor{stats.overstay > 1 ? 's' : ''} Overstaying Scheduled Pass
              </h4>
              <p className="text-xs text-rose-700 mt-0.5">
                Immediate security action required. Allowed meeting window has elapsed.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="danger"
            onClick={() => navigate('/visitors?status=OVERSTAY')}
          >
            View Overstays
          </Button>
        </div>
      )}

      {/* 6 Key StatCards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
        <StatCard
          title="Total Today"
          value={stats.totalVisitors}
          subtitle="Scheduled visits"
          icon={Users}
          variant="indigo"
          onClick={() => navigate('/visitors')}
        />
        <StatCard
          title="Expected"
          value={stats.expected}
          subtitle="Awaiting arrival"
          icon={Clock}
          variant="blue"
          onClick={() => navigate('/visitors?status=EXPECTED')}
        />
        <StatCard
          title="Checked In"
          value={stats.checkedIn}
          subtitle="Currently on-site"
          icon={UserCheck}
          variant="emerald"
          onClick={() => navigate('/visitors?status=CHECKED_IN')}
        />
        <StatCard
          title="Checked Out"
          value={stats.checkedOut}
          subtitle="Visits concluded"
          icon={UserX}
          variant="slate"
          onClick={() => navigate('/visitors?status=CHECKED_OUT')}
        />
        <StatCard
          title="Pending"
          value={stats.pendingApprovals}
          subtitle="Requires review"
          icon={FileCheck}
          variant="amber"
          onClick={() => navigate('/approvals')}
        />
        <StatCard
          title="Overstay"
          value={stats.overstay}
          subtitle="Window exceeded"
          icon={AlertTriangle}
          variant={stats.overstay > 0 ? 'rose' : 'slate'}
          onClick={() => navigate('/visitors?status=OVERSTAY')}
        />
      </div>

      {/* Main Grid: Today's Visitors Table & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Visitors (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Today's Visitors Queue</h2>
              <p className="text-xs text-slate-500">Live check-in status for registered meetings today</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={ArrowRight}
              onClick={() => navigate('/visitors')}
              className="text-xs text-indigo-600 hover:text-indigo-800"
            >
              View Full Directory
            </Button>
          </div>

          {isLoading ? (
            <LoadingSpinner text="Refreshing today's visitor queue..." />
          ) : (
            <VisitorTable
              visits={todayVisitors}
              onSelectVisit={(v) => setSelectedVisit(v)}
              onCheckIn={canOperateVisits ? handleCheckIn : undefined}
              onCheckOut={canOperateVisits ? (v) => setConfirmCheckoutVisit(v) : undefined}
              onViewPass={(v) => setPassData(v)}
              itemsPerPage={6}
            />
          )}
        </div>

        {/* Recent Activity Audit Feed (1 Column) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Activity Feed</h3>
              <p className="text-[11px] text-slate-500">Real-time audit log stream</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/activity')}
              className="text-xs text-indigo-600 hover:text-indigo-800 px-1"
            >
              All Logs
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[500px]">
            {isLoading ? (
              <LoadingSpinner size="sm" text="Loading events..." />
            ) : (
              <ActivityList activities={recentActivity} />
            )}
          </div>
        </div>
      </div>

      {/* Visitor Details Modal */}
      <VisitorDetailsModal
        isOpen={Boolean(selectedVisit)}
        onClose={() => setSelectedVisit(null)}
        visit={selectedVisit}
        onCheckIn={handleCheckIn}
        onCheckOut={(v) => setConfirmCheckoutVisit(v)}
        onViewPass={(v) => setPassData(v)}
      />

      {/* QR e-Pass Modal */}
      <VisitorPassModal
        isOpen={Boolean(passData)}
        onClose={() => setPassData(null)}
        passData={passData}
      />

      {/* Confirm Check-out Dialog */}
      <ConfirmDialog
        isOpen={Boolean(confirmCheckoutVisit)}
        onClose={() => setConfirmCheckoutVisit(null)}
        onConfirm={handleCheckOut}
        title="Check Out Visitor"
        message={`Are you sure you want to conclude the visit for ${confirmCheckoutVisit?.visitor?.name}? Stay duration will be calculated and logged.`}
        confirmText="Confirm Check-Out"
        variant="danger"
        isLoading={isProcessing}
      />
    </div>
  );
};
