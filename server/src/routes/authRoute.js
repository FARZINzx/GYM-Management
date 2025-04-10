import {Router} from 'express'
import {body} from 'express-validator'
import {login} from '../controllers/authController.js';
const router = Router()

router.post(
     '/login',
     [
       body('username')
         .trim()
         .notEmpty().withMessage('Username is required')
         .isLength({ min: 3 }).withMessage('Username must be at least 3 characters')
         .matches(/^[a-z0-9_]+$/i).withMessage('Invalid username format'),
   
       body('password')
         .notEmpty().withMessage('Password is required')
         .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
     ],
     login
   );


export default router

