// Relative by default so requests always go to the same origin the page
// was loaded from — in dev that's proxied to the backend by Vite
// (vite.config.js), in production it's proxied to the backend by nginx
// (see be/README.md). Only set VITE_API_BASE_URL if the API genuinely
// lives on a different host than the frontend.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function handleResponse(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export function fetchRiskProfilerConfig() {
  return fetch(`${API_BASE_URL}/api/risk-profiler/config`).then(handleResponse);
}

// `amount` and `age` are only stored when a signed-in client's result is
// saved to their portal; the scoring itself doesn't use them. `contact`
// (name, email, phone) is emailed to RISCH with the result.
export function submitRiskProfilerAnswers(answers, amount, age, contact) {
  return fetch(`${API_BASE_URL}/api/risk-profiler/score`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers, amount, age, contact }),
  }).then(handleResponse);
}
