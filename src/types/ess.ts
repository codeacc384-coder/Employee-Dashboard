export type RequestStatus =
  | 'Draft'
  | 'Submitted'
  | 'Pending Approval'
  | 'Under Review'
  | 'Approved'
  | 'Accepted'
  | 'Rejected'
  | 'Changes Requested'
  | 'Resubmission Required'
  | 'Cancelled'
  | 'Paid'
  | 'Processing';

export type AttendanceDayStatus =
  | 'Present'
  | 'Absent'
  | 'Leave'
  | 'Holiday'
  | 'Weekly Off'
  | 'Half Day'
  | 'Missing Punch';

export type PunchState = 'Not Checked In' | 'Checked In' | 'On Break' | 'Checked Out';

export type IndustrySector = 'IT' | 'Manufacturing' | 'Retail' | 'Logistics' | 'Healthcare' | 'Construction' | 'BPO';

export interface CompanyPolicyConfig {
  companyId: string;
  companyName: string;
  companyAddress: string;
  sector: IndustrySector;
  workModel: 'Hybrid' | 'On-Site' | 'Rotational Shift';
  requireGpsForPunch: boolean;
  geofenceName?: string;
  geofenceRadiusMeters?: number;
  geofenceCoords?: { lat: number; lng: number };
  allowBreakPunch: boolean;
  allowCompOff: boolean;
  allowLeaveEncashment: boolean;
  allowBirthdayDisplay: boolean;
  currencySymbol: string;
  currencyCode: string;
  paydayDayOfMonth: number;
  shiftName: string;
  shiftStart: string;
  shiftEnd: string;
  weeklyOffDays: string[];
}

export interface EmployeeProfile {
  id: string;
  employeeCode: string;
  companyId: string;
  authorizedCompanyIds: string[];
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;
  avatarUrl: string;
  email: string;
  personalEmail: string;
  mobile: string;
  dob: string;
  gender: string;
  designation: string;
  department: string;
  reportingManagerId: string;
  reportingManagerName: string;
  branch: string;
  workLocation: string;
  employmentType: 'Full-Time Permanent' | 'Contract' | 'Probation';
  employmentStatus: 'Active' | 'On Notice' | 'Sabbatical';
  probationStatus: 'Confirmed' | 'In Probation';
  joiningDate: string;
  contractEndDate?: string;
  presentAddress: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
  };
  permanentAddress: {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
  };
  emergencyContacts: {
    id: string;
    name: string;
    relationship: string;
    mobile: string;
    alternateMobile?: string;
  }[];
  bankInfo: {
    bankName: string;
    accountNumberMasked: string;
    ifscCode: string;
    branchName: string;
    accountType: 'Savings' | 'Salary';
    verificationStatus: 'Verified' | 'Pending HR Verification';
  };
  statutoryInfo: {
    panMasked: string;
    uanNumber: string;
    pfAccountNumber: string;
    esiNumber?: string;
    taxRegime: 'New Regime' | 'Old Regime';
  };
  hasManagerRole: boolean;
  managerPermissions: ('VIEW_TEAM' | 'APPROVE_LEAVE' | 'APPROVE_ATTENDANCE' | 'VIEW_TEAM_PERFORMANCE')[];
  isDemoAccount: boolean;
  demoRoleLabel: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  shiftName: string;
  checkIn?: string; // HH:mm
  checkOut?: string; // HH:mm
  workingHours: number;
  breakMinutes: number;
  overtimeHours: number;
  isLate: boolean;
  status: AttendanceDayStatus;
  locationNote?: string;
}

export interface TimelineEvent {
  id: string;
  label: string;
  actor: string;
  timestamp: string;
  note?: string;
  status: 'completed' | 'current' | 'rejected';
}

export interface AttendanceRegularisationRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  attendanceDate: string;
  originalCheckIn: string;
  originalCheckOut: string;
  requestedCheckIn: string;
  requestedCheckOut: string;
  reason: string;
  attachmentName?: string;
  submittedDate: string;
  status: RequestStatus;
  approverName: string;
  timeline: TimelineEvent[];
}

export interface ShiftScheduleItem {
  id: string;
  date: string;
  dayName: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  breakDuration: string;
  isWeeklyOff: boolean;
  workMode: string;
}

export interface HolidayItem {
  id: string;
  date: string;
  name: string;
  type: 'National Holiday' | 'Festival' | 'Company Holiday';
  location: string;
}

export type LeaveTypeCode = 'EL' | 'CL' | 'SL' | 'CO';

export interface LeaveBalanceItem {
  code: LeaveTypeCode;
  name: string;
  entitlement: number;
  used: number;
  pending: number;
  available: number;
  color: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveTypeCode: LeaveTypeCode;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  durationType: 'Full Day' | 'First Half' | 'Second Half';
  days: number;
  reason: string;
  contactDuringLeave: string;
  attachmentName?: string;
  submittedDate: string;
  approverName: string;
  status: RequestStatus;
  timeline: TimelineEvent[];
}

export interface CompOffRecord {
  id: string;
  employeeId: string;
  earnedDate: string;
  reason: string;
  hoursWorked: number;
  daysCredited: number;
  expiryDate: string;
  status: 'Available' | 'Used' | 'Expired' | 'Pending Approval';
}

export interface LeaveEncashmentRequest {
  id: string;
  employeeId: string;
  daysRequested: number;
  estimatedAmount: number;
  submittedDate: string;
  status: RequestStatus;
}

export interface SalaryComponent {
  label: string;
  monthlyAmount: number;
  annualAmount: number;
  category: 'Earning' | 'Deduction' | 'Employer Contribution';
}

export interface PayslipRecord {
  id: string;
  employeeId: string;
  monthLabel: string; // e.g. October 2026
  monthKey: string; // YYYY-MM
  financialYear: string;
  payDate?: string;
  paymentStatus: 'Paid' | 'Processing' | 'Scheduled';
  payslipStatus: 'Published' | 'Draft';
  earnings: {
    basic: number;
    hra: number;
    da: number;
    specialAllowance: number;
    overtime: number;
    incentives: number;
    bonus: number;
    otherEarnings: number;
  };
  deductions: {
    pf: number;
    esi: number;
    professionalTax: number;
    tds: number;
    lop: number;
    loanEmi: number;
    otherDeductions: number;
  };
  employerContributions: {
    employerPf: number;
    employerEsi: number;
    gratuityProvision: number;
  };
  grossEarnings: number;
  totalDeductions: number;
  netPay: number;
  paidDays: number;
  lopDays: number;
}

export interface TaxDeclarationItem {
  id: string;
  employeeId: string;
  financialYear: string;
  section: 'Section 80C' | 'Section 80D' | 'HRA Exemption' | 'Home Loan Interest (Sec 24)' | 'NPS (80CCD 1B)' | 'Other Eligible Deductions';
  description: string;
  maxLimit: number;
  declaredAmount: number;
  actualAmount: number;
  supportingDocName?: string;
  submittedDate?: string;
  status: RequestStatus;
  reviewerNote?: string;
}

export interface PreviousEmployerDetail {
  id: string;
  employerName: string;
  periodFrom: string;
  periodTo: string;
  grossSalaryReceived: number;
  taxDeducted: number;
  form16FileName?: string;
  status: RequestStatus;
}

export type ExpenseCategory =
  | 'Travel'
  | 'Fuel'
  | 'Accommodation'
  | 'Food'
  | 'Internet'
  | 'Mobile'
  | 'Business Meetings'
  | 'Other Approved Expenses';

export interface ExpenseClaim {
  id: string;
  employeeId: string;
  category: ExpenseCategory;
  expenseDate: string;
  amount: number;
  currency: string;
  description: string;
  costCentre?: string;
  receiptFileName?: string;
  paymentPreference: 'Bank Transfer (Salary Cycle)' | 'Direct IMPS Reimbursement';
  submittedDate: string;
  approverName: string;
  status: RequestStatus;
  reimbursementStatus: 'Not Processed' | 'Queued for Payout' | 'Paid';
  approvedAmount?: number;
  paymentDate?: string;
  transactionRef?: string;
  timeline: TimelineEvent[];
}

export interface LoanInstallment {
  installmentNumber: number;
  dueDate: string;
  installmentAmount: number;
  principalComponent: number;
  outstandingBalance: number;
  paymentStatus: 'Paid' | 'Upcoming' | 'Scheduled';
}

export interface LoanRecord {
  id: string;
  employeeId: string;
  loanType: 'Employee Personal Loan' | 'Salary Advance' | 'Medical Emergency Loan' | 'Relocation Advance';
  requestedAmount: number;
  approvedAmount: number;
  purpose: string;
  repaymentMonths: number;
  monthlyEmi: number;
  paidInstallments: number;
  remainingInstallments: number;
  outstandingBalance: number;
  submittedDate: string;
  supportingDocName?: string;
  status: RequestStatus;
  schedule: LoanInstallment[];
}

export type DocumentCategory =
  | 'Employment Documents'
  | 'Identity Documents'
  | 'Salary Documents'
  | 'Tax Documents'
  | 'Performance Documents'
  | 'Other Documents';

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  name: string;
  docType: string;
  category: DocumentCategory;
  uploadedDate: string;
  issuedDate?: string;
  expiryDate?: string;
  verificationStatus: 'Verified' | 'Pending Verification' | 'Official Issued';
  fileSize: string;
  accessScope: 'Private (Employee Only)';
  previewSummary: string;
}

export interface DocumentRequest {
  id: string;
  employeeId: string;
  documentType: string;
  purpose: string;
  requestedDate: string;
  status: RequestStatus;
}

export interface PerformanceGoal {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  targetMetric: string;
  progress: number;
  dueDate: string;
  status: 'On Track' | 'At Risk' | 'Completed' | 'Not Started';
  weightage: number;
}

export interface PerformanceKpi {
  id: string;
  employeeId: string;
  name: string;
  target: string;
  actual: string;
  achievementPct: number;
  reviewPeriod: string;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  cycleName: string;
  reviewerName: string;
  reviewDate: string;
  rating: string;
  summaryFeedback: string;
  status: 'Completed' | 'Self-Review Due' | 'Manager Review';
}

export interface TrainingItem {
  id: string;
  employeeId: string;
  title: string;
  provider: string;
  assignedDate: string;
  completionDate?: string;
  progress: number;
  hasCertificate: boolean;
  status: 'Completed' | 'In Progress' | 'Assigned';
}

export type SupportCategory =
  | 'Payroll Issue'
  | 'Payslip Issue'
  | 'Attendance Issue'
  | 'Leave Issue'
  | 'Tax Issue'
  | 'Reimbursement Issue'
  | 'Profile Update'
  | 'Employment Documents'
  | 'General HR Query'
  | 'IT Support'
  | 'Grievance';

export interface SupportMessage {
  id: string;
  senderName: string;
  senderRole: 'Employee' | 'HR Support' | 'Payroll Desk' | 'IT Desk' | 'Ethics Committee';
  timestamp: string;
  message: string;
  attachmentName?: string;
}

export interface SupportTicket {
  id: string;
  employeeId: string;
  category: SupportCategory;
  subject: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  assignedDepartment: string;
  submittedDate: string;
  lastUpdated: string;
  status: 'Open' | 'In Progress' | 'Awaiting Employee' | 'Resolved' | 'Closed';
  isConfidentialGrievance: boolean;
  messages: SupportMessage[];
}

export type NotificationCategory =
  | 'Payroll'
  | 'Attendance'
  | 'Leave'
  | 'Tax'
  | 'Reimbursements'
  | 'Documents'
  | 'Performance'
  | 'Company Announcements'
  | 'General';

export interface NotificationItem {
  id: string;
  employeeId: string;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  targetRoute: string;
}

export interface UpcomingEventItem {
  id: string;
  title: string;
  date: string;
  type: 'Holiday' | 'Birthday' | 'Anniversary' | 'Training' | 'Review' | 'Announcement';
  subtitle: string;
}

export interface TeamMemberSummary {
  employeeId: string;
  employeeCode: string;
  fullName: string;
  avatarUrl: string;
  designation: string;
  department: string;
  shiftName: string;
  todayStatus: AttendanceDayStatus;
  checkInTime?: string;
  locationMode: 'Office' | 'Remote' | 'Site';
  goalCompletionAvg: number;
  latestReviewStatus: string;
}

export interface LoginHistoryEntry {
  id: string;
  timestamp: string;
  device: string;
  browser: string;
  location: string;
  ipMasked: string;
  status: 'Success' | 'Blocked Attempt';
}
