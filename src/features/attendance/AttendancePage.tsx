import React, { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, Clock, FileCheck, Plus, Timer } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '../../app/AuthContext';
import { usePortalData } from '../../app/PortalDataContext';
import { useToast } from '../../app/ToastContext';
import { ApprovalStatusBadge } from '../../components/ApprovalStatusBadge';
import { AttendanceCalendar } from '../../components/AttendanceCalendar';
import { AttendancePunchCard } from '../../components/AttendancePunchCard';
import { ColumnDef, DataTable } from '../../components/DataTable';
import { DetailDrawer } from '../../components/DetailDrawer';
import { FileUploader } from '../../components/FileUploader';
import { FilterBar } from '../../components/FilterBar';
import { FormModal } from '../../components/FormModal';
import { RequestTimeline } from '../../components/RequestTimeline';
import { StatCard } from '../../components/StatCard';
import { AttendanceRecord, AttendanceRegularisationRequest } from '../../types/ess';
import { formatDate } from '../../utils/formatters';

type AttendanceTab =
  | 'overview'
  | 'daily'
  | 'history'
  | 'punch'
  | 'regularisation'
  | 'shifts'
  | 'overtime'
  | 'holidays';

const regSchema = z.object({
  attendanceDate: z.string().min(1, 'Select an attendance date'),
  originalCheckIn: z.string().min(1, 'Required'),
  originalCheckOut: z.string().min(1, 'Required'),
  requestedCheckIn: z.string().min(1, 'Enter requested check-in'),
  requestedCheckOut: z.string().min(1, 'Enter requested check-out'),
  reason: z.string().min(8, 'Please provide a brief reason (min 8 characters)'),
});

type RegFormValues = z.infer<typeof regSchema>;

export function AttendancePage() {
  const { activeCompany } = useAuth();
  const {
    attendanceRecords,
    regularisations,
    submitRegularisation,
    shiftSchedule,
    holidays,
    createTicket,
  } = usePortalData();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = (searchParams.get('tab') as AttendanceTab) || 'overview';
  const [activeTab, setActiveTab] = useState<AttendanceTab>(tabParam);

  useEffect(() => {
    setActiveTab(tabParam);
  }, [tabParam]);

  const changeTab = (t: AttendanceTab) => {
    setActiveTab(t);
    setSearchParams({ tab: t });
  };

  // Filters for Attendance History
  const [monthFilter, setMonthFilter] = useState('2026-11');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchText, setSearchText] = useState('');

  // Regularisation drawer & shift change modal
  const [selectedReg, setSelectedReg] = useState<AttendanceRegularisationRequest | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | undefined>();
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [shiftChangeReason, setShiftChangeReason] = useState('');

  const prefillDate = searchParams.get('date') || '2026-11-05';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegFormValues>({
    resolver: zodResolver(regSchema),
    defaultValues: {
      attendanceDate: prefillDate,
      originalCheckIn: '09:34',
      originalCheckOut: 'Missing',
      requestedCheckIn: '09:34',
      requestedCheckOut: '18:35',
      reason: '',
    },
  });

  const overviewMetrics = useMemo(() => {
    const nov = attendanceRecords.filter((r) => r.date.startsWith('2026-11'));
    return {
      present: nov.filter((r) => r.status === 'Present' || r.status === 'Half Day').length,
      absent: nov.filter((r) => r.status === 'Absent').length,
      leave: nov.filter((r) => r.status === 'Leave').length,
      late: nov.filter((r) => r.isLate).length,
      overtime: nov.reduce((acc, r) => acc + r.overtimeHours, 0).toFixed(1),
      missing: nov.filter((r) => r.status === 'Missing Punch').length,
    };
  }, [attendanceRecords]);

  const filteredHistory = useMemo(() => {
    return attendanceRecords.filter((r) => {
      if (monthFilter !== 'All' && !r.date.startsWith(monthFilter)) return false;
      if (statusFilter !== 'All' && r.status !== statusFilter) return false;
      if (searchText && !r.date.includes(searchText) && !r.status.toLowerCase().includes(searchText.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [attendanceRecords, monthFilter, statusFilter, searchText]);

  const overtimeRows = useMemo(
    () => attendanceRecords.filter((r) => r.overtimeHours > 0),
    [attendanceRecords]
  );

  const historyColumns: ColumnDef<AttendanceRecord>[] = [
    {
      key: 'date',
      header: 'Date',
      sortValue: (r) => r.date,
      render: (r) => <span className="font-medium font-mono-tabular">{formatDate(r.date)}</span>,
    },
    {
      key: 'shift',
      header: 'Shift',
      render: (r) => <span className="text-xs text-[#475569]">{r.shiftName}</span>,
    },
    {
      key: 'checkIn',
      header: 'Check In',
      render: (r) => <span className="font-mono-tabular text-xs">{r.checkIn ?? '—'}</span>,
    },
    {
      key: 'checkOut',
      header: 'Check Out',
      render: (r) => <span className="font-mono-tabular text-xs">{r.checkOut ?? '—'}</span>,
    },
    {
      key: 'workingHours',
      header: 'Working Hours',
      align: 'right',
      sortValue: (r) => r.workingHours,
      render: (r) => (
        <span className="font-mono-tabular text-xs font-medium">
          {r.workingHours > 0 ? `${r.workingHours.toFixed(2)}h` : '—'}
        </span>
      ),
    },
    {
      key: 'breakMinutes',
      header: 'Break Duration',
      align: 'right',
      render: (r) => (
        <span className="font-mono-tabular text-xs text-[#64748B]">
          {r.breakMinutes > 0 ? `${r.breakMinutes}m` : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <ApprovalStatusBadge status={r.status} />,
    },
  ];

  const onSubmitRegularisation = (values: RegFormValues) => {
    submitRegularisation({
      ...values,
      attachmentName,
    });
    showToast('Regularisation request submitted', 'success', 'Sent to your Reporting Manager for review.');
    reset();
    setAttachmentName(undefined);
  };

  const handleShiftChangeRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftChangeReason.trim()) return;
    const t = createTicket({
      category: 'Attendance Issue',
      subject: 'Shift / Roster Change Request',
      description: shiftChangeReason.trim(),
      priority: 'Medium',
    });
    setShiftModalOpen(false);
    setShiftChangeReason('');
    showToast('Shift change request submitted', 'success', `Tracked under ticket ${t.id}`);
  };

  const tabs: { id: AttendanceTab; label: string }[] = [
    { id: 'overview', label: 'Attendance Overview' },
    { id: 'punch', label: 'Punch In / Punch Out' },
    { id: 'daily', label: 'Daily Attendance' },
    { id: 'history', label: 'Attendance History' },
    { id: 'regularisation', label: 'Attendance Regularisation' },
    { id: 'shifts', label: 'My Shifts' },
    { id: 'overtime', label: 'Overtime History' },
    { id: 'holidays', label: 'Holiday Calendar' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1230]">Attendance</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Track daily punches, work hours, regularisations, shifts, and company holidays.
          </p>
        </div>
        <button
          type="button"
          onClick={() => changeTab('regularisation')}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#7050F5] px-4 py-2 text-xs font-medium text-white hover:bg-[#5E3FE0] whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          Regularise Attendance
        </button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-1.5 border-b border-[#E5E7F0] pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => changeTab(t.id)}
            className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeTab === t.id
                ? 'bg-[#7050F5] text-white'
                : 'bg-white text-[#475569] border border-[#E5E7F0] hover:text-[#0B1230]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            <StatCard title="Present Days" value={`${overviewMetrics.present}`} subtitle="Nov 2026" accent="success" />
            <StatCard title="Absent Days" value={`${overviewMetrics.absent}`} subtitle="Nov 2026" accent="navy" />
            <StatCard title="Leave Days" value={`${overviewMetrics.leave}`} subtitle="Nov 2026" accent="blue" />
            <StatCard title="Late Arrivals" value={`${overviewMetrics.late}`} subtitle="Nov 2026" accent="warning" />
            <StatCard title="Overtime Hours" value={`${overviewMetrics.overtime}h`} subtitle="Nov 2026" accent="purple" />
            <StatCard title="Missing Punches" value={`${overviewMetrics.missing}`} subtitle="Action needed" accent="warning" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <AttendancePunchCard />
            </div>
            <div className="lg:col-span-7">
              <AttendanceCalendar records={attendanceRecords} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'punch' && (
        <div className="max-w-2xl space-y-4">
          <AttendancePunchCard />
        </div>
      )}

      {activeTab === 'daily' && (
        <div className="space-y-4">
          <AttendancePunchCard compact />
          <DataTable
            data={attendanceRecords.slice(0, 14)}
            columns={historyColumns}
            keyExtractor={(r) => r.id}
            pageSize={10}
          />
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          <FilterBar
            searchValue={searchText}
            onSearchChange={setSearchText}
            searchPlaceholder="Search date or status..."
            selects={[
              {
                id: 'att-month',
                label: 'Month',
                value: monthFilter,
                onChange: setMonthFilter,
                options: [
                  { label: 'All Months (6M)', value: 'All' },
                  { label: 'November 2026', value: '2026-11' },
                  { label: 'October 2026', value: '2026-10' },
                  { label: 'September 2026', value: '2026-09' },
                  { label: 'August 2026', value: '2026-08' },
                  { label: 'July 2026', value: '2026-07' },
                  { label: 'June 2026', value: '2026-06' },
                ],
              },
              {
                id: 'att-status',
                label: 'Status',
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { label: 'All Statuses', value: 'All' },
                  { label: 'Present', value: 'Present' },
                  { label: 'Absent', value: 'Absent' },
                  { label: 'Leave', value: 'Leave' },
                  { label: 'Holiday', value: 'Holiday' },
                  { label: 'Weekly Off', value: 'Weekly Off' },
                  { label: 'Half Day', value: 'Half Day' },
                  { label: 'Missing Punch', value: 'Missing Punch' },
                ],
              },
            ]}
          />
          <DataTable
            data={filteredHistory}
            columns={historyColumns}
            keyExtractor={(r) => r.id}
            pageSize={10}
          />
        </div>
      )}

      {activeTab === 'regularisation' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <form
            onSubmit={handleSubmit(onSubmitRegularisation)}
            className="lg:col-span-5 rounded-xl border border-[#E5E7F0] bg-white p-5 space-y-4"
          >
            <div>
              <h2 className="text-base font-semibold text-[#0B1230]">Submit Regularisation</h2>
              <p className="text-xs text-[#64748B]">Correct missed or inaccurate punches with supporting evidence</p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#475569]">Attendance Date</label>
              <input
                type="date"
                {...register('attendanceDate')}
                className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm"
              />
              {errors.attendanceDate && (
                <p className="mt-1 text-xs text-[#E05252]">{errors.attendanceDate.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#475569]">Original Check-In</label>
                <input
                  {...register('originalCheckIn')}
                  className="w-full rounded-lg border border-[#E5E7F0] bg-[#F7F7FC] px-3 py-2 text-sm font-mono-tabular"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#475569]">Original Check-Out</label>
                <input
                  {...register('originalCheckOut')}
                  className="w-full rounded-lg border border-[#E5E7F0] bg-[#F7F7FC] px-3 py-2 text-sm font-mono-tabular"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#475569]">Requested Check-In</label>
                <input
                  type="time"
                  {...register('requestedCheckIn')}
                  className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm font-mono-tabular"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#475569]">Requested Check-Out</label>
                <input
                  type="time"
                  {...register('requestedCheckOut')}
                  className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm font-mono-tabular"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#475569]">Reason *</label>
              <textarea
                rows={3}
                {...register('reason')}
                placeholder="Explain why the punch correction is needed..."
                className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm"
              />
              {errors.reason && <p className="mt-1 text-xs text-[#E05252]">{errors.reason.message}</p>}
            </div>

            <FileUploader
              label="Supporting Attachment (Optional)"
              fileName={attachmentName}
              onFileSelect={setAttachmentName}
            />

            <button
              type="submit"
              className="w-full rounded-lg bg-[#7050F5] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#5E3FE0]"
            >
              Submit Regularisation Request
            </button>
          </form>

          <div className="lg:col-span-7 space-y-3">
            <h2 className="text-base font-semibold text-[#0B1230]">Regularisation Requests</h2>
            {regularisations.map((req) => (
              <div
                key={req.id}
                className="rounded-xl border border-[#E5E7F0] bg-white p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
                    <span className="font-mono-tabular font-semibold text-[#0B1230]">{req.id}</span>
                    <span aria-hidden="true">·</span>
                    <span>{formatDate(req.attendanceDate)}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-[#0B1230]">
                    Requested: {req.requestedCheckIn} – {req.requestedCheckOut}
                  </p>
                  <p className="mt-0.5 text-xs text-[#64748B] truncate">{req.reason}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <ApprovalStatusBadge status={req.status} />
                  <button
                    type="button"
                    onClick={() => setSelectedReg(req)}
                    className="rounded-lg border border-[#E5E7F0] px-3 py-1.5 text-xs font-medium text-[#0B1230] hover:bg-[#F7F7FC] whitespace-nowrap"
                  >
                    Approval History
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'shifts' && (
        <div className="space-y-5">
          <div className="rounded-xl border border-[#E5E7F0] bg-white p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#0B1230]">Assigned Shift Policy</h2>
              <p className="mt-1 text-sm text-[#475569]">
                {activeCompany.shiftName} · {activeCompany.shiftStart} to {activeCompany.shiftEnd} · Weekly Off:{' '}
                {activeCompany.weeklyOffDays.join(', ')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShiftModalOpen(true)}
              className="rounded-lg border border-[#E5E7F0] bg-white px-4 py-2 text-xs font-medium text-[#0B1230] hover:bg-[#F7F7FC] whitespace-nowrap self-start sm:self-auto"
            >
              Request Shift Change
            </button>
          </div>

          <DataTable
            data={shiftSchedule}
            keyExtractor={(s) => s.id}
            columns={[
              { key: 'date', header: 'Date', render: (s) => <span className="font-mono-tabular">{formatDate(s.date)}</span> },
              { key: 'day', header: 'Day', render: (s) => s.dayName },
              { key: 'shift', header: 'Shift Name', render: (s) => s.shiftName },
              { key: 'time', header: 'Timings', render: (s) => <span className="font-mono-tabular">{s.isWeeklyOff ? '—' : `${s.startTime} – ${s.endTime}`}</span> },
              { key: 'break', header: 'Break', render: (s) => s.breakDuration },
              { key: 'mode', header: 'Location / Mode', render: (s) => s.workMode },
            ]}
          />
        </div>
      )}

      {activeTab === 'overtime' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-[#E5E7F0] bg-white p-5 flex items-center gap-3">
            <Timer className="h-5 w-5 text-[#7050F5]" />
            <div>
              <h2 className="text-base font-semibold text-[#0B1230]">Overtime History</h2>
              <p className="text-xs text-[#64748B]">
                Hours worked beyond standard shift schedule across the past 6 months
              </p>
            </div>
          </div>
          <DataTable
            data={overtimeRows}
            keyExtractor={(r) => r.id}
            columns={[
              { key: 'date', header: 'Date', render: (r) => <span className="font-mono-tabular">{formatDate(r.date)}</span> },
              { key: 'shift', header: 'Shift', render: (r) => r.shiftName },
              { key: 'in', header: 'Check In', render: (r) => <span className="font-mono-tabular">{r.checkIn}</span> },
              { key: 'out', header: 'Check Out', render: (r) => <span className="font-mono-tabular">{r.checkOut}</span> },
              {
                key: 'ot',
                header: 'Overtime Hours',
                align: 'right',
                render: (r) => <span className="font-mono-tabular font-semibold text-[#7050F5]">{r.overtimeHours.toFixed(2)}h</span>,
              },
            ]}
          />
        </div>
      )}

      {activeTab === 'holidays' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-[#E5E7F0] bg-white p-5 flex items-center gap-3">
            <Calendar className="h-5 w-5 text-[#7050F5]" />
            <div>
              <h2 className="text-base font-semibold text-[#0B1230]">Company Holiday Calendar</h2>
              <p className="text-xs text-[#64748B]">Configured public and company holidays for {activeCompany.companyName}</p>
            </div>
          </div>
          <DataTable
            data={holidays}
            keyExtractor={(h) => h.id}
            columns={[
              { key: 'date', header: 'Date', render: (h) => <span className="font-mono-tabular font-medium">{formatDate(h.date)}</span> },
              { key: 'name', header: 'Holiday', render: (h) => <span className="font-semibold">{h.name}</span> },
              { key: 'type', header: 'Category', render: (h) => h.type },
              { key: 'loc', header: 'Applicable Locations', render: (h) => h.location },
            ]}
          />
        </div>
      )}

      {/* Regularisation Approval History Drawer */}
      <DetailDrawer
        open={Boolean(selectedReg)}
        onClose={() => setSelectedReg(null)}
        title={selectedReg ? `Regularisation ${selectedReg.id}` : ''}
        subtitle={selectedReg ? `Attendance Date: ${formatDate(selectedReg.attendanceDate)}` : ''}
      >
        {selectedReg && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#64748B]">Current Status</span>
              <ApprovalStatusBadge status={selectedReg.status} />
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-lg bg-[#F7F7FC] p-3.5 text-xs">
              <div>
                <p className="text-[#64748B]">Original</p>
                <p className="mt-0.5 font-mono-tabular font-medium text-[#0B1230]">
                  {selectedReg.originalCheckIn} – {selectedReg.originalCheckOut}
                </p>
              </div>
              <div>
                <p className="text-[#64748B]">Requested</p>
                <p className="mt-0.5 font-mono-tabular font-semibold text-[#7050F5]">
                  {selectedReg.requestedCheckIn} – {selectedReg.requestedCheckOut}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-[#64748B]">Reason</p>
              <p className="mt-1 text-sm text-[#0B1230]">{selectedReg.reason}</p>
            </div>
            {selectedReg.attachmentName && (
              <div className="flex items-center gap-2 rounded-lg border border-[#E5E7F0] p-3 text-xs">
                <FileCheck className="h-4 w-4 text-[#16A36A]" />
                <span>{selectedReg.attachmentName}</span>
              </div>
            )}
            <div className="border-t border-[#F1F3F9] pt-4">
              <h4 className="mb-3 text-xs font-semibold text-[#0B1230]">Approval Timeline</h4>
              <RequestTimeline events={selectedReg.timeline} />
            </div>
          </div>
        )}
      </DetailDrawer>

      {/* Shift Change Request Modal */}
      <FormModal
        open={shiftModalOpen}
        onClose={() => setShiftModalOpen(false)}
        title="Request Shift Change"
        subtitle="Shift changes require Reporting Manager and Workforce Operations approval"
      >
        <form onSubmit={handleShiftChangeRequest} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#475569]">
              Requested Shift & Reason *
            </label>
            <textarea
              required
              rows={4}
              value={shiftChangeReason}
              onChange={(e) => setShiftChangeReason(e.target.value)}
              placeholder="Specify target shift, effective dates, and reason..."
              className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShiftModalOpen(false)}
              className="rounded-lg border border-[#E5E7F0] px-4 py-2 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#7050F5] px-4 py-2 text-xs font-medium text-white hover:bg-[#5E3FE0]"
            >
              Submit Request
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
