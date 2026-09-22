import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Camera, Upload, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { employeeService } from '../../services/employeeService';
import { visitorService } from '../../services/visitorService';
import { useToast } from '../../context/ToastContext';

export const VisitorRegistrationModal = ({ isOpen, onClose, onVisitorRegistered }) => {
  const toast = useToast();
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    purpose: '',
    hostId: '',
    idType: 'Aadhaar',
    idNumber: '',
    photo: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Webcam state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadEmployees();
    } else {
      stopCamera();
    }
  }, [isOpen]);

  const loadEmployees = async () => {
    try {
      const res = await employeeService.getAll();
      const list = res.data || [];
      setEmployees(list);
      if (list.length > 0 && !formData.hostId) {
        setFormData((prev) => ({ ...prev, hostId: list[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 400, height: 400 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      toast.error('Unable to access camera. Please upload an image file instead.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, 300, 300);
    const base64 = canvas.toDataURL('image/jpeg', 0.85);
    setFormData((prev) => ({ ...prev, photo: base64 }));
    stopCamera();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image file size must be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required.';
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required.';
    } else if (!/^\+?[\d\s-]{8,15}$/.test(formData.phone.trim())) {
      errs.phone = 'Valid phone number is required (8-15 digits).';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email.';
    }
    if (!formData.purpose.trim()) errs.purpose = 'Purpose of visit is required.';
    if (!formData.hostId) errs.hostId = 'Host employee is required.';
    if (!formData.photo) errs.photo = 'Visitor photograph is required.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await visitorService.create(formData);
      toast.success('Visitor registered successfully!');
      if (onVisitorRegistered) {
        onVisitorRegistered(res.data);
      }
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to register visitor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-xl" title="Register New Visitor">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Photo Upload / Webcam Section */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
          {isCameraActive ? (
            <div className="relative w-48 h-48 rounded-2xl overflow-hidden bg-black mb-3 border-2 border-indigo-500">
              <video ref={videoRef} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={capturePhoto}
                className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 py-1.5 rounded-full shadow font-semibold flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" /> Capture
              </button>
            </div>
          ) : formData.photo ? (
            <div className="relative mb-3">
              <img
                src={formData.photo}
                alt="Visitor Preview"
                className="w-24 h-24 rounded-2xl object-cover border-2 border-indigo-600 shadow-md"
              />
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, photo: '' }))}
                className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow hover:bg-rose-600"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-slate-200/70 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 mb-3">
              <Camera className="w-8 h-8" />
            </div>
          )}

          <div className="flex items-center gap-2">
            {!isCameraActive && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={Camera}
                  onClick={startCamera}
                >
                  Use Webcam
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={Upload}
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  Upload File
                </Button>
              </>
            )}
            {isCameraActive && (
              <Button type="button" variant="ghost" size="sm" onClick={stopCamera}>
                Cancel Camera
              </Button>
            )}
          </div>
          {errors.photo && <p className="text-xs text-rose-600 mt-2 font-medium">{errors.photo}</p>}
        </div>

        {/* Input fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            required
            placeholder="e.g. Rahul Sharma"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
          />
          <Input
            label="Mobile Number"
            required
            placeholder="+91 98765 43210"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            error={errors.phone}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="visitor@company.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
          />
          <Input
            label="Company / Organization"
            placeholder="e.g. Tata Consultancy Services"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Govt ID Type"
            value={formData.idType}
            onChange={(e) => setFormData({ ...formData, idType: e.target.value })}
            options={[
              { value: 'Aadhaar', label: 'Aadhaar Card' },
              { value: 'PAN', label: 'PAN Card' },
              { value: 'Driving License', label: 'Driving License' },
              { value: 'Passport', label: 'Passport' },
              { value: 'Voter ID', label: 'Voter ID' },
              { value: 'Corporate ID', label: 'Corporate Employee Badge' }
            ]}
          />
          <Input
            label="ID Number"
            placeholder="XXXX-XXXX-XXXX"
            value={formData.idNumber}
            onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Purpose of Visit"
            required
            placeholder="e.g. Client Architecture Review"
            value={formData.purpose}
            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            error={errors.purpose}
          />
          <Select
            label="Host Employee"
            required
            value={formData.hostId}
            onChange={(e) => setFormData({ ...formData, hostId: e.target.value })}
            error={errors.hostId}
            options={employees.map((emp) => ({
              value: emp.id,
              label: `${emp.name} (${emp.department} - ${emp.office})`
            }))}
          />
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting} icon={Check}>
            Register Visitor
          </Button>
        </div>
      </form>
    </Modal>
  );
};
