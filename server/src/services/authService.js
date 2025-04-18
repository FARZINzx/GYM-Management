import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { query } from "./../config/db.js";
import env from "./../config/env.js";

export default {
  async login(username, password) {
    
    const { rows } = await query(
      `SELECT id,password_hash,role,is_active
               FROM employee
               Where username = $1
               `,
      [username]
    );

    if (rows.length === 0) throw new Error("کاربری با این مشخصات وجود ندارد.");

    const user = rows[0];

    if (!user.is_active) throw new Error("این حساب کاربری فعال نیست.");

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) throw new Error("نام کاربری یا رمز عبور اشتباه است.");

    return {
     token : this.generateToken(user),
     role : user.role
    };
  },

  generateToken(user) {
    return jwt.sign({ id: user.id, role: user.role }, env.JWT.SECRET, {
      expiresIn: env.JWT.EXPIRES_IN,
    });
  },

  async hashPassword(password) {
    return bcrypt.hash(password, 10);
  },
};
