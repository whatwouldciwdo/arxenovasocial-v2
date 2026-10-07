'use client';

import React, { useEffect, useRef, useState } from 'react';
import { WORK_HERO, type WorkProject } from '@/data/work/hero';
import {
  beginWorkFilterTransition,
  finishWorkFilterTransition,
  formatWorkCount,
  matchesWorkFilter,
  WORK_FILTER_TRANSITION_MS,
  type WorkFilterStatus,
} from './work-filter-state';

function WorkCard({
  project,
  reactOwned,
  status,
}: {
  readonly project: WorkProject;
  readonly reactOwned: boolean;
  readonly status: WorkFilterStatus;
}) {
  return (
    <div
      data-count-item=""
      data-filter-status={reactOwned ? status : 'active'}
      data-filter-name=""
      aria-hidden={reactOwned ? status === 'not-active' ? 'true' : 'false' : undefined}
      role="listitem"
      className="hero_work_item w-dyn-item"
    >
      <div className="works_work_link">
        <div className="clickable_wrap">
          <a target={project.href ? '_blank' : undefined} href={project.href ?? undefined} className="clickable_link w-inline-block">
            <span className="clickable_text u-sr-only">{project.title}</span>
          </a>
          {/* Preserve the canonical empty type attribute rather than supplying a new button default. */}
          <button type={'' as React.ButtonHTMLAttributes<HTMLButtonElement>['type']} className="clickable_btn">
            <span className="clickable_text u-sr-only">{project.title}</span>
          </button>
        </div>
        <div id="w-node-d6dc63e8-c557-23c7-915d-a3a446b84c34-40e8e4bd" className="works_work_cover u-ratio-1-1">
          <div className="works_work_hover">
            <div className="works_work_block">
              <span className={project.yearClassName}>{project.year}</span>
            </div>
            <div className="works_work_block">
              <span className="works_work_text u-text-style-small">{'View project \u2192'}</span>
            </div>
          </div>
          <img src={project.imageSrc} loading="lazy" alt="" className="works_work_image" />
          <div className="works_work_overlay" />
        </div>
        <div id="w-node-d6dc63e8-c557-23c7-915d-a3a446b84c3a-40e8e4bd" className="works_work_content">
          <div className="works_work_title">
            <h2 className="works_home_inner_title u-text-style-h5">{project.title}</h2>
            <p className="works_home_p u-text-style-h5">{project.description}</p>
            <div className="services_work_collection w-dyn-list">
              <div role="list" className="services_work_list w-dyn-items">
                {project.services.map(service => (
                  <div key={service.filterName} data-filter-name-collect={service.filterName} role="listitem" className="services_work_item u-text-style-small w-dyn-item">
                    <span className="services_work_span">{service.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkHeroSection({ reactFilters = false }: { readonly reactFilters?: boolean }) {
  const [hydrated, setHydrated] = useState(false);
  const [activeTarget, setActiveTarget] = useState('all');
  const [statuses, setStatuses] = useState<WorkFilterStatus[]>(() => WORK_HERO.projects.map(() => 'active'));
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reactOwned = reactFilters && hydrated;

  useEffect(() => {
    if (!reactFilters) return;
    setHydrated(true);
    return () => {
      if (transitionTimer.current !== null) clearTimeout(transitionTimer.current);
    };
  }, [reactFilters]);

  const selectFilter = (target: string) => {
    if (transitionTimer.current !== null) clearTimeout(transitionTimer.current);
    setActiveTarget(target);
    setStatuses(current => beginWorkFilterTransition(current, WORK_HERO.projects, target));
    transitionTimer.current = setTimeout(() => {
      setStatuses(finishWorkFilterTransition(WORK_HERO.projects, target));
      transitionTimer.current = null;
    }, WORK_FILTER_TRANSITION_MS);
  };

  const handleFilterClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!reactOwned) return;
    const button = (event.target as Element).closest<HTMLButtonElement>('[data-filter-target]');
    if (!button || !event.currentTarget.contains(button)) return;
    // The legacy runtime remains loaded during the ownership handoff. Stop its target listener.
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    selectFilter(button.dataset.filterTarget!);
  };

  const visibleCount = WORK_HERO.projects.filter((_, index) => statuses[index] === 'active').length;

  return (
    <section data-animate="" data-theme-section="light" className="hero_work_wrap">
      <div className="filters-css w-embed">
        <style />
      </div>
      <div className="hero_work_header">
        <h1 className="hero_work_heading u-text-style-h1">{WORK_HERO.heading}</h1>
        <div className="hero_work_index u-text-style-h1">(<span data-count-display="work" className="hero_work_total">{reactOwned ? formatWorkCount(visibleCount) : WORK_HERO.countPlaceholder}</span>)</div>
      </div>
      <div
        data-animate=""
        data-filter-group=""
        data-work-filters-owner={reactFilters ? 'react' : undefined}
        role="group"
        data-filter-target-match="multi"
        data-filter-name-match="multi"
        className="hero_work_content"
        onClickCapture={handleFilterClickCapture}
      >
        <div className="hero_work_left">
          <div className="hero_work_filters">
            <div data-eyebrow-intro="" data-wf--global-eyebrow--variant="base-light" className="g_eyebrow">
              <div className="g_eyebrow_circle" />
              <div id="w-node-_01473dc5-045d-cd95-0817-52d9c52ac3d1-c52ac3cf" className="g_eyebrow_text u-text-style-large w-variant-e146755c-7cd8-05ac-1b2a-e5d85dd563b0">{WORK_HERO.eyebrow}</div>
            </div>
            <ul id="" className="filter-buttons">
              {WORK_HERO.filters.map((filter, index) => (
                <li key={filter.target} data-btn-default="" className="filter_button_list">
                  <button
                    data-filter-target={filter.target}
                    data-filter-status={(reactOwned ? filter.target === activeTarget : index === 0) ? 'active' : 'not-active'}
                    aria-pressed={(reactOwned ? filter.target === activeTarget : index === 0) ? 'true' : 'false'}
                    aria-controls="filter-list"
                    className="filter-btn u-text-style-main"
                  >{filter.label}</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="hero_work_projects">
          <div data-layout-status="active" data-layout-type="grid" className="hero_work_collection w-dyn-list">
            <div data-count-group="work" aria-live="polite" role="list" className="hero_work_list u-grid-custom w-dyn-items">
              {WORK_HERO.projects.map((project, index) => (
                <WorkCard key={project.title} project={project} reactOwned={reactOwned} status={statuses[index]} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
