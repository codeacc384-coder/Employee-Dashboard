import React, { createContext, useContext, useMemo, useState } from 'react';
import { DEMO_COMPANIES, DEMO_EMPLOYEES } from '../mock-data/demoData';
import { CompanyPolicyConfig, EmployeeProfile } from '../types/ess';

interface AuthContextValue {
  currentUser: EmployeeProfile | null;
  activeCompany: CompanyPolicyConfig;
  authorizedCompanies: CompanyPolicyConfig[];
  isManagerAuthorized: boolean;
  switchDemoAccount: (employeeId: string) => void;
  switchCompany: (companyId: string) => void;
  updateCurrentUserProfile: (patch: Partial<EmployeeProfile>) => void;
  signOut: () => void;
  signInDemo: (employeeId: string) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<Record<string, EmployeeProfile>>(DEMO_EMPLOYEES);
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string | null>('emp-1042');
  const [activeCompanyId, setActiveCompanyId] = useState<string>('comp-nexacore-it');

  const currentUser = currentEmployeeId ? profiles[currentEmployeeId] ?? null : null;

  const authorizedCompanies = useMemo(() => {
    if (!currentUser) return [DEMO_COMPANIES['comp-nexacore-it']];
    return currentUser.authorizedCompanyIds
      .map((id) => DEMO_COMPANIES[id])
      .filter(Boolean);
  }, [currentUser]);

  const activeCompany = useMemo(() => {
    return DEMO_COMPANIES[activeCompanyId] ?? DEMO_COMPANIES['comp-nexacore-it'];
  }, [activeCompanyId]);

  const isManagerAuthorized = Boolean(
    currentUser?.hasManagerRole && currentUser.managerPermissions.length > 0
  );

  const switchDemoAccount = (employeeId: string) => {
    if (profiles[employeeId]) {
      setCurrentEmployeeId(employeeId);
      setActiveCompanyId(profiles[employeeId].companyId);
    }
  };

  const switchCompany = (companyId: string) => {
    if (currentUser?.authorizedCompanyIds.includes(companyId) && DEMO_COMPANIES[companyId]) {
      setActiveCompanyId(companyId);
    }
  };

  const updateCurrentUserProfile = (patch: Partial<EmployeeProfile>) => {
    if (!currentEmployeeId) return;
    setProfiles((prev) => ({
      ...prev,
      [currentEmployeeId]: {
        ...prev[currentEmployeeId],
        ...patch,
      },
    }));
  };

  const signOut = () => setCurrentEmployeeId(null);
  const signInDemo = (employeeId: string) => {
    setCurrentEmployeeId(employeeId);
    if (profiles[employeeId]) {
      setActiveCompanyId(profiles[employeeId].companyId);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activeCompany,
        authorizedCompanies,
        isManagerAuthorized,
        switchDemoAccount,
        switchCompany,
        updateCurrentUserProfile,
        signOut,
        signInDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
