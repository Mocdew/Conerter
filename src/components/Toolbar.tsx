// App bar: brand, file actions (open, download, copy, print), TOC + theme toggles.

import { useRef } from 'react';
import type { Theme } from '../lib/exportHtml';
import {
  LogoIcon,
  OpenIcon,
  DownloadIcon,
  CopyIcon,
  DocIcon,
  PrintIcon,
  ListIcon,
  SunIcon,
  MoonIcon,
} from './icons';

interface ToolbarProps {
  theme: Theme;
  showToc: boolean;
  onUpload: (text: string, filename: string) => void;
  onDownload: () => void;
  onCopyHtml: () => void;
  onCopyDoc: () => void;
  onPrint: () => void;
  onSetTheme: (theme: Theme) => void;
  onToggleToc: () => void;
}

const MD_EXT = /\.(md|markdown|mdown|mkd|txt)$/i;

export default function Toolbar({
  theme,
  showToc,
  onUpload,
  onDownload,
  onCopyHtml,
  onCopyDoc,
  onPrint,
  onSetTheme,
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
    <header className="appbar">
      <div className="appbar__brand">
        <span className="appbar__logo">
          <LogoIcon />
        </span>
        <span>
          Markdown <span className="appbar__sub">→ HTML</span>
        </span>
      </div>

      <div className="appbar__sep" />

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

      <div className="appbar__group">
        <button className="btn" onClick={() => fileRef.current?.click()} title="Open a Markdown file">
          <OpenIcon />
          Open
        </button>
        <button className="btn" onClick={onCopyHtml} title="Copy the rendered HTML to the clipboard">
          <CopyIcon />
          Copy HTML
        </button>
        <button
          className="btn"
          onClick={onCopyDoc}
          title="Copy a full standalone HTML document"
        >
          <DocIcon />
          Copy doc
        </button>
        <button className="btn" onClick={onPrint} title="Print or save as PDF">
          <PrintIcon />
          Print
        </button>
      </div>

      <div className="appbar__spacer" />

      <button
        className={`btn btn--icon${showToc ? ' is-active' : ''}`}
        aria-pressed={showToc}
        onClick={onToggleToc}
        title="Toggle table of contents"
      >
        <ListIcon />
      </button>

      <div className="seg" role="group" aria-label="Theme">
        <button
          className={`seg__btn${theme === 'light' ? ' is-active' : ''}`}
          aria-pressed={theme === 'light'}
          onClick={() => onSetTheme('light')}
          title="Light theme"
        >
          <SunIcon />
          Light
        </button>
        <button
          className={`seg__btn${theme === 'dark' ? ' is-active' : ''}`}
          aria-pressed={theme === 'dark'}
          onClick={() => onSetTheme('dark')}
          title="Dark theme"
        >
          <MoonIcon />
          Dark
        </button>
      </div>

      <button className="btn btn--primary" onClick={onDownload} title="Download as a standalone .html file">
        <DownloadIcon />
        Download
      </button>
    </header>
  );
}
