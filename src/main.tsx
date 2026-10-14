import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Global styles (WP-5) + vendored theme CSS for the live preview.
import './styles/app.css';
import './styles/github-markdown.css';
import './styles/print.css';
import 'katex/dist/katex.min.css';
// The highlight.js theme is injected dynamically by App so it tracks light/dark.

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
