import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
dotenv.config({ path: "../../../.env" });

import authRoutes from "./routes/auth.routes.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));
app.use(express.json());

app.get("/api/v1/health", (req, res) => res.json({ status: "ok", platform: "Makola Digital", version: "1.0.0" }));
app.use("/api/v1/auth", authRoutes);

app.listen(PORT, () => console.log(`🌍 Makola Digital API running on http://localhost:${PORT}`));
export default app;
