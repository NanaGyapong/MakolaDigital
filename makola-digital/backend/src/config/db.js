import pg from "pg";
const { Pool } = pg;
export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});
db.connect()
  .then(() => console.log("✅ PostgreSQL connected"))
  .catch(err => console.log("⚠️ PostgreSQL:", err.message));
export default db;
