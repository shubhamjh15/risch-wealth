import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Nav from '../components/Nav/Nav';
import Footer from '../components/Footer/Footer';
import { useMotion } from '../motion/useMotion';
import { FIRM } from '../data/firm';
import { Req } from '../components/Req';
import officePhoto from '../assets/contact-office.webp';
import officePhoto2x from '../assets/contact-office-2x.webp';

// The four disciplines (What We Provide links here with ?topic=...) plus
// the other common reasons to get in touch.
const TOPICS = [
  'Portfolio review',
  'Portfolio Construction',
  'Fund & Strategy Selection',
  'Global Diversification',
  'Wealth Coordination',
  'Risk Profiling',
  'Something else',
];

// Dialling codes for the phone field: India first, then where most NRI
// clients live.
const DIAL_CODES = [
  ['+91', '🇮🇳', 'India'], ['+971', '🇦🇪', 'United Arab Emirates'], ['+1', '🇺🇸', 'United States / Canada'],
  ['+44', '🇬🇧', 'United Kingdom'], ['+65', '🇸🇬', 'Singapore'], ['+852', '🇭🇰', 'Hong Kong'],
  ['+61', '🇦🇺', 'Australia'], ['+966', '🇸🇦', 'Saudi Arabia'], ['+974', '🇶🇦', 'Qatar'],
  ['+968', '🇴🇲', 'Oman'], ['+965', '🇰🇼', 'Kuwait'], ['+973', '🇧🇭', 'Bahrain'],
  ['+49', '🇩🇪', 'Germany'], ['+64', '🇳🇿', 'New Zealand'],
];
const MESSAGE_MAX = 500;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Address as the Figma sets it: road and landmark on one line.
const OFFICE_LINES = FIRM.address.lines.length === 5
  ? [FIRM.address.lines[0], FIRM.address.lines[1], `${FIRM.address.lines[2]} ${FIRM.address.lines[3]}`, FIRM.address.lines[4]]
  : FIRM.address.lines;
const DIRECTIONS = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${FIRM.address.street}, ${FIRM.city} ${FIRM.address.postalCode}`)}`;

const Icon = ({ children }) => (
  <span className="ct-icon" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
  </span>
);

export default function Contact() {
  const rootRef = useRef(null);
  useMotion(rootRef);

  const [form, setForm] = useState({ name: '', email: '', dial: '+91', phone: '', topic: '', message: '' });
  // /contact?topic=Portfolio%20Construction pre-selects the topic. Set after
  // mount so the prerendered page and the first render still match.
  const [params] = useSearchParams();
  useEffect(() => {
    const t = params.get('topic');
    if (t && TOPICS.includes(t)) setForm((f) => ({ ...f, topic: t }));
  }, [params]);
  const [note, setNote] = useState({ text: '', ok: false });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'message' ? value.slice(0, MESSAGE_MAX) : value }));
  };

  // There's no mail backend yet, so the form hands off to the visitor's
  // own email app with everything filled in, addressed to FIRM.email.
  // Once the API can send or store enquiries, POST `form` there instead.
  const handleSubmit = (e) => {
    e.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const message = form.message.trim();
    if (!name) { setNote({ text: 'Please enter your full name.', ok: false }); return; }
    if (!EMAIL_RE.test(email)) { setNote({ text: 'Please enter a valid email address so we can reply.', ok: false }); return; }
    if (phone && !/^[\d\s-]{6,15}$/.test(phone)) { setNote({ text: 'Please enter the phone number in digits only, or leave it blank.', ok: false }); return; }
    if (!message) { setNote({ text: 'Please add a short message about how we can help.', ok: false }); return; }
    const topic = form.topic || 'General enquiry';
    const subject = `Enquiry: ${topic} (${name})`;
    const body = [
      message,
      '',
      `Name: ${name}`,
      `Email: ${email}`,
      phone && `Phone: ${form.dial} ${phone}`,
      `Interested in: ${topic}`,
    ].filter((line) => line !== '' && line !== false).join('\n');
    window.location.href = `mailto:${FIRM.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setNote({ text: `Your email app should now open with this message ready to send. If it doesn't, write to ${FIRM.email} or call ${FIRM.phone}.`, ok: true });
  };

  return (
    <div ref={rootRef}>
      <Nav />

      <section className="cx">
        <div className="wrap cx-grid">
          <div className="cx-intro">
            <p className="h-eyebrow hero-in" style={{ '--d': '.1s' }}><span className="h-dot" aria-hidden="true" />Get in touch</p>
            <h1 className="pg-title cx-title">
              <span className="h-line"><span style={{ '--d': '.15s' }}>Let&rsquo;s talk about</span></span>
              <span className="h-line"><span style={{ '--d': '.26s' }}><em>your financial goals.</em></span></span>
            </h1>
            <p className="pg-lede hero-in" style={{ '--d': '.45s' }}>We&rsquo;re here to listen. Tell us a little about your situation and what you&rsquo;d like help with, and our team will get back to you personally.</p>
            <div className="pg-photo cx-photo hero-in" style={{ '--d': '.6s' }} aria-hidden="true">
              <img src={officePhoto} srcSet={`${officePhoto} 1x, ${officePhoto2x} 2x`} alt="" width="258" height="772" />
            </div>
          </div>

          <form id="contactForm" className="ct-card cx-card hero-in" style={{ '--d': '.5s' }} noValidate onSubmit={handleSubmit}>
            <div className="ct-card-head">
              <h2>Send us a message</h2>
              <p className="ct-secure">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
                <span><strong>Your information is secure</strong>and will only be used to respond to your enquiry.</span>
              </p>
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="cName">Full name <Req /></label>
                <input type="text" id="cName" name="name" autoComplete="name" aria-required="true" placeholder="e.g. Rishi Maheshwari" value={form.name} onChange={handleChange} />
              </div>
              <div className="field">
                <label htmlFor="cEmail">Email address <Req /></label>
                <input type="email" id="cEmail" name="email" autoComplete="email" aria-required="true" placeholder="e.g. rishi@example.com" value={form.email} onChange={handleChange} />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="cPhone">Phone number</label>
                <div className="ct-phone">
                  <select name="dial" aria-label="Country code" value={form.dial} onChange={handleChange}>
                    {DIAL_CODES.map(([code, flag, country]) => <option key={code} value={code} title={country}>{flag} {code}</option>)}
                  </select>
                  <input type="tel" id="cPhone" name="phone" autoComplete="tel-national" inputMode="tel" placeholder="99999 99999" value={form.phone} onChange={handleChange} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="cTopic">I&rsquo;m interested in</label>
                <select id="cTopic" name="topic" value={form.topic} onChange={handleChange} className={form.topic ? '' : 'ct-placeholder'}>
                  <option value="">Select an option</option>
                  {TOPICS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="field ct-message">
              <label htmlFor="cMsg">Message <Req /></label>
              <textarea id="cMsg" name="message" aria-required="true" aria-describedby="cMsgCount" maxLength={MESSAGE_MAX} placeholder="Tell us a little about your financial goals, current situation or how we can help…" value={form.message} onChange={handleChange} />
            </div>
            <div className="ct-actions">
              <button type="submit" className="btn btn-primary btn-fill"><span>Send message</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M1 7H13M13 7L7.5 1.5M13 7L7.5 12.5" stroke="currentColor" strokeWidth="1.3" /></svg>
              </button>
              <span id="cMsgCount" className="ct-count">{form.message.length}/{MESSAGE_MAX}</span>
            </div>
            {note.text && <p className={'auth-note' + (note.ok ? ' ok' : '')} role="status">{note.text}</p>}
          </form>
        </div>
      </section>

      <section className="pg-sec cx-details">
        <div className="wrap">
          <div className="pg-head">
            <div>
              <p className="eyebrow" data-reveal>Reach us directly</p>
              <h2 className="h-h2" data-split>One relationship, <em>one point of contact.</em></h2>
            </div>
          </div>
          <aside className="ct-info cx-info" data-reveal="stagger" aria-label="Contact details">
            <div className="ct-item">
              <Icon><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></Icon>
              <div>
                <p className="ct-label">Email</p>
                <a className="ct-value" href={`mailto:${FIRM.email}`}>{FIRM.email}</a>
                <p className="ct-sub">For enquiries, documents and statements.</p>
              </div>
            </div>
            <div className="ct-item">
              <Icon><path d="M4 4h4l2 5-2.5 1.5a12 12 0 0 0 6 6L15 14l5 2v4a2 2 0 0 1-2 2C9.6 22 2 14.4 2 6a2 2 0 0 1 2-2z" /></Icon>
              <div>
                <p className="ct-label">Call</p>
                <a className="ct-value" href={FIRM.phoneHref}>{FIRM.phone}</a>
                {FIRM.phoneAlt && <a className="ct-value" href={FIRM.phoneAltHref}>{FIRM.phoneAlt}</a>}
                <p className="ct-sub">Speak with the RISCH team directly.</p>
              </div>
            </div>
            <div className="ct-item">
              <Icon><path d="M12 22s7-7.2 7-12a7 7 0 1 0-14 0c0 4.8 7 12 7 12z" /><circle cx="12" cy="10" r="2.4" /></Icon>
              <div>
                <p className="ct-label">Our office</p>
                <address className="ct-address">
                  {/* a landmark in brackets wraps as one unit, never "Budigere / Cross)" */}
                  {OFFICE_LINES.map((line) => {
                    const at = line.indexOf(' (');
                    return at > 0
                      ? <span key={line}>{line.slice(0, at)} <span className="ct-nowrap">{line.slice(at + 1)}</span></span>
                      : <span key={line}>{line}</span>;
                  })}
                </address>
                <a className="ct-link" href={DIRECTIONS} target="_blank" rel="noopener noreferrer">Get directions <span aria-hidden="true">→</span></a>
              </div>
            </div>

            <div className="ct-item ct-divided">
              <Icon><path d="M12 3l8 3v6c0 4.5-3.4 8.4-8 9-4.6-.6-8-4.5-8-9V6l8-3z" /><path d="M8.5 12l2.5 2.5 4.5-5" /></Icon>
              <div>
                <p className="ct-label">Registration</p>
                <p className="ct-reg">{FIRM.registrationNote}</p>
                <p className="ct-ids">{FIRM.registrations.map((r) => r.id).join(' · ')}</p>
              </div>
            </div>

            <div className="ct-item ct-divided">
              <Icon><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" /></Icon>
              <div>
                <p className="ct-label">Follow us</p>
                <a href="https://www.linkedin.com/in/rishiraj-maheshwari-81240b5/" target="_blank" rel="noopener noreferrer" className="social-chip">
                  <span className="icon-badge-sm icon-badge"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.1c.53-1 1.83-2.1 3.77-2.1 4.03 0 4.77 2.65 4.77 6.1V21h-4v-5.6c0-1.34-.02-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.96V21H9z" /></svg></span>
                  LinkedIn
                </a>
                {/* Instagram hidden for now (https://www.instagram.com/rischwealth/) */}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </div>
  );
}
