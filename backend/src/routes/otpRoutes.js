const express = require('express');
const { body } = require('express-validator');

const {
  sendOTP,
  verifyOTP,
} = require('../controllers/otpController');

const validate = require('../middleware/validate');

const router = express.Router();

router.post(
  '/send',
  [
    body('email')
      .isEmail()
      .withMessage('A valid email is required'),
  ],
  validate,
  sendOTP
);

router.post(
  '/verify',
  [
    body('email')
      .isEmail()
      .withMessage('A valid email is required'),

    body('otp')
      .isLength({ min: 6, max: 6 })
      .isNumeric()
      .withMessage('OTP must be 6 digits'),
  ],
  validate,
  verifyOTP
);

module.exports = router;