const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },

    role: {
      type: String,
      enum: ['Admin', 'Senior Officer', 'Investigator', 'Clerk', 'Viewer'],
      default: 'Viewer',
      required: true,
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Remove sensitive fields when converting user to JSON
userSchema.set('toJSON', {
  transform(doc, ret) {
    ret.id = ret._id;

    delete ret._id;
    delete ret.__v;
    delete ret.password;

    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);