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
        return data
    } catch (error : any) {
        return { success: false, message: error.message || 'خطا در دریافت اطلاعات' };
    }
};


export const getAllPersonnel = async () => {
    try {
        const response = await fetch(`http://localhost:3001/api/personnel`, {
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
        return data
    } catch (error : any) {
        return { success: false, message: error.message || 'خطا در دریافت اطلاعات' };
    }
};

export const getPersonnel = async (id : any) => {
    try {
        const response = await fetch(`http://localhost:3001/api/personnel/${id}`, {
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
        return data
    } catch (error : any) {
        return { success: false, message: error.message || 'خطا در دریافت اطلاعات' };
    }
};

export const getAllRole = async () => {
    try {
        const response = await fetch(`http://localhost:3001/api/roles`, {
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
        return data
    } catch (error : any) {
        return { success: false, message: error.message || 'خطا در دریافت اطلاعات' };
    }
};

export const createService = async (serviceData: { name: string; amount: number }) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/services`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                name: serviceData.name,
                amount: serviceData.amount
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `HTTP error: ${response.status}`);
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'خطا در ایجاد خدمت جدید'
        };
    }
};

export const getAllServices = async () => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/services`, {
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
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'خطا در دریافت لیست خدمات'
        };
    }
};

export const getService = async (id: string) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/services/${id}`, {
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
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'خطا در دریافت اطلاعات خدمت'
        };
    }
};




