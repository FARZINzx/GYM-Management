import { Router } from 'express';
import { body } from 'express-validator';
import { 
    createRequestController,
    getAllRequestsController,
    getPendingRequestsController,
    processRequestController,
    getTrainerClientsController
} from '../controllers/clientRequestController.js';

const router = Router();

// Receptionist routes
router.post(
    '/',
    [
        body('client_phone').notEmpty().withMessage('Client phone is required'),
        body('service_id').isInt().withMessage('Service ID must be an integer'),
        body('notes').optional().isString()
    ],
    createRequestController
);

router.get('/', getAllRequestsController);

// Trainer routes
router.get('/pending', getPendingRequestsController);
router.put(
    '/:id/process',
    [
        body('status').isIn(['accepted', 'rejected']).withMessage('Invalid status')
    ],
    processRequestController
);

router.get('/trainer-clients', getTrainerClientsController);

export default router;