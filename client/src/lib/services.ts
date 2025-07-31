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

export const createService = async (serviceData: { name: string; amount: number,icon :string }) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/services`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                name: serviceData.name,
                amount: serviceData.amount,
                icon : serviceData.icon
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

        return await response.json()
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

export const deleteService = async (id: number) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/services/${id}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `HTTP error: ${response.status}`);
        }

        const data = await response.json();
        return {
            success: true,
            data,
            message: data.message || 'خدمت با موفقیت حذف شد'
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'خطا در حذف خدمت'
        };
    }
};

export const updateService = async (id: number, serviceData: { name: string; amount: number; icon: string }) => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/services/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(serviceData)
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
            message: error.message || 'خطا در ویرایش خدمت'
        };
    }
};

export const getSecurityQuestions = async () => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/auth/security-questions`);
    if (!response.ok) {
      throw new Error('Failed to fetch security questions');
    }
    const data = await response.json();
    return data;
  } catch (error : any) {
    throw new Error(error.message || 'Failed to fetch security questions');
  }
};

export const getRequestsService = async () => {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/client-requests/pending`);
        if (!response.ok) {
            throw new Error('Failed to fetch requests for trainer-clients');
        }
        const data = await response.json();
        return data;
    } catch (error : any) {
        throw new Error(error.message || 'Failed to fetch requests for trainer-clients');
    }
};

export const handleAcceptOrRejectService = async (
    trainer_id: number,
    status: string,
    request_id: number
) => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_SERVER_URL}/client-requests/${request_id}/process`, // توجه کن این آدرس باید `/process` داشته باشه
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ status, trainer_id }),
            }
        );

        console.log(response)
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `HTTP error: ${response.status}`);
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'خطا در ویرایش خدمت',
        };
    }
};







