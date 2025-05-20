import {query} from "./../config/db.js";

export default {
    async getTrainerProfile(id) {
        const { rows } = await query(
            `SELECT * FROM users WHERE id = $1;`,[id]);     
        if (rows.length === 0) throw new Error("کاربر یافت نشد.");
        return rows[0]
    },
};
