import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
dotenv.config();
import { redis } from "./config/redis.js";
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

app.get("/api/v1/health", (req, res) => res.json({ status: "ok", platform: "Makola Digital", version: "1.0.0" }));
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/listings", listingsRoutes);
app.use("/api/v1/categories", categoriesRoutes);
app.use("/api/v1/kyc", kycRoutes);
app.use("/api/v1/reviews", reviewsRoutes);
app.use("/api/v1/disputes", disputesRoutes);

app.get('/api/v1/admin/users', async (req, res) => {
  try {
    const { db } = await import('./config/db.js');
    const result = await db.query('SELECT id, full_name, email, phone, role, kyc_status, is_active, created_at FROM users ORDER BY created_at DESC');
    res.json({ users: result.rows });
  } catch(err) { res.status(500).json({ message: 'Failed to fetch users' }); }
});

app.listen(PORT, "0.0.0.0", () => console.log(`🌍 Makola Digital API running on port ${PORT}`));
export default app;
