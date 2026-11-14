import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileEdit,
  XCircle,
} from 'lucide-react';

interface ApprovalStatusBadgeProps {
  status: string;
}

export function ApprovalStatusBadge({ status }: ApprovalStatusBadgeProps) {
  const normalized = status.toLowerCase();

  let colorClasses = 'text-[#475569] bg-[#F1F5F9] border-[#E2E8F0]';
  let Icon = Clock;

  if (
    ['approved', 'accepted', 'paid', 'published', 'verified', 'official issued', 'completed', 'resolved', 'present', 'available', 'active', 'confirmed'].includes(
      normalized
    )
  ) {
    colorClasses = 'text-[#15803D] bg-[#16A36A]/10 border-[#16A36A]/25';
    Icon = CheckCircle2;
  } else if (
    ['pending approval', 'submitted', 'under review', 'processing', 'scheduled', 'in progress', 'awaiting employee', 'on track', 'queued for payout', 'self-review due', 'pending verification', 'pending hr verification', 'open', 'upcoming'].includes(
      normalized
    )
  ) {
    colorClasses = 'text-[#B45309] bg-[#E9A23B]/12 border-[#E9A23B]/30';
    Icon = Clock;
  } else if (
    ['rejected', 'absent', 'missing punch', 'expired', 'blocked attempt', 'at risk'].includes(normalized)
  ) {
    colorClasses = 'text-[#B91C1C] bg-[#E05252]/10 border-[#E05252]/25';
    Icon = XCircle;
  } else if (
    ['changes requested', 'resubmission required', 'half day'].includes(normalized)
  ) {
    colorClasses = 'text-[#B45309] bg-[#E9A23B]/12 border-[#E9A23B]/30';
    Icon = AlertCircle;
  } else if (['draft', 'cancelled', 'closed', 'used', 'not processed'].includes(normalized)) {
    colorClasses = 'text-[#475569] bg-[#F8FAFC] border-[#E2E8F0]';
    Icon = FileEdit;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap shrink-0 ${colorClasses}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
}
