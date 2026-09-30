import { describe, expect, it } from 'vitest';
import { getNextProject, getProject, projects } from '@/data/projects';
import { LANGS } from '@/i18n/routes';

describe('project data', () => {
  it('has unique, URL-safe slugs', () => {
    const slugs = projects.map((project) => project.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it.each(projects.map((project) => [project.slug, project] as const))(
    '%s has complete content in every language',
    (_slug, project) => {
      for (const lang of LANGS) {
        expect(project.kind[lang], `kind.${lang}`).not.toBe('');
        expect(project.status[lang], `status.${lang}`).not.toBe('');
        expect(project.summary[lang], `summary.${lang}`).not.toBe('');
        expect(project.coverAlt[lang], `coverAlt.${lang}`).not.toBe('');
        for (const item of project.roadmap) expect(item[lang]).not.toBe('');
        for (const row of [...project.bom, ...(project.design ?? []), ...(project.specs ?? [])]) {
          expect(row.label[lang], `row label ${lang}`).not.toBe('');
          expect(row.value[lang], `row value ${lang}`).not.toBe('');
        }
      }
    },
  );

  it.each(projects.map((project) => [project.slug, project] as const))(
    '%s has an accessible, well-formed gallery',
    (_slug, project) => {
      expect(project.media.length).toBeGreaterThan(0);
      // The first slide is the LCP image of the page: it must be an image.
      expect(project.media[0]?.type).toBe('image');

      for (const item of project.media) {
        for (const lang of LANGS) {
          const text = item.type === 'video' ? item.title[lang] : item.alt[lang];
          expect(text, `${item.type} ${lang}`).not.toBe('');
        }
        if (item.type === 'video') expect(item.youtubeId).toMatch(/^[\w-]{11}$/);
        if (item.type === 'model') expect(item.file).toMatch(/\.glb$/);
      }
    },
  );

  it('finds projects by slug and cycles through them', () => {
    const [first, second] = projects;
    expect(getProject(first!.slug)).toBe(first);
    expect(getProject('nope')).toBeUndefined();
    expect(getNextProject(first!.slug)).toBe(second);
    expect(getNextProject(projects.at(-1)!.slug)).toBe(first);
  });
});
