import React from 'react';
import { ArrowRight, ShieldCheck, User, Users } from 'lucide-react';
import { useAuth } from '../../app/AuthContext';

export function SignInPage() {
  const { signInDemo } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F7FC] p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#E5E7F0] bg-white p-7 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <svg width="36" height="36" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <rect width="28" height="28" rx="8" fill="#0B1230" />
            <path d="M8 9.5H15.5C17.9853 9.5 20 11.5147 20 14C20 16.4853 17.9853 18.5 15.5 18.5H11.5V22H8V9.5Z" fill="#7050F5" />
            <path d="M11.5 12.5V15.5H15.2C16.0284 15.5 16.7 14.8284 16.7 14C16.7 13.1716 16.0284 12.5 15.2 12.5H11.5Z" fill="#FFFFFF" />
          </svg>
          <div>
            <h1 className="text-lg font-bold text-[#0B1230]">PayFuse Employee Portal</h1>
            <p className="text-xs text-[#64748B]">Employee & Manager Self-Service</p>
          </div>
        </div>

        <div className="rounded-xl bg-[#F7F7FC] p-4 text-xs text-[#475569] flex items-start gap-2.5">
          <ShieldCheck className="h-4 w-4 text-[#7050F5] shrink-0 mt-0.5" />
          <p>
            Select a demo persona below to inspect employee self-service or permission-scoped reporting manager approvals.
          </p>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => signInDemo('emp-1042')}
            className="flex w-full items-center justify-between rounded-xl border border-[#E5E7F0] p-4 text-left hover:border-[#7050F5] hover:bg-[#7050F5]/[0.03] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#7050F5]/10 text-[#7050F5]">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0B1230]">Aarav Mehta — Demo Employee</p>
                <p className="text-xs text-[#64748B]">Senior Product Engineer · Standard ESS Access</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-[#64748B]" />
          </button>

          <button
            type="button"
            onClick={() => signInDemo('emp-0814')}
            className="flex w-full items-center justify-between rounded-xl border border-[#E5E7F0] p-4 text-left hover:border-[#7050F5] hover:bg-[#7050F5]/[0.03] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0B1230]/8 text-[#0B1230]">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0B1230]">Priya Nair — Demo Manager</p>
                <p className="text-xs text-[#64748B]">Engineering Manager · Employee + Scoped Team Access</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-[#64748B]" />
          </button>
        </div>
      </div>
    </div>
  );
}
