import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {query} from "./../config/db.js";
import env from "./../config/env.js";

export default {
    async login(username, password) {

        const {rows} = await query(
            `
                SELECT ea.id,
                       ea.password_hash,
                       e.is_active,
                       r.role_name AS role
                FROM employee_auth ea
                         JOIN employee e ON ea.id = e.id
                         JOIN roles r ON e.role_id = r.role_id
                WHERE ea.username = $1
            `,
            [username]
        );

        if (rows.length === 0) throw new Error("کاربری با این مشخصات وجود ندارد.");

        const user = rows[0];

        if (!user.is_active) throw new Error("این حساب کاربری فعال نیست.");

        const validPassword = await bcrypt.compare(password.trim(), user.password_hash);

        if (!validPassword) throw new Error("نام کاربری یا رمز عبور اشتباه است.");

        return {
            token: this.generateToken(user),
            role: user.role
        };
    },

    generateToken(user) {
        return jwt.sign({id: user.id, role: user.role}, env.JWT.SECRET, {
            expiresIn: env.JWT.EXPIRES_IN,
        });
    },

    async hashPassword(password) {
        return bcrypt.hash(password, 10);
    },

    async getSecurityQuestion(username) {
        const { rows } = await query(
            `
                SELECT sq.question_text
                FROM employee_auth ea
                         JOIN security_questions sq ON ea.question_id = sq.question_id
                WHERE ea.username = $1;
      `,
            [username]
        );

        if (rows.length === 0) throw new Error("کاربر یافت نشد یا سوال ثبت نشده است.");
        return rows[0].question_text;
    },

    async verifySecurityAnswer(username, answer) {
        const { rows } = await query(
            `SELECT password_hash, question_answer_hash FROM employee_auth WHERE username = $1`,
            [username]
        );

        if (rows.length === 0) throw new Error("کاربر یافت نشد.");

        const { password_hash, question_answer_hash } = rows[0];

        const valid = await bcrypt.compare(answer.trim(), question_answer_hash);
        if (!valid) throw new Error("پاسخ امنیتی نادرست است.");

        return password_hash; // Or reset token instead
    },


};
