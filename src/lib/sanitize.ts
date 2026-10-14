import DOMPurify from 'dompurify';

/**
 * WP-6 — Sanitization & security.
 *
 * Single source of truth for turning the (untrusted) HTML string produced by the
 * Markdown engine into markup that is safe to inject into the DOM. It is applied in
 * exactly two places:
 *   - before the live preview renders it (WP-3), and
 *   - before it is written into the exported standalone document (WP-4).
 *
 * Because `markdown-it` runs with `html: true`, a document can contain arbitrary raw
 * HTML — including `<script>`, event handlers and `javascript:` URLs. DOMPurify removes
 * all of those while preserving the benign markup our features depend on:
 *   - KaTeX  → MathML (`<math>`, `<semantics>`, `<annotation>`, …) plus styled `<span>`s,
 *   - highlight.js → `<span class="hljs-*">`,
 *   - GFM task lists → `<input type="checkbox" disabled checked>`,
 *   - anchored headings → `id` + in-page `<a href="#…">` links.
 *
 * DOMPurify's defaults already allow the HTML, MathML and SVG namespaces and the
 * `class`/`style`/`id` attributes these libraries emit, so we keep the default
 * allow-lists and only make targeted, security-preserving adjustments below.
 */

// Harden links that open a new browsing context: without rel="noopener" the opened
// page can navigate ours via window.opener (reverse tabnabbing). DOMPurify strips
// dangerous protocols on its own; this only tightens otherwise-legitimate links.
let hooksInstalled = false;
function installHooks(): void {
  if (hooksInstalled) return;
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (
      node instanceof Element &&
      node.tagName === 'A' &&
      node.getAttribute('target') === '_blank'
    ) {
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });
  hooksInstalled = true;
}

const CONFIG: DOMPurify.Config = {
  // Allow anchors to declare a target (hardened by the hook above). Everything else
  // we rely on (class, style, id, href, type/checked/disabled on checkbox inputs,
  // MathML/SVG tags) is already permitted by DOMPurify's defaults.
  ADD_ATTR: ['target'],
  // We never need data-* attributes; dropping them shrinks the attack surface.
  ALLOW_DATA_ATTR: false,
  // Belt-and-braces: these are never part of rendered Markdown content and are the
  // usual vectors for CSS-based and form-based exfiltration, so forbid them outright.
  FORBID_TAGS: ['style', 'form', 'base'],
  FORBID_ATTR: ['srcset', 'ping', 'formaction'],
};

/**
 * Sanitize an HTML string, stripping anything executable while keeping the markup
 * emitted by markdown-it + KaTeX + highlight.js intact.
 */
export function sanitize(dirtyHtml: string): string {
  installHooks();
  return DOMPurify.sanitize(dirtyHtml, CONFIG) as string;
}

export default sanitize;
