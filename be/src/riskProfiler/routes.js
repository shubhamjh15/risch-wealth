import { Router } from 'express';
import { getActiveConfig } from './config.js';
import { scoreSubmission, validateAnswers } from './scoring.js';
import { query } from '../db/pool.js';
import { userFromRequest } from '../auth/sessions.js';
import rateLimit from 'express-rate-limit';
import { sendMail } from '../mail/mailer.js';

// Each completed profile with a name is emailed to RISCH as a lead. Capped
// per IP so the form can't be used to flood the inbox; scoring isn't capped.
const leadLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false, handler: (req, res, next) => { req.noLead = true; next(); } });
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const clean = (v, max) => String(v || '').replace(/\s+/g, ' ').trim().slice(0, max);

// The lead email: who it is (with one-tap call, WhatsApp and email links),
// the result, the scores, the illustrative mix and every answer given.
// Answers arrive as points; each question's points are unique, so they map
// back to the option chosen.
function emailLead(contact, answers, result, config, amount, age) {
  const name = clean(contact?.name, 80);
  if (!name) return;
  const email = clean(contact.email, 200);
  const phone = clean(contact.phone, 30);
  const digits = phone.replace(/\D/g, '');
  const wa = digits.length === 10 ? `91${digits}` : digits;
  const t = config.tiers[result.tier];
  const profile = t.short.replace('Active ', '');
  const when = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
  const rupees = amount ? `₹${Number(amount).toLocaleString('en-IN')}` : '-';
  const mix = [['Equity', Math.round(t.india + t.intl)], ['Fixed income', Math.round(t.debt)], ['Cash', Math.round(t.cash)]];
  const picked = config.questions.map((q, i) => [i + 1, q.prompt, q.options.find((o) => o.points === answers[q.id])?.label || '-']);

  const row = (k, v) => `<tr><td style="padding:7px 0;color:#7a7268;width:150px;vertical-align:top">${k}</td><td style="padding:7px 0;color:#141311;font-weight:bold">${v}</td></tr>`;
  const btn = (href, label, bg) => `<a href="${esc(href)}" style="display:inline-block;margin:0 8px 8px 0;padding:10px 18px;border-radius:999px;background:${bg};color:#fff;text-decoration:none;font-weight:bold;font-size:14px">${label}</a>`;
  const bar = (v, max) => `<div style="height:8px;border-radius:8px;background:#E6DDD1"><div style="width:${Math.round((v / max) * 100)}%;height:8px;border-radius:8px;background:#E36A1A"></div></div>`;
  const card = 'background:#FFFFFF;border:1px solid #EADFD2;border-radius:16px;padding:20px 22px;margin:0 0 14px';
  const h = (s) => `<p style="margin:0 0 12px;font-size:11px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;color:#A9480B">${s}</p>`;

  const html = `<div style="background:#EEE8DF;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#141311">
  <div style="max-width:600px;margin:0 auto">
    <div style="background:#141311;border-radius:16px 16px 0 0;padding:18px 22px;color:#fff">
      <span style="font-family:Georgia,serif;font-size:22px;letter-spacing:1px">RISCH</span>
      <span style="float:right;font-size:12px;color:#CFC6BA;padding-top:6px">New risk profile · ${esc(when)}</span>
    </div>
    <div style="background:#FBF1E7;border:1px solid #EADFD2;border-top:0;border-radius:0 0 16px 16px;padding:24px 22px;margin:0 0 14px">
      <p style="margin:0 0 4px;font-size:13px;color:#7a7268">${esc(name)} completed the risk profile on the website</p>
      <p style="margin:0;font-family:Georgia,serif;font-size:38px;line-height:1.1;color:#141311">${esc(profile)}</p>
      <p style="margin:10px 0 0;font-size:14px;color:#3B3732">Illustrative mix: ${mix.map(([k, v]) => `<b>${v}%</b> ${k.toLowerCase()}`).join(' · ')}</p>
    </div>
    <div style="${card}">
      ${h('Contact')}
      <table style="border-collapse:collapse;width:100%">${row('Name', esc(name))}${row('Email', email ? `<a href="mailto:${esc(email)}" style="color:#A9480B">${esc(email)}</a>` : '-')}${row('Mobile', phone ? `<a href="tel:${esc(digits)}" style="color:#A9480B">${esc(phone)}</a>` : '-')}${row('Age', age ? `${age} years` : '-')}${row('Amount considered', rupees)}</table>
      <div style="margin-top:14px">${phone ? btn(`tel:${digits}`, 'Call', '#141311') + btn(`https://wa.me/${wa}`, 'WhatsApp', '#25D366') : ''}${email ? btn(`mailto:${email}?subject=${encodeURIComponent('Your RISCH risk profile')}`, 'Email', '#E36A1A') : ''}</div>
    </div>
    <div style="${card}">
      ${h('Scores')}
      <p style="margin:0 0 6px;font-size:14px">Time horizon <b style="float:right">${result.timeHorizonScore} / 17</b></p>${bar(result.timeHorizonScore, 17)}
      <p style="margin:14px 0 6px;font-size:14px">Comfort with ups and downs <b style="float:right">${result.riskPreferenceScore} / 100</b></p>${bar(result.riskPreferenceScore, 100)}
      ${result.ambiguous ? '<p style="margin:14px 0 0;font-size:13px;color:#A8361A">This combination is flagged for review: worth discussing the risk answers with them.</p>' : ''}
    </div>
    <div style="${card}">
      ${h('Their answers')}
      ${picked.map(([n, q, a]) => `<div style="padding:10px 0;border-top:1px solid #F0E8DE"><p style="margin:0 0 3px;font-size:13px;color:#7a7268">${n}. ${esc(q)}</p><p style="margin:0;font-weight:bold">${esc(a)}</p></div>`).join('')}
    </div>
    <p style="margin:6px 4px 0;font-size:12px;color:#7a7268">Reply to this email to write to ${esc(name)}${email ? '' : ' (no email was given)'}. Sent automatically from the RISCH website.</p>
  </div></div>`;

  const text = [`${name} completed the risk profile: ${profile}`, '',
    `Email: ${email || '-'}`, `Mobile: ${phone || '-'}`, `Age: ${age || '-'}`, `Amount: ${rupees}`, '',
    `Time horizon: ${result.timeHorizonScore}/17`, `Comfort with ups and downs: ${result.riskPreferenceScore}/100`,
    `Illustrative mix: ${mix.map(([k, v]) => `${v}% ${k}`).join(', ')}`, '',
    ...picked.map(([n, q, a]) => `${n}. ${q}\n   ${a}`)].join('\n');

  sendMail({ subject: `New risk profile: ${name} · ${profile}`, replyTo: email || undefined, text, html });
}

const router = Router();

// Public: the frontend fetches this once to render the quiz + report.
// Question point values are included (the frontend needs them to show
// selections instantly) — the part that actually matters, the scoring
// math itself, only ever runs here on the server.
router.get('/config', (req, res) => {
  const config = getActiveConfig();
  res.json({
    version: config.version,
    questions: config.questions,
    tierOrder: config.tierOrder,
    tiers: config.tiers,
  });
});

// Public: submit answers, get back the computed tier + full report data.
// If a client is signed in, the result is also saved to their portal.
router.post('/score', leadLimiter, async (req, res, next) => {
  const { answers } = req.body || {};
  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ error: 'Request body must include an "answers" object.' });
  }

  const config = getActiveConfig();
  const validationError = validateAnswers(answers, config);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const result = scoreSubmission(answers, config);
  if (!req.noLead) emailLead(req.body?.contact, answers, result, config, Number(req.body?.amount) || null, Number(req.body?.age) || null);

  try {
    const user = await userFromRequest(req);
    if (user && user.role === 'client') {
      const t = config.tiers[result.tier];
      const amount = Number(req.body?.amount);
      const age = Number(req.body?.age);
      const { rows } = await query(
        `INSERT INTO risk_profiles (user_id, config_version, answers, time_horizon_score, risk_preference_score, tier, tier_name, allocation, investment_amount, age)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
        [user.id, config.version, JSON.stringify(answers), result.timeHorizonScore, result.riskPreferenceScore, result.tier, t.name,
          JSON.stringify({ india: t.india, intl: t.intl, debt: t.debt, cash: t.cash }), Number.isFinite(amount) && amount > 0 ? amount : null,
          Number.isInteger(age) && age >= 18 && age <= 100 ? age : null],
      );
      return res.json({ ...result, savedToAccount: true, riskProfileId: rows[0].id });
    }
  } catch (err) {
    return next(err);
  }
  return res.json(result);
});

export default router;
