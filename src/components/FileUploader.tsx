import React, { useRef } from 'react';
import { FileText, Upload, X } from 'lucide-react';

interface FileUploaderProps {
  label?: string;
  fileName?: string;
  onFileSelect: (name: string | undefined) => void;
  accept?: string;
  helperText?: string;
}

export function FileUploader({
  label = 'Supporting Document',
  fileName,
  onFileSelect,
  accept = '.pdf,.jpg,.jpeg,.png',
  helperText = 'PDF, JPG, or PNG up to 5 MB',
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      {label && <label className="mb-1.5 block text-xs font-medium text-[#475569]">{label}</label>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file.name);
        }}
      />

      {fileName ? (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-[#E5E7F0] bg-[#F7F7FC] px-3 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <FileText className="h-4 w-4 shrink-0 text-[#7050F5]" />
            <span className="truncate text-sm font-medium text-[#0B1230]">{fileName}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              onFileSelect(undefined);
              if (inputRef.current) inputRef.current.value = '';
            }}
            aria-label="Remove file"
            className="rounded p-1 text-[#64748B] hover:bg-white hover:text-[#E05252]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#CBD5E1] bg-[#F7F7FC]/60 px-4 py-3 text-xs font-medium text-[#475569] hover:border-[#7050F5] hover:bg-[#7050F5]/5 hover:text-[#7050F5] transition-colors"
        >
          <Upload className="h-4 w-4 shrink-0" />
          <span>Choose file to attach</span>
          <span className="text-[#94A3B8]">· {helperText}</span>
        </button>
      )}
    </div>
  );
}
