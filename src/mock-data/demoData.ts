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
  ShiftScheduleItem,
  SupportTicket,
  TaxDeclarationItem,
  TeamMemberSummary,
  TrainingItem,
  UpcomingEventItem,
} from '../types/ess';

export const DEMO_COMPANIES: Record<string, CompanyPolicyConfig> = {
  'comp-nexacore-it': {
    companyId: 'comp-nexacore-it',
    companyName: 'NexaCore Technologies Pvt. Ltd.',
    companyAddress: 'Tower B, Outer Ring Road, Bellandur, Bengaluru 560103',
    sector: 'IT',
    workModel: 'Hybrid',
    requireGpsForPunch: false,
    geofenceName: 'Bengaluru Tech Campus',
    geofenceRadiusMeters: 250,
    geofenceCoords: { lat: 12.9279, lng: 77.6762 },
    allowBreakPunch: true,
    allowCompOff: true,
    allowLeaveEncashment: true,
    allowBirthdayDisplay: true,
    currencySymbol: '₹',
    currencyCode: 'INR',
    paydayDayOfMonth: 30,
    shiftName: 'General Flexible Shift',
    shiftStart: '09:30',
    shiftEnd: '18:30',
    weeklyOffDays: ['Saturday', 'Sunday'],
  },
  'comp-nexacore-ops': {
    companyId: 'comp-nexacore-ops',
    companyName: 'NexaCore Fulfillment & Logistics Ltd.',
    companyAddress: 'Plot 14, Chakan Industrial Area Phase II, Pune 410501',
    sector: 'Logistics',
    workModel: 'On-Site',
    requireGpsForPunch: true,
    geofenceName: 'Chakan Hub Gate A',
    geofenceRadiusMeters: 150,
    geofenceCoords: { lat: 18.7606, lng: 73.8636 },
    allowBreakPunch: true,
    allowCompOff: true,
    allowLeaveEncashment: false,
    allowBirthdayDisplay: false,
    currencySymbol: '₹',
    currencyCode: 'INR',
    paydayDayOfMonth: 5,
    shiftName: 'Morning Operations Shift (A)',
    shiftStart: '08:00',
    shiftEnd: '17:00',
    weeklyOffDays: ['Sunday'],
  },
};

export const DEMO_EMPLOYEES: Record<string, EmployeeProfile> = {
  'emp-1042': {
    id: 'emp-1042',
    employeeCode: 'NC-1042',
    companyId: 'comp-nexacore-it',
    authorizedCompanyIds: ['comp-nexacore-it', 'comp-nexacore-ops'],
    firstName: 'Aarav',
    middleName: 'Rajesh',
    lastName: 'Mehta',
    fullName: 'Aarav Mehta',
    avatarUrl: '/src/assets/images/avatar_employee_aarav_1794669864488.jpg',
    email: 'aarav.mehta@nexacore.example',
    personalEmail: 'aarav.mehta.personal@example.com',
    mobile: '+91 98450 32814',
    dob: '1995-07-18',
    gender: 'Male',
    designation: 'Senior Product Engineer',
    department: 'Platform Engineering',
    reportingManagerId: 'emp-0814',
    reportingManagerName: 'Priya Nair',
    branch: 'Bengaluru HQ',
    workLocation: 'Bengaluru Tech Campus (Hybrid)',
    employmentType: 'Full-Time Permanent',
    employmentStatus: 'Active',
    probationStatus: 'Confirmed',
    joiningDate: '2023-03-15',
    presentAddress: {
      line1: 'Apt 402, Skylark Residency, HSR Layout Sector 2',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560102',
    },
    permanentAddress: {
      line1: '24, Gulmohar Enclave, Civil Lines',
      city: 'Jaipur',
      state: 'Rajasthan',
      postalCode: '302006',
    },
    emergencyContacts: [
      {
        id: 'ec-1',
        name: 'Kavita Mehta',
        relationship: 'Mother',
        mobile: '+91 98290 11204',
        alternateMobile: '+91 141 2224810',
      },
      {
        id: 'ec-2',
        name: 'Siddharth Mehta',
        relationship: 'Brother',
        mobile: '+91 98290 77812',
      },
    ],
    bankInfo: {
      bankName: 'HDFC Bank Ltd.',
      accountNumberMasked: 'XXXX XXXX 4829',
      ifscCode: 'HDFC0001204',
      branchName: 'HSR Layout Sector 1, Bengaluru',
      accountType: 'Salary',
      verificationStatus: 'Verified',
    },
    statutoryInfo: {
      panMasked: 'ABCDE••••F',
      uanNumber: '101482930411',
      pfAccountNumber: 'KA/BLR/0048291/000/1042',
      taxRegime: 'New Regime',
    },
    hasManagerRole: false,
    managerPermissions: [],
    isDemoAccount: true,
    demoRoleLabel: 'Demo Employee',
  },
  'emp-0814': {
    id: 'emp-0814',
    employeeCode: 'NC-0814',
    companyId: 'comp-nexacore-it',
    authorizedCompanyIds: ['comp-nexacore-it', 'comp-nexacore-ops'],
    firstName: 'Priya',
    lastName: 'Nair',
    fullName: 'Priya Nair',
    avatarUrl: '/src/assets/images/avatar_manager_priya_1794669865432.jpg',
    email: 'priya.nair@nexacore.example',
    personalEmail: 'priya.nair.home@example.com',
    mobile: '+91 98861 44019',
    dob: '1989-11-28',
    gender: 'Female',
    designation: 'Engineering Manager',
    department: 'Platform Engineering',
    reportingManagerId: 'emp-0102',
    reportingManagerName: 'Sanjay Deshmukh (VP Engineering)',
    branch: 'Bengaluru HQ',
    workLocation: 'Bengaluru Tech Campus (Hybrid)',
    employmentType: 'Full-Time Permanent',
    employmentStatus: 'Active',
    probationStatus: 'Confirmed',
    joiningDate: '2020-08-10',
    presentAddress: {
      line1: '18, Palm Meadows Phase II, Whitefield',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560066',
    },
    permanentAddress: {
      line1: '12, Panampilly Nagar, Ernakulam',
      city: 'Kochi',
      state: 'Kerala',
      postalCode: '682036',
    },
    emergencyContacts: [
      {
        id: 'ec-m1',
        name: 'Arjun Menon',
        relationship: 'Spouse',
        mobile: '+91 98861 99201',
      },
    ],
    bankInfo: {
      bankName: 'ICICI Bank Ltd.',
      accountNumberMasked: 'XXXX XXXX 9103',
      ifscCode: 'ICIC0000402',
      branchName: 'Whitefield Main Road, Bengaluru',
      accountType: 'Salary',
      verificationStatus: 'Verified',
    },
    statutoryInfo: {
      panMasked: 'FGHIJ••••K',
      uanNumber: '100938172645',
      pfAccountNumber: 'KA/BLR/0048291/000/0814',
      taxRegime: 'Old Regime',
    },
    hasManagerRole: true,
    managerPermissions: ['VIEW_TEAM', 'APPROVE_LEAVE', 'APPROVE_ATTENDANCE', 'VIEW_TEAM_PERFORMANCE'],
    isDemoAccount: true,
    demoRoleLabel: 'Demo Reporting Manager',
  },
};

export const DEMO_HOLIDAYS: HolidayItem[] = [
  { id: 'hol-1', date: '2026-08-15', name: 'Independence Day', type: 'National Holiday', location: 'All Locations' },
  { id: 'hol-2', date: '2026-10-02', name: 'Gandhi Jayanti', type: 'National Holiday', location: 'All Locations' },
  { id: 'hol-3', date: '2026-10-20', name: 'Dussehra', type: 'Festival', location: 'All Locations' },
  { id: 'hol-4', date: '2026-11-09', name: 'Diwali (Deepavali)', type: 'Festival', location: 'All Locations' },
  { id: 'hol-5', date: '2026-11-24', name: 'Guru Nanak Jayanti', type: 'Company Holiday', location: 'Bengaluru & Pune' },
  { id: 'hol-6', date: '2026-12-25', name: 'Christmas Day', type: 'National Holiday', location: 'All Locations' },
  { id: 'hol-7', date: '2027-01-01', name: 'New Year’s Day', type: 'Company Holiday', location: 'All Locations' },
  { id: 'hol-8', date: '2027-01-26', name: 'Republic Day', type: 'National Holiday', location: 'All Locations' },
];

const HOLIDAY_DATE_SET = new Set(DEMO_HOLIDAYS.map((h) => h.date));

function generateSixMonthsAttendance(employeeId: string, shiftName: string): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const start = new Date('2026-06-01T00:00:00');
  const end = new Date('2026-11-13T00:00:00'); // up to yesterday (today is 2026-11-14 Saturday)

  const leaveDates = new Set(
    employeeId === 'emp-1042'
      ? ['2026-07-14', '2026-07-15', '2026-09-10', '2026-11-10']
      : ['2026-08-21', '2026-10-12']
  );
  const missingPunchDates = new Set(employeeId === 'emp-1042' ? ['2026-11-05'] : []);
  const halfDayDates = new Set(employeeId === 'emp-1042' ? ['2026-09-25'] : []);
  const absentDates = new Set(employeeId === 'emp-1042' ? ['2026-06-19'] : []);

  const cursor = new Date(start);
  let idx = 1;
  while (cursor <= end) {
    const iso = cursor.toISOString().slice(0, 10);
    const day = cursor.getDay();
    const isWeekend = day === 0 || day === 6;

    if (HOLIDAY_DATE_SET.has(iso)) {
      records.push({
        id: `att-${employeeId}-${idx++}`,
        employeeId,
        date: iso,
        shiftName,
        workingHours: 0,
        breakMinutes: 0,
        overtimeHours: 0,
        isLate: false,
        status: 'Holiday',
      });
    } else if (isWeekend) {
      records.push({
        id: `att-${employeeId}-${idx++}`,
        employeeId,
        date: iso,
        shiftName,
        workingHours: 0,
        breakMinutes: 0,
        overtimeHours: 0,
        isLate: false,
        status: 'Weekly Off',
      });
    } else if (leaveDates.has(iso)) {
      records.push({
        id: `att-${employeeId}-${idx++}`,
        employeeId,
        date: iso,
        shiftName,
        workingHours: 0,
        breakMinutes: 0,
        overtimeHours: 0,
        isLate: false,
        status: 'Leave',
      });
    } else if (absentDates.has(iso)) {
      records.push({
        id: `att-${employeeId}-${idx++}`,
        employeeId,
        date: iso,
        shiftName,
        workingHours: 0,
        breakMinutes: 0,
        overtimeHours: 0,
        isLate: false,
        status: 'Absent',
      });
    } else if (missingPunchDates.has(iso)) {
      records.push({
        id: `att-${employeeId}-${idx++}`,
        employeeId,
        date: iso,
        shiftName,
        checkIn: '09:34',
        checkOut: undefined,
        workingHours: 0,
        breakMinutes: 30,
        overtimeHours: 0,
        isLate: false,
        status: 'Missing Punch',
        locationNote: 'Bengaluru Tech Campus',
      });
    } else if (halfDayDates.has(iso)) {
      records.push({
        id: `att-${employeeId}-${idx++}`,
        employeeId,
        date: iso,
        shiftName,
        checkIn: '09:28',
        checkOut: '13:45',
        workingHours: 4.28,
        breakMinutes: 0,
        overtimeHours: 0,
        isLate: false,
        status: 'Half Day',
        locationNote: 'Remote (Approved Hybrid)',
      });
    } else {
      const seed = cursor.getDate() + cursor.getMonth();
      const isLate = seed % 11 === 0;
      const inMin = isLate ? 48 : 22 + (seed % 14);
      const outHour = seed % 7 === 0 ? 19 : 18;
      const outMin = 25 + (seed % 25);
      const overtimeHours = outHour === 19 ? Number(((outMin + 30) / 60).toFixed(2)) : 0;
      const workingHours = Number((8.5 + overtimeHours - (isLate ? 0.25 : 0)).toFixed(2));
      records.push({
        id: `att-${employeeId}-${idx++}`,
        employeeId,
        date: iso,
        shiftName,
        checkIn: `09:${String(inMin).padStart(2, '0')}`,
        checkOut: `${outHour}:${String(outMin).padStart(2, '0')}`,
        workingHours,
        breakMinutes: 40,
        overtimeHours,
        isLate,
        status: 'Present',
        locationNote: seed % 2 === 0 ? 'Bengaluru Tech Campus' : 'Remote (Hybrid)',
      });
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return records.reverse();
}

export const DEMO_ATTENDANCE: AttendanceRecord[] = [
  ...generateSixMonthsAttendance('emp-1042', 'General Flexible Shift'),
  ...generateSixMonthsAttendance('emp-0814', 'General Flexible Shift'),
];

export const DEMO_REGULARISATIONS: AttendanceRegularisationRequest[] = [
  {
    id: 'REG-2026-089',
    employeeId: 'emp-1042',
    employeeName: 'Aarav Mehta',
    attendanceDate: '2026-11-05',
    originalCheckIn: '09:34',
    originalCheckOut: 'Missing',
    requestedCheckIn: '09:34',
    requestedCheckOut: '18:42',
    reason: 'Biometric turnstile offline at exit gate during evening maintenance window.',
    attachmentName: 'gate_security_slip_nov05.pdf',
    submittedDate: '2026-11-06',
    status: 'Pending Approval',
    approverName: 'Priya Nair',
    timeline: [
      { id: 't1', label: 'Request Submitted', actor: 'Aarav Mehta', timestamp: '06 Nov 2026, 10:15 AM', status: 'completed' },
      { id: 't2', label: 'Pending Manager Review', actor: 'Priya Nair', timestamp: 'Awaiting Action', status: 'current' },
    ],
  },
  {
    id: 'REG-2026-064',
    employeeId: 'emp-1042',
    employeeName: 'Aarav Mehta',
    attendanceDate: '2026-09-18',
    originalCheckIn: '10:12',
    originalCheckOut: '18:30',
    requestedCheckIn: '09:30',
    requestedCheckOut: '18:30',
    reason: 'Early client architecture sync from transit prior to campus badge swipe.',
    submittedDate: '2026-09-19',
    status: 'Approved',
    approverName: 'Priya Nair',
    timeline: [
      { id: 't1', label: 'Request Submitted', actor: 'Aarav Mehta', timestamp: '19 Sep 2026, 09:40 AM', status: 'completed' },
      { id: 't2', label: 'Approved by Manager', actor: 'Priya Nair', timestamp: '19 Sep 2026, 02:18 PM', note: 'Verified with client call log.', status: 'completed' },
    ],
  },
];

export const DEMO_SHIFT_SCHEDULE: ShiftScheduleItem[] = [
  { id: 'sh-1', date: '2026-11-16', dayName: 'Monday', shiftName: 'General Flexible Shift', startTime: '09:30', endTime: '18:30', breakDuration: '45 mins', isWeeklyOff: false, workMode: 'Bengaluru Campus' },
  { id: 'sh-2', date: '2026-11-17', dayName: 'Tuesday', shiftName: 'General Flexible Shift', startTime: '09:30', endTime: '18:30', breakDuration: '45 mins', isWeeklyOff: false, workMode: 'Bengaluru Campus' },
  { id: 'sh-3', date: '2026-11-18', dayName: 'Wednesday', shiftName: 'General Flexible Shift', startTime: '09:30', endTime: '18:30', breakDuration: '45 mins', isWeeklyOff: false, workMode: 'Remote (Hybrid)' },
  { id: 'sh-4', date: '2026-11-19', dayName: 'Thursday', shiftName: 'General Flexible Shift', startTime: '09:30', endTime: '18:30', breakDuration: '45 mins', isWeeklyOff: false, workMode: 'Bengaluru Campus' },
  { id: 'sh-5', date: '2026-11-20', dayName: 'Friday', shiftName: 'General Flexible Shift', startTime: '09:30', endTime: '18:30', breakDuration: '45 mins', isWeeklyOff: false, workMode: 'Remote (Hybrid)' },
  { id: 'sh-6', date: '2026-11-21', dayName: 'Saturday', shiftName: 'Weekly Off', startTime: '—', endTime: '—', breakDuration: '—', isWeeklyOff: true, workMode: 'Off' },
  { id: 'sh-7', date: '2026-11-22', dayName: 'Sunday', shiftName: 'Weekly Off', startTime: '—', endTime: '—', breakDuration: '—', isWeeklyOff: true, workMode: 'Off' },
];

export const DEMO_LEAVE_BALANCES: Record<string, LeaveBalanceItem[]> = {
  'emp-1042': [
    { code: 'EL', name: 'Earned Leave', entitlement: 18, used: 4, pending: 2, available: 12, color: '#7050F5' },
    { code: 'CL', name: 'Casual Leave', entitlement: 8, used: 3, pending: 0, available: 5, color: '#478BFA' },
    { code: 'SL', name: 'Sick Leave', entitlement: 8, used: 1.5, pending: 0, available: 6.5, color: '#16A36A' },
    { code: 'CO', name: 'Compensatory Off', entitlement: 2, used: 1, pending: 0, available: 1, color: '#E9A23B' },
  ],
  'emp-0814': [
    { code: 'EL', name: 'Earned Leave', entitlement: 22, used: 5, pending: 0, available: 17, color: '#7050F5' },
    { code: 'CL', name: 'Casual Leave', entitlement: 8, used: 2, pending: 0, available: 6, color: '#478BFA' },
    { code: 'SL', name: 'Sick Leave', entitlement: 8, used: 1, pending: 0, available: 7, color: '#16A36A' },
    { code: 'CO', name: 'Compensatory Off', entitlement: 1, used: 0, pending: 0, available: 1, color: '#E9A23B' },
  ],
};

export const DEMO_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'LV-2026-312',
    employeeId: 'emp-1042',
    employeeName: 'Aarav Mehta',
    leaveTypeCode: 'EL',
    leaveTypeName: 'Earned Leave',
    startDate: '2026-12-23',
    endDate: '2026-12-24',
    durationType: 'Full Day',
    days: 2,
    reason: 'Year-end family travel to Jaipur.',
    contactDuringLeave: '+91 98450 32814',
    submittedDate: '2026-11-11',
    approverName: 'Priya Nair',
    status: 'Pending Approval',
    timeline: [
      { id: 'l1', label: 'Leave Application Submitted', actor: 'Aarav Mehta', timestamp: '11 Nov 2026, 11:04 AM', status: 'completed' },
      { id: 'l2', label: 'Manager Review', actor: 'Priya Nair', timestamp: 'Pending', status: 'current' },
    ],
  },
  {
    id: 'LV-2026-288',
    employeeId: 'emp-1042',
    employeeName: 'Aarav Mehta',
    leaveTypeCode: 'CL',
    leaveTypeName: 'Casual Leave',
    startDate: '2026-11-10',
    endDate: '2026-11-10',
    durationType: 'Full Day',
    days: 1,
    reason: 'Post-Diwali family travel.',
    contactDuringLeave: '+91 98450 32814',
    submittedDate: '2026-11-02',
    approverName: 'Priya Nair',
    status: 'Approved',
    timeline: [
      { id: 'l1', label: 'Leave Application Submitted', actor: 'Aarav Mehta', timestamp: '02 Nov 2026, 04:12 PM', status: 'completed' },
      { id: 'l2', label: 'Approved by Reporting Manager', actor: 'Priya Nair', timestamp: '03 Nov 2026, 10:05 AM', status: 'completed' },
    ],
  },
  {
    id: 'LV-2026-205',
    employeeId: 'emp-1042',
    employeeName: 'Aarav Mehta',
    leaveTypeCode: 'EL',
    leaveTypeName: 'Earned Leave',
    startDate: '2026-07-14',
    endDate: '2026-07-15',
    durationType: 'Full Day',
    days: 2,
    reason: 'Personal family commitment.',
    contactDuringLeave: '+91 98450 32814',
    submittedDate: '2026-07-04',
    approverName: 'Priya Nair',
    status: 'Approved',
    timeline: [
      { id: 'l1', label: 'Leave Application Submitted', actor: 'Aarav Mehta', timestamp: '04 Jul 2026, 09:20 AM', status: 'completed' },
      { id: 'l2', label: 'Approved by Reporting Manager', actor: 'Priya Nair', timestamp: '04 Jul 2026, 03:45 PM', status: 'completed' },
    ],
  },
  // Team requests visible to Manager Priya Nair
  {
    id: 'LV-2026-318',
    employeeId: 'emp-1089',
    employeeName: 'Rohan Kulkarni',
    leaveTypeCode: 'EL',
    leaveTypeName: 'Earned Leave',
    startDate: '2026-11-19',
    endDate: '2026-11-20',
    durationType: 'Full Day',
    days: 2,
    reason: 'Attending sibling wedding in Pune.',
    contactDuringLeave: '+91 97654 11890',
    submittedDate: '2026-11-12',
    approverName: 'Priya Nair',
    status: 'Pending Approval',
    timeline: [
      { id: 'l1', label: 'Leave Application Submitted', actor: 'Rohan Kulkarni', timestamp: '12 Nov 2026, 01:30 PM', status: 'completed' },
      { id: 'l2', label: 'Manager Review', actor: 'Priya Nair', timestamp: 'Pending', status: 'current' },
    ],
  },
  {
    id: 'LV-2026-320',
    employeeId: 'emp-1104',
    employeeName: 'Ananya Sharma',
    leaveTypeCode: 'SL',
    leaveTypeName: 'Sick Leave',
    startDate: '2026-11-16',
    endDate: '2026-11-16',
    durationType: 'Full Day',
    days: 1,
    reason: 'Scheduled dental procedure and recovery.',
    contactDuringLeave: '+91 98112 77345',
    submittedDate: '2026-11-13',
    approverName: 'Priya Nair',
    status: 'Pending Approval',
    timeline: [
      { id: 'l1', label: 'Leave Application Submitted', actor: 'Ananya Sharma', timestamp: '13 Nov 2026, 05:10 PM', status: 'completed' },
      { id: 'l2', label: 'Manager Review', actor: 'Priya Nair', timestamp: 'Pending', status: 'current' },
    ],
  },
];

export const DEMO_COMP_OFFS: CompOffRecord[] = [
  {
    id: 'CO-2026-14',
    employeeId: 'emp-1042',
    earnedDate: '2026-10-18',
    reason: 'Production release deployment & database migration (Sunday window)',
    hoursWorked: 7.5,
    daysCredited: 1,
    expiryDate: '2027-01-16',
    status: 'Available',
  },
  {
    id: 'CO-2026-09',
    employeeId: 'emp-1042',
    earnedDate: '2026-08-09',
    reason: 'Weekend DR failover verification drill',
    hoursWorked: 8,
    daysCredited: 1,
    expiryDate: '2026-11-07',
    status: 'Used',
  },
];

export const DEMO_ENCASHMENT_REQUESTS: LeaveEncashmentRequest[] = [
  {
    id: 'ENC-2026-04',
    employeeId: 'emp-1042',
    daysRequested: 3,
    estimatedAmount: 14250,
    submittedDate: '2026-09-28',
    status: 'Paid',
  },
];

function generateTwelveMonthsPayslips(employeeId: string): PayslipRecord[] {
  const isManager = employeeId === 'emp-0814';
  const basic = isManager ? 115000 : 72000;
  const hra = isManager ? 57500 : 36000;
  const specialAllowance = isManager ? 62500 : 34000;
  const pf = isManager ? 13800 : 8640;
  const pt = 200;
  const tdsBase = isManager ? 38400 : 12800;
  const loanEmi = isManager ? 0 : 8500;

  const months = [
    { key: '2026-10', label: 'October 2026', fy: 'FY 2026-27', payDate: '2026-10-30', bonus: 15000, incentives: 0, overtime: 0 },
    { key: '2026-09', label: 'September 2026', fy: 'FY 2026-27', payDate: '2026-09-30', bonus: 0, incentives: 14250, overtime: 0 },
    { key: '2026-08', label: 'August 2026', fy: 'FY 2026-27', payDate: '2026-08-31', bonus: 0, incentives: 0, overtime: 2400 },
    { key: '2026-07', label: 'July 2026', fy: 'FY 2026-27', payDate: '2026-07-31', bonus: 0, incentives: 8000, overtime: 0 },
    { key: '2026-06', label: 'June 2026', fy: 'FY 2026-27', payDate: '2026-06-30', bonus: 0, incentives: 0, overtime: 0 },
    { key: '2026-05', label: 'May 2026', fy: 'FY 2026-27', payDate: '2026-05-30', bonus: 0, incentives: 0, overtime: 1800 },
    { key: '2026-04', label: 'April 2026', fy: 'FY 2026-27', payDate: '2026-04-30', bonus: 35000, incentives: 0, overtime: 0 },
    { key: '2026-03', label: 'March 2026', fy: 'FY 2025-26', payDate: '2026-03-31', bonus: 0, incentives: 12000, overtime: 0 },
    { key: '2026-02', label: 'February 2026', fy: 'FY 2025-26', payDate: '2026-02-28', bonus: 0, incentives: 0, overtime: 0 },
    { key: '2026-01', label: 'January 2026', fy: 'FY 2025-26', payDate: '2026-01-31', bonus: 0, incentives: 0, overtime: 0 },
    { key: '2025-12', label: 'December 2025', fy: 'FY 2025-26', payDate: '2025-12-31', bonus: 20000, incentives: 0, overtime: 0 },
    { key: '2025-11', label: 'November 2025', fy: 'FY 2025-26', payDate: '2025-11-29', bonus: 0, incentives: 0, overtime: 0 },
  ];

  return months.map((m) => {
    const grossEarnings = basic + hra + specialAllowance + m.overtime + m.incentives + m.bonus;
    const tds = tdsBase + Math.round((m.bonus + m.incentives) * 0.2);
    const totalDeductions = pf + pt + tds + loanEmi;
    const netPay = grossEarnings - totalDeductions;

    return {
      id: `PAY-${employeeId}-${m.key}`,
      employeeId,
      monthLabel: m.label,
      monthKey: m.key,
      financialYear: m.fy,
      payDate: m.payDate,
      paymentStatus: 'Paid',
      payslipStatus: 'Published',
      earnings: {
        basic,
        hra,
        da: 0,
        specialAllowance,
        overtime: m.overtime,
        incentives: m.incentives,
        bonus: m.bonus,
        otherEarnings: 0,
      },
      deductions: {
        pf,
        esi: 0,
        professionalTax: pt,
        tds,
        lop: 0,
        loanEmi,
        otherDeductions: 0,
      },
      employerContributions: {
        employerPf: pf,
        employerEsi: 0,
        gratuityProvision: Math.round(basic * 0.0481),
      },
      grossEarnings,
      totalDeductions,
      netPay,
      paidDays: 30,
      lopDays: 0,
    };
  });
}

export const DEMO_PAYSLIPS: PayslipRecord[] = [
  ...generateTwelveMonthsPayslips('emp-1042'),
  ...generateTwelveMonthsPayslips('emp-0814'),
];

export const DEMO_TAX_DECLARATIONS: TaxDeclarationItem[] = [
  {
    id: 'TAX-2026-01',
    employeeId: 'emp-1042',
    financialYear: 'FY 2026-27',
    section: 'Section 80C',
    description: 'ELSS Mutual Funds & Public Provident Fund (PPF)',
    maxLimit: 150000,
    declaredAmount: 150000,
    actualAmount: 112000,
    supportingDocName: 'elss_ppf_statements_fy26_27.pdf',
    submittedDate: '2026-10-15',
    status: 'Under Review',
  },
  {
    id: 'TAX-2026-02',
    employeeId: 'emp-1042',
    financialYear: 'FY 2026-27',
    section: 'Section 80D',
    description: 'Medical Insurance Premium (Self & Parents)',
    maxLimit: 50000,
    declaredAmount: 38500,
    actualAmount: 38500,
    supportingDocName: 'health_policy_receipt_2026.pdf',
    submittedDate: '2026-10-15',
    status: 'Accepted',
  },
  {
    id: 'TAX-2026-03',
    employeeId: 'emp-1042',
    financialYear: 'FY 2026-27',
    section: 'HRA Exemption',
    description: 'House Rent Paid — HSR Layout, Bengaluru (₹28,000/mo)',
    maxLimit: 336000,
    declaredAmount: 336000,
    actualAmount: 224000,
    supportingDocName: 'rent_receipts_q1_q2_fy27.pdf',
    submittedDate: '2026-10-15',
    status: 'Submitted',
  },
  {
    id: 'TAX-2026-04',
    employeeId: 'emp-1042',
    financialYear: 'FY 2026-27',
    section: 'NPS (80CCD 1B)',
    description: 'National Pension System Tier-1 Voluntary Contribution',
    maxLimit: 50000,
    declaredAmount: 50000,
    actualAmount: 50000,
    supportingDocName: 'nps_pran_receipt_2026.pdf',
    submittedDate: '2026-10-16',
    status: 'Accepted',
  },
];

export const DEMO_PREVIOUS_EMPLOYERS: PreviousEmployerDetail[] = [
  {
    id: 'PREV-01',
    employerName: 'CloudVantage Software Pvt. Ltd.',
    periodFrom: '2021-06-01',
    periodTo: '2023-03-03',
    grossSalaryReceived: 1180000,
    taxDeducted: 92400,
    form16FileName: 'Form16_CloudVantage_FY23.pdf',
    status: 'Verified' as unknown as PreviousEmployerDetail['status'],
  },
];

export const DEMO_EXPENSES: ExpenseClaim[] = [
  {
    id: 'EXP-2026-419',
    employeeId: 'emp-1042',
    category: 'Internet',
    expenseDate: '2026-11-04',
    amount: 1499,
    currency: 'INR',
    description: 'Monthly home fiber broadband reimbursement (Hybrid work policy)',
    costCentre: 'ENG-PLATFORM-01',
    receiptFileName: 'act_fibernet_nov2026.pdf',
    paymentPreference: 'Bank Transfer (Salary Cycle)',
    submittedDate: '2026-11-05',
    approverName: 'Priya Nair',
    status: 'Pending Approval',
    reimbursementStatus: 'Not Processed',
    timeline: [
      { id: 'e1', label: 'Expense Claim Submitted', actor: 'Aarav Mehta', timestamp: '05 Nov 2026, 09:50 AM', status: 'completed' },
      { id: 'e2', label: 'Awaiting Manager Approval', actor: 'Priya Nair', timestamp: 'Pending', status: 'current' },
    ],
  },
  {
    id: 'EXP-2026-392',
    employeeId: 'emp-1042',
    category: 'Travel',
    expenseDate: '2026-10-14',
    amount: 12840,
    currency: 'INR',
    description: 'Bengaluru to Mumbai round-trip flight & cab for enterprise client workshop',
    costCentre: 'CS-ENTERPRISE-04',
    receiptFileName: 'indigo_boarding_and_cab_oct14.pdf',
    paymentPreference: 'Direct IMPS Reimbursement',
    submittedDate: '2026-10-16',
    approverName: 'Priya Nair',
    status: 'Paid',
    reimbursementStatus: 'Paid',
    approvedAmount: 12840,
    paymentDate: '2026-10-25',
    transactionRef: 'IMPS-62984019283',
    timeline: [
      { id: 'e1', label: 'Expense Claim Submitted', actor: 'Aarav Mehta', timestamp: '16 Oct 2026, 02:10 PM', status: 'completed' },
      { id: 'e2', label: 'Approved by Reporting Manager', actor: 'Priya Nair', timestamp: '17 Oct 2026, 11:22 AM', status: 'completed' },
      { id: 'e3', label: 'Reimbursement Paid via IMPS', actor: 'Finance Desk', timestamp: '25 Oct 2026, 04:05 PM', note: 'Ref: IMPS-62984019283', status: 'completed' },
    ],
  },
  {
    id: 'EXP-2026-370',
    employeeId: 'emp-1042',
    category: 'Business Meetings',
    expenseDate: '2026-09-22',
    amount: 3420,
    currency: 'INR',
    description: 'Team sprint retrospective working lunch',
    costCentre: 'ENG-PLATFORM-01',
    receiptFileName: 'restaurant_invoice_sep22.jpg',
    paymentPreference: 'Bank Transfer (Salary Cycle)',
    submittedDate: '2026-09-23',
    approverName: 'Priya Nair',
    status: 'Approved',
    reimbursementStatus: 'Queued for Payout',
    approvedAmount: 3420,
    timeline: [
      { id: 'e1', label: 'Expense Claim Submitted', actor: 'Aarav Mehta', timestamp: '23 Sep 2026, 11:15 AM', status: 'completed' },
      { id: 'e2', label: 'Approved by Manager', actor: 'Priya Nair', timestamp: '24 Sep 2026, 10:00 AM', status: 'completed' },
    ],
  },
  {
    id: 'EXP-2026-425',
    employeeId: 'emp-1042',
    category: 'Mobile',
    expenseDate: '2026-11-12',
    amount: 799,
    currency: 'INR',
    description: 'Postpaid mobile data & roaming plan',
    costCentre: 'ENG-PLATFORM-01',
    paymentPreference: 'Bank Transfer (Salary Cycle)',
    submittedDate: '2026-11-12',
    approverName: 'Priya Nair',
    status: 'Draft',
    reimbursementStatus: 'Not Processed',
    timeline: [
      { id: 'e1', label: 'Saved as Draft', actor: 'Aarav Mehta', timestamp: '12 Nov 2026, 06:20 PM', status: 'current' },
    ],
  },
];

export const DEMO_LOANS: LoanRecord[] = [
  {
    id: 'LN-2026-019',
    employeeId: 'emp-1042',
    loanType: 'Employee Personal Loan',
    requestedAmount: 102000,
    approvedAmount: 102000,
    purpose: 'Home workstation & solar backup setup',
    repaymentMonths: 12,
    monthlyEmi: 8500,
    paidInstallments: 5,
    remainingInstallments: 7,
    outstandingBalance: 59500,
    submittedDate: '2026-05-14',
    supportingDocName: 'loan_agreement_signed_019.pdf',
    status: 'Approved',
    schedule: Array.from({ length: 12 }, (_, i) => {
      const monthIdx = 5 + i; // June 2026 onwards
      const year = 2026 + Math.floor(monthIdx / 12);
      const month = (monthIdx % 12) + 1;
      const dueDate = `${year}-${String(month).padStart(2, '0')}-30`;
      const paid = i < 5;
      const upcoming = i === 5;
      return {
        installmentNumber: i + 1,
        dueDate,
        installmentAmount: 8500,
        principalComponent: 8500,
        outstandingBalance: Math.max(0, 102000 - (i + 1) * 8500),
        paymentStatus: paid ? 'Paid' : upcoming ? 'Upcoming' : 'Scheduled',
      };
    }),
  },
];

export const DEMO_DOCUMENTS: EmployeeDocument[] = [
  {
    id: 'DOC-001',
    employeeId: 'emp-1042',
    name: 'Offer Letter — Senior Product Engineer',
    docType: 'Offer Letter',
    category: 'Employment Documents',
    uploadedDate: '2023-02-18',
    issuedDate: '2023-02-18',
    verificationStatus: 'Official Issued',
    fileSize: '420 KB',
    accessScope: 'Private (Employee Only)',
    previewSummary: 'Official employment offer issued by NexaCore Technologies Pvt. Ltd. signed on 20 Feb 2023.',
  },
  {
    id: 'DOC-002',
    employeeId: 'emp-1042',
    name: 'Appointment Letter & Employment Agreement',
    docType: 'Appointment Letter',
    category: 'Employment Documents',
    uploadedDate: '2023-03-15',
    issuedDate: '2023-03-15',
    verificationStatus: 'Official Issued',
    fileSize: '680 KB',
    accessScope: 'Private (Employee Only)',
    previewSummary: 'Full-time permanent appointment letter detailing terms, probation confirmation, and confidentiality clauses.',
  },
  {
    id: 'DOC-003',
    employeeId: 'emp-1042',
    name: 'Annual Compensation Revision Letter (FY 2026-27)',
    docType: 'Salary Revision Letter',
    category: 'Salary Documents',
    uploadedDate: '2026-04-05',
    issuedDate: '2026-04-01',
    verificationStatus: 'Official Issued',
    fileSize: '310 KB',
    accessScope: 'Private (Employee Only)',
    previewSummary: 'Effective 01 April 2026: Annual CTC revised to ₹19,60,800 with updated Basic and Special Allowance.',
  },
  {
    id: 'DOC-004',
    employeeId: 'emp-1042',
    name: 'Form 16 — Part A & B (FY 2025-26)',
    docType: 'Form 16',
    category: 'Tax Documents',
    uploadedDate: '2026-06-12',
    issuedDate: '2026-06-12',
    verificationStatus: 'Official Issued',
    fileSize: '890 KB',
    accessScope: 'Private (Employee Only)',
    previewSummary: 'TRACES-verified Form 16 certificate for Assessment Year 2026-27.',
  },
  {
    id: 'DOC-005',
    employeeId: 'emp-1042',
    name: 'PAN Card (Verified KYC)',
    docType: 'Identity Proof',
    category: 'Identity Documents',
    uploadedDate: '2023-03-10',
    verificationStatus: 'Verified',
    fileSize: '215 KB',
    accessScope: 'Private (Employee Only)',
    previewSummary: 'Masked Permanent Account Number verified against statutory payroll records.',
  },
  {
    id: 'DOC-006',
    employeeId: 'emp-1042',
    name: 'PayFuse Employee Handbook & Remote Work Policy 2026',
    docType: 'Company Policy',
    category: 'Other Documents',
    uploadedDate: '2026-01-10',
    issuedDate: '2026-01-01',
    verificationStatus: 'Official Issued',
    fileSize: '1.4 MB',
    accessScope: 'Private (Employee Only)',
    previewSummary: 'Guidelines for hybrid work, expense caps, leave carry-forward, and POSH compliance.',
  },
  {
    id: 'DOC-007',
    employeeId: 'emp-1042',
    name: 'FY 2025-26 Annual Appraisal Summary',
    docType: 'Appraisal Letter',
    category: 'Performance Documents',
    uploadedDate: '2026-04-05',
    issuedDate: '2026-04-01',
    verificationStatus: 'Official Issued',
    fileSize: '260 KB',
    accessScope: 'Private (Employee Only)',
    previewSummary: 'Exceeds Expectations rating summary signed by Priya Nair & VP Engineering.',
  },
];

export const DEMO_DOCUMENT_REQUESTS: DocumentRequest[] = [
  {
    id: 'DREQ-2026-11',
    employeeId: 'emp-1042',
    documentType: 'Bonafide Employment Verification Letter',
    purpose: 'Visa & Passport renewal documentation',
    requestedDate: '2026-11-08',
    status: 'Approved',
  },
];

export const DEMO_GOALS: PerformanceGoal[] = [
  {
    id: 'GOAL-01',
    employeeId: 'emp-1042',
    title: 'Multi-Region API Latency Reduction',
    description: 'Optimize payroll calculation microservices p99 latency below 180ms across APAC clusters.',
    targetMetric: 'p99 < 180ms across 3 regions',
    progress: 78,
    dueDate: '2026-12-31',
    status: 'On Track',
    weightage: 40,
  },
  {
    id: 'GOAL-02',
    employeeId: 'emp-1042',
    title: 'Zero-Downtime Tax Engine Rollout',
    description: 'Deliver automated FY 2026-27 tax regime comparison engine with 99.5% unit test coverage.',
    targetMetric: '100% production rollout + 99.5% coverage',
    progress: 100,
    dueDate: '2026-10-15',
    status: 'Completed',
    weightage: 35,
  },
  {
    id: 'GOAL-03',
    employeeId: 'emp-1042',
    title: 'Mentorship & Engineering Onboarding',
    description: 'Mentor 2 junior engineers through architectural design reviews and production shadow cycles.',
    targetMetric: '2 mentees certified on-call ready',
    progress: 55,
    dueDate: '2027-01-31',
    status: 'On Track',
    weightage: 25,
  },
];

export const DEMO_KPIS: PerformanceKpi[] = [
  { id: 'KPI-1', employeeId: 'emp-1042', name: 'Sprint Story Commitment Accuracy', target: '≥ 90%', actual: '93.4%', achievementPct: 104, reviewPeriod: 'Q3 2026' },
  { id: 'KPI-2', employeeId: 'emp-1042', name: 'Production Incident MTTR', target: '< 30 mins', actual: '22 mins', achievementPct: 100, reviewPeriod: 'Q3 2026' },
  { id: 'KPI-3', employeeId: 'emp-1042', name: 'Code Review Turnaround SLA', target: '< 12 hrs', actual: '9.5 hrs', achievementPct: 100, reviewPeriod: 'Q3 2026' },
  { id: 'KPI-4', employeeId: 'emp-1042', name: 'Automated Test Coverage', target: '≥ 85%', actual: '88.2%', achievementPct: 103, reviewPeriod: 'Q3 2026' },
];

export const DEMO_REVIEWS: PerformanceReview[] = [
  {
    id: 'REV-2026-MID',
    employeeId: 'emp-1042',
    cycleName: 'Mid-Year Appraisal Cycle 2026',
    reviewerName: 'Priya Nair',
    reviewDate: '2026-10-08',
    rating: '4.5 / 5.0 (Exceeds Expectations)',
    summaryFeedback: 'Strong technical ownership across payroll calculation APIs and proactive cross-team collaboration.',
    status: 'Completed',
  },
  {
    id: 'REV-2026-ANNUAL',
    employeeId: 'emp-1042',
    cycleName: 'Annual Review Cycle FY 2026-27',
    reviewerName: 'Priya Nair',
    reviewDate: '2026-12-15',
    rating: 'Pending Cycle Closure',
    summaryFeedback: 'Self-assessment window opens 01 Dec 2026.',
    status: 'Self-Review Due',
  },
];

export const DEMO_TRAININGS: TrainingItem[] = [
  {
    id: 'TRN-01',
    employeeId: 'emp-1042',
    title: 'Enterprise Data Privacy & SOC2 Security Controls',
    provider: 'PayFuse Learning Hub',
    assignedDate: '2026-08-01',
    completionDate: '2026-08-19',
    progress: 100,
    hasCertificate: true,
    status: 'Completed',
  },
  {
    id: 'TRN-02',
    employeeId: 'emp-1042',
    title: 'Distributed Systems & High-Throughput Queues',
    provider: 'Internal Engineering Guild',
    assignedDate: '2026-10-01',
    progress: 65,
    hasCertificate: false,
    status: 'In Progress',
  },
  {
    id: 'TRN-03',
    employeeId: 'emp-1042',
    title: 'Annual Workplace Ethics & POSH Refresher',
    provider: 'HR Compliance',
    assignedDate: '2026-11-01',
    progress: 0,
    hasCertificate: false,
    status: 'Assigned',
  },
];

export const DEMO_TICKETS: SupportTicket[] = [
  {
    id: 'TKT-2026-841',
    employeeId: 'emp-1042',
    category: 'Tax Issue',
    subject: 'Clarification on Section 80C proof upload limit for ELSS',
    description: 'I have two separate ELSS folios; should I merge both PDFs into one document before uploading?',
    priority: 'Low',
    assignedDepartment: 'Payroll & Tax Desk',
    submittedDate: '2026-11-09',
    lastUpdated: '2026-11-10',
    status: 'Awaiting Employee',
    isConfidentialGrievance: false,
    messages: [
      {
        id: 'm1',
        senderName: 'Aarav Mehta',
        senderRole: 'Employee',
        timestamp: '09 Nov 2026, 11:20 AM',
        message: 'I have two separate ELSS folios; should I merge both PDFs into one document before uploading?',
      },
      {
        id: 'm2',
        senderName: 'Meera Iyer',
        senderRole: 'Payroll Desk',
        timestamp: '10 Nov 2026, 09:45 AM',
        message: 'Hi Aarav, yes—please combine both folio statements into a single PDF under 5 MB and attach it under Section 80C proof submission.',
      },
    ],
  },
  {
    id: 'TKT-2026-790',
    employeeId: 'emp-1042',
    category: 'IT Support',
    subject: 'VPN token reset for new workstation',
    description: 'Requesting hardware MFA token re-provisioning after laptop SSD upgrade.',
    priority: 'Medium',
    assignedDepartment: 'IT Helpdesk',
    submittedDate: '2026-10-21',
    lastUpdated: '2026-10-22',
    status: 'Resolved',
    isConfidentialGrievance: false,
    messages: [
      {
        id: 'm1',
        senderName: 'Aarav Mehta',
        senderRole: 'Employee',
        timestamp: '21 Oct 2026, 02:00 PM',
        message: 'Requesting hardware MFA token re-provisioning after laptop SSD upgrade.',
      },
      {
        id: 'm2',
        senderName: 'Karthik Rao',
        senderRole: 'IT Desk',
        timestamp: '22 Oct 2026, 10:15 AM',
        message: 'MFA enrollment QR regenerated and sent to your primary corporate email. Ticket marked resolved.',
      },
    ],
  },
];

export const DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'NOTIF-01',
    employeeId: 'emp-1042',
    category: 'Payroll',
    title: 'October 2026 Payslip Published',
    message: 'Your payslip for October 2026 (Net Pay ₹1,32,460) is ready to view and download.',
    timestamp: '2026-10-30 06:00 PM',
    isRead: false,
    targetRoute: '/my-payroll',
  },
  {
    id: 'NOTIF-02',
    employeeId: 'emp-1042',
    category: 'Attendance',
    title: 'Missing Punch Alert — 05 Nov 2026',
    message: 'Check-out punch was missing on 05 Nov. Your regularisation request REG-2026-089 is pending manager review.',
    timestamp: '2026-11-06 09:15 AM',
    isRead: false,
    targetRoute: '/attendance?tab=regularisation',
  },
  {
    id: 'NOTIF-03',
    employeeId: 'emp-1042',
    category: 'Tax',
    title: 'Tax Proof Submission Window Open',
    message: 'Submit actual investment proofs for FY 2026-27 before 15 Jan 2027 to avoid excess TDS deductions.',
    timestamp: '2026-11-01 10:00 AM',
    isRead: false,
    targetRoute: '/tax?tab=proofs',
  },
  {
    id: 'NOTIF-04',
    employeeId: 'emp-1042',
    category: 'Leave',
    title: 'Casual Leave Approved (10 Nov 2026)',
    message: 'Priya Nair approved your Casual Leave request LV-2026-288.',
    timestamp: '2026-11-03 10:05 AM',
    isRead: true,
    targetRoute: '/leave',
  },
  {
    id: 'NOTIF-05',
    employeeId: 'emp-1042',
    category: 'Reimbursements',
    title: 'Expense Claim Paid — ₹12,840',
    message: 'Travel claim EXP-2026-392 has been settled via IMPS (Ref: IMPS-62984019283).',
    timestamp: '2026-10-25 04:05 PM',
    isRead: true,
    targetRoute: '/expenses',
  },
  {
    id: 'NOTIF-06',
    employeeId: 'emp-1042',
    category: 'Company Announcements',
    title: 'Annual Workplace Ethics & POSH Refresher Assigned',
    message: 'Please complete the mandatory compliance module by 30 Nov 2026.',
    timestamp: '2026-11-01 11:30 AM',
    isRead: true,
    targetRoute: '/performance?tab=training',
  },
];

export const DEMO_UPCOMING_EVENTS: UpcomingEventItem[] = [
  { id: 'ev-1', title: 'Guru Nanak Jayanti', date: '2026-11-24', type: 'Holiday', subtitle: 'Company Holiday · Bengaluru & Pune' },
  { id: 'ev-2', title: 'Priya Nair — Birthday', date: '2026-11-28', type: 'Birthday', subtitle: 'Platform Engineering' },
  { id: 'ev-3', title: 'Annual Compliance Training Due', date: '2026-11-30', type: 'Training', subtitle: 'POSH & Workplace Ethics Refresher' },
  { id: 'ev-4', title: 'Annual Performance Self-Review Opens', date: '2026-12-01', type: 'Review', subtitle: 'FY 2026-27 Appraisal Cycle' },
  { id: 'ev-5', title: 'Christmas Day', date: '2026-12-25', type: 'Holiday', subtitle: 'National Holiday · All Locations' },
];

export const DEMO_TEAM_MEMBERS: TeamMemberSummary[] = [
  {
    employeeId: 'emp-1042',
    employeeCode: 'NC-1042',
    fullName: 'Aarav Mehta',
    avatarUrl: '/src/assets/images/avatar_employee_aarav_1794669864488.jpg',
    designation: 'Senior Product Engineer',
    department: 'Platform Engineering',
    shiftName: 'General Flexible Shift',
    todayStatus: 'Present',
    checkInTime: '09:26',
    locationMode: 'Office',
    goalCompletionAvg: 78,
    latestReviewStatus: 'Completed',
  },
  {
    employeeId: 'emp-1089',
    employeeCode: 'NC-1089',
    fullName: 'Rohan Kulkarni',
    avatarUrl: '/src/assets/images/avatar_team_rohan_1794669865376.jpg',
    designation: 'Product Designer',
    department: 'Platform Engineering',
    shiftName: 'General Flexible Shift',
    todayStatus: 'Present',
    checkInTime: '09:42',
    locationMode: 'Remote',
    goalCompletionAvg: 84,
    latestReviewStatus: 'Completed',
  },
  {
    employeeId: 'emp-1104',
    employeeCode: 'NC-1104',
    fullName: 'Ananya Sharma',
    avatarUrl: '/src/assets/images/avatar_team_ananya_1794669866068.jpg',
    designation: 'Lead QA Engineer',
    department: 'Platform Engineering',
    shiftName: 'General Flexible Shift',
    todayStatus: 'Leave',
    locationMode: 'Remote',
    goalCompletionAvg: 91,
    latestReviewStatus: 'Completed',
  },
  {
    employeeId: 'emp-1120',
    employeeCode: 'NC-1120',
    fullName: 'Vikram Desai',
    avatarUrl: '/src/assets/images/avatar_team_vikram_1794669865752.jpg',
    designation: 'Site Reliability Engineer',
    department: 'Platform Engineering',
    shiftName: 'General Flexible Shift',
    todayStatus: 'Present',
    checkInTime: '09:15',
    locationMode: 'Office',
    goalCompletionAvg: 72,
    latestReviewStatus: 'Self-Review Due',
  },
];

export const DEMO_LOGIN_HISTORY: LoginHistoryEntry[] = [
  {
    id: 'log-1',
    timestamp: '14 Nov 2026, 07:18 AM',
    device: 'MacBook Pro 14" (macOS 15)',
    browser: 'Chrome 131',
    location: 'Bengaluru, IN',
    ipMasked: '103.84.•••.19',
    status: 'Success',
  },
  {
    id: 'log-2',
    timestamp: '12 Nov 2026, 09:32 AM',
    device: 'iPhone 16 Pro (iOS 19)',
    browser: 'Mobile Safari',
    location: 'Bengaluru, IN',
    ipMasked: '103.84.•••.42',
    status: 'Success',
  },
  {
    id: 'log-3',
    timestamp: '08 Nov 2026, 08:11 PM',
    device: 'Unknown Windows Device',
    browser: 'Edge 130',
    location: 'Mumbai, IN',
    ipMasked: '49.36.•••.108',
    status: 'Blocked Attempt',
  },
];

export const DEMO_FAQS = [
  {
    id: 'faq-1',
    category: 'Payroll',
    question: 'When are monthly payslips published in PayFuse?',
    answer: 'Payslips are published automatically once Finance finalizes the monthly payroll run on the configured payday (30th for NexaCore Technologies, 5th for Fulfillment).',
  },
  {
    id: 'faq-2',
    category: 'Attendance',
    question: 'How do I fix a missed biometric punch?',
    answer: 'Navigate to Attendance -> Attendance Regularisation, choose the date with the missing punch, enter the corrected Check-In / Check-Out times with a brief reason, and submit for Reporting Manager approval.',
  },
  {
    id: 'faq-3',
    category: 'Tax',
    question: 'Can I switch between Old and New Tax Regimes mid-year?',
    answer: 'You may preview both regimes anytime in Tax & Declarations. Switching regimes is governed by statutory cut-off windows configured by your company.',
  },
  {
    id: 'faq-4',
    category: 'Bank & Profile',
    question: 'Why are my bank account and designation fields read-only?',
    answer: 'Protected employment and payroll disbursement details require HR verification to prevent unauthorized payroll changes. Use the "Request Update" action to raise an audited change request.',
  },
];
