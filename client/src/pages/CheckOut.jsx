import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { VisitorPassModal } from '../components/visitors/VisitorPassModal';
import { visitService } from '../services/visitService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  LogOut,
  Search,
  CheckCircle2,
  Clock,
  Building,
  User,
  AlertTriangle,
  QrCode,
  ShieldCheck,
  Calendar,
  Sparkles
} from 'lucide-react';

export const CheckOut = () => {
  const toast = useToast();
  const { currentRole, currentUser } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeVisits, setActiveVisits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmVisit, setConfirmVisit] = useState(null);
  const [passData, setPassData] = useState(null);

  const fetchActiveVisits = async () => {
    try {
      setIsLoading(true);
      // Fetch all visits and filter on-site (CHECKED_IN or OVERSTAY)
      const res = await visitService.getAll();
      const all = res.data || [];
      const onSite = all.filter((v) => v.status === 'CHECKED_IN' || v.isOverstay);
      setActiveVisits(onSite);
    } catch (err) {
      toast.error(err.message || 'Unable to load on-site visitors.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveVisits();
  }, []);

  const handleExecuteCheckOut = async () => {
    if (!confirmVisit) return;
    setIsProcessing(true);
    try {
      const res = await visitService.checkOut(confirmVisit.id, {
        performedBy: currentUser.name,
        role: currentRole
      });
      const visitorName = confirmVisit.visitor?.name || 'Visitor';
      toast.success(
        `${visitorName} checked out successfully. Total stay duration: ${res.data?.duration || 'Recorded'}`
      );
      setConfirmVisit(null);
      fetchActiveVisits();
    } catch (err) {
      toast.error(err.message || 'Failed to check out visitor.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      toast.warning('Please enter a Visitor Name or Invitation ID to search.');
      return;
    }

    const matched = activeVisits.find(
      (v) =>
        (v.invitationId && v.invitationId.toLowerCase() === query) ||
        (v.visitor && v.visitor.name.toLowerCase().includes(query)) ||
        (v.id && v.id.toLowerCase() === query)
    );

    if (matched) {
      setConfirmVisit(matched);
    } else {
      toast.error(`No currently checked-in visitor found matching "${searchQuery}".`);
    }
  };

  const filteredVisits = activeVisits.filter((v) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (v.visitor && v.visitor.name.toLowerCase().includes(q)) ||
      (v.visitor && v.visitor.company.toLowerCase().includes(q)) ||
      (v.invitationId && v.invitationId.toLowerCase().includes(q)) ||
      (v.id && v.id.toLowerCase().includes(q)) ||
      (v.host && v.host.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Check-Out Terminal"
        subtitle="Security reception desk: verify departure, revoke campus pass, and record total stay duration."
      />

      {/* Barcode / Search Terminal Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
            <LogOut className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Scan Pass QR or Search Visitor</h2>
            <p className="text-xs text-slate-500">
              Validates on-site presence, computes meeting duration, and updates building occupancy.
            </p>
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="mt-5 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by Visitor Name, Invitation ID (e.g. INV-2026-000001), or Company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition placeholder:text-slate-400"
            />
          </div>
          <Button
            type="submit"
            variant="secondary"
            size="lg"
            icon={Search}
            className="sm:w-40"
          >
            Find On-Site
          </Button>
        </form>
      </div>

      {/* Currently On-Site Visitors List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Currently On Campus ({filteredVisits.length})
            </h3>
            <p className="text-xs text-slate-500">Active visitors currently checked in</p>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchActiveVisits} className="text-xs">
            Refresh On-Site List
          </Button>
        </div>

        {isLoading ? (
          <LoadingSpinner text="Retrieving active on-site visitors..." />
        ) : filteredVisits.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No on-site visitors"
            description={
              searchQuery
                ? `No on-site visitors matched "${searchQuery}".`
                : 'All checked-in guests have concluded their visits and departed.'
            }
            actionLabel={searchQuery ? 'Clear Search' : undefined}
            onAction={() => setSearchQuery('')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVisits.map((visit) => {
              const visitor = visit.visitor || {};
              const host = visit.host || {};
              const isOverstay = visit.isOverstay;

              const checkInTimeFormatted = visit.checkInTime
                ? new Date(visit.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'N/A';

              return (
                <div
                  key={visit.id}
                  className={`bg-white rounded-2xl border ${
                    isOverstay ? 'border-rose-300 ring-2 ring-rose-100 shadow-rose-100' : 'border-slate-200'
                  } shadow-card p-4.5 flex flex-col justify-between hover:shadow-elevated transition`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {visit.invitationId}
                      </span>
                      <Badge status={isOverstay ? 'OVERSTAY' : visit.status} size="sm" />
                    </div>

                    <div className="flex items-center gap-3">
                      <img
                        src={
                          visitor.photo ||
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                        }
                        alt={visitor.name}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{visitor.name}</p>
                        <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                          <Building className="w-3 h-3 text-slate-400" /> {visitor.company || 'Direct Guest'}
                        </p>
                      </div>
                    </div>

                    {/* Overstay Warning Chip if applicable */}
                    {isOverstay && (
                      <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>
                          Overstay by <strong>{visit.overstayMinutes}m</strong> (End: {visit.scheduledEndTime})
                        </span>
                      </div>
                    )}

                    <div className="text-xs space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Host:</span>
                        <span className="font-semibold text-slate-800">{host.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Checked In:</span>
                        <span className="font-mono text-emerald-700 font-semibold">{checkInTimeFormatted}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Scheduled End:</span>
                        <span className="font-mono text-slate-800 font-medium">{visit.scheduledEndTime}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Office:</span>
                        <span className="font-medium text-slate-800">{visit.office}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={QrCode}
                      onClick={() => setPassData(visit)}
                      className="text-xs px-2 text-indigo-600"
                    >
                      Pass
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={LogOut}
                      isLoading={isProcessing && confirmVisit?.id === visit.id}
                      onClick={() => setConfirmVisit(visit)}
                      className="flex-1 text-xs"
                    >
                      Check Out
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirm Check-Out Modal */}
      <ConfirmDialog
        isOpen={Boolean(confirmVisit)}
        onClose={() => setConfirmVisit(null)}
        onConfirm={handleExecuteCheckOut}
        title="Authorize Visitor Departure"
        message={`Conclude visit for ${confirmVisit?.visitor?.name}? The building access pass will be revoked and duration recorded.`}
        confirmText="Confirm Departure"
        variant="danger"
        isLoading={isProcessing}
      />

      {/* QR Pass Preview Modal */}
      {passData && (
        <VisitorPassModal
          isOpen={Boolean(passData)}
          onClose={() => setPassData(null)}
          passData={passData}
        />
      )}
    </div>
  );
};
