import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema(
  {
    equipmentId: { type: String, required: true, unique: true, index: true },
    type: {
      type: String,
      enum: [
        "Ventilator",
        "ECG",
        "Patient Monitor",
        "X-Ray",
        "Ultrasound",
        "CT",
        "MRI",
        "Infusion Pump",
        "Defibrillator",
      ],
      required: true,
      index: true,
    },
    equipmentType: { type: String, default: "" },
    name: { type: String, required: true },
    status: {
      type: String,
      enum: [
        "AVAILABLE",
        "IN_USE",
        "RESERVED",
        "MAINTENANCE",
        "DOWN",
        "UNAVAILABLE",
        "UNKNOWN",
      ],
      default: "AVAILABLE",
      index: true,
    },
    currentLocation: { type: String, default: "Equipment Storage A" },
    location: { type: String, default: "Equipment Storage A" },
    assignedPatient: { type: String, default: null },
    currentPatientId: { type: String, default: null },
    department: { type: String, default: "Emergency" },
    source: { type: String, default: "RTLS_TRACKING" },
    confidence: {
      type: String,
      enum: ["HIGH", "MEDIUM", "LOW", "UNKNOWN"],
      default: "HIGH",
    },
    lastVerifiedAt: { type: Date, default: Date.now },
    lastUpdatedAt: { type: Date, default: Date.now },
    statusHistory: [
      {
        previousStatus: String,
        newStatus: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: String, default: "System" },
        reason: { type: String, default: "" },
      },
    ],
    maintenanceStatus: {
      type: String,
      enum: ["GOOD", "SERVICE_DUE", "UNDER_REPAIR"],
      default: "GOOD",
    },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Equipment || mongoose.model("Equipment", equipmentSchema);
