import mongoose from "mongoose";

const allocationRecommendationSchema = new mongoose.Schema(
  {
    recommendationId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    action: {
      type: String,
      enum: [
        "STAFF_REALLOCATION",
        "BED_ALLOCATION",
        "EQUIPMENT_SUBSTITUTION",
        "OT_RESCHEDULE",
        "DIAGNOSTIC_REROUTE",
        "EMERGENCY_ESCALATION",
      ],
      required: true,
      index: true,
    },
    resourceId: { type: String, required: true, index: true },
    resourceName: { type: String, default: "" },
    resourceType: { type: String, required: true },
    fromDepartment: { type: String, default: null },
    toDepartment: { type: String, default: null },
    targetPatientId: { type: String, default: null },
    reason: { type: String, required: true },
    constraintChecks: [
      {
        rule: { type: String, required: true },
        passed: { type: Boolean, required: true },
        detail: { type: String, default: "" },
      },
    ],
    operationalImpact: {
      recipientGain: { type: String, default: "" },
      donorImpact: { type: String, default: "" },
      bufferPreserved: { type: Boolean, default: true },
      secondaryRisks: [{ type: String }],
    },
    confidenceScore: { type: Number, min: 0, max: 100, default: 90 },
    riskLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "LOW",
    },
    approvalRequired: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "EXECUTED", "CANCELLED"],
      default: "PENDING",
      index: true,
    },
    approvedBy: { type: String, default: null },
    approvedAt: { type: Date, default: null },
    rejectedBy: { type: String, default: null },
    rejectedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: null },
    executedAt: { type: Date, default: null },
    executionResult: { type: String, default: null },
    alternatives: [
      {
        resourceId: String,
        resourceName: String,
        score: Number,
        tradeoff: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.AllocationRecommendation ||
  mongoose.model("AllocationRecommendation", allocationRecommendationSchema);
