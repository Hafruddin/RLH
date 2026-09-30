/**
 * dateTime.js — Centralized Date/Time Utility for MediCare Nexus
 * All operations use Asia/Kolkata (IST) timezone.
 */

const TZ = "Asia/Kolkata";

/**
 * Returns today's date string as YYYY-MM-DD in IST.
 */
export function getHospitalDateString() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * Returns a Date object representing now in IST context.
 * (JS Date is always UTC internally; this gives you the equivalent
 *  IST instant for comparison purposes.)
 */
export function getCurrentHospitalTime() {
  return new Date();
}

/**
 * Returns the current IST hours and minutes as { hours, minutes }.
 */
export function getCurrentISTHoursMinutes() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .formatToParts(new Date())
    .reduce((acc, p) => {
      if (p.type === "hour") acc.hours = Number(p.value);
      if (p.type === "minute") acc.minutes = Number(p.value);
      return acc;
    }, {});
  return parts;
}

/**
 * Returns true if dateStr (YYYY-MM-DD) is strictly before today in IST.
 */
export function isPastDate(dateStr) {
  if (!dateStr) return true;
  const today = getHospitalDateString();
  return dateStr < today;
}

/**
 * Parses a slot string like "09:00 AM" or "14:30" and returns { hours, minutes }.
 */
export function parseSlotTimeParts(slotStr) {
  if (!slotStr) return null;
  const upper = slotStr.trim().toUpperCase();
  const match = upper.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/);
  if (!match) return null;
  let [, hStr, mStr, meridiem] = match;
  let hours = Number(hStr);
  const minutes = Number(mStr);
  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  return { hours, minutes };
}

/**
 * Returns true if the slot on the given date is in the past (IST) plus a buffer.
 * @param {string} dateStr — YYYY-MM-DD
 * @param {string} slotStr — e.g. "09:00 AM"
 * @param {number} bufferMinutes — default 15
 */
export function isPastSlot(dateStr, slotStr, bufferMinutes = 15) {
  const today = getHospitalDateString();
  // If date is in the past, all slots are past
  if (dateStr < today) return true;
  // If date is in the future, no slots are past
  if (dateStr > today) return false;

  // Date is today — compare times
  const slotParts = parseSlotTimeParts(slotStr);
  if (!slotParts) return false;

  const { hours: nowH, minutes: nowM } = getCurrentISTHoursMinutes();
  const nowTotal = nowH * 60 + nowM + bufferMinutes;
  const slotTotal = slotParts.hours * 60 + slotParts.minutes;

  return slotTotal <= nowTotal;
}

/**
 * Given a doctor's schedule object and a YYYY-MM-DD dateStr,
 * returns available (non-past) time slots.
 * @param {Object} schedule — { "YYYY-MM-DD": ["09:00 AM", ...], ... }
 * @param {string} dateStr
 * @returns {string[]}
 */
export function getAvailableSlots(schedule, dateStr) {
  if (!schedule || !dateStr) return [];
  const rawSlots = schedule[dateStr] || [];
  return rawSlots.filter((slot) => !isPastSlot(dateStr, slot));
}

/**
 * Formats a YYYY-MM-DD string to a human-readable IST date.
 * E.g. "2026-10-01" → "Wed, 1 Oct 2026"
 */
export function formatHospitalDate(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * Formats a Date object to a human-readable IST time string.
 * E.g. "10:30 AM"
 */
export function formatHospitalTime(date) {
  if (!(date instanceof Date)) return "";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/**
 * Normalizes an experience value for display, stripping duplicate "years" suffixes.
 * e.g. "12 years" → "12 Years Experience"
 *      "12"       → "12 Years Experience"
 *      12         → "12 Years Experience"
 */
export function formatExperience(exp) {
  if (exp === null || exp === undefined || exp === "" || exp === "—") return "—";
  const str = String(exp)
    .replace(/\s*years?\s*/gi, "")
    .replace(/\s*experience\s*/gi, "")
    .trim();
  if (!str || str === "—") return "—";
  return `${str} Years Experience`;
}

/**
 * Combines a YYYY-MM-DD date string and a slot time string (e.g. "09:00 AM")
 * into a single ISO timestamp string (in local time).
 */
export function createAppointmentTimestamp(dateStr, slotStr) {
  if (!dateStr || !slotStr) return null;
  const slotParts = parseSlotTimeParts(slotStr);
  if (!slotParts) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d, slotParts.hours, slotParts.minutes, 0);
  return dt.toISOString();
}
