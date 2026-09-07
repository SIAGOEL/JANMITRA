const express = require('express');
const { getDraft, saveDraft, clearDraft } = require('../controllers/draftController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All draft routes require authentication (draft is scoped per user).
router.use(protect);

router.get('/', getDraft);
router.put('/', saveDraft);
router.delete('/', clearDraft);

module.exports = router;
