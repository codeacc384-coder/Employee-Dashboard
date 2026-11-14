import React, { useEffect, useMemo, useState } from 'react';
import { CalendarPlus, Download, Eye, XCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext';
import { usePortalData } from '../../app/PortalDataContext';
import { useToast } from '../../app/ToastContext';
import { ApprovalStatusBadge } from '../../components/ApprovalStatusBadge';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';
import { ColumnDef, DataTable } from '../../components/DataTable';
import { DetailDrawer } from '../../components/DetailDrawer';
import { FileUploader } from '../../components/FileUploader';
import { FilterBar } from '../../components/FilterBar';
import { LeaveBalanceCard } from '../../components/LeaveBalanceCard';
import { LeaveCalendar } from '../../components/LeaveCalendar';
import { RequestTimeline } from '../../components/RequestTimeline';
import { LeaveRequest, LeaveTypeCode } from '../../types/ess';
import { calculateDaysBetween, downloadTextFile, formatCurrency, formatDate } from '../../utils/formatters';

type LeaveTab = 'overview' | 'apply' | 'requests' | 'balance' | 'calendar' | 'compoff' | 'encashment';

export function LeavePage() {
  const { activeCompany } = useAuth();
  const {
    leaveBalances,
    leaveRequests,
    submitLeaveRequest,
    cancelLeaveRequest,
    holidays,
    compOffs,
    requestCompOff,
    encashmentRequests,
    requestLeaveEncashment,
  } = usePortalData();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = (searchParams.get('tab') as LeaveTab) || 'overview';
  const [activeTab, setActiveTab] = useState<LeaveTab>(tabParam);

  useEffect(() => {
    setActiveTab(tabParam);
  }, [tabParam]);

  const changeTab = (t: LeaveTab) => {
    setActiveTab(t);
    setSearchParams({ tab: t });
  };

  // Apply leave form
  const [leaveType, setLeaveType] = useState<LeaveTypeCode>('EL');
  const [startDate, setStartDate] = useState('2026-11-26');
  const [endDate, setEndDate] = useState('2026-11-27');
  const [durationType, setDurationType] = useState<'Full Day' | 'First Half' | 'Second Half'>('Full Day');
  const [reason, setReason] = useState('');
  const [contact, setContact] = useState('+91 98450 32814');
  const [attachment, setAttachment] = useState<string | undefined>();

  // History filters & drawers
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [cancelTarget, setCancelTarget] = useState<LeaveRequest | null>(null);

  // Comp off & encashment forms
  const [coDate, setCoDate] = useState('2026-11-08');
  const [coHours, setCoHours] = useState('8');
  const [coReason, setCoReason] = useState('');
  const [encashDays, setEncashDays] = useState('2');

  const holidayDates = useMemo(() => holidays.map((h) => h.date), [holidays]);
  const selectedBalance = leaveBalances.find((b) => b.code === leaveType);
  const requestedDays = useMemo(
    () => calculateDaysBetween(startDate, endDate, durationType, holidayDates),
    [startDate, endDate, durationType, holidayDates]
  );
  const remainingAfter = Math.max(0, (selectedBalance?.available ?? 0) - requestedDays);

  const handleLeaveSubmit = (asDraft: boolean) => {
    if (requestedDays <= 0) {
      showToast('Select valid dates (excluding weekends/holidays)', 'error');
      return;
    }
    if (!asDraft && requestedDays > (selectedBalance?.available ?? 0)) {
      showToast('Insufficient leave balance for selected type', 'error');
      return;
    }
    if (!asDraft && reason.trim().length < 5) {
      showToast('Please provide a reason for your leave request', 'error');
      return;
    }

    submitLeaveRequest({
      leaveTypeCode: leaveType,
      leaveTypeName: selectedBalance?.name ?? 'Earned Leave',
      startDate,
      endDate,
      durationType,
      days: requestedDays,
      reason: reason.trim() || 'Draft leave request',
      contactDuringLeave: contact.trim(),
      attachmentName: attachment,
      status: asDraft ? 'Draft' : 'Pending Approval',
    });

    showToast(
      asDraft ? 'Leave request saved as draft' : 'Leave request submitted',
      'success',
      `${requestedDays} day(s) of ${selectedBalance?.name}`
    );
    setReason('');
    setAttachment(undefined);
    changeTab('requests');
  };

  const filteredRequests = useMemo(() => {
    return leaveRequests.filter((r) => {
      if (statusFilter !== 'All' && r.status !== statusFilter) return false;
      if (
        searchQuery &&
        !r.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !r.leaveTypeName.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [leaveRequests, statusFilter, searchQuery]);

  const handleDownloadLeaveDetails = (req: LeaveRequest) => {
    const content = [
      `PAYFUSE LEAVE REQUEST RECORD`,
      `Request ID: ${req.id}`,
      `Employee: ${req.employeeName}`,
      `Leave Type: ${req.leaveTypeName}`,
      `Dates: ${formatDate(req.startDate)} to ${formatDate(req.endDate)} (${req.days} day(s), ${req.durationType})`,
      `Approver: ${req.approverName}`,
      `Status: ${req.status}`,
      `Reason: ${req.reason}`,
    ].join('\n');
    downloadTextFile(`${req.id}_Leave_Details.txt`, content);
    showToast('Leave summary downloaded', 'success');
  };

  const columns: ColumnDef<LeaveRequest>[] = [
    { key: 'id', header: 'Request ID', render: (r) => <span className="font-mono-tabular text-xs font-semibold">{r.id}</span> },
    { key: 'type', header: 'Leave Type', render: (r) => r.leaveTypeName },
    { key: 'start', header: 'Start Date', sortValue: (r) => r.startDate, render: (r) => <span className="font-mono-tabular text-xs">{formatDate(r.startDate)}</span> },
    { key: 'end', header: 'End Date', render: (r) => <span className="font-mono-tabular text-xs">{formatDate(r.endDate)}</span> },
    { key: 'days', header: 'Days', align: 'right', render: (r) => <span className="font-mono-tabular font-medium">{r.days}</span> },
    { key: 'submitted', header: 'Submitted', render: (r) => <span className="font-mono-tabular text-xs text-[#64748B]">{formatDate(r.submittedDate)}</span> },
    { key: 'approver', header: 'Approver', render: (r) => <span className="text-xs">{r.approverName}</span> },
    { key: 'status', header: 'Status', render: (r) => <ApprovalStatusBadge status={r.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (r) => (
        <div className="inline-flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedLeave(r);
            }}
            title="View"
            aria-label="View leave request"
            className="rounded p-1.5 text-[#475569] hover:bg-[#F7F7FC] hover:text-[#0B1230]"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDownloadLeaveDetails(r);
            }}
            title="Download details"
            aria-label="Download leave details"
            className="rounded p-1.5 text-[#475569] hover:bg-[#F7F7FC] hover:text-[#0B1230]"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
          {(r.status === 'Pending Approval' || r.status === 'Draft') && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCancelTarget(r);
              }}
              title="Cancel request"
              aria-label="Cancel leave request"
              className="rounded p-1.5 text-[#E05252] hover:bg-[#E05252]/10"
            >
              <XCircle className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const tabs: { id: LeaveTab; label: string }[] = [
    { id: 'overview', label: 'Leave Overview' },
    { id: 'apply', label: 'Apply Leave' },
    { id: 'requests', label: 'My Leave Requests' },
    { id: 'balance', label: 'Leave Balance' },
    { id: 'calendar', label: 'Leave Calendar' },
    ...(activeCompany.allowCompOff ? [{ id: 'compoff' as const, label: 'Compensatory Off' }] : []),
    ...(activeCompany.allowLeaveEncashment ? [{ id: 'encashment' as const, label: 'Leave Encashment' }] : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1230]">Leave Management</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Check leave balances, apply for time off, and view holiday and approval schedules.
          </p>
        </div>
        <button
          type="button"
          onClick={() => changeTab('apply')}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#7050F5] px-4 py-2 text-xs font-medium text-white hover:bg-[#5E3FE0] whitespace-nowrap self-start sm:self-auto"
        >
          <CalendarPlus className="h-3.5 w-3.5" />
          Apply Leave
        </button>
      </div>

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

      {(activeTab === 'overview' || activeTab === 'balance') && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {leaveBalances.map((b) => (
              <LeaveBalanceCard
                key={b.code}
                balance={b}
                onApply={(code) => {
                  setLeaveType(code);
                  changeTab('apply');
                }}
              />
            ))}
          </div>
          {activeTab === 'overview' && <LeaveCalendar leaveRequests={leaveRequests} holidays={holidays} />}
        </div>
      )}

      {activeTab === 'apply' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 rounded-xl border border-[#E5E7F0] bg-white p-6 space-y-5">
            <h2 className="text-base font-semibold text-[#0B1230] border-b border-[#F1F3F9] pb-3">
              Leave Application Form
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#475569]">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveTypeCode)}
                  className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm"
                >
                  {leaveBalances.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.name} ({b.available} days available)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#475569]">Full Day / Half Day</label>
                <select
                  value={durationType}
                  onChange={(e) => setDurationType(e.target.value as typeof durationType)}
                  className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm"
                >
                  <option value="Full Day">Full Day</option>
                  <option value="First Half">First Half</option>
                  <option value="Second Half">Second Half</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#475569]">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (e.target.value > endDate) setEndDate(e.target.value);
                  }}
                  className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#475569]">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#475569]">Reason *</label>
              <textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Provide a brief description for your reporting manager..."
                className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#475569]">Contact During Leave</label>
                <input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm font-mono-tabular"
                />
              </div>
              <FileUploader
                label="Supporting Document (Medical / Travel)"
                fileName={attachment}
                onFileSelect={setAttachment}
              />
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2.5 border-t border-[#F1F3F9] pt-4">
              <button
                type="button"
                onClick={() => changeTab('overview')}
                className="rounded-lg border border-[#E5E7F0] px-4 py-2 text-xs font-medium text-[#0B1230] hover:bg-[#F7F7FC]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleLeaveSubmit(true)}
                className="rounded-lg border border-[#E5E7F0] bg-[#F7F7FC] px-4 py-2 text-xs font-medium text-[#0B1230] hover:bg-white"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => handleLeaveSubmit(false)}
                className="rounded-lg bg-[#7050F5] px-5 py-2 text-xs font-semibold text-white hover:bg-[#5E3FE0]"
              >
                Submit Request
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 rounded-xl border border-[#E5E7F0] bg-white p-5 space-y-4 h-fit">
            <h3 className="text-sm font-semibold text-[#0B1230]">Leave Balance Calculation</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Selected Type</span>
                <span className="font-medium">{selectedBalance?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Available Balance</span>
                <span className="font-mono-tabular font-semibold">{selectedBalance?.available ?? 0} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Requested Days (Excl. Holidays/Offs)</span>
                <span className="font-mono-tabular font-semibold text-[#7050F5]">{requestedDays} days</span>
              </div>
              <div className="flex justify-between border-t border-[#F1F3F9] pt-3">
                <span className="font-medium text-[#0B1230]">Remaining Balance</span>
                <span className="font-mono-tabular font-bold text-[#16A36A]">{remainingAfter} days</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-4">
          <FilterBar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search by Request ID or Leave Type..."
            selects={[
              {
                id: 'lv-status',
                label: 'Status',
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { label: 'All Statuses', value: 'All' },
                  { label: 'Pending Approval', value: 'Pending Approval' },
                  { label: 'Approved', value: 'Approved' },
                  { label: 'Draft', value: 'Draft' },
                  { label: 'Rejected', value: 'Rejected' },
                  { label: 'Cancelled', value: 'Cancelled' },
                ],
              },
            ]}
          />
          <DataTable
            data={filteredRequests}
            columns={columns}
            keyExtractor={(r) => r.id}
            onRowClick={(r) => setSelectedLeave(r)}
            emptyActionLabel="Apply Leave"
            onEmptyAction={() => changeTab('apply')}
          />
        </div>
      )}

      {activeTab === 'calendar' && <LeaveCalendar leaveRequests={leaveRequests} holidays={holidays} />}

      {activeTab === 'compoff' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!coReason.trim()) return;
              requestCompOff({ earnedDate: coDate, hoursWorked: Number(coHours), reason: coReason.trim() });
              setCoReason('');
              showToast('Compensatory Off request submitted', 'success');
            }}
            className="lg:col-span-4 rounded-xl border border-[#E5E7F0] bg-white p-5 space-y-4 h-fit"
          >
            <h2 className="text-base font-semibold text-[#0B1230]">Request Compensatory Off</h2>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#475569]">Date Worked (Holiday / Off)</label>
              <input type="date" value={coDate} onChange={(e) => setCoDate(e.target.value)} className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#475569]">Hours Worked</label>
              <input type="number" min="4" max="16" step="0.5" value={coHours} onChange={(e) => setCoHours(e.target.value)} className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm font-mono-tabular" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#475569]">Reason *</label>
              <textarea rows={3} required value={coReason} onChange={(e) => setCoReason(e.target.value)} className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm" />
            </div>
            <button type="submit" className="w-full rounded-lg bg-[#7050F5] px-4 py-2 text-xs font-medium text-white hover:bg-[#5E3FE0]">
              Submit Comp-Off Request
            </button>
          </form>

          <div className="lg:col-span-8">
            <DataTable
              data={compOffs}
              keyExtractor={(c) => c.id}
              columns={[
                { key: 'date', header: 'Earned Date', render: (c) => <span className="font-mono-tabular">{formatDate(c.earnedDate)}</span> },
                { key: 'reason', header: 'Reason', render: (c) => <span className="text-xs">{c.reason}</span> },
                { key: 'hrs', header: 'Hours', align: 'right', render: (c) => <span className="font-mono-tabular">{c.hoursWorked}h</span> },
                { key: 'days', header: 'Days', align: 'right', render: (c) => <span className="font-mono-tabular font-semibold">{c.daysCredited}</span> },
                { key: 'exp', header: 'Expiry Date', render: (c) => <span className="font-mono-tabular text-xs">{formatDate(c.expiryDate)}</span> },
                { key: 'status', header: 'Status', render: (c) => <ApprovalStatusBadge status={c.status} /> },
              ]}
            />
          </div>
        </div>
      )}

      {activeTab === 'encashment' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const d = Number(encashDays);
              const elAvail = leaveBalances.find((b) => b.code === 'EL')?.available ?? 0;
              if (d <= 0 || d > elAvail) {
                showToast('Requested days exceed Earned Leave balance', 'error');
                return;
              }
              requestLeaveEncashment(d);
              showToast('Leave encashment request submitted', 'success');
            }}
            className="lg:col-span-4 rounded-xl border border-[#E5E7F0] bg-white p-5 space-y-4 h-fit"
          >
            <h2 className="text-base font-semibold text-[#0B1230]">Request Leave Encashment</h2>
            <p className="text-xs text-[#64748B]">Encash eligible Earned Leave days as per company payroll policy.</p>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#475569]">Days to Encash</label>
              <input type="number" min="1" max="10" value={encashDays} onChange={(e) => setEncashDays(e.target.value)} className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm font-mono-tabular" />
            </div>
            <div className="rounded-lg bg-[#F7F7FC] p-3 text-xs flex justify-between">
              <span className="text-[#64748B]">Indicative Amount</span>
              <span className="font-mono-tabular font-semibold text-[#0B1230]">
                {formatCurrency((Number(encashDays) || 0) * 4750, activeCompany.currencySymbol)}
              </span>
            </div>
            <button type="submit" className="w-full rounded-lg bg-[#7050F5] px-4 py-2 text-xs font-medium text-white hover:bg-[#5E3FE0]">
              Submit Encashment Request
            </button>
          </form>

          <div className="lg:col-span-8">
            <DataTable
              data={encashmentRequests}
              keyExtractor={(e) => e.id}
              columns={[
                { key: 'id', header: 'Request ID', render: (e) => <span className="font-mono-tabular text-xs font-semibold">{e.id}</span> },
                { key: 'days', header: 'Days', align: 'right', render: (e) => <span className="font-mono-tabular">{e.daysRequested}</span> },
                { key: 'amt', header: 'Amount', align: 'right', render: (e) => <span className="font-mono-tabular font-semibold">{formatCurrency(e.estimatedAmount, activeCompany.currencySymbol)}</span> },
                { key: 'date', header: 'Submitted', render: (e) => <span className="font-mono-tabular text-xs">{formatDate(e.submittedDate)}</span> },
                { key: 'status', header: 'Status', render: (e) => <ApprovalStatusBadge status={e.status} /> },
              ]}
            />
          </div>
        </div>
      )}

      {/* Leave Detail Drawer */}
      <DetailDrawer
        open={Boolean(selectedLeave)}
        onClose={() => setSelectedLeave(null)}
        title={selectedLeave ? `Leave Request ${selectedLeave.id}` : ''}
        subtitle={selectedLeave ? selectedLeave.leaveTypeName : ''}
      >
        {selectedLeave && (
          <div className="space-y-5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#64748B]">Status</span>
              <ApprovalStatusBadge status={selectedLeave.status} />
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-lg bg-[#F7F7FC] p-3.5 text-xs">
              <div>
                <p className="text-[#64748B]">Period</p>
                <p className="mt-0.5 font-medium text-[#0B1230]">
                  {formatDate(selectedLeave.startDate)} – {formatDate(selectedLeave.endDate)}
                </p>
              </div>
              <div>
                <p className="text-[#64748B]">Duration</p>
                <p className="mt-0.5 font-medium text-[#0B1230]">
                  {selectedLeave.days} day(s) · {selectedLeave.durationType}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Reason</p>
              <p className="mt-1 text-[#0B1230]">{selectedLeave.reason}</p>
            </div>
            <div className="border-t border-[#F1F3F9] pt-4">
              <h4 className="mb-3 text-xs font-semibold text-[#0B1230]">Approval Timeline</h4>
              <RequestTimeline events={selectedLeave.timeline} />
            </div>
          </div>
        )}
      </DetailDrawer>

      <ConfirmationDialog
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        destructive
        title="Cancel Leave Request?"
        description={`Are you sure you want to cancel leave request ${cancelTarget?.id ?? ''}? Your leave balance will be restored automatically.`}
        confirmLabel="Yes, Cancel Request"
        onConfirm={() => {
          if (cancelTarget) {
            cancelLeaveRequest(cancelTarget.id);
            showToast('Leave request cancelled', 'info');
          }
        }}
      />
    </div>
  );
}
