import { Router } from 'express';
import {body} from "express-validator";
import {registerController} from "../controllers/registerController.js";
import {getAllUsers} from "../controllers/userController.js";

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
    registerController
)

router.get("/" , getAllUsers)

export default router;