import {getAll as viewUserService  } from "../services/userServices.js";

export async function getAllUsers(req , res, next){
    try {
        const {success, message , data , status} = await viewUserService();

        return res.status(status).json({
            success,message ,data
        })
    }catch(err){
        next(err);
    }
}