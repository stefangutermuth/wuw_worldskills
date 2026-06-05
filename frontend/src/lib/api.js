/**
 * fetch-Wrapper für die Headless-WP-REST-API (Namespace rts/v1).
 * Basis-URL kommt aus .env (PUBLIC_WP_API) – niemals hart coden.
 *
 * Genutzt von den „dynamic islands" (Daumen-Button, Wunsch-Formular,
 * Live-Ticker, Dispatch-Liste). Die statische Shell braucht das nicht.
 */
const BASE = import.meta.env.PUBLIC_WP_API ?? '';
const NS = `${BASE}/rts/v1`;

async function request(path, { method = 'GET', body, signal } = {}) {
  const res = await fetch(`${NS}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });
  if (!res.ok) {
    throw new Error(`WP-REST ${method} ${path} → ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  // Zähler "Daumendrücken"
  getCheers: (signal) => request('/cheer', { signal }),
  postCheer: (data) => request('/cheer', { method: 'POST', body: data }),

  // Wunschbaum
  getWishes: (page = 1, signal) => request(`/wishes?page=${page}`, { signal }),
  postWish: (data) => request('/wishes', { method: 'POST', body: data }),

  // Live aus Shanghai
  getDispatches: (signal) => request('/dispatches', { signal }),
  getStatus: (signal) => request('/status', { signal }),

  // Newsletter (Platzhalter – ESP noch nicht angebunden)
  postNewsletter: (data) => request('/newsletter', { method: 'POST', body: data }),
};

export { BASE, NS };
