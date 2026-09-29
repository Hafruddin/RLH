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
    shiftStart: { type: String, default: "08:00" },
    shiftEnd: { type: String, default: "20:00" },
    status: {
      type: String,
      enum: ["ON_DUTY", "OFF_DUTY", "ON_CALL", "IN_SURGERY", "BREAK"],
      default: "ON_DUTY",
      index: true,
    },
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
  },
  { timestamps: true }
);

export default mongoose.models.Staff || mongoose.model("Staff", staffSchema);
