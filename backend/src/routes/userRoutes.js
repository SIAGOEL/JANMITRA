/**
 * userRoutes.js
 * ─────────────
 * User management endpoints — Admin only.
 *
 * RBAC matrix:
 *   GET    /api/users        → Admin
 *   GET    /api/users/:id    → Admin
 *   PATCH  /api/users/:id    → Admin
 *   DELETE /api/users/:id    → Admin
 *
 * Note: User creation is handled by POST /api/auth/register (open, or
 * invite-flow later). Password resets are handled separately via OTP routes.
 */

const express = require('express');
const { body, query } = require('express-validator');

const {
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

const validate       = require('../middleware/validate');
const { protect }    = require('../middleware/auth');
const { authorize }  = require('../middleware/authorize');

const VALID_ROLES = ['Admin', 'Senior Officer', 'Investigator', 'Clerk', 'Viewer'];

const router = express.Router();

// All user management routes require a valid JWT + Admin role.
router.use(protect);
router.use(authorize('Admin'));

// ─── GET /api/users ───────────────────────────────────────────────────────────
router.get(
  '/',
  [
    query('role').optional().isIn(VALID_ROLES).withMessage(`role must be one of: ${VALID_ROLES.join(', ')}`),
    query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1–100'),
  ],
  validate,
  listUsers
);

// ─── GET /api/users/:id ───────────────────────────────────────────────────────
router.get('/:id', getUserById);

// ─── PATCH /api/users/:id ─────────────────────────────────────────────────────
router.patch(
  '/:id',
  [
    body('fullName')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('fullName cannot be empty'),
    body('role')
      .optional()
      .isIn(VALID_ROLES)
      .withMessage(`role must be one of: ${VALID_ROLES.join(', ')}`),
  ],
  validate,
  updateUser
);

// ─── DELETE /api/users/:id ────────────────────────────────────────────────────
router.delete('/:id', deleteUser);

module.exports = router;
