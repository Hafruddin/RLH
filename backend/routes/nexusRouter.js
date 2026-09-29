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
  copilotQuery
} from "../controllers/nexusController.js";

const nexusRouter = express.Router();

// Real-Time Events SSE
nexusRouter.get("/events", streamEvents);

// Dashboard KPIs
nexusRouter.get("/dashboard/overview", getDashboardOverview);

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

// Diagnostic Suites & Dynamic Queue Re-routing
nexusRouter.get("/diagnostics", getDiagnosticResources);
nexusRouter.post("/diagnostics/reroute", rerouteDiagnostics);

// Emergency Orchestration Workflow (P-104 Demo)
nexusRouter.post("/emergency", triggerEmergency);

// Autonomous Re-Optimization & Conflict Simulation (ICU-05 Failure -> Auto-Reallocate)
nexusRouter.post("/orchestrator/reallocate", triggerReallocation);

// Multi-Horizon Forecasting
nexusRouter.get("/forecast", getForecasts);
nexusRouter.post("/forecast/generate", generateForecasts);

// What-If Simulation Studio
nexusRouter.post("/simulation/run", runSimulation);
nexusRouter.post("/simulation/reset", resetSimulationDemo);

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

export default nexusRouter;
