import {getAll as viewAllPersonnelService} from '';

export async function GetAllPersonnel(req, res, next) {
    try {
        const {success, message, data, status} = viewAllPersonnelService()

        return res.status(status).json({success, message, data})
    } catch (e) {
        next(e)
    }
}