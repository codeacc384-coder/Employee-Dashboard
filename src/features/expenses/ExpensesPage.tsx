import React, { useEffect, useMemo, useState } from 'react';
import { Eye, Plus, XCircle } from 'lucide-react';
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
import { RequestTimeline } from '../../components/RequestTimeline';
import { StatCard } from '../../components/StatCard';
import { ExpenseCategory, ExpenseClaim } from '../../types/ess';
import { formatCurrency, formatDate } from '../../utils/formatters';

type ExpenseTab = 'overview' | 'submit' | 'requests' | 'approvals' | 'history';

const CATEGORIES: ExpenseCategory[] = [
  'Travel',
  'Fuel',
  'Accommodation',
  'Food',
  'Internet',
  'Mobile',
  'Business Meetings',
  'Other Approved Expenses',
];

export function ExpensesPage() {
  const { activeCompany } = useAuth();
  const { expenses, submitExpense, cancelExpense } = usePortalData();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = (searchParams.get('tab') as ExpenseTab) || 'overview';
  const [activeTab, setActiveTab] = useState<ExpenseTab>(tabParam);

  useEffect(() => {
    setActiveTab(tabParam);
  }, [tabParam]);

  const changeTab = (t: ExpenseTab) => {
    setActiveTab(t);
    setSearchParams({ tab: t });
  };

  const sym = activeCompany.currencySymbol;

  // Submit form state
  const [category, setCategory] = useState<ExpenseCategory>('Travel');
  const [expenseDate, setExpenseDate] = useState('2026-11-13');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(activeCompany.currencyCode);
  const [costCentre, setCostCentre] = useState('ENG-PLATFORM-01');
  const [description, setDescription] = useState('');
  const [paymentPref, setPaymentPref] = useState<ExpenseClaim['paymentPreference']>('Bank Transfer (Salary Cycle)');
  const [receipt, setReceipt] = useState<string | undefined>();

  // Filters & drawers
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClaim, setSelectedClaim] = useState<ExpenseClaim | null>(null);
  const [cancelTarget, setCancelTarget] = useState<ExpenseClaim | null>(null);

  const summary = useMemo(() => {
    const sumBy = (pred: (e: ExpenseClaim) => boolean) =>
      expenses.filter(pred).reduce((acc, e) => acc + e.amount, 0);
    return {
      total: sumBy(() => true),
      pending: sumBy((e) => e.status === 'Pending Approval'),
      approved: sumBy((e) => e.status === 'Approved'),
      rejected: sumBy((e) => e.status === 'Rejected'),
      paid: sumBy((e) => e.status === 'Paid'),
    };
  }, [expenses]);

  const handleSubmitClaim = (asDraft: boolean) => {
    const numAmt = Number(amount);
    if (!numAmt || numAmt <= 0) {
      showToast('Enter a valid expense amount', 'error');
      return;
    }
    if (!asDraft && description.trim().length < 5) {
      showToast('Please enter a description for the expense claim', 'error');
      return;
    }

    submitExpense({
      category,
      expenseDate,
      amount: numAmt,
      currency,
      description: description.trim() || 'Draft expense entry',
      costCentre: costCentre.trim() || undefined,
      receiptFileName: receipt,
      paymentPreference: paymentPref,
      status: asDraft ? 'Draft' : 'Pending Approval',
    });

    showToast(asDraft ? 'Expense saved as draft' : 'Expense claim submitted', 'success');
    setAmount('');
    setDescription('');
    setReceipt(undefined);
    changeTab('requests');
  };

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      if (statusFilter !== 'All' && e.status !== statusFilter) return false;
      if (
        searchQuery &&
        !e.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !e.category.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !e.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [expenses, statusFilter, searchQuery]);

  const columns: ColumnDef<ExpenseClaim>[] = [
    { key: 'id', header: 'Expense ID', render: (e) => <span className="font-mono-tabular text-xs font-semibold">{e.id}</span> },
    { key: 'cat', header: 'Category', render: (e) => e.category },
    { key: 'date', header: 'Expense Date', sortValue: (e) => e.expenseDate, render: (e) => <span className="font-mono-tabular text-xs">{formatDate(e.expenseDate)}</span> },
    { key: 'amt', header: 'Amount', align: 'right', sortValue: (e) => e.amount, render: (e) => <span className="font-mono-tabular font-semibold">{formatCurrency(e.amount, sym)}</span> },
    { key: 'sub', header: 'Submitted', render: (e) => <span className="font-mono-tabular text-xs text-[#64748B]">{formatDate(e.submittedDate)}</span> },
    { key: 'app', header: 'Approver', render: (e) => <span className="text-xs">{e.approverName}</span> },
    { key: 'status', header: 'Status', render: (e) => <ApprovalStatusBadge status={e.status} /> },
    { key: 'reimb', header: 'Reimbursement', render: (e) => <ApprovalStatusBadge status={e.reimbursementStatus} /> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (e) => (
        <div className="inline-flex items-center gap-1">
          <button
            type="button"
            onClick={(ev) => {
              ev.stopPropagation();
              setSelectedClaim(e);
            }}
            aria-label="View claim"
            className="rounded p-1.5 text-[#475569] hover:bg-[#F7F7FC] hover:text-[#0B1230]"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          {(e.status === 'Pending Approval' || e.status === 'Draft') && (
            <button
              type="button"
              onClick={(ev) => {
                ev.stopPropagation();
                setCancelTarget(e);
              }}
              aria-label="Cancel claim"
              className="rounded p-1.5 text-[#E05252] hover:bg-[#E05252]/10"
            >
              <XCircle className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const tabs: { id: ExpenseTab; label: string }[] = [
    { id: 'overview', label: 'My Expenses' },
    { id: 'submit', label: 'Submit Expense' },
    { id: 'requests', label: 'Reimbursement Requests' },
    { id: 'approvals', label: 'Approval Status' },
    { id: 'history', label: 'Reimbursement History' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1230]">Expenses & Reimbursements</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Submit business expense claims, upload receipts, and track reimbursement payouts.
          </p>
        </div>
        <button
          type="button"
          onClick={() => changeTab('submit')}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#7050F5] px-4 py-2 text-xs font-medium text-white hover:bg-[#5E3FE0] whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          Submit Expense
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
            <StatCard title="Total Submitted" value={formatCurrency(summary.total, sym)} accent="navy" />
            <StatCard title="Pending" value={formatCurrency(summary.pending, sym)} accent="warning" />
            <StatCard title="Approved" value={formatCurrency(summary.approved, sym)} accent="blue" />
            <StatCard title="Rejected" value={formatCurrency(summary.rejected, sym)} accent="navy" />
            <StatCard title="Paid" value={formatCurrency(summary.paid, sym)} accent="success" />
          </div>
          <DataTable data={expenses} columns={columns} keyExtractor={(e) => e.id} onRowClick={(e) => setSelectedClaim(e)} />
        </div>
      )}

      {activeTab === 'submit' && (
        <div className="max-w-2xl rounded-xl border border-[#E5E7F0] bg-white p-6 space-y-5">
          <h2 className="text-base font-semibold text-[#0B1230] border-b border-[#F1F3F9] pb-3">
            New Expense Claim
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#475569]">Expense Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)} className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#475569]">Expense Date</label>
              <input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#475569]">Amount *</label>
              <input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm font-mono-tabular" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#475569]">Currency</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm">
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#475569]">Project / Cost Centre</label>
              <input value={costCentre} onChange={(e) => setCostCentre(e.target.value)} className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm font-mono-tabular" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#475569]">Payment Preference</label>
              <select value={paymentPref} onChange={(e) => setPaymentPref(e.target.value as ExpenseClaim['paymentPreference'])} className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm">
                <option value="Bank Transfer (Salary Cycle)">Bank Transfer (Salary Cycle)</option>
                <option value="Direct IMPS Reimbursement">Direct IMPS Reimbursement</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#475569]">Description *</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Merchant, business purpose, or attendees..." className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm" />
          </div>

          <FileUploader label="Receipt Upload" fileName={receipt} onFileSelect={setReceipt} />

          <div className="flex justify-end gap-2.5 border-t border-[#F1F3F9] pt-4">
            <button type="button" onClick={() => handleSubmitClaim(true)} className="rounded-lg border border-[#E5E7F0] px-4 py-2 text-xs font-medium text-[#0B1230] hover:bg-[#F7F7FC]">
              Save Draft
            </button>
            <button type="button" onClick={() => handleSubmitClaim(false)} className="rounded-lg bg-[#7050F5] px-5 py-2 text-xs font-semibold text-white hover:bg-[#5E3FE0]">
              Submit Claim
            </button>
          </div>
        </div>
      )}

      {(activeTab === 'requests' || activeTab === 'approvals' || activeTab === 'history') && (
        <div className="space-y-4">
          <FilterBar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search expense ID, category, description..."
            selects={[
              {
                id: 'exp-status',
                label: 'Status',
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { label: 'All Statuses', value: 'All' },
                  { label: 'Pending Approval', value: 'Pending Approval' },
                  { label: 'Approved', value: 'Approved' },
                  { label: 'Paid', value: 'Paid' },
                  { label: 'Draft', value: 'Draft' },
                  { label: 'Cancelled', value: 'Cancelled' },
                ],
              },
            ]}
          />
          <DataTable
            data={filtered}
            columns={columns}
            keyExtractor={(e) => e.id}
            onRowClick={(e) => setSelectedClaim(e)}
          />
        </div>
      )}

      <DetailDrawer
        open={Boolean(selectedClaim)}
        onClose={() => setSelectedClaim(null)}
        title={selectedClaim ? `Expense Claim ${selectedClaim.id}` : ''}
        subtitle={selectedClaim ? selectedClaim.category : ''}
      >
        {selectedClaim && (
          <div className="space-y-5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#64748B]">Claim Status</span>
              <ApprovalStatusBadge status={selectedClaim.status} />
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-lg bg-[#F7F7FC] p-3.5 text-xs">
              <div>
                <p className="text-[#64748B]">Claimed Amount</p>
                <p className="mt-0.5 font-mono-tabular font-bold text-[#0B1230]">{formatCurrency(selectedClaim.amount, sym)}</p>
              </div>
              <div>
                <p className="text-[#64748B]">Reimbursement Status</p>
                <p className="mt-0.5 font-semibold text-[#0B1230]">{selectedClaim.reimbursementStatus}</p>
              </div>
              {selectedClaim.transactionRef && (
                <div className="col-span-2 border-t border-[#E5E7F0] pt-2">
                  <p className="text-[#64748B]">Payment Reference ({formatDate(selectedClaim.paymentDate ?? '')})</p>
                  <p className="mt-0.5 font-mono-tabular font-semibold text-[#16A36A]">{selectedClaim.transactionRef}</p>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs text-[#64748B]">Description</p>
              <p className="mt-1 text-[#0B1230]">{selectedClaim.description}</p>
            </div>
            <div className="border-t border-[#F1F3F9] pt-4">
              <h4 className="mb-3 text-xs font-semibold text-[#0B1230]">Approval & Payout Timeline</h4>
              <RequestTimeline events={selectedClaim.timeline} />
            </div>
          </div>
        )}
      </DetailDrawer>

      <ConfirmationDialog
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        destructive
        title="Cancel Expense Claim?"
        description={`Withdraw expense claim ${cancelTarget?.id ?? ''}?`}
        confirmLabel="Cancel Claim"
        onConfirm={() => {
          if (cancelTarget) {
            cancelExpense(cancelTarget.id);
            showToast('Expense claim cancelled', 'info');
          }
        }}
      />
    </div>
  );
}
