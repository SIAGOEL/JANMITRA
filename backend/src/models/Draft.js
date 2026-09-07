const mongoose = require('mongoose');

// One in-progress case-registration draft per user (mirrors the frontend's single
// `kora_draft` localStorage entry, but scoped to the logged-in user).
const draftSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    title: { type: String, default: '' },
    date: { type: String, default: '' }, // incident date (YYYY-MM-DD)
    time: { type: String, default: '' },
    location: { type: String, default: '' },
    category: { type: String, default: '' },
    description: { type: String, default: '' },
    // Kept as flexible arrays so the stored shape matches whatever the frontend sends.
    people: { type: Array, default: [] },
    documents: { type: Array, default: [] },
  },
  { timestamps: true }
);

draftSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret._id;
    delete ret.__v;
    delete ret.user;
    delete ret.createdAt;
    delete ret.updatedAt;
    return ret;
  },
});

module.exports = mongoose.model('Draft', draftSchema);
