import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { FIRM } from '../data/firm';
import { getLenis } from '../v2/smooth';
import { Arrow } from '../v2/ui';

const LINKS = [
  { to: '/about', label: 'The Firm' },
  { to: '/solutions', label: 'What We Provide' },
  { to: '/who-we-serve', label: 'Whom We Serve' },
  { to: '/testimonials', label: 'Clients' },
  { to: '/perspective', label: 'Perspective' },
];

// The v3 header: a light bar that tightens and frosts once the page
// scrolls, with a Login menu and the one call to action (the risk profile,
// as on the current site). On small screens
// the links move into a full-screen menu.
export default function V3Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [login, setLogin] = useState(false);
  const loginRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const lenis = getLenis();
    if (open) lenis?.stop();
    else lenis?.start();
    document.documentElement.classList.toggle('menu-open', open);
    return () => document.documentElement.classList.remove('menu-open');
  }, [open]);

  useEffect(() => {
    if (!login) return undefined;
    const away = (e) => { if (!loginRef.current?.contains(e.target)) setLogin(false); };
    const esc = (e) => { if (e.key === 'Escape') setLogin(false); };
    document.addEventListener('pointerdown', away);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', away); document.removeEventListener('keydown', esc); };
  }, [login]);

  const close = () => setOpen(false);

  return (
    <>
      <header className={'v3-nav' + (scrolled ? ' is-scrolled' : '') + (open ? ' is-open' : '')}>
        <div className="v3-nav-inner">
          <Link to="/v3" className="v3-nav-logo" onClick={close}><Logo title="RISCH Wealth, home" /></Link>
          <nav className="v3-nav-links" aria-label="Main">
            {LINKS.map((l) => <Link key={l.to} to={l.to}>{l.label}</Link>)}
          </nav>
          <div className="v3-nav-right">
            <div className={'v3-login' + (login ? ' is-open' : '')} ref={loginRef}>
              <button type="button" aria-expanded={login} aria-haspopup="true" onClick={() => setLogin((v) => !v)}>
                Login
                <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 4.5L6 7.5L9 4.5" /></svg>
              </button>
              <div className="v3-login-menu">
                <Link to="/client-login" onClick={() => setLogin(false)}>Client login<small>Portfolio, statements and reports</small></Link>
                <Link to="/employee-login" onClick={() => setLogin(false)}>Employee login<small>For the RISCH team</small></Link>
              </div>
            </div>
            <Link to="/risk-profiler" className="v3-pill v3-pill-dark v3-nav-cta"><span>Start Risk Profile</span><i><Arrow /></i></Link>
            <button type="button" className="v3-burger" aria-label="Menu" aria-expanded={open} aria-controls="v3-menu" onClick={() => setOpen((v) => !v)}>
              <span /><span />
            </button>
          </div>
        </div>
      </header>

      <div id="v3-menu" className={'v3-menu' + (open ? ' is-open' : '')} aria-hidden={!open}>
        <ol>
          {[...LINKS, { to: '/contact', label: 'Get in touch' }, { to: '/risk-profiler', label: 'Risk profile' }].map((l, i) => (
            <li key={l.to} style={{ '--i': i }}>
              <Link to={l.to} onClick={close} tabIndex={open ? 0 : -1}><small>{String(i + 1).padStart(2, '0')}</small>{l.label}</Link>
            </li>
          ))}
        </ol>
        <div className="v3-menu-foot">
          <a href={FIRM.phoneHref} tabIndex={open ? 0 : -1}>{FIRM.phone}</a>
          <a href={`mailto:${FIRM.email}`} tabIndex={open ? 0 : -1}>{FIRM.email}</a>
          <Link to="/client-login" onClick={close} tabIndex={open ? 0 : -1}>Client login</Link>
        </div>
      </div>
    </>
  );
}
