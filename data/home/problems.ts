export interface ProblemStat {
  readonly value: string;
  readonly message: string;
}

export interface ClientLogo {
  readonly label: string;
  readonly src: string;
  readonly alt: string;
  readonly style?: React.CSSProperties;
}

export const problemStats: readonly ProblemStat[] = [
  { value: '15+', message: 'Founder-led brands from disruptive creative agencies to consumer brands' },
  { value: '30+', message: 'Globally recognized awards (Awwwards, FWA, CSSDA)' },
];

// Keep source order and legacy alt text, including known label mismatches.
export const clientLogos: readonly ClientLogo[] = [
  { label: 'GOETHE INSTITUT', src: '/images/clients/Goethe-Logo.jpg', alt: 'Goethe', style: { borderRadius: '6px' } },
  { label: 'BERDIKARI RAYA', src: '/images/clients/berdikariraya.png', alt: 'Berdikari Raya' },
  { label: 'OTOBI CARE', src: '/images/clients/OTOBI-LOGO.jpeg', alt: 'University of Sydney' },
  { label: 'PUTRA JAYANTARA ANANTA', src: '/images/clients/PJA-LOGO.png', alt: 'OH Architecture' },
  { label: 'PLN INDONESIA POWER', src: '/images/clients/PLN-INDONESIAPOWER-LOGO.png', alt: 'Supersolid Agency' },
  { label: 'PLN', src: '/images/clients/PLN-LOGO.svg', alt: 'SLIK Agency' },
  { label: 'SATU SISI SOCIAL HOUSE', src: '/images/clients/satusisisocialhouse-logo.png', alt: 'Mammoth Murals' },
  { label: 'Backhouse', src: 'https://cdn.prod.website-files.com/68b66e92dfdef050e1802fa7/69e9f4a05d31ea04c8f9f86a_Client-2.svg', alt: 'Backhouse' },
];
