import {validationResult} from "express-validator";
import {register} from '../services/userServices.js'

export const registerController = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }
    const {
        first_name,
        last_name,
        age,
        phone,
        gender,
        weight_kg,
        height_cm,
        trainer_id,
    } = req.body;

    const {
        success,
        message,
        status
    } = await register(
        first_name,
        last_name,
        age,
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