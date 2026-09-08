/**
 * documentRoutes.js
 * ─────────────────
 * All routes require a valid JWT (protect middleware).
 * Role-based access is enforced per-route via authorize().
 *
 * RBAC matrix for documents:
 *   Upload         → Investigator, Senior Officer, Admin
 *   Read / Download → all authenticated roles (Viewer, Clerk, Investigator, Senior Officer, Admin)
 *   Update         → Investigator, Senior Officer, Admin
 *   Delete         → Senior Officer, Admin
 */

const express = require('express');
const { body, query } = require('express-validator');

const {
  uploadDocument,
  getDocuments,
  getDocumentById,
  downloadDocument,
  updateDocument,
  deleteDocument,
} = require('../controllers/documentController');

const { DOCUMENT_TYPES } = require('../models/Document');
const upload             = require('../middleware/documentupload');
const validate           = require('../middleware/validate');
const { protect }        = require('../middleware/auth');
const { authorize }      = require('../middleware/authorize');

const router = express.Router();

// All document routes require a valid JWT.
router.use(protect);

// ─── POST /api/documents ──────────────────────────────────────────────────────
// Uploads a new document file attached to a case.
router.post(
  '/',
  authorize('Investigator', 'Senior Officer', 'Admin'),
  upload.single('file'),
  [
    body('caseId')
      .trim()
      .notEmpty()
      .withMessage('caseId is required'),
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Document name is required'),
    body('documentType')
      .notEmpty()
      .withMessage('documentType is required')
      .isIn(DOCUMENT_TYPES)
      .withMessage(`documentType must be one of: ${DOCUMENT_TYPES.join(', ')}`),
    body('description')
      .optional()
      .isString()
      .withMessage('description must be a string'),
  ],
  validate,
  uploadDocument
);

// ─── GET /api/documents ───────────────────────────────────────────────────────
// Lists documents, optionally filtered by caseId / documentType / search.
router.get(
  '/',
  authorize('Viewer', 'Clerk', 'Investigator', 'Senior Officer', 'Admin'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1–100'),
  ],
  validate,
  getDocuments
);

// ─── GET /api/documents/:id/download ─────────────────────────────────────────
// Download the physical file. The /:id/download route must come before /:id.
router.get(
  '/:id/download',
  authorize('Viewer', 'Clerk', 'Investigator', 'Senior Officer', 'Admin'),
  downloadDocument
);

// ─── GET /api/documents/:id ───────────────────────────────────────────────────
// Returns document metadata (does NOT stream the file).
router.get(
  '/:id',
  authorize('Viewer', 'Clerk', 'Investigator', 'Senior Officer', 'Admin'),
  getDocumentById
);

// ─── PUT /api/documents/:id ───────────────────────────────────────────────────
// Update metadata (name, documentType, description). Cannot change the file itself.
router.put(
  '/:id',
  authorize('Investigator', 'Senior Officer', 'Admin'),
  [
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('name cannot be empty'),
    body('documentType')
      .optional()
      .isIn(DOCUMENT_TYPES)
      .withMessage(`documentType must be one of: ${DOCUMENT_TYPES.join(', ')}`),
    body('description')
      .optional()
      .isString()
      .withMessage('description must be a string'),
  ],
  validate,
  updateDocument
);

// ─── DELETE /api/documents/:id ────────────────────────────────────────────────
// Deletes both the DB record and the physical file.
router.delete(
  '/:id',
  authorize('Senior Officer', 'Admin'),
  deleteDocument
);

module.exports = router;