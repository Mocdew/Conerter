// WP-4 — Drag-and-drop surface that wraps the editor. Reads dropped .md files
// via FileReader and reports the text (and filename) upward.

import { useState, type DragEvent, type ReactNode } from 'react';
import { UploadCloudIcon } from './icons';

interface DropZoneProps {
  onFile: (text: string, filename: string) => void;
  onError?: (message: string) => void;
  children: ReactNode;
}

const MD_EXT = /\.(md|markdown|mdown|mkd|txt)$/i;

export default function DropZone({ onFile, onError, children }: DropZoneProps) {
  const [dragover, setDragover] = useState(false);

  function readFile(file: File) {
    if (!MD_EXT.test(file.name) && file.type !== 'text/markdown') {
      onError?.(`"${file.name}" is not a Markdown file.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onFile(String(reader.result ?? ''), file.name);
    reader.onerror = () => onError?.(`Could not read "${file.name}".`);
    reader.readAsText(file);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragover(false);
    const file = e.dataTransfer.files?.[0];
    if (file) readFile(file);
  }

  return (
    <div
      className={`dropzone${dragover ? ' is-dragover' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragover(true);
      }}
      onDragLeave={() => setDragover(false)}
      onDrop={onDrop}
    >
      {children}
      <div className="dropzone__overlay">
        <UploadCloudIcon />
        Drop your Markdown file to load it
      </div>
    </div>
  );
}
