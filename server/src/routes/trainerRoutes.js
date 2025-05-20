import { Router } from "express";
import {getTrainerProfile} from '../controllers/trainerController.js'

const router = Router()

router.get("/:id" , getTrainerProfile)

export default router 