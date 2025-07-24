import type { SVGProps } from "react";

export function AttLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 60" {...props}>
      <defs>
        <linearGradient id="att-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00a8e0" />
          <stop offset="100%" stopColor="#003865" />
        </linearGradient>
      </defs>
      <circle cx="30" cy="30" r="25" fill="url(#att-grad)" />
      <circle cx="30" cy="30" r="10" fill="white" />
      <text x="70" y="40" fontFamily="Arial, sans-serif" fontSize="30" fontWeight="bold" fill="#003865">AT&amp;T</text>
    </svg>
  );
}

export function TMobileLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 60" {...props}>
      <rect width="200" height="60" fill="#E20074" rx="10"/>
      <text x="15" y="45" fontFamily="Arial, sans-serif" fontSize="35" fontWeight="bold" fill="white">T-Mobile</text>
    </svg>
  );
}

export function VerizonLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 60" {...props}>
      <text x="5" y="45" fontFamily="Arial, sans-serif" fontSize="40" fontWeight="bold" fill="#000">verizon</text>
      <path d="M160 10 L170 10 L190 40 L180 40 Z" fill="#CD0402"/>
    </svg>
  );
}

export function ClaroLogo(props: SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 150 60" {...props}>
          <text x="5" y="45" fontFamily="Arial, sans-serif" fontSize="40" fontWeight="bold" fill="#DA291C">claro</text>
      </svg>
    )
}

export function MovistarLogo(props: SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 200 60" {...props}>
          <path d="M5,30 C20,5 40,5 55,30 C40,55 20,55 5,30 Z" fill="#00A9E0"/>
          <text x="70" y="45" fontFamily="Arial, sans-serif" fontSize="35" fontWeight="bold" fill="#00387b">movistar</text>
      </svg>
    )
}

export function PersonalLogo(props: SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 180 60" {...props}>
          <text x="5" y="45" fontFamily="Arial, sans-serif" fontSize="40" fontWeight="bold" fill="#000">Personal</text>
      </svg>
    )
}

export function TelcelLogo(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 150 60" {...props}>
            <text x="5" y="45" fontFamily="Arial, sans-serif" fontSize="40" fontWeight="bold" fill="#00529C">telcel</text>
        </svg>
    )
}

export function OrangeLogo(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 160 60" {...props}>
            <rect width="160" height="60" fill="#FF7900" rx="10"/>
            <text x="15" y="45" fontFamily="Arial, sans-serif" fontSize="35" fontWeight="bold" fill="white">orange</text>
        </svg>
    )
}

export function VodafoneLogo(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 200 60" {...props}>
            <path d="M30,5 C15,5 5,15 5,30 C5,45 15,55 30,55 C45,55 55,45 55,30 C55,15 45,5 30,5 Z M30,45 C20,45 15,35 15,30 C15,25 20,15 30,15 C40,15 45,25 45,30 C45,35 40,45 30,45 Z" fill="#E60000"/>
            <text x="70" y="45" fontFamily="Arial, sans-serif" fontSize="35" fontWeight="bold" fill="#E60000">vodafone</text>
        </svg>
    )
}

export function DeutscheTelekomLogo(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 220 60" {...props}>
            <text x="5" y="45" fontFamily="Arial, sans-serif" fontSize="35" fontWeight="bold" fill="#E20074">Telekom</text>
        </svg>
    )
}

export function EeLogo(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 80 60" {...props}>
            <rect width="80" height="60" fill="#00A5B1" rx="10"/>
            <text x="15" y="45" fontFamily="Arial, sans-serif" fontSize="40" fontWeight="bold" fill="white">EE</text>
        </svg>
    )
}

export function O2Logo(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 80 60" {...props}>
            <rect width="80" height="60" fill="#0033A0" rx="10"/>
            <text x="20" y="45" fontFamily="Arial, sans-serif" fontSize="40" fontWeight="bold" fill="white">O₂</text>
        </svg>
    )
}

export function NttDocomoLogo(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 200 60" {...props}>
            <text x="5" y="45" fontFamily="Arial, sans-serif" fontSize="30" fontWeight="bold" fill="#E20074">docomo</text>
        </svg>
    )
}

export function SoftbankLogo(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 200 60" {...props}>
            <rect width="200" height="60" fill="#5F6A72" rx="10"/>
            <text x="15" y="45" fontFamily="Arial, sans-serif" fontSize="35" fontWeight="bold" fill="white">SoftBank</text>
        </svg>
    )
}

export function EntelLogo(props: SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 150 60" {...props}>
        <text x="5" y="45" fontFamily="Arial, sans-serif" fontSize="40" fontWeight="bold" fill="#d40073">entel</text>
      </svg>
    );
}

export function TigoLogo(props: SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 120 60" {...props}>
        <text x="5" y="45" fontFamily="Arial, sans-serif" fontSize="40" fontWeight="bold" fill="#005f9e">Tigo</text>
      </svg>
    );
}

export function VivoLogo(props: SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 120 60" {...props}>
        <text x="5" y="45" fontFamily="Arial, sans-serif" fontSize="40" fontWeight="bold" fill="#660099">vivo</text>
      </svg>
    );
}

export function TimLogo(props: SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 100 60" {...props}>
        <text x="5" y="45" fontFamily="Arial, sans-serif" fontSize="40" fontWeight="bold" fill="#0073ce">TIM</text>
      </svg>
    );
}
  
export function RogersLogo(props: SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 180 60" {...props}>
        <text x="5" y="45" fontFamily="Arial, sans-serif" fontSize="40" fontWeight="bold" fill="#D52B1E">ROGERS</text>
      </svg>
    );
}

export function BellLogo(props: SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 120 60" {...props}>
        <text x="5" y="45" fontFamily="Arial, sans-serif" fontSize="40" fontWeight="bold" fill="#00549A">Bell</text>
      </svg>
    );
}

export function WomLogo(props: SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 150 60" {...props}>
        <rect width="150" height="60" fill="#9C27B0" rx="10"/>
        <text x="15" y="45" fontFamily="Arial, sans-serif" fontSize="40" fontWeight="bold" fill="white">WOM</text>
      </svg>
    );
}

export function SfrLogo(props: SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 120 60" {...props}>
        <text x="5" y="45" fontFamily="Arial, sans-serif" fontSize="40" fontWeight="bold" fill="#D52B1E">SFR</text>
      </svg>
    );
}

export function KtLogo(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 80 60" {...props}>
            <text x="5" y="45" fontFamily="Arial, sans-serif" fontSize="40" fontWeight="bold" fill="#000">kt</text>
        </svg>
    )
}
