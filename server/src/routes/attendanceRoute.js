// routes/attendanceRoute.js
import express from "express";
import {
  checkInController,
  checkOutController,
  getTodayAttendanceController
} from "../controllers/attendanceController.js";

const router = express.Router();

router.post("/check-in", checkInController);
router.post("/check-out", checkOutController);
router.get("/today", getTodayAttendanceController);

export default router;