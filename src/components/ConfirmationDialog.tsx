import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

export function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
}: ConfirmationDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1230]/45 p-4"
      role="alertdialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-2xl border border-[#E5E7F0] bg-white p-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              destructive ? 'bg-[#E05252]/12 text-[#E05252]' : 'bg-[#7050F5]/12 text-[#7050F5]'
            }`}
          >
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-[#0B1230]">{title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-[#64748B]">{description}</p>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#E5E7F0] bg-white px-4 py-2 text-sm font-medium text-[#0B1230] hover:bg-[#F7F7FC] whitespace-nowrap shrink-0"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white whitespace-nowrap shrink-0 ${
              destructive ? 'bg-[#E05252] hover:bg-[#C53E3E]' : 'bg-[#7050F5] hover:bg-[#5E3FE0]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
