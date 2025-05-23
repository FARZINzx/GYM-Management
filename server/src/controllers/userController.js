import { getAll as viewAllUserService, getUser as viewUserService, updateUserService } from "../services/userServices.js";
import { sendResponse } from "../middlewares/responseHandler.js";
import {toGregorianISO} from "../utils/jalaliToGregorian.js"

export async function getAllUsers(req, res, next) {
    try {
        const { success, message, data, status } = await viewAllUserService();

        return res.status(status).json({
            success, message, data
        })
    } catch (err) {
        next(err);
    }
}


export async function getUser(req, res, next) {
    try {
        const { id } = req.params;
        const result = await viewUserService(id);

        return sendResponse(res, result);
    } catch (error) {
        next(error);
    }
}

export async function updateUserController(req, res, next) {
    try {
        const { id } = req.params;
        const userData = req.body;

        if (!id || !Object.keys(userData).length) {
            return res.status(400).json({
                success: false,
                message: "حداقل یک فیلد برای بروزرسانی الزامی است"
            });
        }

        if (userData.birth_date) {
            try {
                userData.birth_date = toGregorianISO(userData.birth_date);
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    message: "فرمت تاریخ تولد نامعتبر است (فرمت صحیح: YYYY/MM/DD)"
                });
            }
        }

        if (userData.gender && !['male', 'female'].includes(userData.gender)) {
            return res.status(400).json({
                success: false,
                message: "جنسیت معتبر نیست (مقادیر مجاز: male یا female)"
            });
        }


        const result = await updateUserService(id, userData)        
        return sendResponse(res, result);
    } catch (error) {
        next(error);
    }
}
