// backend/routes/nexusRouter.js
import express from "express";
import {
  streamEvents,
  getDashboardOverview,
  getBeds,
  updateBedStatus,
  getStaff,
  updateStaffStatus,
  getEquipment,
  updateEquipmentLocation,
  getOperatingTheatres,
  scheduleOT,
  updateOTStatus,
  getDiagnosticResources,
  rerouteDiagnostics,
  triggerEmergency,
  triggerReallocation,
  getForecasts,
  generateForecasts,
  runSimulation,
  resetSimulationDemo,
  getAlerts,
  acknowledgeAlert,
  getRtlsLocations,
  updateRtlsLocation,
  getFhirPatientResource,
  getFhirEncounterResource,
  getFhirObservationResource,
  copilotQuery,
  // Section 49 Specification APIs
  getHospitalState,
  getAllResources,
  getResourceById,
  updateResourceStatus,
  getConflicts,
  resolveConflict,
  getRecommendations,
  approveRecommendation,
  rejectRecommendation,
  executeAllocation,
  getTransfers,
  requestTransfer,
  approveTransfer,
  confirmTransferArrival,
  runWhatIfSimulation,
  getResourceDependencies,
  getAuditLogs,
  runScenario
} from "../controllers/nexusController.js";

const nexusRouter = express.Router();

// Real-Time Events SSE
nexusRouter.get("/events", streamEvents);

// Authoritative Complete Operational State (Section 5)
nexusRouter.get("/hospital/state", getHospitalState);
nexusRouter.get("/state", getHospitalState);

// Dashboard KPIs
nexusRouter.get("/dashboard/overview", getDashboardOverview);

// Unified Resource Registry (Section 49)
nexusRouter.get("/resources", getAllResources);
nexusRouter.get("/resources/:id", getResourceById);
nexusRouter.post("/resources/:id/status", updateResourceStatus);
nexusRouter.patch("/resources/:id/status", updateResourceStatus);

// Beds & Wards
nexusRouter.get("/beds", getBeds);
nexusRouter.patch("/beds/:id/status", updateBedStatus);

// Staff & Workload
nexusRouter.get("/staff", getStaff);
nexusRouter.patch("/staff/:id/status", updateStaffStatus);

// Equipment & Life-Support Devices
nexusRouter.get("/equipment", getEquipment);
nexusRouter.patch("/equipment/:id/location", updateEquipmentLocation);

// Operating Theatres (OT)
nexusRouter.get("/ot", getOperatingTheatres);
nexusRouter.post("/ot/schedule", scheduleOT);
nexusRouter.patch("/ot/:id/status", updateOTStatus);

// Diagnostic Suites & Dynamic Queue Re-routing
nexusRouter.get("/diagnostics", getDiagnosticResources);
nexusRouter.post("/diagnostics/reroute", rerouteDiagnostics);

// Emergency Orchestration Workflow
nexusRouter.post("/emergency", triggerEmergency);

// Autonomous Re-Optimization & Conflict Simulation
nexusRouter.post("/orchestrator/reallocate", triggerReallocation);

// Multi-Horizon Forecasting
nexusRouter.get("/forecast", getForecasts);
nexusRouter.get("/forecast/:department", getForecasts);
nexusRouter.post("/forecast/generate", generateForecasts);

// Simulation & Scenarios
nexusRouter.post("/simulation/run", runSimulation);
nexusRouter.post("/simulation/reset", resetSimulationDemo);
nexusRouter.post("/reset-demo", resetSimulationDemo);
nexusRouter.post("/seed", resetSimulationDemo);

// What-If Simulation Sandbox (Section 28, 57)
nexusRouter.post("/what-if", runWhatIfSimulation);

// 1-Click Reproducible Scenario Execution (Section 51-56, 70)
nexusRouter.post("/scenarios/run", runScenario);
nexusRouter.post("/scenarios/:scenarioType/run", runScenario);

// Human-in-the-Loop Recommendations (Section 29, 58)
nexusRouter.get("/recommendations", getRecommendations);
nexusRouter.post("/recommendations/:id/approve", approveRecommendation);
nexusRouter.post("/recommendations/:id/reject", rejectRecommendation);
nexusRouter.post("/allocation/execute", executeAllocation);

// Operational Conflicts (Section 47)
nexusRouter.get("/conflicts", getConflicts);
nexusRouter.post("/conflicts/:id/resolve", resolveConflict);

// Patient Transfer Orchestration (Section 13, 53)
nexusRouter.get("/transfers", getTransfers);
nexusRouter.post("/transfers/request", requestTransfer);
nexusRouter.post("/transfers/:id/approve", approveTransfer);
nexusRouter.post("/transfers/:id/arrival", confirmTransferArrival);

// Multi-Resource Dependency Graph & Cascading Impact (Section 17, 39)
nexusRouter.get("/dependencies", getResourceDependencies);
nexusRouter.get("/dependencies/:resourceId", getResourceDependencies);

// Immutable Audit Trail (Section 48)
nexusRouter.get("/audit", getAuditLogs);

// Alerts & Notifications
nexusRouter.get("/alerts", getAlerts);
nexusRouter.patch("/alerts/:id", acknowledgeAlert);

// RTLS 2D Floorplan Tracking
nexusRouter.get("/rtls/resources", getRtlsLocations);
nexusRouter.patch("/rtls/:resourceId/location", updateRtlsLocation);

// FHIR R4 Interoperability Endpoints
nexusRouter.get("/integration/fhir/patient/:id", getFhirPatientResource);
nexusRouter.get("/integration/fhir/encounter/:id", getFhirEncounterResource);
nexusRouter.get("/integration/fhir/observation/:id", getFhirObservationResource);

// AI Operations Copilot
nexusRouter.post("/copilot/chat", copilotQuery);

// ─────────────────────────────────────────────────────────────
// Round 2 Modules (Jury 25 Marks Specifications)
// ─────────────────────────────────────────────────────────────
import {
  getResourceHeatmap,
  solveDynamicSchedule,
  allocateScheduleSlot,
  getOpQueues,
  orderDiagnostics,
  completeDiagnosticTest,
  reviewAndPrescribe,
  getSecurityOverview,
  requestBreakGlass,
  revokeBreakGlass,
  toggleConsent,
  getAiMlStrategy,
  runDemoStep
} from "../controllers/nexusRound2Controller.js";

// Module 1: Dynamic Scheduling & Time Dependency Engine
nexusRouter.post("/scheduling/solve", solveDynamicSchedule);
nexusRouter.post("/scheduling/allocate", allocateScheduleSlot);

// Module 2: Resource Heatmap (Real-Time & Predictive)
nexusRouter.get("/heatmap", getResourceHeatmap);

// Module 3: Smart OP & Virtual Dynamic Queues
nexusRouter.get("/op-queues", getOpQueues);
nexusRouter.post("/op-queues/order-diagnostics", orderDiagnostics);
nexusRouter.post("/op-queues/complete-test", completeDiagnosticTest);
nexusRouter.post("/op-queues/review", reviewAndPrescribe);

// Module 4: Security & Patient Privacy Center (Break-Glass & RBAC)
nexusRouter.get("/security/overview", getSecurityOverview);
nexusRouter.post("/security/break-glass/request", requestBreakGlass);
nexusRouter.post("/security/break-glass/:sessionId/revoke", revokeBreakGlass);
nexusRouter.post("/security/consent/toggle", toggleConsent);

// Module 5: AI/ML Strategy
nexusRouter.get("/ml/strategy", getAiMlStrategy);
nexusRouter.get("/ml/models", getAiMlStrategy);

// Module 6: 13-Step Killer Round 2 Demo Runner
nexusRouter.post("/demo/run-step", runDemoStep);

export default nexusRouter;
