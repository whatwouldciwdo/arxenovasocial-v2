import type { Metadata } from 'next';
import Script from 'next/script';
import { SoundProvider } from '@/components/SoundProvider';
import { SOUND_OWNER_ATTRIBUTE, SOUND_OWNER_VALUE } from '@/components/sound-controller';
import SharedOverlayProvider from '@/components/shared/SharedOverlayProvider';
import AppRouterRuntimeProvider from '@/components/app-router/AppRouterRuntimeProvider';
import {
  SHARED_OVERLAY_OWNER_ATTRIBUTE,
  SHARED_OVERLAY_OWNER_VALUE,
} from '@/components/shared/shared-overlay-controller';
import './globals.css';

export const metadata: Metadata = {
  title: 'ARXENOVA | Brand and Web Design Studio founded by Fadel Febrian Alexander',
  description: 'We building change-making branding and websites for established creative brands who refuse to be underestimated. Trusted by OH Architecture, Vinamilk, and many other leading brands.',
  openGraph: {
    title: 'ARXENOVA | Brand and Web Design Studio founded by Fadel Febrian Alexander',
    description: 'We building change-making branding and websites for established creative brands who refuse to be underestimated.',
    images: [{ url: 'https://cdn.prod.website-files.com/68b652bbd6c64a44c8fe3e5e/6a4df8b2aef24dbe74b85600_OG.jpg' }],
  },
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
