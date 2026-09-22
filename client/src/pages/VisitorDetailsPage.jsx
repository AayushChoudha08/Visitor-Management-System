import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { VisitorPassModal } from '../components/visitors/VisitorPassModal';
import { visitorService } from '../services/visitorService';
import { visitService } from '../services/visitService';
import { auditService } from '../services/auditService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  User,
  Building,
  Phone,
  Mail,
  Shield,
  Calendar,
  Clock,
  MapPin,
  FileText,
  LogIn,
  LogOut,
  QrCode,
  AlertTriangle,
  History,
  CheckCircle,
  IdCard
} from 'lucide-react';

export const VisitorDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { currentRole, currentUser } = useAuth();

  const [visitor, setVisitor] = useState(null);
  const [activeVisit, setActiveVisit] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmCheckoutOpen, setIsConfirmCheckoutOpen] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  const loadVisitorData = async () => {
    try {
      setIsLoading(true);
      // Fetch all visits to find the relevant visit for this visitor ID or visit ID
      const visitsRes = await visitService.getAll();
      const allVisits = visitsRes.data || [];

      // Try matching by visitorId or by visitId
      const matchedVisit = allVisits.find((v) => v.visitorId === id || v.id === id);
      setActiveVisit(matchedVisit || null);

      // Determine the visitor ID to query
      const targetVisitorId = matchedVisit ? matchedVisit.visitorId : id;
      try {
        const visRes = await visitorService.getById(targetVisitorId);
        setVisitor(visRes.data);
      } catch {
        // If not found in visitor endpoint, use populated visitor from visit
        if (matchedVisit && matchedVisit.visitor) {
          setVisitor(matchedVisit.visitor);
        }
      }

      // Fetch audit logs related to this visitor
      try {
        const logsRes = await auditService.getLogs({ search: targetVisitorId });
        setActivityLogs(logsRes.data || []);
      } catch (err) {
        console.error('Failed to load activity logs for visitor:', err);
      }
    } catch (err) {
      toast.error(err.message || 'Unable to load visitor record.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVisitorData();
  }, [id]);

  const handleCheckIn = async () => {
    if (!activeVisit) return;
    try {
      setIsProcessing(true);
      await visitService.checkIn(activeVisit.id, {
        invitationId: activeVisit.invitationId,
        visitorId: activeVisit.visitorId,
        performedBy: currentUser.name,
        role: currentRole
      });
      toast.success(`${visitor?.name || 'Visitor'} checked in successfully.`);
      loadVisitorData();
    } catch (err) {
      toast.error(err.message || 'Failed to check in visitor.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckOut = async () => {
    if (!activeVisit) return;
    try {
      setIsProcessing(true);
      const res = await visitService.checkOut(activeVisit.id, {
        performedBy: currentUser.name,
        role: currentRole
      });
      toast.success(
        `${visitor?.name || 'Visitor'} checked out. Stay duration: ${res.data?.duration || 'Recorded'}`
      );
      setIsConfirmCheckoutOpen(false);
      loadVisitorData();
    } catch (err) {
      toast.error(err.message || 'Failed to check out visitor.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingSpinner text="Retrieving visitor profile..." />
      </div>
    );
  }

  if (!visitor && !activeVisit) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate('/visitors')}>
          Back to Visitors
        </Button>
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-600 font-medium">Visitor record with ID "{id}" was not found.</p>
        </div>
      </div>
    );
  }

  const effectiveStatus = activeVisit ? activeVisit.effectiveStatus || activeVisit.status : 'EXPECTED';
  const isOverstay = activeVisit?.isOverstay;
  const host = activeVisit?.host || {};

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/visitors')}
            className="rounded-xl"
          >
            Directory
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Visitor Profile</h1>
            <p className="text-xs text-slate-500 font-mono">Record ID: {visitor?.id || id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeVisit && (
            <Button
              variant="secondary"
              size="sm"
              icon={QrCode}
              onClick={() => setIsPassModalOpen(true)}
            >
              View Pass
            </Button>
          )}

          {effectiveStatus === 'EXPECTED' && (
            <Button
              variant="success"
              size="sm"
              icon={LogIn}
              isLoading={isProcessing}
              onClick={handleCheckIn}
            >
              Check In
            </Button>
          )}

          {(effectiveStatus === 'CHECKED_IN' || effectiveStatus === 'OVERSTAY') && (
            <Button
              variant="danger"
              size="sm"
              icon={LogOut}
              isLoading={isProcessing}
              onClick={() => setIsConfirmCheckoutOpen(true)}
            >
              Check Out
            </Button>
          )}
        </div>
      </div>

      {/* Overstay Banner */}
      {isOverstay && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold">SECURITY ALERT: Overstay Detected!</span> Scheduled meeting window ended at{' '}
            <strong className="font-mono">{activeVisit.scheduledEndTime}</strong> (Overstay by{' '}
            {activeVisit.overstayMinutes}m). Please initiate checkout.
          </div>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-slate-100">
          <img
            src={
              visitor?.photo ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
            }
            alt={visitor?.name}
            className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-200 shadow-sm shrink-0"
          />
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">{visitor?.name}</h2>
              <Badge status={effectiveStatus} size="sm" />
            </div>
            <p className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-slate-400" /> {visitor?.company || 'Direct Guest'}
            </p>
            <p className="text-xs text-slate-400">
              Identity Verification: <span className="font-mono text-slate-700">{visitor?.idType || 'Govt ID'}: {visitor?.idNumber || 'VERIFIED-01'}</span>
            </p>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          {/* Contact Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" /> Contact & Identification
            </h3>
            <div className="bg-slate-50 rounded-xl p-4 space-y-2.5 border border-slate-100 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone
                </span>
                <span className="font-mono font-semibold text-slate-800">{visitor?.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Email
                </span>
                <span className="font-mono text-slate-800">{visitor?.email || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <IdCard className="w-3.5 h-3.5 text-slate-400" /> Visitor ID
                </span>
                <span className="font-mono text-indigo-600 font-semibold">{visitor?.id || id}</span>
              </div>
            </div>
          </div>

          {/* Host & Meeting Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-600" /> Host & Office Location
            </h3>
            <div className="bg-slate-50 rounded-xl p-4 space-y-2.5 border border-slate-100 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Host Employee:</span>
                <span className="font-semibold text-slate-800">{host.name || 'Workplace Host'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Department:</span>
                <span className="text-slate-800">{host.department || host.designation || 'Corporate'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Office Location:</span>
                <span className="font-semibold text-slate-800">{activeVisit?.office || 'Mumbai Goregaon'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Visit Schedule Timeline */}
        {activeVisit && (
          <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" /> Access & Visit Timeline
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Scheduled Date</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{activeVisit.date}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Allowed Window</span>
                <span className="font-semibold text-slate-800 mt-0.5 block font-mono">
                  {activeVisit.scheduledStartTime} - {activeVisit.scheduledEndTime}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Check-In Time</span>
                <span className="font-semibold text-emerald-700 mt-0.5 block font-mono">
                  {activeVisit.checkInTime
                    ? new Date(activeVisit.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : 'Pending'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Check-Out / Duration</span>
                <span className="font-semibold text-slate-800 mt-0.5 block font-mono">
                  {activeVisit.duration || (activeVisit.checkOutTime ? 'Concluded' : 'In Progress')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Activity Logs History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-600" /> Audit History for this Visitor
        </h3>

        {activityLogs.length === 0 ? (
          <p className="text-xs text-slate-500 py-2">No specific activity logs recorded yet.</p>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {activityLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900">{log.action}</span>
                  <p className="text-slate-500 mt-0.5">{log.details}</p>
                </div>
                <div className="text-right text-slate-400 font-mono text-[11px]">
                  <div>{log.performedBy} ({log.role})</div>
                  <div>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Check-Out Dialog */}
      <ConfirmDialog
        isOpen={isConfirmCheckoutOpen}
        onClose={() => setIsConfirmCheckoutOpen(false)}
        onConfirm={handleCheckOut}
        title="Check Out Visitor"
        message={`Check out ${visitor?.name}? Visit duration will be calculated and pass deactivated.`}
        confirmText="Confirm Check-Out"
        variant="danger"
        isLoading={isProcessing}
      />

      {/* Pass Modal */}
      {activeVisit && (
        <VisitorPassModal
          isOpen={isPassModalOpen}
          onClose={() => setIsPassModalOpen(false)}
          passData={activeVisit}
        />
      )}
    </div>
  );
};
