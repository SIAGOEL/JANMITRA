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
    body("dateOfBirth").notEmpty().withMessage("Date of birth is required"),
    body("gender").notEmpty().withMessage("Gender is required"),
    body("govIdType").notEmpty().withMessage("Government ID type is required"),
    body("govIdNumber").notEmpty().withMessage("Government ID number is required"),
    body("address").notEmpty().withMessage("Address is required"),
    body("department").notEmpty().withMessage("Department is required"),
    body("designation").notEmpty().withMessage("Designation is required"),
    body("employeeId").notEmpty().withMessage("Employee ID is required"),
    body("jurisdiction").notEmpty().withMessage("Jurisdiction is required"),
    body("joiningDate").notEmpty().withMessage("Joining date is required"),
    body("supervisingOfficer").notEmpty().withMessage("Supervising officer is required"),
    body("officialEmail").isEmail().withMessage("Official email is required"),
    body("officialPhone").notEmpty().withMessage("Official phone is required"),
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
