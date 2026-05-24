import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
dotenv.config();

import authRoutes from "./routes/auth.routes.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({
  origin: [
    "https://makoladigital.online",
    "https://www.makoladigital.online",
    "https://makoladigital-production.up.railway.app",
    "http://localhost:3000"
  ],
  credentials: true
}));
app.use(express.json());

app.get("/api/v1/health", (req, res) => res.json({ status: "ok", platform: "Makola Digital", version: "1.0.0" }));
app.use("/api/v1/auth", authRoutes);

app.listen(PORT, "0.0.0.0", () => console.log(`🌍 Makola Digital API running on port ${PORT}`));
export default app;
