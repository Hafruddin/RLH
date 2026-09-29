import mongoose from "mongoose";

const wardSchema = new mongoose.Schema(
  {
    wardId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["ICU", "Emergency", "General", "Surgical", "Pediatric", "Cardiology"],
      required: true,
      index: true,
    },
    floor: { type: Number, default: 1 },
    totalBeds: { type: Number, default: 10 },
    availableBeds: { type: Number, default: 5 },
    occupiedBeds: { type: Number, default: 5 },
    location: { type: String, default: "Wing A" },
  },
  { timestamps: true }
);

export default mongoose.models.Ward || mongoose.model("Ward", wardSchema);
