// WP-2 — Markdown conversion engine. One configured markdown-it instance that
// feeds both the live preview and the export (single code path).

import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import taskLists from 'markdown-it-task-lists';
import anchor from 'markdown-it-anchor';
import toc from 'markdown-it-table-of-contents';
import katex from '@vscode/markdown-it-katex';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight(code, lang): string {
    // Return the full <pre class="hljs"><code> wrapper ourselves. If we returned
    // only the tokenized inner HTML, markdown-it would wrap it in a bare
    // <pre><code> with no `hljs` class, and the highlight.js theme — which keys
    // the code block's background and base color off `.hljs` — would never apply.
    const esc = (s: string) => md.utils.escapeHtml(s);
    if (lang && hljs.getLanguage(lang)) {
      try {
        const { value } = hljs.highlight(code, { language: lang, ignoreIllegals: true });
        return `<pre class="hljs"><code class="language-${esc(lang)}">${value}</code></pre>`;
      } catch {
        /* fall through to auto */
      }
    }
    try {
      const { value } = hljs.highlightAuto(code);
      return `<pre class="hljs"><code>${value}</code></pre>`;
    } catch {
      return `<pre class="hljs"><code>${esc(code)}</code></pre>`;
    }
  },
});

md.use(taskLists, { enabled: true, label: true })
  .use(anchor, {
    permalink: anchor.permalink.headerLink({ safariReaderFix: true }),
    slugify: (s: string) =>
      encodeURIComponent(String(s).trim().toLowerCase().replace(/\s+/g, '-')),
  })
  .use(toc, { includeLevel: [1, 2, 3], containerClass: 'table-of-contents' })
  .use(katex);

/** Render a Markdown string to an (unsanitized) HTML string. */
export function render(markdown: string): string {
  return md.render(markdown ?? '');
}

export default md;
