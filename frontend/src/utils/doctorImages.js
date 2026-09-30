// frontend/src/utils/doctorImages.js
import HD1 from "../assets/HD1.png";
import HD2 from "../assets/HD2.png";
import HD3 from "../assets/HD3.png";
import HD4 from "../assets/HD4.png";
import HD5 from "../assets/HD5.png";
import HD6 from "../assets/HD6.png";
import HD7 from "../assets/HD7.png";
import HD8 from "../assets/HD8.png";
import D1 from "../assets/D1.png";
import D2 from "../assets/D2.png";
import D3 from "../assets/D3.png";
import D4 from "../assets/D4.png";
import D5 from "../assets/D5.png";
import D6 from "../assets/D6.png";
import D7 from "../assets/D7.png";
import D8 from "../assets/D8.png";
import D9 from "../assets/D9.png";
import D10 from "../assets/D10.png";
import D11 from "../assets/D11.png";
import D12 from "../assets/D12.png";

export const doctorImageMap = {
  // Filename keys
  "HD1.png": HD1, "HD1": HD1,
  "HD2.png": HD2, "HD2": HD2,
  "HD3.png": HD3, "HD3": HD3,
  "HD4.png": HD4, "HD4": HD4,
  "HD5.png": HD5, "HD5": HD5,
  "HD6.png": HD6, "HD6": HD6,
  "HD7.png": HD7, "HD7": HD7,
  "HD8.png": HD8, "HD8": HD8,
  "D1.png": D1, "D1": D1,
  "D2.png": D2, "D2": D2,
  "D3.png": D3, "D3": D3,
  "D4.png": D4, "D4": D4,
  "D5.png": D5, "D5": D5,
  "D6.png": D6, "D6": D6,
  "D7.png": D7, "D7": D7,
  "D8.png": D8, "D8": D8,
  "D9.png": D9, "D9": D9,
  "D10.png": D10, "D10": D10,
  "D11.png": D11, "D11": D11,
  "D12.png": D12, "D12": D12,

  // Indian Bangalore Practo Doctor Mappings
  "Dr. Rajesh Kumar": D6,
  "Dr. Suresh Reddy": D7,
  "Dr. Ananya Deshmukh": D4,
  "Dr. Vikram Hegde": D8,
  "Dr. Priya Sharma": HD5,
  "Dr. Arvind Swaminathan": D9,
  "Dr. Sunita Kulkarni": D5,
  "Dr. Karthik Venkatesh": D12,
  "Dr. Sanjay Bhattacharya": D7,
  "Dr. Deepa Ranganathan": D10,
  "Dr. Ishaan Khanna": D6,
  "Dr. Kabir Malhotra": D12,
  "Dr. Neha Kapoor": D5,
  "Dr. Virat Anand": D7,
  "Dr. Jatin Arora": D8,
  "Dr. Aarav Singh": D9,
  "Dr. Megha Shah": D10,
  "Dr. Aditi Rao": D4,
  "Dr. Rohan Mehta": D6,
  "Dr. Sneha Verma": D11,

  // Legacy name fallbacks
  "Dr. Sarah Johnson": D6,
  "Dr. Michael Chen": D7,
  "Dr. Emily Rodriguez": D4,
  "Dr. James Wilson": D8,
  "Dr. Robert Brown": D9,
  "Dr. Lisa Wang": D5,
  "Dr. David Kim": D12,
  "Dr. Richard James": D6,
  "Dr. Christopher Lee": D7,
  "Dr. Christopher": D7,
  "Dr. Jennifer Garcia": D4,
  "Dr. Jennifer": D4,
  "Dr. Helena Grace": D11,

  // Doctor IDs
  "6a3820c82cecc9714b826111": D6,
  "6a3820c82cecc9714b826112": D7,
  "6a3820c82cecc9714b826113": D4,
  "6a3820c82cecc9714b826114": D8,
  "6a3820c82cecc9714b826115": HD5,
  "6a3820c82cecc9714b826116": D9,
  "6a3820c82cecc9714b826117": D5,
  "6a3820c82cecc9714b826118": D12,
  "6a3820c82cecc9714b826119": D7,
  "6a3820c82cecc9714b82611a": D10,
  "6a3820c82cecc9714b82611b": D6,
  "6a3820c82cecc9714b82611c": D12,
  "6a3820c82cecc9714b82611d": D5,
  "6a3820c82cecc9714b82611e": D7,
  "6a3820c82cecc9714b82611f": D8,
  "6a3820c82cecc9714b826120": D9,
  "6a3820c82cecc9714b826121": D10,
  "6a3820c82cecc9714b826122": D4,
  "6a3820c82cecc9714b826123": D6,
  "6a3820c82cecc9714b826124": D11,
};

/**
 * Resolves doctor image to a guaranteed, valid bundled asset or URL.
 */
export function getDoctorImage(doc, fallback = HD1) {
  if (!doc) return fallback;

  // If passed directly as a string
  if (typeof doc === "string") {
    if (doctorImageMap[doc]) return doctorImageMap[doc];
    // Check if contains filename
    for (const [key, val] of Object.entries(doctorImageMap)) {
      if (doc.includes(key)) return val;
    }
    if (doc.startsWith("http://") || doc.startsWith("https://") || doc.startsWith("data:") || doc.startsWith("/assets/")) {
      // Avoid localhost on production/Netlify
      if (doc.includes("localhost:") || doc.includes("127.0.0.1:")) {
        // extract filename from localhost URL like http://localhost:4000/assets/HD1.png
        const match = doc.match(/\/(HD\d+|D\d+)\.png/i);
        if (match && doctorImageMap[match[1] + ".png"]) {
          return doctorImageMap[match[1] + ".png"];
        }
      } else {
        return doc;
      }
    }
    return fallback;
  }

  // Check by Name
  if (doc.name && doctorImageMap[doc.name]) {
    return doctorImageMap[doc.name];
  }

  // Check by ID
  const docId = String(doc._id || doc.id || "");
  if (docId && doctorImageMap[docId]) {
    return doctorImageMap[docId];
  }

  // Check by raw image / imageUrl
  const rawImg = doc.imageUrl || doc.image || doc.imageFile || "";
  if (rawImg) {
    if (doctorImageMap[rawImg]) return doctorImageMap[rawImg];
    for (const [key, val] of Object.entries(doctorImageMap)) {
      if (typeof rawImg === "string" && rawImg.includes(key)) return val;
    }
    if (typeof rawImg === "string" && (rawImg.startsWith("https://") || rawImg.startsWith("data:") || rawImg.startsWith("/assets/"))) {
      if (!rawImg.includes("localhost:") && !rawImg.includes("127.0.0.1:")) {
        return rawImg;
      }
    }
  }

  // Specialization fallback
  const spec = (doc.specialization || doc.speciality || "").toLowerCase();
  if (spec.includes("cardio")) return HD1;
  if (spec.includes("neuro")) return HD2;
  if (spec.includes("pediat")) return HD3;
  if (spec.includes("ortho")) return HD4;
  if (spec.includes("derm") || spec.includes("critical")) return HD5;
  if (spec.includes("psych") || spec.includes("general")) return HD6;
  if (spec.includes("gyn") || spec.includes("surgeon")) return HD7;
  if (spec.includes("oncol") || spec.includes("anesthet")) return HD8;

  return fallback;
}

/**
 * Image onError handler to ensure zero broken image icons
 */
export function handleImageError(e, fallback = HD1) {
  if (e && e.currentTarget) {
    e.currentTarget.onerror = null;
    e.currentTarget.src = fallback;
  }
}
