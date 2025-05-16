import { getAll as viewAllUserService, getUser as viewUserService } from "../services/userServices.js";

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
        const { id } = req.params
        const { success, message, data, status } = await viewUserService(id)

        return res.status(status).json({
            success, message, data
        })
    } catch (error) {
        next(error);
    }
}
