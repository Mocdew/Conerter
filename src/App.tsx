// WP-3 — Layout, state, theme wiring. Pulls together the engine (WP-2),
// sanitize (WP-6), styling (WP-5) and file I/O / export (WP-4).

import { useEffect, useMemo, useRef, useState } from 'react';
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
  const [markdown, setMarkdown] = useLocalStorage<string>('markdown', SAMPLE);
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

  const html = useMemo(() => {
    const src =
      showToc && !/^\s*\[\[toc\]\]/im.test(debounced) ? `[[toc]]\n\n${debounced}` : debounced;
    return sanitize(render(src));
  }, [debounced, showToc]);

  const stats = useMemo(() => getStats(markdown), [markdown]);

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

  function onDownload() {
    const doc = buildStandaloneHtml(html, { title, theme });
    downloadHtml(doc, `${title}.html`);
  }

  return (
    <div className="app">
      <Toolbar
        theme={theme}
        showToc={showToc}
        onUpload={loadFile}
        onDownload={onDownload}
        onCopyHtml={() => copy(html, 'the HTML')}
        onCopyDoc={() => copy(buildStandaloneHtml(html, { title, theme }), 'the document')}
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
