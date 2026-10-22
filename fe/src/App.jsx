import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './hooks/ThemeContext';
import Home from './pages/Home';
import About from './pages/About';
import WhoWeServe from './pages/WhoWeServe';
import Solutions from './pages/Solutions';
import Testimonials from './pages/Testimonials';
import Perspective from './pages/Perspective';
import Disclosure from './pages/Disclosure';
import Contact from './pages/Contact';
import EmployeeLogin from './pages/EmployeeLogin';
import ClientLogin from './pages/ClientLogin';
import NotFound from './pages/NotFound';
import RiskProfiler from './pages/RiskProfiler/RiskProfiler';
import ScrollReset from './motion/ScrollReset';
import RouteHead from './components/RouteHead';

// The client dashboard is signed-in only, so it's kept out of the bundle
// public pages load. It's fetched after mount (not React.lazy): the
// prerendered page and the first client render are then both empty, so
// hydration matches.
function ClientPortalLoader() {
  const [Page, setPage] = useState(null);
  useEffect(() => {
    import('./pages/ClientPortal/ClientPortal').then((m) => setPage(() => m.default));
  }, []);
  return Page ? <Page /> : null;
}
const portal = <ClientPortalLoader />;

// Same for the staff portal.
function StaffPortalLoader() {
  const [Page, setPage] = useState(null);
  useEffect(() => {
    import('./pages/StaffPortal/StaffPortal').then((m) => setPage(() => m.default));
  }, []);
  return Page ? <Page /> : null;
}

// The home page redesigns under review (/v2, /v3) load the same way, so
// their footage, 3D scenes and fonts never weigh on the live site.
// One import() per page, each in its own function: a single conditional
// import() makes the bundler preload only one page's stylesheet for both.
const DESIGNS = {
  v2: () => import('./pages/HomeV2'),
  v3: () => import('./pages/HomeV3'),
};
function DesignLoader({ version }) {
  const [Page, setPage] = useState(null);
  useEffect(() => {
    DESIGNS[version]().then((m) => setPage(() => m.default));
  }, [version]);
  return Page ? <Page /> : <div style={{ minHeight: '100vh', background: version === 'v3' ? '#F6F2EC' : '#0C0B0A' }} />;
}

// The router itself is supplied by the caller: BrowserRouter in the
// browser (main.jsx), StaticRouter when prerendering (entry-server.jsx).
export default function App() {
  return (
    <ThemeProvider>
      <ScrollReset />
      <RouteHead />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Redesigns under review; one replaces "/" once approved. */}
        <Route path="/v2" element={<DesignLoader version="v2" />} />
        <Route path="/v3" element={<DesignLoader version="v3" />} />
        <Route path="/about" element={<About />} />
        <Route path="/who-we-serve" element={<WhoWeServe />} />
        <Route path="/solutions" element={<Solutions />} />
        <Route path="/risk-profiler" element={<RiskProfiler />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/perspective" element={<Perspective />} />
        <Route path="/disclosure" element={<Disclosure />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/employee-login" element={<EmployeeLogin />} />
        <Route path="/client-login" element={<ClientLogin />} />
        <Route path="/client-portal/:section?" element={portal} />
        <Route path="/employee-portal/*" element={<StaffPortalLoader />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  );
}
