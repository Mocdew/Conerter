// WP-3/WP-4 — Toolbar: upload, download, copy, print, theme + TOC toggles, stats.

import { useRef } from 'react';
import type { Stats } from '../lib/stats';
import type { Theme } from '../lib/exportHtml';

interface ToolbarProps {
  stats: Stats;
  theme: Theme;
  showToc: boolean;
  onUpload: (text: string, filename: string) => void;
  onDownload: () => void;
  onCopyHtml: () => void;
  onCopyDoc: () => void;
  onPrint: () => void;
  onToggleTheme: () => void;
  onToggleToc: () => void;
}

const MD_EXT = /\.(md|markdown|mdown|mkd|txt)$/i;

export default function Toolbar({
  stats,
  theme,
  showToc,
  onUpload,
  onDownload,
  onCopyHtml,
  onCopyDoc,
  onPrint,
  onToggleTheme,
  onToggleToc,
}: ToolbarProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  function pickFile(file: File | undefined) {
    if (!file) return;
    if (!MD_EXT.test(file.name) && file.type !== 'text/markdown') return;
    const reader = new FileReader();
    reader.onload = () => onUpload(String(reader.result ?? ''), file.name);
    reader.readAsText(file);
  }

  return (
    <header className="toolbar">
      <div className="toolbar__group">
        <input
          ref={fileRef}
          type="file"
          accept=".md,.markdown,.mdown,.mkd,.txt,text/markdown"
          hidden
          onChange={(e) => {
            pickFile(e.target.files?.[0]);
            e.target.value = '';
          }}
        />
        <button className="toolbar__btn" onClick={() => fileRef.current?.click()}>
          Open .md
        </button>
        <button className="toolbar__btn" onClick={onDownload}>
          Download HTML
        </button>
        <button className="toolbar__btn" onClick={onCopyHtml}>
          Copy HTML
        </button>
        <button className="toolbar__btn" onClick={onCopyDoc}>
          Copy document
        </button>
        <button className="toolbar__btn" onClick={onPrint}>
          Print / PDF
        </button>
      </div>

      <div className="toolbar__spacer" />

      <div className="toolbar__group">
        <button
          className={`toolbar__btn${showToc ? ' is-active' : ''}`}
          aria-pressed={showToc}
          onClick={onToggleToc}
        >
          TOC
        </button>
        <button className="toolbar__btn" onClick={onToggleTheme}>
          {theme === 'dark' ? '☾ Dark' : '☀ Light'}
        </button>
      </div>

      <div className="toolbar__stats">
        <span>
          <strong>{stats.words}</strong> words
        </span>
        <span>
          <strong>{stats.chars}</strong> chars
        </span>
        <span>
          <strong>{stats.readingTimeMin}</strong> min read
        </span>
      </div>
    </header>
  );
}
