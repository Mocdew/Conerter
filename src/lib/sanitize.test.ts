import { describe, it, expect } from 'vitest';
import katex from 'katex';
import hljs from 'highlight.js';
import { sanitize } from './sanitize';

/**
 * Parse a sanitized HTML string into a detached container so we can make
 * structural assertions rather than brittle substring checks.
 */
function parse(html: string): HTMLElement {
  const el = document.createElement('div');
  el.innerHTML = sanitize(html);
  return el;
}

describe('sanitize — strips executable content (WP-6 done-when)', () => {
  it('removes <script> tags entirely', () => {
    const el = parse('<p>hello</p><script>window.__pwned = true;</script>');
    expect(el.querySelector('script')).toBeNull();
    expect(el.innerHTML).not.toContain('__pwned');
    expect(el.textContent).toContain('hello');
  });

  it('strips inline event handlers like onerror', () => {
    const el = parse('<img src="x" onerror="window.__pwned = true">');
    const img = el.querySelector('img');
    expect(img).not.toBeNull();
    expect(img!.hasAttribute('onerror')).toBe(false);
  });

  it('strips onclick / onload / onmouseover handlers', () => {
    const el = parse('<div onclick="x()" onmouseover="y()">hi</div>');
    const div = el.querySelector('div')!;
    expect(div.hasAttribute('onclick')).toBe(false);
    expect(div.hasAttribute('onmouseover')).toBe(false);
  });

  it('neutralizes javascript: URLs on links', () => {
    const el = parse('<a href="javascript:window.__pwned=true">click</a>');
    const a = el.querySelector('a');
    // Either the href is dropped or rewritten, but it must not be a javascript: URL.
    expect((a?.getAttribute('href') ?? '').toLowerCase()).not.toContain('javascript:');
  });

  it('drops <iframe> and <object> embeds', () => {
    const el = parse('<iframe src="https://evil.example"></iframe><object data="x"></object>');
    expect(el.querySelector('iframe')).toBeNull();
    expect(el.querySelector('object')).toBeNull();
  });

  it('forbids <style>, <form> and <base>', () => {
    const el = parse(
      '<style>body{display:none}</style><form action="/x"></form><base href="https://evil.example/">',
    );
    expect(el.querySelector('style')).toBeNull();
    expect(el.querySelector('form')).toBeNull();
    expect(el.querySelector('base')).toBeNull();
  });
});

describe('sanitize — preserves feature markup', () => {
  it('keeps KaTeX MathML + styled spans', () => {
    const rendered = katex.renderToString('c = \\pm\\sqrt{a^2 + b^2}', { throwOnError: false });
    const el = parse(rendered);
    expect(el.querySelector('.katex')).not.toBeNull();
    expect(el.querySelector('math')).not.toBeNull();
    // KaTeX relies on inline styles for glyph positioning — these must survive.
    expect(el.querySelector('[style]')).not.toBeNull();
  });

  it('keeps highlight.js token spans', () => {
    const rendered = hljs.highlight('const x: number = 1;', { language: 'typescript' }).value;
    const el = parse(`<pre><code class="hljs">${rendered}</code></pre>`);
    expect(el.querySelector('code.hljs')).not.toBeNull();
    expect(el.querySelector('span[class^="hljs-"]')).not.toBeNull();
  });

  it('keeps GFM task-list checkboxes', () => {
    const el = parse(
      '<ul class="contains-task-list"><li><input type="checkbox" disabled checked> done</li></ul>',
    );
    const input = el.querySelector('input[type="checkbox"]');
    expect(input).not.toBeNull();
    expect(input!.hasAttribute('disabled')).toBe(true);
    expect(input!.hasAttribute('checked')).toBe(true);
  });

  it('keeps anchored-heading ids and in-page links', () => {
    const el = parse('<h2 id="intro">Intro</h2><a href="#intro">jump</a>');
    expect(el.querySelector('h2#intro')).not.toBeNull();
    expect(el.querySelector('a[href="#intro"]')).not.toBeNull();
  });
});

describe('sanitize — link hardening', () => {
  it('adds rel="noopener noreferrer" to target="_blank" links', () => {
    const el = parse('<a href="https://example.com" target="_blank">ext</a>');
    const a = el.querySelector('a')!;
    expect(a.getAttribute('target')).toBe('_blank');
    expect(a.getAttribute('rel')).toContain('noopener');
    expect(a.getAttribute('rel')).toContain('noreferrer');
  });

  it('leaves normal links untouched', () => {
    const el = parse('<a href="https://example.com">ext</a>');
    const a = el.querySelector('a')!;
    expect(a.getAttribute('href')).toBe('https://example.com');
    expect(a.getAttribute('rel')).toBeNull();
  });
});
