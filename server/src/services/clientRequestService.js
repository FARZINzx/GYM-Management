import { query, getClient } from '../config/db.js';

export async function createRequestService(client_phone, services, created_by, notes) {
    const client = await getClient();
    try {
        await client.query('BEGIN');

        // Create the main request
        const requestResult = await client.query(
            `INSERT INTO client_service_requests 
             (client_phone, created_by, notes)
             VALUES ($1, $2, $3) RETURNING *`,
            [client_phone, created_by, notes]
        );
        
        const request_id = requestResult.rows[0].request_id;

        // Insert all selected services
        for (const service_id of services) {
            await client.query(
                `INSERT INTO request_services (request_id, service_id)
                 VALUES ($1, $2)`,
                [request_id, service_id]
            );
        }

        await client.query('COMMIT');
        
        // Get full request data with services
        const fullRequest = await getRequestDetails(request_id);
        
        return {
            success: true,
            message: 'Request created successfully',
            data: fullRequest,
            status: 201
        };
    } catch (error) {
        await client.query('ROLLBACK');
        return {
            success: false,
            message: error.message,
            status: 500
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
        [request_id]
    );
    
    const servicesResult = await query(
        `SELECT s.* FROM request_services rs
         JOIN service_types s ON rs.service_id = s.service_id
         WHERE rs.request_id = $1`,
        [request_id]
    );
    
    return {
        ...requestResult.rows[0],
        services: servicesResult.rows
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
             ORDER BY r.created_at DESC`
        );

        // Get services for each request
        const requestsWithServices = await Promise.all(
            rows.map(async request => {
                const services = await query(
                    `SELECT s.* FROM request_services rs
                     JOIN service_types s ON rs.service_id = s.service_id
                     WHERE rs.request_id = $1`,
                    [request.request_id]
                );
                return { ...request, services: services.rows };
            })
        );

        return {
            success: true,
            message: 'Requests retrieved successfully',
            data: requestsWithServices,
            status: 200
        };
    } catch (error) {
        return {
            success: false,
            message: error.message,
            status: 500
        };
    }
}

export async function getPendingRequestsService() {
    try {
        const { rows } = await query(
            `SELECT r.*, 
             e.first_name as created_by_name, e.last_name as created_by_last_name,
             u.first_name as client_name, u.last_name as client_last_name
             FROM client_service_requests r
             JOIN employee e ON r.created_by = e.id
             LEFT JOIN users u ON r.client_phone = u.phone
             WHERE r.status = 'pending'
             ORDER BY r.created_at DESC`
        );

        // Get services for each request
        const requestsWithServices = await Promise.all(
            rows.map(async request => {
                const services = await query(
                    `SELECT s.* FROM request_services rs
                     JOIN service_types s ON rs.service_id = s.service_id
                     WHERE rs.request_id = $1`,
                    [request.request_id]
                );
                return { ...request, services: services.rows };
            })
        );

        return {
            success: true,
            message: 'Pending requests retrieved successfully',
            data: requestsWithServices,
            status: 200
        };
    } catch (error) {
        return {
            success: false,
            message: error.message,
            status: 500
        };
    }
}

export async function processRequestService(request_id, status, trainer_id) {
    const client = await getClient();
    try {
        await client.query('BEGIN');

        // Check if request exists and is pending
        const checkResult = await client.query(
            'SELECT * FROM client_service_requests WHERE request_id = $1',
            [request_id]
        );

        if (checkResult.rows.length === 0) {
            throw new Error('Request not found');
        }

        if (checkResult.rows[0].status !== 'pending') {
            throw new Error('Request already processed');
        }

        // Update request status
        const updateResult = await client.query(
            `UPDATE client_service_requests 
             SET status = $1, accepted_by = $2, accepted_at = now()
             WHERE request_id = $3 RETURNING *`,
            [status, trainer_id, request_id]
        );

        // If accepted, create assignment
        if (status === 'accepted') {
            const clientPhone = updateResult.rows[0].client_phone;

            // Find client by phone
            const clientRes = await client.query(
                'SELECT id FROM users WHERE phone = $1',
                [clientPhone]
            );

            if (clientRes.rows.length > 0) {
                await client.query(
                    `INSERT INTO trainer_assignments 
                     (trainer_id, client_id, request_id)
                     VALUES ($1, $2, $3)`,
                    [trainer_id, clientRes.rows[0].id, request_id]
                );
            }
        }

        await client.query('COMMIT');

        // Get full updated request data
        const fullRequest = await getRequestDetails(request_id);

        return {
            success: true,
            message: `Request ${status} successfully`,
            data: fullRequest,
            status: 200
        };
    } catch (error) {
        await client.query('ROLLBACK');
        return {
            success: false,
            message: error.message,
            status: 400
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
            [trainer_id]
        );

        // Get services for each assignment
        const clientsWithServices = await Promise.all(
            rows.map(async client => {
                const services = await query(
                    `SELECT s.* FROM request_services rs
                     JOIN service_types s ON rs.service_id = s.service_id
                     WHERE rs.request_id = $1`,
                    [client.request_id]
                );
                return { ...client, services: services.rows };
            })
        );

        return {
            success: true,
            message: 'Trainer clients retrieved successfully',
            data: clientsWithServices,
            status: 200
        };
    } catch (error) {
        return {
            success: false,
            message: error.message,
            status: 500
        };
    }
}