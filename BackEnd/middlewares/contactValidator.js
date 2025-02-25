import { body } from "express-validator";

export const validateContactUsForm = [
  // Full Name (Minimum length: 3)
  body("fullname")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Full name must be at least 3 characters long"),

  // Email Validation
  body("email").isEmail().withMessage("Invalid email address").normalizeEmail(),

  // Mobile Number Validation (India: 10 digits, US: 10 digits)
  body("phoneNumber")
    .matches(/^[6789]\d{9}$|^\d{10}$/)
    .withMessage("Invalid mobile number. It should be 10 digits"),

  // Password (Minimum length: 8)
  body("message")
    .isString()
    .isLength({ max: 500 })
    .withMessage("Message cannot exceed 500 characters"),
];
