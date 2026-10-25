import { Router } from 'express';
import { query } from '../db/pool.js';
import { requireRole } from '../auth/routes.js';

// Staff portal (employees and admins).
//   GET   /api/staff/dashboard      counts, recent requests; for admins also
//                                   portfolio counts, recent orders, NAV date
//   GET   /api/staff/requests?status=open|in_progress|closed|all
//   PATCH /api/staff/requests/:id   { status }
//   GET   /api/staff/testimonials?status=published|hidden|all
//   PATCH /api/staff/testimonials/:id   { status: 'published'|'hidden' }

const router = Router();
router.use(requireRole('employee', 'admin'));

const STATUSES = ['open', 'in_progress', 'closed'];

const requestRow = (r) => ({
  id: r.id, topic: r.topic, message: r.message, status: r.status, createdAt: r.created_at, updatedAt: r.updated_at,
  client: { id: r.user_id, name: r.client_name, email: r.client_email, phone: r.client_phone },
});

router.get('/dashboard', async (req, res, next) => {
  try {
    const [{ rows: c }, { rows: rq }] = await Promise.all([
      query(`SELECT (SELECT count(*)::int FROM users WHERE role = 'client' AND status = 'active') AS clients,
                    (SELECT count(*)::int FROM client_requests WHERE status <> 'closed') AS pending`),
      query(`SELECT r.*, u.full_name AS client_name, u.email AS client_email, u.phone AS client_phone
               FROM client_requests r JOIN users u ON u.id = r.user_id
              WHERE r.status <> 'closed' ORDER BY r.created_at DESC LIMIT 4`),
    ]);
    const out = { clients: c[0].clients, pendingRequests: c[0].pending, recentRequests: rq.map(requestRow) };
    if (req.user.role === 'admin') {
      const [{ rows: p }, { rows: orders }] = await Promise.all([
        query(`SELECT (SELECT count(DISTINCT user_id)::int FROM transactions WHERE status = 'active') AS portfolios,
                      (SELECT count(*)::int FROM funds) AS funds,
                      (SELECT max(nav_date) FROM funds) AS nav_date,
                      (SELECT row_to_json(i) FROM (SELECT finished_at, error FROM nav_imports ORDER BY started_at DESC LIMIT 1) i) AS last_import`),
        query(`SELECT t.id, t.trade_date, t.amount, t.type, f.name AS fund_name, u.id AS user_id, u.full_name
                 FROM transactions t JOIN funds f USING (scheme_code) JOIN users u ON u.id = t.user_id
                WHERE t.status = 'active' ORDER BY t.created_at DESC LIMIT 5`),
      ]);
      Object.assign(out, {
        activePortfolios: p[0].portfolios, heldFunds: p[0].funds, navDate: p[0].nav_date, lastNavImport: p[0].last_import,
        recentOrders: orders.map((o) => ({
          id: o.id, date: o.trade_date, amount: Number(o.amount), type: o.type, fundName: o.fund_name,
          client: { id: o.user_id, name: o.full_name },
        })),
      });
    }
    res.json(out);
  } catch (err) {
    next(err);
  }
});

router.get('/requests', async (req, res, next) => {
  try {
    // Default view: everything not yet closed. 'all' shows history too.
    const filter = req.query.status;
    const where = filter === 'all' ? 'TRUE'
      : STATUSES.includes(filter) ? 'r.status = $1'
        : "r.status <> 'closed'";
    const [{ rows }, { rows: counts }] = await Promise.all([
      query(
        `SELECT r.*, u.full_name AS client_name, u.email AS client_email, u.phone AS client_phone
           FROM client_requests r JOIN users u ON u.id = r.user_id
          WHERE ${where}
          ORDER BY r.created_at DESC LIMIT 200`,
        STATUSES.includes(filter) ? [filter] : [],
      ),
      query('SELECT status, count(*)::int AS n FROM client_requests GROUP BY status'),
    ]);
    const n = Object.fromEntries(counts.map((r) => [r.status, r.n]));
    res.json({
      requests: rows.map(requestRow),
      counts: { open: n.open || 0, in_progress: n.in_progress || 0, closed: n.closed || 0 },
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/requests/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const status = req.body?.status;
    if (!Number.isInteger(id) || !STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid update.' });
    const { rows } = await query(
      'UPDATE client_requests SET status = $2, updated_at = now() WHERE id = $1 RETURNING id, status',
      [id, status],
    );
    if (!rows.length) return res.status(404).json({ error: 'Request not found.' });
    return res.json({ request: rows[0] });
  } catch (err) {
    return next(err);
  }
});

const T_STATUSES = ['published', 'hidden'];
const testimonialRow = (t) => ({
  id: t.id, name: t.name, email: t.email, role: t.role, place: t.place, group: t.client_group,
  quote: t.quote, status: t.status, createdAt: t.created_at, updatedAt: t.updated_at,
});

router.get('/testimonials', async (req, res, next) => {
  try {
    const filter = req.query.status;
    const [{ rows }, { rows: counts }] = await Promise.all([
      query(
        `SELECT * FROM testimonials WHERE ${T_STATUSES.includes(filter) ? 'status = $1' : 'TRUE'}
          ORDER BY created_at DESC LIMIT 200`,
        T_STATUSES.includes(filter) ? [filter] : [],
      ),
      query('SELECT status, count(*)::int AS n FROM testimonials GROUP BY status'),
    ]);
    const n = Object.fromEntries(counts.map((r) => [r.status, r.n]));
    res.json({ testimonials: rows.map(testimonialRow), counts: { published: n.published || 0, hidden: n.hidden || 0 } });
  } catch (err) {
    next(err);
  }
});

router.patch('/testimonials/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const status = req.body?.status;
    if (!Number.isInteger(id) || !T_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid update.' });
    const { rows } = await query(
      'UPDATE testimonials SET status = $2, updated_at = now() WHERE id = $1 RETURNING id, status',
      [id, status],
    );
    if (!rows.length) return res.status(404).json({ error: 'Testimonial not found.' });
    return res.json({ testimonial: rows[0] });
  } catch (err) {
    return next(err);
  }
});

export default router;
