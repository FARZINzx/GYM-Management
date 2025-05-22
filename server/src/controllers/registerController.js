import { validationResult } from "express-validator";
import { register } from '../services/userServices.js'
import { toGregorianISO } from "../utils/jalaliToGregorian.js";


export const registerController = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const {
        first_name,
        last_name,
        birth_date,
        phone,
        gender,
        weight_kg,
        height_cm,
        trainer_id,
    } = req.body;

    let birth_date_gregorian;
    try {
        console.log('birth-date' , birth_date);
        
        birth_date_gregorian = toGregorianISO(birth_date);
    } catch (e) {
        return res
            .status(400)
            .json({ success: false, message: "فرمت تاریخ تولد نامعتبر است" });
    }
    const {
        success,
        message,
        status
    } = await register(
        first_name,
        last_name,
        birth_date_gregorian,
        phone,
        gender,
        weight_kg,
        height_cm,
        trainer_id,
    )

    if (success) {
        res.status(status).json({
            success: success,
            message: message,
        });
    } else {
        res.status(status).json({
            success: false,
            message: message
        });
    }

}