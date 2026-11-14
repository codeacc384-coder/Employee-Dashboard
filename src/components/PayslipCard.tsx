import React from 'react';
import { Download, Eye } from 'lucide-react';
import { PayslipRecord } from '../types/ess';
import { formatCurrency } from '../utils/formatters';
import { ApprovalStatusBadge } from './ApprovalStatusBadge';

interface PayslipCardProps {
  payslip: PayslipRecord;
  currencySymbol?: string;
  onPreview: (payslip: PayslipRecord) => void;
  onDownload: (payslip: PayslipRecord) => void;
}

export function PayslipCard({
  payslip,
  currencySymbol = '₹',
  onPreview,
  onDownload,
}: PayslipCardProps) {
  return (
    <div className="rounded-xl border border-[#E5E7F0] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-[#64748B]">{payslip.financialYear}</p>
          <h3 className="mt-0.5 text-base font-semibold text-[#0B1230]">{payslip.monthLabel}</h3>
        </div>
        <ApprovalStatusBadge status={payslip.paymentStatus} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 border-t border-[#F1F3F9] pt-4 text-xs">
        <div>
          <p className="text-[#64748B]">Gross</p>
          <p className="mt-0.5 font-mono-tabular font-semibold text-[#0B1230]">
            {formatCurrency(payslip.grossEarnings, currencySymbol)}
          </p>
        </div>
        <div>
          <p className="text-[#64748B]">Deductions</p>
          <p className="mt-0.5 font-mono-tabular font-semibold text-[#E05252]">
            {formatCurrency(payslip.totalDeductions, currencySymbol)}
          </p>
        </div>
        <div>
          <p className="text-[#64748B]">Net Pay</p>
          <p className="mt-0.5 font-mono-tabular font-semibold text-[#16A36A]">
            {formatCurrency(payslip.netPay, currencySymbol)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 pt-3 border-t border-[#F1F3F9]">
        <button
          type="button"
          onClick={() => onPreview(payslip)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#E5E7F0] bg-white px-3 py-2 text-xs font-medium text-[#0B1230] hover:bg-[#F7F7FC] whitespace-nowrap"
        >
          <Eye className="h-3.5 w-3.5" />
          Preview
        </button>
        <button
          type="button"
          onClick={() => onDownload(payslip)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#7050F5] px-3 py-2 text-xs font-medium text-white hover:bg-[#5E3FE0] whitespace-nowrap"
        >
          <Download className="h-3.5 w-3.5" />
          Download
        </button>
      </div>
    </div>
  );
}
