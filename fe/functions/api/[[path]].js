// Cloudflare Pages Function: forwards every /api/* request to the backend
// (API_ORIGIN, e.g. https://risch-api.onrender.com — set in the Pages
// project's environment variables). The browser only ever talks to
// rischwealth.com, so the SameSite=Lax session cookie and the relative
// /api calls in src/api/ work unchanged, with no CORS. This replaces the
// /api proxy in docker/nginx.conf.
export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const target = new URL(url.pathname + url.search, env.API_ORIGIN);

  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.set('X-Forwarded-For', request.headers.get('CF-Connecting-IP') || '');
  headers.set('X-Forwarded-Proto', 'https');

  return fetch(target, {
    method: request.method,
    headers,
    body: request.body,
    redirect: 'manual',
  });
}
