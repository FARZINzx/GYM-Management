import { query } from "../config/db.js";


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

export async function getUser(id) {
    try {
        const { rows } = await query('SELECT * FROM users WHERE id = $1', [id]);

        if (rows.length === 0) {
            return { success: false, message: 'User not found', status: 404 };
        }

        const userData = { ...rows[0] };

        // Calculate age if birth date exists
        if (userData.birth_date) {
            const birthDate = new Date(userData.birth_date);
            const today = new Date();

            // Get UTC dates to avoid timezone issues
            const birthYear = birthDate.getUTCFullYear();
            const birthMonth = birthDate.getUTCMonth();
            const birthDay = birthDate.getUTCDate();

            const currentYear = today.getUTCFullYear();
            const currentMonth = today.getUTCMonth();
            const currentDay = today.getUTCDate();

            let age = currentYear - birthYear;

            // Check if birthday hasn't occurred yet this year
            if (currentMonth < birthMonth ||
                (currentMonth === birthMonth && currentDay < birthDay)) {
                age--;
            }

            userData.age = age;
        }

        return {
            success: true,
            message: 'User found',
            data: userData,
            status: 200
        };
    } catch (e) {
        return {
            success: false,
            message: e.message,
            status: 500
        };
    }
}

export async function updateUserService(id, userData) {
    try {
        const newData = `
      UPDATE users 
      SET 
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        phone = COALESCE($3, phone),
        weight_kg = COALESCE($4, weight_kg),
        height_cm = COALESCE($5, height_cm),
        birth_date = COALESCE($6, birth_date),
        gender = COALESCE($7, gender)
      WHERE id = $8
      RETURNING *
    `;

        const values = [
            userData.first_name,
            userData.last_name,
            userData.phone,
            userData.weight_kg,
            userData.height_cm,
            userData.birth_date,
            userData.gender,
            id
        ];

        const { rows } = await query(newData, values);

        if (rows.length === 0) {
            return { success: false, message: 'User not found', status: 404 };
        }

        return {
            success: true,
            message: "اطلاعات کاربر با موفقیت بروزرسانی شد" ,  
            data: rows[0],
            status: 200
        };
    } catch (e) {
        return { success: false, message: e.message, status: 500 };
    }
}