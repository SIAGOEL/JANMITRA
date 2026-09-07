const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const Audit = require('../models/Audit');

function signToken(user) {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
}

// POST /api/auth/register
// Email OTP verification is temporarily disabled.
async function register(req, res, next) {
  try {
    const { fullName, email, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    // Check whether account already exists.
    const existing = await User.findOne({
      email: normalizedEmail,
    });

    if (existing) {
      throw new ApiError(
        409,
        'An account with this email already exists'
      );
    }

    // User.create() triggers the bcrypt pre-save hook
    // in User.js, so the password is hashed automatically.
    const user = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password,
    });

    const token = signToken(user);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(
        401,
        'Invalid email or password'
      );
    }

    const token = signToken(user);

    // Record login in audit trail.
    try {
      await Audit.create({
        type: 'login',
        text: `User ${user.fullName} logged in`,
        accessedBy: user.fullName,
      });
    } catch (auditError) {
      // Audit failure should not prevent successful login.
      console.error('Create audit log error:', auditError);
    }

    res.json({
      success: true,
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
async function me(req, res) {
  res.json({
    success: true,
    user: req.user.toJSON(),
  });
}

module.exports = {
  register,
  login,
  me,
};