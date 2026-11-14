import React, { useState } from 'react';
import {
  Award,
  Bell,
  Briefcase,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Clock,
  FileCheck2,
  FolderLock,
  HelpCircle,
  Landmark,
  LayoutDashboard,
  Receipt,
  User,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../app/AuthContext';
import { usePortalData } from '../app/PortalDataContext';

interface SubNavItem {
  label: string;
  to: string;
}

interface NavGroup {
  id: string;
  label: string;
  basePath: string;
  icon: React.ElementType;
  badgeCount?: number;
  items: SubNavItem[];
}

interface EmployeeSidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function EmployeeSidebar({ mobileOpen, onCloseMobile }: EmployeeSidebarProps) {
  const { isManagerAuthorized } = useAuth();
  const { notifications, teamLeaveRequests, teamRegularisations } = usePortalData();
  const location = useLocation();
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const managerPendingCount =
    teamLeaveRequests.filter((r) => r.status === 'Pending Approval').length +
    teamRegularisations.filter((r) => r.status === 'Pending Approval').length;

  const navGroups: NavGroup[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      basePath: '/dashboard',
      icon: LayoutDashboard,
      items: [{ label: 'My Overview', to: '/dashboard' }],
    },
    {
      id: 'profile',
      label: 'My Profile',
      basePath: '/profile',
      icon: User,
      items: [
        { label: 'Personal Information', to: '/profile?tab=personal' },
        { label: 'Contact Information', to: '/profile?tab=contact' },
        { label: 'Address', to: '/profile?tab=address' },
        { label: 'Emergency Contacts', to: '/profile?tab=emergency' },
        { label: 'Bank Details', to: '/profile?tab=bank' },
        { label: 'Employment Information', to: '/profile?tab=employment' },
        { label: 'Reporting Structure', to: '/profile?tab=reporting' },
      ],
    },
    {
      id: 'attendance',
      label: 'Attendance',
      basePath: '/attendance',
      icon: Clock,
      items: [
        { label: 'Attendance Overview', to: '/attendance?tab=overview' },
        { label: 'Daily Attendance', to: '/attendance?tab=daily' },
        { label: 'Attendance History', to: '/attendance?tab=history' },
        { label: 'Punch In / Punch Out', to: '/attendance?tab=punch' },
        { label: 'Attendance Regularisation', to: '/attendance?tab=regularisation' },
        { label: 'My Shifts', to: '/attendance?tab=shifts' },
        { label: 'Overtime History', to: '/attendance?tab=overtime' },
        { label: 'Holiday Calendar', to: '/attendance?tab=holidays' },
      ],
    },
    {
      id: 'leave',
      label: 'Leave Management',
      basePath: '/leave',
      icon: CalendarDays,
      items: [
        { label: 'Leave Overview', to: '/leave?tab=overview' },
        { label: 'Apply Leave', to: '/leave?tab=apply' },
        { label: 'My Leave Requests', to: '/leave?tab=requests' },
        { label: 'Leave Balance', to: '/leave?tab=balance' },
        { label: 'Leave Calendar', to: '/leave?tab=calendar' },
        { label: 'Compensatory Off', to: '/leave?tab=compoff' },
        { label: 'Leave Encashment', to: '/leave?tab=encashment' },
      ],
    },
    {
      id: 'payroll',
      label: 'My Payroll',
      basePath: '/my-payroll',
      icon: Wallet,
      items: [
        { label: 'Payroll Overview', to: '/my-payroll?tab=overview' },
        { label: 'My Salary Structure', to: '/my-payroll?tab=structure' },
        { label: 'Monthly Payslips', to: '/my-payroll?tab=payslips' },
        { label: 'Annual Salary Summary', to: '/my-payroll?tab=annual' },
        { label: 'Deductions', to: '/my-payroll?tab=deductions' },
        { label: 'Variable Pay', to: '/my-payroll?tab=variable' },
        { label: 'Bonus & Incentives', to: '/my-payroll?tab=bonus' },
        { label: 'Payroll History', to: '/my-payroll?tab=history' },
      ],
    },
    {
      id: 'tax',
      label: 'Tax & Declarations',
      basePath: '/tax',
      icon: FileCheck2,
      items: [
        { label: 'Tax Overview', to: '/tax?tab=overview' },
        { label: 'Tax Regime Selection', to: '/tax?tab=regime' },
        { label: 'Investment Declarations', to: '/tax?tab=declarations' },
        { label: 'Tax Proof Submission', to: '/tax?tab=proofs' },
        { label: 'HRA Declaration', to: '/tax?tab=hra' },
        { label: 'Previous Employer Details', to: '/tax?tab=previous' },
        { label: 'Tax Computation', to: '/tax?tab=computation' },
        { label: 'Form 16', to: '/tax?tab=form16' },
      ],
    },
    {
      id: 'expenses',
      label: 'Expenses & Claims',
      basePath: '/expenses',
      icon: Receipt,
      items: [
        { label: 'My Expenses', to: '/expenses?tab=overview' },
        { label: 'Submit Expense', to: '/expenses?tab=submit' },
        { label: 'Reimbursement Requests', to: '/expenses?tab=requests' },
        { label: 'Approval Status', to: '/expenses?tab=approvals' },
        { label: 'Reimbursement History', to: '/expenses?tab=history' },
      ],
    },
    {
      id: 'loans',
      label: 'Loans & Advances',
      basePath: '/loans',
      icon: Landmark,
      items: [
        { label: 'Apply for Salary Advance', to: '/loans?tab=advance' },
        { label: 'Apply for Employee Loan', to: '/loans?tab=apply' },
        { label: 'My Loan Requests', to: '/loans?tab=requests' },
        { label: 'Repayment Schedule', to: '/loans?tab=schedule' },
        { label: 'Outstanding Balance', to: '/loans?tab=overview' },
      ],
    },
    {
      id: 'documents',
      label: 'My Documents',
      basePath: '/documents',
      icon: FolderLock,
      items: [
        { label: 'Employment Documents', to: '/documents?category=Employment%20Documents' },
        { label: 'Offer Letter', to: '/documents?doc=Offer%20Letter' },
        { label: 'Appointment Letter', to: '/documents?doc=Appointment%20Letter' },
        { label: 'Salary Revision Letters', to: '/documents?doc=Salary%20Revision%20Letter' },
        { label: 'Payslips', to: '/my-payroll?tab=payslips' },
        { label: 'Tax Documents', to: '/documents?category=Tax%20Documents' },
        { label: 'Experience Certificate', to: '/documents?request=Experience%20Certificate' },
        { label: 'Relieving Letter', to: '/documents?request=Relieving%20Letter' },
      ],
    },
    {
      id: 'performance',
      label: 'Performance',
      basePath: '/performance',
      icon: Award,
      items: [
        { label: 'My Goals', to: '/performance?tab=goals' },
        { label: 'My KPIs', to: '/performance?tab=kpis' },
        { label: 'Performance Reviews', to: '/performance?tab=reviews' },
        { label: 'Feedback', to: '/performance?tab=feedback' },
        { label: 'Appraisal History', to: '/performance?tab=history' },
        { label: 'Training & Development', to: '/performance?tab=training' },
      ],
    },
    {
      id: 'support',
      label: 'Help & Support',
      basePath: '/support',
      icon: HelpCircle,
      items: [
        { label: 'Raise HR Request', to: '/support?tab=raise&cat=General%20HR%20Query' },
        { label: 'Payroll Queries', to: '/support?tab=raise&cat=Payroll%20Issue' },
        { label: 'Attendance Queries', to: '/support?tab=raise&cat=Attendance%20Issue' },
        { label: 'Leave Queries', to: '/support?tab=raise&cat=Leave%20Issue' },
        { label: 'IT Support', to: '/support?tab=raise&cat=IT%20Support' },
        { label: 'Grievances', to: '/support?tab=raise&cat=Grievance' },
        { label: 'My Support Tickets', to: '/support?tab=tickets' },
        { label: 'FAQs', to: '/support?tab=faqs' },
      ],
    },
    {
      id: 'notifications',
      label: 'Notifications',
      basePath: '/notifications',
      icon: Bell,
      badgeCount: unreadCount,
      items: [
        { label: 'All Notifications', to: '/notifications?cat=All' },
        { label: 'Payroll Alerts', to: '/notifications?cat=Payroll' },
        { label: 'HR Announcements', to: '/notifications?cat=Company%20Announcements' },
        { label: 'Attendance Alerts', to: '/notifications?cat=Attendance' },
        { label: 'Leave Updates', to: '/notifications?cat=Leave' },
        { label: 'Company Updates', to: '/notifications?cat=General' },
      ],
    },
    ...(isManagerAuthorized
      ? [
          {
            id: 'manager',
            label: 'Team Management',
            basePath: '/manager',
            icon: Users,
            badgeCount: managerPendingCount,
            items: [
              { label: 'Team Dashboard', to: '/manager?tab=dashboard' },
              { label: 'Team Attendance', to: '/manager?tab=attendance' },
              { label: 'Team Leave Approvals', to: '/manager?tab=leave-approvals' },
              { label: 'Team Attendance Approvals', to: '/manager?tab=attendance-approvals' },
              { label: 'Team Overview', to: '/manager?tab=overview' },
              { label: 'Team Performance', to: '/manager?tab=performance' },
            ],
          },
        ]
      : []),
  ];

  const [expandedGroup, setExpandedGroup] = useState<string | null>(() => {
    const found = navGroups.find((g) => location.pathname.startsWith(g.basePath));
    return found?.id ?? 'dashboard';
  });

  const handleGroupClick = (group: NavGroup) => {
    if (group.items.length === 1) {
      navigate(group.items[0].to);
      onCloseMobile();
      return;
    }
    setExpandedGroup((prev) => (prev === group.id ? null : group.id));
    if (!location.pathname.startsWith(group.basePath)) {
      navigate(group.basePath);
    }
  };

  const currentFullPath = `${location.pathname}${location.search}`;

  const renderSidebarBody = () => (
    <div className="flex h-full flex-col bg-white border-r border-[#E5E7F0]">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#E5E7F0] lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#7050F5] text-white font-bold text-sm">
            P
          </div>
          <span className="text-sm font-bold text-[#0B1230]">PayFuse ESS</span>
        </div>
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#F7F7FC]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav aria-label="Employee Portal Navigation" className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navGroups.map((group) => {
          const Icon = group.icon;
          const isRouteActive = location.pathname.startsWith(group.basePath);
          const isOpen = expandedGroup === group.id;

          return (
            <div key={group.id}>
              {group.id === 'manager' && (
                <div className="my-3 border-t border-[#E5E7F0] pt-3 px-2">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#64748B]">
                    <Briefcase className="h-3.5 w-3.5 text-[#7050F5]" />
                    Manager Self-Service
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={() => handleGroupClick(group)}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                  isRouteActive
                    ? 'bg-[#7050F5]/10 text-[#7050F5]'
                    : 'text-[#334155] hover:bg-[#F7F7FC] hover:text-[#0B1230]'
                }`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{group.label}</span>
                </span>
                <span className="flex items-center gap-1.5 shrink-0">
                  {group.badgeCount !== undefined && group.badgeCount > 0 && (
                    <span className="rounded bg-[#7050F5] px-1.5 py-0.5 text-[10px] font-semibold text-white tabular-nums">
                      {group.badgeCount}
                    </span>
                  )}
                  {group.items.length > 1 &&
                    (isOpen ? (
                      <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                    ))}
                </span>
              </button>

              {group.items.length > 1 && isOpen && (
                <div className="mt-1 ml-4 space-y-0.5 border-l border-[#E5E7F0] pl-3">
                  {group.items.map((item) => {
                    const isSubActive = currentFullPath === item.to;
                    return (
                      <NavLink
                        key={item.label}
                        to={item.to}
                        onClick={onCloseMobile}
                        className={`block rounded-md px-2.5 py-1.5 text-xs transition-colors truncate ${
                          isSubActive
                            ? 'font-semibold text-[#7050F5] bg-[#7050F5]/5'
                            : 'text-[#64748B] hover:text-[#0B1230] hover:bg-[#F7F7FC]'
                        }`}
                      >
                        {item.label}
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-[#E5E7F0] p-3 text-[11px] text-[#64748B]">
        <p className="font-medium text-[#0B1230]">PayFuse Employee Portal</p>
        <p className="mt-0.5">Demo workspace · Scoped private access</p>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block lg:w-60 lg:shrink-0">{renderSidebarBody()}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-[#0B1230]/40" onClick={onCloseMobile} aria-hidden="true" />
          <div className="relative z-10 w-72 max-w-[85vw] h-full">{renderSidebarBody()}</div>
        </div>
      )}
    </>
  );
}
