import {getAllPersonnel as viewAllPersonnelService} from '../services/personnelService.js';

export async function GetAllPersonnel(req, res, next) {
    try {
        const {success, message, data, status} = await viewAllPersonnelService()

        return res.status(status).json({success, message, data})
    } catch (e) {
        next(e)
    }
}