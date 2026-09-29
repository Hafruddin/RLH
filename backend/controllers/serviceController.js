import mongoose from "mongoose";
import Service from "../models/Service.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { getMockServices, getMockServiceById } from "../utils/mockDb.js";

const rewriteImageUrl = (url, req) => {
  if (!url) return url;
  if (typeof url === 'string') {
    const assetIdx = url.indexOf('/assets/');
    if (assetIdx !== -1) {
      const path = url.slice(assetIdx);
      const hostName = req.get('host') || "";
      const protocol = (hostName.includes('localhost') || hostName.includes('127.0.0.1')) ? req.protocol : 'https';
      return protocol + '://' + hostName + path;
    }
  }
  return url;
};

/* -----------------------
   Helpers
   ----------------------- */
const parseJsonArrayField = (field) => {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  if (typeof field === "string") {
    try {
      const parsed = JSON.parse(field);
      if (Array.isArray(parsed)) return parsed;
      return typeof parsed === "string" ? [parsed] : [];
    } catch {
      return field
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return [];
};

// store date as plain YYYY-MM-DD + time-as-string
function normalizeSlotsToMap(slotStrings = []) {
  // return a map: { "2026-01-06": ["10:00 AM", "02:30 PM"] }
  const map = {};
  slotStrings.forEach((raw) => {
    // parse your "DD Mon YYYY • HH:MM AM" format (or keep raw if you prefer)
    const m = raw.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})\s*•\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!m) {
      // fallback: keep raw in an "unspecified" bucket
      map["unspecified"] = map["unspecified"] || [];
      map["unspecified"].push(raw);
      return;
    }
    const [ , day, monShort, year, hour, minute, ampm ] = m;
    const monthIdx = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
      .findIndex(x => x.toLowerCase() === monShort.toLowerCase());
    const mm = String(monthIdx + 1).padStart(2, "0");
    const dd = String(Number(day)).padStart(2, "0");
    const dateKey = `${year}-${mm}-${dd}`; // YYYY-MM-DD
    const timeStr = `${String(Number(hour)).padStart(2,"0")}:${String(minute).padStart(2,"0")} ${ampm.toUpperCase()}`;
    map[dateKey] = map[dateKey] || [];
    map[dateKey].push(timeStr);
  });
  return map;
}


const sanitizePrice = (v) => Number(String(v ?? "0").replace(/[^\d.-]/g, "")) || 0;
const parseAvailability = (v) => {
  const s = String(v ?? "available").toLowerCase();
  return s === "available" || s === "true";
};

/* -----------------------
   CREATE
   ----------------------- */
export async function createService(req, res) {
  try {
    const b = req.body || {};
    const instructions = parseJsonArrayField(b.instructions);
    const rawSlots = parseJsonArrayField(b.slots);
    const slots = normalizeSlotsToMap(rawSlots);
    const numericPrice = sanitizePrice(b.price);
    const available = parseAvailability(b.availability);

    let imageUrl = null;
    let imagePublicId = null;
    if (req.file) {
      try {
        const up = await uploadToCloudinary(req.file.path, "services");
        imageUrl = up?.secure_url || null;
        imagePublicId = up?.public_id || null;
      } catch (err) {
        console.error("Cloudinary upload error:", err);
      }
    }

    const service = new Service({
      name: b.name,
      about: b.about || "",
      shortDescription: b.shortDescription || "",
      price: numericPrice,
      available,
      instructions,
      slots,
      imageUrl,
      imagePublicId,
    });

    const saved = await service.save();
    const out = saved.toObject();
    if (out.imageUrl) out.imageUrl = rewriteImageUrl(out.imageUrl, req);
    return res.status(201).json({ success: true, data: out, message: "Service created" });
  } catch (err) {
    console.error("createService error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

/* -----------------------
   GET ALL
   ----------------------- */
export async function getServices(req, res) {
  try {
    // Failsafe: Fallback to mock data if MongoDB is disconnected
    if (mongoose.connection.readyState !== 1) {
      console.warn("⚠️ MongoDB is disconnected. Serving fallback mock services data.");
      const mock = getMockServices(req);
      return res.status(200).json({ success: true, data: mock });
    }

    const list = await Service.find().sort({ createdAt: -1 }).lean();
    const normalized = list.map(s => ({
      ...s,
      imageUrl: rewriteImageUrl(s.imageUrl, req)
    }));
    return res.status(200).json({ success: true, data: normalized });
  } catch (err) {
    console.error("getServices error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

/* -----------------------
   GET BY ID
   ----------------------- */
export async function getServiceById(req, res) {
  try {
    const { id } = req.params;

    // Failsafe: Fallback to mock data if MongoDB is disconnected
    if (mongoose.connection.readyState !== 1) {
      const mock = getMockServiceById(id, req);
      if (!mock) return res.status(404).json({ success: false, message: "Service not found" });
      return res.status(200).json({ success: true, data: mock });
    }

    const service = await Service.findById(id).lean();
    if (!service) return res.status(404).json({ success: false, message: "Service not found" });
    if (service.imageUrl) {
      service.imageUrl = rewriteImageUrl(service.imageUrl, req);
    }
    return res.status(200).json({ success: true, data: service });
  } catch (err) {
    console.error("getServiceById error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

/* -----------------------
   UPDATE (partial)
   ----------------------- */
export async function updateService(req, res) {
  try {
    const { id } = req.params;
    const existing = await Service.findById(id);
    if (!existing) return res.status(404).json({ success: false, message: "Service not found" });

    const b = req.body || {};
    const updateData = {};

    if (b.name !== undefined) updateData.name = b.name;
    if (b.about !== undefined) updateData.about = b.about;
    if (b.shortDescription !== undefined) updateData.shortDescription = b.shortDescription;
    if (b.price !== undefined) updateData.price = sanitizePrice(b.price);
    if (b.availability !== undefined) updateData.available = parseAvailability(b.availability);
    if (b.instructions !== undefined) updateData.instructions = parseJsonArrayField(b.instructions);
    if (b.slots !== undefined) updateData.slots = normalizeSlotsToMap(parseJsonArrayField(b.slots));

    if (req.file) {
      try {
        const up = await uploadToCloudinary(req.file.path, "services");
        if (up?.secure_url) {
          updateData.imageUrl = up.secure_url;
          updateData.imagePublicId = up.public_id || null;
          if (existing.imagePublicId) {
            try {
              await deleteFromCloudinary(existing.imagePublicId);
            } catch (err) {
              console.warn("Cloudinary delete failed:", err?.message || err);
            }
          }
        }
      } catch (err) {
        console.error("Cloudinary upload error:", err);
      }
    }

    const updated = await Service.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    const out = updated.toObject();
    if (out.imageUrl) out.imageUrl = rewriteImageUrl(out.imageUrl, req);
    return res.status(200).json({ success: true, data: out, message: "Service updated" });
  } catch (err) {
    console.error("updateService error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

/* -----------------------
   DELETE
   ----------------------- */
export async function deleteService(req, res) {
  try {
    const { id } = req.params;
    const existing = await Service.findById(id);
    if (!existing) return res.status(404).json({ success: false, message: "Service not found" });

    if (existing.imagePublicId) {
      try {
        await deleteFromCloudinary(existing.imagePublicId);
      } catch (err) {
        console.warn("failed to delete cloud image on service delete:", err?.message || err);
      }
    }

    await existing.deleteOne();
    return res.status(200).json({ success: true, message: "Service deleted" });
  } catch (err) {
    console.error("deleteService error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
