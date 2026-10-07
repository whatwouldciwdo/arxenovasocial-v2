export const SITE_URL = 'https://arxenovasocial.com';
export const SITE_NAME = 'ARXENOVA';
export const CONTACT_EMAIL = 'hello@arxenovasocial.com';
export const CONTACT_PHONE = '+6281285313084';
export const OG_IMAGE = 'https://cdn.prod.website-files.com/68b652bbd6c64a44c8fe3e5e/6a4df8b2aef24dbe74b85600_OG.jpg';

export const LOCAL_SEO_KEYWORDS = [
  'jasa website Cilegon',
  'website Cilegon',
  'jasa SEO Cilegon',
  'jasa pembuatan website Cilegon',
  'jasa design website Cilegon',
  'jasa website Serang',
  'website Serang',
  'jasa SEO Serang',
  'jasa pembuatan website Serang',
  'jasa design website Serang',
] as const;

export const SITE_DESCRIPTION =
  'Jasa pembuatan dan design website serta SEO untuk bisnis di Cilegon dan Serang. ARXENOVA membangun website strategis, identitas visual, dan pengalaman digital yang berorientasi hasil.';

export const ABSOLUTE_LOGO_URL = `${SITE_URL}/arxenovasocial-logo.webp`;

export function absoluteUrl(path = '/') {
  return new URL(path, SITE_URL).toString();
}