import {getClient, query} from "../config/db.js";


export async function getAllPersonnel() {
    try {
        const {rows} = await query(`
            SELECT
                e.id , e.first_name, e.last_name , r.role_name
            FROM
                employee AS e
            JOIN
                roles AS r ON e.role_id = r.role_id 
            Where r.role_name NOT IN ('admin' , 'manager')`);
        return {success: true, message: 'OK', data: rows, status: 200};
    } catch (e) {
        return {success: false, message: e.message, status: 500};
    }
}

export async function registerService(first_name, last_name, phone, address, role_id, birth_date, salary) {
    const client = await getClient()
    try {
        await client.query('BEGIN')
        const employeeRes = await client.query(`
            INSERT INTO employee (first_name, last_name , birth_date , is_active,role_id)
                VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING  id`,
            [first_name, last_name, birth_date, true, role_id])

        const employeeId = employeeRes.rows[0].id

        await client.query(`
            INSERT INTO employee_contacts (employee_id , phone , address)
                VALUES ($1 , $2 , $3)
        ` , [employeeId , phone ,address])

        await client.query(`
            INSERT INTO employee_salary (employee_id , amount)
                VALUES ($1 , $2 , $3)
        ` , [employeeId , salary])

        await client.query('COMMIT')
        return {
            success: true,
            message: 'ثبت نام با موفقیت انجام شد',
            status: 200
        }
    } catch (e) {
        await client.query('ROLLBACK')
        return { success: false, error: e.message };
    }finally {
        client.release()
    }
}