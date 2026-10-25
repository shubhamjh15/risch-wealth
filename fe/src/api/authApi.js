// Accounts (be/src/auth, be/src/admin). The session is an httpOnly cookie
// set by the API, so nothing is stored in the browser by this code.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function call(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}/api${path}`, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.error || 'Something went wrong. Please try again.');
    err.status = res.status;
    throw err;
  }
  return body;
}

const post = (path, data) => call(path, { method: 'POST', body: JSON.stringify(data || {}) });

// Clients sign up themselves; staff accounts are created by an admin.
export const signupClient = (data) => post('/auth/signup', data);
export const login = (identifier, password, portal) => post('/auth/login', { identifier, password, portal });
export const logout = () => post('/auth/logout');
export const me = () => call('/auth/me');

// Admin only.
export const listStaff = () => call('/admin/staff');
export const createStaff = (data) => post('/admin/staff', data);
export const updateStaff = (id, data) => call(`/admin/staff/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

// Any signed-in user.
export const changePassword = (currentPassword, newPassword) => post('/auth/password', { currentPassword, newPassword });

// Client portal (signed-in clients only).
export const clientOverview = () => call('/client/overview');
export const updateClientProfile = (data) => call('/client/profile', { method: 'PATCH', body: JSON.stringify(data) });
export const listRiskProfiles = () => call('/client/risk-profiles');
export const sendClientRequest = (topic, message) => post('/client/requests', { topic, message });

// Public: testimonials go live as soon as they're submitted.
export const listTestimonials = () => call('/testimonials');
export const submitTestimonial = (data) => post('/testimonials', data);

// Staff (employees and admins): testimonials, which they can hide.
export const listStaffTestimonials = (status) => call(`/staff/testimonials${status ? `?status=${status}` : ''}`);
export const setTestimonialStatus = (id, status) => call(`/staff/testimonials/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });

// Staff (employees and admins): client request inbox.
export const listClientRequests = (status) => call(`/staff/requests${status ? `?status=${status}` : ''}`);
export const setClientRequestStatus = (id, status) => call(`/staff/requests/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
export const clientPortfolio = () => call('/client/portfolio');
export const clientTransactions = ({ page = 1, from = '', to = '', fund = '' } = {}) => {
  const q = new URLSearchParams({ page: String(page) });
  if (from) q.set('from', from);
  if (to) q.set('to', to);
  if (fund) q.set('fund', fund);
  return call(`/client/transactions?${q}`);
};

// Admin only: client portfolios built from recorded purchase orders.
export const searchClients = (q) => call(`/admin/clients?q=${encodeURIComponent(q)}`);
export const searchSchemes = (q) => call(`/admin/schemes?q=${encodeURIComponent(q)}`);
export const clientPortfolioAdmin = (id) => call(`/admin/clients/${id}/portfolio`);
export const createOrder = (data) => post('/admin/orders', data);
export const voidOrder = (id, reason) => post(`/admin/orders/${id}/void`, { reason });
export const navStatus = () => call('/admin/nav-status');
export const refreshNavs = () => post('/admin/nav-refresh');
export const staffDashboard = () => call('/staff/dashboard');
export const listPortfolios = ({ q = '', page = 1 } = {}) => call(`/admin/portfolios?page=${page}${q ? `&q=${encodeURIComponent(q)}` : ''}`);
export const riskProfileReport = (id) => call(`/client/risk-profiles/${id}/report`);
export const clientPortfolioHistory = () => call('/client/portfolio/history');
export const clientHistoryAdmin = (id) => call(`/admin/clients/${id}/history`);
export const sessionStatus = () => call('/auth/status');
