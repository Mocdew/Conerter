// Draggable vertical divider that resizes the two panes. Reports the editor's
// width as a percentage (clamped) via onResize; the parent applies it as a
// flex-basis. Keyboard-accessible: arrow keys nudge the split.

import { useRef, useState, type PointerEvent, type KeyboardEvent } from 'react';

interface SplitterProps {
  /** Ref to the flex container holding [editor, splitter, preview]. */
  containerRef: React.RefObject<HTMLElement>;
  value: number; // current editor width %
  onResize: (pct: number) => void;
}

const MIN = 20;
const MAX = 80;
const clamp = (n: number) => Math.min(MAX, Math.max(MIN, n));

export default function Splitter({ containerRef, value, onResize }: SplitterProps) {
  const [dragging, setDragging] = useState(false);
  const activePointer = useRef<number | null>(null);

  function pctFromClientX(clientX: number): number {
    const el = containerRef.current;
    if (!el) return value;
    const rect = el.getBoundingClientRect();
    return clamp(((clientX - rect.left) / rect.width) * 100);
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    activePointer.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (activePointer.current !== e.pointerId) return;
    onResize(pctFromClientX(e.clientX));
  }

  function endDrag(e: PointerEvent<HTMLDivElement>) {
    if (activePointer.current !== e.pointerId) return;
    activePointer.current = null;
    setDragging(false);
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowLeft') onResize(clamp(value - 2));
    else if (e.key === 'ArrowRight') onResize(clamp(value + 2));
    else if (e.key === 'Home') onResize(50);
    else return;
    e.preventDefault();
  }

  return (
    <div
      className={`splitter${dragging ? ' is-dragging' : ''}`}
      role="separator"
      aria-orientation="vertical"
      aria-valuenow={Math.round(value)}
      aria-valuemin={MIN}
      aria-valuemax={MAX}
      aria-label="Resize panes"
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
      onDoubleClick={() => onResize(50)}
    />
  );
}
