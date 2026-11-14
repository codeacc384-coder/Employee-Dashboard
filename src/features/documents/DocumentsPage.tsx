import React, { useEffect, useMemo, useState } from 'react';
import { FilePlus2, Lock, Upload } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext';
import { usePortalData } from '../../app/PortalDataContext';
import { useToast } from '../../app/ToastContext';
import { ApprovalStatusBadge } from '../../components/ApprovalStatusBadge';
import { DataTable } from '../../components/DataTable';
import { DocumentCard } from '../../components/DocumentCard';
import { EmptyState } from '../../components/EmptyState';
import { FileUploader } from '../../components/FileUploader';
import { FilterBar } from '../../components/FilterBar';
import { FormModal } from '../../components/FormModal';
import { DocumentCategory, EmployeeDocument } from '../../types/ess';
import { downloadTextFile, formatDate } from '../../utils/formatters';

const CATEGORIES: ('All' | DocumentCategory)[] = [
  'All',
  'Employment Documents',
  'Identity Documents',
  'Salary Documents',
  'Tax Documents',
  'Performance Documents',
  'Other Documents',
];

export function DocumentsPage() {
  const { currentUser, activeCompany } = useAuth();
  const { documents, uploadDocument, documentRequests, requestNewDocument } = usePortalData();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  const initialCat = (searchParams.get('category') as 'All' | DocumentCategory) || 'All';
  const initialDocSearch = searchParams.get('doc') || '';
  const initialRequestType = searchParams.get('request') || '';

  const [categoryFilter, setCategoryFilter] = useState<'All' | DocumentCategory>(initialCat);
  const [searchQuery, setSearchQuery] = useState(initialDocSearch);
  const [previewDoc, setPreviewDoc] = useState<EmployeeDocument | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(Boolean(initialRequestType));

  // Upload form
  const [upName, setUpName] = useState('');
  const [upCategory, setUpCategory] = useState<DocumentCategory>('Identity Documents');
  const [upFile, setUpFile] = useState<string | undefined>();

  // Request document form
  const [reqType, setReqType] = useState(initialRequestType || 'Experience Certificate');
  const [reqPurpose, setReqPurpose] = useState('');

  useEffect(() => {
    const cat = searchParams.get('category') as 'All' | DocumentCategory | null;
    const doc = searchParams.get('doc');
    const req = searchParams.get('request');
    if (cat) setCategoryFilter(cat);
    if (doc !== null) setSearchQuery(doc);
    if (req) {
      setReqType(req);
      setRequestOpen(true);
    }
  }, [searchParams]);

  const filteredDocs = useMemo(() => {
    return documents.filter((d) => {
      if (categoryFilter !== 'All' && d.category !== categoryFilter) return false;
      if (
        searchQuery &&
        !d.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !d.docType.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [documents, categoryFilter, searchQuery]);

  const handleDownloadDoc = (doc: EmployeeDocument) => {
    if (!currentUser) return;
    const content = [
      `PAYFUSE PRIVATE DOCUMENT VAULT`,
      `Company: ${activeCompany.companyName}`,
      `Employee: ${currentUser.fullName} (${currentUser.employeeCode})`,
      `Document: ${doc.name}`,
      `Category: ${doc.category}`,
      `Status: ${doc.verificationStatus}`,
      `Summary: ${doc.previewSummary}`,
    ].join('\n');
    downloadTextFile(`${doc.name.replace(/[^a-zA-Z0-9]+/g, '_')}.txt`, content);
    showToast('Document downloaded', 'success');
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!upName.trim() || !upFile) {
      showToast('Provide a document title and select a file', 'error');
      return;
    }
    uploadDocument({
      name: upName.trim(),
      docType: 'Employee Upload',
      category: upCategory,
      fileSize: '340 KB',
      previewSummary: `Uploaded by employee (${upFile}) for HR verification.`,
    });
    setUploadOpen(false);
    setUpName('');
    setUpFile(undefined);
    showToast('Document uploaded securely', 'success', 'Queued for HR verification.');
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqPurpose.trim()) return;
    requestNewDocument(reqType, reqPurpose.trim());
    setRequestOpen(false);
    setReqPurpose('');
    showToast('Document request submitted', 'success', `${reqType} requested from HR Operations.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1230]">My Documents</h1>
          <p className="mt-1 text-sm text-[#64748B] flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-[#7050F5]" />
            Private encrypted document vault scoped exclusively to your employment account.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setRequestOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7F0] bg-white px-3.5 py-2 text-xs font-medium text-[#0B1230] hover:bg-[#F7F7FC] whitespace-nowrap"
          >
            <FilePlus2 className="h-3.5 w-3.5" />
            Request Letter
          </button>
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#7050F5] px-4 py-2 text-xs font-medium text-white hover:bg-[#5E3FE0] whitespace-nowrap"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload Document
          </button>
        </div>
      </div>

      {/* Category Filter Pills (Interactive tabs) */}
      <div className="flex overflow-x-auto gap-1.5 border-b border-[#E5E7F0] pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`rounded-lg px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              categoryFilter === cat
                ? 'bg-[#7050F5] text-white'
                : 'bg-white text-[#475569] border border-[#E5E7F0] hover:text-[#0B1230]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search letters, Form 16, policies..."
      />

      {filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredDocs.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onPreview={setPreviewDoc}
              onDownload={handleDownloadDoc}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No documents match your filter"
          description="Try clearing the search query or selecting All categories."
          actionLabel="Show All Documents"
          onAction={() => {
            setCategoryFilter('All');
            setSearchQuery('');
          }}
        />
      )}

      {documentRequests.length > 0 && (
        <div className="space-y-3 pt-2">
          <h2 className="text-base font-semibold text-[#0B1230]">Document Requests</h2>
          <DataTable
            data={documentRequests}
            keyExtractor={(r) => r.id}
            columns={[
              { key: 'id', header: 'Request ID', render: (r) => <span className="font-mono-tabular text-xs font-semibold">{r.id}</span> },
              { key: 'type', header: 'Requested Document', render: (r) => <span className="font-medium">{r.documentType}</span> },
              { key: 'purpose', header: 'Purpose', render: (r) => <span className="text-xs text-[#475569]">{r.purpose}</span> },
              { key: 'date', header: 'Requested On', render: (r) => <span className="font-mono-tabular text-xs">{formatDate(r.requestedDate)}</span> },
              { key: 'status', header: 'Status', render: (r) => <ApprovalStatusBadge status={r.status} /> },
            ]}
          />
        </div>
      )}

      {/* Preview Modal */}
      <FormModal open={Boolean(previewDoc)} onClose={() => setPreviewDoc(null)} title={previewDoc?.name ?? ''}>
        {previewDoc && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#64748B]">{previewDoc.category}</span>
              <ApprovalStatusBadge status={previewDoc.verificationStatus} />
            </div>
            <div className="rounded-lg bg-[#F7F7FC] p-4 text-xs leading-relaxed text-[#334155]">
              {previewDoc.previewSummary}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => handleDownloadDoc(previewDoc)}
                className="rounded-lg bg-[#7050F5] px-4 py-2 text-xs font-medium text-white hover:bg-[#5E3FE0]"
              >
                Download Copy
              </button>
            </div>
          </div>
        )}
      </FormModal>

      {/* Upload Modal */}
      <FormModal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload Private Document">
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#475569]">Document Title *</label>
            <input required value={upName} onChange={(e) => setUpName(e.target.value)} placeholder="e.g. Passport Copy / Address Proof" className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#475569]">Category</label>
            <select value={upCategory} onChange={(e) => setUpCategory(e.target.value as DocumentCategory)} className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm">
              {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <FileUploader label="Select File *" fileName={upFile} onFileSelect={setUpFile} />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setUploadOpen(false)} className="rounded-lg border border-[#E5E7F0] px-4 py-2 text-xs font-medium">Cancel</button>
            <button type="submit" className="rounded-lg bg-[#7050F5] px-4 py-2 text-xs font-medium text-white">Upload</button>
          </div>
        </form>
      </FormModal>

      {/* Request New Document Modal */}
      <FormModal open={requestOpen} onClose={() => setRequestOpen(false)} title="Request Official Document">
        <form onSubmit={handleRequestSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#475569]">Document Type</label>
            <select value={reqType} onChange={(e) => setReqType(e.target.value)} className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm">
              <option value="Experience Certificate">Experience Certificate</option>
              <option value="Relieving Letter">Relieving Letter</option>
              <option value="Bonafide Employment Letter">Bonafide Employment Letter</option>
              <option value="Address Verification Letter">Address Verification Letter</option>
              <option value="Salary Certificate">Salary Certificate</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#475569]">Purpose *</label>
            <textarea rows={3} required value={reqPurpose} onChange={(e) => setReqPurpose(e.target.value)} placeholder="e.g. Visa application, housing lease, bank loan..." className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setRequestOpen(false)} className="rounded-lg border border-[#E5E7F0] px-4 py-2 text-xs font-medium">Cancel</button>
            <button type="submit" className="rounded-lg bg-[#7050F5] px-4 py-2 text-xs font-medium text-white">Submit Request</button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
