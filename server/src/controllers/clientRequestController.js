import {
  createRequestService,
  getAllRequestsService,
  getPendingRequestsService,
  processRequestService,
  getTrainerClientsService,
} from "../services/clientRequestService.js";
import { sendResponse } from "../middlewares/responseHandler.js";

export async function createRequestController(req, res, next) {
  try {
    const { client_phone, services, notes, created_by } = req.body;

    const result = await createRequestService(
      client_phone,
      services,
      created_by,
      notes,
    );

    return sendResponse(res, result);
  } catch (error) {
    next(error);
  }
}

export async function getAllRequestsController(req, res, next) {
  try {
    const result = await getAllRequestsService();
    return sendResponse(res, result);
  } catch (error) {
    next(error);
  }
}

export async function getPendingRequestsController(req, res, next) {
  try {
    const result = await getPendingRequestsService();
    return sendResponse(res, result);
  } catch (error) {
    next(error);
  }
}

export async function processRequestController(req, res, next) {
  try {
    const { status, trainer_id } = req.body;
    const request_id = req.params.id;

    const result = await processRequestService(request_id, status, trainer_id);

    if (!result.success) {
      // اگر موفق نبود، ارسال خطای واقعی
      return sendResponse(res, {
        success: false,
        message: result.message,
        status: result.status || 400,
      });
    }

    return sendResponse(res, result);
  } catch (error) {
    next(error);
  }
}

export async function getTrainerClientsController(req, res, next) {
  try {
    const trainer_id = req.user.id;
    const result = await getTrainerClientsService(trainer_id);
    return sendResponse(res, result);
  } catch (error) {
    next(error);
  }
}
