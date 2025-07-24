
import type { SVGProps } from "react";

const flagProps: SVGProps<SVGSVGElement> = {
  width: "20",
  height: "15",
  viewBox: "0 0 20 15",
  className: "rounded-sm"
};

export function DollarSignIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...flagProps} {...props} viewBox="0 0 20 15">
       <text 
        x="50%" 
        y="55%" 
        dominantBaseline="middle" 
        textAnchor="middle" 
        fontSize="12" 
        fontWeight="bold" 
        className="fill-green-600 dark:fill-green-500"
      >
        $
      </text>
    </svg>
  );
}

export function GlobeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...flagProps} {...props}>
        <defs>
            <linearGradient id="dollar-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#dcedc8" />
                <stop offset="100%" stopColor="#a5d6a7" />
            </linearGradient>
             <linearGradient id="seal-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2e7d32" />
                <stop offset="100%" stopColor="#1b5e20" />
            </linearGradient>
        </defs>
        <rect width="20" height="15" rx="1" fill="url(#dollar-grad)" stroke="#4caf50" strokeWidth="0.2" />
        <rect x="1" y="1" width="18" height="13" rx="0.5" fill="none" stroke="#66bb6a" strokeWidth="0.3" strokeDasharray="0.5 0.5" />
        
        {/* "Portrait" area */}
        <circle cx="10" cy="7.5" r="3.5" fill="#ffffff" opacity="0.5"/>
        <circle cx="10" cy="7.5" r="3" fill="none" stroke="#81c784" strokeWidth="0.2"/>
        <path d="M10,5.5 A 1.5,2 0 0,1 10,9.5 A 1.5,2 0 0,1 10,5.5" fill="#a5d6a7" />
        <path d="M9,6.5 Q 10,5, 11,6.5" stroke="#4caf50" strokeWidth="0.3" fill="none"/>

        {/* Details */}
        <text x="3" y="4.5" fontSize="2.5" fontWeight="bold" fill="#2e7d32" textAnchor="middle">1</text>
        <text x="17" y="12.5" fontSize="2.5" fontWeight="bold" fill="#2e7d32" textAnchor="middle">1</text>
        
        {/* Seal */}
        <circle cx="16" cy="4" r="2" fill="url(#seal-grad)" />
        <text x="16" y="4.5" fontSize="2" fill="white" textAnchor="middle" fontWeight="bold">$</text>
    </svg>
  );
}

export function ArgentinaFlag(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...flagProps} {...props}>
      <rect width="20" height="15" fill="#75AADB" />
      <rect width="20" height="5" y="5" fill="#fff" />
      <g transform="translate(10 7.5)">
        <circle r="1.875" fill="#F8B12C" />
        <circle r="1.25" fill="#fff" />
      </g>
    </svg>
  );
}

export function BoliviaFlag(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...flagProps} {...props}>
      <rect width="20" height="15" fill="#D52B1E" />
      <rect width="20" height="5" y="5" fill="#F8B12C" />
      <rect width="20" height="5" y="10" fill="#007934" />
    </svg>
  );
}

export function BrazilFlag(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...flagProps} {...props}>
      <rect width="20" height="15" fill="#009B3A" />
      <path d="M10 2L3 7.5L10 13L17 7.5z" fill="#FFCC29" />
      <circle cx="10" cy="7.5" r="3.5" fill="#002776" />
    </svg>
  );
}

export function CanadaFlag(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...flagProps} {...props}>
      <rect width="20" height="15" fill="#fff" />
      <rect width="5" height="15" x="0" fill="#FF0000" />
      <rect width="5" height="15" x="15" fill="#FF0000" />
      <path d="M10 4.5 l-1.5 2 h-2 l2.5 1.5 l-1 3 l1.5 -2 l1.5 2 l-1 -3 l2.5 -1.5 h-2 Z" fill="#FF0000" />
    </svg>
  );
}

export function ChileFlag(props: SVGProps<SVGSVGElement>) {
    return (
        <svg {...flagProps} {...props}>
            <rect width="20" height="15" fill="#d52b1e" />
            <rect width="20" height="7.5" fill="#fff" />
            <rect width="7.5" height="7.5" fill="#0039a6" />
            <polygon points="3.75,2.5 4.5,4.5 2.5,3.25 5,3.25 3,4.5" fill="#fff"/>
        </svg>
    )
}

export function ColombiaFlag(props: SVGProps<SVGSVGElement>) {
    return (
        <svg {...flagProps} {...props}>
            <rect width="20" height="15" fill="#fcd116"/>
            <rect width="20" height="7.5" y="7.5" fill="#003893"/>
            <rect width="20" height="3.75" y="11.25" fill="#ce1126"/>
        </svg>
    )
}

export function MexicoFlag(props: SVGProps<SVGSVGElement>) {
    return (
        <svg {...flagProps} {...props}>
            <rect width="20" height="15" fill="#fff"/>
            <rect width="6.67" height="15" fill="#006847"/>
            <rect width="6.67" height="15" x="13.33" fill="#ce1126"/>
            <g transform="translate(10, 7.5) scale(0.4)">
                <path d="M-1-15c-3,0-5,2-5,5v5h2v-5c0-2,1-3,3-3s3,1,3,3v5h2v-5c0-3-2-5-5-5z" fill="#a47e3a"/>
                <path d="M0,0l-2,3h4z" fill="#006847"/>
            </g>
        </svg>
    )
}

export function PeruFlag(props: SVGProps<SVGSVGElement>) {
    return (
        <svg {...flagProps} {...props}>
            <rect width="20" height="15" fill="#D91023"/>
            <rect width="6.67" height="15" x="6.67" fill="#fff"/>
        </svg>
    )
}

export function UnitedStatesFlag(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...flagProps} {...props}>
      <rect width="20" height="15" fill="#BB133E" />
      <g fill="#fff">
        <rect width="20" height="1.15" y="2.3" />
        <rect width="20" height="1.15" y="5.75" />
        <rect width="20" height="1.15" y="9.2" />
        <rect width="20" height="1.15" y="12.65" />
      </g>
      <rect width="10" height="8.05" fill="#002664" />
    </svg>
  );
}

export function GermanyFlag(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...flagProps} {...props}>
      <rect width="20" height="15" fill="#000" />
      <rect width="20" height="5" y="5" fill="#D00" />
      <rect width="20" height="5" y="10" fill="#FFCE00" />
    </svg>
  );
}

export function SpainFlag(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...flagProps} {...props}>
      <rect width="20" height="15" fill="#C60B1E" />
      <rect width="20" height="7.5" y="3.75" fill="#FFC400" />
    </svg>
  );
}

export function FranceFlag(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...flagProps} {...props}>
      <rect width="20" height="15" fill="#ED2939" />
      <rect width="13.33" height="15" fill="#fff" />
      <rect width="6.67" height="15" fill="#002395" />
    </svg>
  );
}

export function UnitedKingdomFlag(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...flagProps} {...props}>
      <rect width="20" height="15" fill="#012169"/>
      <path d="M0,0L20,15M20,0L0,15" stroke="#fff" strokeWidth="3"/>
      <path d="M0,0L20,15M20,0L0,15" stroke="#C8102E" strokeWidth="2"/>
      <path d="M10,0V15M0,7.5H20" stroke="#fff" strokeWidth="5"/>
      <path d="M10,0V15M0,7.5H20" stroke="#C8102E" strokeWidth="3"/>
    </svg>
  );
}

export function ItalyFlag(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...flagProps} {...props}>
      <rect width="20" height="15" fill="#009246"/>
      <rect width="13.33" height="15" fill="#fff"/>
      <rect width="6.67" height="15" fill="#CE2B37"/>
    </svg>
  );
}

export function ChinaFlag(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...flagProps} {...props}>
      <rect width="20" height="15" fill="#ee1c25"/>
      <g fill="#ffde00" transform="translate(3.75,3.75) scale(0.25)">
        <path id="star" d="M0-15l4.4,12.8L-7.2-5h14.4L-4.4,12.8z"/>
        <use href="#star" transform="rotate(72)"/>
        <use href="#star" transform="rotate(144)"/>
        <use href="#star" transform="rotate(216)"/>
        <use href="#star" transform="rotate(288)"/>
      </g>
    </svg>
  );
}

export function IndiaFlag(props: SVGProps<SVGSVGElement>) {
    return (
        <svg {...flagProps} {...props}>
            <rect width="20" height="15" fill="#FF9933"/>
            <rect width="20" height="5" y="5" fill="#FFF"/>
            <rect width="20" height="5" y="10" fill="#138808"/>
            <circle cx="10" cy="7.5" r="1.5" fill="none" stroke="#000080" strokeWidth="0.5"/>
            <g transform="translate(10,7.5)">
                {[...Array(24)].map((_, i) => (
                    <line key={i} x1="0" y1="0" x2="0" y2="1.5" stroke="#000080" strokeWidth="0.2" transform={`rotate(${i * 15})`}/>
                ))}
            </g>
        </svg>
    )
}

export function JapanFlag(props: SVGProps<SVGSVGElement>) {
    return (
        <svg {...flagProps} {...props}>
            <rect width="20" height="15" fill="#fff"/>
            <circle cx="10" cy="7.5" r="4.5" fill="#bc002d"/>
        </svg>
    )
}

export function SouthKoreaFlag(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...flagProps} {...props}>
      <rect width="20" height="15" fill="#fff"/>
      <g stroke="#000" strokeWidth="1.25">
        <path d="M3,4h3M3,5h3M3,6h3" />
        <path d="M17,4h-3M17,5h-3M17,6h-3" transform="translate(0,5)" />
        <path d="M3,9h3m-3,1h3m-3,1h3" transform="rotate(180, 10, 7.5)" />
        <path d="M17,9h-3m-3,1h3m-3,1h3" transform="rotate(180, 10, 7.5) translate(0,5)" />
      </g>
       <g transform="translate(10,7.5) rotate(315) scale(0.65)">
        <circle cx="0" cy="0" r="4" fill="#CD2E3A"/>
        <path d="M0,4A4,4,0,0,0,0-4Z" fill="#0047A0"/>
      </g>
    </svg>
  );
}
