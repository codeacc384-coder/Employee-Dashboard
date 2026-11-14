import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { SecurityPage } from '../features/account/SecurityPage';
import { AttendancePage } from '../features/attendance/AttendancePage';
import { SignInPage } from '../features/auth/SignInPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { DocumentsPage } from '../features/documents/DocumentsPage';
import { ExpensesPage } from '../features/expenses/ExpensesPage';
import { LeavePage } from '../features/leave/LeavePage';
import { LoansPage } from '../features/loans/LoansPage';
import { ManagerPage } from '../features/manager/ManagerPage';
import { NotificationsPage } from '../features/notifications/NotificationsPage';
import { PayrollPage } from '../features/payroll/PayrollPage';
import { PerformancePage } from '../features/performance/PerformancePage';
import { ProfilePage } from '../features/profile/ProfilePage';
import { SupportPage } from '../features/support/SupportPage';
import { TaxPage } from '../features/tax/TaxPage';
import { PortalLayout } from '../layouts/PortalLayout';

export function AppRouter() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <SignInPage />;
  }

  return (
    <BrowserRouter>
      <PortalLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/leave" element={<LeavePage />} />
          <Route path="/my-payroll" element={<PayrollPage />} />
          <Route path="/tax" element={<TaxPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/loans" element={<LoansPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/performance" element={<PerformancePage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/manager" element={<ManagerPage />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </PortalLayout>
    </BrowserRouter>
  );
}
