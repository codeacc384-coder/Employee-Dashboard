import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  Building2,
  ChevronDown,
  HelpCircle,
  History,
  KeyRound,
  LogOut,
  Menu,
  Search,
  Shield,
  User,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../app/AuthContext';
import { usePortalData } from '../app/PortalDataContext';
import { useToast } from '../app/ToastContext';
import { SafeAvatar } from './SafeAvatar';

interface EmployeeTopbarProps {
  onOpenMobileMenu: () => void;
}

export function EmployeeTopbar({ onOpenMobileMenu }: EmployeeTopbarProps) {
  const {
    currentUser,
    activeCompany,
    authorizedCompanies,
    switchCompany,
    switchDemoAccount,
    signOut,
  } = useAuth();
  const { notifications, payslips, documents, leaveRequests, tickets } = usePortalData();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [companyMenuOpen, setCompanyMenuOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const companyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileMenuOpen(false);
      if (companyRef.current && !companyRef.current.contains(e.target as Node)) setCompanyMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const items: { label: string; category: string; to: string }[] = [
      { label: 'My Overview Dashboard', category: 'Page', to: '/dashboard' },
      { label: 'Punch In / Punch Out', category: 'Attendance', to: '/attendance?tab=punch' },
      { label: 'Attendance Regularisation', category: 'Attendance', to: '/attendance?tab=regularisation' },
      { label: 'Apply Leave', category: 'Leave', to: '/leave?tab=apply' },
      { label: 'My Salary Structure', category: 'Payroll', to: '/my-payroll?tab=structure' },
      { label: 'Tax Declarations & Regime', category: 'Tax', to: '/tax?tab=declarations' },
      { label: 'Form 16 Certificates', category: 'Tax', to: '/tax?tab=form16' },
      { label: 'Submit Expense Claim', category: 'Expenses', to: '/expenses?tab=submit' },
      { label: 'Apply for Loan / Salary Advance', category: 'Loans', to: '/loans?tab=apply' },
      { label: 'My Goals & KPIs', category: 'Performance', to: '/performance?tab=goals' },
      { label: 'Raise HR Support Ticket', category: 'Support', to: '/support?tab=raise' },
      ...payslips.slice(0, 6).map((p) => ({
        label: `Payslip — ${p.monthLabel}`,
        category: 'Payslip',
        to: '/my-payroll?tab=payslips',
      })),
      ...documents.map((d) => ({
        label: d.name,
        category: 'Document',
        to: '/documents',
      })),
      ...leaveRequests.map((l) => ({
        label: `${l.id} · ${l.leaveTypeName} (${l.startDate})`,
        category: 'Leave Request',
        to: '/leave?tab=requests',
      })),
      ...tickets.map((t) => ({
        label: `${t.id} · ${t.subject}`,
        category: 'Support Ticket',
        to: '/support?tab=tickets',
      })),
    ];
    return items.filter(
      (i) => i.label.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [searchQuery, payslips, documents, leaveRequests, tickets]);

  if (!currentUser) return null;

  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center justify-between gap-4 border-b border-[#E5E7F0] bg-white px-4 lg:px-6 no-print">
      {/* Left: Brand & Company Switcher */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="rounded-lg p-2 text-[#475569] hover:bg-[#F7F7FC] lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            aria-hidden="true"
            className="shrink-0"
          >
            <rect width="28" height="28" rx="8" fill="#0B1230" />
            <path d="M8 9.5H15.5C17.9853 9.5 20 11.5147 20 14C20 16.4853 17.9853 18.5 15.5 18.5H11.5V22H8V9.5Z" fill="#7050F5" />
            <path d="M11.5 12.5V15.5H15.2C16.0284 15.5 16.7 14.8284 16.7 14C16.7 13.1716 16.0284 12.5 15.2 12.5H11.5Z" fill="#FFFFFF" />
          </svg>
          <div className="hidden sm:block">
            <span className="text-sm font-bold tracking-tight text-[#0B1230]">PayFuse</span>
            <span className="mx-1.5 text-[#CBD5E1]" aria-hidden="true">|</span>
            <span className="text-xs font-medium text-[#64748B]">Employee Portal</span>
          </div>
        </button>

        {authorizedCompanies.length > 1 ? (
          <div ref={companyRef} className="relative hidden md:block">
            <button
              type="button"
              onClick={() => setCompanyMenuOpen((o) => !o)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7F0] bg-[#F7F7FC] px-2.5 py-1.5 text-xs font-medium text-[#0B1230] hover:border-[#7050F5]/40 max-w-[230px]"
            >
              <Building2 className="h-3.5 w-3.5 shrink-0 text-[#7050F5]" />
              <span className="truncate">{activeCompany.companyName}</span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#64748B]" />
            </button>
            {companyMenuOpen && (
              <div className="absolute left-0 mt-1.5 w-72 rounded-xl border border-[#E5E7F0] bg-white p-1.5 shadow-xl">
                <p className="px-2.5 py-1.5 text-[11px] font-medium text-[#64748B]">
                  Authorized Company Entities
                </p>
                {authorizedCompanies.map((comp) => (
                  <button
                    key={comp.companyId}
                    type="button"
                    onClick={() => {
                      switchCompany(comp.companyId);
                      setCompanyMenuOpen(false);
                      showToast('Company context switched', 'info', `${comp.companyName} (${comp.sector} Policy)`);
                    }}
                    className={`flex w-full flex-col rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                      comp.companyId === activeCompany.companyId
                        ? 'bg-[#7050F5]/10 text-[#7050F5]'
                        : 'text-[#0B1230] hover:bg-[#F7F7FC]'
                    }`}
                  >
                    <span className="font-semibold truncate">{comp.companyName}</span>
                    <span className="text-[11px] text-[#64748B]">
                      {comp.sector} · {comp.workModel} · {comp.requireGpsForPunch ? 'GPS Geofence' : 'Standard Punch'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <span className="hidden md:inline-block truncate text-xs text-[#64748B] max-w-[200px]">
            {activeCompany.companyName}
          </span>
        )}
      </div>

      {/* Center: Global Employee Search */}
      <div ref={searchRef} className="relative flex-1 max-w-md hidden sm:block">
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-3 h-4 w-4 text-[#64748B]" />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setSearchOpen(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
            }}
            placeholder="Search payslips, leave, tax, documents, help..."
            aria-label="Global employee search"
            className="w-full rounded-lg border border-[#E5E7F0] bg-[#F7F7FC] py-1.5 pl-9 pr-3 text-sm text-[#0B1230] placeholder:text-[#94A3B8] focus:border-[#7050F5] focus:bg-white focus:outline-none"
          />
        </div>
        {searchOpen && searchQuery.trim() && (
          <div className="absolute left-0 right-0 mt-1.5 rounded-xl border border-[#E5E7F0] bg-white p-1.5 shadow-xl">
            {searchResults.length > 0 ? (
              searchResults.map((res, idx) => (
                <button
                  key={`${res.to}-${idx}`}
                  type="button"
                  onClick={() => {
                    navigate(res.to);
                    setSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-xs hover:bg-[#F7F7FC]"
                >
                  <span className="font-medium text-[#0B1230] truncate">{res.label}</span>
                  <span className="text-[11px] text-[#64748B] shrink-0">{res.category}</span>
                </button>
              ))
            ) : (
              <p className="px-3 py-3 text-xs text-[#64748B]">No matching records found.</p>
            )}
          </div>
        )}
      </div>

      {/* Right: Notifications, Help, Profile */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => navigate('/notifications')}
          aria-label="Notifications"
          className="relative rounded-lg p-2 text-[#475569] hover:bg-[#F7F7FC] hover:text-[#0B1230]"
        >
          <Bell className="h-4.5 w-4.5" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#7050F5] px-1 text-[10px] font-bold text-white tabular-nums">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => navigate('/support')}
          aria-label="Help and Support"
          className="hidden sm:inline-flex rounded-lg p-2 text-[#475569] hover:bg-[#F7F7FC] hover:text-[#0B1230]"
        >
          <HelpCircle className="h-4.5 w-4.5" />
        </button>

        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => setProfileMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg border border-transparent p-1 pr-2 hover:border-[#E5E7F0] hover:bg-[#F7F7FC]"
          >
            <SafeAvatar src={currentUser.avatarUrl} name={currentUser.fullName} size="sm" />
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-[#0B1230] leading-tight whitespace-nowrap">
                {currentUser.fullName}
              </p>
              <p className="text-[11px] text-[#64748B] leading-tight whitespace-nowrap">
                {currentUser.hasManagerRole ? 'Reporting Manager' : currentUser.employeeCode}
              </p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-[#64748B]" />
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-64 rounded-xl border border-[#E5E7F0] bg-white p-1.5 shadow-xl">
              <div className="border-b border-[#F1F3F9] px-3 py-2">
                <p className="text-xs font-semibold text-[#0B1230]">{currentUser.fullName}</p>
                <p className="text-[11px] text-[#64748B] truncate">{currentUser.email}</p>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    navigate('/profile?tab=personal');
                    setProfileMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-[#0B1230] hover:bg-[#F7F7FC]"
                >
                  <User className="h-3.5 w-3.5 text-[#64748B]" />
                  My Profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/profile?tab=employment');
                    setProfileMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-[#0B1230] hover:bg-[#F7F7FC]"
                >
                  <Building2 className="h-3.5 w-3.5 text-[#64748B]" />
                  My Employment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/security?tab=settings');
                    setProfileMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-[#0B1230] hover:bg-[#F7F7FC]"
                >
                  <Shield className="h-3.5 w-3.5 text-[#64748B]" />
                  Security Settings
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/security?tab=history');
                    setProfileMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-[#0B1230] hover:bg-[#F7F7FC]"
                >
                  <History className="h-3.5 w-3.5 text-[#64748B]" />
                  Login History
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/security?tab=password');
                    setProfileMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-[#0B1230] hover:bg-[#F7F7FC]"
                >
                  <KeyRound className="h-3.5 w-3.5 text-[#64748B]" />
                  Change Password
                </button>
              </div>

              <div className="border-t border-[#F1F3F9] py-1">
                <p className="px-3 py-1 text-[10px] font-semibold text-[#64748B]">
                  Switch Demo Persona
                </p>
                <button
                  type="button"
                  onClick={() => {
                    switchDemoAccount('emp-1042');
                    setProfileMenuOpen(false);
                    navigate('/dashboard');
                    showToast('Signed in as Aarav Mehta', 'info', 'Standard Employee Self-Service view');
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs ${
                    currentUser.id === 'emp-1042'
                      ? 'bg-[#7050F5]/10 font-semibold text-[#7050F5]'
                      : 'text-[#0B1230] hover:bg-[#F7F7FC]'
                  }`}
                >
                  <span>Aarav Mehta (Employee)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    switchDemoAccount('emp-0814');
                    setProfileMenuOpen(false);
                    navigate('/dashboard');
                    showToast('Signed in as Priya Nair', 'info', 'Authorized Reporting Manager view enabled');
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs ${
                    currentUser.id === 'emp-0814'
                      ? 'bg-[#7050F5]/10 font-semibold text-[#7050F5]'
                      : 'text-[#0B1230] hover:bg-[#F7F7FC]'
                  }`}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-3 w-3" />
                    Priya Nair (Manager)
                  </span>
                </button>
              </div>

              <div className="border-t border-[#F1F3F9] pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    signOut();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-[#E05252] hover:bg-[#E05252]/8"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
