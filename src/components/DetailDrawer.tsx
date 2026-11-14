import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DetailDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function DetailDrawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
}: DetailDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#0B1230]/40" role="dialog" aria-modal="true">
      <div className="flex h-full w-full max-w-lg flex-col border-l border-[#E5E7F0] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#E5E7F0] px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-[#0B1230] truncate">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-[#64748B]">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#F7F7FC] hover:text-[#0B1230]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && (
          <div className="border-t border-[#E5E7F0] bg-[#F7F7FC] px-5 py-3.5 flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
