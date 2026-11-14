import React, { createContext, useContext, useMemo, useState } from 'react';
import {
  DEMO_ATTENDANCE,
  DEMO_COMP_OFFS,
  DEMO_DOCUMENTS,
  DEMO_DOCUMENT_REQUESTS,
  DEMO_ENCASHMENT_REQUESTS,
  DEMO_EXPENSES,
  DEMO_GOALS,
  DEMO_HOLIDAYS,
  DEMO_KPIS,
  DEMO_LEAVE_BALANCES,
  DEMO_LEAVE_REQUESTS,
  DEMO_LOANS,
  DEMO_LOGIN_HISTORY,
  DEMO_NOTIFICATIONS,
  DEMO_PAYSLIPS,
  DEMO_PREVIOUS_EMPLOYERS,
  DEMO_REGULARISATIONS,
  DEMO_REVIEWS,
  DEMO_SHIFT_SCHEDULE,
  DEMO_TAX_DECLARATIONS,
  DEMO_TEAM_MEMBERS,
  DEMO_TICKETS,
  DEMO_TRAININGS,
  DEMO_UPCOMING_EVENTS,
} from '../mock-data/demoData';
import {
  AttendanceRecord,
  AttendanceRegularisationRequest,
  CompOffRecord,
  DocumentRequest,
  EmployeeDocument,
  ExpenseClaim,
  HolidayItem,
  LeaveBalanceItem,
  LeaveEncashmentRequest,
  LeaveRequest,
  LoanRecord,
  LoginHistoryEntry,
  NotificationItem,
  PayslipRecord,
  PerformanceGoal,
  PerformanceKpi,
  PerformanceReview,
  PreviousEmployerDetail,
  PunchState,
  RequestStatus,
  ShiftScheduleItem,
  SupportTicket,
  TaxDeclarationItem,
  TeamMemberSummary,
  TrainingItem,
  UpcomingEventItem,
} from '../types/ess';
import { useAuth } from './AuthContext';

export interface TodayPunchSession {
  state: PunchState;
  checkInTime?: string;
  checkOutTime?: string;
  breakStartedAt?: number;
  totalBreakMinutes: number;
  checkInTimestamp?: number;
  locationStatus?: string;
}

interface PortalDataContextValue {
  // Attendance & Punch
  punchSession: TodayPunchSession;
  punchIn: (locationStatus?: string) => void;
  startBreak: () => void;
  endBreak: () => void;
  punchOut: (locationStatus?: string) => void;
  attendanceRecords: AttendanceRecord[];
  regularisations: AttendanceRegularisationRequest[];
  submitRegularisation: (payload: {
    attendanceDate: string;
    originalCheckIn: string;
    originalCheckOut: string;
    requestedCheckIn: string;
    requestedCheckOut: string;
    reason: string;
    attachmentName?: string;
  }) => void;
  shiftSchedule: ShiftScheduleItem[];
  holidays: HolidayItem[];

  // Leave
  leaveBalances: LeaveBalanceItem[];
  leaveRequests: LeaveRequest[];
  submitLeaveRequest: (payload: Omit<LeaveRequest, 'id' | 'employeeId' | 'employeeName' | 'submittedDate' | 'approverName' | 'timeline'>) => void;
  cancelLeaveRequest: (id: string) => void;
  compOffs: CompOffRecord[];
  requestCompOff: (payload: { earnedDate: string; hoursWorked: number; reason: string }) => void;
  encashmentRequests: LeaveEncashmentRequest[];
  requestLeaveEncashment: (days: number) => void;

  // Payroll & Tax
  payslips: PayslipRecord[];
  taxDeclarations: TaxDeclarationItem[];
  addOrUpdateTaxDeclaration: (item: TaxDeclarationItem) => void;
  previousEmployers: PreviousEmployerDetail[];
  addPreviousEmployer: (item: Omit<PreviousEmployerDetail, 'id' | 'status'>) => void;

  // Expenses & Loans
  expenses: ExpenseClaim[];
  submitExpense: (claim: Omit<ExpenseClaim, 'id' | 'employeeId' | 'submittedDate' | 'approverName' | 'reimbursementStatus' | 'timeline'>) => void;
  cancelExpense: (id: string) => void;
  loans: LoanRecord[];
  applyLoan: (payload: {
    loanType: LoanRecord['loanType'];
    requestedAmount: number;
    purpose: string;
    repaymentMonths: number;
    supportingDocName?: string;
  }) => void;

  // Documents & Performance
  documents: EmployeeDocument[];
  uploadDocument: (doc: Omit<EmployeeDocument, 'id' | 'employeeId' | 'uploadedDate' | 'verificationStatus' | 'accessScope'>) => void;
  documentRequests: DocumentRequest[];
  requestNewDocument: (documentType: string, purpose: string) => void;
  goals: PerformanceGoal[];
  updateGoalProgress: (goalId: string, progress: number) => void;
  kpis: PerformanceKpi[];
  reviews: PerformanceReview[];
  trainings: TrainingItem[];
  updateTrainingProgress: (id: string, progress: number) => void;

  // Support & Notifications
  tickets: SupportTicket[];
  createTicket: (payload: {
    category: SupportTicket['category'];
    subject: string;
    description: string;
    priority: SupportTicket['priority'];
    attachmentName?: string;
  }) => SupportTicket;
  replyTicket: (ticketId: string, message: string, attachmentName?: string) => void;
  closeTicket: (ticketId: string) => void;
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  notificationPrefs: { emailPayroll: boolean; emailLeave: boolean; inAppAttendance: boolean; inAppAnnouncements: boolean };
  setNotificationPrefs: React.Dispatch<React.SetStateAction<{ emailPayroll: boolean; emailLeave: boolean; inAppAttendance: boolean; inAppAnnouncements: boolean }>>;

  // Events & Security
  upcomingEvents: UpcomingEventItem[];
  loginHistory: LoginHistoryEntry[];
  twoFactorEnabled: boolean;
  setTwoFactorEnabled: (val: boolean) => void;

  // Manager Scoped Data
  teamMembers: TeamMemberSummary[];
  teamLeaveRequests: LeaveRequest[];
  teamRegularisations: AttendanceRegularisationRequest[];
  reviewTeamLeave: (requestId: string, decision: Extract<RequestStatus, 'Approved' | 'Rejected' | 'Changes Requested'>, note?: string) => void;
  reviewTeamRegularisation: (requestId: string, decision: Extract<RequestStatus, 'Approved' | 'Rejected' | 'Changes Requested'>, note?: string) => void;
}

const PortalDataContext = createContext<PortalDataContextValue | undefined>(undefined);

export function PortalDataProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, isManagerAuthorized } = useAuth();
  const employeeId = currentUser?.id ?? 'emp-1042';

  const [punchByEmployee, setPunchByEmployee] = useState<Record<string, TodayPunchSession>>({
    'emp-1042': { state: 'Not Checked In', totalBreakMinutes: 0 },
    'emp-0814': {
      state: 'Checked In',
      checkInTime: '09:14',
      checkInTimestamp: Date.now() - 1000 * 60 * 115,
      totalBreakMinutes: 0,
      locationStatus: 'Bengaluru Tech Campus (Verified)',
    },
  });

  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>(DEMO_ATTENDANCE);
  const [allRegularisations, setAllRegularisations] = useState<AttendanceRegularisationRequest[]>(DEMO_REGULARISATIONS);
  const [allLeaveRequests, setAllLeaveRequests] = useState<LeaveRequest[]>(DEMO_LEAVE_REQUESTS);
  const [allCompOffs, setAllCompOffs] = useState<CompOffRecord[]>(DEMO_COMP_OFFS);
  const [allEncashments, setAllEncashments] = useState<LeaveEncashmentRequest[]>(DEMO_ENCASHMENT_REQUESTS);
  const [allTaxDeclarations, setAllTaxDeclarations] = useState<TaxDeclarationItem[]>(DEMO_TAX_DECLARATIONS);
  const [previousEmployers, setPreviousEmployers] = useState<PreviousEmployerDetail[]>(DEMO_PREVIOUS_EMPLOYERS);
  const [allExpenses, setAllExpenses] = useState<ExpenseClaim[]>(DEMO_EXPENSES);
  const [allLoans, setAllLoans] = useState<LoanRecord[]>(DEMO_LOANS);
  const [allDocuments, setAllDocuments] = useState<EmployeeDocument[]>(DEMO_DOCUMENTS);
  const [allDocRequests, setAllDocRequests] = useState<DocumentRequest[]>(DEMO_DOCUMENT_REQUESTS);
  const [allGoals, setAllGoals] = useState<PerformanceGoal[]>(DEMO_GOALS);
  const [allTrainings, setAllTrainings] = useState<TrainingItem[]>(DEMO_TRAININGS);
  const [allTickets, setAllTickets] = useState<SupportTicket[]>(DEMO_TICKETS);
  const [allNotifications, setAllNotifications] = useState<NotificationItem[]>(DEMO_NOTIFICATIONS);
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailPayroll: true,
    emailLeave: true,
    inAppAttendance: true,
    inAppAnnouncements: true,
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  const punchSession = punchByEmployee[employeeId] ?? { state: 'Not Checked In', totalBreakMinutes: 0 };

  const formatNowHHMM = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const punchIn = (locationStatus?: string) => {
    const nowTime = formatNowHHMM();
    setPunchByEmployee((prev) => ({
      ...prev,
      [employeeId]: {
        state: 'Checked In',
        checkInTime: nowTime,
        checkInTimestamp: Date.now(),
        totalBreakMinutes: 0,
        locationStatus,
      },
    }));
  };

  const startBreak = () => {
    setPunchByEmployee((prev) => {
      const curr = prev[employeeId] ?? { state: 'Checked In', totalBreakMinutes: 0 };
      return {
        ...prev,
        [employeeId]: {
          ...curr,
          state: 'On Break',
          breakStartedAt: Date.now(),
        },
      };
    });
  };

  const endBreak = () => {
    setPunchByEmployee((prev) => {
      const curr = prev[employeeId] ?? { state: 'On Break', totalBreakMinutes: 0 };
      const addedMins = curr.breakStartedAt
        ? Math.max(1, Math.round((Date.now() - curr.breakStartedAt) / 60000))
        : 15;
      return {
        ...prev,
        [employeeId]: {
          ...curr,
          state: 'Checked In',
          breakStartedAt: undefined,
          totalBreakMinutes: curr.totalBreakMinutes + addedMins,
        },
      };
    });
  };

  const punchOut = (locationStatus?: string) => {
    const nowTime = formatNowHHMM();
    const todayIso = '2026-11-14';
    const curr = punchSession;
    const workedHrs = curr.checkInTimestamp
      ? Math.max(0.5, Number(((Date.now() - curr.checkInTimestamp) / 3600000).toFixed(2)))
      : 8.5;

    setPunchByEmployee((prev) => ({
      ...prev,
      [employeeId]: {
        ...curr,
        state: 'Checked Out',
        checkOutTime: nowTime,
        locationStatus: locationStatus ?? curr.locationStatus,
      },
    }));

    setAllAttendance((prev) => {
      const filtered = prev.filter((r) => !(r.employeeId === employeeId && r.date === todayIso));
      return [
        {
          id: `att-today-${employeeId}`,
          employeeId,
          date: todayIso,
          shiftName: 'General Flexible Shift',
          checkIn: curr.checkInTime ?? '09:30',
          checkOut: nowTime,
          workingHours: workedHrs,
          breakMinutes: curr.totalBreakMinutes,
          overtimeHours: workedHrs > 9 ? Number((workedHrs - 9).toFixed(2)) : 0,
          isLate: false,
          status: 'Present',
          locationNote: locationStatus ?? curr.locationStatus ?? 'Campus / Hybrid',
        },
        ...filtered,
      ];
    });
  };

  const attendanceRecords = useMemo(
    () => allAttendance.filter((a) => a.employeeId === employeeId),
    [allAttendance, employeeId]
  );

  const regularisations = useMemo(
    () => allRegularisations.filter((r) => r.employeeId === employeeId),
    [allRegularisations, employeeId]
  );

  const submitRegularisation: PortalDataContextValue['submitRegularisation'] = (payload) => {
    if (!currentUser) return;
    const newReq: AttendanceRegularisationRequest = {
      id: `REG-2026-${Math.floor(100 + Math.random() * 899)}`,
      employeeId,
      employeeName: currentUser.fullName,
      ...payload,
      submittedDate: '2026-11-14',
      status: 'Pending Approval',
      approverName: currentUser.reportingManagerName,
      timeline: [
        {
          id: 't1',
          label: 'Regularisation Submitted',
          actor: currentUser.fullName,
          timestamp: '14 Nov 2026, Just now',
          status: 'completed',
        },
        {
          id: 't2',
          label: 'Pending Manager Review',
          actor: currentUser.reportingManagerName,
          timestamp: 'Awaiting Action',
          status: 'current',
        },
      ],
    };
    setAllRegularisations((prev) => [newReq, ...prev]);
  };

  const leaveRequests = useMemo(
    () => allLeaveRequests.filter((l) => l.employeeId === employeeId),
    [allLeaveRequests, employeeId]
  );

  const leaveBalances = useMemo(() => {
    const base = DEMO_LEAVE_BALANCES[employeeId] ?? DEMO_LEAVE_BALANCES['emp-1042'];
    return base.map((b) => {
      const extraPending = leaveRequests
        .filter((r) => r.leaveTypeCode === b.code && r.status === 'Pending Approval' && !['LV-2026-312'].includes(r.id))
        .reduce((acc, r) => acc + r.days, 0);
      return {
        ...b,
        pending: b.pending + extraPending,
        available: Math.max(0, b.available - extraPending),
      };
    });
  }, [employeeId, leaveRequests]);

  const submitLeaveRequest: PortalDataContextValue['submitLeaveRequest'] = (payload) => {
    if (!currentUser) return;
    const req: LeaveRequest = {
      id: `LV-2026-${Math.floor(330 + Math.random() * 600)}`,
      employeeId,
      employeeName: currentUser.fullName,
      ...payload,
      submittedDate: '2026-11-14',
      approverName: currentUser.reportingManagerName,
      timeline: [
        {
          id: 't1',
          label: payload.status === 'Draft' ? 'Saved as Draft' : 'Leave Request Submitted',
          actor: currentUser.fullName,
          timestamp: '14 Nov 2026, Just now',
          status: payload.status === 'Draft' ? 'current' : 'completed',
        },
        ...(payload.status === 'Draft'
          ? []
          : [
              {
                id: 't2',
                label: 'Manager Approval Pending',
                actor: currentUser.reportingManagerName,
                timestamp: 'Awaiting Action',
                status: 'current' as const,
              },
            ]),
      ],
    };
    setAllLeaveRequests((prev) => [req, ...prev]);
  };

  const cancelLeaveRequest = (id: string) => {
    setAllLeaveRequests((prev) =>
      prev.map((r) =>
        r.id === id && r.employeeId === employeeId
          ? {
              ...r,
              status: 'Cancelled',
              timeline: [
                ...r.timeline,
                {
                  id: `cancel-${Date.now()}`,
                  label: 'Cancelled by Employee',
                  actor: currentUser?.fullName ?? 'Employee',
                  timestamp: '14 Nov 2026',
                  status: 'rejected',
                },
              ],
            }
          : r
      )
    );
  };

  const compOffs = useMemo(
    () => allCompOffs.filter((c) => c.employeeId === employeeId),
    [allCompOffs, employeeId]
  );

  const requestCompOff: PortalDataContextValue['requestCompOff'] = ({ earnedDate, hoursWorked, reason }) => {
    const expiry = new Date(earnedDate + 'T00:00:00');
    expiry.setDate(expiry.getDate() + 90);
    setAllCompOffs((prev) => [
      {
        id: `CO-2026-${Math.floor(20 + Math.random() * 79)}`,
        employeeId,
        earnedDate,
        reason,
        hoursWorked,
        daysCredited: hoursWorked >= 7 ? 1 : 0.5,
        expiryDate: expiry.toISOString().slice(0, 10),
        status: 'Pending Approval',
      },
      ...prev,
    ]);
  };

  const encashmentRequests = useMemo(
    () => allEncashments.filter((e) => e.employeeId === employeeId),
    [allEncashments, employeeId]
  );

  const requestLeaveEncashment = (days: number) => {
    setAllEncashments((prev) => [
      {
        id: `ENC-2026-${Math.floor(10 + Math.random() * 89)}`,
        employeeId,
        daysRequested: days,
        estimatedAmount: days * 4750,
        submittedDate: '2026-11-14',
        status: 'Pending Approval',
      },
      ...prev,
    ]);
  };

  const payslips = useMemo(
    () => DEMO_PAYSLIPS.filter((p) => p.employeeId === employeeId),
    [employeeId]
  );

  const taxDeclarations = useMemo(
    () => allTaxDeclarations.filter((t) => t.employeeId === employeeId),
    [allTaxDeclarations, employeeId]
  );

  const addOrUpdateTaxDeclaration = (item: TaxDeclarationItem) => {
    setAllTaxDeclarations((prev) => {
      const exists = prev.some((x) => x.id === item.id);
      if (exists) {
        return prev.map((x) => (x.id === item.id ? item : x));
      }
      return [item, ...prev];
    });
  };

  const addPreviousEmployer = (item: Omit<PreviousEmployerDetail, 'id' | 'status'>) => {
    setPreviousEmployers((prev) => [
      {
        ...item,
        id: `PREV-${Date.now()}`,
        status: 'Under Review',
      },
      ...prev,
    ]);
  };

  const expenses = useMemo(
    () => allExpenses.filter((e) => e.employeeId === employeeId),
    [allExpenses, employeeId]
  );

  const submitExpense: PortalDataContextValue['submitExpense'] = (claim) => {
    if (!currentUser) return;
    const newClaim: ExpenseClaim = {
      id: `EXP-2026-${Math.floor(430 + Math.random() * 500)}`,
      employeeId,
      ...claim,
      submittedDate: '2026-11-14',
      approverName: currentUser.reportingManagerName,
      reimbursementStatus: 'Not Processed',
      timeline: [
        {
          id: 't1',
          label: claim.status === 'Draft' ? 'Saved as Draft' : 'Expense Claim Submitted',
          actor: currentUser.fullName,
          timestamp: '14 Nov 2026, Just now',
          status: claim.status === 'Draft' ? 'current' : 'completed',
        },
      ],
    };
    setAllExpenses((prev) => [newClaim, ...prev]);
  };

  const cancelExpense = (id: string) => {
    setAllExpenses((prev) =>
      prev.map((e) => (e.id === id && e.employeeId === employeeId ? { ...e, status: 'Cancelled' } : e))
    );
  };

  const loans = useMemo(
    () => allLoans.filter((l) => l.employeeId === employeeId),
    [allLoans, employeeId]
  );

  const applyLoan: PortalDataContextValue['applyLoan'] = (payload) => {
    const monthlyEmi = Math.round(payload.requestedAmount / payload.repaymentMonths);
    const schedule = Array.from({ length: payload.repaymentMonths }, (_, i) => {
      const dt = new Date('2026-12-30T00:00:00');
      dt.setMonth(dt.getMonth() + i);
      return {
        installmentNumber: i + 1,
        dueDate: dt.toISOString().slice(0, 10),
        installmentAmount: monthlyEmi,
        principalComponent: monthlyEmi,
        outstandingBalance: Math.max(0, payload.requestedAmount - (i + 1) * monthlyEmi),
        paymentStatus: 'Scheduled' as const,
      };
    });
    const newLoan: LoanRecord = {
      id: `LN-2026-${Math.floor(100 + Math.random() * 899)}`,
      employeeId,
      loanType: payload.loanType,
      requestedAmount: payload.requestedAmount,
      approvedAmount: 0,
      purpose: payload.purpose,
      repaymentMonths: payload.repaymentMonths,
      monthlyEmi,
      paidInstallments: 0,
      remainingInstallments: payload.repaymentMonths,
      outstandingBalance: payload.requestedAmount,
      submittedDate: '2026-11-14',
      supportingDocName: payload.supportingDocName,
      status: 'Pending Approval',
      schedule,
    };
    setAllLoans((prev) => [newLoan, ...prev]);
  };

  const documents = useMemo(
    () => allDocuments.filter((d) => d.employeeId === employeeId || d.employeeId === 'emp-1042'),
    [allDocuments, employeeId]
  );

  const uploadDocument: PortalDataContextValue['uploadDocument'] = (doc) => {
    setAllDocuments((prev) => [
      {
        ...doc,
        id: `DOC-${Date.now()}`,
        employeeId,
        uploadedDate: '2026-11-14',
        verificationStatus: 'Pending Verification',
        accessScope: 'Private (Employee Only)',
      },
      ...prev,
    ]);
  };

  const documentRequests = useMemo(
    () => allDocRequests.filter((r) => r.employeeId === employeeId),
    [allDocRequests, employeeId]
  );

  const requestNewDocument = (documentType: string, purpose: string) => {
    setAllDocRequests((prev) => [
      {
        id: `DREQ-2026-${Math.floor(20 + Math.random() * 80)}`,
        employeeId,
        documentType,
        purpose,
        requestedDate: '2026-11-14',
        status: 'Submitted',
      },
      ...prev,
    ]);
  };

  const goals = useMemo(
    () => allGoals.filter((g) => g.employeeId === employeeId || employeeId === 'emp-0814'),
    [allGoals, employeeId]
  );

  const updateGoalProgress = (goalId: string, progress: number) => {
    setAllGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? {
              ...g,
              progress,
              status: progress === 100 ? 'Completed' : progress < 40 ? 'At Risk' : 'On Track',
            }
          : g
      )
    );
  };

  const kpis = useMemo(() => DEMO_KPIS, []);
  const reviews = useMemo(() => DEMO_REVIEWS, []);
  const trainings = useMemo(() => allTrainings, [allTrainings]);

  const updateTrainingProgress = (id: string, progress: number) => {
    setAllTrainings((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              progress,
              status: progress >= 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Assigned',
              completionDate: progress >= 100 ? '2026-11-14' : undefined,
              hasCertificate: progress >= 100,
            }
          : t
      )
    );
  };

  const tickets = useMemo(
    () => allTickets.filter((t) => t.employeeId === employeeId || employeeId === 'emp-0814'),
    [allTickets, employeeId]
  );

  const createTicket: PortalDataContextValue['createTicket'] = (payload) => {
    const isGrievance = payload.category === 'Grievance';
    const deptMap: Record<SupportTicket['category'], string> = {
      'Payroll Issue': 'Payroll Desk',
      'Payslip Issue': 'Payroll Desk',
      'Tax Issue': 'Payroll & Tax Desk',
      'Attendance Issue': 'Workforce Operations',
      'Leave Issue': 'HR Operations',
      'Reimbursement Issue': 'Finance Accounts Payable',
      'Profile Update': 'HR Master Data Team',
      'Employment Documents': 'HR Operations',
      'General HR Query': 'HR Business Partner',
      'IT Support': 'IT Helpdesk',
      Grievance: 'Confidential Ethics Committee',
    };
    const newTicket: SupportTicket = {
      id: `TKT-2026-${Math.floor(850 + Math.random() * 149)}`,
      employeeId,
      category: payload.category,
      subject: payload.subject,
      description: payload.description,
      priority: payload.priority,
      assignedDepartment: deptMap[payload.category],
      submittedDate: '2026-11-14',
      lastUpdated: '2026-11-14',
      status: 'Open',
      isConfidentialGrievance: isGrievance,
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderName: currentUser?.fullName ?? 'Employee',
          senderRole: 'Employee',
          timestamp: '14 Nov 2026, Just now',
          message: payload.description,
          attachmentName: payload.attachmentName,
        },
      ],
    };
    setAllTickets((prev) => [newTicket, ...prev]);
    return newTicket;
  };

  const replyTicket = (ticketId: string, message: string, attachmentName?: string) => {
    setAllTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              lastUpdated: '2026-11-14',
              status: 'In Progress',
              messages: [
                ...t.messages,
                {
                  id: `msg-${Date.now()}`,
                  senderName: currentUser?.fullName ?? 'Employee',
                  senderRole: 'Employee',
                  timestamp: '14 Nov 2026, Just now',
                  message,
                  attachmentName,
                },
              ],
            }
          : t
      )
    );
  };

  const closeTicket = (ticketId: string) => {
    setAllTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: 'Closed', lastUpdated: '2026-11-14' } : t))
    );
  };

  const notifications = useMemo(
    () => allNotifications.filter((n) => n.employeeId === employeeId || employeeId === 'emp-0814'),
    [allNotifications, employeeId]
  );

  const markNotificationRead = (id: string) => {
    setAllNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setAllNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setAllNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Manager Scoped Data (only returned when explicit permission is granted)
  const teamMembers = useMemo(
    () => (isManagerAuthorized ? DEMO_TEAM_MEMBERS : []),
    [isManagerAuthorized]
  );

  const teamLeaveRequests = useMemo(() => {
    if (!isManagerAuthorized || !currentUser) return [];
    return allLeaveRequests.filter(
      (r) => r.approverName === currentUser.fullName && r.employeeId !== currentUser.id
    );
  }, [allLeaveRequests, currentUser, isManagerAuthorized]);

  const teamRegularisations = useMemo(() => {
    if (!isManagerAuthorized || !currentUser) return [];
    return allRegularisations.filter(
      (r) => r.approverName === currentUser.fullName && r.employeeId !== currentUser.id
    );
  }, [allRegularisations, currentUser, isManagerAuthorized]);

  const reviewTeamLeave: PortalDataContextValue['reviewTeamLeave'] = (requestId, decision, note) => {
    if (!isManagerAuthorized || !currentUser) return;
    setAllLeaveRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: decision,
              timeline: [
                ...r.timeline,
                {
                  id: `mgr-${Date.now()}`,
                  label: `Manager Decision: ${decision}`,
                  actor: currentUser.fullName,
                  timestamp: '14 Nov 2026, Just now',
                  note,
                  status: decision === 'Rejected' ? 'rejected' : 'completed',
                },
              ],
            }
          : r
      )
    );
  };

  const reviewTeamRegularisation: PortalDataContextValue['reviewTeamRegularisation'] = (requestId, decision, note) => {
    if (!isManagerAuthorized || !currentUser) return;
    setAllRegularisations((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: decision,
              timeline: [
                ...r.timeline,
                {
                  id: `mgr-${Date.now()}`,
                  label: `Manager Decision: ${decision}`,
                  actor: currentUser.fullName,
                  timestamp: '14 Nov 2026, Just now',
                  note,
                  status: decision === 'Rejected' ? 'rejected' : 'completed',
                },
              ],
            }
          : r
      )
    );
  };

  return (
    <PortalDataContext.Provider
      value={{
        punchSession,
        punchIn,
        startBreak,
        endBreak,
        punchOut,
        attendanceRecords,
        regularisations,
        submitRegularisation,
        shiftSchedule: DEMO_SHIFT_SCHEDULE,
        holidays: DEMO_HOLIDAYS,
        leaveBalances,
        leaveRequests,
        submitLeaveRequest,
        cancelLeaveRequest,
        compOffs,
        requestCompOff,
        encashmentRequests,
        requestLeaveEncashment,
        payslips,
        taxDeclarations,
        addOrUpdateTaxDeclaration,
        previousEmployers,
        addPreviousEmployer,
        expenses,
        submitExpense,
        cancelExpense,
        loans,
        applyLoan,
        documents,
        uploadDocument,
        documentRequests,
        requestNewDocument,
        goals,
        updateGoalProgress,
        kpis,
        reviews,
        trainings,
        updateTrainingProgress,
        tickets,
        createTicket,
        replyTicket,
        closeTicket,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        notificationPrefs,
        setNotificationPrefs,
        upcomingEvents: DEMO_UPCOMING_EVENTS,
        loginHistory: DEMO_LOGIN_HISTORY,
        twoFactorEnabled,
        setTwoFactorEnabled,
        teamMembers,
        teamLeaveRequests,
        teamRegularisations,
        reviewTeamLeave,
        reviewTeamRegularisation,
      }}
    >
      {children}
    </PortalDataContext.Provider>
  );
}

export function usePortalData() {
  const ctx = useContext(PortalDataContext);
  if (!ctx) throw new Error('usePortalData must be used within PortalDataProvider');
  return ctx;
}
