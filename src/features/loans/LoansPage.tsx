import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext';
import { usePortalData } from '../../app/PortalDataContext';
import { useToast } from '../../app/ToastContext';
import { ApprovalStatusBadge } from '../../components/ApprovalStatusBadge';
import { ColumnDef, DataTable } from '../../components/DataTable';
import { FileUploader } from '../../components/FileUploader';
import { StatCard } from '../../components/StatCard';
import { LoanInstallment, LoanRecord } from '../../types/ess';
import { formatCurrency, formatDate } from '../../utils/formatters';

type LoanTab = 'overview' | 'apply' | 'advance' | 'requests' | 'schedule';

export function LoansPage() {
  const { activeCompany } = useAuth();
  const { loans, applyLoan } = usePortalData();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = (searchParams.get('tab') as LoanTab) || 'overview';
  const [activeTab, setActiveTab] = useState<LoanTab>(tabParam);

  useEffect(() => {
    setActiveTab(tabParam);
  }, [tabParam]);

  const changeTab = (t: LoanTab) => {
    setActiveTab(t);
    setSearchParams({ tab: t });
  };

  const sym = activeCompany.currencySymbol;
  const activeLoan = loans.find((l) => l.status === 'Approved') ?? loans[0];

  const [loanType, setLoanType] = useState<LoanRecord['loanType']>('Employee Personal Loan');
  const [reqAmount, setReqAmount] = useState('50000');
  const [repaymentMonths, setRepaymentMonths] = useState('10');
  const [purpose, setPurpose] = useState('');
  const [docName, setDocName] = useState<string | undefined>();

  const [advAmount, setAdvAmount] = useState('25000');
  const [advMonths, setAdvMonths] = useState('3');
  const [advReason, setAdvReason] = useState('');

  const handleApplyLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(reqAmount);
    const months = Number(repaymentMonths);
    if (!amt || amt <= 0 || !purpose.trim()) {
      showToast('Enter a valid loan amount and purpose', 'error');
      return;
    }
    applyLoan({
      loanType,
      requestedAmount: amt,
      purpose: purpose.trim(),
      repaymentMonths: months,
      supportingDocName: docName,
    });
    setPurpose('');
    setDocName(undefined);
    showToast('Loan application submitted', 'success', 'Sent for HR & Finance policy approval.');
    changeTab('requests');
  };

  const handleApplyAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(advAmount);
    const months = Number(advMonths);
    if (!amt || amt <= 0 || !advReason.trim()) {
      showToast('Enter advance amount and reason', 'error');
      return;
    }
    applyLoan({
      loanType: 'Salary Advance',
      requestedAmount: amt,
      purpose: advReason.trim(),
      repaymentMonths: months,
    });
    setAdvReason('');
    showToast('Salary advance request submitted', 'success');
    changeTab('requests');
  };

  const loanCols: ColumnDef<LoanRecord>[] = [
    { key: 'id', header: 'Loan ID', render: (l) => <span className="font-mono-tabular text-xs font-semibold">{l.id}</span> },
    { key: 'type', header: 'Type', render: (l) => l.loanType },
    { key: 'req', header: 'Principal', align: 'right', render: (l) => <span className="font-mono-tabular">{formatCurrency(l.requestedAmount, sym)}</span> },
    { key: 'app', header: 'Approved', align: 'right', render: (l) => <span className="font-mono-tabular">{l.approvedAmount > 0 ? formatCurrency(l.approvedAmount, sym) : '—'}</span> },
    { key: 'emi', header: 'Monthly EMI', align: 'right', render: (l) => <span className="font-mono-tabular">{formatCurrency(l.monthlyEmi, sym)}</span> },
    { key: 'bal', header: 'Outstanding', align: 'right', render: (l) => <span className="font-mono-tabular font-semibold">{formatCurrency(l.outstandingBalance, sym)}</span> },
    { key: 'status', header: 'Status', render: (l) => <ApprovalStatusBadge status={l.status} /> },
  ];

  const scheduleCols: ColumnDef<LoanInstallment>[] = [
    { key: 'num', header: 'Installment #', render: (s) => <span className="font-mono-tabular font-medium">#{s.installmentNumber}</span> },
    { key: 'due', header: 'Due Date', render: (s) => <span className="font-mono-tabular text-xs">{formatDate(s.dueDate)}</span> },
    { key: 'amt', header: 'Installment Amount', align: 'right', render: (s) => <span className="font-mono-tabular">{formatCurrency(s.installmentAmount, sym)}</span> },
    { key: 'prin', header: 'Principal', align: 'right', render: (s) => <span className="font-mono-tabular">{formatCurrency(s.principalComponent, sym)}</span> },
    { key: 'out', header: 'Remaining Balance', align: 'right', render: (s) => <span className="font-mono-tabular font-semibold">{formatCurrency(s.outstandingBalance, sym)}</span> },
    { key: 'st', header: 'Payment Status', render: (s) => <ApprovalStatusBadge status={s.paymentStatus} /> },
  ];

  const tabs: { id: LoanTab; label: string }[] = [
    { id: 'overview', label: 'Outstanding Balance' },
    { id: 'advance', label: 'Apply for Salary Advance' },
    { id: 'apply', label: 'Apply for Employee Loan' },
    { id: 'requests', label: 'My Loan Requests' },
    { id: 'schedule', label: 'Repayment Schedule' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1230]">Loans & Advances</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            View active loan balances, EMI repayment schedules, and apply for employee loans or advances.
          </p>
        </div>
        <button
          type="button"
          onClick={() => changeTab('apply')}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#7050F5] px-4 py-2 text-xs font-medium text-white hover:bg-[#5E3FE0] whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          Apply for Loan
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

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <StatCard title="Total Loan Amount" value={activeLoan ? formatCurrency(activeLoan.approvedAmount, sym) : formatCurrency(0, sym)} accent="navy" />
            <StatCard title="Outstanding Balance" value={activeLoan ? formatCurrency(activeLoan.outstandingBalance, sym) : formatCurrency(0, sym)} accent="warning" />
            <StatCard title="Monthly EMI" value={activeLoan ? formatCurrency(activeLoan.monthlyEmi, sym) : formatCurrency(0, sym)} accent="purple" />
            <StatCard title="Paid Installments" value={`${activeLoan?.paidInstallments ?? 0}`} accent="success" />
            <StatCard title="Remaining EMIs" value={`${activeLoan?.remainingInstallments ?? 0}`} accent="blue" />
          </div>
          {activeLoan && <DataTable data={activeLoan.schedule} columns={scheduleCols} keyExtractor={(s) => String(s.installmentNumber)} pageSize={12} />}
        </div>
      )}

      {activeTab === 'apply' && (
        <form onSubmit={handleApplyLoan} className="max-w-xl rounded-xl border border-[#E5E7F0] bg-white p-6 space-y-4">
          <h2 className="text-base font-semibold text-[#0B1230]">Apply for Employee Loan</h2>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#475569]">Loan Type</label>
            <select value={loanType} onChange={(e) => setLoanType(e.target.value as LoanRecord['loanType'])} className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm">
              <option value="Employee Personal Loan">Employee Personal Loan</option>
              <option value="Medical Emergency Loan">Medical Emergency Loan</option>
              <option value="Relocation Advance">Relocation Advance</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#475569]">Requested Amount</label>
              <input type="number" min="5000" value={reqAmount} onChange={(e) => setReqAmount(e.target.value)} className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm font-mono-tabular" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#475569]">Repayment Period (Months)</label>
              <select value={repaymentMonths} onChange={(e) => setRepaymentMonths(e.target.value)} className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm">
                <option value="6">6 Months</option>
                <option value="10">10 Months</option>
                <option value="12">12 Months</option>
                <option value="24">24 Months</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#475569]">Purpose *</label>
            <textarea rows={3} required value={purpose} onChange={(e) => setPurpose(e.target.value)} className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm" />
          </div>
          <FileUploader label="Supporting Documents (Optional)" fileName={docName} onFileSelect={setDocName} />
          <div className="rounded-lg bg-[#F7F7FC] p-3 text-xs flex justify-between">
            <span className="text-[#64748B]">Estimated Monthly EMI</span>
            <span className="font-mono-tabular font-semibold text-[#0B1230]">
              {formatCurrency(Math.round((Number(reqAmount) || 0) / (Number(repaymentMonths) || 1)), sym)}
            </span>
          </div>
          <button type="submit" className="w-full rounded-lg bg-[#7050F5] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#5E3FE0]">
            Submit Loan Request
          </button>
        </form>
      )}

      {activeTab === 'advance' && (
        <form onSubmit={handleApplyAdvance} className="max-w-xl rounded-xl border border-[#E5E7F0] bg-white p-6 space-y-4">
          <h2 className="text-base font-semibold text-[#0B1230]">Apply for Salary Advance</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#475569]">Requested Amount</label>
              <input type="number" min="2000" value={advAmount} onChange={(e) => setAdvAmount(e.target.value)} className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm font-mono-tabular" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#475569]">Preferred Recovery Period</label>
              <select value={advMonths} onChange={(e) => setAdvMonths(e.target.value)} className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm">
                <option value="1">1 Month (Next Payroll)</option>
                <option value="2">2 Months</option>
                <option value="3">3 Months</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#475569]">Reason *</label>
            <textarea rows={3} required value={advReason} onChange={(e) => setAdvReason(e.target.value)} className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="w-full rounded-lg bg-[#7050F5] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#5E3FE0]">
            Submit Salary Advance Request
          </button>
        </form>
      )}

      {activeTab === 'requests' && <DataTable data={loans} columns={loanCols} keyExtractor={(l) => l.id} />}
      {activeTab === 'schedule' && activeLoan && (
        <DataTable data={activeLoan.schedule} columns={scheduleCols} keyExtractor={(s) => String(s.installmentNumber)} pageSize={12} />
      )}
    </div>
  );
}
