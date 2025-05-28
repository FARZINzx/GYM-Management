import {Router} from 'express'
import {GetAllPersonnel, RegisterPersonnel} from '../controllers/personnelController.js'
import {body} from 'express-validator'

const router = Router()

router.get('/', GetAllPersonnel)

router.post('/register',
    [
        body('first_name').trim()
            .notEmpty().withMessage('First name is required')
            .isLength({min: 3}).withMessage('First name must be at least 3 characters')
            .isLength({max: 20}).withMessage('Maximum length is 20'),
        body('last_name').trim()
            .notEmpty().withMessage('Last name is required')
            .isLength({min: 3}).withMessage('Last name must be at least 3 characters')
            .isLength({max: 30}).withMessage('Maximum length is 20'),
        body('phone').notEmpty().withMessage('Phone is required'),
        body('birth_date').notEmpty().withMessage('Birth date is required'),
        body('salary').notEmpty().withMessage('Salary is required'),
        body('role_id').notEmpty().withMessage('Role is required'),
        body('address').notEmpty().withMessage('Address is required')
    ],
    RegisterPersonnel
)

export default router
