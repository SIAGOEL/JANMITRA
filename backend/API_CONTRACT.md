# JANMITRA — API Contract

**Base URL:** `http://localhost:5000/api`  
**Version:** 1.0  
**Auth scheme:** Bearer JWT — include `Authorization: Bearer <token>` on all 🔒 routes.

---

## Table of Contents

1. [Standard Response Shapes](#1-standard-response-shapes)
2. [Error Codes](#2-error-codes)
3. [RBAC Role Matrix](#3-rbac-role-matrix)
4. [Auth — `/api/auth`](#4-auth)
5. [Cases — `/api/cases`](#5-cases)
6. [Documents — `/api/documents`](#6-documents)
7. [Users — `/api/users`](#7-users)
8. [Draft — `/api/draft`](#8-draft)
9. [Audit — `/api/audit`](#9-audit)
10. [Health Check](#10-health-check)

---

## 1. Standard Response Shapes

### Success (new endpoints — Documents, Users)

```json
{
  "success": true,
  "data": { ... }
}
```

### Success (Auth endpoints)

```json
{
  "success": true,
  "token": "<jwt>",
  "user": { ... }
}
```

### Success (Cases — matches existing frontend contract)

Cases return a **raw object or array** (no envelope wrapper) to maintain backward compatibility with the existing React frontend.

### Error (all endpoints)

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

---

## 2. Error Codes

| HTTP Status | Meaning |
|---|---|
| `200` | OK |
| `201` | Created |
| `400` | Bad request — validation failure or business rule violation |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — authenticated but insufficient role |
| `404` | Resource not found |
| `409` | Conflict — duplicate unique value (e.g. email already registered) |
| `500` | Internal server error |

---

## 3. RBAC Role Matrix

Roles in order of privilege (highest → lowest):

| Role | Description |
|---|---|
| `Admin` | Full access to all resources including user management |
| `Senior Officer` | Can manage cases and documents; cannot manage users |
| `Investigator` | Can create and update cases/documents they are involved with |
| `Clerk` | Read-only access; can view cases and documents |
| `Viewer` | Read-only access (most restricted) |

| Resource | Action | Viewer | Clerk | Investigator | Senior Officer | Admin |
|---|---|:---:|:---:|:---:|:---:|:---:|
| Cases | List / Get | ✅ | ✅ | ✅ (own) | ✅ (all) | ✅ |
| Cases | Create | ❌ | ❌ | ✅ | ✅ | ✅ |
| Cases | Update | ❌ | ❌ | ✅ (own) | ✅ | ✅ |
| Cases | Delete | ❌ | ❌ | ❌ | ✅ | ✅ |
| Documents | List / Get / Download | ✅ | ✅ | ✅ | ✅ | ✅ |
| Documents | Upload / Update | ❌ | ❌ | ✅ | ✅ | ✅ |
| Documents | Delete | ❌ | ❌ | ❌ | ✅ | ✅ |
| Users | List / Get / Update / Delete | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 4. Auth

### `POST /api/auth/register`

Create a new user account.

**Auth required:** No  
**Body:**

```json
{
  "fullName": "Priya Sharma",
  "email": "priya@janmitra.gov",
  "password": "12345678"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `fullName` | string | ✅ | Non-empty |
| `email` | string | ✅ | Valid email format |
| `password` | string | ✅ | Exactly 8 digits (`/^\d{8}$/`) |

**Response `201`:**

```json
{
  "success": true,
  "message": "Account created successfully",
  "token": "<jwt>",
  "user": {
    "id": "64f3...",
    "fullName": "Priya Sharma",
    "email": "priya@janmitra.gov",
    "role": "Viewer",
    "createdAt": "2026-09-08T16:00:00.000Z",
    "updatedAt": "2026-09-08T16:00:00.000Z"
  }
}
```

**Errors:** `400` validation, `409` email already registered

---

### `POST /api/auth/login`

Authenticate and receive a JWT.

**Auth required:** No  
**Body:**

```json
{
  "email": "priya@janmitra.gov",
  "password": "12345678"
}
```

**Response `200`:**

```json
{
  "success": true,
  "token": "<jwt>",
  "user": {
    "id": "64f3...",
    "fullName": "Priya Sharma",
    "email": "priya@janmitra.gov",
    "role": "Investigator",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Errors:** `400` validation, `401` invalid credentials

---

### `GET /api/auth/me` 🔒

Return the currently authenticated user.

**Auth required:** Yes (any role)  
**Body:** None

**Response `200`:**

```json
{
  "success": true,
  "user": {
    "id": "64f3...",
    "fullName": "Priya Sharma",
    "email": "priya@janmitra.gov",
    "role": "Investigator",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

## 5. Cases

> All case routes require a valid JWT (`Authorization: Bearer <token>`).

The `:id` parameter in all case routes is the **human-readable case ID** (e.g. `FIR-2026-001`), not a MongoDB ObjectId.

### `GET /api/cases` 🔒

List cases. Admins and Senior Officers see all cases; other roles see only cases they created.

**Roles:** All authenticated  
**Query parameters:**

| Param | Type | Required | Notes |
|---|---|---|---|
| `search` | string | No | Full-text search on `title` and `caseId` |
| `status` | string | No | `Active` \| `Pending` \| `Closed` |

**Response `200`:** Array of `Case` objects (see shape below)

---

### `GET /api/cases/:id` 🔒

Get a single case by its string ID.

**Roles:** All authenticated (own case for Investigator/Clerk/Viewer)  
**Path param:** `id` — e.g. `FIR-2026-001`

**Response `200`:** Single `Case` object

**Errors:** `404` case not found, `403` access denied

---

### `POST /api/cases` 🔒

Create a new case. A unique `caseId` is auto-generated (`FIR-YYYY-NNN` or `CMP-YYYY-NNN`).

**Roles:** Investigator, Senior Officer, Admin  
**Body:**

```json
{
  "title": "Property Dispute - Sector 4",
  "incidentDate": "2026-08-20",
  "time": "14:30",
  "location": "Sector 4, New Delhi",
  "category": "Property Dispute",
  "description": "Complainant reports...",
  "status": "Pending",
  "people": [
    {
      "name": "Jane Doe",
      "relationship": "Witness",
      "contact": "+91 98765 43210",
      "address": "Flat 5B, Tower 2",
      "notes": ""
    }
  ],
  "documents": [],
  "prefix": "FIR"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | ✅ | Incident title |
| `incidentDate` | string | No | `YYYY-MM-DD` |
| `time` | string | No | `HH:MM` |
| `location` | string | No | |
| `category` | string | No | `Theft` \| `Assault` \| `Fraud` \| `Property Dispute` \| `Cyber Crime` \| `Other` |
| `description` | string | No | |
| `status` | string | No | `Active` \| `Pending` \| `Closed` (default: `Pending`) |
| `people` | array | No | Array of person objects |
| `documents` | array | No | Embedded doc objects (frontend wizard) |
| `prefix` | string | No | `FIR` (default) or `CMP` |

**Response `201`:** `Case` object with generated `id`

---

### `PATCH /api/cases/:id` 🔒

Partial update. Only the fields listed below can be changed.

**Roles:** Investigator (own cases), Senior Officer, Admin  
**Body (all fields optional):**

```json
{
  "title": "Updated title",
  "status": "Active",
  "location": "...",
  "description": "...",
  "category": "Fraud",
  "time": "09:00",
  "incidentDate": "2026-08-21",
  "people": [...],
  "documents": [...]
}
```

**Response `200`:** Updated `Case` object  
**Errors:** `400` validation, `403` access denied, `404` not found

---

### `DELETE /api/cases/:id` 🔒

Permanently delete a case.

**Roles:** Senior Officer, Admin  
**Response `200`:**

```json
{
  "success": true,
  "message": "Case deleted"
}
```

---

### Case Object Shape

```json
{
  "id": "FIR-2026-001",
  "title": "Property Dispute - Sector 4",
  "date": "Sep 08, 2026",
  "incidentDate": "2026-08-20",
  "time": "14:30",
  "location": "Sector 4, New Delhi",
  "category": "Property Dispute",
  "description": "Complainant reports...",
  "status": "Pending",
  "people": [
    {
      "id": "64f3...",
      "name": "Jane Doe",
      "relationship": "Witness",
      "contact": "+91 98765 43210",
      "address": "Flat 5B, Tower 2",
      "notes": ""
    }
  ],
  "documents": [
    {
      "id": "64f3...",
      "name": "FIR Copy",
      "type": "PDF",
      "size": "1.2 MB",
      "dataUrl": "data:application/pdf;base64,...",
      "category": "FIR Copy"
    }
  ],
  "createdAt": "2026-09-08T16:00:00.000Z",
  "updatedAt": "2026-09-08T16:00:00.000Z"
}
```

---

## 6. Documents

> All document routes require a valid JWT.  
> The `:id` parameter is the MongoDB ObjectId of the Document record.

These are **standalone document records** stored in the `documents` collection — separate from the embedded `documents[]` array inside a Case (used by the registration wizard). Both can coexist.

### `POST /api/documents` 🔒

Upload a document file and attach it to a case.

**Roles:** Investigator, Senior Officer, Admin  
**Content-Type:** `multipart/form-data`

| Field | Type | Required | Notes |
|---|---|---|---|
| `file` | File | ✅ | PDF, JPG, PNG, DOC, DOCX — max 10 MB |
| `caseId` | string | ✅ | Human-readable case ID, e.g. `FIR-2026-001` |
| `name` | string | ✅ | Human-readable document name |
| `documentType` | string | ✅ | See enum below |
| `description` | string | No | Free text |

**`documentType` enum:** `FIR` · `Investigation Report` · `Witness Statement` · `Evidence` · `Court Order` · `Final Report` · `Other`

**Response `201`:**

```json
{
  "success": true,
  "data": {
    "id": "64f3...",
    "caseId": "FIR-2026-001",
    "name": "Autopsy Report - Victim A",
    "documentType": "Evidence",
    "description": "Post-mortem report dated 2026-08-21",
    "fileName": "autopsy_report.pdf",
    "mimeType": "application/pdf",
    "fileSize": 204800,
    "storageProvider": "local",
    "storageKey": "uploads/documents/1234567890-autopsy_report.pdf",
    "filePath": "/absolute/path/to/file",
    "uploadedBy": {
      "id": "64f3...",
      "fullName": "Priya Sharma",
      "email": "priya@janmitra.gov"
    },
    "createdAt": "2026-09-08T16:00:00.000Z",
    "updatedAt": "2026-09-08T16:00:00.000Z"
  }
}
```

**Errors:** `400` validation / invalid file type, `404` case not found

---

### `GET /api/documents` 🔒

List documents with optional filtering and pagination.

**Roles:** All authenticated  
**Query parameters:**

| Param | Type | Required | Notes |
|---|---|---|---|
| `caseId` | string | No | Filter by case ID (e.g. `FIR-2026-001`) |
| `documentType` | string | No | Filter by type |
| `search` | string | No | Searches `name`, `fileName`, `description` |
| `page` | integer | No | Default: `1` |
| `limit` | integer | No | Default: `20`, max: `100` |

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "documents": [ { ... }, { ... } ]
  }
}
```

---

### `GET /api/documents/:id` 🔒

Get metadata for a single document.

**Roles:** All authenticated  
**Response `200`:** `{ success: true, data: Document }`  
**Errors:** `404` not found

---

### `GET /api/documents/:id/download` 🔒

Download the physical file.

**Roles:** All authenticated  
**Response:** Binary file stream (`Content-Disposition: attachment`)  
**Errors:** `404` document not found, `404` physical file missing on server

> For cloud storage (S3), this endpoint will redirect (`302`) to a pre-signed URL instead of streaming the file directly.

---

### `PUT /api/documents/:id` 🔒

Update document metadata. Cannot replace the uploaded file — delete and re-upload for that.

**Roles:** Investigator, Senior Officer, Admin  
**Body (all optional):**

```json
{
  "name": "Updated name",
  "documentType": "Court Order",
  "description": "Updated description"
}
```

**Response `200`:** `{ success: true, data: UpdatedDocument }`  
**Errors:** `400` validation, `404` not found

---

### `DELETE /api/documents/:id` 🔒

Delete the DB record and the physical file.

**Roles:** Senior Officer, Admin  
**Response `200`:**

```json
{
  "success": true,
  "data": { "message": "Document deleted successfully" }
}
```

**Errors:** `404` not found

---

## 7. Users

> All user endpoints require `Admin` role.

### `GET /api/users` 🔒

List all users with optional filtering and pagination.

**Roles:** Admin only  
**Query parameters:**

| Param | Type | Required | Notes |
|---|---|---|---|
| `search` | string | No | Searches `fullName` and `email` |
| `role` | string | No | Filter by role |
| `page` | integer | No | Default: `1` |
| `limit` | integer | No | Default: `20`, max: `100` |

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "total": 12,
    "page": 1,
    "limit": 20,
    "users": [
      {
        "id": "64f3...",
        "fullName": "Priya Sharma",
        "email": "priya@janmitra.gov",
        "role": "Investigator",
        "createdAt": "...",
        "updatedAt": "..."
      }
    ]
  }
}
```

---

### `GET /api/users/:id` 🔒

Get a single user by MongoDB ObjectId.

**Roles:** Admin only  
**Response `200`:** `{ success: true, data: User }`  
**Errors:** `400` invalid ObjectId, `404` not found

---

### `PATCH /api/users/:id` 🔒

Update a user's `fullName` or `role`. Password changes are not supported here.

**Roles:** Admin only  
**Body (all optional):**

```json
{
  "fullName": "Priya S. Sharma",
  "role": "Senior Officer"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `fullName` | string | No | Non-empty |
| `role` | string | No | One of the five valid roles |

**Response `200`:** `{ success: true, data: UpdatedUser }`  
**Errors:** `400` validation, `404` not found

---

### `DELETE /api/users/:id` 🔒

Delete a user account permanently.

**Roles:** Admin only  
**Errors:** `400` cannot delete your own account, `404` not found

**Response `200`:**

```json
{
  "success": true,
  "data": { "message": "User \"Priya Sharma\" deleted successfully" }
}
```

---

## 8. Draft

> Per-user in-progress case registration. Powers the multi-step wizard in the frontend.

### `GET /api/draft` 🔒

Get the current user's saved draft.

**Roles:** All authenticated  
**Response `200`:** Draft object or empty default shape

---

### `PUT /api/draft` 🔒

Save (overwrite) the current user's draft.

**Roles:** All authenticated  
**Body:** Draft object (same shape as a Case minus `caseId` and `status`)

```json
{
  "title": "...",
  "date": "...",
  "time": "...",
  "location": "...",
  "category": "...",
  "description": "...",
  "people": [],
  "documents": []
}
```

**Response `200`:** Saved draft

---

### `DELETE /api/draft` 🔒

Clear the current user's draft (called after successful case submission).

**Roles:** All authenticated  
**Response `200`:** Empty draft object

---

## 9. Audit

> Read-only audit trail of system activity.

### `GET /api/audit` 🔒

Returns recent audit log entries.

**Roles:** Admin, Senior Officer (check `auditRoutes.js` for exact role config)  
**Response `200`:** Array of audit entries

```json
[
  {
    "id": "64f3...",
    "type": "login",
    "text": "User Priya Sharma logged in",
    "accessedBy": "Priya Sharma",
    "time": "2026-09-08T16:00:00.000Z",
    "createdAt": "..."
  }
]
```

**Audit event types:** `login` · `document` · `review` · `approval`

---

## 10. Health Check

### `GET /api/health`

Check server availability. No auth required.

**Response `200`:**

```json
{
  "status": "ok",
  "service": "kora-backend",
  "time": "2026-09-08T16:00:00.000Z"
}
```

---

## Appendix A — File Upload Notes

- **Allowed MIME types:** `application/pdf`, `image/jpeg`, `image/jpg`, `image/png`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **Max file size:** 10 MB
- **Storage:** Configured via `STORAGE_PROVIDER` env var (`local` or `S3`)
- **Local path:** `backend/uploads/documents/<timestamp>-<random>.<ext>`

## Appendix B — Authentication Flow

```
1. POST /api/auth/login   → receive { token }
2. Store token in memory or localStorage
3. Include header on all 🔒 requests:
      Authorization: Bearer <token>
4. Token expires after JWT_EXPIRES_IN (default: 7d)
5. On expiry, repeat from step 1
```

## Appendix C — Pagination

Paginated endpoints (`/api/documents`, `/api/users`) accept:

| Param | Default | Max |
|---|---|---|
| `page` | `1` | — |
| `limit` | `20` | `100` |

Response always includes `total`, `page`, and `limit` for the frontend to render pagination controls.
