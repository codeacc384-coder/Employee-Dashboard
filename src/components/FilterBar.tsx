import React from 'react';
import { SearchInput } from './SearchInput';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterSelectConfig {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: FilterOption[];
}

interface FilterBarProps {
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  selects?: FilterSelectConfig[];
  rightAction?: React.ReactNode;
}

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  selects = [],
  rightAction,
}: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2.5">
        {onSearchChange !== undefined && (
          <SearchInput
            value={searchValue ?? ''}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            className="w-full sm:w-64"
          />
        )}
        {selects.map((sel) => (
          <div key={sel.id} className="flex items-center gap-2">
            <label htmlFor={sel.id} className="sr-only">
              {sel.label}
            </label>
            <select
              id={sel.id}
              value={sel.value}
              onChange={(e) => sel.onChange(e.target.value)}
              className="rounded-lg border border-[#E5E7F0] bg-white px-3 py-2 text-sm text-[#0B1230] focus:border-[#7050F5] focus:outline-none focus:ring-2 focus:ring-[#7050F5]/15"
            >
              {sel.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      {rightAction && <div className="shrink-0">{rightAction}</div>}
    </div>
  );
}
