'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Howl } from 'howler';

interface SoundContextType {
  soundEnabled: boolean;
  toggleSound: () => void;
  playTap: () => void;
  playSelect: () => void;
}

const SoundContext = createContext<SoundContextType>({
  soundEnabled: false,
  toggleSound: () => {},
  playTap: () => {},
  playSelect: () => {},
});

export const useSound = () => useContext(SoundContext);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const soundsRef = useRef<{ taps: Howl[]; select: Howl | null }>({
    taps: [],
    select: null,
  });

  useEffect(() => {
    // Check localStorage preference
    const saved = localStorage.getItem('monolog_sound_enabled');
    if (saved !== null) {
      setSoundEnabled(saved === 'true');
    }

    // Initialize Howl sounds
    soundsRef.current.taps = [
      new Howl({ src: ['/audio/tap_01.mp3'], volume: 0.15 }),
      new Howl({ src: ['/audio/tap_02.mp3'], volume: 0.15 }),
      new Howl({ src: ['/audio/tap_03.mp3'], volume: 0.15 }),
      new Howl({ src: ['/audio/tap_04.mp3'], volume: 0.15 }),
      new Howl({ src: ['/audio/tap_05.mp3'], volume: 0.15 }),
    ];

    soundsRef.current.select = new Howl({
      src: ['/audio/select.mp3'],
      volume: 0.2,
    });

    // Global listener for interactive sound on buttons and links
    const handleMouseOver = (e: MouseEvent) => {
      if (!soundEnabled) return;
      const target = e.target as HTMLElement | null;
      if (target && target.closest('a, button, [role="button"], [data-cursor-hover]')) {
        playTap();
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (!soundEnabled) return;
      const target = e.target as HTMLElement | null;
      if (target && target.closest('a, button, [role="button"]')) {
        playSelect();
      }
    };

    window.addEventListener('mouseover', handleMouseOver, { passive: true });
    window.addEventListener('click', handleClick, { passive: true });

    return () => {
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('click', handleClick);
    };
  }, [soundEnabled]);

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('monolog_sound_enabled', String(next));
      return next;
    });
  };

  const playTap = () => {
    if (!soundEnabled || soundsRef.current.taps.length === 0) return;
    const randomIndex = Math.floor(Math.random() * soundsRef.current.taps.length);
    soundsRef.current.taps[randomIndex].play();
  };

  const playSelect = () => {
    if (!soundEnabled || !soundsRef.current.select) return;
    soundsRef.current.select.play();
  };

  return (
    <SoundContext.Provider value={{ soundEnabled, toggleSound, playTap, playSelect }}>
      {children}
    </SoundContext.Provider>
  );
}
