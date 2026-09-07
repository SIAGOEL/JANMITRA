const express = require("express");
const { body } = require("express-validator");
const { register, login, me } = require("../controllers/authController");
const validate = require("../middleware/validate");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post(
  "/register",
  [
    body("fullName").trim().notEmpty().withMessage("Full name is required"),
    body("email").isEmail().withMessage("A valid email is required"),
    body("password")
      .matches(/^\d{8}$/)
      .withMessage("Password must contain exactly 8 digits"),
  ],
  validate,
  register,
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("A valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  login,
);

router.get("/me", protect, me);

module.exports = router;
