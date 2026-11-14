import React, { useEffect, useState } from 'react';
import { Check, MessageSquareWarning, ShieldAlert, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext';
import { usePortalData } from '../../app/PortalDataContext';
import { useToast } from '../../app/ToastContext';
import { ApprovalStatusBadge } from '../../components/ApprovalStatusBadge';
import { ColumnDef, DataTable } from '../../components/DataTable';
import { FormModal } from '../../components/FormModal';
import { LeaveCalendar } from '../../components/LeaveCalendar';
import { SafeAvatar } from '../../components/SafeAvatar';
import { StatCard } from '../../components/StatCard';
import { AttendanceRegularisationRequest, LeaveRequest, RequestStatus, TeamMemberSummary } from '../../types/ess';
import { formatDate } from '../../utils/formatters';

type ManagerTab =
  | 'dashboard'
  | 'attendance'
  | 'leave-approvals'
  | 'attendance-approvals'
  | 'overview'
  | 'performance';

export function ManagerPage() {
  const { isManagerAuthorized, currentUser } = useAuth();
  const {
    teamMembers,
    teamLeaveRequests,
    teamRegularisations,
    reviewTeamLeave,
    reviewTeamRegularisation,
    holidays,
    upcomingEvents,
  } = usePortalData();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = (searchParams.get('tab') as ManagerTab) || 'dashboard';
  const [activeTab, setActiveTab] = useState<ManagerTab>(tabParam);

  useEffect(() => {
    setActiveTab(tabParam);
  }, [tabParam]);

  const changeTab = (t: ManagerTab) => {
    setActiveTab(t);
    setSearchParams({ tab: t });
  };

  const [decisionModal, setDecisionModal] = useState<{
    kind: 'leave' | 'regularisation';
    id: string;
    title: string;
    decision: Extract<RequestStatus, 'Approved' | 'Rejected' | 'Changes Requested'>;
  } | null>(null);
  const [decisionNote, setDecisionNote] = useState('');

  if (!isManagerAuthorized) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-[#E5E7F0] bg-white p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E05252]/10 text-[#E05252]">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-lg font-bold text-[#0B1230]">Manager Access Not Granted</h1>
        <p className="mt-2 text-sm text-[#64748B]">
          Your account ({currentUser?.fullName}) does not hold explicit Reporting Manager permissions in PayFuse. Only authorized managers can access scoped team views.
        </p>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="mt-5 rounded-lg bg-[#7050F5] px-4 py-2 text-xs font-medium text-white hover:bg-[#5E3FE0]"
        >
          Return to My Dashboard
        </button>
      </div>
    );
  }

  const presentToday = teamMembers.filter((m) => m.todayStatus === 'Present').length;
  const absentToday = teamMembers.filter((m) => m.todayStatus === 'Absent').length;
  const onLeaveToday = teamMembers.filter((m) => m.todayStatus === 'Leave').length;
  const pendingLeave = teamLeaveRequests.filter((r) => r.status === 'Pending Approval').length;
  const pendingReg = teamRegularisations.filter((r) => r.status === 'Pending Approval').length;

  const handleConfirmDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!decisionModal) return;
    if (decisionModal.kind === 'leave') {
      reviewTeamLeave(decisionModal.id, decisionModal.decision, decisionNote.trim() || undefined);
    } else {
      reviewTeamRegularisation(decisionModal.id, decisionModal.decision, decisionNote.trim() || undefined);
    }
    showToast(`Request ${decisionModal.decision}`, 'success');
    setDecisionModal(null);
    setDecisionNote('');
  };

  const memberCols: ColumnDef<TeamMemberSummary>[] = [
    {
      key: 'member',
      header: 'Team Member',
      render: (m) => (
        <div className="flex items-center gap-2.5">
          <SafeAvatar src={m.avatarUrl} name={m.fullName} size="sm" />
          <div>
            <p className="font-semibold text-[#0B1230]">{m.fullName}</p>
            <p className="text-xs text-[#64748B] font-mono-tabular">{m.employeeCode}</p>
          </div>
        </div>
      ),
    },
    { key: 'desig', header: 'Designation', render: (m) => <span className="text-xs">{m.designation}</span> },
    { key: 'shift', header: 'Assigned Shift', render: (m) => <span className="text-xs text-[#475569]">{m.shiftName}</span> },
    { key: 'mode', header: 'Work Mode', render: (m) => <span className="text-xs">{m.locationMode}</span> },
    { key: 'in', header: 'Check In', render: (m) => <span className="font-mono-tabular text-xs">{m.checkInTime ?? '—'}</span> },
    { key: 'st', header: 'Today Status', render: (m) => <ApprovalStatusBadge status={m.todayStatus} /> },
  ];

  const leaveCols: ColumnDef<LeaveRequest>[] = [
    { key: 'id', header: 'Request ID', render: (r) => <span className="font-mono-tabular text-xs font-semibold">{r.id}</span> },
    { key: 'emp', header: 'Team Member', render: (r) => <span className="font-medium">{r.employeeName}</span> },
    { key: 'type', header: 'Leave Type', render: (r) => r.leaveTypeName },
    { key: 'dates', header: 'Period', render: (r) => <span className="font-mono-tabular text-xs">{formatDate(r.startDate)} – {formatDate(r.endDate)}</span> },
    { key: 'days', header: 'Days', align: 'right', render: (r) => <span className="font-mono-tabular font-semibold">{r.days}</span> },
    { key: 'st', header: 'Status', render: (r) => <ApprovalStatusBadge status={r.status} /> },
    {
      key: 'actions',
      header: 'Review Actions',
      align: 'right',
      render: (r) =>
        r.status === 'Pending Approval' ? (
          <div className="inline-flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setDecisionModal({ kind: 'leave', id: r.id, title: `${r.employeeName} · ${r.leaveTypeName}`, decision: 'Approved' })}
              className="inline-flex items-center gap-1 rounded-md bg-[#16A36A] px-2.5 py-1 text-xs font-medium text-white hover:bg-[#138A58]"
            >
              <Check className="h-3 w-3" /> Approve
            </button>
            <button
              type="button"
              onClick={() => setDecisionModal({ kind: 'leave', id: r.id, title: `${r.employeeName} · ${r.leaveTypeName}`, decision: 'Changes Requested' })}
              className="inline-flex items-center gap-1 rounded-md border border-[#E5E7F0] px-2.5 py-1 text-xs font-medium text-[#0B1230] hover:bg-[#F7F7FC]"
            >
              <MessageSquareWarning className="h-3 w-3" /> Changes
            </button>
            <button
              type="button"
              onClick={() => setDecisionModal({ kind: 'leave', id: r.id, title: `${r.employeeName} · ${r.leaveTypeName}`, decision: 'Rejected' })}
              className="inline-flex items-center gap-1 rounded-md bg-[#E05252] px-2.5 py-1 text-xs font-medium text-white hover:bg-[#C63D3D]"
            >
              <X className="h-3 w-3" /> Reject
            </button>
          </div>
        ) : (
          <span className="text-xs text-[#64748B]">Reviewed</span>
        ),
    },
  ];

  const regCols: ColumnDef<AttendanceRegularisationRequest>[] = [
    { key: 'id', header: 'ID', render: (r) => <span className="font-mono-tabular text-xs font-semibold">{r.id}</span> },
    { key: 'emp', header: 'Team Member', render: (r) => <span className="font-medium">{r.employeeName}</span> },
    { key: 'date', header: 'Date', render: (r) => <span className="font-mono-tabular text-xs">{formatDate(r.attendanceDate)}</span> },
    { key: 'req', header: 'Requested Punches', render: (r) => <span className="font-mono-tabular text-xs">{r.requestedCheckIn} – {r.requestedCheckOut}</span> },
    { key: 'reason', header: 'Reason', render: (r) => <span className="text-xs text-[#475569] truncate max-w-[200px] block">{r.reason}</span> },
    { key: 'st', header: 'Status', render: (r) => <ApprovalStatusBadge status={r.status} /> },
    {
      key: 'actions',
      header: 'Review Actions',
      align: 'right',
      render: (r) =>
        r.status === 'Pending Approval' ? (
          <div className="inline-flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setDecisionModal({ kind: 'regularisation', id: r.id, title: `${r.employeeName} · ${formatDate(r.attendanceDate)}`, decision: 'Approved' })}
              className="rounded-md bg-[#16A36A] px-2.5 py-1 text-xs font-medium text-white"
            >
              Approve
            </button>
            <button
              type="button"
              onClick={() => setDecisionModal({ kind: 'regularisation', id: r.id, title: `${r.employeeName} · ${formatDate(r.attendanceDate)}`, decision: 'Rejected' })}
              className="rounded-md bg-[#E05252] px-2.5 py-1 text-xs font-medium text-white"
            >
              Reject
            </button>
          </div>
        ) : (
          <span className="text-xs text-[#64748B]">Reviewed</span>
        ),
    },
  ];

  const tabs: { id: ManagerTab; label: string }[] = [
    { id: 'dashboard', label: 'Team Dashboard' },
    { id: 'attendance', label: 'Team Attendance' },
    { id: 'leave-approvals', label: `Leave Approvals (${pendingLeave})` },
    { id: 'attendance-approvals', label: `Attendance Approvals (${pendingReg})` },
    { id: 'overview', label: 'Team Overview' },
    { id: 'performance', label: 'Team Performance' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0B1230]">Team Management</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Role-scoped manager self-service for your authorized direct reports ({teamMembers.length} members).
        </p>
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

      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <StatCard title="Team Size" value={`${teamMembers.length}`} subtitle="Direct reports" accent="navy" />
            <StatCard title="Present Today" value={`${presentToday}`} subtitle="Checked in" accent="success" />
            <StatCard title="Absent Today" value={`${absentToday}`} subtitle="Unplanned" accent="navy" />
            <StatCard title="On Leave" value={`${onLeaveToday}`} subtitle="Approved leave" accent="blue" />
            <StatCard title="Pending Requests" value={`${pendingLeave + pendingReg}`} subtitle="Leave & Attendance" accent="warning" />
          </div>
          <DataTable data={teamMembers} columns={memberCols} keyExtractor={(m) => m.employeeId} />
        </div>
      )}

      {activeTab === 'attendance' && (
        <DataTable data={teamMembers} columns={memberCols} keyExtractor={(m) => m.employeeId} />
      )}

      {activeTab === 'leave-approvals' && (
        <DataTable data={teamLeaveRequests} columns={leaveCols} keyExtractor={(r) => r.id} />
      )}

      {activeTab === 'attendance-approvals' && (
        <DataTable data={teamRegularisations} columns={regCols} keyExtractor={(r) => r.id} />
      )}

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <LeaveCalendar leaveRequests={teamLeaveRequests} holidays={holidays} />
          <div className="rounded-xl border border-[#E5E7F0] bg-white p-5">
            <h2 className="text-base font-semibold text-[#0B1230] mb-3">Upcoming Team Milestones</h2>
            <ul className="divide-y divide-[#F1F3F9] text-sm">
              {upcomingEvents.map((ev) => (
                <li key={ev.id} className="py-2.5 flex justify-between gap-4">
                  <span>{ev.title}</span>
                  <span className="font-mono-tabular text-xs text-[#64748B]">{formatDate(ev.date)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <DataTable
          data={teamMembers}
          keyExtractor={(m) => m.employeeId}
          columns={[
            { key: 'name', header: 'Team Member', render: (m) => <span className="font-semibold">{m.fullName}</span> },
            { key: 'role', header: 'Designation', render: (m) => <span className="text-xs">{m.designation}</span> },
            {
              key: 'goals',
              header: 'Avg. Goal Progress',
              align: 'right',
              render: (m) => <span className="font-mono-tabular font-semibold text-[#7050F5]">{m.goalCompletionAvg}%</span>,
            },
            { key: 'rev', header: 'Review Cycle Status', render: (m) => <ApprovalStatusBadge status={m.latestReviewStatus} /> },
          ]}
        />
      )}

      <FormModal
        open={Boolean(decisionModal)}
        onClose={() => setDecisionModal(null)}
        title={decisionModal ? `Confirm Decision: ${decisionModal.decision}` : ''}
        subtitle={decisionModal?.title}
      >
        <form onSubmit={handleConfirmDecision} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#475569]">
              Manager Note {decisionModal?.decision !== 'Approved' ? '(Recommended)' : '(Optional)'}
            </label>
            <textarea
              rows={3}
              value={decisionNote}
              onChange={(e) => setDecisionNote(e.target.value)}
              placeholder="Add review remarks for the employee..."
              className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setDecisionModal(null)} className="rounded-lg border border-[#E5E7F0] px-4 py-2 text-xs font-medium">
              Cancel
            </button>
            <button
              type="submit"
              className={`rounded-lg px-4 py-2 text-xs font-medium text-white ${
                decisionModal?.decision === 'Rejected' ? 'bg-[#E05252]' : 'bg-[#7050F5]'
              }`}
            >
              Confirm {decisionModal?.decision}
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
