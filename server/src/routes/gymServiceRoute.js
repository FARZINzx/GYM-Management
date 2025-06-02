import { Router } from "express";
import {
  createServiceController,
  getServicesController,
  updateServiceController,
  deleteServiceController,
} from "../controllers/gymServiceController.js";
import { body } from "express-validator";

const router = Router();

router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Service name is required"),
    body("amount")
      .isFloat({ min: 0 })
      .withMessage("Amount must be a positive number"),
    body("duration_minutes").optional().isInt({ min: 1 }),
    body("icon").optional().isString().withMessage("Icon must be a string"),
  ],
  createServiceController,
);

router.get("/", getServicesController);

router.put("/:id", updateServiceController);

router.delete("/:id", deleteServiceController);

export default router;
