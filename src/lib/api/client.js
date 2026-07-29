// Same-origin /api/v1/* is proxied to the Express API via next.config rewrites.
// Do NOT point this at localhost:5000 — session cookies live on the Next.js origin.
const API_BASE = '/api/v1';

let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function clearAccessToken() {
  accessToken = null;
}

export function getAccessToken() {
  return accessToken;
}

export async function fetchToken() {
  const res = await fetch(`${API_BASE}/auth/token`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to exchange session for token');
  }

  const json = await res.json();
  setAccessToken(json.data.accessToken);
  return json.data;
}

export async function apiFetch(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  let res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  if (res.status === 401) {
    try {
      await fetchToken();
      headers.Authorization = `Bearer ${accessToken}`;
      res = await fetch(`${API_BASE}${path}`, {
        ...options,
        credentials: 'include',
        headers,
      });
    } catch {
      // Fall through to the standard error handling below.
    }
  }

  if (res.status === 204) {
    return null;
  }

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error?.message || 'Request failed');
  }

  return json.data;
}
