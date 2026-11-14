import React from 'react';
import { Building2, Mail, MapPin, UserCheck } from 'lucide-react';
import { EmployeeProfile } from '../types/ess';
import { ApprovalStatusBadge } from './ApprovalStatusBadge';
import { SafeAvatar } from './SafeAvatar';
import { formatDate } from '../utils/formatters';

interface ProfileCardProps {
  employee: EmployeeProfile;
  compact?: boolean;
  actionButton?: React.ReactNode;
}

export function ProfileCard({ employee, compact = false, actionButton }: ProfileCardProps) {
  return (
    <div className="rounded-xl border border-[#E5E7F0] bg-white p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <SafeAvatar src={employee.avatarUrl} name={employee.fullName} size={compact ? 'lg' : 'xl'} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-lg font-bold text-[#0B1230] truncate">{employee.fullName}</h2>
              <ApprovalStatusBadge status={employee.employmentStatus} />
            </div>
            <p className="mt-0.5 text-sm font-medium text-[#475569] truncate">
              {employee.designation} <span aria-hidden="true">·</span> {employee.department}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#64748B]">
              <span className="font-mono-tabular">ID: {employee.employeeCode}</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Reports to {employee.reportingManagerName}
              </span>
              {!compact && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Joined {formatDate(employee.joiningDate)}</span>
                </>
              )}
            </div>
          </div>
        </div>
        {actionButton && <div className="shrink-0">{actionButton}</div>}
      </div>

      {!compact && (
        <div className="mt-4 pt-4 border-t border-[#F1F3F9] grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs text-[#475569]">
          <div className="flex items-center gap-2 truncate">
            <Mail className="h-3.5 w-3.5 text-[#64748B] shrink-0" />
            <span className="truncate">{employee.email}</span>
          </div>
          <div className="flex items-center gap-2 truncate">
            <Building2 className="h-3.5 w-3.5 text-[#64748B] shrink-0" />
            <span className="truncate">{employee.branch} · {employee.employmentType}</span>
          </div>
          <div className="flex items-center gap-2 truncate">
            <MapPin className="h-3.5 w-3.5 text-[#64748B] shrink-0" />
            <span className="truncate">{employee.workLocation}</span>
          </div>
        </div>
      )}
    </div>
  );
}
