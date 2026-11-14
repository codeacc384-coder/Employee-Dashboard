export function formatCurrency(amount: number, currencySymbol = '₹'): string {
  const abs = Math.abs(amount);
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(abs);
  return amount < 0 ? `-${currencySymbol}${formatted}` : `${currencySymbol}${formatted}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr + (dateStr.length === 10 ? 'T00:00:00' : ''));
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTimeDisplay(date: Date): string {
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

export function calculateDaysBetween(startStr: string, endStr: string, durationType: 'Full Day' | 'First Half' | 'Second Half', holidays: string[]): number {
  if (!startStr || !endStr) return 0;
  const start = new Date(startStr + 'T00:00:00');
  const end = new Date(endStr + 'T00:00:00');
  if (end < start) return 0;

  if (durationType !== 'Full Day' && startStr === endStr) {
    return 0.5;
  }

  let count = 0;
  const cursor = new Date(start);
  while (cursor <= end) {
    const day = cursor.getDay();
    const iso = cursor.toISOString().slice(0, 10);
    const isWeekend = day === 0 || day === 6;
    const isHoliday = holidays.includes(iso);
    if (!isWeekend && !isHoliday) {
      count += 1;
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return durationType !== 'Full Day' && count > 0 ? count - 0.5 : count;
}

export function downloadTextFile(filename: string, content: string, mimeType = 'text/plain;charset=utf-8'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
