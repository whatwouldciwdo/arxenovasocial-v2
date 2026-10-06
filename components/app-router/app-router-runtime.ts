export const APP_ROUTER_NAVIGATION_START = 'app-router:navigation-start';
export const APP_ROUTER_NAVIGATION_CLOSE = 'app-router:navigation-close';
export const APP_ROUTER_NAVIGATION_RESET = 'app-router:navigation-reset';
export const APP_ROUTER_NAVIGATION_COMPLETE = 'app-router:navigation-complete';

export type NavigationPhase = 'idle' | 'covering' | 'navigating' | 'revealing';

export type NavigationEvent =
  | 'start'
  | 'covered'
  | 'complete'
  | 'revealed'
  | 'escape';

export function reduceNavigationPhase(phase: NavigationPhase, event: NavigationEvent): NavigationPhase {
  if (event === 'escape') return 'idle';
  if (phase === 'idle' && event === 'start') return 'covering';
  if (phase === 'covering' && event === 'covered') return 'navigating';
  if ((phase === 'covering' || phase === 'navigating') && event === 'complete') return 'revealing';
  if (phase === 'revealing' && event === 'revealed') return 'idle';
  return phase;
}

export interface NavigationDestination {
  href: string;
  pathname: string;
  hash: string;
}

export function resolveNavigationDestination(href: string, base: string): NavigationDestination | null {
  let url: URL;
  try {
    url = new URL(href, base);
  } catch {
    return null;
  }
  const origin = new URL(base).origin;
  if (url.origin !== origin || !['http:', 'https:'].includes(url.protocol)) return null;
  return {
    href: `${url.pathname}${url.search}${url.hash}`,
    pathname: url.pathname,
    hash: url.hash,
  };
}

export type RouteDisposer = () => void;

const routeDisposers: RouteDisposer[] = [];

export function registerRouteDisposer(disposer: RouteDisposer) {
  routeDisposers.push(disposer);
  let active = true;
  return () => {
    if (!active) return;
    active = false;
    const index = routeDisposers.lastIndexOf(disposer);
    if (index >= 0) routeDisposers.splice(index, 1);
  };
}

export function disposeRouteControllers() {
  const errors: unknown[] = [];
  while (routeDisposers.length) {
    try {
      routeDisposers.pop()?.();
    } catch (error) {
      errors.push(error);
    }
  }
  if (errors.length) console.error('App Router route cleanup failed', errors);
}

export interface TransitionScreenController {
  cover: (reducedMotion: boolean) => Promise<void>;
  reveal: (reducedMotion: boolean) => Promise<void>;
  reset: () => void;
}

export function createTransitionScreenController(doc: Document): TransitionScreenController {
  let animation: Animation | null = null;
  const screen = () => doc.querySelector<HTMLElement>('.transition_screen');
  const setHidden = (element: HTMLElement) => {
    element.style.opacity = '0';
    element.style.visibility = 'hidden';
    element.style.pointerEvents = 'none';
  };
  const animate = async (visible: boolean, reducedMotion: boolean) => {
    animation?.cancel();
    animation = null;
    const element = screen();
    if (!element) return;
    element.style.visibility = 'visible';
    element.style.pointerEvents = visible ? 'auto' : 'none';
    if (reducedMotion || typeof element.animate !== 'function') {
      if (visible) element.style.opacity = '1';
      else setHidden(element);
      return;
    }
    animation = element.animate(
      [{ opacity: visible ? 0 : 1 }, { opacity: visible ? 1 : 0 }],
      { duration: 350, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'forwards' },
    );
    try {
      await animation.finished;
    } catch {
      return;
    }
    if (!visible) setHidden(element);
  };
  return {
    cover: reducedMotion => animate(true, reducedMotion),
    reveal: reducedMotion => animate(false, reducedMotion),
    reset() {
      animation?.cancel();
      animation = null;
      const element = screen();
      if (element) setHidden(element);
    },
  };
}

export interface AppRouterNavigationControllerOptions {
  getPathname: () => string;
  push: (href: string) => void;
  transition: TransitionScreenController;
  disposeRoute?: () => void;
  dispatch?: (name: string, detail: Record<string, unknown>) => void;
  scrollToHash?: (hash: string) => void;
  reducedMotion?: () => boolean;
  setTimer?: (callback: () => void, delay: number) => ReturnType<typeof setTimeout>;
  clearTimer?: (timer: ReturnType<typeof setTimeout>) => void;
  timeout?: number;
}

export interface AppRouterNavigationController {
  navigate: (destination: NavigationDestination) => Promise<boolean>;
  pathnameChanged: (pathname: string) => void;
  getPhase: () => NavigationPhase;
  destroy: () => void;
}

export function createAppRouterNavigationController({
  getPathname,
  push,
  transition,
  disposeRoute = disposeRouteControllers,
  dispatch = () => {},
  scrollToHash = () => {},
  reducedMotion = () => false,
  setTimer = setTimeout,
  clearTimer = clearTimeout,
  timeout = 7000,
}: AppRouterNavigationControllerOptions): AppRouterNavigationController {
  let phase: NavigationPhase = 'idle';
  let pending: NavigationDestination | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let sequence = 0;
  let destroyed = false;

  const emit = (name: string, destination = pending) => dispatch(name, {
    href: destination?.href ?? null,
    pathname: destination?.pathname ?? getPathname(),
    hash: destination?.hash ?? '',
  });
  const cancelTimer = () => {
    if (timer !== null) clearTimer(timer);
    timer = null;
  };
  const finish = async (id: number) => {
    if (destroyed || id !== sequence || phase === 'idle') return;
    cancelTimer();
    phase = reduceNavigationPhase(phase, 'complete');
    await transition.reveal(reducedMotion());
    if (destroyed || id !== sequence) return;
    if (pending?.hash) scrollToHash(pending.hash);
    emit(APP_ROUTER_NAVIGATION_COMPLETE);
    pending = null;
    phase = reduceNavigationPhase(phase, 'revealed');
  };
  const escape = () => {
    if (phase === 'idle') return;
    const destination = pending;
    sequence++;
    cancelTimer();
    transition.reset();
    pending = null;
    phase = reduceNavigationPhase(phase, 'escape');
    emit(APP_ROUTER_NAVIGATION_COMPLETE, destination);
  };

  return {
    async navigate(destination) {
      if (destroyed || phase !== 'idle') return false;
      const id = ++sequence;
      pending = destination;
      phase = reduceNavigationPhase(phase, 'start');
      emit(APP_ROUTER_NAVIGATION_START);
      emit(APP_ROUTER_NAVIGATION_CLOSE);
      disposeRoute();
      emit(APP_ROUTER_NAVIGATION_RESET);
      timer = setTimer(escape, timeout);
      await transition.cover(reducedMotion());
      if (destroyed || id !== sequence) return true;
      phase = reduceNavigationPhase(phase, 'covered');
      try {
        push(destination.href);
      } catch {
        escape();
        return false;
      }
      // Hash-only pushes do not change usePathname, so complete them explicitly.
      if (destination.pathname === getPathname()) void finish(id);
      return true;
    },
    pathnameChanged(pathname) {
      if (destroyed) return;
      if (pending) {
        if (pathname === pending.pathname) void finish(sequence);
        return;
      }
      // Back/forward is observed through usePathname; no popstate listener is installed.
      emit(APP_ROUTER_NAVIGATION_CLOSE);
      disposeRoute();
      emit(APP_ROUTER_NAVIGATION_RESET);
      transition.reset();
      emit(APP_ROUTER_NAVIGATION_COMPLETE);
    },
    getPhase: () => phase,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      sequence++;
      cancelTimer();
      pending = null;
      phase = 'idle';
      transition.reset();
    },
  };
}
