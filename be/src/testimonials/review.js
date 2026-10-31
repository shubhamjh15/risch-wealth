import crypto from 'node:crypto';
import express, { Router } from 'express';
import { query } from '../db/pool.js';

// One-click review from the staff email (no sign-in).
//   GET   /api/testimonials/review?id=&action=approve|reject&token=
//         a small confirmation page; nothing changes yet, because mail
//         scanners open links in emails on their own
//   POST  /api/testimonials/review   (form) the same fields: applies it
// The token is an HMAC of id + action, so a link only does what the
// email it came in says. Staff can still change it later in the portal.

// TESTIMONIAL_LINK_SECRET if set; otherwise derived from the database
// URL (which holds the database password), so it's stable across restarts
// without another setting to manage.
const SECRET = process.env.TESTIMONIAL_LINK_SECRET
  || crypto.createHash('sha256').update(`testimonial-review:${process.env.DATABASE_URL || ''}`).digest('hex');

const ACTIONS = { approve: 'published', reject: 'hidden' };

export const reviewToken = (id, action) => crypto.createHmac('sha256', SECRET).update(`${id}:${action}`).digest('hex');

export const reviewLink = (origin, id, action) => `${origin}/api/testimonials/review?id=${id}&action=${action}&token=${reviewToken(id, action)}`;

function valid(id, action, token) {
  if (!Number.isInteger(id) || !ACTIONS[action] || typeof token !== 'string') return false;
  const want = Buffer.from(reviewToken(id, action));
  const got = Buffer.from(token);
  return want.length === got.length && crypto.timingSafeEqual(want, got);
}

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

function page(res, status, title, body) {
  res.status(status).set({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' }).send(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>${esc(title)} · RISCH</title>
<style>
  body{ margin:0; min-height:100vh; display:grid; place-items:center; padding:24px; box-sizing:border-box; background:#EEE8DF; color:#141311; font:16px/1.55 -apple-system, 'Segoe UI', Arial, sans-serif; }
  main{ width:100%; max-width:520px; padding:32px; border-radius:24px; background:#F8F4EE; border:1px solid rgba(20,19,17,.08); box-sizing:border-box; }
  h1{ margin:0 0 6px; font:500 28px/1.15 Georgia, serif; }
  p{ margin:0 0 14px; color:#3B3732; }
  .who{ font-size:14px; color:rgba(20,19,17,.6); }
  blockquote{ margin:16px 0 22px; padding:12px 16px; border-left:3px solid #E36A1A; background:#F2ECE3; }
  button{ font:600 15px/1 inherit; padding:14px 24px; border:0; border-radius:999px; cursor:pointer; color:#fff; background:#141311; }
  button.reject{ background:#A8361A; }
</style></head><body><main>${body}</main></body></html>`);
}

const router = Router();
router.use(express.urlencoded({ extended: false, limit: '2kb' }));

async function load(id) {
  const { rows } = await query('SELECT id, name, role, place, quote, status FROM testimonials WHERE id = $1', [id]);
  return rows[0];
}

router.get('/', async (req, res, next) => {
  try {
    const id = Number(req.query.id);
    const { action, token } = req.query;
    if (!valid(id, action, token)) return page(res, 400, 'Link not valid', '<h1>This link isn’t valid.</h1><p>Open the testimonial from the staff portal instead.</p>');
    const t = await load(id);
    if (!t) return page(res, 404, 'Not found', '<h1>This testimonial no longer exists.</h1>');
    const verb = action === 'approve' ? 'Approve' : 'Reject';
    const now = t.status === 'pending' ? '' : `<p class="who">It is currently ${t.status === 'published' ? 'live on the website' : 'not shown'}.</p>`;
    return page(res, 200, `${verb} testimonial`, `
      <h1>${verb} this testimonial?</h1>
      <p class="who">${esc([t.name, t.role, t.place].filter(Boolean).join(' · '))}</p>
      ${now}
      <blockquote>${esc(t.quote)}</blockquote>
      <p>${action === 'approve' ? 'It will appear on the Testimonials page straight away.' : 'It will not be shown on the website.'}</p>
      <form method="post">
        <input type="hidden" name="id" value="${t.id}"><input type="hidden" name="action" value="${esc(action)}"><input type="hidden" name="token" value="${esc(token)}">
        <button type="submit"${action === 'reject' ? ' class="reject"' : ''}>${verb}</button>
      </form>`);
  } catch (err) {
    return next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const id = Number(req.body?.id);
    const { action, token } = req.body || {};
    if (!valid(id, action, token)) return page(res, 400, 'Link not valid', '<h1>This link isn’t valid.</h1><p>Open the testimonial from the staff portal instead.</p>');
    const { rows } = await query('UPDATE testimonials SET status = $2, updated_at = now() WHERE id = $1 RETURNING name', [id, ACTIONS[action]]);
    if (!rows.length) return page(res, 404, 'Not found', '<h1>This testimonial no longer exists.</h1>');
    return action === 'approve'
      ? page(res, 200, 'Approved', `<h1>Approved.</h1><p>${esc(rows[0].name)}’s testimonial is now live on the Testimonials page.</p><p class="who">You can take it down any time from the staff portal.</p>`)
      : page(res, 200, 'Rejected', `<h1>Rejected.</h1><p>${esc(rows[0].name)}’s testimonial won’t be shown on the website.</p><p class="who">You can still publish it later from the staff portal.</p>`);
  } catch (err) {
    return next(err);
  }
});

export default router;
