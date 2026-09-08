/**
 * userController.js
 * ─────────────────
 * Admin-only CRUD for user management.
 * Password changes are intentionally excluded — use a dedicated reset flow.
 *
 * All responses use the { success, data } envelope.
 */

const User     = require('../models/User');
const Audit    = require('../models/Audit');
const ApiError = require('../utils/ApiError');

const VALID_ROLES = ['Admin', 'Senior Officer', 'Investigator', 'Clerk', 'Viewer'];

async function writeAudit(req, type, text) {
  try {
    await Audit.create({
      type,
      text,
      accessedBy:
        req.user?.fullName ||
        req.user?.email    ||
        'Unknown',
    });
  } catch (err) {
    console.error('Audit log error (non-fatal):', err.message);
  }
}

// ─── GET /api/users ───────────────────────────────────────────────────────────
// Query: ?search=&role=&page=&limit=
async function listUsers(req, res, next) {
  try {
    const {
      search = '',
      role,
      page  = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    if (role && VALID_ROLES.includes(role)) filter.role = role;

    if (search.trim()) {
      filter.$or = [
        { fullName: { $regex: search.trim(), $options: 'i' } },
        { email:    { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: {
        total,
        page:  Number(page),
        limit: Number(limit),
        users: users.map((u) => u.toJSON()),
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/users/:id ───────────────────────────────────────────────────────
async function getUserById(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, 'User not found');

    return res.json({
      success: true,
      data: user.toJSON(),
    });
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/users/:id ─────────────────────────────────────────────────────
// Updatable fields: fullName, role.
// Password is NOT updatable here — requires a dedicated reset flow.
async function updateUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, 'User not found');

    const { fullName, role } = req.body;

    if (fullName !== undefined) user.fullName = fullName.trim();
    if (role     !== undefined) user.role     = role;

    await user.save();

    await writeAudit(
      req,
      'approval',
      `User "${user.fullName}" (${user.email}) was updated by admin`
    );

    return res.json({
      success: true,
      data: user.toJSON(),
    });
  } catch (err) {
    next(err);
  }
}

// ─── DELETE /api/users/:id ────────────────────────────────────────────────────
async function deleteUser(req, res, next) {
  try {
    // Prevent admin from deleting their own account.
    if (String(req.params.id) === String(req.user._id)) {
      throw new ApiError(400, 'You cannot delete your own account');
    }

    const user = await User.findById(req.params.id);
    if (!user) throw new ApiError(404, 'User not found');

    const { fullName, email } = user;

    await User.findByIdAndDelete(req.params.id);

    await writeAudit(
      req,
      'approval',
      `User "${fullName}" (${email}) was deleted by admin`
    );

    return res.json({
      success: true,
      data: { message: `User "${fullName}" deleted successfully` },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
};
