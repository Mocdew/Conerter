// WP-2 — Markdown conversion engine.
//
// A single configured `markdown-it` instance shared by the live preview (WP-3)
// and the standalone export (WP-4), so both render from exactly one code path.
//
// This module produces a RAW HTML string. It does NOT sanitize — that is WP-6's
// job (`src/lib/sanitize.ts`), applied downstream before preview and before
// export. That is why `html: true` is safe to enable here.

import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import taskLists from 'markdown-it-task-lists';
import anchor from 'markdown-it-anchor';
import toc from 'markdown-it-table-of-contents';
import katex from '@vscode/markdown-it-katex';

/**
 * Slug generator shared by the anchor plugin and the table-of-contents plugin.
 * They MUST agree so that TOC links point at the heading anchors they generate.
 */
function slugify(str: string): string {
  return encodeURIComponent(
    String(str)
      .trim()
      .toLowerCase()
      .replace(/[^\wÀ-￿\- ]/g, '') // drop punctuation, keep word/unicode chars
      .replace(/\s+/g, '-'),
  );
}

const md: MarkdownIt = new MarkdownIt({
  html: true, // raw HTML passes through; WP-6 sanitizes afterwards
  linkify: true, // bare URLs become links
  typographer: true, // smart quotes, dashes, ellipses
  highlight: highlightCode,
});

/**
 * `markdown-it` highlight hook. Returning a full `<pre><code>…</code></pre>`
 * block tells markdown-it to use it verbatim (no extra wrapping/escaping).
 */
function highlightCode(code: string, lang: string): string {
  if (lang && hljs.getLanguage(lang)) {
    try {
      const { value } = hljs.highlight(code, { language: lang, ignoreIllegals: true });
      return `<pre class="hljs"><code class="language-${lang}">${value}</code></pre>`;
    } catch {
      /* fall through to auto / escaped */
    }
  }

  try {
    const { value } = hljs.highlightAuto(code);
    return `<pre class="hljs"><code>${value}</code></pre>`;
  } catch {
    return `<pre class="hljs"><code>${md.utils.escapeHtml(code)}</code></pre>`;
  }
}

// --- Plugins ---------------------------------------------------------------

// GFM task lists: `- [ ]` / `- [x]`.
md.use(taskLists, { enabled: true, label: true });

// Heading anchors — each heading gets an `id` and a clickable permalink.
md.use(anchor, {
  slugify,
  permalink: anchor.permalink.linkInsideHeader({
    symbol: '#',
    placement: 'before',
    class: 'header-anchor',
    ariaHidden: true,
  }),
});

// Auto-generated Table of Contents. Inserted wherever the `[[toc]]` marker
// appears in the source; the Toolbar TOC toggle (WP-3) controls injection.
md.use(toc, {
  slugify,
  includeLevel: [1, 2, 3],
  containerClass: 'table-of-contents',
  markerPattern: /^\[\[toc\]\]/im,
});

// Math: `$inline$` and `$$block$$`, rendered to KaTeX markup.
md.use(katex);

// --- Public API ------------------------------------------------------------

/** Convert a Markdown source string into an (unsanitized) HTML string. */
export function render(src: string): string {
  return md.render(src ?? '');
}

export default render;
