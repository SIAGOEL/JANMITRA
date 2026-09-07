# KORA / Janmitra — Backend API

REST API for the **Janmitra** Legal Investigation & Case Management frontend (a Vite + React app).
Built with **Node.js + Express + MongoDB (Mongoose)** and JWT authentication.

The endpoints mirror, one-to-one, every data operation the frontend currently performs against
`localStorage` (`src/lib/data.ts`) — case listing, case registration (multi-step draft), case
detail, and login — so the React app can switch from `localStorage` to this API with minimal
wiring (see [`INTEGRATION.md`](./INTEGRATION.md)).

---

## Why this stack

| Choice | Reason |
| --- | --- |
| **Express** | Minimal, ubiquitous, and exactly what the task asked for. Perfect for a focused REST API. |
| **MongoDB + Mongoose** | The frontend already treats a case as a **self-contained JSON document** with embedded `people[]` and `documents[]` arrays (and stores files inline as base64). MongoDB stores that shape as-is, so API responses match the frontend's expected objects with almost no transformation. No joins are needed — a case is never queried by its sub-people. Mongoose still gives us schemas, enums, and validation. |
| **JWT (stateless)** | The frontend is a SPA with no server session; a bearer token in `localStorage`/memory is the natural fit. |

> If you specifically need relational guarantees (SQL joins, foreign keys), the same design maps
> cleanly to **PostgreSQL + Prisma** — tell me and I'll port it. For this frontend's data shape,
> Mongo is the lower-friction, closer match.

---

## Requirements

- **Node.js** 18+
- **MongoDB** — either
  - a local server (`mongodb://127.0.0.1:27017`), or
  - a free **MongoDB Atlas** cluster (paste its SRV string into `MONGODB_URI`).

---

## Setup

```bash
cd backend
npm install
cp .env.example .env      # a ready-to-use .env is already included for local dev
npm run seed              # optional: load the 7 demo cases + a demo user
npm run dev               # starts on http://localhost:5000 (nodemon)
```

`npm start` runs without nodemon (for production).

Check it's alive:

```bash
curl http://localhost:5000/api/health
```

**Demo login (after `npm run seed`):** `officer@janmitra.gov` / `password123`

---

## Environment variables (`.env`)

| Var | Default | Notes |
| --- | --- | --- |
| `PORT` | `5000` | API port |
| `NODE_ENV` | `development` | |
| `CLIENT_URL` | `http://localhost:5173` | CORS origin(s). Comma-separate multiple, or `*` for all. |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/kora` | Local Mongo or Atlas SRV string |
| `JWT_SECRET` | — | **Change in production** |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |

---

## Project structure

```
backend/
├── .env / .env.example
├── package.json
└── src/
    ├── server.js              # boot: load env, connect DB, listen
    ├── app.js                 # express app: CORS, JSON, routes, error handler
    ├── seed.js                # demo data (matches the frontend defaults)
    ├── config/
    │   └── db.js              # mongoose connection
    ├── models/
    │   ├── User.js            # fullName, email, password (bcrypt)
    │   ├── Case.js            # case + embedded people[] & documents[]
    │   └── Draft.js           # per-user in-progress registration draft
    ├── controllers/
    │   ├── authController.js
    │   ├── caseController.js
    │   └── draftController.js
    ├── routes/
    │   ├── authRoutes.js       # /api/auth
    │   ├── caseRoutes.js       # /api/cases
    │   └── draftRoutes.js      # /api/draft
    ├── middleware/
    │   ├── auth.js            # JWT protect()
    │   ├── validate.js        # express-validator -> 400
    │   └── errorHandler.js    # 404 + central error formatter
    └── utils/
        ├── ApiError.js
        ├── caseId.js          # "FIR-YYYY-NNN" generator
        └── formatDate.js      # "Aug 26, 2026" display format
```

---

## API reference

Base URL: `http://localhost:5000/api`
Protected routes require header: `Authorization: Bearer <token>`

### Auth

| Method | Path | Body | Response |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | `{ fullName, email, password }` | `{ success, token, user }` |
| `POST` | `/auth/login` | `{ email, password }` | `{ success, token, user }` |
| `GET` | `/auth/me` 🔒 | — | `{ success, user }` |

### Cases 🔒

| Method | Path | Body | Response |
| --- | --- | --- | --- |
| `GET` | `/cases?search=&status=` | — | `Case[]` (raw array) |
| `GET` | `/cases/:id` | — | `Case` |
| `POST` | `/cases` | full case/draft | `Case` (201) |
| `PATCH` | `/cases/:id` | any updatable fields | `Case` |
| `DELETE` | `/cases/:id` | — | `{ success, message }` |

`:id` is the human case id, e.g. `FIR-2023-089`.

**`Case` response shape** (extends the frontend's list shape):

```jsonc
{
  "id": "FIR-2024-089",        // the FIR/complaint string (used as key & route param)
  "title": "Property Dispute - Sector 4",
  "date": "Aug 26, 2026",       // display date (matches frontend tables)
  "status": "Pending",          // Active | Pending | Closed
  "incidentDate": "2026-08-20", // YYYY-MM-DD (Step 1)
  "time": "14:30",
  "location": "...",
  "category": "Property Dispute",
  "description": "...",
  "people": [
    { "id": "...", "name": "Jane Doe", "relationship": "Witness", "contact": "", "address": "", "notes": "" }
  ],
  "documents": [
    { "id": "...", "name": "fir.pdf", "type": "PDF", "size": "1.2 MB", "dataUrl": "data:...", "category": "FIR Copy" }
  ],
  "createdAt": "...", "updatedAt": "..."
}
```

### Draft 🔒 (per-user, powers the multi-step registration wizard)

| Method | Path | Body | Response |
| --- | --- | --- | --- |
| `GET` | `/draft` | — | draft object |
| `PUT` | `/draft` | draft object | saved draft |
| `DELETE` | `/draft` | — | empty draft |

Draft shape: `{ title, date, time, location, category, description, people[], documents[] }`
— identical to the frontend's `getDraft()` default.

---

## Validation & errors

- Inputs validated with `express-validator` (title required, valid email, password ≥ 8, enum checks for `status`/`category`).
- All errors return `{ "success": false, "error": "message" }` with an appropriate HTTP status
  (400 validation, 401 auth, 404 not found, 409 duplicate, 500 server).

---

## Frontend ↔ backend endpoint map (verification checklist)

Every place the frontend touches data today, and its matching endpoint:

| Frontend operation (file) | Backend endpoint |
| --- | --- |
| `getCases()` — Dashboard, CaseManagement, CaseDetail | `GET /api/cases` |
| `addCase()` — Step5Review submit | `POST /api/cases` |
| `cases.find(c => c.id === id)` — CaseDetail | `GET /api/cases/:id` |
| `getDraft()` — Step 1/2/4/5 | `GET /api/draft` |
| `saveDraft()` — Step 1/2/4 | `PUT /api/draft` |
| `clearDraft()` — Step5Review submit | `DELETE /api/draft` |
| Login step 1 (email + password) — `handleEmailSubmit` | `POST /api/auth/login` |
| Login step 2 (full name) — `handleNameSubmit` | `POST /api/auth/register` + `GET /api/auth/me` |
| Sign out — `handleSignOut` | client-side token clear (no endpoint) |
| CaseDetail "Update Status" / "Close Case" | `PATCH /api/cases/:id` |
| CaseManagement search + status filter | `GET /api/cases?search=&status=` |

See [`INTEGRATION.md`](./INTEGRATION.md) for the drop-in frontend client that wires these up.
