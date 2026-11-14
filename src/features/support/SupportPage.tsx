import React, { useEffect, useMemo, useState } from 'react';
import { Lock, Send, ShieldAlert } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { usePortalData } from '../../app/PortalDataContext';
import { useToast } from '../../app/ToastContext';
import { ApprovalStatusBadge } from '../../components/ApprovalStatusBadge';
import { ColumnDef, DataTable } from '../../components/DataTable';
import { DetailDrawer } from '../../components/DetailDrawer';
import { FileUploader } from '../../components/FileUploader';
import { FilterBar } from '../../components/FilterBar';
import { DEMO_FAQS } from '../../mock-data/demoData';
import { SupportCategory, SupportTicket } from '../../types/ess';
import { formatDate } from '../../utils/formatters';

type SupportTab = 'tickets' | 'raise' | 'faqs';

const CATEGORIES: SupportCategory[] = [
  'General HR Query',
  'Payroll Issue',
  'Payslip Issue',
  'Attendance Issue',
  'Leave Issue',
  'Tax Issue',
  'Reimbursement Issue',
  'Profile Update',
  'Employment Documents',
  'IT Support',
  'Grievance',
];

export function SupportPage() {
  const { tickets, createTicket, replyTicket, closeTicket } = usePortalData();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = (searchParams.get('tab') as SupportTab) || 'tickets';
  const catParam = (searchParams.get('cat') as SupportCategory) || 'General HR Query';

  const [activeTab, setActiveTab] = useState<SupportTab>(tabParam);
  const [category, setCategory] = useState<SupportCategory>(catParam);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [attachment, setAttachment] = useState<string | undefined>();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [faqSearch, setFaqSearch] = useState('');

  useEffect(() => {
    setActiveTab(tabParam);
    if (searchParams.get('cat')) {
      setCategory(searchParams.get('cat') as SupportCategory);
    }
  }, [tabParam, searchParams]);

  const changeTab = (t: SupportTab) => {
    setActiveTab(t);
    setSearchParams({ tab: t });
  };

  const selectedTicket = useMemo(
    () => tickets.find((t) => t.id === selectedTicketId) ?? null,
    [tickets, selectedTicketId]
  );

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      if (statusFilter !== 'All' && t.status !== statusFilter) return false;
      if (
        searchQuery &&
        !t.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !t.subject.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !t.category.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [tickets, statusFilter, searchQuery]);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (subject.trim().length < 5 || description.trim().length < 10) {
      showToast('Provide a clear subject and description', 'error');
      return;
    }
    const created = createTicket({
      category,
      subject: subject.trim(),
      description: description.trim(),
      priority,
      attachmentName: attachment,
    });
    setSubject('');
    setDescription('');
    setAttachment(undefined);
    showToast('Support ticket created', 'success', `Ticket ${created.id} assigned to ${created.assignedDepartment}`);
    changeTab('tickets');
    setSelectedTicketId(created.id);
  };

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;
    replyTicket(selectedTicket.id, replyText.trim());
    setReplyText('');
    showToast('Reply sent', 'success');
  };

  const columns: ColumnDef<SupportTicket>[] = [
    { key: 'id', header: 'Ticket ID', render: (t) => <span className="font-mono-tabular text-xs font-semibold">{t.id}</span> },
    {
      key: 'subj',
      header: 'Subject',
      render: (t) => (
        <div className="flex items-center gap-1.5">
          {t.isConfidentialGrievance && <Lock className="h-3.5 w-3.5 text-[#E05252] shrink-0" />}
          <span className="font-medium truncate max-w-[260px]">{t.subject}</span>
        </div>
      ),
    },
    { key: 'cat', header: 'Category', render: (t) => <span className="text-xs">{t.category}</span> },
    { key: 'dept', header: 'Assigned Dept.', render: (t) => <span className="text-xs text-[#64748B]">{t.assignedDepartment}</span> },
    { key: 'sub', header: 'Submitted', render: (t) => <span className="font-mono-tabular text-xs">{formatDate(t.submittedDate)}</span> },
    { key: 'st', header: 'Status', render: (t) => <ApprovalStatusBadge status={t.status} /> },
  ];

  const filteredFaqs = DEMO_FAQS.filter(
    (f) =>
      !faqSearch ||
      f.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.answer.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1230]">Help & Support</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Raise HR, Payroll, Attendance, Tax, or IT tickets and track official resolutions.
          </p>
        </div>
        <button
          type="button"
          onClick={() => changeTab('raise')}
          className="rounded-lg bg-[#7050F5] px-4 py-2 text-xs font-medium text-white hover:bg-[#5E3FE0] whitespace-nowrap self-start sm:self-auto"
        >
          Raise New Request
        </button>
      </div>

      <div className="flex overflow-x-auto gap-1.5 border-b border-[#E5E7F0] pb-2">
        {[
          { id: 'tickets' as const, label: 'My Support Tickets' },
          { id: 'raise' as const, label: 'Raise HR / IT Request' },
          { id: 'faqs' as const, label: 'FAQs' },
        ].map((t) => (
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

      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <FilterBar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search ticket ID, subject, category..."
            selects={[
              {
                id: 'tkt-status',
                label: 'Status',
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { label: 'All Statuses', value: 'All' },
                  { label: 'Open', value: 'Open' },
                  { label: 'In Progress', value: 'In Progress' },
                  { label: 'Awaiting Employee', value: 'Awaiting Employee' },
                  { label: 'Resolved', value: 'Resolved' },
                  { label: 'Closed', value: 'Closed' },
                ],
              },
            ]}
          />
          <DataTable
            data={filteredTickets}
            columns={columns}
            keyExtractor={(t) => t.id}
            onRowClick={(t) => setSelectedTicketId(t.id)}
          />
        </div>
      )}

      {activeTab === 'raise' && (
        <form onSubmit={handleCreateTicket} className="max-w-2xl rounded-xl border border-[#E5E7F0] bg-white p-6 space-y-4">
          <h2 className="text-base font-semibold text-[#0B1230] border-b border-[#F1F3F9] pb-3">
            Raise Support Request
          </h2>

          {category === 'Grievance' && (
            <div className="flex items-start gap-2.5 rounded-lg border border-[#E05252]/30 bg-[#E05252]/5 p-3.5 text-xs text-[#991B1B]">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <p>
                <strong>Protected Confidential Channel:</strong> Grievances are routed directly to the Ethics & HR Compliance Committee with restricted access. Reporting managers cannot view confidential grievance details.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#475569]">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as SupportCategory)} className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#475569]">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)} className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#475569]">Subject *</label>
            <input required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief summary of your query..." className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#475569]">Description *</label>
            <textarea rows={4} required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Include relevant dates, payslip months, or screenshot details..." className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm" />
          </div>

          <FileUploader label="Attachment (Optional)" fileName={attachment} onFileSelect={setAttachment} />

          <div className="flex justify-end pt-2">
            <button type="submit" className="rounded-lg bg-[#7050F5] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#5E3FE0]">
              Submit Ticket
            </button>
          </div>
        </form>
      )}

      {activeTab === 'faqs' && (
        <div className="space-y-4 max-w-3xl">
          <FilterBar searchValue={faqSearch} onSearchChange={setFaqSearch} searchPlaceholder="Search HR & payroll FAQs..." />
          <div className="space-y-3">
            {filteredFaqs.map((faq) => (
              <div key={faq.id} className="rounded-xl border border-[#E5E7F0] bg-white p-5">
                <p className="text-xs font-medium text-[#7050F5]">{faq.category}</p>
                <h3 className="mt-1 text-sm font-semibold text-[#0B1230]">{faq.question}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#475569]">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <DetailDrawer
        open={Boolean(selectedTicket)}
        onClose={() => setSelectedTicketId(null)}
        title={selectedTicket ? `${selectedTicket.id} — ${selectedTicket.subject}` : ''}
        subtitle={selectedTicket ? `${selectedTicket.category} · ${selectedTicket.assignedDepartment}` : ''}
        footer={
          selectedTicket && selectedTicket.status !== 'Closed' ? (
            <button
              type="button"
              onClick={() => {
                closeTicket(selectedTicket.id);
                showToast('Ticket closed', 'info');
              }}
              className="rounded-lg border border-[#E5E7F0] bg-white px-3.5 py-2 text-xs font-medium text-[#0B1230] hover:bg-[#F7F7FC]"
            >
              Mark Ticket Closed
            </button>
          ) : undefined
        }
      >
        {selectedTicket && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#64748B]">Ticket Status</span>
              <ApprovalStatusBadge status={selectedTicket.status} />
            </div>

            <div className="space-y-3">
              {selectedTicket.messages.map((m) => (
                <div
                  key={m.id}
                  className={`rounded-xl border p-3.5 text-xs ${
                    m.senderRole === 'Employee'
                      ? 'border-[#7050F5]/25 bg-[#7050F5]/[0.04]'
                      : 'border-[#E5E7F0] bg-[#F7F7FC]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                    <span className="font-semibold text-[#0B1230]">
                      {m.senderName} ({m.senderRole})
                    </span>
                    <span className="tabular-nums">{m.timestamp}</span>
                  </div>
                  <p className="mt-1.5 text-sm text-[#0B1230]">{m.message}</p>
                  {m.attachmentName && (
                    <p className="mt-1 text-[11px] text-[#7050F5]">Attachment: {m.attachmentName}</p>
                  )}
                </div>
              ))}
            </div>

            {selectedTicket.status !== 'Closed' && (
              <form onSubmit={handleReply} className="space-y-2.5 border-t border-[#E5E7F0] pt-4">
                <label className="block text-xs font-medium text-[#475569]">Reply to Support Desk</label>
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a follow-up response..."
                  className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#7050F5] px-4 py-2 text-xs font-medium text-white hover:bg-[#5E3FE0]"
                >
                  <Send className="h-3.5 w-3.5" />
                  Send Reply
                </button>
              </form>
            )}
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}
