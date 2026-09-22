'use client';

import { useEffect, useState, useRef } from 'react';

export default function CustomCursor() {
  const [cursorText, setCursorText] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorFollowerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mouseX = 0;
    let mouseY = 0;
    let followerX = 0;
    let followerY = 0;
    let animId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      setIsVisible(true);

      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      // Check if target or parent has custom cursor attributes
      const target = e.target as HTMLElement | null;
      if (target) {
        const hoverElement = target.closest('[data-cursor-hover], a, button, [role="button"]');
        const textElement = target.closest('[data-cursor-text]');

        setIsHovered(!!hoverElement);

        if (textElement) {
          const text = textElement.getAttribute('data-cursor-text') || '';
          setCursorText(text);
        } else {
          setCursorText('');
        }
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const loop = () => {
      followerX += (mouseX - followerX) * 0.15;
      followerY += (mouseY - followerY) * 0.15;

      if (cursorFollowerRef.current) {
        cursorFollowerRef.current.style.transform = `translate3d(${followerX}px, ${followerY}px, 0)`;
      }

      animId = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    animId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      className="custom-cursor-wrapper"
      style={{
        pointerEvents: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 999999,
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease'
      }}
    >
      {/* Center Dot */}
      <div
        ref={cursorDotRef}
        style={{
          position: 'absolute',
          top: -3,
          left: -3,
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: '#fff',
          mixBlendMode: 'difference',
          willChange: 'transform'
        }}
      />

      {/* Outer Follower */}
      <div
        ref={cursorFollowerRef}
        style={{
          position: 'absolute',
          top: cursorText ? -20 : isHovered ? -24 : -12,
          left: cursorText ? -60 : isHovered ? -24 : -12,
          width: cursorText ? 'auto' : isHovered ? 48 : 24,
          height: cursorText ? 40 : isHovered ? 48 : 24,
          minWidth: cursorText ? 120 : undefined,
          padding: cursorText ? '0 16px' : undefined,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 24,
          border: '1px solid rgba(255, 255, 255, 0.4)',
          backgroundColor: cursorText ? 'rgba(0, 0, 0, 0.85)' : isHovered ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
          color: '#fff',
          fontSize: 12,
          fontFamily: 'monospace',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          willChange: 'transform, width, height',
          transition: 'width 0.25s ease, height 0.25s ease, background-color 0.25s ease, border-color 0.25s ease'
        }}
      >
        {cursorText}
      </div>
    </div>
  );
}
