// Central API client for the KORA / Janmitra backend.
//
// It intentionally mirrors the old localStorage helpers in ./data (same function
// names and payload/response shapes) so components only need to switch the import
// from `../lib/data` to `../lib/api` and `await` the calls.

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TOKEN_KEY = 'kora_token';
const NAME_KEY = 'userName';

export function getToken(): string {
  return (
    localStorage.getItem(TOKEN_KEY) ||
    localStorage.getItem('token') ||
    sessionStorage.getItem('token') ||
    ''
  );
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

interface ReqOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
}

async function request(path: string, options: ReqOptions = {}): Promise<any> {
  const { method = 'GET', body, auth = true } = options;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error(`Cannot reach the server. Is the backend running at ${BASE}?`);
  }

  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message = (data && (data.error || data.message)) || `Request failed (${res.status})`;
    const err = new Error(message) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }

  return data;
}

// ---------- Auth ----------

export async function login(email: string, password: string): Promise<any> {
  const data = await request('/auth/login', { method: 'POST', auth: false, body: { email, password } });
  persistSession(data);
  return data.user;
}

export async function register(fullName: string, email: string, password: string): Promise<any> {
  const data = await request('/auth/register', { method: 'POST', auth: false, body: { fullName, email, password } });
  persistSession(data);
  return data.user;
}

// Register-or-login: try to create the account; if the email already exists (409),
// fall back to logging in with the same credentials. Keeps the 2-step login UI intact.
export async function authenticate(fullName: string, email: string, password: string): Promise<any> {
  try {
    return await register(fullName, email, password);
  } catch (e) {
    const status = (e as { status?: number }).status;
    if (status === 409) {
      return await login(email, password);
    }
    throw e;
  }
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('token');
  localStorage.removeItem(NAME_KEY);
  sessionStorage.removeItem('token');
}

function persistSession(data: any): void {
  if (data && data.token) localStorage.setItem(TOKEN_KEY, data.token);
  const name = data && data.user && data.user.fullName;
  if (name) localStorage.setItem(NAME_KEY, name);
}

// ---------- Cases ----------

export function getCases(): Promise<any[]> {
  return request('/cases');
}

export function getCase(id: string): Promise<any> {
  return request(`/cases/${encodeURIComponent(id)}`);
}

export function addCase(payload: any): Promise<any> {
  return request('/cases', { method: 'POST', body: payload });
}

export function updateCase(id: string, payload: any): Promise<any> {
  return request(`/cases/${encodeURIComponent(id)}`, { method: 'PATCH', body: payload });
}

// ---------- Draft (per-user work-in-progress) ----------

export function getDraft(): Promise<any> {
  return request('/draft');
}

export function saveDraft(draft: any): Promise<any> {
  return request('/draft', { method: 'PUT', body: draft });
}

export function clearDraft(): Promise<any> {
  return request('/draft', { method: 'DELETE' });
}
