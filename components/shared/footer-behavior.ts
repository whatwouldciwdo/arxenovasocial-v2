export const FOOTER_BEHAVIOR_ATTRIBUTE = 'data-footer-behavior';
export const FOOTER_BEHAVIOR_VALUE = 'modular';
export const FOOTER_ABOUT_EVENT = 'canonical-footer:about-request';

const HIGHLIGHT_COLOR = '#fafaf9';
const JAKARTA_TIME_ZONE = 'Asia/Jakarta';

export interface FooterBehaviorController {
  destroy(): void;
}

function formatJakartaTime(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: JAKARTA_TIME_ZONE,
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find(part => part.type === type)?.value ?? '';
  return `${value('hour')}<span class="blinking-colon">:</span>${value('minute')}`
    + `<span class="blinking-colon">:</span>${value('second')}`
    + `<span class="footer_time_period">${value('dayPeriod')}</span>`;
}

function formatJakartaDate(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: JAKARTA_TIME_ZONE,
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find(part => part.type === type)?.value ?? '';
  return `${value('weekday')}, ${value('month')} ${value('day')}, ${value('year')} (GMT +07)`;
}

function animate(element: Element, keyframes: Keyframe[], duration: number, animations: Set<Animation>) {
  const animation = element.animate(keyframes, {
    duration,
    easing: 'cubic-bezier(.25,.1,.25,1)',
    fill: 'forwards',
  });
  animations.add(animation);
  animation.finished.finally(() => animations.delete(animation)).catch(() => {});
  return animation;
}

export function createFooterBehavior(root: HTMLElement, pathname: string): FooterBehaviorController {
  const cleanups: Array<() => void> = [];
  const animations = new Set<Animation>();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const precisePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const listen = <K extends keyof HTMLElementEventMap>(
    element: HTMLElement,
    type: K,
    listener: (event: HTMLElementEventMap[K]) => void,
  ) => {
    element.addEventListener(type, listener as EventListener);
    cleanups.push(() => element.removeEventListener(type, listener as EventListener));
  };

  const updateClock = () => {
    const now = new Date();
    root.querySelectorAll<HTMLElement>('[data-footer-time]').forEach(element => {
      element.querySelectorAll('.blinking-colon').forEach(colon => {
        colon.getAnimations().forEach(animation => {
          animation.cancel();
          animations.delete(animation);
        });
      });
      element.innerHTML = formatJakartaTime(now);
    });
    root.querySelectorAll<HTMLElement>('[data-footer-date]').forEach(element => {
      element.textContent = formatJakartaDate(now);
    });
    root.querySelectorAll<HTMLElement>('[data-footer-year]').forEach(element => {
      element.textContent = String(now.getFullYear());
    });
    root.querySelectorAll<HTMLElement>('.blinking-colon').forEach(colon => {
      if (reducedMotion || colon.getAnimations().length) return;
      const animation = colon.animate([{ opacity: 1 }, { opacity: 0 }, { opacity: 1 }], {
        duration: 1000,
        easing: 'steps(1, end)',
        iterations: Infinity,
      });
      animations.add(animation);
    });
  };
  updateClock();
  const clock = window.setInterval(updateClock, 1000);
  cleanups.push(() => window.clearInterval(clock));

  root.querySelectorAll<HTMLElement>('#to-top').forEach(button => {
    listen(button, 'click', event => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  });

  root.querySelectorAll<HTMLElement>('[data-open-modal]').forEach(trigger => {
    listen(trigger, 'click', () => {
      trigger.dispatchEvent(new CustomEvent(FOOTER_ABOUT_EVENT, {
        bubbles: true,
        detail: { pathname, trigger },
      }));
    });
  });

  if (precisePointer && !reducedMotion) {
    root.querySelectorAll<HTMLElement>('[data-hover-highlight]').forEach(target => {
      const headings = Array.from(target.querySelectorAll<HTMLElement>('[data-hover-heading]'));
      const arrows = Array.from(target.querySelectorAll<HTMLElement>('[data-footer-arrow]'));
      const topArrows = Array.from(target.querySelectorAll<HTMLElement>('[data-top-arrow]'));
      const transition = (active: boolean) => {
        [
          animate(target, [{ backgroundColor: active ? 'transparent' : HIGHLIGHT_COLOR },
            { backgroundColor: active ? HIGHLIGHT_COLOR : 'transparent' }], 300, animations),
          ...headings.map(element => animate(element,
            [{ transform: active ? 'translateX(0)' : 'translateX(.15em)' },
              { transform: active ? 'translateX(.15em)' : 'translateX(0)' }], 300, animations)),
          ...arrows.map(element => animate(element,
            [{ transform: active ? 'translateX(0)' : 'translateX(.25em)' },
              { transform: active ? 'translateX(.25em)' : 'translateX(0)' }], 300, animations)),
          ...topArrows.map(element => animate(element,
            [{ transform: active ? 'translateY(0)' : 'translateY(-.2em)' },
              { transform: active ? 'translateY(-.2em)' : 'translateY(0)' }], 300, animations)),
        ];
      };
      listen(target, 'pointerenter', () => transition(true));
      listen(target, 'pointerleave', () => transition(false));
    });
  }

  return {
    destroy() {
      cleanups.splice(0).forEach(cleanup => cleanup());
      animations.forEach(animation => animation.cancel());
      animations.clear();
    },
  };
}
