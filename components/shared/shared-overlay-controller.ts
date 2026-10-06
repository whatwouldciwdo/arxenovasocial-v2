export const SHARED_OVERLAY_OWNER_ATTRIBUTE = 'data-shared-overlays-owner';
export const SHARED_OVERLAY_OWNER_VALUE = 'react';

export type SharedOverlay = 'closed' | 'menu' | 'about';

export interface SharedOverlayState {
  active: SharedOverlay;
  resumeMenu: boolean;
}

export type SharedOverlayEvent =
  | 'toggle-menu'
  | 'close-menu'
  | 'open-about'
  | 'close-about'
  | 'close-all';

export const CLOSED_OVERLAY_STATE: SharedOverlayState = {
  active: 'closed',
  resumeMenu: false,
};

export function reduceSharedOverlayState(
  state: SharedOverlayState,
  event: SharedOverlayEvent,
): SharedOverlayState {
  switch (event) {
    case 'toggle-menu':
      if (state.active === 'about') return state;
      return state.active === 'menu'
        ? CLOSED_OVERLAY_STATE
        : { active: 'menu', resumeMenu: false };
    case 'close-menu':
      return state.active === 'menu' ? CLOSED_OVERLAY_STATE : state;
    case 'open-about':
      return { active: 'about', resumeMenu: state.active === 'menu' || state.resumeMenu };
    case 'close-about':
      if (state.active !== 'about') return state;
      return state.resumeMenu ? { active: 'menu', resumeMenu: false } : CLOSED_OVERLAY_STATE;
    case 'close-all':
      return CLOSED_OVERLAY_STATE;
  }
}

const FOCUSABLE_SELECTOR = 'a[href],button,input,select,textarea,[tabindex]';

function setVisible(element: HTMLElement | null, visible: boolean) {
  if (!element) return;
  element.style.opacity = visible ? '1' : '0';
  element.style.visibility = visible ? 'visible' : 'hidden';
  element.style.pointerEvents = visible ? 'auto' : 'none';
}

function focusableElements(modal: HTMLElement) {
  return Array.from(modal.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(element =>
    !(element as HTMLButtonElement).disabled
    && element.tabIndex >= 0
    && element.getClientRects().length > 0
    && getComputedStyle(element).visibility !== 'hidden'
    && !element.closest('[inert]'));
}

export interface SharedOverlayController {
  closeForPathnameChange: () => void;
  destroy: () => void;
  getState: () => SharedOverlayState;
}

export function createSharedOverlayController(doc: Document): SharedOverlayController {
  const body = doc.body;
  let state = CLOSED_OVERLAY_STATE;
  let opener: HTMLElement | null = null;
  let focusFrame = 0;
  let observedContainer = doc.querySelector('[data-barba="container"]');
  const modal = () => doc.querySelector<HTMLElement>('.about_modal_wrap');

  // GSAP animation bridges — installed by repaired monolog-runtime.js.
  // Falls back to direct style manipulation if runtime hasn't loaded yet.
  const menuAnimBridge = () =>
    (window as unknown as Record<string, { open: () => void; close: () => void } | undefined>).__menu_anim;
  const aboutAnimBridge = () =>
    (window as unknown as Record<string, { open: () => void; close: () => void } | undefined>).__about_anim;

  let prevMenuOpen = false;
  let prevAboutOpen = false;
  let closeTimer: ReturnType<typeof setTimeout> | null = null;

  const render = () => {
    const menuOpen = state.active === 'menu' || state.resumeMenu;
    const aboutOpen = state.active === 'about';
    const locked = menuOpen || aboutOpen;
    body.dataset.navigationStatus = menuOpen ? 'is-open' : 'is-closed';
    body.dataset.aboutStatus = aboutOpen ? 'is-open' : 'is-closed';
    body.classList.toggle('overflow-hidden', locked);
    if (locked) body.setAttribute('data-lenis-prevent', 'true');
    else body.removeAttribute('data-lenis-prevent');

    // Menu animation: delegate to GSAP bridge or fall back to direct style
    if (menuOpen !== prevMenuOpen) {
      prevMenuOpen = menuOpen;
      const anim = menuAnimBridge();
      if (anim) {
        if (menuOpen) anim.open();
        else anim.close();
      } else {
        // Fallback: direct style (matches runtime initial state, no easing)
        const menuContain = doc.querySelector<HTMLElement>('.menu_contain');
        const menuPopup = doc.querySelector<HTMLElement>('.menu_popup_collection');
        if (menuContain) {
          menuContain.style.transform = `translateY(${menuOpen ? '0' : '-100%'})`;
          menuContain.style.opacity = '1';
          menuContain.style.visibility = 'visible';
        }
        if (menuPopup) {
          menuPopup.style.transform = menuOpen ? 'translateY(0) scale(1)' : 'translateY(-100%) scale(.95)';
          menuPopup.style.opacity = menuOpen ? '1' : '0';
          menuPopup.style.visibility = menuOpen ? 'visible' : 'hidden';
        }
        setVisible(doc.querySelector<HTMLElement>('.menu_overlay_close'), menuOpen);
      }
    }

    // About animation: delegate to GSAP bridge or fall back to direct style
    if (aboutOpen !== prevAboutOpen) {
      prevAboutOpen = aboutOpen;
      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }
      const aboutModal = modal();
      const aboutOverlay = doc.querySelector<HTMLElement>('.about_overlay_close');
      const anim = aboutAnimBridge();
      if (anim) {
        if (aboutModal) {
          aboutModal.style.visibility = 'visible';
          aboutModal.style.opacity = '1';
          aboutModal.style.pointerEvents = aboutOpen ? 'auto' : 'none';
          aboutModal.querySelectorAll<HTMLElement>('[data-split="heading"]').forEach(heading => {
            heading.style.visibility = 'visible';
            heading.style.opacity = '1';
          });
        }
        if (aboutOpen) anim.open();
        else anim.close();
      } else {
        if (aboutModal) {
          aboutModal.style.transition =
            'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1)';
          const headings = aboutModal.querySelectorAll<HTMLElement>('[data-split="heading"]');
          headings.forEach(heading => {
            heading.style.transition = 'opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.15s';
          });
          if (aboutOpen) {
            aboutModal.style.visibility = 'visible';
            aboutModal.style.opacity = '1';
            aboutModal.style.transform = 'translateX(0)';
            aboutModal.style.pointerEvents = 'auto';
            headings.forEach(heading => {
              heading.style.visibility = 'visible';
              heading.style.opacity = '1';
            });
            const videoOverlay = aboutModal.querySelector<HTMLElement>('.about_modal_overlay');
            if (videoOverlay) videoOverlay.style.opacity = '0';
          } else {
            aboutModal.style.transform = 'translateX(100%)';
            aboutModal.style.opacity = '0';
            aboutModal.style.pointerEvents = 'none';
            headings.forEach(heading => {
              heading.style.opacity = '0';
            });
            closeTimer = setTimeout(() => {
              if (state.active !== 'about' && aboutModal) {
                aboutModal.style.visibility = 'hidden';
                headings.forEach(heading => {
                  heading.style.visibility = 'hidden';
                });
              }
            }, 650);
          }
        }
        if (aboutOverlay) {
          aboutOverlay.style.transition = 'opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1)';
          if (aboutOpen) {
            setVisible(aboutOverlay, true);
          } else {
            aboutOverlay.style.opacity = '0';
            aboutOverlay.style.pointerEvents = 'none';
            closeTimer = setTimeout(() => {
              if (state.active !== 'about' && aboutOverlay) {
                aboutOverlay.style.visibility = 'hidden';
              }
            }, 650);
          }
        }
      }
    }
  };

  const dispatch = (event: SharedOverlayEvent) => {
    const previous = state;
    state = reduceSharedOverlayState(state, event);
    if (state !== previous) render();
  };

  const focusFirst = () => {
    const aboutModal = modal();
    if (state.active !== 'about' || !aboutModal) return;
    (focusableElements(aboutModal)[0] || aboutModal).focus({ preventScroll: true });
  };

  const openAbout = (nextOpener: HTMLElement) => {
    opener = nextOpener;
    dispatch('open-about');
    cancelAnimationFrame(focusFrame);
    focusFrame = requestAnimationFrame(focusFirst);
  };

  const closeAbout = (restoreFocus: boolean) => {
    if (state.active !== 'about') return;
    cancelAnimationFrame(focusFrame);
    const elementToRestore = opener;
    dispatch('close-about');
    opener = null;
    if (restoreFocus && elementToRestore) {
      focusFrame = requestAnimationFrame(() => {
        if (elementToRestore.isConnected) elementToRestore.focus({ preventScroll: true });
      });
    }
  };

  const closeAll = () => {
    cancelAnimationFrame(focusFrame);
    opener = null;
    dispatch('close-all');
  };

  const onClick = (event: MouseEvent) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    if (target.closest('[data-menu-btn]')) {
      dispatch('toggle-menu');
      return;
    }
    const aboutOpener = target.closest<HTMLElement>('[data-open-modal]');
    if (aboutOpener) {
      if (state.active === 'about') closeAbout(true);
      else openAbout(aboutOpener);
      return;
    }
    if (target.closest('[data-close-modal]')) {
      if (state.active === 'about') closeAbout(true);
      else dispatch('close-menu');
      return;
    }
    if (target.closest('.menu_contain a')) dispatch('close-menu');
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      if (state.active === 'about') {
        event.preventDefault();
        closeAbout(true);
      } else if (state.active === 'menu') dispatch('close-menu');
      return;
    }
    if (event.key !== 'Tab' || state.active !== 'about') return;
    const aboutModal = modal();
    if (!aboutModal) return;
    const items = focusableElements(aboutModal);
    const first = items[0];
    const last = items[items.length - 1];
    const active = doc.activeElement;
    if (!items.length) {
      event.preventDefault();
      aboutModal.focus({ preventScroll: true });
    } else if (!aboutModal.contains(active) || active === aboutModal
      || (event.shiftKey ? active === first : active === last)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus({ preventScroll: true });
    }
  };

  const onFocusIn = (event: FocusEvent) => {
    const aboutModal = modal();
    if (state.active === 'about' && aboutModal && !aboutModal.contains(event.target as Node)) focusFirst();
  };

  const observer = new MutationObserver(() => {
    const nextContainer = doc.querySelector('[data-barba="container"]');
    if (nextContainer !== observedContainer) {
      observedContainer = nextContainer;
      closeAll();
    }
  });

  const aboutModal = modal();
  const originalTabIndex = aboutModal?.getAttribute('tabindex') ?? null;
  aboutModal?.setAttribute('tabindex', '-1');
  if (aboutModal) {
    aboutModal.style.transform = 'translateX(100%)';
    aboutModal.style.opacity = '0';
    aboutModal.style.visibility = 'hidden';
    aboutModal.style.pointerEvents = 'none';
  }
  const aboutOverlay = doc.querySelector<HTMLElement>('.about_overlay_close');
  if (aboutOverlay) {
    aboutOverlay.style.opacity = '0';
    aboutOverlay.style.visibility = 'hidden';
    aboutOverlay.style.pointerEvents = 'none';
  }
  const onNavClose = () => {
    closeAll();
  };
  doc.addEventListener('click', onClick);
  doc.addEventListener('keydown', onKeyDown);
  doc.addEventListener('focusin', onFocusIn);
  doc.addEventListener('app-router:navigation-close', onNavClose);
  doc.addEventListener('app-router:navigation-start', onNavClose);
  observer.observe(body, { childList: true, subtree: true });
  render();

  return {
    closeForPathnameChange: closeAll,
    destroy() {
      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }
      cancelAnimationFrame(focusFrame);
      observer.disconnect();
      doc.removeEventListener('click', onClick);
      doc.removeEventListener('keydown', onKeyDown);
      doc.removeEventListener('focusin', onFocusIn);
      doc.removeEventListener('app-router:navigation-close', onNavClose);
      doc.removeEventListener('app-router:navigation-start', onNavClose);
      if (aboutModal) {
        if (originalTabIndex === null) aboutModal.removeAttribute('tabindex');
        else aboutModal.setAttribute('tabindex', originalTabIndex);
      }
      closeAll();
    },
    getState: () => state,
  };
}
