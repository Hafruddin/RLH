import mongoose from "mongoose";

const bedSchema = new mongoose.Schema(
  {
    bedId: { type: String, required: true, unique: true, index: true },
    wardId: { type: String, required: true, index: true },
    roomNumber: { type: String, required: true },
    bedType: {
      type: String,
      enum: ["ICU", "Standard", "Isolation", "Emergency", "Pediatric", "Recovery"],
      default: "Standard",
      index: true,
    },
    status: {
      type: String,
      enum: ["AVAILABLE", "OCCUPIED", "RESERVED", "CLEANING", "MAINTENANCE"],
      default: "AVAILABLE",
      index: true,
    },
    patientId: { type: String, default: null, index: true },
    location: { type: String, default: "Floor 1, Room 101" },
    isolationCapable: { type: Boolean, default: false },
    equipment: [{ type: String }],
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Bed || mongoose.model("Bed", bedSchema);
