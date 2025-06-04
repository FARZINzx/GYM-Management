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
  ],
  updatePersonnel,
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
  ],
  registerPersonnel,
);

router.delete("/:id", deletePersonnelController);

export default router;
