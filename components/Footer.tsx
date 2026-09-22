'use client';

import Link from 'next/link';
import FooterCanvas from './FooterCanvas';

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: '#080807',
        color: '#dedcd6',
        padding: '80px 32px 40px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'relative',
        zIndex: 10
      }}
    >
      <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
        {/* Top Section: CTA / Tagline */}
        <div style={{ marginBottom: '60px' }}>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              opacity: 0.6,
              display: 'block',
              marginBottom: '16px'
            }}
          >
            『 Brand & Web Experience Studio 』
          </span>
          <h2
            style={{
              fontSize: 'clamp(2rem, 5vw, 4.5rem)',
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              maxWidth: '900px'
            }}
          >
            Refuse to be underestimated.
          </h2>
        </div>

        {/* 3D WebGL Three.js Canvas */}
        <div style={{ margin: '40px 0', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', overflow: 'hidden' }}>
          <FooterCanvas />
        </div>

        {/* Middle Section: Links & Contact */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '40px',
            padding: '40px 0',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div>
            <h4 style={{ fontFamily: 'monospace', fontSize: '12px', textTransform: 'uppercase', opacity: 0.6, marginBottom: '16px' }}>
              Navigation
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <Link href="/" data-cursor-hover="" style={{ color: 'inherit', textDecoration: 'none', fontSize: '18px', fontWeight: 600 }}>
                  Home ↗
                </Link>
              </li>
              <li>
                <Link href="/work" data-cursor-hover="" style={{ color: 'inherit', textDecoration: 'none', fontSize: '18px', fontWeight: 600 }}>
                  Work ↗
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontFamily: 'monospace', fontSize: '12px', textTransform: 'uppercase', opacity: 0.6, marginBottom: '16px' }}>
              Get In Touch
            </h4>
            <a
              href="mailto:hello@bymonolog.com"
              data-cursor-hover=""
              style={{ color: 'inherit', textDecoration: 'none', fontSize: '18px', fontWeight: 600, display: 'block', marginBottom: '8px' }}
            >
              hello@bymonolog.com
            </a>
            <p style={{ fontSize: '14px', opacity: 0.7, margin: 0 }}>
              Jakarta & Cilegon (ID)
            </p>
          </div>

          <div>
            <h4 style={{ fontFamily: 'monospace', fontSize: '12px', textTransform: 'uppercase', opacity: 0.6, marginBottom: '16px' }}>
              Socials
            </h4>
            <div style={{ display: 'flex', gap: '16px' }}>
              <a href="https://instagram.com/by_huy" target="_blank" rel="noreferrer" data-cursor-hover="" style={{ color: 'inherit', fontSize: '14px', textDecoration: 'none' }}>
                Instagram
              </a>
              <a href="https://linkedin.com/in/byhuy" target="_blank" rel="noreferrer" data-cursor-hover="" style={{ color: 'inherit', fontSize: '14px', textDecoration: 'none' }}>
                LinkedIn
              </a>
              <a href="https://youtube.com/@by_huy" target="_blank" rel="noreferrer" data-cursor-hover="" style={{ color: 'inherit', fontSize: '14px', textDecoration: 'none' }}>
                YouTube
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section: Copyright */}
        <div
          style={{
            paddingTop: '32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px',
            fontFamily: 'monospace',
            opacity: 0.5,
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <span>© {new Date().getFullYear()} ARXENOVA . All rights reserved.</span>
          <span>Cloned & Migrated with Next.js</span>
        </div>
      </div>
    </footer>
  );
}
