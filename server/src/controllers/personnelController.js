import {getAllPersonnel as viewAllPersonnelService , registerService} from '../services/personnelService.js';
import {toGregorianISO} from "../utils/jalaliToGregorian.js";

export async function GetAllPersonnel(req, res, next) {
    try {
        const {success, message, data, status} = await viewAllPersonnelService()

        return res.status(status).json({success, message, data})
    } catch (e) {
        next(e)
    }
}

export async function RegisterPersonnel(req, res, next) {
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