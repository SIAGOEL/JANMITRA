/**
 * documentController.js
 * ─────────────────────
 * CRUD handlers for the standalone Document collection.
 *
 * Storage I/O is fully delegated to storageService.js — no fs.* calls here.
 * All responses follow the { success, data } envelope used by the new endpoints,
 * except errors which are forwarded to the central errorHandler via next(err).
 */

const Document = require('../models/Document');
const Case     = require('../models/Case');
const Audit    = require('../models/Audit');
const ApiError = require('../utils/ApiError');
const storage  = require('../services/storageService');

// ─── Helpers ────────────────────────────────────────────────────────────────

async function writeAudit(req, type, text) {
  try {
    await Audit.create({
      type,
      text,
      accessedBy:
        req.user?.fullName ||
        req.user?.name    ||
        req.user?.email   ||
        'Unknown',
    });
  } catch (err) {
    console.error('Audit log error (non-fatal):', err.message);
  }
}

// ─── POST /api/documents ─────────────────────────────────────────────────────
// Body (multipart/form-data): caseId, name, documentType, description?
// File field: "file"

async function uploadDocument(req, res, next) {
  let multerFile = req.file; // keep ref for cleanup on error

  try {
    const { caseId, name, documentType, description = '' } = req.body;

    // Validation is handled upstream by express-validator + validate middleware.
    // Here we only do DB-level checks.

    // Verify the case exists (look up by the string caseId, not ObjectId).
    const caseDoc = await Case.findOne({ caseId });
    if (!caseDoc) {
      // Clean up the uploaded temp file before responding.
      if (multerFile) await storage.deleteFile({ filePath: multerFile.path, storageKey: '' });
      throw new ApiError(404, `Case "${caseId}" not found`);
    }

    // Persist file via storage service.
    const { storageProvider, storageKey, filePath } = await storage.saveFile(multerFile);

    const document = await Document.create({
      caseId,
      caseObjectId: caseDoc._id,
      name,
      documentType,
      description,
      fileName:        multerFile.originalname,
      mimeType:        multerFile.mimetype,
      fileSize:        multerFile.size,
      storageProvider,
      storageKey,
      filePath,
      uploadedBy:      req.user?._id,
    });

    await writeAudit(req, 'document', `Document uploaded to case ${caseId}: "${name}"`);

    return res.status(201).json({
      success: true,
      data: document.toJSON(),
    });
  } catch (err) {
    // If we got a multer file but something failed after upload, clean it up.
    if (multerFile) {
      try { await storage.deleteFile({ filePath: multerFile.path, storageKey: '' }); } catch (_) {}
    }
    next(err);
  }
}

// ─── GET /api/documents ───────────────────────────────────────────────────────
// Query: ?caseId=&documentType=&search=&page=&limit=

async function getDocuments(req, res, next) {
  try {
    const {
      caseId,
      documentType,
      search = '',
      page  = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    if (caseId)       filter.caseId = caseId;
    if (documentType) filter.documentType = documentType;

    if (search.trim()) {
      filter.$or = [
        { name:        { $regex: search.trim(), $options: 'i' } },
        { fileName:    { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const skip       = (Number(page) - 1) * Number(limit);
    const [documents, total] = await Promise.all([
      Document.find(filter)
        .populate('caseObjectId', 'caseId title')
        .populate('uploadedBy', 'fullName email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Document.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: {
        total,
        page:  Number(page),
        limit: Number(limit),
        documents: documents.map((d) => d.toJSON()),
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/documents/:id ───────────────────────────────────────────────────

async function getDocumentById(req, res, next) {
  try {
    const document = await Document.findById(req.params.id)
      .populate('caseObjectId', 'caseId title status')
      .populate('uploadedBy', 'fullName email role');

    if (!document) throw new ApiError(404, 'Document not found');

    await writeAudit(req, 'review', `Document "${document.name}" was viewed`);

    return res.json({
      success: true,
      data: document.toJSON(),
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/documents/:id/download ─────────────────────────────────────────

async function downloadDocument(req, res, next) {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) throw new ApiError(404, 'Document not found');

    const filePath = storage.getUrl(document);

    // For local storage, res.download() serves the file.
    // For cloud storage, storageService.getUrl() would return a signed URL
    // and you'd redirect: res.redirect(filePath)
    if (document.storageProvider === 'local') {
      const fs = require('fs');
      if (!fs.existsSync(filePath)) {
        throw new ApiError(404, 'Physical file not found on server — it may have been deleted manually');
      }
      await writeAudit(req, 'document', `Document downloaded: "${document.name}"`);
      return res.download(filePath, document.fileName);
    }

    // Cloud provider: redirect to pre-signed URL.
    await writeAudit(req, 'document', `Document downloaded: "${document.name}"`);
    return res.redirect(filePath);
  } catch (err) {
    next(err);
  }
}

// ─── PUT /api/documents/:id ───────────────────────────────────────────────────
// Body: { name?, documentType?, description? }

async function updateDocument(req, res, next) {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) throw new ApiError(404, 'Document not found');

    const allowed = ['name', 'documentType', 'description'];
    allowed.forEach((key) => {
      if (key in req.body) document[key] = req.body[key];
    });

    await document.save();

    await writeAudit(req, 'document', `Document updated: "${document.name}"`);

    return res.json({
      success: true,
      data: document.toJSON(),
    });
  } catch (err) {
    next(err);
  }
}

// ─── DELETE /api/documents/:id ───────────────────────────────────────────────

async function deleteDocument(req, res, next) {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) throw new ApiError(404, 'Document not found');

    const documentName = document.name;

    await storage.deleteFile(document);
    await Document.findByIdAndDelete(req.params.id);

    await writeAudit(req, 'document', `Document deleted: "${documentName}"`);

    return res.json({
      success: true,
      data: { message: 'Document deleted successfully' },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  uploadDocument,
  getDocuments,
  getDocumentById,
  downloadDocument,
  updateDocument,
  deleteDocument,
};