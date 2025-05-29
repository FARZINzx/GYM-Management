import {Router} from 'express';
import {getAllRole} from '../controllers/roleConroller.js'

const router = Router();

router.get('/' , getAllRole)

export default router