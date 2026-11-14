import React from 'react';
import { LeaveBalanceItem } from '../types/ess';

interface LeaveBalanceCardProps {
  balance: LeaveBalanceItem;
  onApply?: (code: LeaveBalanceItem['code']) => void;
}

export function LeaveBalanceCard({ balance, onApply }: LeaveBalanceCardProps) {
  const pct = balance.entitlement > 0 ? Math.min(100, Math.round((balance.available / balance.entitlement) * 100)) : 0;

  return (
    <div className="rounded-xl border border-[#E5E7F0] bg-white p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-[#0B1230]">{balance.name}</p>
          <span className="font-mono-tabular text-xs text-[#64748B]">{balance.code}</span>
        </div>

        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-3xl font-bold text-[#0B1230] tabular-nums">{balance.available}</span>
          <span className="text-xs text-[#64748B] tabular-nums">/ {balance.entitlement} days available</span>
        </div>

        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#F1F3F9]">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${pct}%`, backgroundColor: balance.color }}
          />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#F1F3F9] flex items-center justify-between text-xs text-[#64748B]">
        <div className="flex items-center gap-3 tabular-nums">
          <span>Used: {balance.used}</span>
          <span aria-hidden="true">·</span>
          <span>Pending: {balance.pending}</span>
        </div>
        {onApply && (
          <button
            type="button"
            onClick={() => onApply(balance.code)}
            className="font-medium text-[#7050F5] hover:text-[#5E3FE0] whitespace-nowrap shrink-0"
          >
            Apply
          </button>
        )}
      </div>
    </div>
  );
}
