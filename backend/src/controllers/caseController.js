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

// GET /api/cases
// Optional query: ?search=&status=
async function listCases(req, res, next) {
  try {
    const { search, status } = req.query;
    const filter = {};

    // Admin and Senior Officer can see all cases.
    // Other roles can only see cases they created.
    if (
      req.user.role !== 'Admin' &&
      req.user.role !== 'Senior Officer'
    ) {
      filter.createdBy = req.user._id;
    }

    if (status && status !== 'All Status') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { caseId: { $regex: search, $options: 'i' } },
      ];
    }

    const cases = await Case.find(filter).sort({
      createdAt: -1,
    });

    res.json(cases.map((c) => c.toJSON()));
  } catch (err) {
    next(err);
  }
}

// GET /api/cases/:id
async function getCase(req, res, next) {
  try {
    const found = await Case.findOne({
      caseId: req.params.id,
    });

    if (!found) {
      throw new ApiError(404, 'Case not found');
    }

    // Admin and Senior Officer can access every case.
    // Other roles can only access cases they created.
    if (
      req.user.role !== 'Admin' &&
      req.user.role !== 'Senior Officer' &&
      String(found.createdBy) !== String(req.user._id)
    ) {
      throw new ApiError(
        403,
        'You do not have permission to access this case'
      );
    }

    // Record case view in audit trail.
    await createAuditLog(
      req,
      'review',
      `Case ${req.params.id} was viewed`
    );

    res.json(found.toJSON());
  } catch (err) {
    next(err);
  }
}

// POST /api/cases
async function createCase(req, res, next) {
  try {
    const b = req.body || {};

    // Generate a unique, human-readable case ID.
    const prefix =
      b.prefix === 'CMP' || b.type === 'complaint'
        ? 'CMP'
        : 'FIR';

    let seq = (await Case.countDocuments()) + 1;
    let caseId = generateCaseId(prefix, seq);

    // Guard against case ID collisions.
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

      // Store who created the case.
      createdBy: req.user._id,
    });

    // Record case creation in audit trail.
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

    allowed.forEach((key) => {
      if (key in req.body) {
        updates[key] = req.body[key];
      }
    });

    const existingCase = await Case.findOne({
      caseId: req.params.id,
    });

    if (!existingCase) {
      throw new ApiError(404, 'Case not found');
    }

    // Admin and Senior Officer can update any case.
    // Other roles can only update cases they created.
    if (
      req.user.role !== 'Admin' &&
      req.user.role !== 'Senior Officer' &&
      String(existingCase.createdBy) !== String(req.user._id)
    ) {
      throw new ApiError(
        403,
        'You do not have permission to update this case'
      );
    }

    const updated = await Case.findOneAndUpdate(
      { caseId: req.params.id },
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updated) {
      throw new ApiError(404, 'Case not found');
    }

    // Record status changes separately as review activity.
    if (
      updates.status !== undefined &&
      updates.status !== existingCase.status
    ) {
      await createAuditLog(
        req,
        'review',
        `Case ${req.params.id} moved from ${existingCase.status} to ${updates.status}`
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
    const existingCase = await Case.findOne({
      caseId: req.params.id,
    });

    if (!existingCase) {
      throw new ApiError(404, 'Case not found');
    }

    // Only Admin and Senior Officer can delete cases.
    if (
      req.user.role !== 'Admin' &&
      req.user.role !== 'Senior Officer'
    ) {
      throw new ApiError(
        403,
        'You do not have permission to delete this case'
      );
    }

    await Case.findOneAndDelete({
      caseId: req.params.id,
    });

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