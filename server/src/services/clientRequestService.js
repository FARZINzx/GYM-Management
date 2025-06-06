import { query, getClient } from '../config/db.js';

export async function createRequestService(client_phone, service_id, created_by, notes) {
    const client = await getClient();
    try {
        await client.query('BEGIN');

        const { rows } = await client.query(
            `INSERT INTO client_service_requests 
             (client_phone, service_id, created_by, notes)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [client_phone, service_id, created_by, notes]
        );

        await client.query('COMMIT');
        
        return {
            success: true,
            message: 'Request created successfully',
            data: rows[0],
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

export async function getAllRequestsService() {
    try {
        const { rows } = await query(
            `SELECT r.*, s.name as service_name, 
             e.first_name as created_by_name, e.last_name as created_by_last_name
             FROM client_service_requests r
             JOIN service_types s ON r.service_id = s.service_id
             JOIN employee e ON r.created_by = e.id
             ORDER BY r.created_at DESC`
        );

        return {
            success: true,
            message: 'Requests retrieved successfully',
            data: rows,
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
            `SELECT r.*, s.name as service_name, 
             e.first_name as created_by_name, e.last_name as created_by_last_name,
             u.first_name as client_name, u.last_name as client_last_name
             FROM client_service_requests r
             JOIN service_types s ON r.service_id = s.service_id
             JOIN employee e ON r.created_by = e.id
             LEFT JOIN users u ON r.client_phone = u.phone
             WHERE r.status = 'pending'
             ORDER BY r.created_at DESC`
        );

        return {
            success: true,
            message: 'Pending requests retrieved successfully',
            data: rows,
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
            const serviceId = updateResult.rows[0].service_id;

            // Find client by phone
            const clientRes = await client.query(
                'SELECT id FROM users WHERE phone = $1',
                [clientPhone]
            );

            if (clientRes.rows.length > 0) {
                await client.query(
                    `INSERT INTO trainer_assignments 
                     (trainer_id, client_id, service_id)
                     VALUES ($1, $2, $3)`,
                    [trainer_id, clientRes.rows[0].id, serviceId]
                );
            }
        }

        await client.query('COMMIT');

        return {
            success: true,
            message: `Request ${status} successfully`,
            data: updateResult.rows[0],
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
            `SELECT u.*, s.name as service_name, a.assigned_at
             FROM users u
             JOIN trainer_assignments a ON u.id = a.client_id
             JOIN service_types s ON a.service_id = s.service_id
             WHERE a.trainer_id = $1 AND a.is_active = true
             ORDER BY a.assigned_at DESC`,
            [trainer_id]
        );

        return {
            success: true,
            message: 'Trainer clients retrieved successfully',
            data: rows,
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