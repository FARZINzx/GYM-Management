export function sendResponse(res, { success, message, data = null, status = 200 }) {
    return res.status(status).json({
        success,
        message,
        data,
    });
}
