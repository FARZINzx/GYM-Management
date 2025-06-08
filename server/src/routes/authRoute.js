import { Router } from "express";
import { body } from "express-validator";
import {
  login,
  getSecurityQuestion,
  verifySecurityAnswer,
  getAllSecurityQuestions,
  resetPassword,
} from "../controllers/authController.js";
const router = Router();

router.post(
  "/login",
  [
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters")
      .matches(/^[a-z0-9_]+$/i)
      .withMessage("Invalid username format"),

    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
  ],
  login,
);

// 🔐 1. Get security question by username
router.get("/forgot-password/:username", getSecurityQuestion);

router.get("/security-questions", getAllSecurityQuestions);

// 🔐 2. Verify answer and return password (or token)
router.post(
  "/verify-security-answer",
  [
    body("username").notEmpty().withMessage("Username is required"),
    body("answer").notEmpty().withMessage("Answer is required"),
  ],
  verifySecurityAnswer,
);

export default router;

router.post(
  "/reset-password/:userId",
  [
    body("newPassword")
      .notEmpty()
      .withMessage("رمز عبور جدید الزامی است")
      .isLength({ min: 8 })
      .withMessage("رمز عبور باید حداقل 8 کاراکتر باشد"),
  ],
  resetPassword,
);
