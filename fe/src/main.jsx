import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
// Self-hosted fonts, served from our own domain (no third-party request, no
// visitor IPs sent to Google). Manrope for the public site, Geist for the
// signed-in portals.
import '@fontsource-variable/manrope/wght.css';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import './styles/styles.css';
import './styles/profiler.css';
import './styles/portal.css';
import './styles/motion.css';
import './styles/v3.css';
import './styles/stage.css';
import './styles/v3-pages.css';
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
