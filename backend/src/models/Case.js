const mongoose = require('mongoose');

// Expose `id` (from _id) and drop mongoose internals on embedded docs,
// matching the frontend's `person.id` / `document.id` usage.
const subTransform = {
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
};

// A person connected to a case: witness / victim / suspect / etc. (Step 2 - People)
const personSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    relationship: {
      type: String,
      enum: ['Victim', 'Witness', 'Suspect', 'Reporting Person', 'Other'],
      required: true,
    },
    contact: { type: String, default: '' },
    address: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { _id: true, toJSON: subTransform }
);

// A supporting document (Step 4 - Documents). Stored as a base64 data URL to match the frontend.
const documentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, default: 'FILE' }, // e.g. PDF, JPG
    size: { type: String, default: '' }, // e.g. "2.3 MB"
    dataUrl: { type: String, default: '' }, // base64 data URL
    category: { type: String, default: 'FIR Copy' },
  },
  { _id: true, toJSON: subTransform }
);

const CATEGORIES = ['Theft', 'Assault', 'Fraud', 'Property Dispute', 'Cyber Crime', 'Other', ''];
const STATUSES = ['Active', 'Pending', 'Closed'];

const caseSchema = new mongoose.Schema(
  {
    // Human-readable FIR/complaint id, e.g. "FIR-2024-089". The frontend treats this as `id`.
    caseId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: [true, 'Incident title is required'], trim: true },
    incidentDate: { type: String, default: '' }, // YYYY-MM-DD from Step 1's <input type="date">
    time: { type: String, default: '' },
    location: { type: String, default: '' },
    category: { type: String, enum: CATEGORIES, default: '' },
    description: { type: String, default: '' },
    status: { type: String, enum: STATUSES, default: 'Pending' },
    date: { type: String, default: '' }, // display date shown in tables, e.g. "Aug 26, 2026"
    people: { type: [personSchema], default: [] },
    documents: { type: [documentSchema], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

caseSchema.set('toJSON', {
  transform(doc, ret) {
    ret.id = ret.caseId; // frontend keys/routes use the FIR string as `id`
    delete ret._id;
    delete ret.__v;
    delete ret.caseId;
    return ret;
  },
});

module.exports = mongoose.model('Case', caseSchema);
module.exports.CATEGORIES = CATEGORIES;
module.exports.STATUSES = STATUSES;
