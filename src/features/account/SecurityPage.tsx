import React, { useEffect, useState } from 'react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { usePortalData } from '../../app/PortalDataContext';
import { useToast } from '../../app/ToastContext';
import { ApprovalStatusBadge } from '../../components/ApprovalStatusBadge';
import { DataTable } from '../../components/DataTable';

type SecurityTab = 'settings' | 'history' | 'password';

export function SecurityPage() {
  const { loginHistory, twoFactorEnabled, setTwoFactorEnabled } = usePortalData();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = (searchParams.get('tab') as SecurityTab) || 'settings';
  const [activeTab, setActiveTab] = useState<SecurityTab>(tabParam);

  useEffect(() => {
    setActiveTab(tabParam);
  }, [tabParam]);

  const changeTab = (t: SecurityTab) => {
    setActiveTab(t);
    setSearchParams({ tab: t });
  };

  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confPass, setConfPass] = useState('');

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }
    if (newPass !== confPass) {
      showToast('New passwords do not match', 'error');
      return;
    }
    setCurrPass('');
    setNewPass('');
    setConfPass('');
    showToast('Password updated successfully', 'success', 'Your PayFuse ESS credentials are updated.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0B1230]">Account Security</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Manage multi-factor authentication, review recent sign-ins, and update your password.
        </p>
      </div>

      <div className="flex overflow-x-auto gap-1.5 border-b border-[#E5E7F0] pb-2">
        {[
          { id: 'settings' as const, label: 'Security Settings' },
          { id: 'history' as const, label: 'Login History' },
          { id: 'password' as const, label: 'Change Password' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => changeTab(t.id)}
            className={`rounded-lg px-3.5 py-2 text-xs font-medium whitespace-nowrap ${
              activeTab === t.id
                ? 'bg-[#7050F5] text-white'
                : 'bg-white text-[#475569] border border-[#E5E7F0]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'settings' && (
        <div className="max-w-2xl rounded-xl border border-[#E5E7F0] bg-white p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-[#16A36A] mt-0.5 shrink-0" />
              <div>
                <h2 className="text-base font-semibold text-[#0B1230]">Two-Factor Authentication (2FA)</h2>
                <p className="mt-1 text-xs text-[#64748B]">
                  Require an authenticator code when signing in from unrecognized devices or viewing payslips.
                </p>
              </div>
            </div>
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium">
              <input
                type="checkbox"
                checked={twoFactorEnabled}
                onChange={(e) => {
                  setTwoFactorEnabled(e.target.checked);
                  showToast(e.target.checked ? '2FA Enabled' : '2FA Disabled', 'info');
                }}
                className="h-4 w-4 accent-[#7050F5]"
              />
              <span>{twoFactorEnabled ? 'Enabled' : 'Disabled'}</span>
            </label>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <DataTable
          data={loginHistory}
          keyExtractor={(l) => l.id}
          columns={[
            { key: 'ts', header: 'Timestamp', render: (l) => <span className="font-mono-tabular text-xs">{l.timestamp}</span> },
            { key: 'dev', header: 'Device', render: (l) => <span className="font-medium text-xs">{l.device}</span> },
            { key: 'br', header: 'Browser', render: (l) => <span className="text-xs text-[#475569]">{l.browser}</span> },
            { key: 'loc', header: 'Location', render: (l) => <span className="text-xs">{l.location}</span> },
            { key: 'ip', header: 'IP (Masked)', render: (l) => <span className="font-mono-tabular text-xs">{l.ipMasked}</span> },
            { key: 'st', header: 'Status', render: (l) => <ApprovalStatusBadge status={l.status} /> },
          ]}
        />
      )}

      {activeTab === 'password' && (
        <form onSubmit={handlePasswordChange} className="max-w-md rounded-xl border border-[#E5E7F0] bg-white p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#F1F3F9] pb-3">
            <KeyRound className="h-4 w-4 text-[#7050F5]" />
            <h2 className="text-base font-semibold text-[#0B1230]">Change Password</h2>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#475569]">Current Password</label>
            <input type="password" required value={currPass} onChange={(e) => setCurrPass(e.target.value)} className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#475569]">New Password (min 8 chars)</label>
            <input type="password" required value={newPass} onChange={(e) => setNewPass(e.target.value)} className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#475569]">Confirm New Password</label>
            <input type="password" required value={confPass} onChange={(e) => setConfPass(e.target.value)} className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="w-full rounded-lg bg-[#7050F5] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#5E3FE0]">
            Update Password
          </button>
        </form>
      )}
    </div>
  );
}
