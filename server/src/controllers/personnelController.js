import {getAllPersonnel as viewAllPersonnelService , registerService} from '../services/personnelService.js';

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
    try {
        const {
            success,
            message,
            data,
            status
        } = await registerService(first_name, last_name, phone, address, role_id, birth_date, salary)

        return res.status(status).json({success, message, data})
    } catch (e) {
        next(e)
    }
}