import React from 'react';
import { ArrowUpRight, LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  meta?: string;
  icon?: LucideIcon;
  onClick?: () => void;
  actionLabel?: string;
  accent?: 'purple' | 'blue' | 'success' | 'warning' | 'navy';
}

const ICON_BG: Record<NonNullable<StatCardProps['accent']>, string> = {
  purple: 'bg-[#7050F5]/10 text-[#7050F5]',
  blue: 'bg-[#478BFA]/10 text-[#478BFA]',
  success: 'bg-[#16A36A]/10 text-[#16A36A]',
  warning: 'bg-[#E9A23B]/12 text-[#B45309]',
  navy: 'bg-[#0B1230]/8 text-[#0B1230]',
};

export function StatCard({
  title,
  value,
  subtitle,
  meta,
  icon: Icon,
  onClick,
  actionLabel,
  accent = 'purple',
}: StatCardProps) {
  const interactive = Boolean(onClick);
  const Wrapper = interactive ? 'button' : 'div';

  return (
    <Wrapper
      type={interactive ? 'button' : undefined}
      onClick={onClick}
      className={`w-full text-left rounded-xl border border-[#E5E7F0] bg-white p-5 transition-all duration-150 ${
        interactive
          ? 'hover:border-[#7050F5]/45 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7050F5]/40 cursor-pointer'
          : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-[#64748B] truncate">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-[#0B1230] tabular-nums">
            {value}
          </p>
        </div>
        {Icon && (
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${ICON_BG[accent]}`}>
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
        )}
      </div>

      {(subtitle || meta || actionLabel) && (
        <div className="mt-3 pt-3 border-t border-[#F1F3F9] flex items-center justify-between gap-2 text-xs text-[#64748B]">
          <span className="truncate">{subtitle ?? meta}</span>
          {actionLabel && (
            <span className="inline-flex items-center gap-1 font-medium text-[#7050F5] whitespace-nowrap shrink-0">
              {actionLabel}
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          )}
        </div>
      )}
    </Wrapper>
  );
}
