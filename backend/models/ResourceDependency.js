import mongoose from "mongoose";

const resourceDependencySchema = new mongoose.Schema(
  {
    dependencyId: { type: String, required: true, unique: true, index: true },
    sourceResourceId: { type: String, required: true, index: true },
    sourceResourceType: {
      type: String,
      enum: ["OPERATING_THEATRE", "EQUIPMENT", "BED", "STAFF", "DIAGNOSTIC"],
      required: true,
    },
    dependentWorkflow: { type: String, required: true },
    targetResourceId: { type: String, required: true, index: true },
    targetResourceType: {
      type: String,
      enum: ["OPERATING_THEATRE", "EQUIPMENT", "BED", "STAFF", "DIAGNOSTIC", "PATIENT_JOURNEY"],
      required: true,
    },
    impactType: {
      type: String,
      enum: ["DELAY_CASCADE", "WORKLOAD_SPIKE", "CAPACITY_LOCK", "BOTTLENECK", "BLOCKAGE"],
      default: "DELAY_CASCADE",
    },
    severity: {
      type: String,
      enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
      default: "MEDIUM",
    },
    delayMultiplier: { type: Number, default: 1.0 },
    description: { type: String, default: "" },
    mitigationStrategy: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.ResourceDependency ||
  mongoose.model("ResourceDependency", resourceDependencySchema);
