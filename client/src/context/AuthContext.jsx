import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const AuthContext = createContext();

export const MOCK_ROLES = [
  {
    id: 'Employee',
    name: 'Rahul Sharma',
    role: 'Employee',
    title: 'VP of Engineering (Host)',
    employeeId: 'EMP-001',
    office: 'Mumbai Goregaon',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    description: 'Can create invitations, pre-approve guests, view own invite status'
  },
  {
    id: 'Front Desk',
    name: 'Security Reception Desk',
    role: 'Front Desk',
    title: 'Workplace Security & Front Desk',
    employeeId: 'SEC-001',
    office: 'Mumbai Goregaon',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    description: 'Can register walk-in visitors, check-in, check-out, monitor overstays'
  },
  {
    id: 'Admin',
    name: 'Rajesh Patel',
    role: 'Admin',
    title: 'Head of Corporate Workplace',
    employeeId: 'EMP-009',
    office: 'Mumbai Goregaon',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    description: 'Full administrative access: approve/reject requests, view audit logs'
  }
];

const readStoredSession = () => {
  try {
    const raw = localStorage.getItem('vms_session');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.role) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => readStoredSession());

  const currentRole = session?.role || null;
  const currentUser = useMemo(
    () => MOCK_ROLES.find((r) => r.id === currentRole) || MOCK_ROLES[0],
    [currentRole]
  );

  const switchRole = (roleId) => {
    const found = MOCK_ROLES.find((r) => r.id === roleId);
    if (!found) return;

    const nextSession = {
      userId: found.employeeId,
      name: found.name,
      role: found.id,
      employeeId: found.employeeId,
      title: found.title
    };

    setSession(nextSession);
    localStorage.setItem('vms_session', JSON.stringify(nextSession));
    localStorage.setItem('vms_role', found.id);
  };

  const logout = () => {
    setSession(null);
    localStorage.removeItem('vms_session');
    localStorage.removeItem('vms_role');
  };

  useEffect(() => {
    if (session) {
      localStorage.setItem('vms_session', JSON.stringify(session));
      localStorage.setItem('vms_role', session.role);
    } else {
      localStorage.removeItem('vms_session');
      localStorage.removeItem('vms_role');
    }
  }, [session]);

  return (
    <AuthContext.Provider value={{ currentRole, currentUser, switchRole, logout, allRoles: MOCK_ROLES, isAuthenticated: !!session }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
