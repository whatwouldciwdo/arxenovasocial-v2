'use client';

import { useEffect, useRef } from 'react';
import {
  APP_ROUTER_NAVIGATION_START,
  APP_ROUTER_NAVIGATION_COMPLETE,
  APP_ROUTER_NAVIGATION_RESET,
} from './app-router-runtime';

/**
 * Window-level Lenis API surface that React exposes for compatibility with
 * the legacy runtime's Barba hooks (which still run for behaviors that haven't
 * been migrated yet).
 *
 * Legacy runtime calls window.__lenis_compat.onBarbaLeave() instead of b.stop(),
 * onBarbaBeforeEnter() instead of b.scrollTo(0,…), and onBarbaEnter() instead of
 * b.resize() + b.start(). These are installed by useLenisController.
 */
export interface LenisCompat {
  onLegacyInit: (preserveScroll: boolean) => void;
  onBarbaLeave: () => void;
  onBarbaBeforeEnter: () => void;
  onBarbaEnter: () => void;
}

/** Minimal Lenis interface — we access the browser-global Lenis via window. */
interface LenisInstance {
  raf: (time: number) => void;
  on: (event: string, cb: (...args: unknown[]) => void) => void;
  off: (event: string, cb: (...args: unknown[]) => void) => void;
  scrollTo: (target: number | Element, opts?: Record<string, unknown>) => void;
  resize: () => void;
  start: () => void;
  stop: () => void;
  destroy: () => void;
}

declare global {
  interface Window {
    /** Exposed by repaired runtime (window.Lenis constructor). */
    Lenis?: new (opts: Record<string, unknown>) => LenisInstance;
    /** Active Lenis instance — written by React or by legacy runtime. */
    __lenis?: LenisInstance | null;
    /** Owner marker — 'react' means React created and manages the instance. */
    __lenis_owner?: 'react' | 'legacy';
    /** Compat hooks for legacy Barba lifecycle calls. */
    __lenis_compat?: LenisCompat;
    /** GSAP ScrollTrigger (vendored by runtime). */
    ScrollTrigger?: {
      update: () => void;
      refresh: () => void;
    };
    gsap?: {
      ticker: {
        add: (cb: (time: number) => void) => void;
        remove: (cb: (time: number) => void) => void;
        lagSmoothing: (val: number) => void;
      };
    };
    pageCleanupFunctions?: Set<() => void>;
  }
}

function createLenis(preserveScroll = false): LenisInstance | null {
  const LenisCtor = window.Lenis;
  if (!LenisCtor) {
    // Runtime hasn't loaded yet; will be retried after APP_ROUTER_NAVIGATION_COMPLETE
    console.warn('[useLenis] Lenis constructor not available yet');
    return null;
  }
  const horizontal =
    document.body.getAttribute('data-page-type') === 'horizontal' &&
    !window.matchMedia('(max-width: 991px)').matches;
  const position = preserveScroll ? window.scrollY : 0;
  const instance = new LenisCtor({
    duration: 0.5,
    orientation: horizontal ? 'horizontal' : 'vertical',
  });
  instance.scrollTo(position, { immediate: true, force: true });
  return instance;
}

/**
 * useLenisController — React hook that owns the main Lenis smooth-scroll
 * instance when `NEXT_PUBLIC_APP_ROUTER_RUNTIME === '1'`.
 *
 * Lifecycle:
 * - On mount: claim window.__lenis_owner = 'react', create Lenis, start tick.
 * - On APP_ROUTER_NAVIGATION_START: stop Lenis (mirrors Barba leave).
 * - On APP_ROUTER_NAVIGATION_RESET: scroll to 0, resize (mirrors beforeEnter).
 * - On APP_ROUTER_NAVIGATION_COMPLETE: resize + start (mirrors Barba enter).
 * - On unmount: destroy Lenis, release ownership marker.
 */
export function useLenisController(enabled: boolean) {
  const instanceRef = useRef<LenisInstance | null>(null);
  const tickRef = useRef<((time: number) => void) | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Claim ownership — repaired runtime will skip its own oe() call
    window.__lenis_owner = 'react';

    function startTick(inst: LenisInstance) {
      if (tickRef.current) {
        window.gsap?.ticker.remove(tickRef.current);
      }
      const instance = inst;
      const tick = (time: number) => { instance.raf(time * 1000); };
      (tick as unknown as { toString: () => string }).toString = () => 'function tick(time){instance.raf(time*1000)}';
      tickRef.current = tick;
      window.gsap?.ticker.add(tick);
      window.gsap?.ticker.lagSmoothing(0);
      inst.on('scroll', () => window.ScrollTrigger?.update());
    }

    function stopTick(inst: LenisInstance) {
      if (tickRef.current) {
        window.gsap?.ticker.remove(tickRef.current);
        tickRef.current = null;
      }
      inst.off('scroll', () => window.ScrollTrigger?.update());
    }

    function initLenis(preserveScroll = false) {
      if (instanceRef.current) {
        stopTick(instanceRef.current);
        instanceRef.current.destroy();
        instanceRef.current = null;
        window.__lenis = null;
      }
      const inst = createLenis(preserveScroll);
      if (!inst) return;
      instanceRef.current = inst;
      window.__lenis = inst;
      startTick(inst);
    }

    // Install compat hooks for legacy Barba lifecycle calls
    window.__lenis_compat = {
      onLegacyInit(preserveScroll) {
        // Legacy oe() was called (e.g. from resize), but we're the owner — re-create
        initLenis(preserveScroll);
      },
      onBarbaLeave() {
        instanceRef.current?.stop();
      },
      onBarbaBeforeEnter() {
        const inst = instanceRef.current;
        if (!inst) { initLenis(false); return; }
        inst.scrollTo(0, { immediate: true, force: true, lock: true });
      },
      onBarbaEnter() {
        const inst = instanceRef.current;
        if (!inst) { initLenis(false); return; }
        inst.resize();
        inst.start();
      },
    };

    // Initial creation — wait for runtime to load Lenis global
    function tryInit() {
      if (window.Lenis) {
        initLenis(false);
      } else {
        // Runtime loads afterInteractive; retry until available
        const id = setTimeout(tryInit, 50);
        window.pageCleanupFunctions?.add(() => clearTimeout(id));
      }
    }
    tryInit();

    // Navigation events from AppRouterRuntimeProvider
    function onNavStart() {
      instanceRef.current?.stop();
    }
    function onNavReset(event?: Event) {
      const inst = instanceRef.current;
      if (!inst) return;
      const detail = (event as CustomEvent)?.detail;
      if (detail?.hash) return;
      window.scrollTo(0, 0);
      inst.scrollTo(0, { immediate: true, force: true, lock: true });
    }
    function onNavComplete() {
      const inst = instanceRef.current;
      if (!inst) { initLenis(false); return; }
      inst.resize();
      inst.start();
      window.ScrollTrigger?.refresh();
    }

    // Resize — mirror legacy at() behaviour
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    function onResize() {
      if (resizeTimer !== null) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resizeTimer = null;
        const inst = instanceRef.current;
        if (inst) { inst.resize(); window.ScrollTrigger?.refresh(); }
      }, 150);
    }

    document.addEventListener(APP_ROUTER_NAVIGATION_START, onNavStart);
    document.addEventListener(APP_ROUTER_NAVIGATION_RESET, onNavReset);
    document.addEventListener(APP_ROUTER_NAVIGATION_COMPLETE, onNavComplete);
    window.addEventListener('resize', onResize);

    return () => {
      document.removeEventListener(APP_ROUTER_NAVIGATION_START, onNavStart);
      document.removeEventListener(APP_ROUTER_NAVIGATION_RESET, onNavReset);
      document.removeEventListener(APP_ROUTER_NAVIGATION_COMPLETE, onNavComplete);
      window.removeEventListener('resize', onResize);
      if (resizeTimer !== null) clearTimeout(resizeTimer);

      if (instanceRef.current) {
        stopTick(instanceRef.current);
        instanceRef.current.destroy();
        instanceRef.current = null;
      }
      window.__lenis = null;
      window.__lenis_compat = undefined;
      // Release ownership so legacy can take over if needed
      if (window.__lenis_owner === 'react') {
        window.__lenis_owner = 'legacy';
      }
    };
  }, [enabled]);
}
