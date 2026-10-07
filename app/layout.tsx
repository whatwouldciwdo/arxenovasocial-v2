import type { Metadata } from 'next';
import Script from 'next/script';
import { SoundProvider } from '@/components/SoundProvider';
import { SOUND_OWNER_ATTRIBUTE, SOUND_OWNER_VALUE } from '@/components/sound-controller';
import SharedOverlayProvider from '@/components/shared/SharedOverlayProvider';
import AppRouterRuntimeProvider from '@/components/app-router/AppRouterRuntimeProvider';
import JsonLd from '@/components/seo/JsonLd';
import {
  ABSOLUTE_LOGO_URL,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  LOCAL_SEO_KEYWORDS,
  OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from '@/data/seo';
import {
  SHARED_OVERLAY_OWNER_ATTRIBUTE,
  SHARED_OVERLAY_OWNER_VALUE,
} from '@/components/shared/shared-overlay-controller';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Jasa Website & SEO Cilegon dan Serang | ARXENOVA',
    template: '%s | ARXENOVA',
  },
  description: SITE_DESCRIPTION,
  keywords: [...LOCAL_SEO_KEYWORDS, 'web design Banten', 'website development Banten', 'ARXENOVA'],
  authors: [{ name: 'ARXENOVA', url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'Jasa Website & SEO Cilegon dan Serang | ARXENOVA',
    description: SITE_DESCRIPTION,
    images: [{ url: OG_IMAGE, alt: 'ARXENOVA — jasa website dan SEO Cilegon dan Serang' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jasa Website & SEO Cilegon dan Serang | ARXENOVA',
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': ['Organization', 'ProfessionalService'],
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: ABSOLUTE_LOGO_URL,
  image: OG_IMAGE,
  description: SITE_DESCRIPTION,
  email: CONTACT_EMAIL,
  telephone: CONTACT_PHONE,
  founder: {
    '@type': 'Person',
    name: 'Fadel Febrian Alexander',
  },
  areaServed: [
    { '@type': 'City', name: 'Cilegon' },
    { '@type': 'City', name: 'Serang' },
    { '@type': 'AdministrativeArea', name: 'Banten' },
  ],
  knowsAbout: [...LOCAL_SEO_KEYWORDS, 'Brand Strategy', 'Visual Identity', 'UI/UX Design'],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'sales',
    telephone: CONTACT_PHONE,
    email: CONTACT_EMAIL,
    areaServed: 'ID',
    availableLanguage: ['Indonesian', 'English'],
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  inLanguage: ['id-ID', 'en'],
  publisher: { '@id': `${SITE_URL}/#organization` },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Temporary opt-in until monolog-runtime honors the ownership marker below.
  const soundProviderEnabled = process.env.NEXT_PUBLIC_SOUND_PROVIDER_ENABLED === '1';
  const modularFooterEnabled = process.env.NEXT_PUBLIC_FOOTER_BEHAVIOR === 'modular';
  const sharedOverlayProviderEnabled = process.env.SHARED_OVERLAYS_OWNER === 'react';
  const appRouterRuntimeEnabled = process.env.NEXT_PUBLIC_APP_ROUTER_RUNTIME === '1';
  const rootOwnership = {
    ...(soundProviderEnabled ? { [SOUND_OWNER_ATTRIBUTE]: SOUND_OWNER_VALUE } : {}),
    ...(sharedOverlayProviderEnabled
      ? { [SHARED_OVERLAY_OWNER_ATTRIBUTE]: SHARED_OVERLAY_OWNER_VALUE }
      : {}),
    ...(appRouterRuntimeEnabled ? { 'data-app-router-runtime': '1' } : {}),
  };
  return (
    <html
      lang="en"
      className="w-mod-js"
      data-wf-domain="bymonolog.com"
      data-wf-page="68b652bbd6c64a44c8fe3e53"
      data-wf-site="68b652bbd6c64a44c8fe3e5e"
      {...rootOwnership}
    >
      <head>
        <link rel="preconnect" href="https://cdn.prod.website-files.com" crossOrigin="anonymous" />
        <link rel="icon" type="image/webp" href="/arxenovasocial-logo.webp" />
        <link rel="stylesheet" href="/css/webflow.shared.css" />
        <link rel="stylesheet" href="/css/monolog-custom.css" />
        {/* Capability classes must not mutate the root before React hydrates it. */}
        <Script
          id="webflow-capabilities"
          src="/js/webflow-capabilities.js"
          strategy="afterInteractive"
        />
        <Script src="/js/legacy-history-bridge.js" strategy="beforeInteractive" />
        {sharedOverlayProviderEnabled ? (
          <Script src="/js/shared-overlay-owner-bridge.js" strategy="beforeInteractive" />
        ) : null}
      </head>
      <body
        data-barba="wrapper"
        data-navigation-status="is-close"
        data-about-status="is-closed"
        data-theme-nav="dark"
        data-scroll-time="0"
        className="body"
      >
        <JsonLd data={[organizationSchema, websiteSchema]} />
        <SoundProvider enabled={soundProviderEnabled}>
          <SharedOverlayProvider enabled={sharedOverlayProviderEnabled}>
            {appRouterRuntimeEnabled ? (
              <AppRouterRuntimeProvider>{children}</AppRouterRuntimeProvider>
            ) : children}
          </SharedOverlayProvider>
        </SoundProvider>

        {/* Persistent bridge is inert until a marked FAQ root is initialized by the runtime. */}
        <Script src="/js/faq-behavior.js" strategy="beforeInteractive" />
        <Script src="/js/monolog-runtime.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
