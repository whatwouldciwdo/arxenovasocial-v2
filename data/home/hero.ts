export interface HomeHeroContent {
  readonly headingBeforeBreak: string;
  readonly headingAfterBreak: string;
  readonly breakSeparator: string;
  readonly image: {
    readonly src: string;
    readonly alt: string;
    readonly width: number;
    readonly height: number;
  };
}

export const homeHero: HomeHeroContent = {
  headingBeforeBreak: 'We are passionate about creating visually stunning and functional solutions that communicate effectively.',
  headingAfterBreak: 'For established brands whose reputation has outgrown their digital presence.',
  breakSeparator: '\u200d',
  image: {
    src: 'https://cdn.prod.website-files.com/68b652bbd6c64a44c8fe3e5e/69d51282c6041349788c8177_Key%20Visual-2.avif',
    alt: '',
    width: 1967,
    height: 1311,
  },
};
