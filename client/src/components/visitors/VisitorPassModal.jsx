import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Printer, ShieldCheck, MapPin, Calendar, Clock, User, Building } from 'lucide-react';

export const VisitorPassModal = ({ isOpen, onClose, passData }) => {
  if (!passData) return null;

  const visitor = passData.visitor || (passData.guests && passData.guests[0]) || {
    name: 'Guest Visitor',
    company: 'Visitor'
  };

  const host = passData.host || { name: 'Corporate Host', department: 'Workplace' };
  const invitationId = passData.invitationId || passData.id || 'INV-PASS';
  const office = passData.office || 'Corporate HQ';
  const date = passData.date || 'Today';
  const startTime = passData.scheduledStartTime || passData.startTime || '09:00';
  const endTime = passData.scheduledEndTime || passData.endTime || '18:00';
  const status = passData.status || 'APPROVED';

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md" title="Visitor Security e-Pass">
      <div id="printable-pass" className="flex flex-col items-center">
        {/* Pass Card Shell */}
        <div className="w-full bg-gradient-to-b from-slate-900 to-slate-950 text-white p-6 rounded-2xl shadow-xl border border-slate-800 relative overflow-hidden">
          {/* Accent top banner */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-indigo-500" />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold tracking-tight text-white">SECUREPASS</h4>
                <p className="text-[10px] text-slate-400 font-mono tracking-wide">VERIFIED ACCESS PASS</p>
              </div>
            </div>
            <Badge status={status} size="sm" />
          </div>

          {/* QR Code Container */}
          <div className="my-6 flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-inner border border-slate-200">
            <QRCodeSVG
              value={invitationId}
              size={160}
              level="H"
              includeMargin={true}
            />
            <p className="mt-2 text-xs font-mono font-bold text-slate-800 tracking-wider">
              {invitationId}
            </p>
            <p className="text-[10px] text-slate-500">Scan at Reception / Gate Turnstile</p>
          </div>

          {/* Visitor Info Details */}
          <div className="space-y-3 text-xs bg-slate-900/90 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" /> Visitor
              </span>
              <span className="font-bold text-white text-sm text-right">
                {visitor.name}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-indigo-400" /> Company
              </span>
              <span className="font-medium text-slate-200 text-right">
                {visitor.company || 'Direct Guest'}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" /> Host
              </span>
              <span className="font-medium text-slate-200 text-right">
                {host.name} ({host.department || 'Host'})
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" /> Office
              </span>
              <span className="font-medium text-slate-200 text-right">{office}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Valid Window
              </span>
              <span className="font-medium text-emerald-400 text-right">
                {date} ({startTime} - {endTime})
              </span>
            </div>
          </div>

          {/* Footer note */}
          <p className="mt-4 text-[10px] text-center text-slate-500 leading-tight">
            Valid photo government ID required for verification upon arrival.
          </p>
        </div>

        {/* Action Controls */}
        <div className="mt-5 flex items-center justify-end gap-3 w-full">
          <Button variant="secondary" onClick={onClose} size="sm">
            Close
          </Button>
          <Button variant="primary" icon={Printer} onClick={handlePrint} size="sm">
            Print / Save Pass
          </Button>
        </div>
      </div>
    </Modal>
  );
};
