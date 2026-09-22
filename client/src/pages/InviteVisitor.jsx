import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { GuestSearch } from '../components/invitation/GuestSearch';
import { SelectedGuests } from '../components/invitation/SelectedGuests';
import { VisitorRegistrationModal } from '../components/visitors/VisitorRegistrationModal';
import { VisitorPassModal } from '../components/visitors/VisitorPassModal';
import { employeeService } from '../services/employeeService';
import { invitationService } from '../services/invitationService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  Send,
  Calendar,
  Clock,
  Building,
  FileText,
  User,
  QrCode,
  Sparkles,
  Info
} from 'lucide-react';

export const InviteVisitor = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { currentRole, currentUser } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [selectedGuests, setSelectedGuests] = useState([]);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdPassData, setCreatedPassData] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    eventTitle: 'Client Architecture Review',
    visitType: 'Business Guest',
    office: 'Mumbai Goregaon',
    date: todayStr,
    startTime: '10:00',
    endTime: '12:00',
    hostId: currentUser.employeeId || 'EMP-001',
    note: 'Please arrive 10 minutes before the scheduled time and check in at security.'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const res = await employeeService.getAll();
      setEmployees(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddGuest = (guest) => {
    if (selectedGuests.some((g) => g.id === guest.id)) {
      toast.warning(`${guest.name} is already in the selected guests list.`);
      return;
    }
    setSelectedGuests((prev) => [...prev, guest]);
    if (errors.guests) {
      setErrors((prev) => ({ ...prev, guests: null }));
    }
  };

  const handleRemoveGuest = (guestId) => {
    setSelectedGuests((prev) => prev.filter((g) => g.id !== guestId));
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.eventTitle.trim()) {
      errs.eventTitle = 'Event / Meeting Title is required.';
    }
    if (!formData.visitType) {
      errs.visitType = 'Visit Type is required.';
    }
    if (!formData.office) {
      errs.office = 'Office location is required.';
    }
    if (!formData.date) {
      errs.date = 'Meeting date is required.';
    }
    if (!formData.startTime) {
      errs.startTime = 'Start time is required.';
    }
    if (!formData.endTime) {
      errs.endTime = 'End time is required.';
    }

    if (formData.startTime && formData.endTime) {
      const [sh, sm] = formData.startTime.split(':').map(Number);
      const [eh, em] = formData.endTime.split(':').map(Number);
      if (eh * 60 + em <= sh * 60 + sm) {
        errs.endTime = 'End time must be after start time.';
      }
    }

    if (selectedGuests.length === 0) {
      errs.guests = 'At least one guest must be added to create an invitation.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        guestIds: selectedGuests.map((g) => g.id),
        performedBy: currentUser.name,
        role: currentRole
      };

      const res = await invitationService.create(payload);
      toast.success(`Visitor invitation created successfully (${res.data?.id}).`);
      setCreatedPassData(res.data);
    } catch (err) {
      toast.error(err.message || 'Unable to create invitation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title="Invite Visitors"
        subtitle="Schedule corporate meetings and issue security passes for external guests."
      />

      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        {/* Form banner */}
        <div className="p-6 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
              Visitor Access Form
            </span>
            <h2 className="text-lg font-bold text-white mt-1">Schedule Workplace Visit</h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Guest access passes will be verified and authorized prior to campus entry.
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 hidden sm:flex">
            <Send className="w-6 h-6" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* Section: Meeting Information */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <FileText className="w-4 h-4 text-indigo-600" /> Meeting Details
            </h3>

            <div className="space-y-4">
              <Input
                label="Event / Meeting Title"
                required
                placeholder="e.g. Strategic Architecture Review"
                value={formData.eventTitle}
                onChange={(e) => setFormData({ ...formData, eventTitle: e.target.value })}
                error={errors.eventTitle}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Visit Type"
                  required
                  value={formData.visitType}
                  onChange={(e) => setFormData({ ...formData, visitType: e.target.value })}
                  error={errors.visitType}
                  options={[
                    { value: 'Business Guest', label: 'Business Guest' },
                    { value: 'Vendor', label: 'Vendor / Contractor' },
                    { value: 'Personnel', label: 'Personnel / Candidate' },
                    { value: 'Government Official', label: 'Government Official' },
                    { value: 'Interview', label: 'Interview' },
                    { value: 'PwC Network Firm', label: 'PwC Network Firm' },
                    { value: 'Others', label: 'Others' }
                  ]}
                />

                <Select
                  label="Office Location"
                  required
                  value={formData.office}
                  onChange={(e) => setFormData({ ...formData, office: e.target.value })}
                  error={errors.office}
                  options={[
                    { value: 'Mumbai Goregaon', label: 'Mumbai Goregaon (HQ)' },
                    { value: 'Delhi', label: 'Delhi (Barakhamba Road)' },
                    { value: 'Bangalore', label: 'Bangalore (Whitefield)' },
                    { value: 'Hyderabad', label: 'Hyderabad (HITEC City)' },
                    { value: 'Pune', label: 'Pune (Magarpatta)' }
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Meeting Date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  error={errors.date}
                />

                <Input
                  label="Start Time"
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  error={errors.startTime}
                />

                <Input
                  label="End Time"
                  type="time"
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  error={errors.endTime}
                />
              </div>

              <Select
                label="Host Employee"
                required
                value={formData.hostId}
                onChange={(e) => setFormData({ ...formData, hostId: e.target.value })}
                options={employees.map((emp) => ({
                  value: emp.id,
                  label: `${emp.name} — ${emp.designation || emp.department} (${emp.office})`
                }))}
              />
            </div>
          </div>

          {/* Section: Guest Selection */}
          <div className="pt-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <User className="w-4 h-4 text-indigo-600" /> Guest Selection
            </h3>

            <GuestSearch
              onSelectGuest={handleAddGuest}
              selectedGuestIds={selectedGuests.map((g) => g.id)}
              onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
              canRegisterNewGuest={currentRole !== 'Front Desk'}
            />

            {errors.guests && (
              <p className="mt-2 text-xs text-rose-600 font-medium">{errors.guests}</p>
            )}

            <SelectedGuests
              guests={selectedGuests}
              onRemoveGuest={handleRemoveGuest}
            />
          </div>

          {/* Section: Notes */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Personal Note / Reception Instructions
            </label>
            <textarea
              rows={3}
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Add visitor instructions, parking badge info, or conference room details..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button
              variant="secondary"
              onClick={() => navigate('/dashboard')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={Send}
              isLoading={isSubmitting}
            >
              Create Visitor Invitation
            </Button>
          </div>
        </form>
      </div>

      {/* Fast Registration Modal if guest isn't in directory */}
      <VisitorRegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onVisitorRegistered={(newVisitor) => {
          handleAddGuest(newVisitor);
          toast.info(`${newVisitor.name} added to current invitation!`);
        }}
      />

      {/* Generated e-Pass Modal upon success */}
      {createdPassData && (
        <VisitorPassModal
          isOpen={Boolean(createdPassData)}
          onClose={() => {
            setCreatedPassData(null);
            navigate('/dashboard');
          }}
          passData={createdPassData}
        />
      )}
    </div>
  );
};
