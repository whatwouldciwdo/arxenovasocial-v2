import React from 'react';
import { processSteps } from '../../data/home/process';
import { processCss, processHeadingPaths } from './process-artwork';

// Markup only: legacy owns playback, cursor, scrolling, and cleanup.
// PROCESS_USE_LEGACY=1 restores the preserved legacy section in one restart.
export default function ProjectProcess() {
  return (
    <section id="process" className="process_home_wrap">
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
