import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { query } from '../db/pool.js';
import { EMAIL_RE } from '../auth/routes.js';

// Public testimonials (no sign-in).
//   GET   /api/testimonials   published testimonials, newest first
//   POST  /api/testimonials   { name, email, role?, place?, group, quote, consent, website }
// A submission is published straight away. Staff hide anything unsuitable
// from the staff portal (/api/staff/testimonials).

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
];

const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  // Only published ones count, so a few corrected mistakes don't lock anyone out.
  skipFailedRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Thank you, we already have your testimonial. Please try again later.' },
});

// Links are the usual payload of spam, so none are accepted.
const LINK_RE = /https?:\/\/|www\.|\.(com|net|org|in|io|xyz|ru)\b/i;
const clean = (v, max) => String(v || '').replace(/\s+/g, ' ').trim().slice(0, max);

const publicRow = (t) => ({
  id: t.id, name: t.name, role: t.role, place: t.place, group: t.client_group, quote: t.quote, createdAt: t.created_at,
});

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await query(
      "SELECT * FROM testimonials WHERE status = 'published' ORDER BY created_at DESC LIMIT 100",
    );
    res.set('Cache-Control', 'no-cache');
    res.json({ testimonials: rows.map(publicRow) });
  } catch (err) {
    next(err);
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
    if (b.consent !== true) return res.status(400).json({ error: 'Please confirm we may publish your testimonial.' });

    const { rows } = await query(
      `INSERT INTO testimonials (name, email, role, place, client_group, quote, ip)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, email, role, place, group, quote, req.ip],
    );
    return res.status(201).json({ testimonial: publicRow(rows[0]) });
  } catch (err) {
    return next(err);
  }
});

export default router;
