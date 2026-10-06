'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Howl } from 'howler';
import { createSoundController, type SoundController } from './sound-controller';

interface SoundContextType {
  soundEnabled: boolean;
  toggleSound: () => void;
  playTap: () => void;
  playSelect: () => void;
}

const disabledContext: SoundContextType = {
  soundEnabled: false,
  toggleSound: () => {},
  playTap: () => {},
  playSelect: () => {},
};

const SoundContext = createContext<SoundContextType>(disabledContext);

export const useSound = () => useContext(SoundContext);

export function SoundProvider({ children, enabled = false }: {
  children: React.ReactNode;
  enabled?: boolean;
}) {
  const controllerRef = useRef<SoundController | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const HowlCtor = (typeof window !== 'undefined' && (window as unknown as { Howl?: typeof Howl }).Howl) || Howl;
    const controller = createSoundController({
      createHowl: options => new HowlCtor(options),
      document,
      storage: localStorage,
    });
    controllerRef.current = controller;
    setSoundEnabled(controller.getEnabled());
    const unsubscribe = controller.subscribe(setSoundEnabled);
    return () => {
      unsubscribe();
      controller.destroy();
      controllerRef.current = null;
    };
  }, [enabled]);

  const toggleSound = useCallback(() => controllerRef.current?.toggle(), []);
  const playTap = useCallback(() => controllerRef.current?.playTap(), []);
  const playSelect = useCallback(() => controllerRef.current?.playSelect(), []);
  const value = useMemo(() => enabled ? {
    soundEnabled,
    toggleSound,
    playTap,
    playSelect,
  } : disabledContext, [enabled, playSelect, playTap, soundEnabled, toggleSound]);

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}
