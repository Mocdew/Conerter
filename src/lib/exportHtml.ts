// WP-4 — Build a standalone, self-contained .html document from sanitized body
// HTML, with all CSS inlined so it renders offline with no external requests.

// Vite inlines these as raw strings at build time.
import githubMarkdownCss from '../styles/github-markdown.css?raw';
import hljsLight from 'highlight.js/styles/github.css?raw';
import hljsDark from 'highlight.js/styles/github-dark.css?raw';
import katexCss from 'katex/dist/katex.min.css?raw';

export type Theme = 'light' | 'dark';

/** Escape the five characters that are unsafe in HTML text/attribute context. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Wrap sanitized body HTML in a complete, offline-ready HTML document. */
export function buildStandaloneHtml(
  bodyHtml: string,
  opts: { title?: string; theme?: Theme } = {},
): string {
  // Escape (don't strip) so titles like "Tom & Jerry" or "a<b" survive intact.
  const title = escapeHtml(opts.title || 'Document');
  const theme: Theme = opts.theme === 'dark' ? 'dark' : 'light';
  const hljsTheme = theme === 'dark' ? hljsDark : hljsLight;

  return `<!doctype html>
<html lang="en" data-theme="${theme}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
/* github-markdown */
${githubMarkdownCss}
/* highlight.js (${theme}) */
${hljsTheme}
/* katex */
${katexCss}
/* page frame + print */
html,body{margin:0;background:${theme === 'dark' ? '#0d1117' : '#ffffff'};}
body{padding:32px 20px;}
.markdown-body{margin:0 auto;}
@media print{
  body{padding:0;background:#fff;}
  .markdown-body{--md-bg:#fff;color:#000;background:#fff;max-width:none;}
  .markdown-body a[href^="http"]::after{content:" (" attr(href) ")";font-size:.85em;color:#333;}
  @page{margin:18mm 16mm;}
}
</style>
</head>
<body>
<article class="markdown-body">
${bodyHtml}
</article>
</body>
</html>`;
}

/** Trigger a browser download of the given HTML string as a .html file. */
export function downloadHtml(html: string, filename = 'document.html'): void {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.html') ? filename : `${filename}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke on the next tick so the download has committed.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default buildStandaloneHtml;
