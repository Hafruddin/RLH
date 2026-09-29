import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import { connectDB, dbConnectionInfo } from './config/db.js';

// Lightweight Clerk session middleware
const clerkMiddleware = () => (req, res, next) => {
  req.auth = req.auth || { userId: req.headers["x-user-id"] || req.query.userId || "user_patient_demo" };
  next();
};
import appointmentRouter from './routes/appointmentRouter.js';
import doctorRouter from './routes/doctorRouter.js';
import serviceRouter from './routes/serviceRoutes.js';
import serviceAppointmentRouter from './routes/serviceAppointmentRouter.js';
import nexusRouter from './routes/nexusRouter.js';

const app = express();
const port = process.env.PORT || 4000;

// ⭐ IMPORTANT: ENABLE CREDENTIALS FOR CLERK COOKIE SESSION
const allowedOrigins = [
  "http://localhost:5173", // user frontend
  "http://localhost:5174", // admin dashboard
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow any origin for dev/sharing tunnels
      return callback(null, true);
    },
    credentials: true, // ✅ REQUIRED for cookies / Clerk
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


// ⭐ Use Clerk middleware globally (does NOT protect routes)
app.use(clerkMiddleware());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// Database Connection
connectDB();

// Static uploads folder
app.use('/assets', express.static(path.join(process.cwd(), 'assets')));

// Routes (unchanged + Nexus Orchestration)
app.use("/api/appointments", appointmentRouter);
app.use("/api/doctors", doctorRouter);
app.use("/api/services", serviceRouter);
app.use("/api/service-appointments", serviceAppointmentRouter);
app.use("/api/nexus", nexusRouter);
app.use("/api", nexusRouter); // also mount top-level for convenience

// Auto-seed Nexus Demo data when MongoDB connects
mongoose.connection.once("open", async () => {
  try {
    const { default: Bed } = await import("./models/Bed.js");
    const { seedNexusData } = await import("./services/seedService.js");
    const bedCount = await Bed.countDocuments();
    if (bedCount === 0) {
      console.log("⚡ [Nexus Boot] No beds found in MongoDB. Initializing seed data...");
      await seedNexusData();
    } else {
      console.log(`⚡ [Nexus Boot] Connected to DB with ${bedCount} beds ready.`);
    }
  } catch (err) {
    console.warn("⚠️ [Nexus Boot] Auto-seed check warning:", err.message);
  }
});

// Test route
app.get('/', (req, res) => {
    const uri = process.env.MONGODB_URI || "";
    res.json({
        message: 'API Working ',
        version: '1.0.4',
        dbState: mongoose.connection.readyState,
        dbError: dbConnectionInfo.error,
        hasUri: !!uri,
        uriLength: uri.length,
        uriMasked: uri.slice(0, 20) + "..." + uri.slice(-25),
        uriStartsWithMongo: uri.startsWith("mongodb+srv://") || uri.startsWith("mongodb://"),
        uriHasQuotes: uri.includes('"') || uri.includes("'"),
        uriHasSpaces: uri.includes(' ') || uri.includes('\r') || uri.includes('\n'),
        hasSecret: !!process.env.JWT_SECRET
    });
});

app.listen(port, () => {
    console.log(`Server Started on http://localhost:${port}`);
});
