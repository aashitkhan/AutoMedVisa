import React from 'react';

// Brand mark: a passport/document with a verification badge — represents visa checking directly.
export default function Logo({ size = 26, variant = 'dark' }) {
  const stroke = variant === 'light' ? '#f6f5f1' : 'var(--ink)';
  const gold = '#c8912f';
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {/* passport / document outline */}
      <rect x="6" y="4" width="16" height="24" rx="2" stroke={stroke} strokeWidth="1.6" />
      {/* text lines inside the document */}
      <path d="M9.5 9.5H18.5" stroke={stroke} strokeWidth="1.3" strokeLinecap="round" opacity="0.6" />
      <path d="M9.5 13H15.5" stroke={stroke} strokeWidth="1.3" strokeLinecap="round" opacity="0.6" />
      <path d="M9.5 16.5H14" stroke={stroke} strokeWidth="1.3" strokeLinecap="round" opacity="0.6" />
      {/* verification badge, overlapping bottom-right corner of the document */}
      <circle cx="21.5" cy="22.5" r="7" fill={variant === 'light' ? '#16233a' : '#f6f5f1'} stroke={gold} strokeWidth="1.6" />
      <path d="M18.5 22.6L20.6 24.8L24.7 19.8" stroke={gold} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
