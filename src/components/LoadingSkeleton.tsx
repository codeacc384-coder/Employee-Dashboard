import React from 'react';

interface LoadingSkeletonProps {
  rows?: number;
}

export function LoadingSkeleton({ rows = 4 }: LoadingSkeletonProps) {
  return (
    <div className="space-y-3 rounded-xl border border-[#E5E7F0] bg-white p-5" aria-busy="true" aria-label="Loading content">
      <div className="h-4 w-1/3 animate-pulse rounded bg-[#ECEEF6]" />
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="flex items-center gap-4 pt-2">
          <div className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-[#F1F3F9]" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-2/3 animate-pulse rounded bg-[#ECEEF6]" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-[#F1F3F9]" />
          </div>
          <div className="h-6 w-20 animate-pulse rounded bg-[#ECEEF6]" />
        </div>
      ))}
    </div>
  );
}
