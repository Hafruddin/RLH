import mongoose from "mongoose";

const rtlsLocationSchema = new mongoose.Schema(
  {
    resourceId: { type: String, required: true, unique: true, index: true },
    resourceType: {
      type: String,
      enum: ["Doctor", "Nurse", "Ventilator", "ECG", "Wheelchair", "Patient", "Monitor"],
      required: true,
      index: true,
    },
    resourceName: { type: String, required: true },
    location: {
      type: String,
      enum: [
        "Emergency",
        "ICU",
        "General Ward A",
        "General Ward B",
        "Operating Theatre",
        "Diagnostics",
        "OPD",
        "Pharmacy",
      ],
      required: true,
    },
    x: { type: Number, default: 50 }, // percentage 0 - 100 on floorplan
    y: { type: Number, default: 50 }, // percentage 0 - 100 on floorplan
    floor: { type: Number, default: 1 },
    batteryLevel: { type: Number, default: 95 },
    status: { type: String, default: "ACTIVE" },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.RTLSLocation ||
  mongoose.model("RTLSLocation", rtlsLocationSchema);
