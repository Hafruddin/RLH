// backend/routes/opdRouter.js
import express from "express";
import { opdStore } from "../services/opdService.js";

const opdRouter = express.Router();

// GET all active OPD doctor sessions (for Hospital Central Live OPD Monitor)
opdRouter.get("/sessions", (req, res) => {
  try {
    const sessions = opdStore.getAllSessions();
    res.json({ success: true, count: sessions.length, data: sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single doctor's OPD session
opdRouter.get("/doctor/:id", (req, res) => {
  try {
    const session = opdStore.getSession(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: "Doctor OPD session not found" });
    }
    res.json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST add delay to doctor's OPD (+5, +10, +15 min)
opdRouter.post("/doctor/:id/delay", (req, res) => {
  try {
    const { delayMinutes = 5, reason = "Consultation delay" } = req.body;
    const session = opdStore.addDelay(req.params.id, delayMinutes, reason);
    if (!session) {
      return res.status(404).json({ success: false, message: "Doctor OPD session not found" });
    }
    res.json({ success: true, message: `Added ${delayMinutes}m delay`, data: session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST clear delay
opdRouter.post("/doctor/:id/clear-delay", (req, res) => {
  try {
    const session = opdStore.clearDelay(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: "Doctor OPD session not found" });
    }
    res.json({ success: true, message: "Delay cleared", data: session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST start consultation
opdRouter.post("/doctor/:id/start-consultation", (req, res) => {
  try {
    const session = opdStore.startConsultation(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: "Doctor OPD session not found" });
    }
    res.json({ success: true, message: "Consultation started", data: session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST complete consultation
opdRouter.post("/doctor/:id/complete-consultation", (req, res) => {
  try {
    const session = opdStore.completeConsultation(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: "Doctor OPD session not found" });
    }
    res.json({ success: true, message: "Consultation completed", data: session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST toggle break
opdRouter.post("/doctor/:id/break", (req, res) => {
  try {
    const session = opdStore.toggleBreak(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: "Doctor OPD session not found" });
    }
    res.json({ success: true, message: `Status updated to ${session.status}`, data: session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST toggle emergency mode
opdRouter.post("/doctor/:id/emergency", (req, res) => {
  try {
    const session = opdStore.toggleEmergency(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: "Doctor OPD session not found" });
    }
    res.json({ success: true, message: `Emergency mode updated to ${session.status}`, data: session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST check in patient
opdRouter.post("/check-in", (req, res) => {
  try {
    const { appointmentId, doctorId, patientName } = req.body;
    const entry = opdStore.checkInPatient(appointmentId, doctorId, patientName);
    res.json({ success: true, message: "Checked in successfully", data: entry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET patient's live queue status
opdRouter.get("/appointment/:id/status", (req, res) => {
  try {
    const { doctorId } = req.query;
    const status = opdStore.getPatientStatus(req.params.id, doctorId);
    res.json({ success: true, data: status });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default opdRouter;
