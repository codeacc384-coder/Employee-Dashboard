import React from 'react';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { TimelineEvent } from '../types/ess';

interface RequestTimelineProps {
  events: TimelineEvent[];
}

export function RequestTimeline({ events }: RequestTimelineProps) {
  return (
    <ol className="space-y-4">
      {events.map((ev, idx) => {
        const isLast = idx === events.length - 1;
        return (
          <li key={ev.id} className="relative flex gap-3">
            {!isLast && (
              <span
                aria-hidden="true"
                className="absolute left-3 top-6 bottom-[-16px] w-px bg-[#E5E7F0]"
              />
            )}
            <div className="relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white">
              {ev.status === 'completed' ? (
                <CheckCircle2 className="h-5 w-5 text-[#16A36A]" />
              ) : ev.status === 'rejected' ? (
                <XCircle className="h-5 w-5 text-[#E05252]" />
              ) : (
                <Clock className="h-5 w-5 text-[#E9A23B]" />
              )}
            </div>
            <div className="min-w-0 flex-1 pb-1">
              <p className="text-sm font-medium text-[#0B1230]">{ev.label}</p>
              <p className="mt-0.5 text-xs text-[#64748B]">
                {ev.actor} <span aria-hidden="true">·</span> <span className="tabular-nums">{ev.timestamp}</span>
              </p>
              {ev.note && (
                <p className="mt-1.5 rounded-lg bg-[#F7F7FC] px-3 py-2 text-xs text-[#334155]">
                  {ev.note}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
