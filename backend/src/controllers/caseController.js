const Case = require('../models/Case');
const Audit = require('../models/Audit');
const ApiError = require('../utils/ApiError');
const { generateCaseId } = require('../utils/caseId');
const { formatDisplayDate } = require('../utils/formatDate');

// Helper function for creating audit logs.
// Audit failure should not break the actual case operation.
async function createAuditLog(req, type, text) {
  try {
    const accessedBy =
      req.user?.fullName ||
      req.user?.name ||
      req.user?.email ||
      'Unknown';

    await Audit.create({
      type,
      text,
      accessedBy,
    });
  } catch (error) {
    console.error('Create audit log error:', error);
  }
}

// GET /api/cases   (optional query: ?search=&status=)
// Returns a raw array to match the frontend's getCases() return shape.
async function listCases(req, res, next) {
  try {
    const { search, status } = req.query;
    const filter = {};

    if (status && status !== 'All Status') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { caseId: { $regex: search, $options: 'i' } },
      ];
    }

    const cases = await Case.find(filter).sort({ createdAt: -1 });

    res.json(cases.map((c) => c.toJSON()));
  } catch (err) {
    next(err);
  }
}

// GET /api/cases/:id
// (:id is the FIR/complaint string, e.g. FIR-2023-089)
async function getCase(req, res, next) {
  try {
    const found = await Case.findOne({
      caseId: req.params.id,
    });

    if (!found) {
      throw new ApiError(404, 'Case not found');
    }

    res.json(found.toJSON());
  } catch (err) {
    next(err);
  }
}

// POST /api/cases
// Submits a completed registration - the assembled draft
async function createCase(req, res, next) {
  try {
    const b = req.body || {};

    // Generate a unique, human-readable case id.
    const prefix =
      b.prefix === 'CMP' || b.type === 'complaint'
        ? 'CMP'
        : 'FIR';

    let seq = (await Case.countDocuments()) + 1;
    let caseId = generateCaseId(prefix, seq);

    // Guard against collisions with seeded/edited ids.
    while (await Case.exists({ caseId })) {
      seq += 1;
      caseId = generateCaseId(prefix, seq);
    }

    const newCase = await Case.create({
      caseId,
      title: b.title,
      incidentDate: b.incidentDate || b.date || '',
      time: b.time || '',
      location: b.location || '',
      category: b.category || '',
      description: b.description || '',
      status: b.status || 'Pending',
      date: formatDisplayDate(),
      people: Array.isArray(b.people) ? b.people : [],
      documents: Array.isArray(b.documents) ? b.documents : [],
      createdBy: req.user ? req.user._id : undefined,
    });

    // Create audit entry.
    await createAuditLog(
      req,
      'document',
      `New case ${caseId} created`
    );

    res.status(201).json(newCase.toJSON());
  } catch (err) {
    next(err);
  }
}

// PATCH /api/cases/:id
// e.g. "Update Status" / "Close Case" quick actions
async function updateCase(req, res, next) {
  try {
    const allowed = [
      'title',
      'status',
      'location',
      'description',
      'category',
      'time',
      'incidentDate',
      'people',
      'documents',
    ];

    const updates = {};

    allowed.forEach((k) => {
      if (k in req.body) {
        updates[k] = req.body[k];
      }
    });

    const existing = await Case.findOne({
      caseId: req.params.id,
    });

    if (!existing) {
      throw new ApiError(404, 'Case not found');
    }

    const updated = await Case.findOneAndUpdate(
      { caseId: req.params.id },
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    // Status changes are recorded as review activity.
    if (
      updates.status !== undefined &&
      updates.status !== existing.status
    ) {
      await createAuditLog(
        req,
        'review',
        `Case ${req.params.id} moved from ${existing.status} to ${updates.status}`
      );
    } else {
      await createAuditLog(
        req,
        'review',
        `Case ${req.params.id} was updated`
      );
    }

    res.json(updated.toJSON());
  } catch (err) {
    next(err);
  }
}

// DELETE /api/cases/:id
async function deleteCase(req, res, next) {
  try {
    const deleted = await Case.findOneAndDelete({
      caseId: req.params.id,
    });

    if (!deleted) {
      throw new ApiError(404, 'Case not found');
    }

    // Record deletion in audit trail.
    await createAuditLog(
      req,
      'approval',
      `Case ${req.params.id} was deleted`
    );

    res.json({
      success: true,
      message: 'Case deleted',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listCases,
  getCase,
  createCase,
  updateCase,
  deleteCase,
};