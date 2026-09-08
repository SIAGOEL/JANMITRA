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
    const {
      fullName,
      email,
      password,
      dateOfBirth,
      gender,
      govIdType,
      govIdNumber,
      address,
      department,
      designation,
      employeeId,
      jurisdiction,
      joiningDate,
      supervisingOfficer,
      officialEmail,
      officialPhone,
    } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await User.findOne({
      email: normalizedEmail,
    });

    if (existing) {
      throw new ApiError(
        409,
        'An account with this email already exists'
      );
    }

    const user = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password,
      dateOfBirth: dateOfBirth?.trim() || '',
      gender: gender?.trim() || '',
      govIdType: govIdType?.trim() || '',
      govIdNumber: govIdNumber?.trim() || '',
      address: address?.trim() || '',
      department: department?.trim() || '',
      designation: designation?.trim() || '',
      employeeId: employeeId?.trim() || '',
      jurisdiction: jurisdiction?.trim() || '',
      joiningDate: joiningDate?.trim() || '',
      supervisingOfficer: supervisingOfficer?.trim() || '',
      officialEmail: (officialEmail || normalizedEmail).trim().toLowerCase(),
      officialPhone: officialPhone?.trim() || '',
    });

    try {
      await Audit.create({
        type: 'registration',
        text: `New user ${user.fullName} registered successfully`,
        accessedBy: user.fullName,
      });
    } catch (auditError) {
      console.error('Create registration audit log error:', auditError);
    }

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