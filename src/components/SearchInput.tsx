import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  ariaLabel = 'Search',
}: SearchInputProps) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="pointer-events-none absolute left-3 h-4 w-4 text-[#64748B]" aria-hidden="true" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="w-full rounded-lg border border-[#E5E7F0] bg-white py-2 pl-9 pr-8 text-sm text-[#0B1230] placeholder:text-[#94A3B8] focus:border-[#7050F5] focus:outline-none focus:ring-2 focus:ring-[#7050F5]/15"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-2 rounded p-1 text-[#64748B] hover:bg-[#F7F7FC] hover:text-[#0B1230]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
