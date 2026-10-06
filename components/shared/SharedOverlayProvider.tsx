'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { createSharedOverlayController, type SharedOverlayController } from './shared-overlay-controller';

export default function SharedOverlayProvider({ children, enabled = false }: {
  children: React.ReactNode;
  enabled?: boolean;
}) {
  const pathname = usePathname();
  const controllerRef = useRef<SharedOverlayController | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const controller = createSharedOverlayController(document);
    controllerRef.current = controller;
    return () => {
      controller.destroy();
      controllerRef.current = null;
    };
  }, [enabled]);

  useEffect(() => {
    controllerRef.current?.closeForPathnameChange();
  }, [pathname]);

  return children;
}
