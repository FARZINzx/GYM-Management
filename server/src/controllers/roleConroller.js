import {getAll as viewAllRole} from "../services/roleService.js";
import {sendResponse} from "../middlewares/responseHandler.js";


export async function getAllRole(req, res, next) {
    try {
        const { id } = req.params;
        const result = await viewAllRole();
        console.log(result)

        return sendResponse(res, result);
    } catch (error) {
        next(error);
    }
}