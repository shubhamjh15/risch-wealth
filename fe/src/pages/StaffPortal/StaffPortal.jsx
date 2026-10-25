import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
import RingLogo from '../../components/RingLogo';
import { useTheme } from '../../hooks/ThemeContext';
import { logout, me } from '../../api/authApi';
import { Icons } from '../ClientPortal/ui';
import { initials } from './common';
import Dashboard from './Dashboard';
import Clients from './Clients';
import ClientDetail from './ClientDetail';
import RecordPurchase from './RecordPurchase';
import Requests from './Requests';
import Testimonials from './Testimonials';
import Team from './Team';
import Profile from './Profile';

// The staff portal (/employee-portal/*): employees and admins, after
// signing in at /employee-login. Admins also get client portfolios,
// purchase entry and team accounts; the API enforces the same split.

const BASE = '/employee-portal';
const NAV = [
  { to: '', label: 'Dashboard', icon: Icons.home },
  { to: '/clients', label: 'Client Portfolios', icon: Icons.clients, admin: true },
  { to: '/requests', label: 'Client Requests', icon: Icons.inbox },
  { to: '/testimonials', label: 'Testimonials', icon: Icons.quote },
  { to: '/team', label: 'Team Accounts', icon: Icons.team, admin: true },
  { to: '/profile', label: 'Profile & Security', icon: Icons.profile },
];

// /employee-portal/clients/12/transactions -> { screen, id, tab }
function route(pathname) {
  const parts = pathname.slice(BASE.length).split('/').filter(Boolean);
  if (!parts.length) return { screen: 'dashboard' };
  if (parts[0] === 'purchase' && parts.length === 1) return { screen: 'purchase' };
  if (parts[0] === 'clients') {
    if (parts.length === 1) return { screen: 'clients' };
    const id = /^\d+$/.test(parts[1]) ? parts[1] : null;
    if (!id) return { screen: 'missing' };
    if (parts.length === 2) return { screen: 'client', id, tab: 'overview' };
    if (parts[2] === 'purchase' && parts.length === 3) return { screen: 'purchase', id };
    if (['holdings', 'transactions'].includes(parts[2]) && parts.length === 3) return { screen: 'client', id, tab: parts[2] };
    return { screen: 'missing' };
  }
  if (['requests', 'testimonials', 'team', 'profile'].includes(parts[0]) && parts.length === 1) return { screen: parts[0] };
  return { screen: 'missing' };
}
const ADMIN_SCREENS = ['clients', 'client', 'purchase', 'team'];

export default function StaffPortal() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [user, setUser] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  useEffect(() => {
    me().then((r) => {
      if (r.user.role === 'client') navigateRef.current('/client-portal', { replace: true });
      else setUser(r.user);
    }).catch(() => navigateRef.current('/employee-login', { replace: true }));
  }, []);
  useEffect(() => { setDrawer(false); window.scrollTo(0, 0); }, [pathname]);

  const r = route(pathname);
  if (!user) return <div className="cp cp-light"><div /><main className="cp-content"><p className="cp-loading">Loading…</p></main></div>;
  const isAdmin = user.role === 'admin';
  if (r.screen === 'missing' || (!isAdmin && ADMIN_SCREENS.includes(r.screen))) return <Navigate to={BASE} replace />;

  const onLogout = async () => {
    await logout().catch(() => {});
    navigate('/employee-login', { replace: true });
  };

  const nav = NAV.filter((n) => isAdmin || !n.admin);
  const screen = {
    dashboard: <Dashboard user={user} />,
    clients: <Clients />,
    client: <ClientDetail id={r.id} tab={r.tab} />,
    purchase: <RecordPurchase id={r.id} />,
    requests: <Requests />,
    testimonials: <Testimonials />,
    team: <Team selfId={user.id} />,
    profile: <Profile user={user} />,
  }[r.screen];

  return (
    <div className={'cp cp-light sp' + (drawer ? ' cp-drawer-open' : '')}>
      <aside className="cp-side" aria-label="Staff portal">
        <div className="cp-side-top">
          <RingLogo to="/employee-portal" label="RISCH, Dashboard" />
          <button type="button" className="cp-icon-btn cp-close" aria-label="Close menu" onClick={() => setDrawer(false)}><Icons.close /></button>
        </div>
        <nav className="cp-nav">
          {nav.map((n) => (
            <NavLink key={n.to} to={BASE + n.to} end={n.to === ''} className={({ isActive }) => (isActive ? 'active' : undefined)}>
              <n.icon />{n.label}
            </NavLink>
          ))}
        </nav>
        <button type="button" className="cp-help sp-signout" onClick={onLogout}>
          <Icons.signout />
          <span><strong>Sign out</strong></span>
        </button>
      </aside>
      <button type="button" className="cp-scrim" aria-label="Close menu" tabIndex={-1} onClick={() => setDrawer(false)} />

      <div className="cp-main">
        <header className="cp-top">
          <button type="button" className="cp-icon-btn cp-menu" aria-label="Open menu" onClick={() => setDrawer(true)}><Icons.menu /></button>
          <div className="cp-top-right">
            <ThemeButton />
            <UserMenu user={user} onLogout={onLogout} />
          </div>
        </header>
        <main className="cp-content">{screen}</main>
      </div>

      <nav className="sp-tabbar" aria-label="Quick navigation">
        <NavLink to={BASE} end><Icons.home />Dashboard</NavLink>
        {isAdmin ? <NavLink to={`${BASE}/clients`}><Icons.clients />Clients</NavLink> : <NavLink to={`${BASE}/profile`}><Icons.profile />Profile</NavLink>}
        {isAdmin && <Link to={`${BASE}/purchase`} className="sp-fab" aria-label="Record a purchase"><Icons.plus /></Link>}
        <NavLink to={`${BASE}/requests`}><Icons.inbox />Requests</NavLink>
        <button type="button" onClick={() => setDrawer(true)}><Icons.more />More</button>
      </nav>
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

function UserMenu({ user, onLogout }) {
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
        <span className="cp-avatar" aria-hidden="true">{initials(user.fullName).slice(0, 1)}</span>
        <span className="cp-user-name">{user.fullName.split(' ')[0]}</span>
        <Icons.chevron />
      </button>
      {open && (
        <div className="cp-user-menu" role="menu">
          <Link role="menuitem" to={`${BASE}/profile`} onClick={() => setOpen(false)}>Profile &amp; Security</Link>
          <button role="menuitem" type="button" onClick={onLogout}>Sign out</button>
        </div>
      )}
    </div>
  );
}
