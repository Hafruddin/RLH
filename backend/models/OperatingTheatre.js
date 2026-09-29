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
    status: {
      type: String,
      enum: ["AVAILABLE", "OCCUPIED", "RESERVED", "MAINTENANCE"],
      default: "AVAILABLE",
      index: true,
    },
    currentProcedure: { type: String, default: null },
    assignedSurgeon: { type: String, default: null },
    assignedTeam: {
      anesthetist: { type: String, default: null },
      nurses: [{ type: String }],
    },
    availableFrom: { type: Date, default: Date.now },
    equipment: [{ type: String }],
    location: { type: String, default: "Surgical Wing, 3rd Floor" },
  },
  { timestamps: true }
);

export default mongoose.models.OperatingTheatre || mongoose.model("OperatingTheatre", otSchema);
