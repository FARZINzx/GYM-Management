import {Router} from 'express'
import {getAllPersonnel} from '../controllers/personnelController.js'

const router = Router()

router.get('/' , getAllPersonnel)
