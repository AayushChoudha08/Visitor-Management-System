import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { VisitorPassModal } from '../components/visitors/VisitorPassModal';
import { visitService } from '../services/visitService';
import { invitationService } from '../services/invitationService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  LogIn,
  Search,
  CheckCircle,
  ShieldAlert,
  Building,
  User,
  Calendar,
  Clock,
  QrCode,
  ShieldCheck
} from 'lucide-react';

export const CheckIn = () => {
  const toast = useToast();
  const { currentRole, currentUser } = useAuth();

  const [invitationCode, setInvitationCode] = useState('');
  const [expectedVisits, setExpectedVisits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [passData, setPassData] = useState(null);

  const fetchExpectedVisits = async () => {
    try {
      setIsLoading(true);
      const res = await visitService.getAll({ status: 'EXPECTED' });
      setExpectedVisits(res.data || []);
    } catch (err) {
      toast.error(err.message || 'Unable to load expected arrivals.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpectedVisits();
  }, []);

  const handleExecuteCheckIn = async (visitOrInvId) => {
    setIsProcessing(true);
    try {
      const isIdString = typeof visitOrInvId === 'string';
      const payload = isIdString
        ? {
            invitationId: visitOrInvId.trim().toUpperCase(),
            performedBy: currentUser.name,
            role: currentRole
          }
        : {
            visitId: visitOrInvId.id,
            invitationId: visitOrInvId.invitationId,
            visitorId: visitOrInvId.visitorId,
            performedBy: currentUser.name,
            role: currentRole
          };

      const res = await visitService.checkIn(payload.visitId, payload);
      toast.success(`${res.data?.visitor?.name || 'Visitor'} checked in successfully!`);
      setInvitationCode('');
      setPassData(res.data);
      await fetchExpectedVisits();
    } catch (err) {
      toast.error(err.message || 'Check-in validation failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!invitationCode.trim()) {
      toast.warning('Please enter an Invitation ID or Pass Code.');
      return;
    }
    handleExecuteCheckIn(invitationCode);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Check-In Terminal"
        subtitle="Security reception desk: scan QR e-pass or enter Invitation ID to authorize visitor entry."
      />

      {/* Barcode / ID Scan Input Terminal */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Scan QR or Enter Invitation ID</h2>
            <p className="text-xs text-slate-500">
              Validates invitation approval status, arrival window, and security rules.
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
              placeholder="e.g. INV-2026-000001"
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition uppercase placeholder:normal-case"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            icon={LogIn}
            isLoading={isProcessing}
            className="sm:w-48"
          >
            Verify & Check In
          </Button>
        </form>
      </div>

      {/* Expected Arrivals Awaiting Check-In */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Expected Today ({expectedVisits.length})</h3>
            <p className="text-xs text-slate-500">Guests with authorized passes scheduled for arrival</p>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchExpectedVisits} className="text-xs">
            Refresh Arrivals
          </Button>
        </div>

        {isLoading ? (
          <LoadingSpinner text="Loading expected arrivals..." />
        ) : expectedVisits.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="No pending arrivals"
            description="All expected visitors for today have already arrived and checked in."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expectedVisits.map((visit) => {
              const visitor = visit.visitor || {};
              const host = visit.host || {};
              const invitation = visit.invitation || {};

              return (
                <div
                  key={visit.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-4.5 flex flex-col justify-between hover:shadow-elevated transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {visit.invitationId}
                      </span>
                      <Badge status={invitation.status || visit.status} size="sm" />
                    </div>

                    <div className="flex items-center gap-3">
                      <img
                        src={visitor.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                        alt={visitor.name}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{visitor.name}</p>
                        <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                          <Building className="w-3 h-3 text-slate-400" /> {visitor.company || 'Direct'}
                        </p>
                      </div>
                    </div>

                    <div className="text-xs space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Host:</span>
                        <span className="font-semibold text-slate-800">{host.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Time Window:</span>
                        <span className="font-mono text-slate-800 font-medium">
                          {visit.scheduledStartTime} - {visit.scheduledEndTime}
                        </span>
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
                      variant="success"
                      size="sm"
                      icon={LogIn}
                      isLoading={isProcessing}
                      onClick={() => handleExecuteCheckIn(visit)}
                      className="flex-1 text-xs"
                    >
                      Instant Check-In
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* QR Pass modal preview */}
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
