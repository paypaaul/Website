import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import en from '../../src/i18n/locales/en.js';
import it_ from '../../src/i18n/locales/it.js';

const root = join(import.meta.dirname, '../..');
const pages = ['index.html', 'thanks.html'];

/** Source of every script that is not a locale file, to find keys referenced from JavaScript. */
function readScriptSources() {
  const sources = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.name.endsWith('.js') && !path.includes('/locales/')) {
        sources.push(readFileSync(path, 'utf8'));
      }
    }
  };
  walk(join(root, 'src'));
  return sources.join('\n');
}

/** Elements/attributes the HTML marks for translation, per page. */
function collectMarkup(file) {
  document.documentElement.innerHTML = readFileSync(join(root, file), 'utf8')
    .replace(/^[\s\S]*?<html[^>]*>/i, '')
    .replace(/<\/html>[\s\S]*$/i, '');

  const content = [...document.querySelectorAll('[data-i18n]')].map((element) => ({
    key: element.dataset.i18n,
    html: element.innerHTML,
    file,
  }));

  const attributes = [...document.querySelectorAll('[data-i18n-attr]')].flatMap((element) =>
    element.dataset.i18nAttr.split(';').map((pair) => {
      const [attribute, key] = pair.split(':').map((part) => part.trim());
      return { key, attribute, value: element.getAttribute(attribute), file };
    }),
  );

  return { content, attributes };
}

/** Canonical form of an HTML fragment so formatting differences (whitespace, quotes) don't matter. */
function normalizeHtml(html) {
  const template = document.createElement('div');
  template.innerHTML = html;
  return template.innerHTML
    .replace(/>\s+</g, '><') // whitespace between tags
    .replace(/(<[a-z][^>]*>)\s+/gi, '$1') // ...after an opening tag
    .replace(/\s+(<\/)/g, '$1') // ...before a closing tag
    .replace(/\s+/g, ' ')
    .trim();
}

const markup = pages.map(collectMarkup);
const usedInMarkup = new Set(
  markup.flatMap(({ content, attributes }) => [...content, ...attributes].map(({ key }) => key)),
);

describe('locales', () => {
  it('define exactly the same keys in every language', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(it_).sort());
  });

  it('have no empty translations', () => {
    for (const [lang, locale] of Object.entries({ it: it_, en })) {
      for (const [key, value] of Object.entries(locale)) {
        expect(value === '' || (Array.isArray(value) && value.length === 0), `${lang}.${key}`).toBe(
          false,
        );
      }
    }
  });

  it('keep the typewriter phrases as string arrays', () => {
    for (const locale of [it_, en]) {
      expect(Array.isArray(locale.typewriter_phrases)).toBe(true);
      expect(locale.typewriter_phrases.every((phrase) => typeof phrase === 'string')).toBe(true);
    }
  });

  it('are fully used: every key is referenced by the markup or by the scripts', () => {
    const scripts = readScriptSources();
    const unused = Object.keys(it_).filter(
      (key) =>
        !usedInMarkup.has(key) && !scripts.includes(`'${key}'`) && !scripts.includes(`"${key}"`),
    );
    expect(unused).toEqual([]);
  });
});

describe.each(markup)('markup', ({ content, attributes }) => {
  it('only references keys that exist', () => {
    const missing = [...content, ...attributes].filter(({ key }) => !(key in it_));
    expect(missing).toEqual([]);
  });

  it('ships the Italian text in the HTML (works without JavaScript, no drift from it.js)', () => {
    for (const { key, html, file } of content) {
      expect(normalizeHtml(html), `${file} [data-i18n=${key}]`).toBe(normalizeHtml(it_[key]));
    }
    for (const { key, attribute, value, file } of attributes) {
      expect(value, `${file} [${attribute}] (${key})`).toBe(it_[key]);
    }
  });
});
