import React from 'react';
import { ArrowRight, Check, Trash2 } from 'lucide-react';
import { NotificationItem } from '../types/ess';

interface NotificationCardProps {
  notification: NotificationItem;
  onOpen: (n: NotificationItem) => void;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationCard({
  notification,
  onOpen,
  onMarkRead,
  onDelete,
}: NotificationCardProps) {
  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        notification.isRead
          ? 'border-[#E5E7F0] bg-white'
          : 'border-[#7050F5]/30 bg-[#7050F5]/[0.03]'
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
            <span className="font-medium text-[#7050F5]">{notification.category}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{notification.timestamp}</span>
            {!notification.isRead && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-[#0B1230]">Unread</span>
              </>
            )}
          </div>
          <h3 className="mt-1 text-sm font-semibold text-[#0B1230]">{notification.title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-[#475569]">{notification.message}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onOpen(notification)}
            className="inline-flex items-center gap-1 rounded-lg border border-[#E5E7F0] bg-white px-3 py-1.5 text-xs font-medium text-[#0B1230] hover:bg-[#F7F7FC] whitespace-nowrap"
          >
            Open Record
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          {!notification.isRead && (
            <button
              type="button"
              onClick={() => onMarkRead(notification.id)}
              title="Mark as read"
              aria-label="Mark as read"
              className="rounded-lg border border-[#E5E7F0] bg-white p-1.5 text-[#64748B] hover:text-[#16A36A]"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onDelete(notification.id)}
            title="Delete notification"
            aria-label="Delete notification"
            className="rounded-lg border border-[#E5E7F0] bg-white p-1.5 text-[#64748B] hover:text-[#E05252]"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
