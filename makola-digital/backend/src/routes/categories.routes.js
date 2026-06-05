import { Router } from "express";
import { db } from "../config/db.js";

const router = Router();

router.get("/counts", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.name, COUNT(l.id) as count
      FROM categories c
      LEFT JOIN listings l ON l.category_id = c.id AND l.status = 'active'
      GROUP BY c.name
    `);
    const counts = {};
    result.rows.forEach(r => { counts[r.name] = parseInt(r.count); });
    // Also get counts by listing type
    const typeResult = await db.query(
      `SELECT type, COUNT(*) as count FROM listings WHERE status = 'active' GROUP BY type`
    );
    const typeCounts = {};
    typeResult.rows.forEach(r => { typeCounts[r.type] = parseInt(r.count); });
    
    // Total active listings
    const totalResult = await db.query("SELECT COUNT(*) as total FROM listings WHERE status = 'active'");
    const total = parseInt(totalResult.rows[0].total);
    
    res.json({ counts, typeCounts, total });
  } catch (err) {
    console.error("category counts:", err);
    res.status(500).json({ message: "Failed to fetch counts" });
  }
});

export default router;
