import React, { useState } from 'react';

interface SafeAvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<SafeAvatarProps['size']>, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-xl',
};

export function SafeAvatar({ src, name, size = 'md', className = '' }: SafeAvatarProps) {
  const [failed, setFailed] = useState(false);

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

  if (!src || failed) {
    return (
      <div
        aria-label={name}
        className={`inline-flex shrink-0 items-center justify-center rounded-full bg-[#0B1230] font-semibold text-white ${SIZE_CLASSES[size]} ${className}`}
      >
        {initials || 'PF'}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`shrink-0 rounded-full object-cover border border-[#E5E7F0] bg-[#F7F7FC] ${SIZE_CLASSES[size]} ${className}`}
    />
  );
}
