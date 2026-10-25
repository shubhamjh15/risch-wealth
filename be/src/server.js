import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import riskProfilerRoutes from './riskProfiler/routes.js';
import authRoutes from './auth/routes.js';
import adminRoutes from './admin/routes.js';
import clientRoutes from './client/routes.js';
import staffRoutes from './staff/routes.js';
import orderRoutes from './admin/orders.js';
import { scheduleNavRefresh } from './portfolio/amfi.js';
import { migrate, waitForDatabase } from './db/migrate.js';
import { purgeExpiredSessions } from './auth/sessions.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Bind to localhost only — on the production server this process is
// never reached directly from the internet, only via nginx reverse
// proxying https://rischwealth.com/api/* to it on the same machine.
// Override with HOST=0.0.0.0 only if you know you need it (e.g. running
// the backend and nginx in separate containers).
const HOST = process.env.HOST || '127.0.0.1';

// We're behind nginx, so trust its X-Forwarded-* headers (correct
// req.ip / req.protocol for logging and any future rate limiting).
// TRUST_PROXY = number of proxies in front of us: 1 behind nginx; more
// on hosts that add their own (Cloudflare Pages -> Render).
app.set('trust proxy', Number(process.env.TRUST_PROXY) || 1);

// Same-origin requests (the normal case: nginx serves the frontend and
// proxies /api on the same domain, or Vite's dev proxy does the same
// locally) don't need CORS at all. This allowlist exists for direct API
// access and for anything that isn't same-origin. Configure via
// CORS_ORIGIN as a comma-separated list to override the defaults below.
const defaultOrigins = [
  'https://rischwealth.com',
  'https://www.rischwealth.com',
];
const isLocalhostOrigin = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
const allowedOrigins = (process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : defaultOrigins
);

app.use(cors({
  origin(origin, callback) {
    // requests with no Origin header (curl, same-origin, server-to-server)
    if (!origin || allowedOrigins.includes(origin) || isLocalhostOrigin(origin)) {
      return callback(null, true);
    }
    const err = new Error(`Origin ${origin} is not allowed`);
    err.status = 403;
    callback(err);
  },
}));
app.use(express.json({ limit: '20kb' }));

app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/api/risk-profiler', riskProfilerRoutes);
// Account endpoints only accept JSON for anything that changes state. A
// cross-site HTML form can't send application/json, so together with the
// SameSite=Lax session cookie this blocks CSRF.
const requireJson = (req, res, next) => {
  if (req.method !== 'GET' && !req.is('application/json')) return res.status(415).json({ error: 'Expected JSON.' });
  return next();
};
app.use('/api/auth', requireJson, authRoutes);
app.use('/api/admin', requireJson, adminRoutes, orderRoutes);
app.use('/api/client', requireJson, clientRoutes);
app.use('/api/staff', requireJson, staffRoutes);

// Catches the CORS rejection above (and anything else unhandled) so we
// never leak a stack trace / file paths to the client, in production or
// otherwise.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  // Only messages explicitly marked safe (err.expose) reach the client.
  res.status(err.status || 500).json({ error: err.expose ? err.message : 'Request failed.' });
});

// Bring the database schema up to date before accepting requests.
await waitForDatabase();
await migrate();
scheduleNavRefresh();
setInterval(() => purgeExpiredSessions().catch((e) => console.error(e.message)), 6 * 60 * 60 * 1000).unref();

app.listen(PORT, HOST, () => {
  console.log(`RISCH backend listening on http://${HOST}:${PORT}`);
});
