// WP-3 — Layout, state, theme wiring. Pulls together the engine (WP-2),
// sanitize (WP-6), styling (WP-5) and file I/O / export (WP-4).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Toolbar from './components/Toolbar';
import Editor from './components/Editor';
import Preview from './components/Preview';
import DropZone from './components/DropZone';
import Splitter from './components/Splitter';
import StatusBar from './components/StatusBar';
import { render } from './lib/markdown';
import { sanitize } from './lib/sanitize';
import { getStats } from './lib/stats';
import { buildStandaloneHtml, downloadHtml, type Theme } from './lib/exportHtml';
import { useDebounce } from './hooks/useDebounce';
import { useLocalStorage } from './hooks/useLocalStorage';
import { SAMPLE } from './sample';
import hljsLight from 'highlight.js/styles/github.css?raw';
import hljsDark from 'highlight.js/styles/github-dark.css?raw';

export default function App() {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'light');
  const [showToc, setShowToc] = useLocalStorage<boolean>('showToc', false);
  // The document is actively edited, so it must NOT adopt other tabs' writes
  // mid-edit (that would silently discard unsaved local changes).
  const [markdown, setMarkdown] = useLocalStorage<string>('markdown', SAMPLE, { sync: false });
  const [editorPct, setEditorPct] = useLocalStorage<number>('editorPct', 50);
  const [title, setTitle] = useState('document');

  const panesRef = useRef<HTMLElement>(null);
  const debounced = useDebounce(markdown, 180);

  // Reflect the theme on <html> so app.css + github-markdown.css respond, and
  // swap the highlight.js token theme to match (light tokens are unreadable on
  // a dark code block, and vice-versa).
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    let el = document.getElementById('hljs-theme') as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement('style');
      el.id = 'hljs-theme';
      document.head.appendChild(el);
    }
    el.textContent = theme === 'dark' ? hljsDark : hljsLight;
  }, [theme]);

  // Single conversion path shared by the live preview and the export/copy
  // actions, so both reflect the same content. Only inject a [[toc]] marker when
  // the toggle is on AND there is real content (otherwise an empty document would
  // render a stray, empty TOC box instead of the empty state).
  const toHtml = useCallback(
    (source: string): string => {
      const src =
        showToc && source.trim() && !/^\s*\[\[toc\]\]/im.test(source)
          ? `[[toc]]\n\n${source}`
          : source;
      return sanitize(render(src));
    },
    [showToc],
  );

  const html = useMemo(() => toHtml(debounced), [toHtml, debounced]);

  const stats = useMemo(() => getStats(debounced), [debounced]);

  function loadFile(text: string, filename: string) {
    setMarkdown(text);
    setTitle(filename.replace(/\.[^.]+$/, '') || 'document');
  }

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      window.alert(`Could not copy ${label} to the clipboard.`);
    }
  }

  // Export/copy render from the live `markdown`, not the debounced preview HTML,
  // so output never lags behind the user's most recent edits.
  function onDownload() {
    const doc = buildStandaloneHtml(toHtml(markdown), { title, theme });
    downloadHtml(doc, `${title}.html`);
  }

  return (
    <div className="app">
      <Toolbar
        theme={theme}
        showToc={showToc}
        onUpload={loadFile}
        onDownload={onDownload}
        onCopyHtml={() => copy(toHtml(markdown), 'the HTML')}
        onCopyDoc={() => copy(buildStandaloneHtml(toHtml(markdown), { title, theme }), 'the document')}
        onPrint={() => window.print()}
        onSetTheme={setTheme}
        onToggleToc={() => setShowToc(!showToc)}
      />
      <main className="panes" ref={panesRef}>
        <section className="pane pane--editor" style={{ flexBasis: `${editorPct}%` }}>
          <div className="pane__head">
            <span className="pane__title">Markdown</span>
            <span className="pane__badge" title={`${title}.md`}>
              {title}.md
            </span>
          </div>
          <DropZone onFile={loadFile} onError={(m) => window.alert(m)}>
            <Editor value={markdown} onChange={setMarkdown} />
          </DropZone>
        </section>
        <Splitter containerRef={panesRef} value={editorPct} onResize={setEditorPct} />
        <section className="pane pane--preview" style={{ flexBasis: `${100 - editorPct}%` }}>
          <div className="pane__head">
            <span className="pane__title">Preview</span>
          </div>
          <Preview html={html} />
        </section>
      </main>
      <StatusBar stats={stats} />
    </div>
  );
}
