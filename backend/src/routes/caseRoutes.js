const express = require('express');
const { body } = require('express-validator');
const {
  listCases,
  getCase,
  createCase,
  updateCase,
  deleteCase,
} = require('../controllers/caseController');
const { CATEGORIES, STATUSES } = require('../models/Case');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

const router = express.Router();

// All case routes require authentication.
router.use(protect);

router.get(
  '/',
  authorize('Admin', 'Senior Officer', 'Investigator', 'Clerk', 'Viewer'),
  listCases
);

router.get(
  '/:id',
  authorize('Admin', 'Senior Officer', 'Investigator', 'Clerk', 'Viewer'),
  getCase
);

router.post(
  '/',
  authorize('Admin', 'Senior Officer', 'Investigator'),
  [
    body('title').trim().notEmpty().withMessage('Incident title is required'),
    body('category').optional().isIn(CATEGORIES).withMessage('Invalid category'),
    body('status').optional().isIn(STATUSES).withMessage('Invalid status'),
  ],
  validate,
  createCase
);

router.patch(
  '/:id',
  authorize('Admin', 'Senior Officer', 'Investigator'),
  [
    body('status').optional().isIn(STATUSES).withMessage('Invalid status'),
    body('category').optional().isIn(CATEGORIES).withMessage('Invalid category'),
  ],
  validate,
  updateCase
);

router.delete(
  '/:id',
  authorize('Admin', 'Senior Officer'),
  deleteCase
);

module.exports = router;
