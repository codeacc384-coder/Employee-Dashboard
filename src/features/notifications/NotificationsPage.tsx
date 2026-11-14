import React, { useEffect, useMemo, useState } from 'react';
import { CheckCheck } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePortalData } from '../../app/PortalDataContext';
import { useToast } from '../../app/ToastContext';
import { EmptyState } from '../../components/EmptyState';
import { NotificationCard } from '../../components/NotificationCard';
import { NotificationCategory } from '../../types/ess';

const CATEGORIES: ('All' | NotificationCategory)[] = [
  'All',
  'Payroll',
  'Attendance',
  'Leave',
  'Tax',
  'Reimbursements',
  'Company Announcements',
  'General',
];

export function NotificationsPage() {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    notificationPrefs,
    setNotificationPrefs,
  } = usePortalData();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialCat = (searchParams.get('cat') as 'All' | NotificationCategory) || 'All';
  const [catFilter, setCatFilter] = useState<'All' | NotificationCategory>(initialCat);
  const [readFilter, setReadFilter] = useState<'All' | 'Unread'>('All');

  useEffect(() => {
    const cat = searchParams.get('cat') as 'All' | NotificationCategory | null;
    if (cat) setCatFilter(cat);
  }, [searchParams]);

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (catFilter !== 'All' && n.category !== catFilter) return false;
      if (readFilter === 'Unread' && n.isRead) return false;
      return true;
    });
  }, [notifications, catFilter, readFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0B1230]">Notifications</h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Stay updated on payroll releases, leave approvals, attendance alerts, and company announcements.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            markAllNotificationsRead();
            showToast('All notifications marked as read', 'success');
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5E7F0] bg-white px-3.5 py-2 text-xs font-medium text-[#0B1230] hover:bg-[#F7F7FC] whitespace-nowrap self-start sm:self-auto"
        >
          <CheckCheck className="h-3.5 w-3.5 text-[#7050F5]" />
          Mark All as Read
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E7F0] pb-2">
        <div className="flex overflow-x-auto gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                setCatFilter(c);
                setSearchParams({ cat: c });
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 ${
                catFilter === c
                  ? 'bg-[#7050F5] text-white'
                  : 'bg-white text-[#475569] border border-[#E5E7F0] hover:text-[#0B1230]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex items-center rounded-lg border border-[#E5E7F0] bg-white p-0.5 text-xs">
          {(['All', 'Unread'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setReadFilter(r)}
              className={`rounded-md px-3 py-1 font-medium ${
                readFilter === r ? 'bg-[#0B1230] text-white' : 'text-[#64748B]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-3">
          {filtered.length > 0 ? (
            filtered.map((n) => (
              <NotificationCard
                key={n.id}
                notification={n}
                onOpen={(item) => {
                  markNotificationRead(item.id);
                  navigate(item.targetRoute);
                }}
                onMarkRead={markNotificationRead}
                onDelete={(id) => {
                  deleteNotification(id);
                  showToast('Notification removed', 'info');
                }}
              />
            ))
          ) : (
            <EmptyState
              title="You're all caught up"
              description="No notifications match the selected category or filter."
              actionLabel="Show All Notifications"
              onAction={() => {
                setCatFilter('All');
                setReadFilter('All');
              }}
            />
          )}
        </div>

        {/* Notification Preferences */}
        <div className="lg:col-span-4 rounded-xl border border-[#E5E7F0] bg-white p-5 space-y-4 h-fit">
          <h2 className="text-base font-semibold text-[#0B1230]">Notification Preferences</h2>
          <p className="text-xs text-[#64748B]">Control email and in-app alert delivery</p>
          <div className="space-y-3 text-sm">
            {[
              { key: 'emailPayroll' as const, label: 'Email alerts for Payroll & Payslips' },
              { key: 'emailLeave' as const, label: 'Email alerts for Leave & Expense approvals' },
              { key: 'inAppAttendance' as const, label: 'In-app Missing Punch reminders' },
              { key: 'inAppAnnouncements' as const, label: 'Company Announcements & Policy updates' },
            ].map((pref) => (
              <label key={pref.key} className="flex items-center justify-between gap-3 cursor-pointer">
                <span className="text-xs text-[#334155]">{pref.label}</span>
                <input
                  type="checkbox"
                  checked={notificationPrefs[pref.key]}
                  onChange={(e) => {
                    setNotificationPrefs((p) => ({ ...p, [pref.key]: e.target.checked }));
                    showToast('Preference updated', 'success');
                  }}
                  className="h-4 w-4 accent-[#7050F5]"
                />
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
