# JANMITRA / KORA — Backend API

REST API for the **Janmitra** Legal Investigation & Case Management System.  
Stack: **Node.js + Express + MongoDB Atlas (Mongoose) + JWT**

---

## Quick Start

```bash
cd backend
npm install
cp .env.example .env          # fill in MONGODB_URI + JWT_SECRET
npm run seed                  # optional: seeds 7 demo cases + demo admin user
npm run dev                   # http://localhost:5000 (nodemon, auto-reload)
```

**Check it's alive:**
```bash
curl http://localhost:5000/api/health
```

**Demo credentials (after `npm run seed`):**
```
Email:    officer@janmitra.gov
Password: 12345678
```

`npm start` runs without nodemon (production mode).

---

## Environment Variables

Copy `.env.example` to `.env` and fill in the values below.

| Variable | Default | Required | Notes |
|---|---|---|---|
| `PORT` | `5000` | No | HTTP port |
| `NODE_ENV` | `development` | No | `development` · `production` · `test` |
| `CLIENT_URL` | `http://localhost:5173` | No | CORS origin(s). Comma-separate multiple, or `*` for all |
| `MONGODB_URI` | local mongo | **Yes** | Atlas SRV string or `mongodb://127.0.0.1:27017/kora` |
| `JWT_SECRET` | — | **Yes** | Random string, keep secret |
| `JWT_EXPIRES_IN` | `7d` | No | Token lifetime |
| `STORAGE_PROVIDER` | `local` | No | `local` or `S3` |
| `AWS_REGION` | — | If S3 | e.g. `ap-south-1` |
| `AWS_ACCESS_KEY_ID` | — | If S3 | |
| `AWS_SECRET_ACCESS_KEY` | — | If S3 | |
| `AWS_S3_BUCKET` | — | If S3 | |

---

## Project Structure

```
backend/
├── .env                          # local secrets (gitignored)
├── .env.example                  # template — commit this
├── API_CONTRACT.md               # full endpoint documentation
├── package.json
└── src/
    ├── server.js                 # boot: load env → connect DB → listen
    ├── app.js                    # Express app: CORS, JSON, routes, error handler
    ├── seed.js                   # demo data loader
    │
    ├── config/
    │   └── db.js                 # Mongoose connection with logging
    │
    ├── models/
    │   ├── User.js               # fullName, email, password (bcrypt), role
    │   ├── Case.js               # case + embedded people[] & documents[]
    │   ├── Document.js           # standalone Document record (DMS layer)
    │   ├── Draft.js              # per-user in-progress registration draft
    │   ├── Audit.js              # system activity log
    │   └── EmailOTP.js           # OTP records for email verification
    │
    ├── controllers/
    │   ├── authController.js     # register, login, me
    │   ├── caseController.js     # full CRUD + RBAC + audit
    │   ├── documentController.js # full CRUD + storage abstraction + audit
    │   ├── userController.js     # admin: list, get, update, delete users
    │   ├── draftController.js    # get, save, clear draft
    │   ├── auditController.js    # read-only audit trail
    │   ├── otpController.js      # email OTP flow
    │   └── phoneOTPController.js # phone OTP flow (Twilio)
    │
    ├── routes/
    │   ├── authRoutes.js         # /api/auth
    │   ├── caseRoutes.js         # /api/cases
    │   ├── documentRoutes.js     # /api/documents
    │   ├── userRoutes.js         # /api/users  (Admin only)
    │   ├── draftRoutes.js        # /api/draft
    │   ├── auditRoutes.js        # /api/audit
    │   ├── otpRoutes.js          # /api/otp
    │   └── phoneOTPRoutes.js     # /api/phone-otp
    │
    ├── middleware/
    │   ├── auth.js               # JWT protect() — attaches req.user
    │   ├── authorize.js          # RBAC authorize(...roles)
    │   ├── validate.js           # express-validator → 400 ApiError
    │   ├── documentupload.js     # Multer config (10 MB, allowed MIME types)
    │   └── errorHandler.js       # 404 catch-all + central error normaliser
    │
    ├── services/
    │   └── storageService.js     # File storage abstraction (local / S3 stub)
    │
    └── utils/
        ├── ApiError.js           # Operational error class with statusCode
        ├── caseId.js             # "FIR-YYYY-NNN" / "CMP-YYYY-NNN" generator
        └── formatDate.js         # "Aug 26, 2026" display-date formatter
```

---

## Data Models

### User
| Field | Type | Notes |
|---|---|---|
| `fullName` | String | Required |
| `email` | String | Unique, lowercase |
| `password` | String | Bcrypt hashed, `select: false` |
| `role` | String | `Admin` · `Senior Officer` · `Investigator` · `Clerk` · `Viewer` |
| `createdAt` | Date | Auto |
| `updatedAt` | Date | Auto |

### Case
| Field | Type | Notes |
|---|---|---|
| `caseId` | String | Unique, e.g. `FIR-2026-001` |
| `title` | String | Required |
| `incidentDate` | String | `YYYY-MM-DD` |
| `time` | String | |
| `location` | String | |
| `category` | String | Enum |
| `description` | String | |
| `status` | String | `Active` · `Pending` · `Closed` |
| `people` | Array | Embedded person sub-documents |
| `documents` | Array | Embedded docs (wizard/base64 storage) |
| `createdBy` | ObjectId | ref: User |

### Document (standalone — DMS layer)
| Field | Type | Notes |
|---|---|---|
| `caseId` | String | Indexed string FK to Case.caseId |
| `caseObjectId` | ObjectId | Shadow ref for populate() |
| `name` | String | Human-readable name |
| `documentType` | String | Enum (FIR, Evidence, etc.) |
| `description` | String | |
| `fileName` | String | Original filename |
| `mimeType` | String | |
| `fileSize` | Number | Bytes |
| `storageProvider` | String | `local` · `S3` · `GCS` |
| `storageKey` | String | Relative path or S3 key |
| `filePath` | String | Absolute local path or signed URL |
| `uploadedBy` | ObjectId | ref: User |

---

## RBAC Summary

| Resource | Viewer | Clerk | Investigator | Senior Officer | Admin |
|---|:---:|:---:|:---:|:---:|:---:|
| Cases — Read | ✅ | ✅ | ✅ (own) | ✅ | ✅ |
| Cases — Create | ❌ | ❌ | ✅ | ✅ | ✅ |
| Cases — Update | ❌ | ❌ | ✅ (own) | ✅ | ✅ |
| Cases — Delete | ❌ | ❌ | ❌ | ✅ | ✅ |
| Documents — Read/Download | ✅ | ✅ | ✅ | ✅ | ✅ |
| Documents — Upload/Update | ❌ | ❌ | ✅ | ✅ | ✅ |
| Documents — Delete | ❌ | ❌ | ❌ | ✅ | ✅ |
| Users — All | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## File Storage

Files are uploaded via `multipart/form-data` to `POST /api/documents`.

### Local (default)
Files are saved to `backend/uploads/documents/`. The directory is created automatically.

### Switching to S3
1. Install the AWS SDK: `npm install @aws-sdk/client-s3`
2. Set `STORAGE_PROVIDER=S3` and the `AWS_*` env vars in `.env`
3. Fill in the S3 section in `src/services/storageService.js`

No other changes are needed — the storage layer is fully abstracted.

---

## Validation & Error Format

All inputs are validated with `express-validator`. On failure, the API returns:

```json
{
  "success": false,
  "error": "Incident title is required, Invalid status"
}
```

Status codes:

| Code | When |
|---|---|
| `400` | Validation failure or business rule violation |
| `401` | Missing or invalid JWT |
| `403` | Authenticated but insufficient role |
| `404` | Resource not found |
| `409` | Duplicate unique value |
| `500` | Unexpected server error |

---

## API Documentation

See [`API_CONTRACT.md`](./API_CONTRACT.md) for the complete endpoint reference with request/response shapes, examples, and error codes.

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start with nodemon (auto-reload on file changes) |
| `npm start` | Production start (no nodemon) |
| `npm run seed` | Load demo cases + admin user into MongoDB |
| `npm run db` | Local dev DB helper (see `scripts/dev-db.cjs`) |

---

## Stack Rationale

| Choice | Reason |
|---|---|
| **Express** | Minimal, well-understood, perfect for a focused REST API |
| **MongoDB + Mongoose** | Case data is naturally document-shaped (embedded people & files). No joins needed. Schemas + validation via Mongoose |
| **JWT (stateless)** | The SPA frontend stores a bearer token; no server session required |
| **bcryptjs** | Password hashing — battle-tested, pure JS, no native dep |
| **multer** | Multipart file upload — integrates cleanly with Express |
| **express-validator** | Declarative validation co-located with routes |
