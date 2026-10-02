import mongoose from "mongoose";

const patientTransferSchema = new mongoose.Schema(
  {
    transferId: { type: String, required: true, unique: true, index: true },
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, default: "Inpatient" },
    sourceDepartment: { type: String, required: true, index: true },
    sourceWard: { type: String, required: true },
    sourceBedId: { type: String, required: true },
    targetDepartment: { type: String, required: true, index: true },
    targetWard: { type: String, required: true },
    targetBedId: { type: String, default: null },
    status: {
      type: String,
      enum: [
        "TRANSFER_REQUESTED",
        "TRANSFER_APPROVED",
        "IN_TRANSIT",
        "ARRIVED",
        "ASSIGNED",
        "CANCELLED",
      ],
      default: "TRANSFER_REQUESTED",
      index: true,
    },
    clinicalReason: { type: String, default: "" },
    priority: {
      type: String,
      enum: ["CRITICAL", "URGENT", "ROUTINE"],
      default: "ROUTINE",
    },
    requestedBy: { type: String, default: "Ward In-Charge" },
    requestedAt: { type: Date, default: Date.now },
    approvedBy: { type: String, default: null },
    approvedAt: { type: Date, default: null },
    inTransitAt: { type: Date, default: null },
    arrivedAt: { type: Date, default: null },
    arrivalConfirmedBy: { type: String, default: null },
    assignedAt: { type: Date, default: null },
    auditLog: [
      {
        stage: String,
        timestamp: { type: Date, default: Date.now },
        actor: String,
        note: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.PatientTransfer ||
  mongoose.model("PatientTransfer", patientTransferSchema);
