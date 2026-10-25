import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PageShell } from '../v3/page';
import { Arrow, MEDIA, RiseLine } from '../v3/ui';
import { FIRM } from '../data/firm';
import { Req } from '../components/Req';

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
const DIRECTIONS = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${FIRM.address.street}, ${FIRM.city} ${FIRM.address.postalCode}`)}`;

export default function Contact() {
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
    <PageShell solid smooth={false}>
      <section className="v3-ct">
        <div className="v3-wrap v3-ct-grid">
          <div className="v3-ct-intro">
            <p className="v3-kicker v3-ph-in" style={{ '--d': '.05s' }}><span>RISCH</span>Get in touch</p>
            <h1 className="v3-lh-title">
              <span className="v3-ph-l"><span style={{ '--d': '.12s' }}>Let&rsquo;s talk about</span></span>
              <span className="v3-ph-l"><span style={{ '--d': '.22s' }}><em>your financial goals.</em></span></span>
            </h1>
            <div className="v3-lh-rise v3-ph-in" style={{ '--d': '.4s' }}><RiseLine /></div>
            <p className="v3-lh-lede v3-ph-in" style={{ '--d': '.45s' }}>We&rsquo;re here to listen. Tell us a little about your situation and what you&rsquo;d like help with, and our team will get back to you personally.</p>

            <figure className="v3-ct-pic v3-ph-in" style={{ '--d': '.55s' }} aria-hidden="true">
              <img src={`${MEDIA}/reel-horizon.jpg`} alt="" width="1920" height="1080" />
              <figcaption><b>One relationship.</b> One point of contact, from the first conversation onwards.</figcaption>
            </figure>
          </div>

          <form id="contactForm" className="v3-form v3-ph-in" style={{ '--d': '.35s' }} noValidate onSubmit={handleSubmit}>
            <div className="v3-form-head">
              <h2>Send us a message</h2>
              <p className="v3-form-secure">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
                Your information is secure and will only be used to respond to your enquiry.
              </p>
            </div>

            <div className="v3-field-row">
              <div className="v3-field">
                <label htmlFor="cName">Full name <Req /></label>
                <input type="text" id="cName" name="name" autoComplete="name" aria-required="true" placeholder="e.g. Rishi Maheshwari" value={form.name} onChange={handleChange} />
              </div>
              <div className="v3-field">
                <label htmlFor="cEmail">Email address <Req /></label>
                <input type="email" id="cEmail" name="email" autoComplete="email" aria-required="true" placeholder="e.g. rishi@example.com" value={form.email} onChange={handleChange} />
              </div>
            </div>
            <div className="v3-field-row">
              <div className="v3-field">
                <label htmlFor="cPhone">Phone number</label>
                <div className="v3-phone">
                  <select name="dial" aria-label="Country code" value={form.dial} onChange={handleChange}>
                    {DIAL_CODES.map(([code, flag, country]) => <option key={code} value={code} title={country}>{flag} {code}</option>)}
                  </select>
                  <input type="tel" id="cPhone" name="phone" autoComplete="tel-national" inputMode="tel" placeholder="99999 99999" value={form.phone} onChange={handleChange} />
                </div>
              </div>
              <div className="v3-field">
                <label htmlFor="cTopic">I&rsquo;m interested in</label>
                <select id="cTopic" name="topic" value={form.topic} onChange={handleChange} className={form.topic ? '' : 'is-placeholder'}>
                  <option value="">Select an option</option>
                  {TOPICS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="v3-field">
              <label htmlFor="cMsg">Message <Req /></label>
              <textarea id="cMsg" name="message" aria-required="true" aria-describedby="cMsgCount" maxLength={MESSAGE_MAX} placeholder="Tell us a little about your financial goals, current situation or how we can help…" value={form.message} onChange={handleChange} />
            </div>
            <div className="v3-form-actions">
              <button type="submit" className="v3-pill v3-pill-dark"><span>Send message</span><i><Arrow /></i></button>
              <span id="cMsgCount" className="v3-form-count">{form.message.length}/{MESSAGE_MAX}</span>
            </div>
            {note.text && <p className={'v3-note' + (note.ok ? ' is-ok' : '')} role="status">{note.text}</p>}
          </form>
        </div>
      </section>

      <section className="v3-sec v3-sec-tight">
        <div className="v3-wrap v3-reach">
          <div className="v3-reach-head">
            <p className="v3-kicker" data-reveal><span>01</span>Reach us directly</p>
            <h2 className="v3-h2" data-split>One relationship, one number to call.</h2>
          </div>
          <dl className="v3-reach-list" data-reveal="stagger">
            <div>
              <dt>Email</dt>
              <dd><a className="v3-reach-value" href={`mailto:${FIRM.email}`}>{FIRM.email}</a><span>For enquiries, documents and statements.</span></dd>
              <dd className="v3-reach-act"><a className="v3-textlink" href={`mailto:${FIRM.email}`}>Write to us <Arrow /></a></dd>
            </div>
            <div>
              <dt>Call</dt>
              <dd>
                <a className="v3-reach-value" href={FIRM.phoneHref}>{FIRM.phone}</a>
                {FIRM.phoneAlt && <a className="v3-reach-value v3-reach-alt" href={FIRM.phoneAltHref}>{FIRM.phoneAlt}</a>}
                <span>Speak with the RISCH team directly.</span>
              </dd>
              <dd className="v3-reach-act"><a className="v3-textlink" href={FIRM.phoneHref}>Call now <Arrow /></a></dd>
            </div>
            <div>
              <dt>Office</dt>
              <dd><address className="v3-reach-value v3-reach-address">{FIRM.address.lines.map((line) => <span key={line}>{line}</span>)}</address></dd>
              <dd className="v3-reach-act"><a className="v3-textlink" href={DIRECTIONS} target="_blank" rel="noopener noreferrer">Get directions <Arrow /></a></dd>
            </div>
            <div>
              <dt>Registration</dt>
              <dd><span className="v3-reach-ids">{FIRM.registrations.map((r) => <b key={r.id}>{r.id}</b>)}</span><span>{FIRM.registrationNote}</span></dd>
              <dd className="v3-reach-act"><Link className="v3-textlink" to="/disclosure">Disclosures <Arrow /></Link></dd>
            </div>
            <div>
              <dt>Follow</dt>
              <dd><a className="v3-reach-value" href="https://www.linkedin.com/in/rishiraj-maheshwari-81240b5/" target="_blank" rel="noopener noreferrer">LinkedIn</a><span>Rishiraj Maheshwari, Founder &amp; CEO.</span></dd>
              <dd className="v3-reach-act"><a className="v3-textlink" href="https://www.linkedin.com/in/rishiraj-maheshwari-81240b5/" target="_blank" rel="noopener noreferrer">Open profile <Arrow /></a></dd>
            </div>
          </dl>
        </div>
      </section>
    </PageShell>
  );
}
