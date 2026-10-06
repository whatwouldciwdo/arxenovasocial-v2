'use client';

import React, { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  createAppRouterNavigationController,
  createTransitionScreenController,
  resolveNavigationDestination,
  disposeRouteControllers,
  APP_ROUTER_NAVIGATION_COMPLETE,
  type AppRouterNavigationController,
  type NavigationDestination,
} from './app-router-runtime';
import { useLenisController } from './useLenisController';

type Navigate = (href: string) => Promise<boolean>;
const AppRouterRuntimeContext = createContext<Navigate | null>(null);

export function useAppRouterNavigation() {
  return useContext(AppRouterRuntimeContext);
}

export default function AppRouterRuntimeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const pathnameRef = useRef(pathname);
  const previousPathnameRef = useRef(pathname);
  const pendingDestinationRef = useRef<NavigationDestination | null>(null);
  const controllerRef = useRef<AppRouterNavigationController | null>(null);
  pathnameRef.current = pathname;

  // React owns Lenis when AppRouterRuntimeProvider is mounted.
  // useLenisController installs window.__lenis_owner = 'react' which causes the
  // repaired monolog-runtime.js to skip its own oe() Lenis init.
  useLenisController(true);

  useEffect(() => {
    controllerRef.current = createAppRouterNavigationController({
      getPathname: () => pathnameRef.current,
      push: href => {
        const dest = pendingDestinationRef.current;
        if (dest && dest.pathname === pathnameRef.current && dest.hash) {
          window.history.pushState(null, '', href);
        } else {
          router.push(href);
        }
      },
      transition: createTransitionScreenController(document),
      disposeRoute: () => {
        const dest = pendingDestinationRef.current;
        if (dest && dest.pathname === pathnameRef.current && dest.hash) {
          return;
        }
        (window as unknown as { __appRouterLifecycle?: { cleanupPage: () => void } }).__appRouterLifecycle?.cleanupPage();
        disposeRouteControllers();
      },
      dispatch: (name, detail) => {
        document.dispatchEvent(new CustomEvent(name, { detail }));
        if (name === APP_ROUTER_NAVIGATION_COMPLETE) {
          const isSamePageHash = detail?.hash && detail?.pathname === previousPathnameRef.current;
          if (!isSamePageHash) {
            const container = document.querySelector<HTMLElement>('[data-barba="container"]');
            const ns = container?.getAttribute('data-barba-namespace') || 'home';
            void (window as unknown as { __appRouterLifecycle?: { enterPage: (c: HTMLElement | null, ns: string) => Promise<void> } })
              .__appRouterLifecycle?.enterPage(container, ns);
          }
        }
      },
      reducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      scrollToHash: hash => {
        const id = decodeURIComponent(hash.slice(1));
        const resolveTarget = () =>
          document.getElementById(id)
          || (id === 'services' ? document.getElementById('process') : null)
          || (id === 'process' ? document.getElementById('services') : null);

        const performScroll = () => {
          const target = resolveTarget();
          const lenis = (window as unknown as { __lenis?: { scrollTo: (target: any, options?: any) => void; start: () => void } }).__lenis;
          if (target) {
            if (lenis) {
              lenis.start();
              lenis.scrollTo(target, { offset: -90, immediate: false });
            } else {
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          } else if (!id) {
            if (lenis) {
              lenis.start();
              lenis.scrollTo(0, { immediate: false });
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }
        };

        performScroll();
      },
    });
    const performNavigate = (href: string): Promise<boolean> => {
      const destination = resolveNavigationDestination(href, window.location.href);
      if (!destination || !controllerRef.current) return Promise.resolve(false);
      pendingDestinationRef.current = destination;
      return new Promise<boolean>(resolve => {
        const onComplete = () => {
          document.removeEventListener(APP_ROUTER_NAVIGATION_COMPLETE, onComplete);
          pendingDestinationRef.current = null;
          resolve(true);
        };
        document.addEventListener(APP_ROUTER_NAVIGATION_COMPLETE, onComplete);
        controllerRef.current?.navigate(destination).then(started => {
          if (!started) {
            document.removeEventListener(APP_ROUTER_NAVIGATION_COMPLETE, onComplete);
            pendingDestinationRef.current = null;
            resolve(false);
          }
        });
      });
    };
    (window as unknown as { __appRouterNavigate?: (href: string) => Promise<boolean> }).__appRouterNavigate = performNavigate;
    (window as unknown as { __appRouterIsNavigating?: () => boolean }).__appRouterIsNavigating = () => {
      return controllerRef.current ? controllerRef.current.getPhase() !== 'idle' : false;
    };
    return () => {
      delete (window as unknown as { __appRouterNavigate?: unknown }).__appRouterNavigate;
      delete (window as unknown as { __appRouterIsNavigating?: unknown }).__appRouterIsNavigating;
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, [router]);

  useLayoutEffect(() => {
    if (previousPathnameRef.current === pathname) return;
    previousPathnameRef.current = pathname;
    controllerRef.current?.pathnameChanged(pathname);
  }, [pathname]);

  const navigate: Navigate = useCallback(async href => {
    const destination = resolveNavigationDestination(href, window.location.href);
    if (!destination || !controllerRef.current) return false;
    pendingDestinationRef.current = destination;
    return new Promise<boolean>(resolve => {
      const onComplete = () => {
        document.removeEventListener(APP_ROUTER_NAVIGATION_COMPLETE, onComplete);
        pendingDestinationRef.current = null;
        resolve(true);
      };
      document.addEventListener(APP_ROUTER_NAVIGATION_COMPLETE, onComplete);
      controllerRef.current?.navigate(destination).then(started => {
        if (!started) {
          document.removeEventListener(APP_ROUTER_NAVIGATION_COMPLETE, onComplete);
          pendingDestinationRef.current = null;
          resolve(false);
        }
      });
    });
  }, []);

  return <AppRouterRuntimeContext.Provider value={navigate}>{children}</AppRouterRuntimeContext.Provider>;
}
