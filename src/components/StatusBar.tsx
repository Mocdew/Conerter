// Bottom status strip: document stats + an auto-saved indicator.

import type { Stats } from '../lib/stats';
import { CheckIcon } from './icons';

interface StatusBarProps {
  stats: Stats;
}

export default function StatusBar({ stats }: StatusBarProps) {
  return (
    <footer className="statusbar">
      <span className="statusbar__stat">
        <strong>{stats.words.toLocaleString()}</strong> words
      </span>
      <span className="statusbar__stat">
        <strong>{stats.chars.toLocaleString()}</strong> characters
      </span>
      <span className="statusbar__stat">
        <strong>{stats.readingTimeMin}</strong> min read
      </span>
      <span className="statusbar__spacer" />
      <span className="statusbar__saved" title="Your document is saved in this browser">
        <CheckIcon />
        Saved locally
      </span>
    </footer>
  );
}
