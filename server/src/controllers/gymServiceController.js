import {
  createService,
  getAllServices,
  updateService,
  deleteService,
} from "../services/gymServiceService.js";

export async function createServiceController(req, res, next) {
  try {
    const { name, amount, description, duration_minutes } = req.body;

    if (!name || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name and amount are required",
      });
    }

    const result = await createService(
      name,
      amount,
      description,
      duration_minutes,
    );
    return res.status(result.status).json(result);
  } catch (e) {
    next(e);
  }
}

export async function getServicesController(req, res, next) {
  try {
    const activeOnly = req.query.active !== "false";
    const result = await getAllServices(activeOnly);
    return res.status(result.status).json(result);
  } catch (e) {
    next(e);
  }
}

export async function updateServiceController(req, res, next) {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Service ID and at least one update field are required",
      });
    }

    const result = await updateService(id, updates);
    return res.status(result.status).json(result);
  } catch (e) {
    next(e);
  }
}

export async function deleteServiceController(req, res, next) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Service ID is required",
      });
    }

    const result = await deleteService(id);
    return res.status(result.status).json(result);
  } catch (e) {
    next(e);
  }
}
