import React from 'react';
import { X, User, Building } from 'lucide-react';

export const SelectedGuests = ({ guests = [], onRemoveGuest }) => {
  if (guests.length === 0) return null;

  return (
    <div className="w-full mt-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Selected Guests ({guests.length})
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {guests.map((guest) => (
          <div
            key={guest.id}
            className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 group hover:border-slate-300 transition shadow-2xs"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={guest.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt={guest.name}
                className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{guest.name}</p>
                <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                  <Building className="w-3 h-3 text-slate-400" /> {guest.company || 'Direct'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onRemoveGuest(guest.id)}
              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0 ml-2"
              title="Remove guest"
              aria-label={`Remove ${guest.name}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
