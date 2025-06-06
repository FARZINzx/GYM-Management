// controllers/attendanceController.js
import {
  checkInService,
  checkOutService,
  getTodayAttendanceService
} from "../services/attendanceService.js";

export async function checkInController(req, res, next) {
  try {
    const { employee_id } = req.body;
    if (!employee_id) {
      return res.status(400).json({ success: false, message: "Employee ID is required" });
    }
    
    const result = await checkInService(employee_id);
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
}

export async function checkOutController(req, res, next) {
  try {
    const { employee_id } = req.body;
    if (!employee_id) {
      return res.status(400).json({ success: false, message: "Employee ID is required" });
    }
    
    const result = await checkOutService(employee_id);
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getTodayAttendanceController(req, res, next) {
  try {
    const { employee_id } = req.query;
    if (!employee_id) {
      return res.status(400).json({ success: false, message: "Employee ID is required" });
    }
    
    const result = await getTodayAttendanceService(employee_id);
    res.status(result.status).json(result);
  } catch (error) {
    next(error);
  }
}