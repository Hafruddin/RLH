// backend/routes/voiceToolsRouter.js
import express from "express";
import {
  searchDoctorsTool,
  checkDoctorAvailabilityTool,
  bookAppointmentTool,
  rescheduleAppointmentTool,
  cancelAppointmentTool,
  getPatientAppointmentsTool,
  bookDiagnosticTool,
  createEmergencyTool,
  reserveBedTool,
  allocateStaffTool,
  allocateOTTool,
  reserveEquipmentTool,
  getForecastTool,
  getHospitalStateTool
} from "../controllers/voiceToolsController.js";

const voiceToolsRouter = express.Router();

voiceToolsRouter.post("/search-doctors", searchDoctorsTool);
voiceToolsRouter.post("/check-doctor-availability", checkDoctorAvailabilityTool);
voiceToolsRouter.post("/book-appointment", bookAppointmentTool);
voiceToolsRouter.post("/reschedule-appointment", rescheduleAppointmentTool);
voiceToolsRouter.post("/cancel-appointment", cancelAppointmentTool);
voiceToolsRouter.post("/get-patient-appointments", getPatientAppointmentsTool);
voiceToolsRouter.post("/book-diagnostic", bookDiagnosticTool);
voiceToolsRouter.post("/create-emergency", createEmergencyTool);
voiceToolsRouter.post("/orchestrate-emergency", createEmergencyTool);
voiceToolsRouter.post("/reserve-bed", reserveBedTool);
voiceToolsRouter.post("/allocate-staff", allocateStaffTool);
voiceToolsRouter.post("/allocate-ot", allocateOTTool);
voiceToolsRouter.post("/reserve-equipment", reserveEquipmentTool);
voiceToolsRouter.post("/get-forecast", getForecastTool);
voiceToolsRouter.post("/get-hospital-state", getHospitalStateTool);

export default voiceToolsRouter;
