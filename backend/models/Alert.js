import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    alertId: { type: String, required: true, unique: true, index: true },
    type: {
      type: String,
      enum: [
        "EMERGENCY",
        "BOTTLENECK",
        "STAFF_OVERLOAD",
        "BED_SHORTAGE",
        "REALLOCATION",
        "MAINTENANCE",
        "SYSTEM",
      ],
      required: true,
      index: true,
    },
    severity: {
      type: String,
      enum: ["CRITICAL", "HIGH", "MEDIUM", "INFO"],
      default: "MEDIUM",
      index: true,
    },
    recipientRole: {
      type: String,
      enum: ["ADMIN", "DOCTOR", "NURSE", "OPERATIONS", "TECHNICIAN", "ALL"],
      default: "ALL",
      index: true,
    },
    recipientId: { type: String, default: null },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["UNREAD", "ACKNOWLEDGED", "RESOLVED"],
      default: "UNREAD",
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Alert || mongoose.model("Alert", alertSchema);
