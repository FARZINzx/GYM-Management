import pkg from "pg";
const { Pool } = pkg;
import env from "./env.js";

const pool = new Pool({
  host: env.DB.HOST,
  port: env.DB.PORT,
  user: env.DB.USER,
  password: env.DB.PASSWORD,
  database: env.DB.NAME,
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await pool.end();
  process.exit(0);
});

export const query = async (text, params) => pool.query(text, params);
export const getClient = () => pool.connect();
