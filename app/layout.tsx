import type { Metadata } from 'next';
import Script from 'next/script';
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
  return (
    <html
      lang="en"
      className="w-mod-js"
      data-wf-domain="bymonolog.com"
      data-wf-page="68b652bbd6c64a44c8fe3e53"
      data-wf-site="68b652bbd6c64a44c8fe3e5e"
    >
      <head>
        <link rel="preconnect" href="https://cdn.prod.website-files.com" crossOrigin="anonymous" />
        <link rel="icon" type="image/webp" href="/arxenovasocial-logo.webp" />
        <link rel="stylesheet" href="/css/webflow.shared.css" />
        <link rel="stylesheet" href="/css/monolog-custom.css" />
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(o,c){var n=c.documentElement,t=" w-mod-";n.className+=t+"js",("ontouchstart"in o||o.DocumentTouch&&c instanceof DocumentTouch)&&(n.className+=t+"touch")}(window,document);`,
          }}
        />
      </head>
      <body
        data-barba="wrapper"
        data-navigation-status="is-close"
        data-about-status="is-closed"
        data-theme-nav="dark"
        data-scroll-time="0"
        className="body"
      >
        {children}

        {/* Unified Monolog Runtime (jQuery + Webflow + GSAP + Three.js + Lenis + Howler + Barba + Bundle) */}
        <Script src="/js/monolog-runtime.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
