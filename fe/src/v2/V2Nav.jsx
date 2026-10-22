import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { FIRM } from '../data/firm';
import { getLenis } from './smooth';

const LINKS = [
  { to: '/about', label: 'The Firm' },
  { to: '/solutions', label: 'Approach' },
  { to: '/who-we-serve', label: 'Clients' },
  { to: '/perspective', label: 'Perspective' },
  { to: '/contact', label: 'Contact' },
];

// The v2 header: white over the hero film, then a frosted dark bar once the
// page scrolls, so it stays legible over footage and paper alike. Slides
// away on the way down, back on the way up.
export default function V2Nav() {
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 40);
      if (Math.abs(y - lastY) > 8) {
        setHidden(y > lastY && y > 200);
        lastY = y;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const lenis = getLenis();
    if (open) lenis?.stop();
    else lenis?.start();
    document.documentElement.classList.toggle('menu-open', open);
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.classList.remove('menu-open');
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <header className={'v2-nav' + (hidden && !open ? ' is-hidden' : '') + (solid && !open ? ' is-solid' : '')}>
        <Link to="/v2" className="v2-nav-logo" onClick={close}><Logo title="RISCH Wealth, home" /></Link>
        <nav className="v2-nav-links" aria-label="Main">
          {LINKS.map((l) => <Link key={l.to} to={l.to}>{l.label}</Link>)}
        </nav>
        <div className="v2-nav-right">
          <Link to="/client-login" className="v2-nav-login">Client login</Link>
          <Link to="/risk-profiler" className="v2-nav-cta">Start Risk Profile</Link>
          <button type="button" className="v2-nav-menu" aria-expanded={open} aria-controls="v2-menu" onClick={() => setOpen((v) => !v)}>
            <span>{open ? 'Close' : 'Menu'}</span>
            <i aria-hidden="true"><b /><b /></i>
          </button>
        </div>
      </header>

      <div id="v2-menu" className={'v2-menu' + (open ? ' is-open' : '')} aria-hidden={!open}>
        <div className="v2-menu-inner">
          <ol className="v2-menu-links">
            {[{ to: '/v2', label: 'Home' }, ...LINKS, { to: '/risk-profiler', label: 'Risk profile' }].map((l, i) => (
              <li key={l.to} style={{ '--i': i }}>
                <Link to={l.to} onClick={close} tabIndex={open ? 0 : -1}>
                  <small>{String(i + 1).padStart(2, '0')}</small>{l.label}
                </Link>
              </li>
            ))}
          </ol>
          <div className="v2-menu-side">
            <p className="v2-label">Visit</p>
            <address>{FIRM.address.lines.map((line) => <span key={line}>{line}</span>)}</address>
            <p className="v2-label">Speak with us</p>
            <a href={FIRM.phoneHref} tabIndex={open ? 0 : -1}>{FIRM.phone}</a>
            <a href={`mailto:${FIRM.email}`} tabIndex={open ? 0 : -1}>{FIRM.email}</a>
            <p className="v2-label">Sign in</p>
            <Link to="/client-login" onClick={close} tabIndex={open ? 0 : -1}>Client login</Link>
            <Link to="/employee-login" onClick={close} tabIndex={open ? 0 : -1}>Employee login</Link>
          </div>
        </div>
      </div>
    </>
  );
}
