import React from 'react';
import { AlertCircle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { ToastVariant, useToast } from '../app/ToastContext';

const VARIANT_STYLES: Record<ToastVariant, { icon: React.ElementType; border: string; iconColor: string }> = {
  success: { icon: CheckCircle2, border: 'border-[#16A36A]/35', iconColor: 'text-[#16A36A]' },
  error: { icon: XCircle, border: 'border-[#E05252]/35', iconColor: 'text-[#E05252]' },
  warning: { icon: AlertCircle, border: 'border-[#E9A23B]/45', iconColor: 'text-[#B45309]' },
  info: { icon: Info, border: 'border-[#478BFA]/35', iconColor: 'text-[#478BFA]' },
};

export function ToastNotifications() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-20 right-4 z-50 flex w-full max-w-sm flex-col gap-2 sm:bottom-5 sm:right-5 pointer-events-none"
    >
      {toasts.map((toast) => {
        const cfg = VARIANT_STYLES[toast.variant];
        const Icon = cfg.icon;
        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border ${cfg.border} bg-white p-3.5 shadow-lg`}
          >
            <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${cfg.iconColor}`} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#0B1230]">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 text-xs text-[#64748B]">{toast.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="rounded p-1 text-[#94A3B8] hover:bg-[#F7F7FC] hover:text-[#0B1230]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
