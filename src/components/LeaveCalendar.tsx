import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HolidayItem, LeaveRequest } from '../types/ess';

interface LeaveCalendarProps {
  leaveRequests: LeaveRequest[];
  holidays: HolidayItem[];
}

export function LeaveCalendar({ leaveRequests, holidays }: LeaveCalendarProps) {
  const [view, setView] = useState<'Monthly' | 'Weekly'>('Monthly');
  const [monthCursor, setMonthCursor] = useState(() => new Date('2026-11-01T00:00:00'));

  const year = monthCursor.getFullYear();
  const month = monthCursor.getMonth();
  const monthTitle = monthCursor.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const holidayMap = new Map(holidays.map((h) => [h.date, h]));

  const getLeaveForDate = (iso: string) =>
    leaveRequests.find(
      (r) =>
        r.status !== 'Cancelled' &&
        r.status !== 'Rejected' &&
        iso >= r.startDate &&
        iso <= r.endDate
    );

  const firstDay = new Date(year, month, 1);
  const offset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthCells = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Weekly view: current week around 2026-11-16
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const dt = new Date('2026-11-16T00:00:00');
    dt.setDate(dt.getDate() + i);
    return dt;
  });

  return (
    <div className="rounded-xl border border-[#E5E7F0] bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-[#0B1230]">Leave & Holiday Calendar</h3>
          <p className="text-xs text-[#64748B]">Your approved leave, pending requests, holidays, and weekly offs</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg bg-[#F7F7FC] p-1 border border-[#E5E7F0]">
            {(['Monthly', 'Weekly'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                  view === v ? 'bg-white text-[#0B1230] shadow-sm' : 'text-[#64748B] hover:text-[#0B1230]'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          {view === 'Monthly' && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setMonthCursor((p) => new Date(p.getFullYear(), p.getMonth() - 1, 1))}
                aria-label="Previous month"
                className="rounded-lg border border-[#E5E7F0] p-1.5 text-[#475569] hover:bg-[#F7F7FC]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-[120px] text-center text-sm font-semibold text-[#0B1230]">
                {monthTitle}
              </span>
              <button
                type="button"
                onClick={() => setMonthCursor((p) => new Date(p.getFullYear(), p.getMonth() + 1, 1))}
                aria-label="Next month"
                className="rounded-lg border border-[#E5E7F0] p-1.5 text-[#475569] hover:bg-[#F7F7FC]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {view === 'Monthly' ? (
        <div className="mt-4 grid grid-cols-7 gap-1.5">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} className="py-1.5 text-center text-xs font-medium text-[#64748B]">
              {d}
            </div>
          ))}
          {monthCells.map((day, idx) => {
            if (!day) return <div key={`e-${idx}`} className="h-16 rounded-lg bg-[#F7F7FC]/40" />;
            const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dt = new Date(iso + 'T00:00:00');
            const isWeekend = dt.getDay() === 0 || dt.getDay() === 6;
            const holiday = holidayMap.get(iso);
            const leave = getLeaveForDate(iso);

            let boxClass = 'border-[#E5E7F0] bg-white text-[#0B1230]';
            let label = '';
            if (holiday) {
              boxClass = 'border-[#7050F5]/30 bg-[#7050F5]/10 text-[#5B21B6]';
              label = holiday.name;
            } else if (leave) {
              boxClass =
                leave.status === 'Approved'
                  ? 'border-[#16A36A]/30 bg-[#16A36A]/10 text-[#15803D]'
                  : 'border-[#E9A23B]/35 bg-[#E9A23B]/15 text-[#B45309]';
              label = `${leave.leaveTypeCode} (${leave.status === 'Approved' ? 'Approved' : 'Pending'})`;
            } else if (isWeekend) {
              boxClass = 'border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]';
              label = 'Weekly Off';
            }

            return (
              <div key={iso} className={`flex h-16 flex-col justify-between rounded-lg border p-1.5 ${boxClass}`}>
                <span className="text-xs font-semibold tabular-nums">{day}</span>
                {label && <span className="truncate text-[10px] font-medium">{label}</span>}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-7">
          {weekDays.map((dt) => {
            const iso = dt.toISOString().slice(0, 10);
            const isWeekend = dt.getDay() === 0 || dt.getDay() === 6;
            const holiday = holidayMap.get(iso);
            const leave = getLeaveForDate(iso);
            return (
              <div key={iso} className="rounded-lg border border-[#E5E7F0] bg-[#F7F7FC]/60 p-3">
                <p className="text-xs font-semibold text-[#0B1230]">
                  {dt.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}
                </p>
                <p className="mt-2 text-xs text-[#475569]">
                  {holiday
                    ? holiday.name
                    : leave
                    ? `${leave.leaveTypeName} (${leave.status})`
                    : isWeekend
                    ? 'Weekly Off'
                    : 'Scheduled Workday'}
                </p>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-[#F1F3F9] pt-3 text-xs text-[#475569]">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#16A36A]" /> Approved Leave
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#E9A23B]" /> Pending Leave
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#7050F5]" /> Holiday
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#94A3B8]" /> Weekly Off
        </span>
      </div>
    </div>
  );
}
