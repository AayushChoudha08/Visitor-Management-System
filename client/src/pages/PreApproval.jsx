import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { GuestSearch } from '../components/invitation/GuestSearch';
import { SelectedGuests } from '../components/invitation/SelectedGuests';
import { VisitorPassModal } from '../components/visitors/VisitorPassModal';
import { VisitorRegistrationModal } from '../components/visitors/VisitorRegistrationModal';
import { employeeService } from '../services/employeeService';
import { invitationService } from '../services/invitationService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Sparkles, QrCode, ShieldCheck, Check } from 'lucide-react';

export const PreApproval = () => {
  const toast = useToast();
  const { currentRole, currentUser } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [selectedGuests, setSelectedGuests] = useState([]);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passData, setPassData] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    eventTitle: 'VIP Executive Briefing & Campus Tour',
    visitType: 'Business Guest',
    office: 'Mumbai Goregaon',
    date: todayStr,
    startTime: '10:00',
    endTime: '12:00',
    hostId: currentUser.employeeId || 'EMP-001',
    note: 'VIP Pre-approved guest. Expedite front desk security verification.'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    employeeService.getAll().then((res) => setEmployees(res.data || []));
  }, []);

  const handleAddGuest = (guest) => {
    if (selectedGuests.some((g) => g.id === guest.id)) return;
    setSelectedGuests([guest]); // Pre-approval is typically 1 VIP/guest
    setErrors((prev) => ({ ...prev, guests: null }));
  };

  const handleRemoveGuest = () => {
    setSelectedGuests([]);
  };

  const validate = () => {
    const errs = {};
    if (!formData.eventTitle.trim()) errs.eventTitle = 'Purpose / Title is required.';
    if (!formData.date) errs.date = 'Date is required.';
    if (!formData.startTime) errs.startTime = 'Start time required.';
    if (!formData.endTime) errs.endTime = 'End time required.';
    if (selectedGuests.length === 0) errs.guests = 'Please select a visitor for pre-approval.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        guestIds: selectedGuests.map((g) => g.id),
        status: 'PRE-APPROVED',
        performedBy: currentUser.name,
        role: currentRole
      };

      const res = await invitationService.preApprove(payload);
      toast.success('Visitor pre-approved successfully! Digital QR pass is ready.');
      setPassData(res.data);
    } catch (err) {
      toast.error(err.message || 'Unable to pre-approve visitor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Pre-Approve Visitors"
        subtitle="Expedite campus clearance for clients, vendors, and VIPs with guaranteed pre-authorized digital QR passes."
      />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        {/* Banner */}
        <div className="p-6 bg-gradient-to-r from-purple-900 to-indigo-900 text-white flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Instant Security Clearance
            </span>
            <h2 className="text-lg font-bold text-white mt-1">Direct Pre-Approval e-Pass</h2>
            <p className="text-xs text-purple-200 mt-0.5">
              Generates an active offline QR code pass instantly bypassing approval wait times.
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {/* Guest selection */}
          <div>
            <GuestSearch
              onSelectGuest={handleAddGuest}
              selectedGuestIds={selectedGuests.map((g) => g.id)}
              onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
            />
            {errors.guests && <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.guests}</p>}
            <SelectedGuests guests={selectedGuests} onRemoveGuest={handleRemoveGuest} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Meeting Purpose / Event"
              required
              value={formData.eventTitle}
              onChange={(e) => setFormData({ ...formData, eventTitle: e.target.value })}
              error={errors.eventTitle}
            />

            <Select
              label="Office Location"
              required
              value={formData.office}
              onChange={(e) => setFormData({ ...formData, office: e.target.value })}
              options={[
                { value: 'Mumbai Goregaon', label: 'Mumbai Goregaon' },
                { value: 'Delhi', label: 'Delhi' },
                { value: 'Bangalore', label: 'Bangalore' },
                { value: 'Hyderabad', label: 'Hyderabad' },
                { value: 'Pune', label: 'Pune' }
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Valid Date"
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              error={errors.date}
            />
            <Input
              label="Start Window"
              type="time"
              required
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              error={errors.startTime}
            />
            <Input
              label="End Window"
              type="time"
              required
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              error={errors.endTime}
            />
          </div>

          <Select
            label="Designated Host Employee"
            required
            value={formData.hostId}
            onChange={(e) => setFormData({ ...formData, hostId: e.target.value })}
            options={employees.map((emp) => ({
              value: emp.id,
              label: `${emp.name} (${emp.designation || emp.department})`
            }))}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={QrCode}
              isLoading={isSubmitting}
              className="w-full sm:w-auto"
            >
              Generate Pre-Approved Pass
            </Button>
          </div>
        </form>
      </div>

      <VisitorRegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onVisitorRegistered={(newVisitor) => {
          handleAddGuest(newVisitor);
          toast.info(`${newVisitor.name} registered and selected for pre-approval.`);
        }}
      />

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
