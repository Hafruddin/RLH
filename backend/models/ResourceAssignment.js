import mongoose from "mongoose";

const resourceAssignmentSchema = new mongoose.Schema(
  {
    assignmentId: { type: String, required: true, unique: true, index: true },
    patientId: { type: String, required: true, index: true },
    emergencyId: { type: String, default: null, index: true },
    bedId: { type: String, default: null },
    doctorId: { type: String, default: null },
    nurseId: { type: String, default: null },
    equipmentIds: [{ type: String }],
    diagnosticResourceId: { type: String, default: null },
    otId: { type: String, default: null },
    allocationScore: { type: Number, default: 85 }, // 0 to 100
    allocationReason: [{ type: String }],
    status: {
      type: String,
      enum: ["ACTIVE", "REALLOCATED", "COMPLETED", "CANCELLED"],
      default: "ACTIVE",
      index: true,
    },
    conflictDetected: { type: Boolean, default: false },
    reallocationReason: { type: String, default: null },
    assignedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.ResourceAssignment ||
  mongoose.model("ResourceAssignment", resourceAssignmentSchema);
