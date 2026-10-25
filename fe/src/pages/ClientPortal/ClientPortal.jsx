import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import RingLogo from '../../components/RingLogo';
import { FIRM } from '../../data/firm';
import { useTheme } from '../../hooks/ThemeContext';
import {
  clientOverview, clientPortfolio, clientPortfolioHistory, clientTransactions, logout,
} from '../../api/authApi';
import { Icons } from './ui';
import Overview from './Overview';
import Portfolio from './Portfolio';
import Transactions from './Transactions';
import Statements from './Statements';
import RiskProfile from './RiskProfile';
import Messages from './Messages';
import ProfileSecurity from './ProfileSecurity';
import RiskAssessment from './RiskAssessment';
import RiskReport from './RiskReport';

// The signed-in client's dashboard. Everything shown comes from
// /api/client/*, which only ever returns this client's own rows.
// Holdings are built from the purchase orders our team records, valued at
// the latest NAV AMFI publishes.

export const SECTIONS = [
  { path: '', label: 'Overview', icon: Icons.overview, Component: Overview },
  { path: 'portfolio', label: 'Portfolio', icon: Icons.portfolio, Component: Portfolio },
  { path: 'transactions', label: 'Transactions', icon: Icons.transactions, Component: Transactions },
  { path: 'statements', label: 'Statements', icon: Icons.statements, Component: Statements },
  { path: 'risk-profile', label: 'Risk Profile', icon: Icons.risk, Component: RiskProfile },
  { path: 'messages', label: 'Messages', icon: Icons.messages, Component: Messages },
  { path: 'profile', label: 'Profile & Security', icon: Icons.profile, Component: ProfileSecurity },
  // Not in the sidebar; "Risk Profile" stays highlighted while it's open.
  { path: 'risk-assessment', label: 'Risk assessment', Component: RiskAssessment, hidden: true, parent: 'risk-profile' },
  { path: 'risk-report', label: 'Risk report', Component: RiskReport, hidden: true, parent: 'risk-profile' },
];
const to = (path) => (path ? `/client-portal/${path}` : '/client-portal');

export default function ClientPortal() {
  const { section = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [recent, setRecent] = useState(null);
  const [history, setHistory] = useState(null);
  const [error, setError] = useState('');
  const [drawer, setDrawer] = useState(false);

  // navigate changes identity on every route change; a ref keeps the data
  // loaders stable so switching sections doesn't refetch everything.
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;
  const onAuthError = useCallback((err) => {
    if (err.status === 401 || err.status === 403) navigateRef.current('/client-login', { replace: true });
    else setError(err.message);
  }, []);

  const loadOverview = useCallback(() => clientOverview().then(setData).catch(onAuthError), [onAuthError]);
  const loadPortfolio = useCallback(() => Promise.all([clientPortfolio(), clientTransactions({ page: 1 })])
    .then(([p, t]) => {
      setPortfolio(p);
      setRecent(t.transactions);
      // the chart loads separately so it never holds up the page
      clientPortfolioHistory().then(setHistory).catch(() => {});
    })
    .catch(onAuthError), [onAuthError]);

  useEffect(() => { loadOverview(); loadPortfolio(); }, [loadOverview, loadPortfolio]);
  useEffect(() => { setDrawer(false); }, [location.pathname]);

  const current = SECTIONS.find((s) => s.path === section);
  if (!current) return <Navigate to="/client-portal" replace />;
  const { Component } = current;

  const onLogout = async () => {
    await logout().catch(() => {});
    navigate('/client-login', { replace: true });
  };

  return (
    <div className={'cp cp-light' + (drawer ? ' cp-drawer-open' : '')}>
      <aside className="cp-side" aria-label="Client portal">
        <div className="cp-side-top">
          <RingLogo to="/client-portal" label="RISCH, Overview" />
          <button type="button" className="cp-icon-btn cp-close" aria-label="Close menu" onClick={() => setDrawer(false)}><Icons.close /></button>
        </div>
        <nav className="cp-nav">
          {SECTIONS.filter((s) => !s.hidden).map((s) => (
            <NavLink key={s.path} to={to(s.path)} end className={({ isActive }) => (isActive || current?.parent === s.path ? 'active' : undefined)}>
              <s.icon />{s.label}
              {s.path === 'messages' && data?.requests.some((r) => r.status === 'in_progress') && <span className="cp-dot" aria-label="Requests in progress" />}
            </NavLink>
          ))}
        </nav>
        <Link to="/client-portal/messages" className="cp-help">
          <Icons.help />
          <span><strong>Need help?</strong>Contact the RISCH team</span>
        </Link>
      </aside>
      <button type="button" className="cp-scrim" aria-label="Close menu" tabIndex={-1} onClick={() => setDrawer(false)} />

      <div className="cp-main">
        <header className="cp-top">
          <button type="button" className="cp-icon-btn cp-menu" aria-label="Open menu" onClick={() => setDrawer(true)}><Icons.menu /></button>
          <div className="cp-top-right">
            <ThemeButton />
            {data && <UserMenu name={data.profile.fullName} onLogout={onLogout} />}
          </div>
        </header>

        <main className="cp-content">
          {error && <p className="auth-note" role="alert">{error}</p>}
          {!data || !portfolio ? (
            <p className="cp-loading">Loading your portal…</p>
          ) : (
            <Component
              data={data}
              portfolio={portfolio}
              recent={recent}
              history={history}
              reloadOverview={loadOverview}
            />
          )}
        </main>

        <footer className="cp-foot">
          <p>
            {FIRM.legalName} · AMFI-registered Mutual Fund Distributor {FIRM.registrations[0].id} · APMI-registered PMS Distributor {FIRM.registrations[1].id}.
            {' '}Mutual fund investments are subject to market risks, read all scheme related documents carefully. Values are indicative, based on the latest NAV published by AMFI; your account statement from the fund house is the official record.
          </p>
        </footer>
      </div>
    </div>
  );
}

function ThemeButton() {
  const { toggleTheme } = useTheme();
  return (
    <button type="button" className="cp-icon-btn" aria-label="Toggle dark mode" onClick={toggleTheme}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /></svg>
    </button>
  );
}

function UserMenu({ name, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);
  return (
    <div className="cp-user" ref={ref}>
      <button type="button" className="cp-user-btn" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen((o) => !o)}>
        <span className="cp-avatar" aria-hidden="true">{name.trim()[0]?.toUpperCase()}</span>
        <span className="cp-user-name">{name.split(' ')[0]}</span>
        <Icons.chevron />
      </button>
      {open && (
        <div className="cp-user-menu" role="menu">
          <Link role="menuitem" to="/client-portal/profile" onClick={() => setOpen(false)}>Profile &amp; Security</Link>
          <button role="menuitem" type="button" onClick={onLogout}>Sign out</button>
        </div>
      )}
    </div>
  );
}
