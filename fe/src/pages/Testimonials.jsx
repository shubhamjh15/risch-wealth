import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageShell, PageHero, Head, CloseBand } from '../v3/page';
import { Arrow } from '../v3/ui';
import { Req } from '../components/Req';
import { TESTIMONIALS, TESTIMONIAL_GROUPS } from '../data/testimonials';
import { apiUrl, listTestimonials, submitTestimonial } from '../api/authApi';

const ALL = 'All profiles';
const LEAD = TESTIMONIALS.find((t) => t.lead) ?? TESTIMONIALS[0];
// Accounts with a portrait first, then monograms, each in data-file order.
const CURATED = [...TESTIMONIALS.filter((t) => t !== LEAD && t.photo), ...TESTIMONIALS.filter((t) => t !== LEAD && !t.photo)];
const QUOTE_MAX = 800;
const EMPTY_FORM = { name: '', email: '', role: '', place: '', group: '', quote: '', photo: '', consent: false, website: '' };
const PHOTO_PX = 480;

// A testimonial submitted on this page (be/src/testimonials), in the shape
// of the data-file entries.
const fromApi = (t) => ({ ...t, key: `s${t.id}`, photo: apiUrl(t.photo), initial: t.name.trim().charAt(0).toUpperCase(), role: t.role || '', credentials: [t.role].filter(Boolean) });

// The chosen picture, centre-cropped to a square and shrunk to a small JPEG
// data URL, so any phone photo uploads quickly and fits the API's limit.
async function squarePhoto(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = Math.min(PHOTO_PX, side);
    canvas.getContext('2d').drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function Who({ t }) {
  return (
    <div className="v3-quote-who">
      <b>{t.name}</b>
      <span>{(t.credentials ?? [t.role]).join(', ')}</span>
      {t.place && <small>{t.place}</small>}
    </div>
  );
}

export default function Testimonials() {
  const [filter, setFilter] = useState(ALL);
  // Submitted testimonials load after mount, so the prerendered page and the
  // first render match; they're listed first, newest at the top.
  const [live, setLive] = useState([]);
  // Opened from the share link (/testimonials#share): open at the form,
  // with no scrolling animation (again once late layout settles).
  useLayoutEffect(() => {
    if (window.location.hash !== '#share') return undefined;
    const jump = () => document.getElementById('share')?.scrollIntoView({ behavior: 'instant', block: 'start' });
    jump();
    const t = setTimeout(jump, 300);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    listTestimonials().then((r) => setLive(r.testimonials.map(fromApi))).catch(() => {});
  }, []);

  const rest = useMemo(() => [...live, ...CURATED], [live]);
  // Only offer a filter for profiles that actually have an account to show.
  const filters = useMemo(() => [ALL, ...TESTIMONIAL_GROUPS.filter((g) => rest.some((t) => t.group === g))], [rest]);
  const counts = useMemo(() => new Map(filters.map((g) => [g, g === ALL ? rest.length : rest.filter((t) => t.group === g).length])), [filters, rest]);
  const shown = useMemo(() => (filter === ALL ? rest : rest.filter((t) => t.group === filter)), [filter, rest]);

  return (
    <PageShell>
      <PageHero
        kicker="In our clients’ words"
        lines={['What our clients', <em key="e">say about us.</em>]}
        lede="Business owners, founders, senior professionals, doctors, families, NRIs and family offices. Different people, one way of working: understand your risk first, then build the portfolio."
      />

      {/* ============ FEATURED ============ */}
      <section className="v3-sec">
        <div className="v3-wrap">
          <figure className="v3-featured">
            <div className="v3-featured-photo" data-reveal>
              {LEAD.photo
                ? <img src={LEAD.photo} alt={LEAD.name} width="400" height="400" />
                : <span className="v3-client-mono">{LEAD.initial}</span>}
              <span className="v3-client-group">{LEAD.group}</span>
            </div>
            <div className="v3-featured-text">
              <span className="v3-featured-mark" aria-hidden="true">&ldquo;</span>
              <blockquote data-split>{LEAD.quote}</blockquote>
              <figcaption data-reveal><Who t={LEAD} /></figcaption>
            </div>
          </figure>
        </div>
      </section>

      {/* ============ ALL ACCOUNTS ============ */}
      <section className="v3-sec v3-tint">
        <div className="v3-wrap">
          <Head num="01" label="Client accounts" title="Different clients, one way of working." />
          {/* never gated behind the scroll reveal: it must always be usable */}
          <div className="v3-clients-filters v3-filters-page" role="group" aria-label="Filter accounts by client profile">
            {filters.map((g) => (
              <button key={g} type="button" className={filter === g ? 'is-on' : undefined} aria-pressed={filter === g} onClick={() => setFilter(g)}>
                {g}<small>{counts.get(g)}</small>
              </button>
            ))}
          </div>

          {/* keyed on the filter so the cards animate in again on each change */}
          <ul className="v3-quotes" key={filter}>
            {shown.map((t, i) => (
              <li className="v3-quote" key={t.key ?? t.name + t.quote.slice(0, 12)} style={{ '--i': i }}>
                <div className="v3-quote-head">
                  <span className="v3-quote-mark" aria-hidden="true">&ldquo;</span>
                  <span className="v3-quote-group">{t.group}</span>
                </div>
                <blockquote>{t.quote}</blockquote>
                <div className="v3-quote-foot">
                  {t.photo
                    ? <img src={t.photo} alt="" width="96" height="96" loading="lazy" />
                    : <span className="v3-quote-mono" aria-hidden="true">{t.initial}</span>}
                  <Who t={t} />
                </div>
              </li>
            ))}
          </ul>

          <p className="v3-fine">
            Testimonials reflect the experience of individual clients and are not indicative of
            future results or a guarantee of any outcome. Names are shortened and portraits are
            published only with the client&rsquo;s permission. See <Link to="/disclosure">Disclosures</Link>.
          </p>
        </div>
      </section>

      {/* ============ SHARE ============ (/testimonials#share lands here) */}
      <section className="v3-sec" id="share">
        <div className="v3-wrap v3-ct-grid">
          <Head num="02" label="Share your experience" title={<>Worked with us? <em>Tell others how it went.</em></>}>
            <p className="v3-head-sub" data-reveal>Our team reads every note before it appears on this page. Only your name, photo, role, city and profile are shown; your email stays with us.</p>
          </Head>
          <ShareForm />
        </div>
      </section>

      <CloseBand
        kicker="Start a conversation"
        title="Get a careful second look at your portfolio."
        primary={{ to: '/contact', label: 'Start a conversation' }}
        secondary={{ to: '/risk-profiler', label: 'Start Risk Profile' }}
      />
    </PageShell>
  );
}

function ShareForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [note, setNote] = useState({ text: '', ok: false });
  const [busy, setBusy] = useState(false);

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { setNote({ text: 'Please choose an image file (JPG or PNG).', ok: false }); return; }
    try {
      const photo = await squarePhoto(file);
      setForm((prev) => ({ ...prev, photo }));
      setNote({ text: '', ok: false });
    } catch {
      setNote({ text: 'That photo couldn’t be read. Please try a JPG or PNG.', ok: false });
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : name === 'quote' ? value.slice(0, QUOTE_MAX) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.name.trim().length < 2) { setNote({ text: 'Please enter your name.', ok: false }); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) { setNote({ text: 'Please enter a valid email address.', ok: false }); return; }
    if (!form.group) { setNote({ text: 'Please choose the profile that describes you best.', ok: false }); return; }
    if (form.quote.trim().length < 20) { setNote({ text: 'Please write at least a sentence or two.', ok: false }); return; }
    if (!form.consent) { setNote({ text: 'Please confirm we may publish your testimonial.', ok: false }); return; }
    setBusy(true);
    try {
      await submitTestimonial(form);
      setForm(EMPTY_FORM);
      setNote({ text: 'Thank you. We’ve received your testimonial and it will appear here once our team has reviewed it.', ok: true });
    } catch (err) {
      setNote({ text: err.message, ok: false });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="v3-form" noValidate onSubmit={handleSubmit}>
      <div className="v3-photo-field">
        <span className="v3-photo-preview" aria-hidden="true">
          {form.photo
            ? <img src={form.photo} alt="" />
            : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="8.5" r="3.8" /><path d="M4.5 20c1.2-3.8 4-5.6 7.5-5.6s6.3 1.8 7.5 5.6" /></svg>}
        </span>
        <div>
          <p className="v3-photo-label">Your photo <small>(optional)</small></p>
          <p className="v3-photo-hint">A clear, front-facing photo. We crop it to a circle.</p>
          <div className="v3-photo-actions">
            <label className="v3-photo-btn">
              {form.photo ? 'Change photo' : 'Upload photo'}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhoto} />
            </label>
            {form.photo && <button type="button" className="v3-photo-remove" onClick={() => setForm((prev) => ({ ...prev, photo: '' }))}>Remove</button>}
          </div>
        </div>
      </div>
      <div className="v3-field-row">
        <div className="v3-field">
          <label htmlFor="tName">Name, as it should appear <Req /></label>
          <input type="text" id="tName" name="name" autoComplete="name" aria-required="true" maxLength={80} placeholder="e.g. Mr Maheshwari" value={form.name} onChange={handleChange} />
        </div>
        <div className="v3-field">
          <label htmlFor="tEmail">Email address <Req /></label>
          <input type="email" id="tEmail" name="email" autoComplete="email" aria-required="true" placeholder="Not shown publicly" value={form.email} onChange={handleChange} />
        </div>
      </div>
      <div className="v3-field-row">
        <div className="v3-field">
          <label htmlFor="tRole">Role or profession</label>
          <input type="text" id="tRole" name="role" autoComplete="organization-title" maxLength={120} placeholder="e.g. Founder" value={form.role} onChange={handleChange} />
        </div>
        <div className="v3-field">
          <label htmlFor="tPlace">City</label>
          <input type="text" id="tPlace" name="place" autoComplete="address-level2" maxLength={80} placeholder="e.g. Bengaluru" value={form.place} onChange={handleChange} />
        </div>
      </div>
      <div className="v3-field">
        <label id="tGroupLabel" htmlFor="tGroup">Which describes you best? <Req /></label>
        <Picker id="tGroup" labelId="tGroupLabel" placeholder="Select a profile" options={TESTIMONIAL_GROUPS} value={form.group} onChange={(group) => setForm((prev) => ({ ...prev, group }))} />
      </div>
      <div className="v3-field">
        <label htmlFor="tQuote">Your experience <Req /></label>
        <textarea id="tQuote" name="quote" aria-required="true" aria-describedby="tQuoteCount" maxLength={QUOTE_MAX} placeholder="What was working with RISCH like for you?" value={form.quote} onChange={handleChange} />
      </div>
      {/* Hidden from people; bots that fill in every field give themselves away. */}
      <div className="v3-hp" aria-hidden="true">
        <label htmlFor="tWebsite">Website</label>
        <input type="text" id="tWebsite" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={handleChange} />
      </div>
      <label className="v3-check">
        <input type="checkbox" name="consent" checked={form.consent} onChange={handleChange} />
        <span>I am a client of RISCH Wealth and agree to this testimonial, with my name, photo, role and city, being published on this website.</span>
      </label>
      <div className="v3-form-actions">
        <button type="submit" className="v3-pill v3-pill-dark" disabled={busy}><span>{busy ? 'Sending…' : 'Send testimonial'}</span><i><Arrow /></i></button>
        <span id="tQuoteCount" className="v3-form-count">{form.quote.length}/{QUOTE_MAX}</span>
      </div>
      {note.text && <p className={'v3-note' + (note.ok ? ' is-ok' : '')} role="status">{note.text}</p>}
    </form>
  );
}

// A dropdown in the site's style (a native <select> list can't be styled).
// Works like one from the keyboard: arrows move, Enter or Space picks,
// Escape closes; a click outside closes it too.
function Picker({ id, labelId, placeholder, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [open]);

  const show = () => { setActive(Math.max(0, options.indexOf(value))); setOpen(true); };
  const pick = (o) => { onChange(o); setOpen(false); };
  const onKeyDown = (e) => {
    if (e.key === 'Escape') { setOpen(false); return; }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) { show(); return; }
      setActive((a) => (a + (e.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length);
    } else if ((e.key === 'Enter' || e.key === ' ') && open && active >= 0) {
      e.preventDefault();
      pick(options[active]);
    }
  };

  return (
    <div className={'v3-picker' + (open ? ' is-open' : '')} ref={ref}>
      <button
        type="button" id={id} aria-haspopup="listbox" aria-expanded={open} aria-labelledby={`${labelId} ${id}`} aria-required="true"
        aria-activedescendant={open && active >= 0 ? `${id}-o${active}` : undefined}
        className={value ? '' : 'is-placeholder'} onClick={() => (open ? setOpen(false) : show())} onKeyDown={onKeyDown}
      >
        {value || placeholder}
      </button>
      {open && (
        <ul role="listbox" aria-labelledby={labelId}>
          {options.map((o, i) => (
            <li
              key={o} id={`${id}-o${i}`} role="option" aria-selected={o === value}
              className={(i === active ? 'is-active' : '') + (o === value ? ' is-on' : '')}
              onPointerEnter={() => setActive(i)} onClick={() => pick(o)}
            >
              {o}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
