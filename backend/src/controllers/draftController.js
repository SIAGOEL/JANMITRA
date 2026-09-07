const Draft = require('../models/Draft');

// The empty draft shape returned when nothing is saved yet.
// Mirrors the frontend's getDraft() default exactly.
const EMPTY_DRAFT = {
  title: '',
  date: '',
  time: '',
  location: '',
  category: '',
  description: '',
  people: [],
  documents: [],
};

// GET /api/draft   (current user's in-progress draft)
async function getDraft(req, res, next) {
  try {
    const draft = await Draft.findOne({ user: req.user._id });
    if (!draft) return res.json(EMPTY_DRAFT);
    res.json(draft.toJSON());
  } catch (err) {
    next(err);
  }
}

// PUT /api/draft   (create or update the current user's draft)
async function saveDraft(req, res, next) {
  try {
    const b = req.body || {};
    const fields = {
      title: b.title || '',
      date: b.date || '',
      time: b.time || '',
      location: b.location || '',
      category: b.category || '',
      description: b.description || '',
      people: Array.isArray(b.people) ? b.people : [],
      documents: Array.isArray(b.documents) ? b.documents : [],
    };

    const draft = await Draft.findOneAndUpdate(
      { user: req.user._id },
      { $set: fields, user: req.user._id },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json(draft.toJSON());
  } catch (err) {
    next(err);
  }
}

// DELETE /api/draft   (clear after submit)
async function clearDraft(req, res, next) {
  try {
    await Draft.findOneAndDelete({ user: req.user._id });
    res.json(EMPTY_DRAFT);
  } catch (err) {
    next(err);
  }
}

module.exports = { getDraft, saveDraft, clearDraft };
