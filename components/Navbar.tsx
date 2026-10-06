'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSound } from './SoundProvider';

export default function Navbar() {
  const pathname = usePathname();
  const { soundEnabled, toggleSound } = useSound();

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 1000,
        padding: '24px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mixBlendMode: 'difference',
        color: '#fff',
        pointerEvents: 'none'
      }}
    >
      {/* Brand Logo */}
      <div style={{ pointerEvents: 'auto' }}>
        <Link
          href="/"
          data-cursor-hover=""
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <img
            src="/arxenovasocial-logo.webp"
            alt="Arxenova Social"
            style={{
              height: '38px',
              width: 'auto',
              objectFit: 'contain',
              display: 'block',
            }}
          />
          <span
            style={{
              fontSize: '18px',
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            ARXENOVASOCIAL
          </span>
        </Link>
      </div>

      {/* Navigation Links & Controls */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '32px',
          pointerEvents: 'auto'
        }}
      >
        {/* Sound Toggle */}
        <button
          onClick={toggleSound}
          data-cursor-hover=""
          style={{
            background: 'none',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            borderRadius: '20px',
            padding: '6px 14px',
            color: 'inherit',
            fontSize: '12px',
            fontFamily: 'monospace',
            textTransform: 'uppercase',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: soundEnabled ? '#4ade80' : '#888'
            }}
          />
          Sound: {soundEnabled ? 'ON' : 'OFF'}
        </button>

        {/* Work Link */}
        <Link
          href="/work"
          data-cursor-hover=""
          style={{
            fontSize: '14px',
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            textDecoration: pathname === '/work' ? 'underline' : 'none',
            color: 'inherit'
          }}
        >
          Work
        </Link>

        {/* Contact CTA */}
        <a
          href="mailto:hello@arxenovasocial.com"
          data-cursor-hover=""
          style={{
            fontSize: '14px',
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          Contact
        </a>
      </nav>
    </header>
  );
}
