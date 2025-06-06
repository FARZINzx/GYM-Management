// services/attendanceService.js
import { getClient, query } from "../config/db.js";

export async function checkInService(employeeId) {
     const client = await getClient();
     try {
          await client.query("BEGIN");

          const today = new Date().toISOString().split('T')[0];
          const now = new Date().toISOString();

          // Verify employee exists
          const employeeCheck = await client.query(
               `SELECT id FROM employee WHERE id = $1 AND is_active = TRUE`,
               [employeeId]
          );

          if (employeeCheck.rows.length === 0) {
               throw new Error("Employee not found or inactive");
          }

          // Check if already checked in today
          const existing = await client.query(
               `SELECT * FROM employee_attendance 
       WHERE employee_id = $1 AND attendance_date = $2`,
               [employeeId, today]
          );

          if (existing.rows.length > 0) {
               throw new Error("You have already checked in today");
          }

          // Create new attendance record
          const { rows } = await client.query(
               `INSERT INTO employee_attendance 
       (employee_id, attendance_date, check_in_time, status)
       VALUES ($1, $2, $3, 'present')
       RETURNING *`,
               [employeeId, today, now]
          );

          await client.query("COMMIT");
          return {
               success: true,
               data: rows[0],
               message: "Check-in recorded successfully",
               status: 201
          };
     } catch (error) {
          await client.query("ROLLBACK");
          return {
               success: false,
               message: error.message,
               status: 400
          };
     } finally {
          client.release();
     }
}

export async function checkOutService(employeeId) {
     const client = await getClient();
     try {
          await client.query("BEGIN");

          const today = new Date().toISOString().split('T')[0];
          const now = new Date().toISOString();

          // Verify employee exists
          const employeeCheck = await client.query(
               `SELECT id FROM employee WHERE id = $1 AND is_active = TRUE`,
               [employeeId]
          );

          if (employeeCheck.rows.length === 0) {
               throw new Error("Employee not found or inactive");
          }

          // Get today's attendance record
          const { rows } = await client.query(
               `SELECT * FROM employee_attendance 
       WHERE employee_id = $1 AND attendance_date = $2`,
               [employeeId, today]
          );

          if (rows.length === 0) {
               throw new Error("You need to check in first");
          }

          if (rows[0].check_out_time) {
               throw new Error("You have already checked out today");
          }

          // Update with check-out time
          const updated = await client.query(
               `UPDATE employee_attendance 
       SET check_out_time = $1 , status = $3
       WHERE attendance_id = $2
       RETURNING *`,
               [now, rows[0].attendance_id , 'leave']
          );

          await client.query("COMMIT");
          return {
               success: true,
               data: updated.rows[0],
               message: "Check-out recorded successfully",
               status: 200
          };
     } catch (error) {
          await client.query("ROLLBACK");
          return {
               success: false,
               message: error.message,
               status: 400
          };
     } finally {
          client.release();
     }
}

export async function getTodayAttendanceService(employeeId) {
     try {
          const today = new Date().toISOString().split('T')[0];

          const { rows } = await query(
               `SELECT * FROM employee_attendance 
       WHERE employee_id = $1 AND attendance_date = $2`,
               [employeeId, today]
          );

          return {
               success: true,
               data: rows[0] || null,
               message: rows.length ? "Attendance record found" : "No attendance record today",
               status: 200
          };
     } catch (error) {
          return {
               success: false,
               message: error.message,
               status: 500
          };
     }
}