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
    name: { type: String, required: true },
    status: {
      type: String,
      enum: ["AVAILABLE", "IN_USE", "RESERVED", "MAINTENANCE"],
      default: "AVAILABLE",
      index: true,
    },
    currentLocation: { type: String, default: "Equipment Storage A" },
    assignedPatient: { type: String, default: null },
    department: { type: String, default: "Emergency" },
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
