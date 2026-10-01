import mongoose from "mongoose";

const emergencyEventSchema = new mongoose.Schema(
  {
    emergencyId: { type: String, required: true, unique: true, index: true },
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, default: "Emergency Patient" },
    severity: {
      type: String,
      enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
      required: true,
      index: true,
    },
    vitals: {
      heartRate: { type: Number, default: 120 },
      spO2: { type: Number, default: 88 },
      bp: { type: String, default: "90/60" },
      temperature: { type: Number, default: 99.1 },
      respiratoryRate: { type: Number, default: 24 },
    },
    requiredResources: [{ type: String }],
    status: {
      type: String,
      enum: [
        "CREATED",
        "TRIAGE",
        "RESOURCE_REQUIRED",
        "RESOURCE_ALLOCATING",
        "RESOURCE_ALLOCATED",
        "IN_PROGRESS",
        "ACTIVE",
        "CONTAINED",
        "ESCALATED",
        "RESOLVED",
        "CLOSED",
      ],
      default: "ACTIVE",
      index: true,
    },
    assignedResources: {
      bedId: { type: String, default: null },
      doctorId: { type: String, default: null },
      doctorName: { type: String, default: null },
      nurseId: { type: String, default: null },
      nurseName: { type: String, default: null },
      equipmentIds: [{ type: String }],
      otId: { type: String, default: null },
      diagnosticResourceId: { type: String, default: null },
    },
    escalationLevel: {
      type: Number,
      enum: [1, 2, 3, 4],
      default: 1,
    },
    responseTime: { type: Number, default: 0 }, // seconds elapsed
    auditTrail: [
      {
        timestamp: { type: Date, default: Date.now },
        action: { type: String, required: true },
        details: { type: String, default: "" },
        actor: { type: String, default: "Nexus Orchestrator" },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.EmergencyEvent ||
  mongoose.model("EmergencyEvent", emergencyEventSchema);
