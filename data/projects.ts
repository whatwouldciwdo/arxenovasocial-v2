export interface Project {
  slug: string;
  name: string;
  client: string;
  description: string;
  image: string;
  keywords: string[];
  year?: string;
  metrics?: string;
}

export const PROJECTS: Project[] = [
  {
    slug: 'oh-architecture',
    name: 'OH Architecture',
    client: 'OH Architecture',
    description: 'Brand refresh and website for a practice with a decade of crafting high-end homes for Australian families.',
    image: 'https://cdn.prod.website-files.com/68b66e92dfdef050e1802fa7/68e36f423545f0f0d624de8c_image%206.avif',
    keywords: ['Brand Strategy', 'Website Strategy', 'Visual Identity', 'Website Design', 'Website Development'],
    year: '2024',
    metrics: '$2M+ in new project leads in 3 months'
  },
  {
    slug: 'mammoth-murals',
    name: 'Mammoth Murals',
    client: 'Mammoth Murals',
    description: 'Brand strategy, identity and website for an established mural agency with a decade of large-scale public art behind it.',
    image: 'https://cdn.prod.website-files.com/68b66e92dfdef050e1802fa7/68e36fd385a3ac7e20eb2a7c_IMG_2674%201.avif',
    keywords: ['Brand Strategy', 'Website Strategy', 'Visual Identity', 'Website Design', 'Website Development'],
    year: '2024',
    metrics: '$100k in new sales within 30 days'
  },
  {
    slug: 'supersolid',
    name: 'Supersolid',
    client: 'Supersolid Agency',
    description: 'Website for a 100% creative-owned Sydney agency built to merge commercial value with cultural impact.',
    image: 'https://cdn.prod.website-files.com/68b66e92dfdef050e1802fa7/68e36f6a67c0bb840486917e_image-1.avif',
    keywords: ['Website Design', 'Website Development', '3D Development'],
    year: '2024'
  },
  {
    slug: 'slik',
    name: 'SLIK',
    client: 'SLIK Agency',
    description: 'Website for an Australian activation agency pushing creativity further for some of the country\'s most ambitious brands.',
    image: 'https://cdn.prod.website-files.com/68b66e92dfdef050e1802fa7/6a10111e38d73116c8849278_Slik.avif',
    keywords: ['Website Development', '3D Development'],
    year: '2024'
  },
  {
    slug: 'hiss-university-of-sydney',
    name: 'HISS (University of Sydney)',
    client: 'University of Sydney',
    description: 'Brand identity and website for a University of Sydney initiative challenging the norms of queer education on a global stage.',
    image: 'https://cdn.prod.website-files.com/68b66e92dfdef050e1802fa7/68e36feaa84a7e56f526ef97_15_Mikeas_34513%201.avif',
    keywords: ['Visual Identity', 'Website Design', 'Website Development'],
    year: '2024'
  },
  {
    slug: 'backhouse',
    name: 'Backhouse',
    client: 'Backhouse',
    description: 'Website for an embedded production partner behind campaigns for Netflix, A24, HBO, Apple and Google.',
    image: 'https://cdn.prod.website-files.com/68b66e92dfdef050e1802fa7/6a1010bcc3947445ad687f5d_Backhouse.avif',
    keywords: ['Website Design', 'Website Development', '3D Development'],
    year: '2024'
  },
  {
    slug: 'squiggle-university-of-sydney',
    name: 'Squiggle (University of Sydney)',
    client: 'University of Sydney',
    description: 'Interactive digital experience exploring student research, community engagement, and design innovation.',
    image: 'https://cdn.prod.website-files.com/68b66e92dfdef050e1802fa7/68e36feaa84a7e56f526ef97_15_Mikeas_34513%201.avif',
    keywords: ['Interactive Design', 'Website Development'],
    year: '2024'
  }
];
