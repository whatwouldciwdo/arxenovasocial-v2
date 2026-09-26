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
        {/* Capability classes must not mutate the root before React hydrates it. */}
        <Script
          id="webflow-capabilities"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `!function(o,c){var n=c.documentElement;n.classList.add("w-mod-js");("ontouchstart"in o||o.DocumentTouch&&c instanceof DocumentTouch)&&n.classList.add("w-mod-touch")}(window,document);`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `/* Capture native history before hydration. Only Barba uses this bridge;
Next keeps its own wrappers for routes outside the legacy container. */
window.history.scrollRestoration="manual";
window.__legacyHistory={
  pushState:window.history.pushState.bind(window.history),
  replaceState:window.history.replaceState.bind(window.history)
};
window.addEventListener("popstate",function(event){
  var barba=window.barba;
  if(event.state?.from!=="barba"||!barba||!barba.history||!document.querySelector('[data-barba="container"]'))return;
  event.stopImmediatePropagation();
  barba.go(window.location.href,"popstate",event);
},true);`,
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
