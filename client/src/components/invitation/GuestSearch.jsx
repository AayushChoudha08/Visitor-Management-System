import React, { useState, useEffect, useRef } from 'react';
import { Search, UserPlus, Check, Building, Phone } from 'lucide-react';
import { visitorService } from '../../services/visitorService';
import { useAuth } from '../../context/AuthContext';
import { hasPermission } from '../../auth/permissions';

export const GuestSearch = ({ onSelectGuest, selectedGuestIds = [], onOpenRegisterModal, canRegisterNewGuest = false }) => {
  const { currentRole } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);
  const shouldShowNewGuestButton = canRegisterNewGuest && hasPermission(currentRole, 'invite');

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 0) {
        setIsLoading(true);
        try {
          const res = await visitorService.getAll(query);
          setResults(res.data || []);
          setIsOpen(true);
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (visitor) => {
    onSelectGuest(visitor);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
        Search & Add Guests <span className="text-rose-500">*</span>
      </label>
      <div className="relative rounded-xl shadow-2xs">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder="Search registered guests by Name, Email, Phone, or Company..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          className="block w-full rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 text-sm pl-10 pr-24 py-2.5 transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        {shouldShowNewGuestButton && onOpenRegisterModal && (
          <button
            type="button"
            onClick={onOpenRegisterModal}
            className="absolute inset-y-1 right-1 px-3 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition"
          >
            <UserPlus className="w-3.5 h-3.5" /> New Guest
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-elevated border border-slate-200 z-30 max-h-72 overflow-y-auto divide-y divide-slate-100">
          {isLoading ? (
            <div className="p-4 text-center text-xs text-slate-400">Searching directory...</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-xs text-slate-500">No visitors found matching "{query}".</p>
              {shouldShowNewGuestButton && onOpenRegisterModal && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenRegisterModal();
                  }}
                  className="mt-2 text-xs text-indigo-600 hover:underline font-semibold"
                >
                  + Register as new visitor now
                </button>
              )}
            </div>
          ) : (
            results.map((guest) => {
              const isSelected = selectedGuestIds.includes(guest.id);
              return (
                <div
                  key={guest.id}
                  onClick={() => !isSelected && handleSelect(guest)}
                  className={`p-3 flex items-center justify-between transition cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/50 opacity-60 cursor-not-allowed'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={guest.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                      alt={guest.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{guest.name}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1 truncate">
                          <Building className="w-3 h-3 text-slate-400" /> {guest.company || 'Direct Guest'}
                        </span>
                        <span className="flex items-center gap-1 truncate">
                          <Phone className="w-3 h-3 text-slate-400" /> {guest.phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 ml-3">
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <Check className="w-3 h-3" /> Added
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                        + Add Guest
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
