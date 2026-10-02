import mongoose from "mongoose";

const resourceConflictSchema = new mongoose.Schema(
  {
    conflictId: { type: String, required: true, unique: true, index: true },
    resourceType: {
      type: String,
      enum: ["BED", "EQUIPMENT", "STAFF", "OPERATING_THEATRE", "DIAGNOSTIC"],
      required: true,
      index: true,
    },
    resourceId: { type: String, required: true, index: true },
    department: { type: String, default: "General" },
    sourceA: {
      system: { type: String, required: true },
      reportedStatus: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      details: { type: String, default: "" },
    },
    sourceB: {
      system: { type: String, required: true },
      reportedStatus: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      details: { type: String, default: "" },
    },
    status: {
      type: String,
      enum: ["OPEN", "RESOLVED", "IGNORED"],
      default: "OPEN",
      index: true,
    },
    discrepancyDescription: { type: String, required: true },
    resolvedBy: { type: String, default: null },
    resolvedAt: { type: Date, default: null },
    resolutionAction: { type: String, default: null },
    resolutionReason: { type: String, default: null },
    finalStatus: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.ResourceConflict ||
  mongoose.model("ResourceConflict", resourceConflictSchema);
