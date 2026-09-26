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
    videoSrc: 'https://byhuy.b-cdn.net/WebM/Strategy%20Compressed.webm',
    href: 'https://youtu.be/LVOLFgSqHQ0?si=ilDSUJZ8q4J_05Ou&t=76',
    cta: 'See step 01 in action ↗',
  },
  {
    id: '02',
    heading: 'We shape your digital presence',
    description: 'With your narrative locked, we design and direct a brand and website that feels premium, signals credibility, and gives your audience one clear reason to lean in and act.',
    videoSrc: 'https://byhuy.b-cdn.net/WebM/Design%20FINAL%20compressed.webm',
    href: 'https://youtu.be/LVOLFgSqHQ0?si=V8p7IBYcyDvXfcSM&t=480',
    cta: 'See step 02 in action ↗',
  },
  {
    id: '03',
    heading: 'We send it into the world',
    description: "Your brand and  website goes live as a long-term asset that turns attention into opportunity, attracts the clients you're built for, and grows with you.",
    videoSrc: 'https://byhuy.b-cdn.net/WebM/Development%20Final%20Compressed.webm',
    href: 'https://youtu.be/LVOLFgSqHQ0?si=P7382hcVSsMWaHtP&t=696',
    cta: 'See step 03 in action ↗',
  },
];
