import React from 'react';
import { Download, Eye, FileText, Lock } from 'lucide-react';
import { EmployeeDocument } from '../types/ess';
import { formatDate } from '../utils/formatters';
import { ApprovalStatusBadge } from './ApprovalStatusBadge';

interface DocumentCardProps {
  document: EmployeeDocument;
  onPreview: (doc: EmployeeDocument) => void;
  onDownload: (doc: EmployeeDocument) => void;
}

export function DocumentCard({ document, onPreview, onDownload }: DocumentCardProps) {
  return (
    <div className="rounded-xl border border-[#E5E7F0] bg-white p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#7050F5]/10 text-[#7050F5]">
            <FileText className="h-5 w-5" />
          </div>
          <ApprovalStatusBadge status={document.verificationStatus} />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-[#0B1230] line-clamp-2">{document.name}</h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-[#64748B]">
          <span>{document.category}</span>
          <span aria-hidden="true">·</span>
          <span>{document.fileSize}</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-[#64748B] tabular-nums">
          <span>Uploaded {formatDate(document.uploadedDate)}</span>
          {document.expiryDate && (
            <>
              <span aria-hidden="true">·</span>
              <span>Expires {formatDate(document.expiryDate)}</span>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[#F1F3F9] flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 text-[11px] text-[#64748B]">
          <Lock className="h-3 w-3" />
          Private
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPreview(document)}
            className="inline-flex items-center gap-1 rounded-lg border border-[#E5E7F0] px-2.5 py-1.5 text-xs font-medium text-[#0B1230] hover:bg-[#F7F7FC] whitespace-nowrap"
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </button>
          <button
            type="button"
            onClick={() => onDownload(document)}
            className="inline-flex items-center gap-1 rounded-lg bg-[#0B1230] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-[#17214D] whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
