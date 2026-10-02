import mongoose from "mongoose";

const diagnosticResourceSchema = new mongoose.Schema(
  {
    resourceId: { type: String, required: true, unique: true, index: true },
    type: {
      type: String,
      enum: ["X-Ray", "MRI", "CT", "Ultrasound", "Blood Lab", "ECG", "Pathology"],
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    department: { type: String, default: "Radiology" },
    status: {
      type: String,
      enum: [
        "AVAILABLE",
        "IN_USE",
        "BUSY",
        "QUEUED",
        "MAINTENANCE",
        "DOWN",
        "UNAVAILABLE",
        "UNKNOWN",
      ],
      default: "AVAILABLE",
      index: true,
    },
    queueLength: { type: Number, default: 0 },
    averageWaitTime: { type: Number, default: 10 }, // in minutes
    currentPatient: { type: String, default: null },
    capacity: { type: Number, default: 20 }, // patients per day
    location: { type: String, default: "Diagnostic Block Ground Floor" },
    source: { type: String, default: "DIAGNOSTIC_RIS_PACS" },
    confidence: {
      type: String,
      enum: ["HIGH", "MEDIUM", "LOW", "UNKNOWN"],
      default: "HIGH",
    },
    lastVerifiedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.DiagnosticResource ||
  mongoose.model("DiagnosticResource", diagnosticResourceSchema);
