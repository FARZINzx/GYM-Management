// __tests__/Logout.test.jsx
/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Logout from '../components/login/logout.tsx'
import { deleteCookie } from '../action/cookie';
import toast from 'react-hot-toast';


// ۱. موک کردن تابع deleteCookie
// jest.mock('../action/cookie', () => ({
//     deleteCookie: jest.fn()
// }));

// ۲. موک کردن toast.success
jest.mock('react-hot-toast', () => ({
    success: jest.fn()
}));

// ۳. موک کردن useRouter و فقط متد refresh
const mockRefresh = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({ refresh: mockRefresh })
}));

describe('Logout component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should delete token cookie, show success toast and refresh router on click', () => {
        const { container } = render(<Logout />);
        // دکمه‌ی Logout در کامپوننت شما با یک آیکون <svg> رندر می‌شود
        const svgIcon = container.querySelector('svg');
        expect(svgIcon).toBeInTheDocument();

        // شبیه‌سازی کلیک روی آیکون
        fireEvent.click(svgIcon);

        // ۱) تابع deleteCookie با 'token' فراخوانی شده باشد
        expect(deleteCookie).toHaveBeenCalledWith('token');

        // ۲) toast.success با پیام و تنظیمات دلخواه فراخوانی شده باشد
        expect(toast.success).toHaveBeenCalledWith(
            'خروج با موفقیت انجام شد',
            expect.objectContaining({
                duration: 2000,
                style: {
                    background: '#31C440',
                    color: '#fff'
                }
            })
        );

        // ۳) متد router.refresh فراخوانی شده باشد
        expect(mockRefresh).toHaveBeenCalled();
    });
});
