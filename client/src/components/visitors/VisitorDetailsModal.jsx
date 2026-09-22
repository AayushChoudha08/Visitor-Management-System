import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  User,
  Building,
  Mail,
  Phone,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  LogIn,
  LogOut,
  FileText,
  AlertTriangle,
  CreditCard
} from 'lucide-react';

export const VisitorDetailsModal = ({
  isOpen,
  onClose,
  visit,
  onCheckIn,
  onCheckOut,
  onViewPass
}) => {
  if (!visit) return null;

  const visitor = visit.visitor || {};
  const host = visit.host || {};
  const invitation = visit.invitation || {};

  const canCheckIn = visit.status === 'EXPECTED' && (invitation.status === 'APPROVED' || invitation.status === 'PRE-APPROVED');
  const canCheckOut = visit.status === 'CHECKED_IN';

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl" title="Visitor & Visit Profile">
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <img
            src={visitor.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
            alt={visitor.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">{visitor.name || 'Unknown Visitor'}</h3>
              <Badge status={visit.effectiveStatus || visit.status} />
              {visit.isOverstay && (
                <span className="text-xs font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Overstayed by {visit.overstayMinutes}m
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-slate-600 mt-0.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              {visitor.company || 'Direct Guest'}
            </p>
          </div>
          {onViewPass && (
            <Button
              variant="outline"
              size="sm"
              icon={QrCode}
              onClick={() => {
                onClose();
                onViewPass(visit);
              }}
            >
              View Pass
            </Button>
          )}
        </div>

        {/* 2-Column Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Visitor Info */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <User className="w-3.5 h-3.5 text-indigo-500" /> Visitor Details
            </h4>
            <div className="text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-medium text-slate-800 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" /> {visitor.phone || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-medium text-slate-800 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" /> {visitor.email || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Govt ID:</span>
                <span className="font-medium text-slate-800 flex items-center gap-1">
                  <CreditCard className="w-3 h-3 text-slate-400" /> {visitor.idType || 'ID'}: {visitor.idNumber || 'Verified'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Visitor ID:</span>
                <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">{visitor.id}</span>
              </div>
            </div>
          </div>

          {/* Host & Meeting Info */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Building className="w-3.5 h-3.5 text-indigo-500" /> Host & Workplace
            </h4>
            <div className="text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Host Employee:</span>
                <span className="font-medium text-slate-800">{host.name || 'Not assigned'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Department:</span>
                <span className="font-medium text-slate-800">{host.department || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Office Branch:</span>
                <span className="font-medium text-slate-800 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" /> {visit.office || 'Main'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Invitation ID:</span>
                <span className="font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-semibold">
                  {visit.invitationId}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Visit Timestamps & Metrics */}
        <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <Clock className="w-3.5 h-3.5 text-indigo-500" /> Schedule & Visit Timings
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-400 block font-medium">Scheduled Window</span>
              <span className="text-xs font-bold text-slate-800 mt-1 block">
                {visit.scheduledStartTime} - {visit.scheduledEndTime}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-400 block font-medium">Check-In Time</span>
              <span className="text-xs font-bold text-slate-800 mt-1 block">
                {visit.checkInTime ? new Date(visit.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] text-slate-400 block font-medium">Check-Out Time</span>
              <span className="text-xs font-bold text-slate-800 mt-1 block">
                {visit.checkOutTime ? new Date(visit.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
              <span className="text-[11px] text-indigo-500 block font-medium">Visit Duration</span>
              <span className="text-xs font-extrabold text-indigo-700 mt-1 block">
                {visit.duration || (visit.status === 'CHECKED_IN' ? 'In Progress' : '—')}
              </span>
            </div>
          </div>

          {visit.notes && (
            <div className="mt-3 p-3 rounded-xl bg-slate-50 text-xs text-slate-600 border border-slate-100">
              <span className="font-semibold text-slate-700">Notes / Instructions: </span>
              {visit.notes}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} size="sm">
            Close
          </Button>

          <div className="flex items-center gap-2">
            {canCheckIn && onCheckIn && (
              <Button
                variant="success"
                size="sm"
                icon={LogIn}
                onClick={() => {
                  onClose();
                  onCheckIn(visit);
                }}
              >
                Check In Visitor
              </Button>
            )}

            {canCheckOut && onCheckOut && (
              <Button
                variant="danger"
                size="sm"
                icon={LogOut}
                onClick={() => {
                  onClose();
                  onCheckOut(visit);
                }}
              >
                Check Out Visitor
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
