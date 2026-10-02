// backend/models/User.js — MediCare Nexus Unified RBAC User Model
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ["PATIENT", "DOCTOR", "ADMIN", "STAFF"],
      required: true,
      index: true,
    },
    department: {
      type: String,
      default: "General",
      index: true,
    },
    permissions: [{ type: String }],
    associatedId: { type: String, default: null }, // patientId, doctorId, staffId
    phone: { type: String, default: "" },
    avatar: { type: String, default: "" },
    status: { type: String, enum: ["ACTIVE", "INACTIVE", "SUSPENDED"], default: "ACTIVE" },
    lastLoginAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
