# Connecting the frontend to this backend

The React app currently persists everything in `localStorage` via `src/lib/data.ts`.
Nothing in your frontend is changed by this backend — this guide shows the **optional** wiring
to switch it over. Copy the two snippets below into the frontend when you're ready.

## 1. Add the API base URL

Create `.env` in the **frontend** project root (`KORA/.env`):

```
VITE_API_URL=http://localhost:5000/api
```

Vite exposes it as `import.meta.env.VITE_API_URL`.

## 2. Drop in an API client — `src/lib/api.ts`

```ts
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function token() {
  return localStorage.getItem('kora_token') || '';
}

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// ---- Auth ----
export async function login(email: string, password: string) {
  const data = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  localStorage.setItem('kora_token', data.token);
  localStorage.setItem('userName', data.user.fullName);
  return data.user;
}

export async function register(fullName: string, email: string, password: string) {
  const data = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ fullName, email, password }),
  });
  localStorage.setItem('kora_token', data.token);
  localStorage.setItem('userName', data.user.fullName);
  return data.user;
}

export function logout() {
  localStorage.removeItem('kora_token');
  localStorage.removeItem('userName');
}

// ---- Cases ----
export const getCases = () => request('/cases');
export const getCase = (id: string) => request(`/cases/${id}`);
export const addCase = (payload: unknown) =>
  request('/cases', { method: 'POST', body: JSON.stringify(payload) });
export const updateCase = (id: string, payload: unknown) =>
  request(`/cases/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });

// ---- Draft ----
export const getDraft = () => request('/draft');
export const saveDraft = (draft: unknown) =>
  request('/draft', { method: 'PUT', body: JSON.stringify(draft) });
export const clearDraft = () => request('/draft', { method: 'DELETE' });
```

## 3. Wire it into the components

The current `src/lib/data.ts` functions are **synchronous** (they read `localStorage` directly).
The API versions are **async**, so the components that use them need small changes:

- **`Login.tsx`** — in `handleEmailSubmit` call `await login(email, password)`; in the second step,
  call `await register(username, email, password)` (or just set the name and call `login`).
- **`Dashboard.tsx` / `CaseManagement.tsx`** — load cases in a `useEffect` + `useState`
  instead of calling `getCases()` inline:

  ```tsx
  const [allCases, setAllCases] = useState<any[]>([]);
  useEffect(() => { getCases().then(setAllCases).catch(console.error); }, []);
  ```

- **`CaseDetail.tsx`** — `useEffect(() => { getCase(id!).then(setCaseItem); }, [id])`.
- **`CaseRegistration/Step*`** — load with `getDraft().then(setDraft)`, and replace the
  auto-save `useEffect` with a debounced `saveDraft(draft)`. On submit in `Step5Review`,
  `await addCase(draft)` then `await clearDraft()`.
- **`TopNav.tsx`** — `handleSignOut` calls `logout()` then navigates to `/`.

> Tip: because the API client exports the **same function names** (`getCases`, `addCase`,
> `getDraft`, `saveDraft`, `clearDraft`) as `data.ts`, you can switch a file over just by
> changing its import from `../lib/data` to `../lib/api` — then make that file's calls `await`.

Want me to apply these frontend edits for you? Say the word and I'll wire it up end-to-end.
