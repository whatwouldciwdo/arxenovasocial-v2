export interface ProcessStep {
  readonly id: '01' | '02' | '03';
  readonly heading: string;
  readonly description: string;
  readonly videoSrc: string;
  readonly href: string;
  readonly cta: string;
}

// Preserve baseline punctuation, double spaces, URL queries, and ordering.
export const processSteps: readonly ProcessStep[] = [
  {
    id: '01',
    heading: 'We uncover your story',
    description: 'We dig deep into your brand, surface what makes you irreplaceable, and shape it into sharp positioning and a website strategy that connects in seconds.',
    videoSrc: '',
    href: '',
    cta: 'See step 01 in action ↗',
  },
  {
    id: '02',
    heading: 'We shape your digital presence',
    description: 'With your narrative locked, we design and direct a brand and website that feels premium, signals credibility, and gives your audience one clear reason to lean in and act.',
    videoSrc: '',
    href: '',
    cta: 'See step 02 in action ↗',
  },
  {
    id: '03',
    heading: 'We send it into the world',
    description: "Your brand and  website goes live as a long-term asset that turns attention into opportunity, attracts the clients you're built for, and grows with you.",
    videoSrc: '',
    href: '',
    cta: 'See step 03 in action ↗',
  },
];
