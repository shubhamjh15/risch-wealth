import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
// Self-hosted Inter (one variable file covers every weight). Served from
// our own domain: no third-party request, no visitor IPs sent to Google.
import '@fontsource-variable/inter';
// Display serif for large headings, chosen to echo the logo.
import '@fontsource-variable/cormorant-garamond';
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
