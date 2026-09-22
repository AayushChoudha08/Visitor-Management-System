import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { VisitorPassModal } from '../components/visitors/VisitorPassModal';
import { invitationService } from '../services/invitationService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  CheckCircle,
  XCircle,
  Clock,
  Building,
  User,
  MapPin,
  Calendar,
  CheckSquare,
  QrCode,
  AlertCircle
} from 'lucide-react';

export const Approvals = () => {
  const toast = useToast();
  const { currentRole, currentUser } = useAuth();

  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInv, setSelectedInv] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approve' | 'reject'
  const [isProcessing, setIsProcessing] = useState(false);
  const [passData, setPassData] = useState(null);

  const fetchInvitations = async () => {
    try {
      setIsLoading(true);
      const res = await invitationService.getAll();
      setInvitations(res.data || []);
    } catch (err) {
      toast.error(err.message || 'Unable to load invitations.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const canManageApprovals = currentRole === 'Admin' || currentRole === 'Employee';
  const pendingInvitations = invitations.filter((inv) => {
    if (inv.status !== 'PENDING') return false;
    if (currentRole === 'Admin') return true;
    if (currentRole === 'Employee') return inv.hostId === currentUser.employeeId;
    return false;
  });

  const handleConfirmAction = async () => {
    if (!selectedInv || !actionType) return;
    setIsProcessing(true);
    try {
      if (actionType === 'approve') {
        const res = await invitationService.approve(selectedInv.id, {
          performedBy: currentUser.name,
          role: currentRole
        });
        toast.success('Visitor approved successfully.');
        setPassData(res.data);
      } else {
        await invitationService.reject(selectedInv.id, {
          reason: 'Workplace capacity reached or unauthorized visit window.',
          performedBy: currentUser.name,
          role: currentRole
        });
        toast.info('Visitor request rejected.');
      }
      setSelectedInv(null);
      setActionType(null);
      fetchInvitations();
    } catch (err) {
      toast.error(err.message || `Failed to ${actionType} invitation.`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visitor Approvals"
        subtitle="Review security clearance requests, authorize building access, or reject unverified visits."
        badge={
          canManageApprovals && pendingInvitations.length > 0 && (
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {pendingInvitations.length} Pending
            </span>
          )
        }
      />

      {/* Pending Approvals Section */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" /> Pending Approval Requests ({pendingInvitations.length})
        </h2>

        {isLoading ? (
          <LoadingSpinner text="Fetching pending clearance requests..." />
        ) : pendingInvitations.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No pending approvals"
            description="All visitor requests have been reviewed and processed. Excellent work!"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingInvitations.map((inv) => {
              const guest = (inv.guests && inv.guests[0]) || {};
              const host = inv.host || {};

              return (
                <div
                  key={inv.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-5 space-y-4 hover:shadow-elevated transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row */}
                    <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-[11px] font-mono font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                          {inv.id}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 mt-1">{inv.eventTitle}</h3>
                      </div>
                      <Badge status={inv.status} size="sm" />
                    </div>

                    {/* Guest & Host Profile Row */}
                    <div className="mt-3.5 flex items-center gap-3">
                      <img
                        src={guest.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                        alt={guest.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{guest.name || 'External Guest'}</p>
                        <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-400" /> {guest.company || 'Direct'}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Host: <strong className="text-slate-700 font-semibold">{host.name}</strong> ({host.department})
                        </p>
                      </div>
                    </div>

                    {/* Meta info grid */}
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Visit Type</span>
                        <span className="font-semibold text-slate-800">{inv.visitType}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Office</span>
                        <span className="font-semibold text-slate-800">{inv.office}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Date</span>
                        <span className="font-semibold text-slate-800">{inv.date}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Time Window</span>
                        <span className="font-semibold text-slate-800">{inv.startTime} - {inv.endTime}</span>
                      </div>
                    </div>

                    {inv.note && (
                      <p className="mt-2.5 text-xs text-slate-500 italic">
                        "{inv.note}"
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  {currentRole === 'Admin' || (currentRole === 'Employee' && inv.hostId === currentUser.employeeId) ? (
                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                      <Button
                        variant="danger"
                        size="sm"
                        icon={XCircle}
                        onClick={() => {
                          setSelectedInv(inv);
                          setActionType('reject');
                        }}
                        className="flex-1 text-xs"
                      >
                        Reject Request
                      </Button>

                      <Button
                        variant="success"
                        size="sm"
                        icon={CheckCircle}
                        onClick={() => {
                          setSelectedInv(inv);
                          setActionType('approve');
                        }}
                        className="flex-1 text-xs"
                      >
                        Approve Visitor
                      </Button>
                    </div>
                  ) : (
                    <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                      Only the assigned host or admin can approve or reject this request.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(selectedInv && actionType)}
        onClose={() => {
          setSelectedInv(null);
          setActionType(null);
        }}
        onConfirm={handleConfirmAction}
        title={actionType === 'approve' ? 'Approve Visitor Invitation' : 'Reject Visitor Request'}
        message={
          actionType === 'approve'
            ? `Grant clearance for ${selectedInv?.guests?.[0]?.name || 'the visitor'} to visit ${selectedInv?.office} on ${selectedInv?.date}? A valid digital QR pass will be issued.`
            : `Are you sure you want to REJECT clearance for ${selectedInv?.guests?.[0]?.name || 'the visitor'}? They will not be allowed entry.`
        }
        confirmText={actionType === 'approve' ? 'Approve & Issue Pass' : 'Reject Access'}
        variant={actionType === 'approve' ? 'primary' : 'danger'}
        isLoading={isProcessing}
      />

      {/* Auto-preview Pass after approval */}
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
