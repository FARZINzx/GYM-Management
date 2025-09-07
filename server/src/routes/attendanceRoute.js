// routes/attendanceRoute.js
import express from "express";
import {
  checkInController,
  checkOutController,
  getTodayAttendanceController,
  getTodayAttendanceSummaryController,
} from "../controllers/attendanceController.js";

const router = express.Router();

router.post("/check-in", checkInController);
router.post("/check-out", checkOutController);
router.get("/today", getTodayAttendanceController);
router.get("/today-summary", getTodayAttendanceSummaryController);

export default router;
