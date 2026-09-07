const jwt = require('jsonwebtoken');
const User = require('../models/User');
const EmailOTP = require('../models/EmailOTP');
const ApiError = require('../utils/ApiError');

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
async function register(req, res, next) {
  try {
    const { fullName, email, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    // Make sure the email was actually verified.
    const verifiedEmail = await EmailOTP.findOne({
      email: normalizedEmail,
      verified: true,
    });

    if (!verifiedEmail) {
      throw new ApiError(
        403,
        'Email address must be verified before registration'
      );
    }

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

    // The verified OTP record is no longer needed.
    await EmailOTP.deleteOne({
      _id: verifiedEmail._id,
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