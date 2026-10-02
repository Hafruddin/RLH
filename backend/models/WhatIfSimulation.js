import mongoose from "mongoose";

const whatIfSimulationSchema = new mongoose.Schema(
  {
    simulationId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    scenarioType: {
      type: String,
      enum: [
        "STAFF_DEFICIT",
        "EQUIPMENT_OUTAGE",
        "OT_DELAY",
        "EMERGENCY_SURGE",
        "BED_DEPLETION",
        "CUSTOM",
      ],
      required: true,
    },
    inputParameters: { type: mongoose.Schema.Types.Mixed, default: {} },
    baselineState: {
      avgWaitMinutes: Number,
      icuOccupancyPercent: Number,
      staffWorkloadPercent: Number,
      diagnosticWaitMinutes: Number,
      bottlenecksDetected: Number,
    },
    simulatedState: {
      avgWaitMinutes: Number,
      icuOccupancyPercent: Number,
      staffWorkloadPercent: Number,
      diagnosticWaitMinutes: Number,
      bottlenecksDetected: Number,
    },
    affectedResources: [{ type: String }],
    secondaryBottlenecks: [{ type: String }],
    feasibleOptions: [
      {
        optionId: String,
        title: String,
        action: String,
        impactScore: Number,
        constraintsSatisfied: Boolean,
      },
    ],
    recommendedOption: { type: String, default: "" },
    createdBy: { type: String, default: "Operations Supervisor" },
  },
  { timestamps: true }
);

export default mongoose.models.WhatIfSimulation ||
  mongoose.model("WhatIfSimulation", whatIfSimulationSchema);
