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
      enum: ["AVAILABLE", "BUSY", "MAINTENANCE"],
      default: "AVAILABLE",
      index: true,
    },
    queueLength: { type: Number, default: 0 },
    averageWaitTime: { type: Number, default: 10 }, // in minutes
    currentPatient: { type: String, default: null },
    capacity: { type: Number, default: 20 }, // patients per day
    location: { type: String, default: "Diagnostic Block Ground Floor" },
  },
  { timestamps: true }
);

export default mongoose.models.DiagnosticResource ||
  mongoose.model("DiagnosticResource", diagnosticResourceSchema);
