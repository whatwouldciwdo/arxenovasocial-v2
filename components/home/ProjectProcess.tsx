'use client';

import React, { useEffect, useRef, type RefObject } from 'react';
import { processSteps } from '../../data/home/process';
import { processCss, processHeadingPaths } from './process-artwork';

const expectedPlaybackErrors = new Set(['AbortError', 'NotAllowedError']);

type ProcessObserver = Pick<IntersectionObserver, 'disconnect' | 'observe'>;
type ProcessObserverFactory = (
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit,
) => ProcessObserver;

function isExpectedPlaybackError(error: unknown): boolean {
  return typeof error === 'object' && error !== null
    && 'name' in error && typeof error.name === 'string'
    && expectedPlaybackErrors.has(error.name);
}

export function playProcessVideo(video: HTMLVideoElement): Promise<void> {
  try {
    return Promise.resolve(video.play()).catch((error: unknown) => {
      if (isExpectedPlaybackError(error)) return;
      throw error;
    });
  } catch (error) {
    if (isExpectedPlaybackError(error)) return Promise.resolve();
    return Promise.reject(error);
  }
}

export function attachProjectProcessPlayback(
  root: ParentNode,
  createObserver: ProcessObserverFactory = (callback, options) =>
    new IntersectionObserver(callback, options),
): () => void {
  const videos = new Map<Element, HTMLVideoElement>();

  root.querySelectorAll('[data-video="playpause"]').forEach((target) => {
    const video = target.querySelector('video');
    if (video instanceof HTMLVideoElement) videos.set(target, video);
  });

  const observer = createObserver((entries) => {
    entries.forEach((entry) => {
      const video = videos.get(entry.target);
      if (!video) return;
      if (entry.isIntersecting) void playProcessVideo(video);
      else video.pause();
    });
  }, {
    root: null,
    rootMargin: '0px',
    threshold: 0,
  });

  videos.forEach((_, target) => observer.observe(target));

  return () => {
    videos.forEach((video) => video.pause());
    observer.disconnect();
  };
}

function useProjectProcessPlayback(
  rootRef: RefObject<HTMLElement>,
  enabled: boolean,
): void {
  useEffect(() => {
    if (!enabled || !rootRef.current) return;
    return attachProjectProcessPlayback(rootRef.current);
  }, [enabled, rootRef]);
}

export default function ProjectProcess({
  modularVideoPlayback = false,
}: {
  modularVideoPlayback?: boolean;
}) {
  const rootRef = useRef<HTMLElement>(null);
  useProjectProcessPlayback(rootRef, modularVideoPlayback);

  return (
    <section
      ref={rootRef}
      id="process"
      data-process-video-behavior={modularVideoPlayback ? 'modular' : undefined}
      className="process_home_wrap"
    >
      <div id="services" style={{ position: 'absolute', top: 0, left: 0, height: 0, width: 0, pointerEvents: 'none' }} />
      <div className="process_css w-embed"><style>{processCss}</style></div>
      <h2 className="process_home_heading u-text-style-display u-sr-only">Project Process</h2>
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 1364 138" fill="none" className="process_heading_svg">
        {processHeadingPaths.map((d, index) => <path key={index} d={d} fill="currentColor" />)}
      </svg>
      <div className="process_home_content w-dyn-list">
        <div role="list" className="process_home_content-list w-dyn-items">
          {processSteps.map((step) => (
            <div key={step.id} role="listitem" className="process_home_content-item w-dyn-item">
              <div className="process_home_content-left">
                <div className="process_home_content_index u-text-mono">
                  <div className="process_home_micrographic">
                    <div className="works_home_content_ss u-text-style-micro">Step</div>
                    <div className="process_micrographic_inner"><div className="process_micrographic_circle" /></div>
                    <div className="process_home_content_span u-text-style-micro">{'\u200e '}</div>
                  </div>
                </div>
                <div className="process_home_content_inner">
                  <h3 className="process_home_content_heading u-text-style-h6">{step.heading}</h3>
                  <p className="process_home_content-p u-text-style-small">{step.description}</p>
                </div>
              </div>
              <a data-video="playpause" data-cursor-text={step.cta} data-cursor-hover=""
                aria-label={step.cta} href={step.href} target="_blank" className="process_home_video w-inline-block">
                <video src={step.videoSrc} loop muted playsInline preload="none"
                  className="overview_home_video u-ratio-16-9 u-background-skeleton" />
                <div className="process_home_cta u-text-mono is-desktop u-sr-only">{step.cta}</div>
                <div className="process_home_cta u-text-mono">{step.cta}</div>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
