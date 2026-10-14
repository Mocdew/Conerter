// WP-3 — Markdown input textarea.

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function Editor({ value, onChange }: EditorProps) {
  return (
    <textarea
      className="editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      spellCheck={false}
      autoCapitalize="off"
      autoCorrect="off"
      placeholder="Type or drop a Markdown file here…"
      aria-label="Markdown input"
    />
  );
}
