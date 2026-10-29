import React, { useId } from 'react';

// StudySaathi brand mark: an open book with a spark. Inline SVG, so it never fails to load.
export default function LogoMark({ className = 'h-9 w-9' }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className={className} viewBox="0 0 40 40" role="img" aria-label="StudySaathi AI logo" focusable="false">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5a3fc4" />
          <stop offset="0.65" stopColor="#3b2597" />
          <stop offset="1" stopColor="#2a1a78" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill={`url(#${id}-bg)`} />
      <rect x="0.75" y="0.75" width="38.5" height="38.5" rx="11.25" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="1.5" />
      <path
        d="M20 14.5c-2.4-1.9-5.6-2.5-9-2v13.6c3.4-.5 6.6.1 9 2 2.4-1.9 5.6-2.5 9-2V12.5c-3.4-.5-6.6.1-9 2Z"
        fill="#fff"
        fillOpacity="0.95"
      />
      <path d="M20 14.5v13.1" stroke="#5236c2" strokeOpacity="0.5" strokeWidth="1.4" strokeLinecap="round" />
      <path d="m30.5 6.5.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1Z" fill="#f0cf7a" />
    </svg>
  );
}
