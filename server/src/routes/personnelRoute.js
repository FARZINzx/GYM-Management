import { Router } from "express";
import {
  getAllPersonnel,
  registerPersonnel,
  getPersonnel,
  updatePersonnel,
  deletePersonnelController,
} from "../controllers/personnelController.js";
import { body } from "express-validator";

const router = Router();

router.get("/", getAllPersonnel);

router.get("/:id", getPersonnel);

router.put(
  "/:id",
  [
    body("first_name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("First name is required"),
    body("last_name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Last name is required"),
    body("phone")
      .optional()
      .isLength({ min: 11, max: 11 })
      .withMessage("Phone must be 11 digits"),
    body("birth_date").optional().isISO8601().withMessage("Invalid birth date"),
    body("salary")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("salary is required"),
    body("role_id").optional().isInt().withMessage("Invalid role ID"),
    body("address")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Address is required"),
    body("username")
      .optional()
      .trim()
      .isLength({ min: 3, max: 25 })
      .withMessage("Username must be between 3-25 characters"),
    body("password")
      .optional()
      .isLength({ min: 8, max: 20 })
      .withMessage("Password must be between 8-20 characters"),
    body("question_id")
      .optional()
      .isInt()
      .withMessage("Invalid security question ID"),
    body("question_answer")
      .optional()
      .isLength({ min: 2 })
      .withMessage("Answer must be at least 2 characters")
  ],
  updatePersonnel
);

router.post(
  "/register",
  [
    body("first_name")
      .trim()
      .notEmpty()
      .withMessage("First name is required")
      .isLength({ min: 3 })
      .withMessage("First name must be at least 3 characters")
      .isLength({ max: 20 })
      .withMessage("Maximum length is 20"),
    body("last_name")
      .trim()
      .notEmpty()
      .withMessage("Last name is required")
      .isLength({ min: 3 })
      .withMessage("Last name must be at least 3 characters")
      .isLength({ max: 30 })
      .withMessage("Maximum length is 20"),
    body("phone").notEmpty().withMessage("Phone is required"),
    body("birth_date").notEmpty().withMessage("Birth date is required"),
    body("salary").notEmpty().withMessage("Salary is required"),
    body("role_id").notEmpty().withMessage("Role is required"),
    body("address").notEmpty().withMessage("Address is required"),
    body("username")
      .trim()
      .isLength({ min: 3, max: 25 })
      .withMessage("Username must be between 3-25 characters"),
    body("password")
      .isLength({ min: 8, max: 20 })
      .withMessage("Password must be between 8-20 characters"),
    body("question_id")
      .isInt()
      .withMessage("Invalid security question ID"),
    body("question_answer")
      .isLength({ min: 2 })
      .withMessage("Answer must be at least 2 characters")
  ],
  registerPersonnel
);

router.delete("/:id", deletePersonnelController);

export default router;
