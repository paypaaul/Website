import type { ImageMetadata } from 'astro';
import type { Localized } from '@/i18n/routes';

/** One line of a spec sheet, e.g. "Controller: ESP32 DevKit V1". */
export interface SpecRow {
  label: Localized;
  value: Localized;
}

export type ProjectMedia =
  | { type: 'image'; src: ImageMetadata; alt: Localized }
  | { type: 'video'; youtubeId: string; title: Localized }
  /** A .glb file in src/assets/models, shown with <model-viewer> (loaded on demand). */
  | { type: 'model'; file: string; alt: Localized };

export interface Project {
  /** URL segment: /progetti/<slug>/ and /en/projects/<slug>/ */
  slug: string;
  name: string;
  /** Short description of the kind of project, e.g. "6-DOF manipulator". */
  kind: Localized;
  version: string;
  status: Localized;
  summary: Localized;
  /** Small chips shown on the card. */
  tags: readonly string[];
  cover: ImageMetadata;
  coverAlt: Localized;
  media: readonly ProjectMedia[];
  /** Bill of materials. */
  bom: readonly SpecRow[];
  /** Measured specifications (dimensions, weight, payload...). Omitted until known. */
  specs?: readonly SpecRow[];
  design?: readonly SpecRow[];
  /** Next steps; supports **bold** markers (see i18n/inline.ts). */
  roadmap: readonly Localized[];
}

/** Same text in every language (part numbers, product names...). */
export const both = (value: string): Localized => ({ it: value, en: value });

export const row = (label: Localized, value: Localized): SpecRow => ({ label, value });
