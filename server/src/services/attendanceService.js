// services/attendanceService.js
import { getClient, query } from "../config/db.js";

function getTimeDifferenceInMinutes(checkInTime, checkOutTime) {
  const checkIn = new Date(checkInTime);
  const checkOut = new Date(checkOutTime);
  return (checkOut - checkIn) / (1000 * 60); // Difference in minutes
}

// Modified checkInService without schema changes
export async function checkInService(employeeId) {
  const client = await getClient();
  try {
    await client.query("BEGIN");

    const today = new Date().toISOString().split("T")[0];
    const now = new Date().toISOString();

    // Verify employee exists
    const employeeCheck = await client.query(
      `SELECT id FROM employee WHERE id = $1 AND is_active = TRUE`,
      [employeeId],
    );

    if (employeeCheck.rows.length === 0) {
      throw new Error("Employee not found or inactive");
    }

    // Create new attendance record (allow multiple per day)
    const { rows } = await client.query(
      `INSERT INTO employee_attendance 
       (employee_id, attendance_date, check_in_time, status)
       VALUES ($1, $2, $3, 'present')
       RETURNING *`,
      [employeeId, today, now],
    );

    await client.query("COMMIT");
    return {
      success: true,
      data: rows[0],
      message: "Check-in recorded successfully",
      status: 201,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    return {
      success: false,
      message: error.message,
      status: 400,
    };
  } finally {
    client.release();
  }
}

// Modified checkOutService
export async function checkOutService(employeeId, recordId = null) {
  const client = await getClient();
  try {
    await client.query("BEGIN");

    const today = new Date().toISOString().split("T")[0];
    const now = new Date().toISOString();

    // Verify employee exists
    const employeeCheck = await client.query(
      `SELECT id FROM employee WHERE id = $1 AND is_active = TRUE`,
      [employeeId],
    );

    if (employeeCheck.rows.length === 0) {
      throw new Error("Employee not found or inactive");
    }

    let recordToUpdate;
    if (recordId) {
      // Update specific record
      recordToUpdate = await client.query(
        `SELECT * FROM employee_attendance 
         WHERE attendance_id = $1 AND employee_id = $2`,
        [recordId, employeeId],
      );
    } else {
      // Find the latest check-in without check-out
      recordToUpdate = await client.query(
        `SELECT * FROM employee_attendance 
         WHERE employee_id = $1 AND attendance_date = $2 
         AND check_out_time IS NULL 
         ORDER BY check_in_time DESC 
         LIMIT 1`,
        [employeeId, today],
      );
    }

    if (recordToUpdate.rows.length === 0) {
      throw new Error("No active check-in found to check out from");
    }

    const checkInTime = new Date(recordToUpdate.rows[0].check_in_time);
    const currentTime = new Date();
    const timeDiffMinutes = (currentTime - checkInTime) / (1000 * 60);

    if (timeDiffMinutes < 2) {
      throw new Error("حداقل ۲ دقیقه پس از ورود می‌توانید خروج ثبت کنید");
    }

    // Update with check-out time
    const updated = await client.query(
      `UPDATE employee_attendance 
       SET check_out_time = $1, status = 'leave'
       WHERE attendance_id = $2
       RETURNING *`,
      [now, recordToUpdate.rows[0].attendance_id],
    );

    await client.query("COMMIT");
    return {
      success: true,
      data: updated.rows[0],
      message: "Check-out recorded successfully",
      status: 200,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    return {
      success: false,
      message: error.message,
      status: 400,
    };
  } finally {
    client.release();
  }
}

// Modified getTodayAttendanceService
export async function getTodayAttendanceService(employeeId) {
  try {
    const today = new Date().toISOString().split("T")[0];

    const { rows } = await query(
      `SELECT * FROM employee_attendance 
       WHERE employee_id = $1 AND attendance_date = $2
       ORDER BY check_in_time`,
      [employeeId, today],
    );

    return {
      success: true,
      data: rows,
      message: rows.length
        ? "Attendance records found"
        : "No attendance records today",
      status: 200,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      status: 500,
    };
  }
}

// Add this function to calculate total times
export async function getTodayAttendanceSummaryService(employeeId) {
  try {
    const today = new Date().toISOString().split("T")[0];

    const { rows } = await query(
      `SELECT 
         status,
         check_in_time,
         check_out_time
       FROM employee_attendance 
       WHERE employee_id = $1 AND attendance_date = $2
       ORDER BY check_in_time`,
      [employeeId, today],
    );

    // Calculate total present and absent time
    let totalPresentMinutes = 0;
    let totalAbsentMinutes = 0;

    rows.forEach((record) => {
      if (record.check_in_time && record.check_out_time) {
        const checkIn = new Date(record.check_in_time);
        const checkOut = new Date(record.check_out_time);
        const durationMinutes = (checkOut - checkIn) / (1000 * 60);

        if (record.status === "present" || record.status === "leave") {
          totalPresentMinutes += durationMinutes;
        } else if (record.status === "absent") {
          totalAbsentMinutes += durationMinutes;
        }
      }
    });

    // Convert minutes to hours and minutes
    const formatTime = (minutes) => {
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      return `${hours} ساعت و ${mins} دقیقه`;
    };

    return {
      success: true,
      data: {
        records: rows,
        summary: {
          totalPresent: formatTime(totalPresentMinutes),
          totalAbsent: formatTime(totalAbsentMinutes),
          totalPresentMinutes,
          totalAbsentMinutes,
        },
      },
      status: 200,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      status: 500,
    };
  }
}
