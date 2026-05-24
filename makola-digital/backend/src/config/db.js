import pg from "pg";
const { Pool } = pg;
export const db = new Pool({
  host: "localhost",
  port: 5432,
  database: "makola_db",
  user: "makola",
  password: "MakolaDB2024x",
});
db.connect()
  .then(() => console.log("✅ PostgreSQL connected"))
  .catch(err => console.log("⚠️ PostgreSQL:", err.message));
export default db;
