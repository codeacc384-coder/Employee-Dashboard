/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { AppRouter } from './app/AppRouter';
import { AuthProvider } from './app/AuthContext';
import { PortalDataProvider } from './app/PortalDataContext';
import { ToastProvider } from './app/ToastContext';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <PortalDataProvider>
          <AppRouter />
        </PortalDataProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
