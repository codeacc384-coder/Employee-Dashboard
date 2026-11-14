import React, { useEffect, useMemo, useState } from 'react';
import { Download, Eye, Lock, Printer } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import {
  Bar,
  BarChart,
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
import { ColumnDef, DataTable } from '../../components/DataTable';
import { FilterBar } from '../../components/FilterBar';
import { FormModal } from '../../components/FormModal';
import { StatCard } from '../../components/StatCard';
import { PayslipRecord } from '../../types/ess';
import { downloadTextFile, formatCurrency, formatDate } from '../../utils/formatters';

type PayrollTab =
  | 'overview'
  | 'structure'
  | 'payslips'
  | 'annual'
  | 'deductions'
  | 'variable'
  | 'bonus'
  | 'history';

export function PayrollPage() {
  const { currentUser, activeCompany } = useAuth();
  const { payslips } = usePortalData();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = (searchParams.get('tab') as PayrollTab) || 'overview';
  const [activeTab, setActiveTab] = useState<PayrollTab>(tabParam);

  useEffect(() => {
    setActiveTab(tabParam);
  }, [tabParam]);

  const changeTab = (t: PayrollTab) => {
    setActiveTab(t);
    setSearchParams({ tab: t });
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [fyFilter, setFyFilter] = useState('All');
  const [previewSlip, setPreviewSlip] = useState<PayslipRecord | null>(null);

  const latest = payslips[0];
  const sym = activeCompany.currencySymbol;

  const filteredSlips = useMemo(() => {
    return payslips.filter((p) => {
      if (fyFilter !== 'All' && p.financialYear !== fyFilter) return false;
      if (searchQuery && !p.monthLabel.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [payslips, fyFilter, searchQuery]);

  const annualSummary = useMemo(() => {
    const fy27 = payslips.filter((p) => p.financialYear === 'FY 2026-27');
    return {
      gross: fy27.reduce((s, p) => s + p.grossEarnings, 0),
      tds: fy27.reduce((s, p) => s + p.deductions.tds, 0),
      pf: fy27.reduce((s, p) => s + p.deductions.pf, 0),
      otherDed: fy27.reduce((s, p) => s + p.deductions.professionalTax + p.deductions.loanEmi, 0),
      net: fy27.reduce((s, p) => s + p.netPay, 0),
      monthsCount: fy27.length,
    };
  }, [payslips]);

  const chartData = useMemo(
    () =>
      [...payslips]
        .slice(0, 6)
        .reverse()
        .map((p) => ({
          month: p.monthLabel.slice(0, 3),
          Gross: p.grossEarnings,
          Net: p.netPay,
        })),
    [payslips]
  );

  const handleDownloadSlip = (p: PayslipRecord) => {
    if (!currentUser) return;
    const content = [
      `========================================================`,
      `${activeCompany.companyName.toUpperCase()}`,
      `${activeCompany.companyAddress}`,
      `PAYSLIP FOR ${p.monthLabel.toUpperCase()} (${p.financialYear})`,
      `========================================================`,
      `Employee Name : ${currentUser.fullName} (${currentUser.employeeCode})`,
      `Department    : ${currentUser.department}`,
      `Designation   : ${currentUser.designation}`,
      `Joining Date  : ${formatDate(currentUser.joiningDate)}`,
      `PAN (Masked)  : ${currentUser.statutoryInfo.panMasked}`,
      `Bank Account  : ${currentUser.bankInfo.bankName} · ${currentUser.bankInfo.accountNumberMasked}`,
      `Paid Days     : ${p.paidDays} · LOP Days: ${p.lopDays}`,
      `--------------------------------------------------------`,
      `EARNINGS`,
      `  Basic             : ${formatCurrency(p.earnings.basic, sym)}`,
      `  HRA               : ${formatCurrency(p.earnings.hra, sym)}`,
      `  Special Allowance : ${formatCurrency(p.earnings.specialAllowance, sym)}`,
      `  Overtime          : ${formatCurrency(p.earnings.overtime, sym)}`,
      `  Incentives        : ${formatCurrency(p.earnings.incentives, sym)}`,
      `  Bonus             : ${formatCurrency(p.earnings.bonus, sym)}`,
      `  Gross Earnings    : ${formatCurrency(p.grossEarnings, sym)}`,
      `--------------------------------------------------------`,
      `EMPLOYEE DEDUCTIONS`,
      `  Provident Fund    : ${formatCurrency(p.deductions.pf, sym)}`,
      `  Professional Tax  : ${formatCurrency(p.deductions.professionalTax, sym)}`,
      `  TDS (Income Tax)  : ${formatCurrency(p.deductions.tds, sym)}`,
      `  Loan EMI          : ${formatCurrency(p.deductions.loanEmi, sym)}`,
      `  Total Deductions  : ${formatCurrency(p.totalDeductions, sym)}`,
      `--------------------------------------------------------`,
      `NET PAY             : ${formatCurrency(p.netPay, sym)}`,
      `PAYMENT STATUS      : ${p.paymentStatus} (${formatDate(p.payDate ?? '')})`,
      `--------------------------------------------------------`,
      `EMPLOYER CONTRIBUTIONS (INFORMATIONAL)`,
      `  Employer PF       : ${formatCurrency(p.employerContributions.employerPf, sym)}`,
      `  Gratuity Prov.    : ${formatCurrency(p.employerContributions.gratuityProvision, sym)}`,
    ].join('\n');
    downloadTextFile(`Payslip_${p.monthKey}_${currentUser.employeeCode}.txt`, content);
    showToast('Payslip downloaded', 'success', `${p.monthLabel} payslip saved.`);
  };

  const handleDownloadAnnual = () => {
    if (!currentUser) return;
    const text = [
      `ANNUAL SALARY STATEMENT — FY 2026-27 (YTD: ${annualSummary.monthsCount} Months)`,
      `Employee: ${currentUser.fullName} (${currentUser.employeeCode})`,
      `Annual Gross Earnings: ${formatCurrency(annualSummary.gross, sym)}`,
      `Total Tax Deducted (TDS): ${formatCurrency(annualSummary.tds, sym)}`,
      `Employee PF Contributions: ${formatCurrency(annualSummary.pf, sym)}`,
      `Other Deductions (PT & Loan EMI): ${formatCurrency(annualSummary.otherDed, sym)}`,
      `Net Earnings YTD: ${formatCurrency(annualSummary.net, sym)}`,
    ].join('\n');
    downloadTextFile(`Annual_Salary_Statement_FY2026-27_${currentUser.employeeCode}.txt`, text);
    showToast('Annual salary statement downloaded', 'success');
  };

  const payslipColumns: ColumnDef<PayslipRecord>[] = [
    { key: 'month', header: 'Payroll Month', sortValue: (p) => p.monthKey, render: (p) => <span className="font-semibold">{p.monthLabel}</span> },
    { key: 'gross', header: 'Gross Earnings', align: 'right', render: (p) => <span className="font-mono-tabular">{formatCurrency(p.grossEarnings, sym)}</span> },
    { key: 'ded', header: 'Total Deductions', align: 'right', render: (p) => <span className="font-mono-tabular text-[#E05252]">{formatCurrency(p.totalDeductions, sym)}</span> },
    { key: 'net', header: 'Net Salary', align: 'right', render: (p) => <span className="font-mono-tabular font-bold text-[#16A36A]">{formatCurrency(p.netPay, sym)}</span> },
    { key: 'payStatus', header: 'Payment Status', render: (p) => <ApprovalStatusBadge status={p.paymentStatus} /> },
    { key: 'slipStatus', header: 'Payslip Status', render: (p) => <ApprovalStatusBadge status={p.payslipStatus} /> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (p) => (
        <div className="inline-flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPreviewSlip(p);
            }}
            className="inline-flex items-center gap-1 rounded-md border border-[#E5E7F0] px-2.5 py-1 text-xs font-medium text-[#0B1230] hover:bg-[#F7F7FC]"
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDownloadSlip(p);
            }}
            className="inline-flex items-center gap-1 rounded-md bg-[#7050F5] px-2.5 py-1 text-xs font-medium text-white hover:bg-[#5E3FE0]"
          >
            <Download className="h-3.5 w-3.5" />
            PDF
          </button>
        </div>
      ),
    },
  ];

  const tabs: { id: PayrollTab; label: string }[] = [
    { id: 'overview', label: 'Payroll Overview' },
    { id: 'structure', label: 'My Salary Structure' },
    { id: 'payslips', label: 'Monthly Payslips' },
    { id: 'annual', label: 'Annual Salary Summary' },
    { id: 'deductions', label: 'Deductions' },
    { id: 'variable', label: 'Variable Pay' },
    { id: 'bonus', label: 'Bonus & Incentives' },
    { id: 'history', label: 'Payroll History' },
  ];

  if (!currentUser || !latest) return null;

  const monthlyBasic = latest.earnings.basic;
  const monthlyHra = latest.earnings.hra;
  const monthlySpecial = latest.earnings.specialAllowance;
  const monthlyGross = monthlyBasic + monthlyHra + monthlySpecial;
  const employerAnnualTotal =
    (latest.employerContributions.employerPf + latest.employerContributions.gratuityProvision) * 12;
  const annualCtc = monthlyGross * 12 + employerAnnualTotal;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1230]">My Payroll</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Read-only verified compensation structure, monthly payslips, and annual earnings statements.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs text-[#64748B]">
          <Lock className="h-3.5 w-3.5" />
          Finalized payroll records are audit-locked
        </span>
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

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Latest Gross Salary" value={formatCurrency(latest.grossEarnings, sym)} subtitle={latest.monthLabel} accent="navy" />
            <StatCard title="Latest Net Salary" value={formatCurrency(latest.netPay, sym)} subtitle={`Paid on ${formatDate(latest.payDate ?? '')}`} accent="success" />
            <StatCard title="Total Deductions" value={formatCurrency(latest.totalDeductions, sym)} subtitle="PF, PT, TDS & Loan EMI" accent="warning" />
            <StatCard
              title="Employer Contributions"
              value={formatCurrency(latest.employerContributions.employerPf + latest.employerContributions.gratuityProvision, sym)}
              subtitle="Informational (PF + Gratuity)"
              accent="blue"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7 rounded-xl border border-[#E5E7F0] bg-white p-5">
              <h2 className="text-base font-semibold text-[#0B1230]">6-Month Gross vs Net Pay</h2>
              <div className="mt-4 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7F0" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                    <Tooltip formatter={(val) => formatCurrency(Number(val ?? 0), sym)} />
                    <Bar dataKey="Gross" fill="#478BFA" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Net" fill="#7050F5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-xl border border-[#E5E7F0] bg-white p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-[#0B1230]">Current Payroll Period</h2>
                  <ApprovalStatusBadge status="Scheduled" />
                </div>
                <p className="mt-1 text-xs text-[#64748B]">November 2026 · Payday scheduled for 30 Nov 2026</p>
                <div className="mt-4 space-y-2.5 border-t border-[#F1F3F9] pt-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Last Completed Payout</span>
                    <span className="font-medium">{latest.monthLabel} ({latest.paymentStatus})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Disbursement Account</span>
                    <span className="font-mono-tabular">{currentUser.bankInfo.accountNumberMasked}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Tax Regime Applied</span>
                    <span className="font-medium">{currentUser.statutoryInfo.taxRegime}</span>
                  </div>
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewSlip(latest)}
                  className="flex-1 rounded-lg border border-[#E5E7F0] px-3 py-2 text-xs font-medium text-[#0B1230] hover:bg-[#F7F7FC]"
                >
                  Preview Latest Payslip
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadSlip(latest)}
                  className="flex-1 rounded-lg bg-[#7050F5] px-3 py-2 text-xs font-medium text-white hover:bg-[#5E3FE0]"
                >
                  Download Latest
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'structure' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard title="Annual CTC" value={formatCurrency(annualCtc, sym)} subtitle="Fixed Compensation + Employer Benefits" accent="purple" />
            <StatCard title="Monthly Fixed Gross" value={formatCurrency(monthlyGross, sym)} subtitle="Before statutory deductions" accent="navy" />
            <StatCard title="Employer Benefits (Annual)" value={formatCurrency(employerAnnualTotal, sym)} subtitle="Informational — Excluded from Take-Home" accent="blue" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-[#E5E7F0] bg-white p-5">
              <h2 className="text-base font-semibold text-[#0B1230] border-b border-[#F1F3F9] pb-3">
                Monthly Earnings Components
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                {[
                  ['Basic Salary', monthlyBasic],
                  ['House Rent Allowance (HRA)', monthlyHra],
                  ['Special Allowance', monthlySpecial],
                ].map(([label, amt]) => (
                  <div key={label as string} className="flex items-center justify-between">
                    <dt className="text-[#475569]">{label}</dt>
                    <dd className="font-mono-tabular font-medium text-[#0B1230]">{formatCurrency(amt as number, sym)}</dd>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-[#E5E7F0] pt-3 font-semibold">
                  <dt>Monthly Fixed Gross</dt>
                  <dd className="font-mono-tabular text-[#7050F5]">{formatCurrency(monthlyGross, sym)}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-xl border border-[#E5E7F0] bg-white p-5">
              <h2 className="text-base font-semibold text-[#0B1230] border-b border-[#F1F3F9] pb-3">
                Employee Deductions vs Employer Contributions
              </h2>
              <div className="mt-4 space-y-4 text-sm">
                <div>
                  <p className="text-xs font-semibold text-[#64748B] mb-2">Employee Deductions (From Gross)</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#475569]">Employee Provident Fund (PF)</span>
                      <span className="font-mono-tabular text-[#E05252]">{formatCurrency(latest.deductions.pf, sym)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#475569]">Professional Tax</span>
                      <span className="font-mono-tabular text-[#E05252]">{formatCurrency(latest.deductions.professionalTax, sym)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#475569]">Estimated Monthly TDS</span>
                      <span className="font-mono-tabular text-[#E05252]">{formatCurrency(latest.deductions.tds, sym)}</span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-[#F1F3F9] pt-3">
                  <p className="text-xs font-semibold text-[#64748B] mb-2">Employer Contributions (Informational Only)</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#475569]">Employer PF Contribution</span>
                      <span className="font-mono-tabular text-[#0B1230]">{formatCurrency(latest.employerContributions.employerPf, sym)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#475569]">Gratuity Provision</span>
                      <span className="font-mono-tabular text-[#0B1230]">{formatCurrency(latest.employerContributions.gratuityProvision, sym)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {(activeTab === 'payslips' || activeTab === 'history') && (
        <div className="space-y-4">
          <FilterBar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search payroll month..."
            selects={[
              {
                id: 'fy-filter',
                label: 'Financial Year',
                value: fyFilter,
                onChange: setFyFilter,
                options: [
                  { label: 'All Financial Years', value: 'All' },
                  { label: 'FY 2026-27', value: 'FY 2026-27' },
                  { label: 'FY 2025-26', value: 'FY 2025-26' },
                ],
              },
            ]}
          />
          <DataTable
            data={filteredSlips}
            columns={payslipColumns}
            keyExtractor={(p) => p.id}
            pageSize={12}
            onRowClick={(p) => setPreviewSlip(p)}
          />
        </div>
      )}

      {activeTab === 'annual' && (
        <div className="rounded-xl border border-[#E5E7F0] bg-white p-6 space-y-5 max-w-3xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F1F3F9] pb-4">
            <div>
              <h2 className="text-base font-semibold text-[#0B1230]">Annual Salary Summary — FY 2026-27</h2>
              <p className="text-xs text-[#64748B]">Year-to-date finalized earnings ({annualSummary.monthsCount} payroll cycles)</p>
            </div>
            <button
              type="button"
              onClick={handleDownloadAnnual}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#7050F5] px-4 py-2 text-xs font-medium text-white hover:bg-[#5E3FE0] whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5" />
              Download Annual Statement
            </button>
          </div>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              ['Annual Gross Earnings (YTD)', formatCurrency(annualSummary.gross, sym), 'text-[#0B1230]'],
              ['Total Tax Deducted (TDS)', formatCurrency(annualSummary.tds, sym), 'text-[#E05252]'],
              ['Employee PF Contributions', formatCurrency(annualSummary.pf, sym), 'text-[#0B1230]'],
              ['Other Deductions (PT & Loan EMI)', formatCurrency(annualSummary.otherDed, sym), 'text-[#0B1230]'],
              ['Net Earnings Credited (YTD)', formatCurrency(annualSummary.net, sym), 'text-[#16A36A]'],
            ].map(([label, val, cls]) => (
              <div key={label} className="rounded-lg bg-[#F7F7FC] p-4">
                <dt className="text-xs text-[#64748B]">{label}</dt>
                <dd className={`mt-1 text-lg font-bold font-mono-tabular ${cls}`}>{val}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {activeTab === 'deductions' && (
        <DataTable
          data={payslips}
          keyExtractor={(p) => p.id}
          columns={[
            { key: 'm', header: 'Month', render: (p) => <span className="font-medium">{p.monthLabel}</span> },
            { key: 'pf', header: 'PF', align: 'right', render: (p) => <span className="font-mono-tabular">{formatCurrency(p.deductions.pf, sym)}</span> },
            { key: 'pt', header: 'Prof. Tax', align: 'right', render: (p) => <span className="font-mono-tabular">{formatCurrency(p.deductions.professionalTax, sym)}</span> },
            { key: 'tds', header: 'TDS', align: 'right', render: (p) => <span className="font-mono-tabular">{formatCurrency(p.deductions.tds, sym)}</span> },
            { key: 'loan', header: 'Loan EMI', align: 'right', render: (p) => <span className="font-mono-tabular">{formatCurrency(p.deductions.loanEmi, sym)}</span> },
            { key: 'tot', header: 'Total', align: 'right', render: (p) => <span className="font-mono-tabular font-semibold text-[#E05252]">{formatCurrency(p.totalDeductions, sym)}</span> },
          ]}
        />
      )}

      {(activeTab === 'variable' || activeTab === 'bonus') && (
        <DataTable
          data={payslips.filter((p) => p.earnings.bonus > 0 || p.earnings.incentives > 0 || p.earnings.overtime > 0)}
          keyExtractor={(p) => p.id}
          columns={[
            { key: 'm', header: 'Month', render: (p) => <span className="font-medium">{p.monthLabel}</span> },
            { key: 'bonus', header: 'Bonus', align: 'right', render: (p) => <span className="font-mono-tabular">{formatCurrency(p.earnings.bonus, sym)}</span> },
            { key: 'inc', header: 'Incentives / Encashment', align: 'right', render: (p) => <span className="font-mono-tabular">{formatCurrency(p.earnings.incentives, sym)}</span> },
            { key: 'ot', header: 'Overtime Pay', align: 'right', render: (p) => <span className="font-mono-tabular">{formatCurrency(p.earnings.overtime, sym)}</span> },
            { key: 'status', header: 'Status', render: (p) => <ApprovalStatusBadge status={p.paymentStatus} /> },
          ]}
        />
      )}

      {/* Printable Payslip Preview Modal */}
      <FormModal
        open={Boolean(previewSlip)}
        onClose={() => setPreviewSlip(null)}
        title={previewSlip ? `Payslip — ${previewSlip.monthLabel}` : ''}
        subtitle={activeCompany.companyName}
        maxWidthClass="max-w-3xl"
      >
        {previewSlip && (
          <div className="space-y-5 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E5E7F0] pb-4">
              <div>
                <p className="text-base font-bold text-[#0B1230]">{activeCompany.companyName}</p>
                <p className="text-xs text-[#64748B]">{activeCompany.companyAddress}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-[#7050F5]">PAYSLIP STATEMENT</p>
                <p className="text-sm font-bold text-[#0B1230]">{previewSlip.monthLabel}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-lg bg-[#F7F7FC] p-3.5 text-xs sm:grid-cols-3">
              <div><span className="text-[#64748B]">Name:</span> <strong>{currentUser.fullName}</strong></div>
              <div><span className="text-[#64748B]">ID:</span> <strong className="font-mono-tabular">{currentUser.employeeCode}</strong></div>
              <div><span className="text-[#64748B]">Department:</span> <strong>{currentUser.department}</strong></div>
              <div><span className="text-[#64748B]">Designation:</span> <strong>{currentUser.designation}</strong></div>
              <div><span className="text-[#64748B]">PAN (Masked):</span> <strong className="font-mono-tabular">{currentUser.statutoryInfo.panMasked}</strong></div>
              <div><span className="text-[#64748B]">Bank A/C:</span> <strong className="font-mono-tabular">{currentUser.bankInfo.accountNumberMasked}</strong></div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-[#E5E7F0] p-4">
                <h4 className="text-xs font-semibold text-[#0B1230] mb-2.5">Earnings</h4>
                <div className="space-y-1.5 text-xs">
                  {[
                    ['Basic', previewSlip.earnings.basic],
                    ['HRA', previewSlip.earnings.hra],
                    ['Special Allowance', previewSlip.earnings.specialAllowance],
                    ['Overtime', previewSlip.earnings.overtime],
                    ['Incentives', previewSlip.earnings.incentives],
                    ['Bonus', previewSlip.earnings.bonus],
                  ].map(([k, v]) => (
                    <div key={k as string} className="flex justify-between">
                      <span className="text-[#475569]">{k}</span>
                      <span className="font-mono-tabular font-medium">{formatCurrency(v as number, sym)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-[#E5E7F0] pt-2 font-semibold">
                    <span>Gross Earnings</span>
                    <span className="font-mono-tabular">{formatCurrency(previewSlip.grossEarnings, sym)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-[#E5E7F0] p-4">
                <h4 className="text-xs font-semibold text-[#0B1230] mb-2.5">Deductions</h4>
                <div className="space-y-1.5 text-xs">
                  {[
                    ['Provident Fund (PF)', previewSlip.deductions.pf],
                    ['ESI', previewSlip.deductions.esi],
                    ['Professional Tax', previewSlip.deductions.professionalTax],
                    ['TDS (Income Tax)', previewSlip.deductions.tds],
                    ['LOP', previewSlip.deductions.lop],
                    ['Loan EMI', previewSlip.deductions.loanEmi],
                  ].map(([k, v]) => (
                    <div key={k as string} className="flex justify-between">
                      <span className="text-[#475569]">{k}</span>
                      <span className="font-mono-tabular font-medium">{formatCurrency(v as number, sym)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-t border-[#E5E7F0] pt-2 font-semibold">
                    <span>Total Deductions</span>
                    <span className="font-mono-tabular text-[#E05252]">{formatCurrency(previewSlip.totalDeductions, sym)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#0B1230] p-4 text-white">
              <div>
                <p className="text-xs text-white/70">Net Pay Credited</p>
                <p className="text-xl font-bold font-mono-tabular">{formatCurrency(previewSlip.netPay, sym)}</p>
              </div>
              <div className="flex items-center gap-2 no-print">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadSlip(previewSlip)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#7050F5] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#5E3FE0]"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </button>
              </div>
            </div>
          </div>
        )}
      </FormModal>
    </div>
  );
}
