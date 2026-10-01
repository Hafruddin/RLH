import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
  {
    staffId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ["Doctor", "Nurse", "Technician", "Surgeon", "Anesthetist", "Support Staff"],
      required: true,
      index: true,
    },
    specialization: { type: String, default: "General" },
    department: { type: String, default: "Emergency", index: true },
    shift: { type: String, default: "Morning" },
    shiftStart: { type: String, default: "08:00" },
    shiftEnd: { type: String, default: "20:00" },
    status: {
      type: String,
      enum: ["AVAILABLE", "ON_DUTY", "ASSIGNED", "ON_BREAK", "ON_LEAVE", "OFF_DUTY", "ON_CALL", "IN_SURGERY", "BREAK", "UNAVAILABLE", "UNKNOWN"],
      default: "AVAILABLE",
      index: true,
    },
    currentAssignment: { type: String, default: "General Duty" },
    availability: { type: String, default: "AVAILABLE" },
    workload: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "LOW",
    },
    workloadScore: { type: Number, default: 20 }, // 0 to 100
    currentLocation: { type: String, default: "Emergency Desk" },
    assignedPatients: [{ type: String }],
    skills: [{ type: String }],
    emergencyEligible: { type: Boolean, default: true },
    contact: { type: String, default: "" },
    lastUpdatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Staff || mongoose.model("Staff", staffSchema);
