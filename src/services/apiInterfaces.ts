import {
  AttendanceRecord,
  AttendanceRegularisationRequest,
  CompanyPolicyConfig,
  CompOffRecord,
  DocumentRequest,
  EmployeeDocument,
  EmployeeProfile,
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
  RequestStatus,
  ShiftScheduleItem,
  SupportTicket,
  TaxDeclarationItem,
  TeamMemberSummary,
  TrainingItem,
} from '../types/ess';

/**
 * Future Microservice Integration Contracts
 * Each interface maps to an independent PayFuse backend domain service
 * (Identity, Workforce/Attendance, Leave, Payroll, Tax, Expenses, Loans, Documents, Performance, Support, Notifications).
 */
export interface IEmployeeProfileService {
  getProfile(employeeId: string): Promise<EmployeeProfile>;
  updateEditableContact(employeeId: string, patch: Partial<EmployeeProfile>): Promise<EmployeeProfile>;
  submitProtectedChangeRequest(employeeId: string, fieldGroup: string, details: string): Promise<SupportTicket>;
}

export interface IAttendanceService {
  getAttendanceHistory(employeeId: string): Promise<AttendanceRecord[]>;
  getRegularisations(employeeId: string): Promise<AttendanceRegularisationRequest[]>;
  submitRegularisation(req: Omit<AttendanceRegularisationRequest, 'id' | 'submittedDate' | 'status' | 'timeline'>): Promise<AttendanceRegularisationRequest>;
  getShiftSchedule(employeeId: string): Promise<ShiftScheduleItem[]>;
  getHolidays(companyId: string): Promise<HolidayItem[]>;
}

export interface ILeaveService {
  getBalances(employeeId: string): Promise<LeaveBalanceItem[]>;
  getRequests(employeeId: string): Promise<LeaveRequest[]>;
  submitLeaveRequest(req: Omit<LeaveRequest, 'id' | 'submittedDate' | 'timeline'>): Promise<LeaveRequest>;
  cancelLeaveRequest(requestId: string): Promise<void>;
  getCompOffs(employeeId: string): Promise<CompOffRecord[]>;
  getEncashments(employeeId: string): Promise<LeaveEncashmentRequest[]>;
}

export interface IPayrollAndTaxService {
  getPayslips(employeeId: string): Promise<PayslipRecord[]>;
  getTaxDeclarations(employeeId: string): Promise<TaxDeclarationItem[]>;
  upsertTaxDeclaration(item: TaxDeclarationItem): Promise<TaxDeclarationItem>;
  getPreviousEmployers(employeeId: string): Promise<PreviousEmployerDetail[]>;
}

export interface IExpenseAndLoanService {
  getExpenses(employeeId: string): Promise<ExpenseClaim[]>;
  submitExpense(claim: Omit<ExpenseClaim, 'id' | 'submittedDate' | 'reimbursementStatus' | 'timeline'>): Promise<ExpenseClaim>;
  getLoans(employeeId: string): Promise<LoanRecord[]>;
  applyLoan(loan: Omit<LoanRecord, 'id' | 'submittedDate' | 'status' | 'schedule' | 'approvedAmount' | 'paidInstallments' | 'remainingInstallments' | 'outstandingBalance' | 'monthlyEmi'>): Promise<LoanRecord>;
}

export interface IDocumentAndPerformanceService {
  getDocuments(employeeId: string): Promise<EmployeeDocument[]>;
  requestDocument(req: Omit<DocumentRequest, 'id' | 'requestedDate' | 'status'>): Promise<DocumentRequest>;
  getGoals(employeeId: string): Promise<PerformanceGoal[]>;
  updateGoalProgress(goalId: string, progress: number): Promise<PerformanceGoal>;
  getKpis(employeeId: string): Promise<PerformanceKpi[]>;
  getReviews(employeeId: string): Promise<PerformanceReview[]>;
  getTrainings(employeeId: string): Promise<TrainingItem[]>;
}

export interface ISupportAndNotificationService {
  getTickets(employeeId: string): Promise<SupportTicket[]>;
  createTicket(ticket: Omit<SupportTicket, 'id' | 'submittedDate' | 'lastUpdated' | 'status' | 'messages'>): Promise<SupportTicket>;
  replyTicket(ticketId: string, message: string, attachmentName?: string): Promise<SupportTicket>;
  getNotifications(employeeId: string): Promise<NotificationItem[]>;
  markNotificationRead(notificationId: string): Promise<void>;
}

export interface IManagerTeamService {
  getAuthorizedTeam(managerId: string): Promise<TeamMemberSummary[]>;
  reviewLeaveRequest(requestId: string, decision: Extract<RequestStatus, 'Approved' | 'Rejected' | 'Changes Requested'>, note?: string): Promise<void>;
  reviewRegularisation(requestId: string, decision: Extract<RequestStatus, 'Approved' | 'Rejected' | 'Changes Requested'>, note?: string): Promise<void>;
}

export interface ICompanyPolicyService {
  getPolicy(companyId: string): Promise<CompanyPolicyConfig>;
  getLoginHistory(employeeId: string): Promise<LoginHistoryEntry[]>;
}
