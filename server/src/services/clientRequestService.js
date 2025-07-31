import { query, getClient } from "../config/db.js";
import { calculateAgeFromJalali } from "../utils/calculateAgeFromJalali.js";

export async function createRequestService(
  client_phone,
  services,
  created_by,
  notes,
) {
  const client = await getClient();
  try {
    await client.query("BEGIN");

    // 1. Validate phone exists in users table (SQL-level check)
    const userCheck = await client.query(
      `SELECT 1 FROM users WHERE phone = $1 LIMIT 1`,
      [client_phone],
    );

    if (userCheck.rowCount === 0) {
      return {
        success: false, // Changed to false for errors
        message: "کاربری با این شماره تلفن وجود ندارد",
        data: null,
        status: 400,
      };
    }

    // 2. Check for existing pending requests (SQL-level check)
    const existingRequest = await client.query(
      `SELECT 1 FROM client_service_requests 
       WHERE client_phone = $1 AND status = 'pending' LIMIT 1`,
      [client_phone],
    );

    if (existingRequest.rowCount > 0) {
      return {
        success: false, // Changed to false for errors
        message: "درخواست قبلی این کاربر تعیین وضعیت نشده است",
        data: null,
        status: 400,
      };
    }

    // 3. Create the request
    const requestResult = await client.query(
      `INSERT INTO client_service_requests 
       (client_phone, created_by, notes)
       VALUES ($1, $2, $3) RETURNING *`,
      [client_phone, created_by, notes],
    );

    const request_id = requestResult.rows[0].request_id;

    // 4. Insert services (optimized with single query)
    if (services && services.length > 0) {
      const serviceValues = services
        .map((service_id) => `(${request_id}, ${service_id})`)
        .join(",");

      await client.query(
        `INSERT INTO request_services (request_id, service_id)
         VALUES ${serviceValues}`,
      );
    }

    await client.query("COMMIT");

    // 5. Get full request details
    const fullRequest = await getRequestDetails(request_id);

    return {
      success: true,
      message: "درخواست با موفقیت ایجاد شد",
      data: fullRequest,
      status: 201,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    return {
      success: false,
      message: error.message,
      status: 500,
    };
  } finally {
    client.release();
  }
}

async function getRequestDetails(request_id) {
  const requestResult = await query(
    `SELECT r.*, 
         e.first_name as created_by_name, e.last_name as created_by_last_name,
         u.first_name as client_name, u.last_name as client_last_name
         FROM client_service_requests r
         JOIN employee e ON r.created_by = e.id
         LEFT JOIN users u ON r.client_phone = u.phone
         WHERE r.request_id = $1`,
    [request_id],
  );

  const servicesResult = await query(
    `SELECT s.* FROM request_services rs
         JOIN service_types s ON rs.service_id = s.service_id
         WHERE rs.request_id = $1`,
    [request_id],
  );

  return {
    ...requestResult.rows[0],
    services: servicesResult.rows,
  };
}

export async function getAllRequestsService() {
  try {
    const { rows } = await query(
      `SELECT r.*, 
             e.first_name as created_by_name, e.last_name as created_by_last_name,
             u.first_name as client_name, u.last_name as client_last_name
             FROM client_service_requests r
             JOIN employee e ON r.created_by = e.id
             LEFT JOIN users u ON r.client_phone = u.phone
             ORDER BY r.created_at DESC`,
    );

    // Get services for each createRequest
    const requestsWithServices = await Promise.all(
      rows.map(async (request) => {
        const services = await query(
          `SELECT s.* FROM request_services rs
                     JOIN service_types s ON rs.service_id = s.service_id
                     WHERE rs.request_id = $1`,
          [request.request_id],
        );
        return { ...request, services: services.rows };
      }),
    );

    return {
      success: true,
      message: "Requests retrieved successfully",
      data: requestsWithServices,
      status: 200,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      status: 500,
    };
  }
}

export async function getPendingRequestsService() {
  try {
    // 1. Fetch DISTINCT pending requests
    const { rows: requests } = await query(
      `SELECT DISTINCT ON (r.request_id)
        r.*, 
        e.first_name AS created_by_name, 
        e.last_name AS created_by_last_name,
        u.first_name AS client_name,
        u.bmi AS client_BMI,
        u.weight_kg AS client_weight_kg,
        u.height_cm AS client_height_cm,
        u.birth_date AS client_birth_date, 
        u.last_name AS client_last_name
      FROM client_service_requests r
      JOIN employee e ON r.created_by = e.id
      LEFT JOIN LATERAL (
        SELECT first_name, last_name, birth_date, weight_kg, height_cm, bmi
        FROM users 
        WHERE phone = r.client_phone 
        LIMIT 1  
      ) u ON true
      WHERE r.status = 'pending'
      ORDER BY r.request_id, r.created_at DESC`,
    );

    if (!requests.length) {
      return {
        success: true,
        message: "درخواستی با این ایدی وجود ندارد",
        data: [],
        status: 200,
      };
    }

    // 2. Calculate age for ALL requests
    const requestsWithAge = requests.map((request) => {
      if (request.client_birth_date) {
        try {
          return {
            ...request,
            client_age: calculateAgeFromJalali(request.client_birth_date),
          };
        } catch (e) {
          return {
            ...request,
            client_age: null,
          };
        }
      }
      return request;
    });

    // 3. Fetch services in one query
    const requestIds = requestsWithAge.map((req) => req.request_id);
    const { rows: services } = await query(
      `SELECT 
        rs.request_id,
        s.*
      FROM request_services rs
      JOIN service_types s ON rs.service_id = s.service_id
      WHERE rs.request_id = ANY($1::int[])`,
      [requestIds],
    );

    // 4. Group services by request_id
    const servicesByRequest = {};
    services.forEach((service) => {
      if (!servicesByRequest[service.request_id]) {
        servicesByRequest[service.request_id] = [];
      }
      servicesByRequest[service.request_id].push(service);
    });

    // 5. Attach services
    const requestsWithServices = requestsWithAge.map((request) => ({
      ...request,
      services: servicesByRequest[request.request_id] || [],
    }));

    return {
      success: true,
      message: "Pending requests retrieved successfully",
      data: requestsWithServices,
      status: 200,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      status: 500,
    };
  }
}

export async function processRequestService(request_id, status, trainer_id) {
  const client = await getClient();
  try {
    await client.query("BEGIN");

    // Check if createRequest exists and is pending
    const checkResult = await client.query(
      "SELECT * FROM client_service_requests WHERE request_id = $1",
      [request_id],
    );

    if (checkResult.rows.length === 0) {
      throw new Error("درخواستی با این ایدی وجود ندارد");
    }

    if (checkResult.rows[0].status !== "pending") {
      throw new Error("وضعیت این درخواست از قبل مشخص شده است!");
    }

    // Update createRequest status
    const updateResult = await client.query(
      `UPDATE client_service_requests 
             SET status = $1, accepted_by = $2, accepted_at = now()
             WHERE request_id = $3 RETURNING *`,
      [status, trainer_id, request_id],
    );

    // If accepted, create assignment
    if (status === "accepted") {
      const clientPhone = updateResult.rows[0].client_phone;

      // Find client by phone
      const clientRes = await client.query(
        "SELECT id FROM users WHERE phone = $1",
        [clientPhone],
      );

      if (clientRes.rows.length > 0) {
        await client.query(
          `INSERT INTO trainer_assignments 
                     (trainer_id, client_id, request_id)
                     VALUES ($1, $2, $3)`,
          [trainer_id, clientRes.rows[0].id, request_id],
        );
      }
    }

    await client.query("COMMIT");

    // Get full updated createRequest data
    const fullRequest = await getRequestDetails(request_id);

    return {
      success: true,
      message: `عملیات با موقق انحام شد`,
      data: fullRequest,
      status: 200,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    return {
      success: false,
      message: error.message,
      status: 400,
    };
  } finally {
    client.release();
  }
}

export async function getTrainerClientsService(trainer_id) {
  try {
    const { rows } = await query(
      `SELECT u.*, r.request_id, a.assigned_at
             FROM users u
             JOIN trainer_assignments a ON u.id = a.client_id
             JOIN client_service_requests r ON a.request_id = r.request_id
             WHERE a.trainer_id = $1 AND a.is_active = true
             ORDER BY a.assigned_at DESC`,
      [trainer_id],
    );

    // Get services for each assignment
    const clientsWithServices = await Promise.all(
      rows.map(async (client) => {
        const services = await query(
          `SELECT s.* FROM request_services rs
                     JOIN service_types s ON rs.service_id = s.service_id
                     WHERE rs.request_id = $1`,
          [client.request_id],
        );
        return { ...client, services: services.rows };
      }),
    );

    return {
      success: true,
      message: "Trainer clients retrieved successfully",
      data: clientsWithServices,
      status: 200,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      status: 500,
    };
  }
}
