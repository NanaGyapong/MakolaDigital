import express from "express";
import { sendWeeklyAnalytics } from "./jobs/weekly-analytics.js";
import { sendBuyerRecommendations } from "./jobs/buyer-recommendations.js";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
dotenv.config();
import { redis } from "./config/redis.js";
import messagesRoutes from "./routes/messages.routes.js";
import disputesRoutes from "./routes/disputes.routes.js";
import reviewsRoutes from "./routes/reviews.routes.js";
import kycRoutes from "./routes/kyc.routes.js";
import categoriesRoutes from "./routes/categories.routes.js";
import listingsRoutes from "./routes/listings.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.set("trust proxy", 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: [
    "https://makoladigital.online",
    "https://www.makoladigital.online",
    "https://makola-digital.vercel.app",
    "https://makoladigital-production.up.railway.app",
    "http://localhost:3000"
  ],
  credentials: true
}));
app.use(express.json());
app.use((req, res, next) => { req.redis = redis; next(); });

// Create disputes table if not exists
app.post('/api/v1/track-visit', async (req, res) => {
  try {
    const { db } = await import('./config/db.js');
    const visitorId = req.headers['x-visitor-id'] || req.ip;
    await db.query('INSERT INTO page_visits (visitor_id, page) VALUES ($1, $2)', [visitorId, 'homepage']);
    res.json({ ok: true });
  } catch(err) { console.error("track-visit error:", err.message); res.json({ ok: false, error: err.message }); }
});

app.get('/api/v1/visit-stats', async (req, res) => {
  try {
    const { db } = await import('./config/db.js');
    const today = await db.query('SELECT COUNT(*) as count FROM page_visits WHERE created_at > NOW() - INTERVAL \'24 hours\'');
    const week = await db.query('SELECT COUNT(*) as count FROM page_visits WHERE created_at > NOW() - INTERVAL \'7 days\'');
    const total = await db.query('SELECT COUNT(*) as count FROM page_visits');
    res.json({ today: parseInt(today.rows[0].count), week: parseInt(week.rows[0].count), total: parseInt(total.rows[0].count) });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/v1/stats', async (req, res) => {
  try {
    const { db: dbConn } = await import('./config/db.js');
    const [users, listings] = await Promise.all([
      dbConn.query("SELECT COUNT(*) as total, COUNT(CASE WHEN role = 'seller' THEN 1 END) as sellers FROM users"),
      dbConn.query("SELECT COUNT(*) as total FROM listings WHERE status = 'active'")
    ]);
    res.json({
      users: parseInt(users.rows[0].total),
      sellers: parseInt(users.rows[0].sellers),
      listings: parseInt(listings.rows[0].total)
    });
  } catch(err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/v1/health', (req, res) => res.json({ status: "ok", platform: "Makola Digital", version: "1.0.0" }));
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/listings", listingsRoutes);
app.use("/api/v1/categories", categoriesRoutes);
app.use("/api/v1/kyc", kycRoutes);
app.use("/api/v1/reviews", reviewsRoutes);
app.use("/api/v1/disputes", disputesRoutes);
app.use("/api/v1/messages", messagesRoutes);

app.get('/api/v1/admin/users', async (req, res) => {
  try {
    const { db } = await import('./config/db.js');
    const result = await db.query('SELECT id, full_name, email, phone, role, kyc_status, is_active, created_at FROM users ORDER BY created_at DESC');
    res.json({ users: result.rows });
  } catch(err) { res.status(500).json({ message: 'Failed to fetch users' }); }
});

// Create tables after db is ready
setTimeout(async () => {
  const { db: dbConn } = await import("./config/db.js");
  try {
    await dbConn.query(`DROP TABLE IF EXISTS messages CASCADE`).catch(()=>{});
    await dbConn.query(`CREATE TABLE IF NOT EXISTS messages (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), listing_id UUID REFERENCES listings(id), sender_id UUID REFERENCES users(id), receiver_id UUID REFERENCES users(id), body TEXT NOT NULL, offer_amount DECIMAL, type VARCHAR(20) DEFAULT 'message', is_read BOOLEAN DEFAULT false, created_at TIMESTAMP DEFAULT NOW())`);
    await dbConn.query(`CREATE TABLE IF NOT EXISTS disputes (id UUID PRIMARY KEY, listing_id UUID REFERENCES listings(id), buyer_id UUID REFERENCES users(id), seller_id UUID REFERENCES users(id), reason TEXT NOT NULL, status VARCHAR(20) DEFAULT 'open', created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())`);
    console.log('Tables ready');
  } catch(e) { console.log('Table setup:', e.message); }
}, 2000);

// Run email campaigns Monday, Wednesday and Saturday at 8am
setInterval(async () => {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon, 3=Wed, 6=Sat
  const hour = now.getHours();
  if ((day === 1 || day === 3 || day === 6) && hour === 8) {
    await sendWeeklyAnalytics();
    await sendBuyerRecommendations();
  }
}, 60 * 60 * 1000); // Check every hour
});
export default app;
