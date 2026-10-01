import mongoose from "mongoose";

const otSchema = new mongoose.Schema(
  {
    otId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["General", "Cardiac", "Orthopedic", "Neuro", "Emergency", "Maternity"],
      default: "General",
    },
    department: { type: String, default: "Surgery" },
    location: { type: String, default: "Surgical Wing, 3rd Floor" },
    status: {
      type: String,
      enum: ["AVAILABLE", "SCHEDULED", "IN_USE", "OCCUPIED", "DELAYED", "CLEANING", "MAINTENANCE", "UNAVAILABLE", "UNKNOWN"],
      default: "AVAILABLE",
      index: true,
    },
    currentProcedure: { type: String, default: null },
    surgeon: { type: String, default: null },
    assignedSurgeon: { type: String, default: null },
    scheduledStart: { type: Date, default: null },
    scheduledEnd: { type: Date, default: null },
    equipmentRequired: [{ type: String }],
    staffRequired: [{ type: String }],
    assignedTeam: {
      anesthetist: { type: String, default: null },
      nurses: [{ type: String }],
    },
    availableFrom: { type: Date, default: Date.now },
    equipment: [{ type: String }],
    lastUpdatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.OperatingTheatre || mongoose.model("OperatingTheatre", otSchema);
