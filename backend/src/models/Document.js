const mongoose = require('mongoose');

/**
 * Standalone Document model — used by the DMS layer.
 *
 * Relationship strategy
 * ─────────────────────
 * Cases are identified everywhere by their human-readable string caseId
 * (e.g. "FIR-2024-089"), NOT by their MongoDB _id.  To stay consistent with
 * caseController.js and the frontend, this model stores caseId as a plain
 * indexed string.  A shadow caseObjectId field is also persisted so that
 * Mongoose populate() can be used when needed.
 *
 * Storage strategy
 * ────────────────
 * Currently supports 'local' disk storage.  The storageProvider + storageKey
 * fields are reserved for future cloud migration (S3, GCS, etc.).
 * When STORAGE_PROVIDER=S3, storageKey holds the S3 object key and filePath
 * becomes a signed URL or is left empty.  Switching providers requires only
 * changing storageService.js — no model migration needed.
 */

const DOCUMENT_TYPES = [
  'FIR',
  'Investigation Report',
  'Witness Statement',
  'Evidence',
  'Court Order',
  'Final Report',
  'Other',
];

const STORAGE_PROVIDERS = ['local', 'S3', 'GCS'];

const documentSchema = new mongoose.Schema(
  {
    // Human-readable case id (e.g. "FIR-2024-089") — indexed for fast lookup.
    caseId: {
      type: String,
      required: [true, 'caseId is required'],
      trim: true,
      index: true,
    },

    // Shadow ObjectId — populated from Case._id when the doc is created.
    // Allows Mongoose .populate('caseObjectId') if needed.
    caseObjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Case',
    },

    // Human-facing document name (e.g. "Autopsy Report - Victim A").
    name: {
      type: String,
      required: [true, 'Document name is required'],
      trim: true,
    },

    // Classification of the document.
    documentType: {
      type: String,
      required: [true, 'Document type is required'],
      enum: {
        values: DOCUMENT_TYPES,
        message: `documentType must be one of: ${DOCUMENT_TYPES.join(', ')}`,
      },
    },

    // Optional free-text description.
    description: {
      type: String,
      trim: true,
      default: '',
    },

    // ── File metadata ─────────────────────────────────────────────────────
    // Original filename as uploaded by the user.
    fileName: {
      type: String,
      required: [true, 'fileName is required'],
    },

    // MIME type (e.g. "application/pdf", "image/jpeg").
    mimeType: {
      type: String,
      required: [true, 'mimeType is required'],
    },

    // File size in bytes.
    fileSize: {
      type: Number,
      required: [true, 'fileSize is required'],
      min: [1, 'fileSize must be greater than 0'],
    },

    // ── Storage information ───────────────────────────────────────────────
    // Which provider holds this file: 'local' | 'S3' | 'GCS'.
    storageProvider: {
      type: String,
      enum: STORAGE_PROVIDERS,
      default: 'local',
    },

    // LOCAL: relative path on disk, e.g. "uploads/documents/1234-foo.pdf".
    // S3/GCS: full object key, e.g. "documents/case-FIR-2024-089/1234-foo.pdf".
    storageKey: {
      type: String,
      default: '',
    },

    // Convenience URL or absolute local path — derived at read time by
    // storageService.getUrl(doc).  Not authoritative; storageKey is.
    filePath: {
      type: String,
      default: '',
    },

    // ── Relationships ─────────────────────────────────────────────────────
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Clean up the JSON representation sent to clients.
documentSchema.set('toJSON', {
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('Document', documentSchema);
module.exports.DOCUMENT_TYPES = DOCUMENT_TYPES;