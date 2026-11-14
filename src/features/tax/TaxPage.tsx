import React, { useEffect, useMemo, useState } from 'react';
import { Download, Eye, Info, Plus, Printer } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext';
import { usePortalData } from '../../app/PortalDataContext';
import { useToast } from '../../app/ToastContext';
import { ApprovalStatusBadge } from '../../components/ApprovalStatusBadge';
import { ColumnDef, DataTable } from '../../components/DataTable';
import { FileUploader } from '../../components/FileUploader';
import { FormModal } from '../../components/FormModal';
import { StatCard } from '../../components/StatCard';
import { TaxDeclarationItem } from '../../types/ess';
import { downloadTextFile, formatCurrency, formatDate } from '../../utils/formatters';

type TaxTab =
  | 'overview'
  | 'regime'
  | 'declarations'
  | 'proofs'
  | 'hra'
  | 'previous'
  | 'computation'
  | 'form16';

export function TaxPage() {
  const { currentUser, activeCompany, updateCurrentUserProfile } = useAuth();
  const { taxDeclarations, addOrUpdateTaxDeclaration, previousEmployers, addPreviousEmployer, payslips, documents } = usePortalData();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = (searchParams.get('tab') as TaxTab) || 'overview';
  const [activeTab, setActiveTab] = useState<TaxTab>(tabParam);

  useEffect(() => {
    setActiveTab(tabParam);
  }, [tabParam]);

  const changeTab = (t: TaxTab) => {
    setActiveTab(t);
    setSearchParams({ tab: t });
  };

  const sym = activeCompany.currencySymbol;
  const latest = payslips[0];
  const estimatedAnnualIncome = (latest?.grossEarnings ?? 142000) * 12;
  const totalDeclaredDeductions = taxDeclarations.reduce((s, d) => s + Math.min(d.declaredAmount, d.maxLimit), 0);
  const tdsDeductedYtd = payslips
    .filter((p) => p.financialYear === 'FY 2026-27')
    .reduce((s, p) => s + p.deductions.tds, 0);

  // Indicative Regime Comparison
  const newRegimeTaxable = Math.max(0, estimatedAnnualIncome - 75000);
  const oldRegimeTaxable = Math.max(0, estimatedAnnualIncome - 50000 - totalDeclaredDeductions);
  const newRegimeTax = Math.round(newRegimeTaxable * 0.125);
  const oldRegimeTax = Math.round(oldRegimeTaxable * 0.165);
  const selectedRegime = currentUser?.statutoryInfo.taxRegime ?? 'New Regime';
  const activeEstimatedTax = selectedRegime === 'New Regime' ? newRegimeTax : oldRegimeTax;
  const remainingTax = Math.max(0, activeEstimatedTax - tdsDeductedYtd);

  // Declaration modal
  const [declModalOpen, setDeclModalOpen] = useState(false);
  const [section, setSection] = useState<TaxDeclarationItem['section']>('Section 80C');
  const [desc, setDesc] = useState('');
  const [declaredAmt, setDeclaredAmt] = useState('50000');
  const [actualAmt, setActualAmt] = useState('50000');
  const [proofDoc, setProofDoc] = useState<string | undefined>();

  // Previous employer modal
  const [prevModalOpen, setPrevModalOpen] = useState(false);
  const [prevName, setPrevName] = useState('');
  const [prevFrom, setPrevFrom] = useState('');
  const [prevTo, setPrevTo] = useState('');
  const [prevGross, setPrevGross] = useState('');
  const [prevTax, setPrevTax] = useState('');
  const [prevDoc, setPrevDoc] = useState<string | undefined>();

  // Form 16 preview
  const [previewForm16, setPreviewForm16] = useState(false);

  const handleSaveDeclaration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !desc.trim()) return;
    const limits: Record<TaxDeclarationItem['section'], number> = {
      'Section 80C': 150000,
      'Section 80D': 50000,
      'HRA Exemption': 400000,
      'Home Loan Interest (Sec 24)': 200000,
      'NPS (80CCD 1B)': 50000,
      'Other Eligible Deductions': 100000,
    };
    addOrUpdateTaxDeclaration({
      id: `TAX-${Date.now()}`,
      employeeId: currentUser.id,
      financialYear: 'FY 2026-27',
      section,
      description: desc.trim(),
      maxLimit: limits[section],
      declaredAmount: Number(declaredAmt) || 0,
      actualAmount: Number(actualAmt) || 0,
      supportingDocName: proofDoc,
      submittedDate: '2026-11-14',
      status: proofDoc ? 'Submitted' : 'Draft',
    });
    setDeclModalOpen(false);
    setDesc('');
    setProofDoc(undefined);
    showToast('Tax declaration saved', 'success');
  };

  const handleAddPrevEmployer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prevName.trim()) return;
    addPreviousEmployer({
      employerName: prevName.trim(),
      periodFrom: prevFrom,
      periodTo: prevTo,
      grossSalaryReceived: Number(prevGross) || 0,
      taxDeducted: Number(prevTax) || 0,
      form16FileName: prevDoc,
    });
    setPrevModalOpen(false);
    setPrevName('');
    showToast('Previous employer record submitted', 'success');
  };

  const declColumns: ColumnDef<TaxDeclarationItem>[] = [
    { key: 'sec', header: 'Category', render: (t) => <span className="font-semibold">{t.section}</span> },
    { key: 'desc', header: 'Description', render: (t) => <span className="text-xs text-[#475569]">{t.description}</span> },
    { key: 'decl', header: 'Declared', align: 'right', render: (t) => <span className="font-mono-tabular">{formatCurrency(t.declaredAmount, sym)}</span> },
    { key: 'act', header: 'Actual Proof', align: 'right', render: (t) => <span className="font-mono-tabular font-semibold">{formatCurrency(t.actualAmount, sym)}</span> },
    { key: 'doc', header: 'Document', render: (t) => <span className="text-xs text-[#64748B]">{t.supportingDocName ?? 'Pending upload'}</span> },
    { key: 'status', header: 'Verification', render: (t) => <ApprovalStatusBadge status={t.status} /> },
  ];

  const tabs: { id: TaxTab; label: string }[] = [
    { id: 'overview', label: 'Tax Overview' },
    { id: 'regime', label: 'Tax Regime Selection' },
    { id: 'declarations', label: 'Investment Declarations' },
    { id: 'proofs', label: 'Tax Proof Submission' },
    { id: 'hra', label: 'HRA Declaration' },
    { id: 'previous', label: 'Previous Employer Details' },
    { id: 'computation', label: 'Tax Computation' },
    { id: 'form16', label: 'Form 16' },
  ];

  const form16Docs = useMemo(
    () => documents.filter((d) => d.category === 'Tax Documents' || d.docType === 'Form 16'),
    [documents]
  );

  if (!currentUser) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1230]">Tax & Declarations</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Financial Year 2026-27 · Manage tax regime preferences, declarations, proofs, and Form 16.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDeclModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#7050F5] px-4 py-2 text-xs font-medium text-white hover:bg-[#5E3FE0] whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Declaration
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Selected Tax Regime" value={selectedRegime} subtitle="FY 2026-27" accent="purple" />
            <StatCard title="Estimated Annual Income" value={formatCurrency(estimatedAnnualIncome, sym)} subtitle="Projected gross" accent="navy" />
            <StatCard title="Tax Already Deducted" value={formatCurrency(tdsDeductedYtd, sym)} subtitle="YTD TDS deducted" accent="success" />
            <StatCard title="Remaining Estimated Tax" value={formatCurrency(remainingTax, sym)} subtitle={`Out of ${formatCurrency(activeEstimatedTax, sym)} est.`} accent="warning" />
          </div>

          <div className="rounded-xl border border-[#E5E7F0] bg-white p-5 flex items-start gap-3 text-xs text-[#475569]">
            <Info className="h-4 w-4 text-[#478BFA] shrink-0 mt-0.5" />
            <p>
              Tax estimates shown in this portal are indicative projections based on declared investments and current compensation. Final tax liability is subject to applicable statutory tax rules and payroll proof verification.
            </p>
          </div>
        </div>
      )}

      {activeTab === 'regime' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[
              {
                name: 'New Regime' as const,
                taxable: newRegimeTaxable,
                tax: newRegimeTax,
                desc: 'Lower slab rates with standard deduction; most Chapter VI-A exemptions excluded.',
              },
              {
                name: 'Old Regime' as const,
                taxable: oldRegimeTaxable,
                tax: oldRegimeTax,
                desc: 'Traditional slab structure allowing Section 80C, 80D, HRA, and Home Loan deductions.',
              },
            ].map((reg) => {
              const active = selectedRegime === reg.name;
              return (
                <div
                  key={reg.name}
                  className={`rounded-xl border p-5 bg-white ${
                    active ? 'border-[#7050F5] ring-2 ring-[#7050F5]/15' : 'border-[#E5E7F0]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-[#0B1230]">{reg.name}</h2>
                    {active && <ApprovalStatusBadge status="Active" />}
                  </div>
                  <p className="mt-1.5 text-xs text-[#64748B]">{reg.desc}</p>
                  <div className="mt-4 space-y-2 border-t border-[#F1F3F9] pt-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Estimated Taxable Income</span>
                      <span className="font-mono-tabular font-medium">{formatCurrency(reg.taxable, sym)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Indicative Annual Tax</span>
                      <span className="font-mono-tabular font-bold text-[#0B1230]">{formatCurrency(reg.tax, sym)}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={active}
                    onClick={() => {
                      updateCurrentUserProfile({
                        statutoryInfo: { ...currentUser.statutoryInfo, taxRegime: reg.name },
                      });
                      showToast(`Switched to ${reg.name}`, 'success', 'Indicative TDS projection updated.');
                    }}
                    className={`mt-4 w-full rounded-lg px-4 py-2 text-xs font-medium transition-colors ${
                      active
                        ? 'bg-[#F7F7FC] text-[#64748B] cursor-default'
                        : 'bg-[#7050F5] text-white hover:bg-[#5E3FE0]'
                    }`}
                  >
                    {active ? 'Currently Selected' : `Select ${reg.name}`}
                  </button>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-[#64748B]">
            Note: Tax comparisons are indicative and subject to applicable statutory tax rules for FY 2026-27.
          </p>
        </div>
      )}

      {(activeTab === 'declarations' || activeTab === 'proofs') && (
        <DataTable
          data={taxDeclarations}
          columns={declColumns}
          keyExtractor={(t) => t.id}
        />
      )}

      {activeTab === 'hra' && (
        <div className="rounded-xl border border-[#E5E7F0] bg-white p-5 space-y-4 max-w-2xl">
          <div className="flex items-center justify-between border-b border-[#F1F3F9] pb-3">
            <h2 className="text-base font-semibold text-[#0B1230]">HRA Exemption Declaration</h2>
            <button
              type="button"
              onClick={() => {
                setSection('HRA Exemption');
                setDeclModalOpen(true);
              }}
              className="rounded-lg bg-[#7050F5] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-[#5E3FE0]"
            >
              Update HRA Details
            </button>
          </div>
          {taxDeclarations
            .filter((d) => d.section === 'HRA Exemption')
            .map((hra) => (
              <div key={hra.id} className="space-y-2 text-sm">
                <p className="font-medium text-[#0B1230]">{hra.description}</p>
                <div className="flex gap-6 text-xs text-[#64748B]">
                  <span>Declared Annual Rent: <strong className="font-mono-tabular text-[#0B1230]">{formatCurrency(hra.declaredAmount, sym)}</strong></span>
                  <span>Submitted Proofs: <strong className="font-mono-tabular text-[#0B1230]">{formatCurrency(hra.actualAmount, sym)}</strong></span>
                </div>
                <ApprovalStatusBadge status={hra.status} />
              </div>
            ))}
        </div>
      )}

      {activeTab === 'previous' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setPrevModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7F0] bg-white px-3.5 py-2 text-xs font-medium text-[#0B1230] hover:bg-[#F7F7FC]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Previous Employer
            </button>
          </div>
          <DataTable
            data={previousEmployers}
            keyExtractor={(p) => p.id}
            columns={[
              { key: 'name', header: 'Previous Employer', render: (p) => <span className="font-semibold">{p.employerName}</span> },
              { key: 'period', header: 'Employment Period', render: (p) => <span className="font-mono-tabular text-xs">{formatDate(p.periodFrom)} – {formatDate(p.periodTo)}</span> },
              { key: 'sal', header: 'Salary Received', align: 'right', render: (p) => <span className="font-mono-tabular">{formatCurrency(p.grossSalaryReceived, sym)}</span> },
              { key: 'tax', header: 'Tax Deducted', align: 'right', render: (p) => <span className="font-mono-tabular">{formatCurrency(p.taxDeducted, sym)}</span> },
              { key: 'doc', header: 'Form 16', render: (p) => <span className="text-xs text-[#64748B]">{p.form16FileName ?? '—'}</span> },
              { key: 'status', header: 'Status', render: (p) => <ApprovalStatusBadge status={p.status} /> },
            ]}
          />
        </div>
      )}

      {activeTab === 'computation' && (
        <div className="rounded-xl border border-[#E5E7F0] bg-white p-6 max-w-2xl space-y-3 text-sm">
          <h2 className="text-base font-semibold text-[#0B1230] border-b border-[#F1F3F9] pb-3">
            Tax Computation Worksheet ({selectedRegime})
          </h2>
          {[
            ['Estimated Annual Salary', formatCurrency(estimatedAnnualIncome, sym)],
            ['Standard & Eligible Deductions', `-${formatCurrency(selectedRegime === 'New Regime' ? 75000 : 50000 + totalDeclaredDeductions, sym)}`],
            ['Estimated Taxable Income', formatCurrency(selectedRegime === 'New Regime' ? newRegimeTaxable : oldRegimeTaxable, sym)],
            ['Estimated Annual Tax Liability', formatCurrency(activeEstimatedTax, sym)],
            ['TDS Deducted YTD', `-${formatCurrency(tdsDeductedYtd, sym)}`],
            ['Remaining Estimated Tax (FY 2026-27)', formatCurrency(remainingTax, sym)],
          ].map(([label, val], idx) => (
            <div
              key={label}
              className={`flex items-center justify-between py-2 ${idx === 5 ? 'border-t border-[#E5E7F0] font-bold text-base' : ''}`}
            >
              <span className="text-[#475569]">{label}</span>
              <span className="font-mono-tabular text-[#0B1230]">{val}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'form16' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {form16Docs.map((doc) => (
            <div key={doc.id} className="rounded-xl border border-[#E5E7F0] bg-white p-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-[#0B1230]">{doc.name}</h3>
                <p className="mt-1 text-xs text-[#64748B]">Issued {formatDate(doc.issuedDate ?? doc.uploadedDate)} · {doc.fileSize}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setPreviewForm16(true)}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#E5E7F0] px-3 py-1.5 text-xs font-medium hover:bg-[#F7F7FC]"
                >
                  <Eye className="h-3.5 w-3.5" /> View
                </button>
                <button
                  type="button"
                  onClick={() => {
                    downloadTextFile(`Form16_FY2025-26_${currentUser.employeeCode}.txt`, doc.previewSummary);
                    showToast('Form 16 downloaded', 'success');
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#7050F5] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#5E3FE0]"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Declaration Modal */}
      <FormModal open={declModalOpen} onClose={() => setDeclModalOpen(false)} title="Add Investment Declaration">
        <form onSubmit={handleSaveDeclaration} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#475569]">Declaration Category</label>
            <select value={section} onChange={(e) => setSection(e.target.value as TaxDeclarationItem['section'])} className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm">
              <option value="Section 80C">Section 80C</option>
              <option value="Section 80D">Section 80D</option>
              <option value="HRA Exemption">HRA Exemption</option>
              <option value="Home Loan Interest (Sec 24)">Home Loan Interest (Sec 24)</option>
              <option value="NPS (80CCD 1B)">NPS (80CCD 1B)</option>
              <option value="Other Eligible Deductions">Other Eligible Deductions</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#475569]">Description *</label>
            <input required value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="e.g. PPF / Term Insurance / Rent" className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#475569]">Declared Amount</label>
              <input type="number" value={declaredAmt} onChange={(e) => setDeclaredAmt(e.target.value)} className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm font-mono-tabular" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#475569]">Actual Proof Amount</label>
              <input type="number" value={actualAmt} onChange={(e) => setActualAmt(e.target.value)} className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm font-mono-tabular" />
            </div>
          </div>
          <FileUploader label="Supporting Proof Document" fileName={proofDoc} onFileSelect={setProofDoc} />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setDeclModalOpen(false)} className="rounded-lg border border-[#E5E7F0] px-4 py-2 text-xs font-medium">Cancel</button>
            <button type="submit" className="rounded-lg bg-[#7050F5] px-4 py-2 text-xs font-medium text-white hover:bg-[#5E3FE0]">Save Declaration</button>
          </div>
        </form>
      </FormModal>

      {/* Previous Employer Modal */}
      <FormModal open={prevModalOpen} onClose={() => setPrevModalOpen(false)} title="Add Previous Employer Details">
        <form onSubmit={handleAddPrevEmployer} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#475569]">Employer Name *</label>
            <input required value={prevName} onChange={(e) => setPrevName(e.target.value)} className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#475569]">Period From</label>
              <input type="date" required value={prevFrom} onChange={(e) => setPrevFrom(e.target.value)} className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#475569]">Period To</label>
              <input type="date" required value={prevTo} onChange={(e) => setPrevTo(e.target.value)} className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#475569]">Salary Received</label>
              <input type="number" required value={prevGross} onChange={(e) => setPrevGross(e.target.value)} className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm font-mono-tabular" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#475569]">Tax Deducted</label>
              <input type="number" required value={prevTax} onChange={(e) => setPrevTax(e.target.value)} className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm font-mono-tabular" />
            </div>
          </div>
          <FileUploader label="Supporting Form 16" fileName={prevDoc} onFileSelect={setPrevDoc} />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setPrevModalOpen(false)} className="rounded-lg border border-[#E5E7F0] px-4 py-2 text-xs font-medium">Cancel</button>
            <button type="submit" className="rounded-lg bg-[#7050F5] px-4 py-2 text-xs font-medium text-white">Submit Details</button>
          </div>
        </form>
      </FormModal>

      <FormModal open={previewForm16} onClose={() => setPreviewForm16(false)} title="Form 16 — Part A & Part B (FY 2025-26)">
        <div className="space-y-4 text-sm">
          <p className="text-xs text-[#64748B]">TRACES Verified Certificate · Employer: {activeCompany.companyName}</p>
          <div className="rounded-lg bg-[#F7F7FC] p-4 space-y-2 text-xs">
            <div className="flex justify-between"><span>Employee Name</span><strong>{currentUser.fullName}</strong></div>
            <div className="flex justify-between"><span>PAN (Masked)</span><strong className="font-mono-tabular">{currentUser.statutoryInfo.panMasked}</strong></div>
            <div className="flex justify-between"><span>Assessment Year</span><strong>2026-27</strong></div>
            <div className="flex justify-between"><span>Total TDS Deposited</span><strong className="font-mono-tabular">{formatCurrency(148600, sym)}</strong></div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7F0] px-3.5 py-2 text-xs font-medium">
              <Printer className="h-3.5 w-3.5" /> Print
            </button>
          </div>
        </div>
      </FormModal>
    </div>
  );
}
