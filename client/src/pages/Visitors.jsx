import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { VisitorFilters } from '../components/visitors/VisitorFilters';
import { VisitorTable } from '../components/visitors/VisitorTable';
import { VisitorDetailsModal } from '../components/visitors/VisitorDetailsModal';
import { VisitorPassModal } from '../components/visitors/VisitorPassModal';
import { VisitorRegistrationModal } from '../components/visitors/VisitorRegistrationModal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { visitService } from '../services/visitService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Users, RefreshCw } from 'lucide-react';
import { hasPermission } from '../auth/permissions';

export const Visitors = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();
  const { currentRole, currentUser } = useAuth();
  const canOperateVisits = hasPermission(currentRole, 'checkIn');

  const [visits, setVisits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || 'ALL',
    office: searchParams.get('office') || 'ALL',
    date: searchParams.get('date') || ''
  });

  // Modals state
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [passData, setPassData] = useState(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [confirmCheckoutVisit, setConfirmCheckoutVisit] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchVisits = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.status && filters.status !== 'ALL') params.status = filters.status;
      if (filters.office && filters.office !== 'ALL') params.office = filters.office;
      if (filters.date) params.date = filters.date;

      const res = await visitService.getAll(params);
      setVisits(res.data || []);
    } catch (err) {
      toast.error(err.message || 'Unable to load visitors directory.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: 'ALL',
      office: 'ALL',
      date: ''
    });
  };

  const handleCheckIn = async (visit) => {
    try {
      setIsProcessing(true);
      await visitService.checkIn(visit.id, {
        invitationId: visit.invitationId,
        visitorId: visit.visitorId,
        performedBy: currentUser.name,
        role: currentRole
      });
      toast.success(`${visit.visitor?.name || 'Visitor'} checked in successfully.`);
      await fetchVisits();
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
        performedBy: currentUser.name,
        role: currentRole
      });
      toast.success(
        `${confirmCheckoutVisit.visitor?.name || 'Visitor'} checked out. Stay duration: ${res.data?.duration || 'N/A'}`
      );
      setConfirmCheckoutVisit(null);
      await fetchVisits();
    } catch (err) {
      toast.error(err.message || 'Failed to check out visitor.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visitor Directory & Access Log"
        subtitle="Manage expected guests, track on-site presence, detect overstays, and record access logs."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={fetchVisits}
              title="Reload list"
            >
              Reload
            </Button>
            {hasPermission(currentRole, 'registerVisitor') && (
              <Button
                variant="primary"
                size="sm"
                icon={UserPlus}
                onClick={() => setIsRegisterModalOpen(true)}
              >
                Register Walk-In
              </Button>
            )}
          </div>
        }
      />

      {/* Multi-criteria filter toolbar */}
      <VisitorFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        totalResults={visits.length}
      />

      {/* Main Table or Empty State */}
      {isLoading ? (
        <LoadingSpinner text="Querying visitor registry..." />
      ) : visits.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No visitors found"
          description="No visitor records matched your search terms and filter criteria."
          actionLabel="Clear Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <VisitorTable
          visits={visits}
          onSelectVisit={(v) => setSelectedVisit(v)}
          onCheckIn={canOperateVisits ? handleCheckIn : undefined}
          onCheckOut={canOperateVisits ? (v) => setConfirmCheckoutVisit(v) : undefined}
          onViewPass={(v) => setPassData(v)}
          itemsPerPage={10}
        />
      )}

      {/* Visitor Profile Details Modal */}
      <VisitorDetailsModal
        isOpen={Boolean(selectedVisit)}
        onClose={() => setSelectedVisit(null)}
        visit={selectedVisit}
        onCheckIn={canOperateVisits ? handleCheckIn : undefined}
        onCheckOut={canOperateVisits ? (v) => setConfirmCheckoutVisit(v) : undefined}
        onViewPass={(v) => setPassData(v)}
      />

      {/* QR e-Pass Modal */}
      <VisitorPassModal
        isOpen={Boolean(passData)}
        onClose={() => setPassData(null)}
        passData={passData}
      />

      {/* Walk-in Visitor Registration Modal */}
      <VisitorRegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onVisitorRegistered={() => {
          fetchVisits();
        }}
      />

      {/* Confirm Checkout Dialog */}
      <ConfirmDialog
        isOpen={Boolean(confirmCheckoutVisit)}
        onClose={() => setConfirmCheckoutVisit(null)}
        onConfirm={handleCheckOut}
        title="Confirm Visitor Departure"
        message={`Check out ${confirmCheckoutVisit?.visitor?.name}? Access pass will be revoked and duration recorded.`}
        confirmText="Check Out Visitor"
        variant="danger"
        isLoading={isProcessing}
      />
    </div>
  );
};
