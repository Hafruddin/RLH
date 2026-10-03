// backend/routes/n8nRouter.js
// N8N-callable REST API — all endpoints use x-mnx-service-key authentication.
// These are thin wrappers that reuse existing controllers/services.

import express from "express";
import mongoose from "mongoose";
import { requireServiceKey } from "../middlewares/serviceAuth.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";
import DiagnosticResource from "../models/DiagnosticResource.js";
import Bed from "../models/Bed.js";
import Staff from "../models/Staff.js";
import Equipment from "../models/Equipment.js";
import OperatingTheatre from "../models/OperatingTheatre.js";
import EmergencyEvent from "../models/EmergencyEvent.js";
import Alert from "../models/Alert.js";
import Forecast from "../models/Forecast.js";
import Patient from "../models/Patient.js";
import ServiceAppointment from "../models/serviceAppointment.js";

import { broadcastEvent } from "../services/eventHub.js";
import {
  executeEmergencyAllocation,
  scoreResourceAllocation,
} from "../services/orchestratorService.js";
import { generateHospitalForecasts } from "../services/forecastingService.js";
import { nexusStore } from "../services/nexusStore.js";

const n8nRouter = express.Router();

// Apply service auth to ALL n8n routes
n8nRouter.use(requireServiceKey);

// ─────────────────────────────────────────────
// HEALTH
// ─────────────────────────────────────────────

n8nRouter.get(
  "/health",
  asyncHandler(async (req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStatus =
      dbState === 1 ? "connected" : dbState === 2 ? "connecting" : "disconnected";

    res.json({
      success: true,
      status: "ok",
      service: "MediCare Nexus API",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      database: dbStatus,
      timezone: "Asia/Kolkata",
    });
  })
);

// ─────────────────────────────────────────────
// DOCTORS
// ─────────────────────────────────────────────

n8nRouter.get(
  "/doctors",
  asyncHandler(async (req, res) => {
    const { specialization, name, available } = req.query;
    const query = {};
    if (name) query.name = { $regex: name.trim(), $options: "i" };
    if (specialization)
      query.specialization = { $regex: specialization.trim(), $options: "i" };
    if (available === "true") query.available = true;

    const doctors = await Doctor.find(query)
      .select(
        "name specialization fee experience rating location availability imageUrl schedule available"
      )
      .limit(50)
      .lean();

    res.json({ success: true, data: doctors, count: doctors.length });
  })
);

n8nRouter.get(
  "/doctors/:id",
  asyncHandler(async (req, res) => {
    const doctor = await Doctor.findById(req.params.id)
      .select("-password")
      .lean();
    if (!doctor)
      return res
        .status(404)
        .json({ success: false, errorCode: "NOT_FOUND", message: "Doctor not found" });
    res.json({ success: true, data: doctor });
  })
);

n8nRouter.get(
  "/doctors/:id/availability",
  asyncHandler(async (req, res) => {
    const doctor = await Doctor.findById(req.params.id)
      .select("name schedule available")
      .lean();
    if (!doctor)
      return res
        .status(404)
        .json({ success: false, errorCode: "NOT_FOUND", message: "Doctor not found" });

    const { date } = req.query;
    let slots = [];
    if (date && doctor.schedule && doctor.schedule[date]) {
      slots = doctor.schedule[date];
    } else if (doctor.schedule) {
      // Return entire schedule
      slots = doctor.schedule;
    }

    res.json({
      success: true,
      data: { doctorId: req.params.id, name: doctor.name, available: doctor.available, slots },
    });
  })
);

// ─────────────────────────────────────────────
// APPOINTMENTS
// ─────────────────────────────────────────────

n8nRouter.get(
  "/appointments",
  asyncHandler(async (req, res) => {
    const { doctorId, patientId, date, status } = req.query;
    const query = {};
    if (doctorId) query.doctorId = doctorId;
    if (patientId) query.createdBy = patientId;
    if (date) query.date = date;
    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({ success: true, data: appointments, count: appointments.length });
  })
);

n8nRouter.post(
  "/appointments",
  asyncHandler(async (req, res) => {
    const { doctorId, patientName, mobile, date, time, fee, gender, age, email, paymentMethod } =
      req.body;

    if (!doctorId || !patientName || !mobile || !date || !time) {
      return res.status(400).json({
        success: false,
        errorCode: "MISSING_FIELDS",
        message: "doctorId, patientName, mobile, date and time are required",
      });
    }

    // IST past-date guard
    const nowIST = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
    const y = nowIST.getFullYear();
    const m = String(nowIST.getMonth() + 1).padStart(2, "0");
    const d = String(nowIST.getDate()).padStart(2, "0");
    const todayStr = `${y}-${m}-${d}`;
    if (String(date) < todayStr) {
      return res.status(400).json({
        success: false,
        errorCode: "PAST_DATE",
        message: "Cannot book appointments for past dates.",
      });
    }

    const doctor = await Doctor.findById(doctorId).lean();
    if (!doctor)
      return res
        .status(404)
        .json({ success: false, errorCode: "DOCTOR_NOT_FOUND", message: "Doctor not found" });

    // Same-day, same-doctor duplicate check
    const sameDay = await Appointment.findOne({
      doctorId,
      $or: [{ mobile: String(mobile).trim() }, { patientName: String(patientName).trim() }],
      date: String(date),
      status: { $ne: "Canceled" },
    }).lean();
    if (sameDay)
      return res.status(409).json({
        success: false,
        errorCode: "SAME_DAY_DUPLICATE",
        message: `You already have an appointment with this doctor on ${date} (at ${sameDay.time}). Patients cannot book multiple appointments on the same day for the same doctor.`,
      });

    const existing = await Appointment.findOne({
      doctorId,
      date: String(date),
      time: String(time),
      status: { $ne: "Canceled" },
    }).lean();
    if (existing)
      return res.status(409).json({
        success: false,
        errorCode: "SLOT_TAKEN",
        message: "This slot is already booked.",
      });

    const appt = await Appointment.create({
      doctorId,
      docName: doctor.name,
      docSpeciality: doctor.specialization || doctor.speciality,
      patientName: patientName.trim(),
      mobile: String(mobile).trim(),
      date: String(date),
      time: String(time),
      fee: Number(fee) || doctor.fee || 0,
      gender: gender || "",
      age: age || "",
      email: email || "",
      paymentMethod: paymentMethod || "Cash",
      status: "Pending",
      createdBy: req.headers["x-user-id"] || "n8n-service",
    });

    broadcastEvent("appointment:created", {
      appointmentId: appt._id,
      doctorId,
      date,
      time,
      patientName,
    });

    res.status(201).json({ success: true, data: appt });
  })
);

n8nRouter.patch(
  "/appointments/:id",
  asyncHandler(async (req, res) => {
    const appt = await Appointment.findById(req.params.id);
    if (!appt)
      return res
        .status(404)
        .json({ success: false, errorCode: "NOT_FOUND", message: "Appointment not found" });

    const allowedUpdates = ["date", "time", "status", "paymentMethod", "notes"];
    allowedUpdates.forEach((key) => {
      if (req.body[key] !== undefined) appt[key] = req.body[key];
    });
    await appt.save();

    broadcastEvent("appointment:updated", { appointmentId: appt._id, ...req.body });

    res.json({ success: true, data: appt });
  })
);

n8nRouter.delete(
  "/appointments/:id",
  asyncHandler(async (req, res) => {
    const appt = await Appointment.findById(req.params.id);
    if (!appt)
      return res
        .status(404)
        .json({ success: false, errorCode: "NOT_FOUND", message: "Appointment not found" });

    appt.status = "Canceled";
    await appt.save();

    broadcastEvent("appointment:canceled", { appointmentId: appt._id });

    res.json({ success: true, message: "Appointment canceled", data: appt });
  })
);

// ─────────────────────────────────────────────
// DIAGNOSTICS
// ─────────────────────────────────────────────

n8nRouter.get(
  "/diagnostics",
  asyncHandler(async (req, res) => {
    const diagnostics = await DiagnosticResource.find().lean();
    res.json({ success: true, data: diagnostics, count: diagnostics.length });
  })
);

n8nRouter.get(
  "/diagnostics/available",
  asyncHandler(async (req, res) => {
    const diagnostics = await DiagnosticResource.find({ status: "AVAILABLE" }).lean();
    res.json({ success: true, data: diagnostics, count: diagnostics.length });
  })
);

n8nRouter.post(
  "/diagnostics/book",
  asyncHandler(async (req, res) => {
    const { diagnosticId, patientName, patientId, testType, date, time } = req.body;
    if (!patientName || !testType) {
      return res.status(400).json({
        success: false,
        errorCode: "MISSING_FIELDS",
        message: "patientName and testType are required",
      });
    }

    const booking = await ServiceAppointment.create({
      patientName: patientName.trim(),
      patientId: patientId || "n8n-service",
      serviceType: testType,
      diagnosticId: diagnosticId || null,
      date: date || new Date().toISOString().split("T")[0],
      time: time || "TBD",
      status: "Scheduled",
    });

    broadcastEvent("diagnostic:booked", { bookingId: booking._id, testType, patientName });

    res.status(201).json({ success: true, data: booking });
  })
);

n8nRouter.get(
  "/diagnostics/:id/status",
  asyncHandler(async (req, res) => {
    const resource = await DiagnosticResource.findById(req.params.id).lean();
    if (!resource)
      return res
        .status(404)
        .json({ success: false, errorCode: "NOT_FOUND", message: "Diagnostic resource not found" });
    res.json({ success: true, data: resource });
  })
);

// ─────────────────────────────────────────────
// BEDS
// ─────────────────────────────────────────────

n8nRouter.get(
  "/beds",
  asyncHandler(async (req, res) => {
    const { status, wardId } = req.query;
    const query = {};
    if (status) query.status = status.toUpperCase();
    if (wardId) query.wardId = wardId;
    const beds = await Bed.find(query).lean();
    res.json({ success: true, data: beds, count: beds.length });
  })
);

n8nRouter.get(
  "/beds/available",
  asyncHandler(async (req, res) => {
    const beds = await Bed.find({ status: "AVAILABLE" }).lean();
    res.json({ success: true, data: beds, count: beds.length });
  })
);

n8nRouter.patch(
  "/beds/:id/status",
  asyncHandler(async (req, res) => {
    const { status, patientId, notes } = req.body;
    const bed = await Bed.findById(req.params.id);
    if (!bed)
      return res
        .status(404)
        .json({ success: false, errorCode: "NOT_FOUND", message: "Bed not found" });

    const validStatuses = ["AVAILABLE", "OCCUPIED", "MAINTENANCE", "RESERVED"];
    if (!validStatuses.includes(status?.toUpperCase())) {
      return res.status(400).json({
        success: false,
        errorCode: "INVALID_STATUS",
        message: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    bed.status = status.toUpperCase();
    if (patientId !== undefined) bed.patientId = patientId;
    if (notes) bed.notes = notes;
    bed.lastUpdated = new Date();
    await bed.save();

    broadcastEvent("bed:updated", { bedId: bed._id, status: bed.status });

    res.json({ success: true, data: bed });
  })
);

// ─────────────────────────────────────────────
// STAFF
// ─────────────────────────────────────────────

n8nRouter.get(
  "/staff",
  asyncHandler(async (req, res) => {
    const { status, role, department } = req.query;
    const query = {};
    if (status) query.status = status.toUpperCase();
    if (role) query.role = { $regex: role, $options: "i" };
    if (department) query.department = { $regex: department, $options: "i" };
    const staff = await Staff.find(query).lean();
    res.json({ success: true, data: staff, count: staff.length });
  })
);

n8nRouter.get(
  "/staff/available",
  asyncHandler(async (req, res) => {
    const staff = await Staff.find({ status: "ON_DUTY" }).lean();
    res.json({ success: true, data: staff, count: staff.length });
  })
);

n8nRouter.patch(
  "/staff/:id/status",
  asyncHandler(async (req, res) => {
    const { status, patientId, wardId, notes } = req.body;
    const member = await Staff.findById(req.params.id);
    if (!member)
      return res
        .status(404)
        .json({ success: false, errorCode: "NOT_FOUND", message: "Staff member not found" });

    member.status = status || member.status;
    if (patientId !== undefined) member.currentPatientId = patientId;
    if (wardId) member.currentWardId = wardId;
    if (notes) member.notes = notes;
    member.lastUpdated = new Date();
    await member.save();

    broadcastEvent("staff:updated", { staffId: member._id, status: member.status });

    res.json({ success: true, data: member });
  })
);

// ─────────────────────────────────────────────
// EQUIPMENT
// ─────────────────────────────────────────────

n8nRouter.get(
  "/equipment",
  asyncHandler(async (req, res) => {
    const { status, type } = req.query;
    const query = {};
    if (status) query.status = status.toUpperCase();
    if (type) query.type = { $regex: type, $options: "i" };
    const equipment = await Equipment.find(query).lean();
    res.json({ success: true, data: equipment, count: equipment.length });
  })
);

n8nRouter.get(
  "/equipment/available",
  asyncHandler(async (req, res) => {
    const equipment = await Equipment.find({ status: "AVAILABLE" }).lean();
    res.json({ success: true, data: equipment, count: equipment.length });
  })
);

n8nRouter.patch(
  "/equipment/:id/location",
  asyncHandler(async (req, res) => {
    const { location, status, wardId } = req.body;
    const item = await Equipment.findById(req.params.id);
    if (!item)
      return res
        .status(404)
        .json({ success: false, errorCode: "NOT_FOUND", message: "Equipment not found" });

    if (location) item.location = location;
    if (status) item.status = status.toUpperCase();
    if (wardId) item.wardId = wardId;
    item.lastUpdated = new Date();
    await item.save();

    broadcastEvent("equipment:moved", { equipmentId: item._id, location: item.location });

    res.json({ success: true, data: item });
  })
);

// ─────────────────────────────────────────────
// OPERATING THEATRE (OT)
// ─────────────────────────────────────────────

n8nRouter.get(
  "/ot",
  asyncHandler(async (req, res) => {
    const { status } = req.query;
    const query = status ? { status: status.toUpperCase() } : {};
    const ots = await OperatingTheatre.find(query).lean();
    res.json({ success: true, data: ots, count: ots.length });
  })
);

n8nRouter.get(
  "/ot/available",
  asyncHandler(async (req, res) => {
    const ots = await OperatingTheatre.find({ status: "AVAILABLE" }).lean();
    res.json({ success: true, data: ots, count: ots.length });
  })
);

n8nRouter.post(
  "/ot/allocate",
  asyncHandler(async (req, res) => {
    const { otId, patientId, patientName, procedure, surgeonId, scheduledTime, duration } =
      req.body;
    if (!patientName || !procedure) {
      return res.status(400).json({
        success: false,
        errorCode: "MISSING_FIELDS",
        message: "patientName and procedure are required",
      });
    }

    let ot;
    if (otId) {
      ot = await OperatingTheatre.findById(otId);
    } else {
      ot = await OperatingTheatre.findOne({ status: "AVAILABLE" });
    }

    if (!ot)
      return res
        .status(404)
        .json({ success: false, errorCode: "NO_OT_AVAILABLE", message: "No OT available" });

    if (ot.status !== "AVAILABLE") {
      return res.status(409).json({
        success: false,
        errorCode: "OT_NOT_AVAILABLE",
        message: `OT ${ot.otId} is currently ${ot.status}`,
      });
    }

    ot.status = "IN_USE";
    ot.currentPatient = { patientId, patientName, procedure };
    ot.scheduledTime = scheduledTime || new Date().toISOString();
    ot.estimatedDuration = duration || 90;
    ot.lastUpdated = new Date();
    await ot.save();

    broadcastEvent("ot:allocated", { otId: ot._id, patientName, procedure });

    res.json({ success: true, data: ot });
  })
);

// ─────────────────────────────────────────────
// EMERGENCY
// ─────────────────────────────────────────────

n8nRouter.post(
  "/emergency",
  asyncHandler(async (req, res) => {
    const {
      patientName,
      patientId,
      severity,
      condition,
      location,
      description,
      requiredResources,
    } = req.body;

    if (!severity || !condition) {
      return res.status(400).json({
        success: false,
        errorCode: "MISSING_FIELDS",
        message: "severity and condition are required",
      });
    }

    const emergency = await EmergencyEvent.create({
      patientName: patientName || "Unknown",
      patientId: patientId || null,
      severity: severity.toUpperCase(),
      condition,
      location: location || "Emergency Dept",
      description: description || "",
      requiredResources: requiredResources || [],
      status: "ACTIVE",
      reportedAt: new Date(),
    });

    broadcastEvent("emergency:created", {
      emergencyId: emergency._id,
      severity: emergency.severity,
      condition,
    });

    res.status(201).json({ success: true, data: emergency });
  })
);

n8nRouter.post(
  "/emergency/:id/orchestrate",
  asyncHandler(async (req, res) => {
    const emergency = await EmergencyEvent.findById(req.params.id);
    if (!emergency)
      return res
        .status(404)
        .json({ success: false, errorCode: "NOT_FOUND", message: "Emergency not found" });

    const allocation = await executeEmergencyAllocation(emergency);

    emergency.allocation = allocation;
    emergency.status = "ORCHESTRATED";
    emergency.orchestratedAt = new Date();
    await emergency.save();

    broadcastEvent("emergency:orchestrated", {
      emergencyId: emergency._id,
      allocation,
    });

    res.json({
      success: true,
      data: {
        emergency,
        allocation,
        score: allocation?.score || 0,
        reason: allocation?.reasons || [],
      },
    });
  })
);

n8nRouter.post(
  "/emergency/:id/escalate",
  asyncHandler(async (req, res) => {
    const { escalationLevel, notes } = req.body;
    const emergency = await EmergencyEvent.findById(req.params.id);
    if (!emergency)
      return res
        .status(404)
        .json({ success: false, errorCode: "NOT_FOUND", message: "Emergency not found" });

    emergency.escalationLevel = escalationLevel || "HIGH";
    emergency.status = "ESCALATED";
    emergency.escalationNotes = notes || "";
    emergency.escalatedAt = new Date();
    await emergency.save();

    broadcastEvent("emergency:escalated", { emergencyId: emergency._id, escalationLevel });

    res.json({ success: true, data: emergency });
  })
);

n8nRouter.get(
  "/emergency/:id",
  asyncHandler(async (req, res) => {
    const emergency = await EmergencyEvent.findById(req.params.id).lean();
    if (!emergency)
      return res
        .status(404)
        .json({ success: false, errorCode: "NOT_FOUND", message: "Emergency not found" });
    res.json({ success: true, data: emergency });
  })
);

// ─────────────────────────────────────────────
// RESOURCE ORCHESTRATION
// ─────────────────────────────────────────────

n8nRouter.post(
  "/orchestrator/allocate",
  asyncHandler(async (req, res) => {
    const { patientId, patientName, severity, condition, requiredResources } = req.body;

    if (!severity) {
      return res.status(400).json({
        success: false,
        errorCode: "MISSING_FIELDS",
        message: "severity is required",
      });
    }

    const mockEmergency = {
      _id: new mongoose.Types.ObjectId(),
      patientName: patientName || "Unknown",
      severity: severity.toUpperCase(),
      condition: condition || "General",
      requiredResources: requiredResources || [],
    };

    const allocation = await executeEmergencyAllocation(mockEmergency);

    broadcastEvent("orchestrator:allocated", { patientName, allocation });

    res.json({
      success: true,
      allocation,
      score: allocation?.score || 0,
      reason: allocation?.reasons || [],
    });
  })
);

n8nRouter.post(
  "/orchestrator/reallocate",
  asyncHandler(async (req, res) => {
    const { resourceId, resourceType, reason } = req.body;

    // Trigger nexus store reallocation
    const storeData = nexusStore
      ? {
          beds: nexusStore.beds?.filter((b) => b.status === "AVAILABLE").length,
          staff: nexusStore.staff?.filter((s) => s.status === "ON_DUTY").length,
        }
      : null;

    broadcastEvent("orchestrator:reallocated", { resourceId, resourceType, reason });

    res.json({
      success: true,
      message: "Reallocation triggered",
      available: storeData,
    });
  })
);

// ─────────────────────────────────────────────
// FORECAST
// ─────────────────────────────────────────────

n8nRouter.get(
  "/forecast",
  asyncHandler(async (req, res) => {
    try {
      let forecasts = await Forecast.find().sort({ createdAt: -1 }).limit(24).lean();

      if (!forecasts || forecasts.length === 0) {
        forecasts = await generateHospitalForecasts();
      }

      res.json({ success: true, data: forecasts, count: forecasts.length });
    } catch (err) {
      res.status(503).json({
        success: false,
        errorCode: "FORECAST_UNAVAILABLE",
        message: "Forecast system temporarily unavailable",
      });
    }
  })
);

// ─────────────────────────────────────────────
// ALERTS
// ─────────────────────────────────────────────

n8nRouter.get(
  "/alerts",
  asyncHandler(async (req, res) => {
    const { status, severity } = req.query;
    const query = {};
    if (status) query.status = status;
    if (severity) query.severity = severity.toUpperCase();
    const alerts = await Alert.find(query).sort({ createdAt: -1 }).limit(50).lean();
    res.json({ success: true, data: alerts, count: alerts.length });
  })
);

n8nRouter.patch(
  "/alerts/:id",
  asyncHandler(async (req, res) => {
    const alert = await Alert.findById(req.params.id);
    if (!alert)
      return res
        .status(404)
        .json({ success: false, errorCode: "NOT_FOUND", message: "Alert not found" });
    alert.status = req.body.status || "acknowledged";
    alert.acknowledgedAt = new Date();
    await alert.save();
    res.json({ success: true, data: alert });
  })
);

// ─────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────

n8nRouter.get(
  "/dashboard/overview",
  asyncHandler(async (req, res) => {
    const [
      totalDoctors,
      availableDoctors,
      totalBeds,
      availableBeds,
      totalStaff,
      activeEmergencies,
      pendingAppointments,
    ] = await Promise.all([
      Doctor.countDocuments(),
      Doctor.countDocuments({ available: true }),
      Bed.countDocuments(),
      Bed.countDocuments({ status: "AVAILABLE" }),
      Staff.countDocuments({ status: "ON_DUTY" }),
      EmergencyEvent.countDocuments({ status: "ACTIVE" }),
      Appointment.countDocuments({ status: "Pending" }),
    ]);

    res.json({
      success: true,
      data: {
        doctors: { total: totalDoctors, available: availableDoctors },
        beds: {
          total: totalBeds,
          available: availableBeds,
          occupied: totalBeds - availableBeds,
          occupancyRate:
            totalBeds > 0 ? Math.round(((totalBeds - availableBeds) / totalBeds) * 100) : 0,
        },
        staff: { onDuty: totalStaff },
        emergencies: { active: activeEmergencies },
        appointments: { pending: pendingAppointments },
        timestamp: new Date().toISOString(),
      },
    });
  })
);

// ─────────────────────────────────────────────
// PATIENT (service-level access)
// ─────────────────────────────────────────────

n8nRouter.get(
  "/patient/appointments",
  asyncHandler(async (req, res) => {
    const { patientId, mobile } = req.query;
    if (!patientId && !mobile) {
      return res.status(400).json({
        success: false,
        errorCode: "MISSING_PARAM",
        message: "patientId or mobile is required",
      });
    }

    const query = {};
    if (patientId) query.createdBy = patientId;
    if (mobile) query.mobile = mobile;

    const appointments = await Appointment.find(query)
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({ success: true, data: appointments, count: appointments.length });
  })
);

// ─────────────────────────────────────────────
// RTLS
// ─────────────────────────────────────────────

n8nRouter.get(
  "/rtls/resources",
  asyncHandler(async (req, res) => {
    // Return in-memory nexus store RTLS data (always available)
    const locations = nexusStore?.rtlsLocations || [];
    res.json({ success: true, data: locations, count: locations.length });
  })
);

// ─────────────────────────────────────────────
// FHIR / EMR (read-only for n8n)
// ─────────────────────────────────────────────

n8nRouter.get(
  "/fhir/patient/:id",
  asyncHandler(async (req, res) => {
    const patient = await Patient.findById(req.params.id).lean();
    if (!patient)
      return res
        .status(404)
        .json({ success: false, errorCode: "NOT_FOUND", message: "Patient not found" });

    // FHIR R4 Patient resource shape
    res.json({
      success: true,
      data: {
        resourceType: "Patient",
        id: patient._id,
        name: [{ text: patient.name }],
        telecom: patient.mobile ? [{ system: "phone", value: patient.mobile }] : [],
        gender: patient.gender || "unknown",
        birthDate: patient.dob || null,
        address: patient.address ? [{ text: patient.address }] : [],
      },
    });
  })
);

export default n8nRouter;
