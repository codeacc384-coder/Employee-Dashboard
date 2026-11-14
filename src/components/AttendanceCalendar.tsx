import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AttendanceDayStatus, AttendanceRecord } from '../types/ess';
import { formatDate } from '../utils/formatters';

interface AttendanceCalendarProps {
  records: AttendanceRecord[];
  onSelectDate?: (record: AttendanceRecord | null, dateIso: string) => void;
}

const STATUS_STYLE: Record<AttendanceDayStatus, { bg: string; text: string; dot: string }> = {
  Present: { bg: 'bg-[#16A36A]/10 border-[#16A36A]/25', text: 'text-[#15803D]', dot: '#16A36A' },
  Absent: { bg: 'bg-[#E05252]/10 border-[#E05252]/25', text: 'text-[#B91C1C]', dot: '#E05252' },
  Leave: { bg: 'bg-[#478BFA]/12 border-[#478BFA]/30', text: 'text-[#1D4ED8]', dot: '#478BFA' },
  Holiday: { bg: 'bg-[#7050F5]/10 border-[#7050F5]/25', text: 'text-[#5B21B6]', dot: '#7050F5' },
  'Weekly Off': { bg: 'bg-[#F1F5F9] border-[#E2E8F0]', text: 'text-[#64748B]', dot: '#94A3B8' },
  'Half Day': { bg: 'bg-[#E9A23B]/15 border-[#E9A23B]/35', text: 'text-[#B45309]', dot: '#E9A23B' },
  'Missing Punch': { bg: 'bg-[#E05252]/15 border-[#E05252]/40', text: 'text-[#B91C1C]', dot: '#E05252' },
};

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function AttendanceCalendar({ records, onSelectDate }: AttendanceCalendarProps) {
  const [monthCursor, setMonthCursor] = useState(() => new Date('2026-11-01T00:00:00'));

  const recordMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    records.forEach((r) => map.set(r.date, r));
    return map;
  }, [records]);

  const year = monthCursor.getFullYear();
  const month = monthCursor.getMonth();
  const monthTitle = monthCursor.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const firstDay = new Date(year, month, 1);
  const offset = (firstDay.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const changeMonth = (delta: number) => {
    setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  return (
    <div className="rounded-xl border border-[#E5E7F0] bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-[#0B1230]">Monthly Attendance Calendar</h3>
          <p className="text-xs text-[#64748B]">Click any date to inspect shift punches and status</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            aria-label="Previous month"
            className="rounded-lg border border-[#E5E7F0] p-1.5 text-[#475569] hover:bg-[#F7F7FC] hover:text-[#0B1230]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[130px] text-center text-sm font-semibold text-[#0B1230]">
            {monthTitle}
          </span>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            aria-label="Next month"
            className="rounded-lg border border-[#E5E7F0] p-1.5 text-[#475569] hover:bg-[#F7F7FC] hover:text-[#0B1230]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-xs font-medium text-[#64748B]">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1.5">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} className="h-14 rounded-lg bg-[#F7F7FC]/40" />;
          }
          const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const rec = recordMap.get(iso) ?? null;
          const style = rec ? STATUS_STYLE[rec.status] : null;
          const isToday = iso === '2026-11-14';

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelectDate?.(rec, iso)}
              title={rec ? `${formatDate(iso)}: ${rec.status}` : formatDate(iso)}
              className={`flex h-14 flex-col items-start justify-between rounded-lg border p-1.5 text-left transition-colors ${
                style
                  ? `${style.bg} ${style.text}`
                  : 'border-[#E5E7F0] bg-white text-[#475569] hover:bg-[#F7F7FC]'
              } ${isToday ? 'ring-2 ring-[#7050F5]' : ''}`}
            >
              <span className="text-xs font-semibold tabular-nums">{day}</span>
              {rec ? (
                <span className="w-full truncate text-[10px] font-medium leading-tight">
                  {rec.status === 'Weekly Off' ? 'Off' : rec.status === 'Missing Punch' ? 'Missing' : rec.status}
                </span>
              ) : (
                <span className="text-[10px] text-[#94A3B8]">—</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#F1F3F9] pt-3 text-xs text-[#475569]">
        {(Object.keys(STATUS_STYLE) as AttendanceDayStatus[]).map((status) => (
          <div key={status} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: STATUS_STYLE[status].dot }}
              aria-hidden="true"
            />
            <span>{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
