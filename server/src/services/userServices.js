import {query} from "../config/db.js";

export async function register(first_name, last_name, birth_date, phone, gender, weight_kg, height_cm, trainer_id) {
    try {
        await query(
            `INSERT INTO users (first_name, last_name, birth_date, phone, gender, weight_kg, height_cm, trainer_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [
                first_name, last_name, birth_date, phone, gender, weight_kg, height_cm, trainer_id || null,
            ]
        )

        return {
            success: true,
            message: 'ثبت نام با موفقیت انجام شد',
            status: 200
        }
    } catch (err) {
        return {
            success: false,
            message: err.message || 'خطایی در ثبت نام وجود دارد',
            status: 500
        }

    }


}

export async function getAll() {
    try {
        const { rows } = await query('SELECT * FROM users');
        return { success: true, message: 'OK', data: rows, status: 200 };
    } catch (e) {
        return { success: false, message: e.message, status: 500 };
    }
}
