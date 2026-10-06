export interface HomeCtaContent {
  readonly accessibleHeading: string;
  readonly headingLines: readonly string[];
  readonly buttonLabel: string;
  readonly buttonHref: string;
  readonly testimonial: string;
  readonly testimonee: string;
  readonly image: {
    readonly src: string;
    readonly alt: string;
  };
}

export const homeCta: HomeCtaContent = {
  accessibleHeading: 'Ready to build an experience that moves people?',
  headingLines: ["Let's build", 'an experience', 'That moves', 'People '],
  buttonLabel: 'Tell us your story',
  buttonHref: '',
  testimonial: '“A passionate team who listens deeply, collaborates openly, and always delivers with care. ”',
  testimonee: '- Satu Sisi Social House',
  image: {
    src: 'https://cdn.prod.website-files.com/68b652bbd6c64a44c8fe3e5e/6917e0c8019265ad19e8d1ac_DSCF2511%201.avif',
    alt: 'A black and white image of the founder of the studio, Fadel Febrian Alexander, working at the desk.',
  },
};
