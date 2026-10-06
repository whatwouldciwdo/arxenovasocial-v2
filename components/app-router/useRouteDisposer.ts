'use client';

import { useEffect } from 'react';
import { registerRouteDisposer, type RouteDisposer } from './app-router-runtime';

export function useRouteDisposer(disposer: RouteDisposer) {
  useEffect(() => registerRouteDisposer(disposer), [disposer]);
}
