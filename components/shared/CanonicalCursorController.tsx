'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const FINE_POINTER = '(hover: hover) and (pointer: fine)';
const HOVER_TARGET = '[data-cursor-hover]';
const POSITION_DURATION = 400;
const POSITION_EASING = 'cubic-bezier(0.215, 0.61, 0.355, 1)';
const SCALE_EASING = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';

type CursorAnimation = Animation & { commitStyles?: () => void };

function replaceAnimation(
  current: CursorAnimation | null,
  element: HTMLElement,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions,
) {
  if (current) {
    current.commitStyles?.();
    current.cancel();
  }
  return element.animate(keyframes, { ...options, fill: 'forwards' }) as CursorAnimation;
}

export function mountCanonicalCursor(cursor: HTMLElement) {
  const text = cursor.querySelector<HTMLElement>('[data-cursor-text-target]');
  if (!text || !window.matchMedia(FINE_POINTER).matches) return;

  let x = 0;
  let y = 0;
  let hasPointer = false;
  let frame = 0;
  let disposed = false;
  let positionAnimation: CursorAnimation | null = null;
  let scaleAnimation: CursorAnimation | null = null;

  const reset = () => {
    cursor.setAttribute('data-cursor', '');
    text.textContent = '';
  };

  const hitTest = () => {
    const hovered = document.elementFromPoint(x, y)?.closest<HTMLElement>(HOVER_TARGET) ?? null;
    const isActive = hovered !== null;
    const isEdge = isActive && cursor.getBoundingClientRect().right > window.innerWidth;
    cursor.setAttribute('data-cursor', isActive ? (isEdge ? 'active-edge' : 'active') : '');
    text.textContent = hovered?.getAttribute('data-cursor-text') ?? '';
  };

  const scheduleHitTest = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      if (!disposed) hitTest();
    });
  };

  const move = (event: MouseEvent) => {
    x = event.clientX;
    y = event.clientY;
    hasPointer = true;
    const translate = getComputedStyle(cursor).translate;
    positionAnimation = replaceAnimation(positionAnimation, cursor, [
      { translate: translate === 'none' ? '0px 0px' : translate },
      { translate: `${x}px ${y}px` },
    ], { duration: POSITION_DURATION, easing: POSITION_EASING });
    scheduleHitTest();
  };
  const scroll = () => {
    if (hasPointer) scheduleHitTest();
  };
  const scale = (value: number, duration: number) => {
    const currentScale = getComputedStyle(cursor).scale;
    scaleAnimation = replaceAnimation(scaleAnimation, cursor, [
      { scale: currentScale === 'none' ? '1' : currentScale },
      { scale: String(value) },
    ], { duration, easing: SCALE_EASING });
  };
  const down = (event: MouseEvent) => {
    if (event.button === 0) scale(0.9, 400);
  };
  const up = (event: MouseEvent) => {
    if (event.button === 0) scale(1, 300);
  };

  reset();
  window.addEventListener('mousemove', move);
  window.addEventListener('scroll', scroll, { passive: true });
  window.addEventListener('mousedown', down);
  window.addEventListener('mouseup', up);

  return () => {
    if (disposed) return;
    disposed = true;
    window.removeEventListener('mousemove', move);
    window.removeEventListener('scroll', scroll);
    window.removeEventListener('mousedown', down);
    window.removeEventListener('mouseup', up);
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
    positionAnimation?.cancel();
    scaleAnimation?.cancel();
    cursor.style.removeProperty('translate');
    cursor.style.removeProperty('scale');
    reset();
  };
}

export default function CanonicalCursorController() {
  const pathname = usePathname();

  useEffect(() => {
    const cursor = document.querySelector<HTMLElement>('[data-cursor]');
    if (cursor) return mountCanonicalCursor(cursor);
  }, [pathname]);

  return null;
}
