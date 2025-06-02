import { query, getClient } from "../config/db.js";

export async function createService(
  name,
  amount,
  description = null,
  duration_minutes = null,
  icon = null,
) {
  const client = await getClient();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `INSERT INTO gym_services (name, amount, description, duration_minutes, icon)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
      [name, amount, description, duration_minutes, icon],
    );

    await client.query("COMMIT");
    return { success: true, data: rows[0], status: 201 };
  } catch (e) {
    await client.query("ROLLBACK");
    return { success: false, error: e.message, status: 500 };
  } finally {
    client.release();
  }
}

export async function getAllServices(activeOnly = true) {
  try {
    const queryText = activeOnly
      ? "SELECT * FROM gym_services WHERE is_active = TRUE"
      : "SELECT * FROM gym_services";

    const { rows } = await query(queryText);
    return { success: true, data: rows, status: 200 };
  } catch (e) {
    return { success: false, error: e.message, status: 500 };
  }
}

export async function updateService(service_id, updates) {
  const client = await getClient();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `UPDATE gym_services
             SET 
                name = COALESCE($1, name),
                amount = COALESCE($2, amount),
                description = COALESCE($3, description),
                duration_minutes = COALESCE($4, duration_minutes),
                is_active = COALESCE($5, is_active),
                icon = COALESCE($6, icon),
                updated_at = NOW()
             WHERE service_id = $7
             RETURNING *`,
      [
        updates.name,
        updates.amount,
        updates.description,
        updates.duration_minutes,
        updates.is_active,
        updates.icon,
        service_id,
      ],
    );
    if (rows.length === 0) {
      throw new Error("Service not found");
    }

    await client.query("COMMIT");
    return { success: true, data: rows[0], status: 200 };
  } catch (e) {
    await client.query("ROLLBACK");
    return { success: false, error: e.message, status: 404 };
  } finally {
    client.release();
  }
}

export async function deleteService(service_id) {
  const client = await getClient();
  try {
    await client.query("BEGIN");

    // Soft delete approach
    const { rows } = await client.query(
      `UPDATE gym_services
             SET is_active = FALSE
             WHERE service_id = $1
             RETURNING *`,
      [service_id],
    );

    if (rows.length === 0) {
      throw new Error("Service not found");
    }

    await client.query("COMMIT");
    return { success: true, message: "Service deactivated", status: 200 };
  } catch (e) {
    await client.query("ROLLBACK");
    return { success: false, error: e.message, status: 500 };
  } finally {
    client.release();
  }
}
