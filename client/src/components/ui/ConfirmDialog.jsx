import React from 'react';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary', // primary | danger | warning
  isLoading = false
}) => {
  const iconConfig = {
    danger: { icon: AlertCircle, color: 'text-rose-600 bg-rose-50 border-rose-100' },
    warning: { icon: AlertTriangle, color: 'text-amber-600 bg-amber-50 border-amber-100' },
    primary: { icon: AlertCircle, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' }
  };

  const currentIcon = iconConfig[variant] || iconConfig.primary;
  const IconComponent = currentIcon.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md" showClose={false}>
      <div className="flex flex-col items-center text-center">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border ${currentIcon.color}`}>
          <IconComponent className="w-6 h-6" />
        </div>
        <h4 className="text-lg font-bold text-slate-900">{title}</h4>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">{message}</p>

        <div className="mt-6 flex items-center justify-center gap-3 w-full">
          <Button variant="secondary" onClick={onClose} disabled={isLoading} className="flex-1">
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm} isLoading={isLoading} className="flex-1">
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
