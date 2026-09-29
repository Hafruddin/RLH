import mongoose from "mongoose";

const patientQueueSchema = new mongoose.Schema(
  {
    queueId: { type: String, required: true, unique: true, index: true },
    patientId: { type: String, required: true, index: true },
    department: { type: String, required: true },
    priority: {
      type: String,
      enum: ["P1-Emergency", "P2-Urgent", "P3-Standard", "P4-Routine"],
      default: "P3-Standard",
      index: true,
    },
    waitingSince: { type: Date, default: Date.now },
    estimatedServiceTime: { type: Date },
    status: {
      type: String,
      enum: ["WAITING", "IN_SERVICE", "COMPLETED", "CANCELLED"],
      default: "WAITING",
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.PatientQueue ||
  mongoose.model("PatientQueue", patientQueueSchema);
