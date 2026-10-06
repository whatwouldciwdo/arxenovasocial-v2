export const SOUND_STORAGE_KEY = 'monolog_sound_enabled';
export const SOUND_OWNER_ATTRIBUTE = 'data-monolog-sound-owner';
export const SOUND_OWNER_VALUE = 'react';

const INTERACTIVE_SELECTOR = 'a, button, [role="button"], [data-cursor-hover]';

export interface SoundHowl {
  play(): unknown;
  pause(): unknown;
  playing(): boolean;
  unload(): unknown;
}

export interface SoundHowlOptions {
  src: string[];
  volume: number;
  loop?: boolean;
}

export interface SoundControllerOptions {
  createHowl: (options: SoundHowlOptions) => SoundHowl;
  document: Document;
  storage: Pick<Storage, 'getItem' | 'setItem'>;
  random?: () => number;
}

export interface SoundController {
  getEnabled: () => boolean;
  setEnabled: (enabled: boolean) => void;
  toggle: () => void;
  playTap: () => void;
  playSelect: () => void;
  subscribe: (listener: (enabled: boolean) => void) => () => void;
  destroy: () => void;
}

function readPreference(storage: SoundControllerOptions['storage']) {
  try {
    const saved = storage.getItem(SOUND_STORAGE_KEY);
    return saved === null ? true : saved === 'true';
  } catch {
    return true;
  }
}

export function createSoundController({
  createHowl,
  document,
  storage,
  random = Math.random,
}: SoundControllerOptions): SoundController {
  const taps = [1, 2, 3, 4, 5].map(index => createHowl({
    src: [`/audio/tap_0${index}.mp3`],
    volume: 0.15,
  }));
  const select = createHowl({ src: ['/audio/select.mp3'], volume: 0.2 });
  const bgm = createHowl({ src: ['/audio/bgm.mp3'], volume: 0.05, loop: true });
  const howls = [...taps, select, bgm];
  const subscribers = new Set<(enabled: boolean) => void>();
  let enabled = readPreference(storage);
  let destroyed = false;

  const playBgm = () => {
    if (!enabled || document.visibilityState === 'hidden' || bgm.playing()) return;
    bgm.play();
  };

  const playTap = () => {
    if (!enabled || destroyed) return;
    playBgm();
    taps[Math.min(taps.length - 1, Math.floor(random() * taps.length))].play();
  };

  const playSelect = () => {
    if (!enabled || destroyed) return;
    playBgm();
    select.play();
  };

  const setEnabled = (next: boolean) => {
    if (destroyed || enabled === next) return;
    enabled = next;
    try {
      storage.setItem(SOUND_STORAGE_KEY, String(next));
    } catch {
      // Sound remains usable when storage is unavailable.
    }
    if (enabled) playBgm();
    else bgm.pause();
    subscribers.forEach(listener => listener(enabled));
  };

  const interactiveFrom = (target: EventTarget | null) =>
    target instanceof Element ? target.closest<HTMLElement>(INTERACTIVE_SELECTOR) : null;

  let lastTapTarget: Element | null = null;
  let lastTapTime = 0;

  const handlePointerOver = (event: Event) => {
    if ('pointerType' in event && (event as PointerEvent).pointerType === 'touch') return;
    const interactive = interactiveFrom(event.target);
    const previous = 'relatedTarget' in event ? interactiveFrom((event as MouseEvent).relatedTarget) : null;
    const now = Date.now();
    if (interactive && (interactive !== previous || (interactive !== lastTapTarget || now - lastTapTime > 150))) {
      lastTapTarget = interactive;
      lastTapTime = now;
      playTap();
    }
  };

  const handleClick = (event: MouseEvent) => {
    if (event.button === 0 && interactiveFrom(event.target)) playSelect();
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      bgm.pause();
    } else {
      playBgm();
    }
  };

  document.addEventListener('pointerover', handlePointerOver, { passive: true });
  document.addEventListener('mouseenter', handlePointerOver, true);
  document.addEventListener('click', handleClick, { passive: true });
  document.addEventListener('visibilitychange', handleVisibilityChange);
  playBgm();

  return {
    getEnabled: () => enabled,
    setEnabled,
    toggle: () => setEnabled(!enabled),
    playTap,
    playSelect,
    subscribe(listener) {
      subscribers.add(listener);
      return () => subscribers.delete(listener);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      document.removeEventListener('pointerover', handlePointerOver);
      document.removeEventListener('mouseenter', handlePointerOver, true);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      subscribers.clear();
      howls.forEach(howl => howl.unload());
    },
  };
}
