import React, { useEffect, useState } from 'react';
import { Award, CheckCircle2, MessageSquarePlus } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { usePortalData } from '../../app/PortalDataContext';
import { useToast } from '../../app/ToastContext';
import { ApprovalStatusBadge } from '../../components/ApprovalStatusBadge';
import { DataTable } from '../../components/DataTable';
import { downloadTextFile, formatDate } from '../../utils/formatters';

type PerfTab = 'goals' | 'kpis' | 'reviews' | 'feedback' | 'history' | 'training';

export function PerformancePage() {
  const { goals, updateGoalProgress, kpis, reviews, trainings, updateTrainingProgress } = usePortalData();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = (searchParams.get('tab') as PerfTab) || 'goals';
  const [activeTab, setActiveTab] = useState<PerfTab>(tabParam);

  useEffect(() => {
    setActiveTab(tabParam);
  }, [tabParam]);

  const changeTab = (t: PerfTab) => {
    setActiveTab(t);
    setSearchParams({ tab: t });
  };

  // Feedback state
  const [feedbackTarget, setFeedbackTarget] = useState('Self-Reflection (Q4 2026)');
  const [feedbackNote, setFeedbackNote] = useState('');
  const [submittedFeedbacks, setSubmittedFeedbacks] = useState([
    { id: 'fb-1', target: 'Priya Nair (Manager Feedback)', date: '2026-10-08', note: 'Consistently delivers high-reliability backend services and mentors peers effectively.' },
  ]);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackNote.trim()) return;
    setSubmittedFeedbacks((prev) => [
      { id: `fb-${Date.now()}`, target: feedbackTarget, date: '2026-11-14', note: feedbackNote.trim() },
      ...prev,
    ]);
    setFeedbackNote('');
    showToast('Feedback recorded', 'success');
  };

  const tabs: { id: PerfTab; label: string }[] = [
    { id: 'goals', label: 'My Goals' },
    { id: 'kpis', label: 'My KPIs' },
    { id: 'reviews', label: 'Performance Reviews' },
    { id: 'feedback', label: 'Feedback' },
    { id: 'history', label: 'Appraisal History' },
    { id: 'training', label: 'Training & Development' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0B1230]">Performance & Growth</h1>
        <p className="mt-1 text-sm text-[#64748B]">
          Track quarterly OKRs, key performance indicators, review cycles, and assigned trainings.
        </p>
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

      {activeTab === 'goals' && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {goals.map((g) => (
            <div key={g.id} className="rounded-xl border border-[#E5E7F0] bg-white p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-[#0B1230]">{g.title}</h2>
                  <p className="mt-1 text-xs text-[#64748B]">{g.description}</p>
                </div>
                <ApprovalStatusBadge status={g.status} />
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-[#475569]">
                <span>Target: <strong className="text-[#0B1230]">{g.targetMetric}</strong></span>
                <span aria-hidden="true">·</span>
                <span>Weightage: <strong className="font-mono-tabular">{g.weightage}%</strong></span>
                <span aria-hidden="true">·</span>
                <span>Due: <strong className="font-mono-tabular">{formatDate(g.dueDate)}</strong></span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#475569]">Progress</span>
                  <span className="font-mono-tabular font-semibold text-[#7050F5]">{g.progress}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={g.progress}
                  aria-label={`Progress for ${g.title}`}
                  onChange={(e) => {
                    updateGoalProgress(g.id, Number(e.target.value));
                  }}
                  onMouseUp={() => showToast('Goal progress updated', 'success')}
                  className="w-full accent-[#7050F5] cursor-pointer"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'kpis' && (
        <DataTable
          data={kpis}
          keyExtractor={(k) => k.id}
          columns={[
            { key: 'name', header: 'KPI Metric', render: (k) => <span className="font-semibold">{k.name}</span> },
            { key: 'period', header: 'Review Period', render: (k) => k.reviewPeriod },
            { key: 'target', header: 'Target', render: (k) => <span className="font-mono-tabular">{k.target}</span> },
            { key: 'actual', header: 'Actual', render: (k) => <span className="font-mono-tabular font-semibold text-[#0B1230]">{k.actual}</span> },
            {
              key: 'ach',
              header: 'Achievement',
              align: 'right',
              render: (k) => <span className="font-mono-tabular font-bold text-[#16A36A]">{k.achievementPct}%</span>,
            },
          ]}
        />
      )}

      {(activeTab === 'reviews' || activeTab === 'history') && (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div key={rev.id} className="rounded-xl border border-[#E5E7F0] bg-white p-5 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-[#0B1230]">{rev.cycleName}</h2>
                  <p className="text-xs text-[#64748B]">
                    Reviewer: {rev.reviewerName} · Review Date: {formatDate(rev.reviewDate)}
                  </p>
                </div>
                <ApprovalStatusBadge status={rev.status} />
              </div>
              <div className="rounded-lg bg-[#F7F7FC] p-3.5 text-sm">
                <p className="text-xs font-medium text-[#64748B]">Overall Rating</p>
                <p className="mt-0.5 font-semibold text-[#0B1230]">{rev.rating}</p>
                <p className="mt-2 text-xs text-[#475569]">{rev.summaryFeedback}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <form onSubmit={handleFeedbackSubmit} className="lg:col-span-5 rounded-xl border border-[#E5E7F0] bg-white p-5 space-y-4 h-fit">
            <div className="flex items-center gap-2">
              <MessageSquarePlus className="h-4 w-4 text-[#7050F5]" />
              <h2 className="text-base font-semibold text-[#0B1230]">Submit Feedback / Self-Note</h2>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#475569]">Context</label>
              <select value={feedbackTarget} onChange={(e) => setFeedbackTarget(e.target.value)} className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm">
                <option value="Self-Reflection (Q4 2026)">Self-Reflection (Q4 2026)</option>
                <option value="Manager Check-in Note">Manager Check-in Note</option>
                <option value="Peer Appreciation Note">Peer Appreciation Note</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#475569]">Feedback *</label>
              <textarea rows={4} required value={feedbackNote} onChange={(e) => setFeedbackNote(e.target.value)} placeholder="Share accomplishments, blockers, or recognition..." className="w-full rounded-lg border border-[#E5E7F0] px-3 py-2 text-sm" />
            </div>
            <button type="submit" className="w-full rounded-lg bg-[#7050F5] px-4 py-2 text-xs font-medium text-white hover:bg-[#5E3FE0]">
              Save Feedback
            </button>
          </form>

          <div className="lg:col-span-7 space-y-3">
            {submittedFeedbacks.map((fb) => (
              <div key={fb.id} className="rounded-xl border border-[#E5E7F0] bg-white p-4">
                <div className="flex items-center justify-between text-xs text-[#64748B]">
                  <span className="font-semibold text-[#0B1230]">{fb.target}</span>
                  <span className="font-mono-tabular">{formatDate(fb.date)}</span>
                </div>
                <p className="mt-2 text-sm text-[#475569]">{fb.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'training' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trainings.map((tr) => (
            <div key={tr.id} className="rounded-xl border border-[#E5E7F0] bg-white p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <Award className="h-5 w-5 text-[#7050F5] shrink-0" />
                  <ApprovalStatusBadge status={tr.status} />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-[#0B1230]">{tr.title}</h3>
                <p className="mt-1 text-xs text-[#64748B]">{tr.provider} · Assigned {formatDate(tr.assignedDate)}</p>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#64748B]">Completion</span>
                    <span className="font-mono-tabular font-semibold">{tr.progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#F1F3F9] overflow-hidden">
                    <div className="h-full bg-[#7050F5]" style={{ width: `${tr.progress}%` }} />
                  </div>
                </div>

                {tr.hasCertificate ? (
                  <button
                    type="button"
                    onClick={() => {
                      downloadTextFile(`${tr.id}_Certificate.txt`, `Certificate of Completion: ${tr.title}\nCompleted on: ${tr.completionDate}`);
                      showToast('Training certificate downloaded', 'success');
                    }}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#E5E7F0] px-3 py-2 text-xs font-medium text-[#0B1230] hover:bg-[#F7F7FC]"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#16A36A]" />
                    Download Certificate
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const next = Math.min(100, tr.progress + 35);
                      updateTrainingProgress(tr.id, next);
                      showToast(next >= 100 ? 'Course completed!' : 'Module progress saved', 'success');
                    }}
                    className="w-full rounded-lg bg-[#7050F5] px-3 py-2 text-xs font-medium text-white hover:bg-[#5E3FE0]"
                  >
                    {tr.progress === 0 ? 'Start Module' : 'Continue (+35%)'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
