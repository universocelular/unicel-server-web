import type { SVGProps } from "react";

export function BrandIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <defs>
        <linearGradient id="phone-body-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#374151" />
          <stop offset="100%" stopColor="#111827" />
        </linearGradient>
         <linearGradient id="lock-body-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#facc15" />
        </linearGradient>
        <filter id="phone-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.2"/>
        </filter>
      </defs>
      
      <g filter="url(#phone-shadow)">
        <rect x="25" y="10" width="50" height="80" rx="8" fill="url(#phone-body-grad)" />
        <rect x="28" y="15" width="44" height="64" rx="4" fill="#FFFFFF" />
        <path d="M42 83 h16" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
        
        <g transform="translate(37, 32) scale(1.8)">
          <rect x="2" y="6" width="12" height="9" rx="2" fill="url(#lock-body-grad)" stroke="#eab308" strokeWidth="0.75" />
          <path d="M5 6 V 4 a 3 3 0 1 1 6 0 V 6" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round"/>
        </g>
      </g>
    </svg>
  );
}
