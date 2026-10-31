import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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

// The router itself is supplied by the caller: BrowserRouter in the
// browser (main.jsx), StaticRouter when prerendering (entry-server.jsx).
export default function App() {
  return (
    <ThemeProvider>
      <ScrollReset />
      <RouteHead />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Old links to the redesign previews */}
        <Route path="/v2" element={<Navigate to="/" replace />} />
        <Route path="/v3" element={<Navigate to="/" replace />} />
        <Route path="/about" element={<About />} />
        <Route path="/who-we-serve" element={<WhoWeServe />} />
        <Route path="/solutions" element={<Solutions />} />
        <Route path="/risk-profiler" element={<RiskProfiler />} />
        <Route path="/testimonials" element={<Testimonials />} />
        {/* the link sent to clients: the Testimonials page, at the share form */}
        <Route path="/share-testimonial" element={<Navigate to="/testimonials#share" replace />} />
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
