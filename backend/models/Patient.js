import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    contact: { type: String, default: "" },
    bloodGroup: { type: String, default: "O+" },
    department: { type: String, default: "Emergency" },
    acuity: {
      type: String,
      enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
      default: "MEDIUM",
      index: true,
    },
    currentStatus: {
      type: String,
      enum: [
        "Waiting",
        "Triage",
        "Doctor",
        "Diagnostic",
        "In-Surgery",
        "Admitted",
        "Discharged",
      ],
      default: "Waiting",
      index: true,
    },
    currentWard: { type: String, default: null },
    currentBed: { type: String, default: null },
    admissionTime: { type: Date, default: Date.now },
    dischargeEstimate: { type: Date, default: null },
    vitals: {
      heartRate: { type: Number, default: 75 },
      spO2: { type: Number, default: 98 },
      bp: { type: String, default: "120/80" },
      temperature: { type: Number, default: 98.6 },
      respiratoryRate: { type: Number, default: 16 },
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Patient || mongoose.model("Patient", patientSchema);
