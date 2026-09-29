export const API_BASE = (import.meta.env?.VITE_API_BASE_URL || '').replace(/\/$/, '');
let session = null;
try {
  session = JSON.parse(sessionStorage.getItem('fh-api-session'));
} catch {
  /* Invalid storage is discarded. */
}
export function getSession() {
  if (
    session &&
    (!Number.isFinite(Date.parse(session.expiresAt)) || Date.parse(session.expiresAt) <= Date.now())
  ) {
    setSession(null);
    window.dispatchEvent(new Event('fh-auth-expired'));
  }
  return session;
}
export function setSession(value) {
  session = value;
  try {
    if (value) sessionStorage.setItem('fh-api-session', JSON.stringify(value));
    else sessionStorage.removeItem('fh-api-session');
  } catch {
    /* Memory session remains available if browser storage is disabled. */
  }
}
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}
export async function api(path, { method = 'GET', body, signal, blob = false } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  const headers = { Accept: blob ? 'text/calendar' : 'application/json' };
  const auth = getSession();
  if (auth?.accessToken) headers.Authorization = `Bearer ${auth.accessToken}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: signal ? AbortSignal.any([signal, controller.signal]) : controller.signal,
      credentials: 'omit',
    });
    if (!response.ok) {
      let problem;
      try {
        problem = await response.json();
      } catch {
        problem = null;
      }
      if (response.status === 401 && auth) {
        setSession(null);
        window.dispatchEvent(new Event('fh-auth-expired'));
      }
      const validation =
        problem?.errors &&
        Object.values(problem.errors)
          .flat()
          .filter((x) => typeof x === 'string')
          .join(' ');
      const known = {
        'SMTP is not configured.':
          'Email delivery is unavailable on the server. Please contact the administrator.',
        'Verify your email before signing in.':
          'Verify your email before signing in. You can resend the verification email below.',
      };
      const message =
        known[problem?.title] ||
        (response.status === 401
          ? path === '/api/auth/login'
            ? 'The email or password was not accepted. Please check your details.'
            : 'Please sign in again to continue.'
          : response.status === 403
            ? 'Your account does not have permission for this action. Email verification may be required.'
            : response.status === 404
              ? 'This item is no longer available.'
              : response.status === 409
                ? 'This conflicts with an existing record. Refresh and try again.'
                : response.status === 429
                  ? 'Too many requests. Please wait a moment and try again.'
                  : response.status >= 500
                    ? 'The server could not complete this request. Please try again later.'
                    : validation ||
                      'Please check your details and try again. The server did not accept this request.');
      throw new ApiError(message, response.status);
    }
    if (response.status === 204) return null;
    if (blob) return response.blob();
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (signal?.aborted) throw error;
    throw new ApiError('Unable to reach Fan Hub. Check your connection and try again.', 0);
  } finally {
    clearTimeout(timeout);
  }
}
export async function allPages(path) {
  const separator = path.includes('?') ? '&' : '?';
  let rows = [],
    page = 1;
  while (true) {
    const result = await api(`${path}${separator}page=${page}&pageSize=100`);
    if (Array.isArray(result)) return result;
    const items = result?.items || [];
    rows.push(...items);
    if (!items.length || rows.length >= result.total) return rows;
    page++;
  }
}
export const send = (path, body, method = 'POST') => api(path, { method, body });
