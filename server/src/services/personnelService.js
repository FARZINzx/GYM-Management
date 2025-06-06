import { getClient, query } from "../config/db.js";
import { calculateAgeFromJalali } from "../utils/calculateAgeFromJalali.js";

export async function getAllPersonnel() {
  try {
    const { rows } = await query(`
            SELECT
                e.id , e.first_name, e.last_name , r.role_name
            FROM
                employee AS e
            JOIN
                roles AS r ON e.role_id = r.role_id 
            Where r.role_name NOT IN ('admin' , 'manager')`);
    return { success: true, message: "OK", data: rows, status: 200 };
  } catch (e) {
    return { success: false, message: e.message, status: 500 };
  }
}

export async function registerService(
  first_name,
  last_name,
  phone,
  address,
  role_id,
  birth_date,
  salary,
  username,
  password,
  question_id,
  question_answer
) {

  const client = await getClient();
  try {
    await client.query("BEGIN");
    const employeeRes = await client.query(
      `
            INSERT INTO employee (first_name, last_name , birth_date , is_active,role_id)
                VALUES ($1, $2, $3, $4, $5)
        RETURNING  id`,
      [first_name, last_name, birth_date, true, role_id],
    );

    const employeeId = employeeRes.rows[0].id;

        await client.query(
      `INSERT INTO employee_auth (id, username, password_hash, question_id, question_answer_hash)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        employeeId,
        username,
        password, // Note: This should be hashed before passing to the function
        question_id,
        question_answer // Note: This should be hashed before passing to the function
      ]
    );

    await client.query(
      `
            INSERT INTO employee_contacts (employee_id , phone , address)
                VALUES ($1 , $2 , $3)
        `,
      [employeeId, phone, address],
    );

    await client.query(
      `
            INSERT INTO employee_salary (employee_id , amount)
                VALUES ($1 , $2)
        `,
      [employeeId, salary],
    );

    await client.query("COMMIT");
    return {
      success: true,
      message: "ثبت نام با موفقیت انجام شد",
      status: 201,
    };
  } catch (e) {
    console.log(e);
    await client.query("ROLLBACK");
    return { success: false, error: e.message, status: 500 };
  } finally {
    client.release();
  }
}

export async function getPersonnel(id) {
  try {
    const { rows } = await query(
      `   SELECT 
                e.id, e.first_name, e.last_name, e.birth_date, 
                e.created_at, e.is_active, ec.address, ec.phone, 
                es.amount as salary, r.role_name, r.role_id
            FROM employee e 
            JOIN employee_salary es ON es.employee_id = e.id
            JOIN employee_contacts ec ON ec.employee_id = e.id
            JOIN roles r ON e.role_id = r.role_id
            WHERE e.id = $1`,
      [id],
    );
    if (rows.length === 0) {
      return { success: false, message: "Personnel not found", status: 404 };
    }

    const userData = { ...rows[0] };

    if (userData.birth_date) {
      try {
        userData.age = calculateAgeFromJalali(userData.birth_date);
      } catch (e) {
        userData.age = null;
      }
    }

    return {
      success: true,
      message: "Personnel found",
      data: userData,
      status: 200,
    };
  } catch (e) {
    return {
      success: false,
      message: e.message,
      status: 500,
    };
  }
}

// export async function updatePersonnelService(
//  id,
//   first_name,
//   last_name,
//   phone,
//   address,
//   role_id,
//   birth_date,
//   salary,
//   username,
//   password,
//   question_id,
//   question_answer
// ) {
//   const client = await getClient();
//   try {
//     await client.query("BEGIN");

//     // 1. Update employee table
//     const employeeRes = await client.query(
//       `
//             UPDATE employee 
//             SET 
//                 first_name = $1,
//                 last_name = $2,
//                 birth_date = $3,
//                 role_id = $4,
//                 updated_at = NOW()
//             WHERE id = $5
//             RETURNING id
//         `,
//       [first_name, last_name, birth_date, role_id, id],
//     );

//     if (employeeRes.rowCount === 0) {
//       throw new Error("کاربر یافت نشد");
//     }

//     // 2. Update contact information
//     await client.query(
//       `
//             UPDATE employee_contacts
//             SET 
//                 phone = $1,
//                 address = $2
//             WHERE employee_id = $3
//         `,
//       [phone, address, id],
//     );

//     // 3. Update salary information
//     await client.query(
//       `
//             UPDATE employee_salary
//             SET 
//                 amount = $1
//             WHERE employee_id = $2
//         `,
//       [salary, id],
//     );

//     await client.query("COMMIT");

//     return {
//       success: true,
//       message: "اطلاعات با موفقیت بروزرسانی شد",
//       data: { id },
//       status: 200,
//     };
//   } catch (e) {
//     await client.query("ROLLBACK");
//     console.error("Update error:", e);
//     return {
//       success: false,
//       error: e.message,
//       status: 500,
//     };
//   } finally {
//     client.release();
//   }
// }


export async function updatePersonnelService(
  id,
  first_name,
  last_name,
  phone,
  address,
  role_id,
  birth_date,
  salary,
  username,
  password,
  question_id,
  question_answer
) {
  const client = await getClient();
  try {
    await client.query("BEGIN");

    // 1. Update employee table
    const employeeRes = await client.query(
      `UPDATE employee 
       SET 
         first_name = $1,
         last_name = $2,
         birth_date = $3,
         role_id = $4,
         updated_at = NOW()
       WHERE id = $5
       RETURNING id`,
      [first_name, last_name, birth_date, role_id, id]
    );

    if (employeeRes.rowCount === 0) {
      throw new Error("کاربر یافت نشد");
    }

    // 2. Update authentication info if provided
    if (username || password || question_id || question_answer) {
      let updateQuery = `UPDATE employee_auth SET `;
      const params = [];
      let paramCount = 1;

      if (username) {
        updateQuery += `username = $${paramCount++}, `;
        params.push(username);
      }
      if (password) {
        updateQuery += `password_hash = $${paramCount++}, `;
        params.push(password); // Should be hashed
      }
      if (question_id) {
        updateQuery += `question_id = $${paramCount++}, `;
        params.push(question_id);
      }
      if (question_answer) {
        updateQuery += `question_answer_hash = $${paramCount++}, `;
        params.push(question_answer); // Should be hashed
      }

      // Remove trailing comma and space
      updateQuery = updateQuery.slice(0, -2);
      updateQuery += ` WHERE id = $${paramCount}`;
      params.push(id);

      await client.query(updateQuery, params);
    }

    // 3. Update contact information
    await client.query(
      `UPDATE employee_contacts
       SET 
         phone = $1,
         address = $2
       WHERE employee_id = $3`,
      [phone, address, id]
    );

    // 4. Update salary information
    await client.query(
      `UPDATE employee_salary
       SET 
         amount = $1
       WHERE employee_id = $2`,
      [salary, id]
    );

    await client.query("COMMIT");
    return {
      success: true,
      message: "اطلاعات با موفقیت بروزرسانی شد",
      data: { id },
      status: 200,
    };
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("Update error:", e);
    return {
      success: false,
      error: e.message,
      status: 500,
    };
  } finally {
    client.release();
  }
}

export async function deletePersonnelService(id) {
  const client = await getClient();
  console.log("id", id);
  try {
    await client.query("BEGIN");

    // First check if personnel exists
    const checkRes = await client.query(
      "SELECT id FROM employee WHERE id = $1",
      [id],
    );
    if (checkRes.rowCount === 0) {
      throw new Error("Personnel not found");
    }

    // Delete will cascade to related tables
    await client.query("DELETE FROM employee WHERE id = $1", [id]);

    await client.query("COMMIT");
    return {
      success: true,
      message: "Personnel deleted successfully",
      status: 200,
    };
  } catch (e) {
    await client.query("ROLLBACK");
    return {
      success: false,
      message: e.message,
      status: 500,
    };
  } finally {
    client.release();
  }
}
