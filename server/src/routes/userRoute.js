import { Router } from 'express';
import {body} from "express-validator";
import {registerController} from "../controllers/registerController.js";
import {getAllUsers , getUser , updateUserController as updateUser} from "../controllers/userController.js";

const router = Router();

router.post(
    "/register" ,
    [
        body('first_name').trim().notEmpty().withMessage('First name is required'),
        body('last_name').trim().notEmpty().withMessage('Last name is required'),
        body('phone').notEmpty().withMessage('Phone is required'),
        body('birth_date').notEmpty().withMessage('birth_date is required'),
        body('gender').isIn(['male', 'female', 'other']).withMessage('Gender must be valid'),
        body('weight_kg').isFloat({ gt: 0 }).withMessage('Weight must be greater than 0'),
        body('height_cm').isFloat({ gt: 0 }).withMessage('Height must be greater than 0'),
        body('trainer_id').optional().isInt().withMessage('Trainer ID must be an integer'),
    ],
    registerController)

router.get("/" , getAllUsers)

router.put(
    "/:id",
    [
        body('first_name').optional().trim().notEmpty().withMessage('First name is required'),
        body('last_name').optional().trim().notEmpty().withMessage('Last name is required'),
        body('phone').optional().isLength({ min: 11, max: 11 }).withMessage('Phone must be 11 digits'),
        body('birth_date').optional().isISO8601().withMessage('Invalid birth date'),
        body('gender').optional().isIn(['male', 'female']).withMessage('Invalid gender'),
        body('weight_kg').optional().isFloat({ gt: 0 }).withMessage('Weight must be greater than 0'),
        body('height_cm').optional().isFloat({ gt: 0 }).withMessage('Height must be greater than 0'),
        body('trainer_id').optional().isInt().withMessage('Invalid trainer ID'),
        body('is_fee_paid').optional().isBoolean().withMessage('Invalid fee status')
    ],
    updateUser
);

router.get("/:id" , getUser)

export default router;