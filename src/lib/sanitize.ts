/**
 * WP-6 — Sanitization & security
 *
 * Single source of truth for turning the (untrusted) HTML produced by
 * `markdown-it` into HTML that is safe to inject into the DOM and to write into
 * the exported standalone document.
 *
 * It MUST be applied in two places:
 *   - WP-3 Preview, before `dangerouslySetInnerHTML`
 *   - WP-4 exportHtml, before the body is written into the downloadable file
 *
 * What we allow and why:
 *   - KaTeX renders math as a mix of positioned <span>s (inline `style`) plus a
 *     MathML fallback: <math>, <semantics>, <mrow>, <annotation encoding="…">, …
 *   - highlight.js wraps tokens in <span class="hljs-…">.
 *   - markdown-it plugins add heading `id`s/anchors, a TOC <nav>/<ul>, and
 *     disabled task-list <input type="checkbox">.
 *
 * What we strip: DOMPurify's defaults remove <script>, javascript:/data: script
 * URLs and all `on*` event-handler attributes (e.g. `onerror=`), which is the
 * core acceptance criterion for this work package.
 */

import DOMPurify from 'dompurify';

/**
 * DOMPurify configuration.
 *
 * The default allow-list already covers HTML + MathML + SVG and already strips
 * scripts and event handlers; we state the profiles explicitly and add only the
 * couple of attributes KaTeX's MathML output depends on. `class` and `style`
 * (needed by hljs/KaTeX/markdown-it-*) are permitted by DOMPurify by default.
 */
const CONFIG: DOMPurify.Config = {
  USE_PROFILES: { html: true, mathMl: true, svg: true },
  // KaTeX: <annotation encoding="application/x-tex">, <math display="block">.
  ADD_ATTR: ['encoding', 'display'],
};

/**
 * Install hooks exactly once. Any link that opens a new tab gets
 * `rel="noopener noreferrer"` so the opened page cannot reach back through
 * `window.opener` — standard hardening for the autolinks markdown-it produces.
 */
let hooksInstalled = false;
function installHooks(): void {
  if (hooksInstalled) return;
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });
  hooksInstalled = true;
}

/**
 * Sanitize a raw HTML string. Returns a string safe to render or export.
 *
 * @param dirtyHtml HTML produced by the markdown renderer (WP-2 `render`).
 * @returns sanitized HTML with scripts and event handlers removed.
 */
export function sanitize(dirtyHtml: string): string {
  installHooks();
  // Default config returns a string (no RETURN_DOM / RETURN_TRUSTED_TYPE).
  return DOMPurify.sanitize(dirtyHtml, CONFIG) as string;
}

export default sanitize;
