import mongoose from "mongoose";

const bedSchema = new mongoose.Schema(
  {
    bedId: { type: String, required: true, unique: true, index: true },
    wardId: { type: String, required: true, index: true },
    roomNumber: { type: String, required: true },
    bedType: {
      type: String,
      enum: ["ICU", "Standard", "Isolation", "Emergency", "Pediatric", "Recovery"],
      default: "Standard",
      index: true,
    },
    type: { type: String, default: "Standard" },
    ward: { type: String, default: "General Ward" },
    room: { type: String, default: "101" },
    bedNumber: { type: String, default: "1" },
    status: {
      type: String,
      enum: [
        "AVAILABLE",
        "RESERVED",
        "OCCUPIED",
        "DISCHARGE_PENDING",
        "CLEANING",
        "VERIFICATION_REQUIRED",
        "MAINTENANCE",
        "OUT_OF_SERVICE",
        "UNKNOWN",
      ],
      default: "AVAILABLE",
      index: true,
    },
    patientId: { type: String, default: null, index: true },
    location: { type: String, default: "Floor 1, Room 101" },
    source: { type: String, default: "SENSOR_BED_OCCUPANCY" },
    confidence: {
      type: String,
      enum: ["HIGH", "MEDIUM", "LOW", "UNKNOWN"],
      default: "HIGH",
    },
    verificationRequired: { type: Boolean, default: false },
    lastVerifiedAt: { type: Date, default: Date.now },
    lastUpdatedAt: { type: Date, default: Date.now },
    isolationCapable: { type: Boolean, default: false },
    equipment: [{ type: String }],
    statusHistory: [
      {
        previousStatus: String,
        newStatus: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: String, default: "System" },
        reason: { type: String, default: "" },
      },
    ],
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Bed || mongoose.model("Bed", bedSchema);
