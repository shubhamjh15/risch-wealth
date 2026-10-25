import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageShell, PageHero, Head, CloseBand } from '../v3/page';
import { Arrow } from '../v3/ui';
import { Req } from '../components/Req';
import { TESTIMONIALS, TESTIMONIAL_GROUPS } from '../data/testimonials';
import { listTestimonials, submitTestimonial } from '../api/authApi';

const ALL = 'All profiles';
const LEAD = TESTIMONIALS.find((t) => t.lead) ?? TESTIMONIALS[0];
// Accounts with a portrait first, then monograms, each in data-file order.
const CURATED = [...TESTIMONIALS.filter((t) => t !== LEAD && t.photo), ...TESTIMONIALS.filter((t) => t !== LEAD && !t.photo)];
const QUOTE_MAX = 800;
const EMPTY_FORM = { name: '', email: '', role: '', place: '', group: '', quote: '', consent: false, website: '' };

// A testimonial submitted on this page (be/src/testimonials), in the shape
// of the data-file entries.
const fromApi = (t) => ({ ...t, key: `s${t.id}`, initial: t.name.trim().charAt(0).toUpperCase(), role: t.role || '', credentials: [t.role].filter(Boolean) });

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
  useEffect(() => {
    listTestimonials().then((r) => setLive(r.testimonials.map(fromApi))).catch(() => {});
  }, []);

  const rest = useMemo(() => [...live, ...CURATED], [live]);
  // Only offer a filter for profiles that actually have an account to show.
  const filters = useMemo(() => [ALL, ...TESTIMONIAL_GROUPS.filter((g) => rest.some((t) => t.group === g))], [rest]);
  const counts = useMemo(() => new Map(filters.map((g) => [g, g === ALL ? rest.length : rest.filter((t) => t.group === g).length])), [filters, rest]);
  const shown = useMemo(() => (filter === ALL ? rest : rest.filter((t) => t.group === filter)), [filter, rest]);

  const onSubmitted = (t) => {
    setLive((prev) => [fromApi(t), ...prev]);
    setFilter(ALL);
  };

  return (
    <PageShell>
      <PageHero
        kicker="In our clients’ words"
        lines={['Entrusted with', <em key="e">a lifetime’s work.</em>]}
        lede="Business owners, founders, CXOs, doctors, families, global Indians and family offices. Different balance sheets, one method: risk understood first, then a portfolio built around it."
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
          <Head num="01" label="Client accounts" title="Different balance sheets, one method." />
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
                  {t.photo
                    ? <img src={t.photo} alt="" width="96" height="96" loading="lazy" />
                    : <span className="v3-quote-mono" aria-hidden="true">{t.initial}</span>}
                  <span className="v3-quote-group">{t.group}</span>
                </div>
                <blockquote>&ldquo;{t.quote}&rdquo;</blockquote>
                <Who t={t} />
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

      {/* ============ SHARE ============ */}
      <section className="v3-sec">
        <div className="v3-wrap v3-ct-grid">
          <Head num="02" label="Share your experience" title="Worked with us? Tell others how it went.">
            <p className="v3-head-sub" data-reveal>Your words appear on this page as soon as you send them. Only your name, role, city and profile are shown; your email stays with us.</p>
          </Head>
          <ShareForm onSubmitted={onSubmitted} />
        </div>
      </section>

      <CloseBand
        kicker="Start a conversation"
        title="Your portfolio deserves a considered second opinion."
        primary={{ to: '/contact', label: 'Start a conversation' }}
        secondary={{ to: '/risk-profiler', label: 'Start Risk Profile' }}
      />
    </PageShell>
  );
}

function ShareForm({ onSubmitted }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [note, setNote] = useState({ text: '', ok: false });
  const [busy, setBusy] = useState(false);

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
      const r = await submitTestimonial(form);
      if (r.testimonial) onSubmitted(r.testimonial);
      setForm(EMPTY_FORM);
      setNote({ text: 'Thank you. Your testimonial is now live on this page.', ok: true });
    } catch (err) {
      setNote({ text: err.message, ok: false });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="v3-form" noValidate onSubmit={handleSubmit}>
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
        <label htmlFor="tGroup">Which describes you best? <Req /></label>
        <select id="tGroup" name="group" aria-required="true" value={form.group} onChange={handleChange} className={form.group ? '' : 'is-placeholder'}>
          <option value="">Select a profile</option>
          {TESTIMONIAL_GROUPS.map((g) => <option key={g}>{g}</option>)}
        </select>
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
        <span>I am a client of RISCH Wealth and agree to this testimonial, with my name, role and city, being published on this website.</span>
      </label>
      <div className="v3-form-actions">
        <button type="submit" className="v3-pill v3-pill-dark" disabled={busy}><span>{busy ? 'Sending…' : 'Publish testimonial'}</span><i><Arrow /></i></button>
        <span id="tQuoteCount" className="v3-form-count">{form.quote.length}/{QUOTE_MAX}</span>
      </div>
      {note.text && <p className={'v3-note' + (note.ok ? ' is-ok' : '')} role="status">{note.text}</p>}
    </form>
  );
}
