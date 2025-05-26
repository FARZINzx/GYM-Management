import {Router} from 'express'
import {GetAllPersonnel} from '../controllers/personnelController.js'

const router = Router()

router.get('/' , GetAllPersonnel)

export default router
