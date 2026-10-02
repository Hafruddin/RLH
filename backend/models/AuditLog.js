import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    auditId: { type: String, required: true, unique: true, index: true },
    timestamp: { type: Date, default: Date.now, index: true },
    actor: { type: String, required: true, default: "Nexus Orchestrator" },
    actorRole: { type: String, default: "SYSTEM" },
    action: { type: String, required: true, index: true },
    resourceType: { type: String, default: "" },
    resourceId: { type: String, default: null, index: true },
    patientId: { type: String, default: null, index: true },
    department: { type: String, default: "" },
    oldValue: { type: mongoose.Schema.Types.Mixed, default: null },
    newValue: { type: mongoose.Schema.Types.Mixed, default: null },
    reason: { type: String, default: "" },
    source: { type: String, default: "NEXUS_ORCHESTRATION" },
    recommendationId: { type: String, default: null },
    approvalStatus: { type: String, default: "AUTOMATIC" },
    executionResult: { type: String, default: "SUCCESS" },
  },
  { timestamps: true }
);

export default mongoose.models.AuditLog ||
  mongoose.model("AuditLog", auditLogSchema);
