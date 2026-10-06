import type { WorkProject } from '@/data/work/hero';

export type WorkFilterStatus = 'active' | 'not-active' | 'transition-out';

export const WORK_FILTER_TRANSITION_MS = 250;

export function matchesWorkFilter(project: WorkProject, target: string) {
  return target === 'all' || project.services.some(service => service.filterName === target);
}

export function beginWorkFilterTransition(
  statuses: readonly WorkFilterStatus[],
  projects: readonly WorkProject[],
  target: string,
): WorkFilterStatus[] {
  return projects.map((project, index) => {
    if (matchesWorkFilter(project, target)) return 'active';
    return statuses[index] === 'not-active' ? 'not-active' : 'transition-out';
  });
}

export function finishWorkFilterTransition(projects: readonly WorkProject[], target: string): WorkFilterStatus[] {
  return projects.map(project => matchesWorkFilter(project, target) ? 'active' : 'not-active');
}

export function formatWorkCount(count: number) {
  return String(count).padStart(2, '0');
}
