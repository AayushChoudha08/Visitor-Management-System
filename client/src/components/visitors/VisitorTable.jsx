import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  LogIn,
  LogOut,
  Eye,
  QrCode,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Building
} from 'lucide-react';

export const VisitorTable = ({
  visits = [],
  onSelectVisit,
  onCheckIn,
  onCheckOut,
  onViewPass,
  itemsPerPage = 10
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(visits.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVisits = visits.slice(startIndex, startIndex + itemsPerPage);

  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
      {/* Desktop & Tablet Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Visitor</th>
              <th className="py-3.5 px-4">Company</th>
              <th className="py-3.5 px-4">Host Employee</th>
              <th className="py-3.5 px-4">Scheduled</th>
              <th className="py-3.5 px-4">Check-In / Out</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedVisits.map((visit) => {
              const visitor = visit.visitor || {};
              const host = visit.host || {};
              const invitation = visit.invitation || {};

              const isOverstay = visit.isOverstay;
              const canCheckIn =
                visit.status === 'EXPECTED' &&
                (invitation.status === 'APPROVED' || invitation.status === 'PRE-APPROVED');
              const canCheckOut = visit.status === 'CHECKED_IN';

              return (
                <tr
                  key={visit.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isOverstay ? 'bg-rose-50/20' : ''
                  }`}
                >
                  {/* Visitor Avatar & Name */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={visitor.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                        alt={visitor.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <Link
                          to={`/visitors/${visit.visitorId || visit.id}`}
                          className="font-bold text-slate-900 hover:text-indigo-600 transition truncate block"
                          title="View Full Visitor Details"
                        >
                          {visitor.name || 'Direct Visitor'}
                        </Link>
                        <p className="text-xs text-slate-500 truncate">{visitor.phone || visitor.email || 'N/A'}</p>
                      </div>
                    </div>
                  </td>

                  {/* Company */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1 text-slate-700 text-xs font-medium">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[140px]">{visitor.company || 'Direct'}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{visit.office}</span>
                  </td>

                  {/* Host */}
                  <td className="py-3.5 px-4">
                    <p className="font-medium text-slate-800 text-xs truncate">{host.name || 'Not assigned'}</p>
                    <p className="text-[11px] text-slate-400 truncate">{host.department || ''}</p>
                  </td>

                  {/* Scheduled window */}
                  <td className="py-3.5 px-4 text-xs font-mono text-slate-600">
                    <div>{visit.date}</div>
                    <div className="text-[11px] text-slate-400">
                      {visit.scheduledStartTime} - {visit.scheduledEndTime}
                    </div>
                  </td>

                  {/* Check-In / Check-Out */}
                  <td className="py-3.5 px-4 text-xs">
                    {visit.checkInTime ? (
                      <div>
                        <span className="text-slate-800 font-semibold font-mono">
                          In: {new Date(visit.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {visit.checkOutTime ? (
                          <div className="text-[11px] text-slate-500 font-mono">
                            Out: {new Date(visit.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({visit.duration})
                          </div>
                        ) : (
                          <div className="text-[11px] text-indigo-600 font-medium">Currently on site</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">— Not checked in —</span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col items-start gap-1">
                      <Badge status={visit.effectiveStatus || visit.status} size="sm" />
                      {isOverstay && (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded-sm flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> +{visit.overstayMinutes}m overdue
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Eye}
                        onClick={() => onSelectVisit(visit)}
                        title="View Details"
                        className="px-2"
                      />

                      {onViewPass && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={QrCode}
                          onClick={() => onViewPass(visit)}
                          title="Generate Pass"
                          className="px-2 text-indigo-600 hover:text-indigo-800"
                        />
                      )}

                      {canCheckIn && onCheckIn && (
                        <Button
                          variant="success"
                          size="sm"
                          icon={LogIn}
                          onClick={() => onCheckIn(visit)}
                          className="text-xs py-1 px-2.5"
                        >
                          Check In
                        </Button>
                      )}

                      {canCheckOut && onCheckOut && (
                        <Button
                          variant="danger"
                          size="sm"
                          icon={LogOut}
                          onClick={() => onCheckOut(visit)}
                          className="text-xs py-1 px-2.5"
                        >
                          Check Out
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500">
          <span>
            Showing <strong className="font-semibold text-slate-800">{startIndex + 1}</strong> to{' '}
            <strong className="font-semibold text-slate-800">
              {Math.min(visits.length, startIndex + itemsPerPage)}
            </strong>{' '}
            of <strong className="font-semibold text-slate-800">{visits.length}</strong> visitors
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="p-1 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium text-slate-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="p-1 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
