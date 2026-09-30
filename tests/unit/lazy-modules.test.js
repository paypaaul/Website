import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadModulesFor } from '../../src/features/lazy-modules.js';

describe('loadModulesFor', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('loads the module declared on the element itself', () => {
    const loader = vi.fn().mockResolvedValue({});
    document.body.innerHTML = '<div id="slide" data-lazy-module="a"></div>';
    loadModulesFor(document.getElementById('slide'), { a: loader });
    expect(loader).toHaveBeenCalledOnce();
  });

  it('loads modules declared on descendants', () => {
    const loader = vi.fn().mockResolvedValue({});
    document.body.innerHTML = '<div id="slide"><p data-lazy-module="b"></p></div>';
    loadModulesFor(document.getElementById('slide'), { b: loader });
    expect(loader).toHaveBeenCalledOnce();
  });

  it('loads each module only once, however many times it is requested', () => {
    const loader = vi.fn().mockResolvedValue({});
    document.body.innerHTML = '<div id="slide" data-lazy-module="c"></div>';
    const slide = document.getElementById('slide');
    loadModulesFor(slide, { c: loader });
    loadModulesFor(slide, { c: loader });
    expect(loader).toHaveBeenCalledOnce();
  });

  it('does nothing for elements that need no module, and warns for unknown ones', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    document.body.innerHTML = '<div id="plain"></div><div id="odd" data-lazy-module="zzz"></div>';
    loadModulesFor(document.getElementById('plain'), {});
    expect(warn).not.toHaveBeenCalled();
    loadModulesFor(document.getElementById('odd'), {});
    expect(warn).toHaveBeenCalledOnce();
  });
});
