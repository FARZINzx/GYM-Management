// __tests__/unit/authService.test.js
import authService from "../services/authService.js";
import * as db from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';

jest.mock('../config/db.js');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('authService.login', () => {
    const fakeUserRow = {
        id: 42,
        password_hash: '$2b$10$saltsalt…',
        is_active: true,
        role: 'admin'
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should throw if کاربر یافت نشد', async () => {
        db.query.mockResolvedValue({ rows: [] });
        await expect(authService.login('noone','any'))
            .rejects.toThrow('کاربری با این مشخصات وجود ندارد.');
    });

    it('should throw if حساب غیرفعال است', async () => {
        db.query.mockResolvedValue({ rows: [{ ...fakeUserRow, is_active: false }] });
        await expect(authService.login('u','p'))
            .rejects.toThrow('این حساب کاربری فعال نیست.');
    });

    it('should throw on رمز اشتباه', async () => {
        db.query.mockResolvedValue({ rows: [fakeUserRow] });
        bcrypt.compare.mockResolvedValue(false);
        await expect(authService.login('u','wrong'))
            .rejects.toThrow('نام کاربری یا رمز عبور اشتباه است.');
    });

    it('should return token و role on success', async () => {
        db.query.mockResolvedValue({ rows: [fakeUserRow] });
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue('signed-token');

        const { token, role } = await authService.login('u','correct');
        expect(token).toBe('signed-token');
        expect(role).toBe('admin');

        // مطمئن شویم jwt.sign با payload درست فراخوانی شده
        expect(jwt.sign).toHaveBeenCalledWith(
            { id: 42, role: 'admin' },
            env.JWT.SECRET,
            { expiresIn: env.JWT.EXPIRES_IN }
        );
    });
});
