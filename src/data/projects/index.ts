import { dumbe } from './dumbe';
import { exabot } from './exabot';
import type { Project } from './types';

export type { Project, ProjectMedia, SpecRow } from './types';

/** Projects in display order (the first one is the featured project). */
export const projects: readonly Project[] = [dumbe, exabot];

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

/** The project shown after `slug` on the project pages (wraps around). */
export function getNextProject(slug: string): Project {
  const index = projects.findIndex((project) => project.slug === slug);
  return projects[(index + 1) % projects.length] as Project;
}
