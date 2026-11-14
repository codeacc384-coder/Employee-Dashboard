import {
  DEMO_ATTENDANCE,
  DEMO_COMPANIES,
  DEMO_COMP_OFFS,
  DEMO_DOCUMENTS,
  DEMO_EMPLOYEES,
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
} from '../mock-data/demoData';
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
import {
  IAttendanceService,
  ICompanyPolicyService,
  IDocumentAndPerformanceService,
  IEmployeeProfileService,
  IExpenseAndLoanService,
  ILeaveService,
  IManagerTeamService,
  IPayrollAndTaxService,
  ISupportAndNotificationService,
} from './apiInterfaces';

/**
 * Mock ESS Repository implementation of PayFuse microservice contracts.
 * Swap this module with HTTP/fetch adapters when connecting to production backend microservices.
 */
export class MockEssRepository
  implements
    IEmployeeProfileService,
    IAttendanceService,
    ILeaveService,
    IPayrollAndTaxService,
    IExpenseAndLoanService,
    IDocumentAndPerformanceService,
    ISupportAndNotificationService,
    IManagerTeamService,
    ICompanyPolicyService
{
  async getProfile(employeeId: string): Promise<EmployeeProfile> {
    const found = DEMO_EMPLOYEES[employeeId];
    if (!found) throw new Error(`Employee ${employeeId} not found`);
    return found;
  }

  async updateEditableContact(employeeId: string, patch: Partial<EmployeeProfile>): Promise<EmployeeProfile> {
    const curr = await this.getProfile(employeeId);
    return { ...curr, ...patch };
  }

  async submitProtectedChangeRequest(employeeId: string, fieldGroup: string, details: string): Promise<SupportTicket> {
    return {
      id: `TKT-${Date.now()}`,
      employeeId,
      category: 'Profile Update',
      subject: `Protected Update: ${fieldGroup}`,
      description: details,
      priority: 'Medium',
      assignedDepartment: 'HR Master Data Team',
      submittedDate: new Date().toISOString().slice(0, 10),
      lastUpdated: new Date().toISOString().slice(0, 10),
      status: 'Open',
      isConfidentialGrievance: false,
      messages: [],
    };
  }

  async getAttendanceHistory(employeeId: string): Promise<AttendanceRecord[]> {
    return DEMO_ATTENDANCE.filter((a) => a.employeeId === employeeId);
  }

  async getRegularisations(employeeId: string): Promise<AttendanceRegularisationRequest[]> {
    return DEMO_REGULARISATIONS.filter((r) => r.employeeId === employeeId);
  }

  async submitRegularisation(
    req: Omit<AttendanceRegularisationRequest, 'id' | 'submittedDate' | 'status' | 'timeline'>
  ): Promise<AttendanceRegularisationRequest> {
    return {
      ...req,
      id: `REG-${Date.now()}`,
      submittedDate: new Date().toISOString().slice(0, 10),
      status: 'Pending Approval',
      timeline: [],
    };
  }

  async getShiftSchedule(_employeeId: string): Promise<ShiftScheduleItem[]> {
    return DEMO_SHIFT_SCHEDULE;
  }

  async getHolidays(_companyId: string): Promise<HolidayItem[]> {
    return DEMO_HOLIDAYS;
  }

  async getBalances(employeeId: string): Promise<LeaveBalanceItem[]> {
    return DEMO_LEAVE_BALANCES[employeeId] ?? DEMO_LEAVE_BALANCES['emp-1042'];
  }

  async getRequests(employeeId: string): Promise<LeaveRequest[]> {
    return DEMO_LEAVE_REQUESTS.filter((r) => r.employeeId === employeeId);
  }

  async submitLeaveRequest(
    req: Omit<LeaveRequest, 'id' | 'submittedDate' | 'timeline'>
  ): Promise<LeaveRequest> {
    return {
      ...req,
      id: `LV-${Date.now()}`,
      submittedDate: new Date().toISOString().slice(0, 10),
      timeline: [],
    };
  }

  async cancelLeaveRequest(_requestId: string): Promise<void> {
    return;
  }

  async getCompOffs(employeeId: string): Promise<CompOffRecord[]> {
    return DEMO_COMP_OFFS.filter((c) => c.employeeId === employeeId);
  }

  async getEncashments(employeeId: string): Promise<LeaveEncashmentRequest[]> {
    return DEMO_ENCASHMENT_REQUESTS.filter((e) => e.employeeId === employeeId);
  }

  async getPayslips(employeeId: string): Promise<PayslipRecord[]> {
    return DEMO_PAYSLIPS.filter((p) => p.employeeId === employeeId);
  }

  async getTaxDeclarations(employeeId: string): Promise<TaxDeclarationItem[]> {
    return DEMO_TAX_DECLARATIONS.filter((t) => t.employeeId === employeeId);
  }

  async upsertTaxDeclaration(item: TaxDeclarationItem): Promise<TaxDeclarationItem> {
    return item;
  }

  async getPreviousEmployers(_employeeId: string): Promise<PreviousEmployerDetail[]> {
    return DEMO_PREVIOUS_EMPLOYERS;
  }

  async getExpenses(employeeId: string): Promise<ExpenseClaim[]> {
    return DEMO_EXPENSES.filter((e) => e.employeeId === employeeId);
  }

  async submitExpense(
    claim: Omit<ExpenseClaim, 'id' | 'submittedDate' | 'reimbursementStatus' | 'timeline'>
  ): Promise<ExpenseClaim> {
    return {
      ...claim,
      id: `EXP-${Date.now()}`,
      submittedDate: new Date().toISOString().slice(0, 10),
      reimbursementStatus: 'Not Processed',
      timeline: [],
    };
  }

  async getLoans(employeeId: string): Promise<LoanRecord[]> {
    return DEMO_LOANS.filter((l) => l.employeeId === employeeId);
  }

  async applyLoan(
    loan: Omit<
      LoanRecord,
      | 'id'
      | 'submittedDate'
      | 'status'
      | 'schedule'
      | 'approvedAmount'
      | 'paidInstallments'
      | 'remainingInstallments'
      | 'outstandingBalance'
      | 'monthlyEmi'
    >
  ): Promise<LoanRecord> {
    return {
      ...loan,
      id: `LN-${Date.now()}`,
      approvedAmount: 0,
      monthlyEmi: Math.round(loan.requestedAmount / loan.repaymentMonths),
      paidInstallments: 0,
      remainingInstallments: loan.repaymentMonths,
      outstandingBalance: loan.requestedAmount,
      submittedDate: new Date().toISOString().slice(0, 10),
      status: 'Pending Approval',
      schedule: [],
    };
  }

  async getDocuments(employeeId: string): Promise<EmployeeDocument[]> {
    return DEMO_DOCUMENTS.filter((d) => d.employeeId === employeeId);
  }

  async requestDocument(req: Omit<DocumentRequest, 'id' | 'requestedDate' | 'status'>): Promise<DocumentRequest> {
    return {
      ...req,
      id: `DREQ-${Date.now()}`,
      requestedDate: new Date().toISOString().slice(0, 10),
      status: 'Submitted',
    };
  }

  async getGoals(employeeId: string): Promise<PerformanceGoal[]> {
    return DEMO_GOALS.filter((g) => g.employeeId === employeeId);
  }

  async updateGoalProgress(goalId: string, progress: number): Promise<PerformanceGoal> {
    const goal = DEMO_GOALS.find((g) => g.id === goalId) ?? DEMO_GOALS[0];
    return { ...goal, progress };
  }

  async getKpis(employeeId: string): Promise<PerformanceKpi[]> {
    return DEMO_KPIS.filter((k) => k.employeeId === employeeId);
  }

  async getReviews(employeeId: string): Promise<PerformanceReview[]> {
    return DEMO_REVIEWS.filter((r) => r.employeeId === employeeId);
  }

  async getTrainings(employeeId: string): Promise<TrainingItem[]> {
    return DEMO_TRAININGS.filter((t) => t.employeeId === employeeId);
  }

  async getTickets(employeeId: string): Promise<SupportTicket[]> {
    return DEMO_TICKETS.filter((t) => t.employeeId === employeeId);
  }

  async createTicket(
    ticket: Omit<SupportTicket, 'id' | 'submittedDate' | 'lastUpdated' | 'status' | 'messages'>
  ): Promise<SupportTicket> {
    return {
      ...ticket,
      id: `TKT-${Date.now()}`,
      submittedDate: new Date().toISOString().slice(0, 10),
      lastUpdated: new Date().toISOString().slice(0, 10),
      status: 'Open',
      messages: [],
    };
  }

  async replyTicket(ticketId: string, _message: string): Promise<SupportTicket> {
    return DEMO_TICKETS.find((t) => t.id === ticketId) ?? DEMO_TICKETS[0];
  }

  async getNotifications(employeeId: string): Promise<NotificationItem[]> {
    return DEMO_NOTIFICATIONS.filter((n) => n.employeeId === employeeId);
  }

  async markNotificationRead(_notificationId: string): Promise<void> {
    return;
  }

  async getAuthorizedTeam(_managerId: string): Promise<TeamMemberSummary[]> {
    return DEMO_TEAM_MEMBERS;
  }

  async reviewLeaveRequest(
    _requestId: string,
    _decision: Extract<RequestStatus, 'Approved' | 'Rejected' | 'Changes Requested'>
  ): Promise<void> {
    return;
  }

  async reviewRegularisation(
    _requestId: string,
    _decision: Extract<RequestStatus, 'Approved' | 'Rejected' | 'Changes Requested'>
  ): Promise<void> {
    return;
  }

  async getPolicy(companyId: string): Promise<CompanyPolicyConfig> {
    return DEMO_COMPANIES[companyId] ?? DEMO_COMPANIES['comp-nexacore-it'];
  }

  async getLoginHistory(_employeeId: string): Promise<LoginHistoryEntry[]> {
    return DEMO_LOGIN_HISTORY;
  }
}

export const essRepository = new MockEssRepository();
