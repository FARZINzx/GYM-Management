import {
    getAllPersonnel as viewAllPersonnelService,
    registerService,
    getPersonnel as viewPersonnelService,
    updatePersonnelService,
    deletePersonnelService
} from '../services/personnelService.js';
import {toGregorianISO} from "../utils/jalaliToGregorian.js";
import {sendResponse} from "../middlewares/responseHandler.js";

export async function getAllPersonnel(req, res, next) {
    try {
        const {success, message, data, status} = await viewAllPersonnelService()

        return res.status(status).json({success, message, data})
    } catch (e) {
        next(e)
    }
}

export async function registerPersonnel(req, res, next) {
    const {
        first_name, last_name, phone, address, role_id, birth_date, salary
    } = req.body

    let birth_date_gregorian;
    try {
        birth_date_gregorian = toGregorianISO(birth_date);
    } catch (e) {
        return res
            .status(400)
            .json({ success: false, message: "فرمت تاریخ تولد نامعتبر است" });
    }

    try {
        const {
            success,
            message,
            data,
            status
        } = await registerService(first_name, last_name, phone, address, role_id, birth_date_gregorian, salary)

        return res.status(status).json({success, message, data})
    } catch (e) {
        next(e)
    }
}

export async function getPersonnel(req, res, next) {

    const {id} = req.params

    try {
        const {success, message, data, status} = await viewPersonnelService(id)

        return res.status(status).json({success, message, data})
    } catch (e) {
        next(e)
    }
}

export async function updatePersonnel(req, res, next) {
    const { id } = req.params;
    const {
        first_name, last_name, phone, address, role_id, birth_date, salary
    } = req.body;

    let birth_date_gregorian;
    try {
        birth_date_gregorian = toGregorianISO(birth_date);
    } catch (e) {
        return res
            .status(400)
            .json({ success: false, message: "فرمت تاریخ تولد نامعتبر است" });
    }

    try {
        const { success, message, data, status } = await updatePersonnelService(
            id,
            first_name,
            last_name,
            phone,
            address,
            role_id,
            birth_date_gregorian,
            salary
        );

        return res.status(status).json({ success, message, data });
    } catch (e) {
        next(e);
    }
}

export async function deletePersonnelController(req, res, next) {
    try {
        const { id } = req.params;
        console.log()

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Personnel ID is required"
            });
        }

        const result = await deletePersonnelService(id);
        return sendResponse(res, result);
    } catch (error) {
        next(error);
    }
}