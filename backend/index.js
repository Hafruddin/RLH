// backend/index.js — MediCare Nexus Production Server
import cors from "cors";
import "dotenv/config";
import express from "express";
import path from "path";
import mongoose from "mongoose";
import { connectDB, dbConnectionInfo } from "./config/db.js";
import { errorHandler } from "./middlewares/errorHandler.js";

// Clerk shim (attaches req.auth from x-user-id header or query)
const clerkMiddleware = () => (req, res, next) => {
  req.auth = req.auth || {
    userId:
      req.headers["x-user-id"] ||
      req.query.userId ||
      "user_patient_demo",
  };
  next();
};

import authRouter from "./routes/authRouter.js";
import appointmentRouter from "./routes/appointmentRouter.js";
import doctorRouter from "./routes/doctorRouter.js";
import serviceRouter from "./routes/serviceRoutes.js";
import serviceAppointmentRouter from "./routes/serviceAppointmentRouter.js";
import nexusRouter from "./routes/nexusRouter.js";
import voiceRouter from "./routes/voiceRouter.js";
import voiceToolsRouter from "./routes/voiceToolsRouter.js";
import n8nRouter from "./routes/n8nRouter.js";
import opdRouter from "./routes/opdRouter.js";

const app = express();
const port = process.env.PORT || 4000;

// ─────────────────────────────────────────────
// CORS — Production-ready
// ─────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  "http://localhost:5173",       // patient portal dev
  "http://localhost:5174",       // admin portal dev
  "https://medi-nexus-rhl.netlify.app", // patient portal PRODUCTION
  "https://medi-nexus-rlh.netlify.app", // alternate spelling
];

// Add any extra origin from env (e.g. FRONTEND_URL=https://...)
if (process.env.FRONTEND_URL) ALLOWED_ORIGINS.push(process.env.FRONTEND_URL);
if (process.env.CLIENT_URL) ALLOWED_ORIGINS.push(process.env.CLIENT_URL);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g. curl, Postman, n8n server-side)
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      // In development, allow all origins
      if (process.env.NODE_ENV !== "production") return callback(null, true);
      return callback(new Error(`CORS: origin ${origin} not allowed`), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-user-id",
      "x-mnx-service-key",
    ],
  })
);

// ─────────────────────────────────────────────
// Global Middlewares
// ─────────────────────────────────────────────
app.use(clerkMiddleware());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// ─────────────────────────────────────────────
// Database
// ─────────────────────────────────────────────
connectDB();

// ─────────────────────────────────────────────
// Static Assets
// ─────────────────────────────────────────────
app.use("/assets", express.static(path.join(process.cwd(), "assets")));

// ─────────────────────────────────────────────
// Health Endpoint (PUBLIC — required by Render/Railway/n8n)
// ─────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus =
    dbState === 1 ? "connected" : dbState === 2 ? "connecting" : "disconnected";

  res.json({
    success: true,
    status: "ok",
    service: "MediCare Nexus API",
    version: "1.0.5",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    database: dbStatus,
    timezone: "Asia/Kolkata",
  });
});

// ─────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/appointments", appointmentRouter);
app.use("/api/doctors", doctorRouter);
app.use("/api/services", serviceRouter);
app.use("/api/service-appointments", serviceAppointmentRouter);
app.use("/api/nexus", nexusRouter);
app.use("/api", nexusRouter);           // convenience mount
app.use("/api/voice", voiceRouter);
app.use("/api/voice-tools", voiceToolsRouter);
app.use("/api/opd", opdRouter);

// N8N / Service-to-service routes (protected by x-mnx-service-key)
app.use("/api/n8n", n8nRouter);

// ─────────────────────────────────────────────
// Root (debug — masks secrets)
// ─────────────────────────────────────────────
app.get("/", (req, res) => {
  const dbState = mongoose.connection.readyState;
  res.json({
    message: "MediCare Nexus API",
    version: "1.0.5",
    status: "running",
    dbState: dbState === 1 ? "connected" : "disconnected",
    dbError: dbConnectionInfo.error,
    health: "/api/health",
    docs: "/api/n8n/health",
  });
});

// ─────────────────────────────────────────────
// Auto-seed Nexus demo data
// ─────────────────────────────────────────────
mongoose.connection.once("open", async () => {
  try {
    const { default: Bed } = await import("./models/Bed.js");
    const { seedNexusData } = await import("./services/seedService.js");
    const bedCount = await Bed.countDocuments();
    if (bedCount === 0) {
      console.log("⚡ [Nexus Boot] Initializing seed data...");
      await seedNexusData();
    } else {
      console.log(`⚡ [Nexus Boot] DB ready — ${bedCount} beds loaded.`);
    }
  } catch (err) {
    console.warn("⚠️ [Nexus Boot] Auto-seed warning:", err.message);
  }
});

// ─────────────────────────────────────────────
// 404 Handler
// ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    errorCode: "NOT_FOUND",
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// ─────────────────────────────────────────────
// Centralized Error Handler
// ─────────────────────────────────────────────
app.use(errorHandler);

// ─────────────────────────────────────────────
// Start
// ─────────────────────────────────────────────
app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 MediCare Nexus API running on port ${port}`);
  console.log(`   Health: http://localhost:${port}/api/health`);
  console.log(`   N8N:    http://localhost:${port}/api/n8n/health`);
  console.log(`   Env:    ${process.env.NODE_ENV || "development"}`);
});
