import {query} from "../config/db.js";

export async function getAll() {
    try {
        const { rows } = await query(
            `SELECT 
                    role_id AS id ,role_name FROM roles
                        WHERE 
                        role_name NOT IN ('admin' , 'manager')`);
        return { success: true, message: 'OK', data: rows, status: 200 };
    } catch (e) {
        return { success: false, message: e.message, status: 500 };
    }
}