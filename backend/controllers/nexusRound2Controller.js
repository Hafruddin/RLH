// backend/controllers/nexusRound2Controller.js
import { nexusRound2Service } from "../services/nexusRound2Service.js";

// 1. Resource Heatmap
export const getResourceHeatmap = (req, res) => {
  try {
    const data = nexusRound2Service.getResourceHeatmap();
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2. Dynamic Scheduling (CP-SAT Solver)
export const solveDynamicSchedule = (req, res) => {
  try {
    const data = nexusRound2Service.solveDynamicSchedule(req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const allocateScheduleSlot = (req, res) => {
  try {
    const { slotId } = req.body;
    const data = nexusRound2Service.allocateSchedule(slotId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3. Smart OP & Virtual Queues
export const getOpQueues = (req, res) => {
  try {
    const data = nexusRound2Service.getOpQueues();
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const orderDiagnostics = (req, res) => {
  try {
    const data = nexusRound2Service.orderDiagnostics(req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const completeDiagnosticTest = (req, res) => {
  try {
    const data = nexusRound2Service.completeDiagnosticTest(req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const reviewAndPrescribe = (req, res) => {
  try {
    const data = nexusRound2Service.reviewAndPrescribe(req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 4. Security & Privacy Center
export const getSecurityOverview = (req, res) => {
  try {
    const data = nexusRound2Service.getSecurityOverview();
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const requestBreakGlass = (req, res) => {
  try {
    const data = nexusRound2Service.requestBreakGlass(req.body);
    res.json(data);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const revokeBreakGlass = (req, res) => {
  try {
    const { sessionId } = req.params;
    const data = nexusRound2Service.revokeBreakGlass(sessionId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const toggleConsent = (req, res) => {
  try {
    const data = nexusRound2Service.toggleConsent(req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 5. AI/ML Strategy
export const getAiMlStrategy = (req, res) => {
  try {
    const data = nexusRound2Service.getAiMlStrategy();
    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 6. 13-Step Killer Demo Runner
export const runDemoStep = (req, res) => {
  try {
    const { step = 1 } = req.body;
    const data = nexusRound2Service.runDemoStep(Number(step));
    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
