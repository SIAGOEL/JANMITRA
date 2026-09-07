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

const router = express.Router();

// All case routes require authentication.
router.use(protect);

router.get('/', listCases);
router.get('/:id', getCase);

router.post(
  '/',
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
  [
    body('status').optional().isIn(STATUSES).withMessage('Invalid status'),
    body('category').optional().isIn(CATEGORIES).withMessage('Invalid category'),
  ],
  validate,
  updateCase
);

router.delete('/:id', deleteCase);

module.exports = router;
