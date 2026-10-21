import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
// Self-hosted fonts, served from our own domain (no third-party request, no
// visitor IPs sent to Google). Geist for text and headings, Geist Mono for
// figures, Instrument Serif italic for the odd accent word.
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
// Script face, used only for the signed client names on Testimonials.
import '@fontsource/parisienne';
import './styles/styles.css';
import './styles/profiler.css';
import './styles/portal.css';
import './styles/solutions.css';
import './styles/motion.css';
import './styles/home.css';
import './styles/pages.css';
import App from './App.jsx';

const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

// Production pages arrive prerendered (scripts/prerender.mjs), so React
// attaches to the existing HTML. The Vite dev server serves an empty root.
const root = document.getElementById('root');
if (root.firstElementChild) hydrateRoot(root, app);
else createRoot(root).render(app);
