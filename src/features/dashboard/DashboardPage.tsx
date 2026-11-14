import React, { useMemo, useState } from 'react';
import {
  Activity,
  Calendar,
  CalendarPlus,
  Clock,
  Download,
  FileText,
  HelpCircle,
  Receipt,
  UserCog,
  Wallet,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '../../app/AuthContext';
import { usePortalData } from '../../app/PortalDataContext';
import { useToast } from '../../app/ToastContext';
import { ApprovalStatusBadge } from '../../components/ApprovalStatusBadge';
import { AttendanceCalendar } from '../../components/AttendanceCalendar';
import { AttendancePunchCard } from '../../components/AttendancePunchCard';
import { DetailDrawer } from '../../components/DetailDrawer';
import { ProfileCard } from '../../components/ProfileCard';
import { StatCard } from '../../components/StatCard';
import { AttendanceRecord } from '../../types/ess';
import { downloadTextFile, formatCurrency, formatDate } from '../../utils/formatters';

export function DashboardPage() {
  const { currentUser, activeCompany } = useAuth();
  const {
    attendanceRecords,
    leaveBalances,
    leaveRequests,
    payslips,
    expenses,
    regularisations,
    upcomingEvents,
    punchSession,
    punchIn,
  } = usePortalData();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [selectedDay, setSelectedDay] = useState<{ record: AttendanceRecord | null; dateIso: string } | null>(null);

  const novStats = useMemo(() => {
    const novRecords = attendanceRecords.filter((r) => r.date.startsWith('2026-11'));
    const present = novRecords.filter((r) => r.status === 'Present' || r.status === 'Half Day').length +
      (punchSession.state === 'Checked In' || punchSession.state === 'On Break' ? 1 : 0);
    const absent = novRecords.filter((r) => r.status === 'Absent').length;
    const leave = novRecords.filter((r) => r.status === 'Leave').length;
    const workingDaysSoFar = Math.max(1, present + absent + leave + novRecords.filter((r) => r.status === 'Missing Punch').length);
    const pct = Math.round((present / workingDaysSoFar) * 100);
    return { present, absent, leave, pct };
  }, [attendanceRecords, punchSession.state]);

  const totalLeaveAvail = leaveBalances.reduce((sum, b) => sum + b.available, 0);
  const elBal = leaveBalances.find((b) => b.code === 'EL')?.available ?? 0;
  const clBal = leaveBalances.find((b) => b.code === 'CL')?.available ?? 0;
  const slBal = leaveBalances.find((b) => b.code === 'SL')?.available ?? 0;

  const latestPayslip = payslips[0];
  const sixMonthTrend = useMemo(() => {
    return [...payslips]
      .slice(0, 6)
      .reverse()
      .map((p) => ({
        month: p.monthLabel.slice(0, 3),
        netPay: p.netPay,
        gross: p.grossEarnings,
      }));
  }, [payslips]);

  const pendingLeaveCount = leaveRequests.filter((r) => r.status === 'Pending Approval').length;
  const pendingExpenseCount = expenses.filter((e) => e.status === 'Pending Approval').length;
  const pendingRegCount = regularisations.filter((r) => r.status === 'Pending Approval').length;
  const totalPending = pendingLeaveCount + pendingExpenseCount + pendingRegCount;

  const visibleEvents = upcomingEvents.filter(
    (ev) => ev.type !== 'Birthday' || activeCompany.allowBirthdayDisplay
  );

  const handleDownloadLatestPayslip = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!latestPayslip || !currentUser) return;
    const content = [
      `PAYFUSE OFFICIAL PAYSLIP STATEMENT`,
      `Company: ${activeCompany.companyName}`,
      `Period: ${latestPayslip.monthLabel} (${latestPayslip.financialYear})`,
      `Employee: ${currentUser.fullName} (${currentUser.employeeCode})`,
      `Department: ${currentUser.department} · Designation: ${currentUser.designation}`,
      `--------------------------------------------------`,
      `Gross Earnings: ${formatCurrency(latestPayslip.grossEarnings, activeCompany.currencySymbol)}`,
      `Total Deductions: ${formatCurrency(latestPayslip.totalDeductions, activeCompany.currencySymbol)}`,
      `Net Salary Paid: ${formatCurrency(latestPayslip.netPay, activeCompany.currencySymbol)}`,
      `Payment Status: ${latestPayslip.paymentStatus} (${formatDate(latestPayslip.payDate ?? '')})`,
    ].join('\n');
    downloadTextFile(`Payslip_${latestPayslip.monthKey}_${currentUser.employeeCode}.txt`, content);
    showToast('Payslip downloaded', 'success', `${latestPayslip.monthLabel} statement saved.`);
  };

  if (!currentUser) return null;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1230] text-balance">
            Good Morning, {currentUser.firstName}
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Here’s your work and payroll overview for {activeCompany.companyName}.
          </p>
        </div>
        <div className="text-xs text-[#64748B] flex items-center gap-2">
          <span>Active Policy: {activeCompany.sector} ({activeCompany.workModel})</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">14 Nov 2026</span>
        </div>
      </div>

      {/* Employee Profile Summary Strip */}
      <ProfileCard
        employee={currentUser}
        compact
        actionButton={
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="rounded-lg border border-[#E5E7F0] bg-white px-3.5 py-2 text-xs font-medium text-[#0B1230] hover:bg-[#F7F7FC] whitespace-nowrap"
          >
            View Full Profile
          </button>
        }
      />

      {/* A. Five KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Attendance (Nov 2026)"
          value={`${novStats.pct}%`}
          subtitle={`${novStats.present} Present · ${novStats.absent} Absent · ${novStats.leave} Leave`}
          icon={Clock}
          accent="success"
          onClick={() => navigate('/attendance')}
          actionLabel="Details"
        />

        <StatCard
          title="Leave Balance"
          value={`${totalLeaveAvail} Days`}
          subtitle={`EL ${elBal} · CL ${clBal} · SL ${slBal}`}
          icon={Calendar}
          accent="blue"
          onClick={() => navigate('/leave')}
          actionLabel="Apply"
        />

        <StatCard
          title="Next Payday"
          value={`30 Nov 2026`}
          subtitle={`Nov 2026 (Scheduled) · Last Paid: Oct 2026`}
          icon={Wallet}
          accent="purple"
          onClick={() => navigate('/my-payroll')}
          actionLabel="Payroll"
        />

        <div className="rounded-xl border border-[#E5E7F0] bg-white p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-[#64748B]">Latest Payslip</p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-[#0B1230] font-mono-tabular">
                {latestPayslip ? formatCurrency(latestPayslip.netPay, activeCompany.currencySymbol) : '—'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadLatestPayslip}
              aria-label="Download latest payslip"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#7050F5]/10 text-[#7050F5] hover:bg-[#7050F5] hover:text-white transition-colors"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 pt-3 border-t border-[#F1F3F9] flex items-center justify-between text-xs text-[#64748B]">
            <span>{latestPayslip?.monthLabel ?? '—'}</span>
            <button
              type="button"
              onClick={() => navigate('/my-payroll?tab=payslips')}
              className="font-medium text-[#7050F5] hover:underline whitespace-nowrap"
            >
              Open Payslips
            </button>
          </div>
        </div>

        <StatCard
          title="Pending Requests"
          value={`${totalPending}`}
          subtitle={`${pendingLeaveCount} Leave · ${pendingExpenseCount} Expense · ${pendingRegCount} Regularisation`}
          icon={Activity}
          accent="warning"
          onClick={() => navigate('/leave?tab=requests')}
          actionLabel="Track"
        />
      </div>

      {/* B. Attendance Punch Widget + H. Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-7">
          <AttendancePunchCard />
        </div>

        <div className="lg:col-span-5 rounded-xl border border-[#E5E7F0] bg-white p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-[#0B1230]">Quick Actions</h3>
            <p className="mt-0.5 text-xs text-[#64748B]">Common employee self-service workflows</p>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                if (punchSession.state === 'Not Checked In' && !activeCompany.requireGpsForPunch) {
                  punchIn(`${activeCompany.workModel} Quick Punch`);
                  showToast('Checked in successfully', 'success');
                } else {
                  navigate('/attendance?tab=punch');
                }
              }}
              className="flex items-center gap-2.5 rounded-lg border border-[#E5E7F0] bg-[#F7F7FC]/60 px-3 py-2.5 text-left text-xs font-medium text-[#0B1230] hover:border-[#7050F5]/40 hover:bg-white transition-colors"
            >
              <Clock className="h-4 w-4 text-[#7050F5] shrink-0" />
              <span className="truncate">{punchSession.state === 'Not Checked In' ? 'Punch In' : 'Attendance Log'}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/leave?tab=apply')}
              className="flex items-center gap-2.5 rounded-lg border border-[#E5E7F0] bg-[#F7F7FC]/60 px-3 py-2.5 text-left text-xs font-medium text-[#0B1230] hover:border-[#7050F5]/40 hover:bg-white transition-colors"
            >
              <CalendarPlus className="h-4 w-4 text-[#478BFA] shrink-0" />
              <span className="truncate">Apply Leave</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadLatestPayslip}
              className="flex items-center gap-2.5 rounded-lg border border-[#E5E7F0] bg-[#F7F7FC]/60 px-3 py-2.5 text-left text-xs font-medium text-[#0B1230] hover:border-[#7050F5]/40 hover:bg-white transition-colors"
            >
              <FileText className="h-4 w-4 text-[#16A36A] shrink-0" />
              <span className="truncate">Download Payslip</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/expenses?tab=submit')}
              className="flex items-center gap-2.5 rounded-lg border border-[#E5E7F0] bg-[#F7F7FC]/60 px-3 py-2.5 text-left text-xs font-medium text-[#0B1230] hover:border-[#7050F5]/40 hover:bg-white transition-colors"
            >
              <Receipt className="h-4 w-4 text-[#E9A23B] shrink-0" />
              <span className="truncate">Submit Expense</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2.5 rounded-lg border border-[#E5E7F0] bg-[#F7F7FC]/60 px-3 py-2.5 text-left text-xs font-medium text-[#0B1230] hover:border-[#7050F5]/40 hover:bg-white transition-colors"
            >
              <UserCog className="h-4 w-4 text-[#0B1230] shrink-0" />
              <span className="truncate">Update Profile</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/support?tab=raise')}
              className="flex items-center gap-2.5 rounded-lg border border-[#E5E7F0] bg-[#F7F7FC]/60 px-3 py-2.5 text-left text-xs font-medium text-[#0B1230] hover:border-[#7050F5]/40 hover:bg-white transition-colors"
            >
              <HelpCircle className="h-4 w-4 text-[#7050F5] shrink-0" />
              <span className="truncate">Raise HR Request</span>
            </button>
          </div>
        </div>
      </div>

      {/* C. Monthly Attendance Calendar + D. Payroll Summary */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <AttendanceCalendar
            records={attendanceRecords}
            onSelectDate={(rec, dateIso) => setSelectedDay({ record: rec, dateIso })}
          />
        </div>

        <div className="xl:col-span-5 rounded-xl border border-[#E5E7F0] bg-white p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold text-[#0B1230]">Payroll Summary</h3>
                <p className="text-xs text-[#64748B]">
                  Latest finalized cycle: {latestPayslip?.monthLabel}
                </p>
              </div>
              {latestPayslip && <ApprovalStatusBadge status={latestPayslip.paymentStatus} />}
            </div>

            {latestPayslip && (
              <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-[#F7F7FC] p-3.5 text-xs">
                <div>
                  <p className="text-[#64748B]">Gross Salary</p>
                  <p className="mt-0.5 text-sm font-semibold text-[#0B1230] font-mono-tabular">
                    {formatCurrency(latestPayslip.grossEarnings, activeCompany.currencySymbol)}
                  </p>
                </div>
                <div>
                  <p className="text-[#64748B]">Total Deductions</p>
                  <p className="mt-0.5 text-sm font-semibold text-[#E05252] font-mono-tabular">
                    {formatCurrency(latestPayslip.totalDeductions, activeCompany.currencySymbol)}
                  </p>
                </div>
                <div>
                  <p className="text-[#64748B]">Net Salary</p>
                  <p className="mt-0.5 text-sm font-bold text-[#16A36A] font-mono-tabular">
                    {formatCurrency(latestPayslip.netPay, activeCompany.currencySymbol)}
                  </p>
                </div>
                <div>
                  <p className="text-[#64748B]">Employer PF & Gratuity (Info)</p>
                  <p className="mt-0.5 text-sm font-semibold text-[#475569] font-mono-tabular">
                    {formatCurrency(
                      latestPayslip.employerContributions.employerPf +
                        latestPayslip.employerContributions.gratuityProvision,
                      activeCompany.currencySymbol
                    )}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-4">
              <p className="mb-2 text-xs font-medium text-[#64748B]">6-Month Net Salary Trend</p>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sixMonthTrend} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="pfNetGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7050F5" stopOpacity={0.22} />
                        <stop offset="95%" stopColor="#7050F5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7F0" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      axisLine={false}
                      tickLine={false}
                      width={52}
                      tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                    />
                    <Tooltip
                      formatter={(val) => [formatCurrency(Number(val ?? 0), activeCompany.currencySymbol), 'Net Pay']}
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #E5E7F0',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="netPay"
                      stroke="#7050F5"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#pfNetGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#F1F3F9] pt-3">
            <button
              type="button"
              onClick={() => navigate('/my-payroll')}
              className="text-xs font-medium text-[#475569] hover:text-[#0B1230]"
            >
              View Full Salary Breakdown
            </button>
            <button
              type="button"
              onClick={handleDownloadLatestPayslip}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#7050F5] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#5E3FE0] whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5" />
              Download Payslip
            </button>
          </div>
        </div>
      </div>

      {/* E. Leave Summary + F. Upcoming Events + G. Recent Activities */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Leave Summary */}
        <div className="rounded-xl border border-[#E5E7F0] bg-white p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-[#0B1230]">Leave Summary</h3>
              <button
                type="button"
                onClick={() => navigate('/leave?tab=apply')}
                className="rounded-lg bg-[#7050F5] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#5E3FE0] whitespace-nowrap"
              >
                Apply Leave
              </button>
            </div>
            <div className="mt-4 space-y-3.5">
              {leaveBalances.map((b) => {
                const pct = b.entitlement > 0 ? Math.round((b.available / b.entitlement) * 100) : 0;
                return (
                  <div key={b.code}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#0B1230]">{b.name}</span>
                      <span className="text-[#64748B] tabular-nums">
                        <strong className="text-[#0B1230]">{b.available}</strong> avail · {b.used} used · {b.pending} pending
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[#F1F3F9]">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: b.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F1F3F9]">
            <button
              type="button"
              onClick={() => navigate('/leave?tab=calendar')}
              className="text-xs font-medium text-[#7050F5] hover:underline"
            >
              Open Leave & Holiday Calendar
            </button>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="rounded-xl border border-[#E5E7F0] bg-white p-5">
          <h3 className="text-base font-semibold text-[#0B1230]">Upcoming Events</h3>
          <p className="text-xs text-[#64748B]">Holidays, reviews, and company milestones</p>
          <ul className="mt-4 divide-y divide-[#F1F3F9]">
            {visibleEvents.map((ev) => (
              <li key={ev.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#0B1230] truncate">{ev.title}</p>
                  <p className="text-xs text-[#64748B] truncate">{ev.subtitle}</p>
                </div>
                <span className="text-xs font-medium text-[#475569] font-mono-tabular whitespace-nowrap shrink-0">
                  {formatDate(ev.date)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent Activities */}
        <div className="rounded-xl border border-[#E5E7F0] bg-white p-5">
          <h3 className="text-base font-semibold text-[#0B1230]">Recent Activities</h3>
          <p className="text-xs text-[#64748B]">Your latest HR and payroll updates</p>
          <ul className="mt-4 divide-y divide-[#F1F3F9]">
            {[
              { title: 'October 2026 Payslip Published', meta: '30 Oct 2026 · Payroll', to: '/my-payroll' },
              { title: 'Casual Leave Approved (10 Nov)', meta: '03 Nov 2026 · Priya Nair', to: '/leave?tab=requests' },
              { title: 'Travel Reimbursement Paid (₹12,840)', meta: '25 Oct 2026 · IMPS Settlement', to: '/expenses' },
              { title: 'Section 80D Proof Accepted', meta: '16 Oct 2026 · Tax Compliance', to: '/tax?tab=proofs' },
              { title: 'Attendance Regularisation Pending', meta: '06 Nov 2026 · REG-2026-089', to: '/attendance?tab=regularisation' },
            ].map((act) => (
              <li key={act.title} className="py-2.5 first:pt-0 last:pb-0">
                <button
                  type="button"
                  onClick={() => navigate(act.to)}
                  className="w-full text-left group"
                >
                  <p className="text-sm font-medium text-[#0B1230] group-hover:text-[#7050F5] truncate">
                    {act.title}
                  </p>
                  <p className="mt-0.5 text-xs text-[#64748B]">{act.meta}</p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Attendance Date Inspection Drawer */}
      <DetailDrawer
        open={Boolean(selectedDay)}
        onClose={() => setSelectedDay(null)}
        title={selectedDay ? `Attendance — ${formatDate(selectedDay.dateIso)}` : 'Attendance Detail'}
        subtitle={selectedDay?.record?.shiftName ?? activeCompany.shiftName}
        footer={
          selectedDay?.record &&
          (selectedDay.record.status === 'Missing Punch' || selectedDay.record.status === 'Absent') ? (
            <button
              type="button"
              onClick={() => {
                const dt = selectedDay.dateIso;
                setSelectedDay(null);
                navigate(`/attendance?tab=regularisation&date=${dt}`);
              }}
              className="rounded-lg bg-[#7050F5] px-4 py-2 text-xs font-medium text-white hover:bg-[#5E3FE0]"
            >
              Request Regularisation
            </button>
          ) : undefined
        }
      >
        {selectedDay && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between border-b border-[#F1F3F9] pb-3">
              <span className="text-[#64748B]">Day Status</span>
              <ApprovalStatusBadge status={selectedDay.record?.status ?? 'Scheduled / Future'} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#64748B]">Check-In</p>
                <p className="mt-1 font-mono-tabular font-semibold text-[#0B1230]">
                  {selectedDay.record?.checkIn ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#64748B]">Check-Out</p>
                <p className="mt-1 font-mono-tabular font-semibold text-[#0B1230]">
                  {selectedDay.record?.checkOut ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#64748B]">Working Hours</p>
                <p className="mt-1 font-mono-tabular font-semibold text-[#0B1230]">
                  {selectedDay.record?.workingHours ? `${selectedDay.record.workingHours} hrs` : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#64748B]">Break Duration</p>
                <p className="mt-1 font-mono-tabular font-semibold text-[#0B1230]">
                  {selectedDay.record?.breakMinutes ? `${selectedDay.record.breakMinutes} mins` : '—'}
                </p>
              </div>
            </div>
            {selectedDay.record?.locationNote && (
              <div className="rounded-lg bg-[#F7F7FC] p-3 text-xs text-[#475569]">
                Location Mode: <strong className="text-[#0B1230]">{selectedDay.record.locationNote}</strong>
              </div>
            )}
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}
