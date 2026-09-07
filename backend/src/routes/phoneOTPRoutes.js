const express = require("express");
const { body } = require("express-validator");

const {
  sendPhoneOTP,
  verifyPhoneOTP,
} = require("../controllers/phoneOTPController");

const validate = require("../middleware/validate");

const router = express.Router();

// Send phone OTP
router.post(
  "/send",
  [
    body("phone")
      .notEmpty()
      .withMessage("Phone number is required"),
  ],
  validate,
  sendPhoneOTP
);

// Verify phone OTP
router.post(
  "/verify",
  [
    body("phone")
      .notEmpty()
      .withMessage("Phone number is required"),

    body("otp")
      .isLength({ min: 6, max: 6 })
      .isNumeric()
      .withMessage("OTP must be 6 digits"),
  ],
  validate,
  verifyPhoneOTP
);

module.exports = router;