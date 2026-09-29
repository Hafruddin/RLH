import mongoose from "mongoose";

const forecastSchema = new mongoose.Schema(
  {
    department: {
      type: String,
      enum: ["Emergency", "ICU", "General Ward", "Diagnostics", "Operating Theatre"],
      required: true,
      index: true,
    },
    timeWindow: {
      type: String,
      enum: ["Current", "1 Hour", "2 Hours", "4 Hours"],
      required: true,
    },
    currentLoad: { type: Number, required: true },
    predictedLoad: { type: Number, required: true },
    confidence: { type: Number, default: 92 }, // percentage
    riskLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM",
    },
    recommendedActions: [{ type: String }],
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Forecast || mongoose.model("Forecast", forecastSchema);
