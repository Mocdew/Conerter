// WP-3 — Rendered, sanitized HTML output. The `.markdown-body` wrapper is the
// contract WP-5's github-markdown.css styles and WP-4's export reuses.

import { EmptyIcon } from './icons';

interface PreviewProps {
  html: string;
}

export default function Preview({ html }: PreviewProps) {
  return (
    <div className="preview">
      {html.trim() ? (
        <article
          className="markdown-body"
          // html is already sanitized by lib/sanitize before it reaches here.
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <div className="empty-state">
          <div className="empty-state__icon">
            <EmptyIcon />
          </div>
          <h2>Nothing to preview yet</h2>
          <p>Start typing Markdown on the left, or drop a .md file to get going.</p>
        </div>
      )}
    </div>
  );
}
