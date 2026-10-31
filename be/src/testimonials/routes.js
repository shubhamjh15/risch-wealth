import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { query } from '../db/pool.js';
import { EMAIL_RE } from '../auth/routes.js';
import { sendMail } from '../mail/mailer.js';
import { reviewLink } from './review.js';

// Public testimonials (no sign-in).
//   GET   /api/testimonials             published testimonials, newest first
//   GET   /api/testimonials/:id/photo   a published testimonial's portrait
//   POST  /api/testimonials   { name, email, role?, place?, group, quote, photo?, consent, website }
// A submission waits as 'pending' and staff are emailed the details with
// Approve / Reject buttons (review.js); it can also be published from the
// staff portal (/api/staff/testimonials).
// `photo` is a data URL of a square JPEG, resized in the browser.

const router = Router();

// Same profiles as fe/src/data/testimonials.js (TESTIMONIAL_GROUPS).
export const TESTIMONIAL_GROUPS = [
  'Business Owners',
  'Entrepreneurs & Founders',
  'Senior Executives & CXOs',
  'Doctors & Professionals',
  'Private Clients & Families',
  'NRIs & Global Indians',
  'Family Offices',
  'Other',
];

const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  // Only accepted ones count, so a few corrected mistakes don't lock anyone out.
  skipFailedRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Thank you, we already have your testimonial. Please try again later.' },
});

// Links are the usual payload of spam, so none are accepted.
const LINK_RE = /https?:\/\/|www\.|\.(com|net|org|in|io|xyz|ru)\b/i;
const clean = (v, max) => String(v || '').replace(/\s+/g, ' ').trim().slice(0, max);

const PHOTO_MAX = 400 * 1024;

// The portrait as a JPEG buffer, null if none was sent, or false if it isn't
// a usable JPEG.
export function parsePhoto(v) {
  if (!v) return null;
  const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(String(v));
  if (!m) return false;
  const buf = Buffer.from(m[1], 'base64');
  if (buf.length > PHOTO_MAX || buf[0] !== 0xff || buf[1] !== 0xd8 || buf[2] !== 0xff) return false;
  return buf;
}

// Sends a portrait stored in the database.
export function sendPhoto(res, photo) {
  res.set({ 'Content-Type': 'image/jpeg', 'X-Content-Type-Options': 'nosniff' });
  res.send(photo);
}

const publicRow = (t) => ({
  id: t.id, name: t.name, role: t.role, place: t.place, group: t.client_group, quote: t.quote, createdAt: t.created_at,
  photo: t.has_photo ? `/api/testimonials/${t.id}/photo` : null,
});

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await query(
      "SELECT *, photo IS NOT NULL AS has_photo FROM testimonials WHERE status = 'published' ORDER BY created_at DESC LIMIT 100",
    );
    res.set('Cache-Control', 'no-cache');
    res.json({ testimonials: rows.map(publicRow) });
  } catch (err) {
    next(err);
  }
});

router.get('/:id/photo', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(404).end();
    const { rows } = await query("SELECT photo FROM testimonials WHERE id = $1 AND status = 'published' AND photo IS NOT NULL", [id]);
    if (!rows.length) return res.status(404).end();
    res.set('Cache-Control', 'public, max-age=3600');
    return sendPhoto(res, rows[0].photo);
  } catch (err) {
    return next(err);
  }
});

router.post('/', submitLimiter, async (req, res, next) => {
  try {
    const b = req.body || {};
    // Honeypot: a field hidden from people that bots fill in. Pretend it worked.
    if (b.website) return res.status(201).json({ ok: true });

    const name = clean(b.name, 80);
    const email = clean(b.email, 200).toLowerCase();
    const role = clean(b.role, 120) || null;
    const place = clean(b.place, 80) || null;
    const group = String(b.group || '');
    const quote = String(b.quote || '').trim().slice(0, 800);

    if (name.length < 2) return res.status(400).json({ error: 'Please enter your name.' });
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
    if (!TESTIMONIAL_GROUPS.includes(group)) return res.status(400).json({ error: 'Please choose the profile that describes you best.' });
    if (quote.length < 20) return res.status(400).json({ error: 'Please write at least a sentence or two.' });
    if ([name, role, place, quote].some((v) => v && LINK_RE.test(v))) return res.status(400).json({ error: 'Please leave out links and web addresses.' });
    const photo = parsePhoto(b.photo);
    if (photo === false) return res.status(400).json({ error: 'Please choose a different photo (a JPG or PNG).' });
    if (b.consent !== true) return res.status(400).json({ error: 'Please confirm we may publish your testimonial.' });

    const { rows } = await query(
      `INSERT INTO testimonials (name, email, role, place, client_group, quote, photo, ip)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [name, email, role, place, group, quote, photo, req.ip],
    );
    notifyStaff({ id: rows[0].id, name, email, role, place, group, quote, photo, origin: `${req.protocol}://${req.get('host')}` });
    return res.status(201).json({ ok: true });
  } catch (err) {
    return next(err);
  }
});

// Emails staff the full submission, portrait attached, with Approve and
// Reject buttons (signed links, see review.js) and a link to the staff
// portal. Not awaited: the visitor isn't kept waiting on the mail server.
function notifyStaff({ id, name, email, role, place, group, quote, photo, origin }) {
  const review = `${origin}/employee-portal/testimonials`;
  const approve = reviewLink(origin, id, 'approve');
  const reject = reviewLink(origin, id, 'reject');
  const rows = [['Name', name], ['Email', email], ['Role', role || '-'], ['City', place || '-'], ['Profile', group], ['Photo', photo ? 'Attached' : 'None']];
  sendMail({
    subject: `New testimonial from ${name}, waiting for review`,
    replyTo: email,
    text: `${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n"${quote}"\n\nIt is not on the website yet.\nApprove (goes live): ${approve}\nReject (not shown): ${reject}\nOr review it in the staff portal: ${review}\n(Testimonial #${id})`,
    html: `<div style="font-family:Arial,sans-serif;font-size:15px;color:#141311;max-width:560px">
      <p style="margin:0 0 16px">A new testimonial was sent from the website. <b>It is not live yet.</b></p>
      ${photo ? '<img src="cid:portrait" width="120" height="120" alt="" style="border-radius:60px;display:block;margin:0 0 16px">' : ''}
      <table cellpadding="6" style="border-collapse:collapse;margin:0 0 16px">${rows.map(([k, v]) => `<tr><td style="color:#6b655d">${k}</td><td><b>${esc(v)}</b></td></tr>`).join('')}</table>
      <blockquote style="margin:0 0 20px;padding:12px 16px;border-left:3px solid #E36A1A;background:#F8F4EE">${esc(quote)}</blockquote>
      <a href="${esc(approve)}" style="display:inline-block;padding:12px 26px;border-radius:999px;background:#2F8F52;color:#fff;text-decoration:none;font-weight:bold">Approve</a>
      &nbsp;
      <a href="${esc(reject)}" style="display:inline-block;padding:12px 26px;border-radius:999px;background:#A8361A;color:#fff;text-decoration:none;font-weight:bold">Reject</a>
      <p style="margin:16px 0 0;color:#6b655d;font-size:12px">Approve puts it on the Testimonials page straight away. You can change it later in the <a href="${esc(review)}" style="color:#6b655d">staff portal</a>.<br>Testimonial #${id}. Reply to this email to write to ${esc(name)}.</p>
    </div>`,
    attachments: photo ? [{ filename: `testimonial-${id}.jpg`, content: photo, cid: 'portrait' }] : undefined,
  });
}

export default router;
