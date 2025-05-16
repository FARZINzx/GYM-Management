export const getAllUsers = async () => {
    try {
        const response = await fetch('http://localhost:3001/api/user', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        // هندل کردن وضعیت غیرموفق (مثل 404، 500)
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `HTTP error: ${response.status}`);
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error : any) {
        return { success: false, message: error.message || 'خطا در دریافت اطلاعات' };
    }
};

export const getUser = async (id : any) => {
    try {
        const response = await fetch(`http://localhost:3001/api/user/${id}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `HTTP error: ${response.status}`);
        }
        const data = await response.json();
        return { success: true, data };
    } catch (error : any) {
        return { success: false, message: error.message || 'خطا در دریافت اطلاعات' };
    }
};

