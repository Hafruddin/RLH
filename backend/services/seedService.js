// backend/services/seedService.js
import mongoose from "mongoose";
import "dotenv/config";
import Patient from "../models/Patient.js";
import Ward from "../models/Ward.js";
import Bed from "../models/Bed.js";
import Equipment from "../models/Equipment.js";
import Staff from "../models/Staff.js";
import OperatingTheatre from "../models/OperatingTheatre.js";
import DiagnosticResource from "../models/DiagnosticResource.js";
import PatientQueue from "../models/PatientQueue.js";
import EmergencyEvent from "../models/EmergencyEvent.js";
import ResourceAssignment from "../models/ResourceAssignment.js";
import Forecast from "../models/Forecast.js";
import Alert from "../models/Alert.js";
import RTLSLocation from "../models/RTLSLocation.js";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";
import { mockAppointments } from "../utils/mockDb.js";

export async function seedNexusData() {
  console.log("🌱 [MediCare Nexus] Seeding complete demo data...");
  if (mongoose.connection.readyState !== 1) {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URL || "mongodb://127.0.0.1:27017/medicare";
    await mongoose.connect(uri);
  }

  // 1. Wards
  await Ward.deleteMany({});
  const wards = [
    { wardId: "WARD-ICU", name: "Intensive Care Unit (ICU)", type: "ICU", floor: 2, totalBeds: 10, availableBeds: 2, occupiedBeds: 8, location: "Floor 2, Wing A" },
    { wardId: "WARD-EMG", name: "Emergency Department", type: "Emergency", floor: 1, totalBeds: 10, availableBeds: 3, occupiedBeds: 7, location: "Floor 1, West Entrance" },
    { wardId: "WARD-GEN-A", name: "General Ward A", type: "General", floor: 3, totalBeds: 10, availableBeds: 4, occupiedBeds: 6, location: "Floor 3, East Wing" },
    { wardId: "WARD-GEN-B", name: "General Ward B", type: "General", floor: 3, totalBeds: 10, availableBeds: 5, occupiedBeds: 5, location: "Floor 3, West Wing" },
    { wardId: "WARD-SURG", name: "Surgical Recovery Ward", type: "Surgical", floor: 4, totalBeds: 8, availableBeds: 3, occupiedBeds: 5, location: "Floor 4, North Wing" }
  ];
  await Ward.insertMany(wards);

  // 2. Beds (48 beds total across wards)
  await Bed.deleteMany({});
  const beds = [];
  // ICU Beds: ICU-01 to ICU-10 (ICU-05 is AVAILABLE for our demo workflow!)
  for (let i = 1; i <= 10; i++) {
    const bedId = `ICU-${String(i).padStart(2, "0")}`;
    const isAvail = i === 5 || i === 8;
    beds.push({
      bedId,
      wardId: "WARD-ICU",
      roomNumber: `20${i}`,
      bedType: "ICU",
      status: isAvail ? "AVAILABLE" : "OCCUPIED",
      patientId: isAvail ? null : `P-ICU-${i}`,
      location: `Floor 2, ICU Pod ${Math.ceil(i / 2)}`,
      isolationCapable: i === 1 || i === 5,
      equipment: ["Ventilator", "Patient Monitor", "Infusion Pump", "ECG"],
      lastUpdated: new Date()
    });
  }

  // Emergency Beds: ER-01 to ER-10
  for (let i = 1; i <= 10; i++) {
    const bedId = `ER-${String(i).padStart(2, "0")}`;
    const isAvail = i === 2 || i === 7 || i === 9;
    beds.push({
      bedId,
      wardId: "WARD-EMG",
      roomNumber: `10${i}`,
      bedType: "Emergency",
      status: isAvail ? "AVAILABLE" : "OCCUPIED",
      patientId: isAvail ? null : `P-EMG-${i}`,
      location: `Floor 1, ER Bay ${i}`,
      isolationCapable: i === 1,
      equipment: ["Patient Monitor", "Defibrillator"],
      lastUpdated: new Date()
    });
  }

  // General Beds
  for (let i = 1; i <= 20; i++) {
    const wardId = i <= 10 ? "WARD-GEN-A" : "WARD-GEN-B";
    const bedId = `GEN-${String(i).padStart(2, "0")}`;
    const isAvail = i % 2 === 0;
    beds.push({
      bedId,
      wardId,
      roomNumber: `30${i}`,
      bedType: "Standard",
      status: isAvail ? "AVAILABLE" : "OCCUPIED",
      patientId: isAvail ? null : `P-GEN-${i}`,
      location: `Floor 3, Room ${i}`,
      isolationCapable: false,
      equipment: ["Patient Monitor"],
      lastUpdated: new Date()
    });
  }

  // Surgical Beds
  for (let i = 1; i <= 8; i++) {
    const bedId = `SURG-${String(i).padStart(2, "0")}`;
    const isAvail = i > 5;
    beds.push({
      bedId,
      wardId: "WARD-SURG",
      roomNumber: `40${i}`,
      bedType: "Recovery",
      status: isAvail ? "AVAILABLE" : "OCCUPIED",
      patientId: isAvail ? null : `P-SURG-${i}`,
      location: `Floor 4, Recovery ${i}`,
      isolationCapable: true,
      equipment: ["Patient Monitor", "Infusion Pump"],
      lastUpdated: new Date()
    });
  }
  await Bed.insertMany(beds);

  // 3. Equipment (20 critical items)
  await Equipment.deleteMany({});
  const equipment = [
    { equipmentId: "V-01", type: "Ventilator", name: "Hamilton-G5 High-End Ventilator", status: "IN_USE", currentLocation: "ICU Floor 2", department: "ICU" },
    { equipmentId: "V-02", type: "Ventilator", name: "Hamilton-G5 High-End Ventilator", status: "IN_USE", currentLocation: "ICU Floor 2", department: "ICU" },
    { equipmentId: "V-03", type: "Ventilator", name: "Puritan Bennett 980", status: "IN_USE", currentLocation: "Emergency Ward", department: "Emergency" },
    { equipmentId: "V-04", type: "Ventilator", name: "Puritan Bennett 980 (Demo Ready)", status: "AVAILABLE", currentLocation: "Emergency Ward", department: "Emergency" },
    { equipmentId: "V-05", type: "Ventilator", name: "Maquet SERVO-u", status: "AVAILABLE", currentLocation: "Equipment Storage A", department: "ICU" },
    { equipmentId: "ECG-01", type: "ECG", name: "GE MAC 2000 12-Lead ECG", status: "IN_USE", currentLocation: "Cardiology OPD", department: "Cardiology" },
    { equipmentId: "ECG-02", type: "ECG", name: "Philips PageWriter TC70", status: "AVAILABLE", currentLocation: "Emergency Ward", department: "Emergency" },
    { equipmentId: "ECG-03", type: "ECG", name: "GE MAC 2000 12-Lead ECG", status: "AVAILABLE", currentLocation: "ICU Floor 2", department: "ICU" },
    { equipmentId: "MON-01", type: "Patient Monitor", name: "Philips IntelliVue MX750", status: "IN_USE", currentLocation: "ICU Floor 2", department: "ICU" },
    { equipmentId: "MON-02", type: "Patient Monitor", name: "Mindray BeneVision N17", status: "AVAILABLE", currentLocation: "Emergency Ward", department: "Emergency" },
    { equipmentId: "MON-03", type: "Patient Monitor", name: "Mindray BeneVision N17", status: "AVAILABLE", currentLocation: "Equipment Storage B", department: "General" },
    { equipmentId: "XRAY-M01", type: "X-Ray", name: "Carestream Mobile X-Ray unit", status: "AVAILABLE", currentLocation: "Diagnostics Block", department: "Radiology" },
    { equipmentId: "US-01", type: "Ultrasound", name: "GE Voluson E10 Ultrasound", status: "IN_USE", currentLocation: "Diagnostics Room 3", department: "Radiology" },
    { equipmentId: "US-02", type: "Ultrasound", name: "Philips Affiniti 70 Mobile", status: "AVAILABLE", currentLocation: "Emergency Bay", department: "Emergency" },
    { equipmentId: "PUMP-01", type: "Infusion Pump", name: "Alaris Infusion System", status: "AVAILABLE", currentLocation: "ICU Floor 2", department: "ICU" },
    { equipmentId: "PUMP-02", type: "Infusion Pump", name: "Alaris Infusion System", status: "AVAILABLE", currentLocation: "Emergency Ward", department: "Emergency" },
    { equipmentId: "PUMP-03", type: "Infusion Pump", name: "Baxter Sigma Spectrum", status: "IN_USE", currentLocation: "Surgical Recovery", department: "Surgical" },
    { equipmentId: "DEF-01", type: "Defibrillator", name: "ZOLL R Series Plus", status: "AVAILABLE", currentLocation: "Emergency Crash Cart 1", department: "Emergency" },
    { equipmentId: "DEF-02", type: "Defibrillator", name: "ZOLL R Series Plus", status: "AVAILABLE", currentLocation: "ICU Crash Cart", department: "ICU" },
    { equipmentId: "DEF-03", type: "Defibrillator", name: "Philips HeartStart XL+", status: "MAINTENANCE", currentLocation: "Bio-Med Workshop", department: "Emergency", maintenanceStatus: "UNDER_REPAIR" }
  ];
  await Equipment.insertMany(equipment);

  // 4. Staff (90+ staff members: 25 doctors, 50 nurses, 15 technicians/surgeons)
  await Staff.deleteMany({});
  const staff = [
    // Key Doctors (Indian Bangalore Doctors)
    { staffId: "DOC-01", name: "Dr. Rajesh Kumar", role: "Doctor", specialization: "Cardiologist", department: "Cardiology", status: "ON_DUTY", workload: "LOW", workloadScore: 25, currentLocation: "Emergency Desk", emergencyEligible: true, skills: ["Advanced Cardiac Life Support", "Angioplasty", "Echo"] },
    { staffId: "DOC-02", name: "Dr. Suresh Reddy", role: "Doctor", specialization: "Neurologist", department: "Neurology", status: "ON_DUTY", workload: "MEDIUM", workloadScore: 55, currentLocation: "NeuroCare Room 2", emergencyEligible: true, skills: ["Stroke Intervention", "EEG", "Neuro-Critical Care"] },
    { staffId: "DOC-03", name: "Dr. Ananya Deshmukh", role: "Doctor", specialization: "Pediatrician", department: "Pediatrics", status: "ON_DUTY", workload: "LOW", workloadScore: 30, currentLocation: "Pediatric Wing", emergencyEligible: true, skills: ["PALS", "Neonatal Resuscitation"] },
    { staffId: "DOC-04", name: "Dr. Vikram Hegde", role: "Surgeon", specialization: "Orthopedic Surgeon", department: "Surgery", status: "ON_DUTY", workload: "MEDIUM", workloadScore: 60, currentLocation: "OT Floor 3", emergencyEligible: true, skills: ["Trauma Surgery", "Arthroplasty"] },
    { staffId: "DOC-05", name: "Dr. Priya Sharma", role: "Doctor", specialization: "Critical Care Specialist", department: "ICU", status: "ON_DUTY", workload: "HIGH", workloadScore: 78, currentLocation: "ICU Floor 2", emergencyEligible: true, skills: ["Intubation", "Ventilator Management", "Central Line"] },
    { staffId: "DOC-06", name: "Dr. Karthik Venkatesh", role: "Doctor", specialization: "General Physician", department: "Emergency", status: "ON_DUTY", workload: "MEDIUM", workloadScore: 50, currentLocation: "ER Triage", emergencyEligible: true, skills: ["Emergency Medicine", "Triage"] },
    { staffId: "DOC-07", name: "Dr. Sunita Kulkarni", role: "Surgeon", specialization: "General Surgeon", department: "Surgery", status: "ON_CALL", workload: "LOW", workloadScore: 10, currentLocation: "Doctors Lounge", emergencyEligible: true, skills: ["Emergency Laparotomy", "Trauma"] },
    { staffId: "DOC-08", name: "Dr. Kabir Malhotra", role: "Anesthetist", specialization: "Cardiac Anesthetist", department: "Surgery", status: "ON_DUTY", workload: "LOW", workloadScore: 35, currentLocation: "OT Complex", emergencyEligible: true, skills: ["Cardiac Anesthesia", "Airway Management"] },
  ];

  // Additional Doctors
  for (let i = 9; i <= 25; i++) {
    const specs = ["Cardiologist", "Pulmonologist", "Nephrologist", "Radiologist", "Emergency Medicine", "Surgeon"];
    staff.push({
      staffId: `DOC-${String(i).padStart(2, "0")}`,
      name: `Dr. Clinician ${i}`,
      role: i > 20 ? "Surgeon" : "Doctor",
      specialization: specs[i % specs.length],
      department: i % 2 === 0 ? "Emergency" : "General",
      status: i % 5 === 0 ? "OFF_DUTY" : "ON_DUTY",
      workload: i % 3 === 0 ? "HIGH" : i % 2 === 0 ? "MEDIUM" : "LOW",
      workloadScore: 30 + (i * 3) % 65,
      currentLocation: `Wing ${String.fromCharCode(65 + (i % 4))}`,
      emergencyEligible: i % 2 === 0,
      skills: ["General Medicine", "BLS"]
    });
  }

  // Nurses (including N-07 ready for demo workflow!)
  for (let i = 1; i <= 50; i++) {
    const staffId = `N-${String(i).padStart(2, "0")}`;
    const isN07 = i === 7;
    staff.push({
      staffId,
      name: isN07 ? "Nurse Sarah Jenkins (N-07)" : `Nurse Specialist ${i}`,
      role: "Nurse",
      specialization: isN07 ? "ICU Critical Care" : i <= 20 ? "Emergency Nursing" : "General Ward",
      department: isN07 ? "ICU" : i <= 20 ? "Emergency" : "General",
      status: "ON_DUTY",
      workload: isN07 ? "LOW" : i % 4 === 0 ? "HIGH" : "MEDIUM",
      workloadScore: isN07 ? 20 : 35 + (i * 2) % 55,
      currentLocation: isN07 ? "ICU Station 1" : `Station ${Math.ceil(i / 10)}`,
      emergencyEligible: true,
      skills: ["Vitals Monitoring", "IV Cannulation", "Emergency Drug Admin", "Ventilator Suctioning"]
    });
  }

  // Technicians
  for (let i = 1; i <= 15; i++) {
    staff.push({
      staffId: `TECH-${String(i).padStart(2, "0")}`,
      name: `Technician ${i}`,
      role: "Technician",
      specialization: i <= 5 ? "Radiology" : i <= 10 ? "Pathology/Lab" : "Bio-Medical",
      department: "Diagnostics",
      status: "ON_DUTY",
      workload: "MEDIUM",
      workloadScore: 45,
      currentLocation: "Diagnostics Floor G",
      emergencyEligible: true,
      skills: ["CT Scan Op", "MRI Op", "X-Ray Acquisition", "Rapid Blood Testing"]
    });
  }
  await Staff.insertMany(staff);

  // 5. Operating Theatres (8 OTs, OT-04 is available and ready for emergency surgical allocation)
  await OperatingTheatre.deleteMany({});
  const ots = [
    { otId: "OT-01", name: "Cardiac Surgical Suite 1", type: "Cardiac", status: "OCCUPIED", currentProcedure: "CABG", assignedSurgeon: "Dr. Vikram Hegde", availableFrom: new Date(Date.now() + 90 * 60000), equipment: ["Bypass Machine", "C-Arm", "Anesthesia Workstation"], location: "Floor 4, West Wing" },
    { otId: "OT-02", name: "Neuro Surgical Suite", type: "Neuro", status: "OCCUPIED", currentProcedure: "Craniotomy", assignedSurgeon: "Dr. Suresh Reddy", availableFrom: new Date(Date.now() + 120 * 60000), equipment: ["Neuro-Navigation", "Microscope"], location: "Floor 4, West Wing" },
    { otId: "OT-03", name: "Orthopedic Suite 1", type: "Orthopedic", status: "RESERVED", currentProcedure: "Knee Replacement Prep", assignedSurgeon: "Dr. Clinician 21", availableFrom: new Date(Date.now() + 45 * 60000), equipment: ["Arthroscope", "Fluoroscopy"], location: "Floor 4, Central" },
    { otId: "OT-04", name: "Emergency Hybrid OT (Demo Ready)", type: "Emergency", status: "AVAILABLE", currentProcedure: null, assignedSurgeon: null, availableFrom: new Date(), equipment: ["C-Arm Fluoroscopy", "Rapid Infuser", "Anesthesia Workstation", "Ventilator V-05"], location: "Floor 4, Immediate Elevator Access" },
    { otId: "OT-05", name: "General Surgery Suite 1", type: "General", status: "AVAILABLE", currentProcedure: null, assignedSurgeon: null, availableFrom: new Date(), equipment: ["Laparoscopic Tower", "Electrocautery"], location: "Floor 4, East Wing" },
    { otId: "OT-06", name: "General Surgery Suite 2", type: "General", status: "OCCUPIED", currentProcedure: "Appendectomy", assignedSurgeon: "Dr. Sunita Kulkarni", availableFrom: new Date(Date.now() + 30 * 60000), equipment: ["Laparoscopic Tower"], location: "Floor 4, East Wing" },
    { otId: "OT-07", name: "Maternity / C-Section OT", type: "Maternity", status: "AVAILABLE", currentProcedure: null, assignedSurgeon: null, availableFrom: new Date(), equipment: ["Infant Resuscitation", "Ultrasound"], location: "Floor 3, Maternity" },
    { otId: "OT-08", name: "Minor Day-Care OT", type: "General", status: "MAINTENANCE", currentProcedure: null, assignedSurgeon: null, availableFrom: new Date(Date.now() + 300 * 60000), equipment: [], location: "Floor 4, Bio-Med Inspection" }
  ];
  await OperatingTheatre.insertMany(ots);

  // 6. Diagnostic Resources (12 resources)
  await DiagnosticResource.deleteMany({});
  const diagResources = [
    { resourceId: "DIAG-XR1", type: "X-Ray", name: "Digital X-Ray Suite 1", department: "Radiology", status: "BUSY", queueLength: 7, averageWaitTime: 38, capacity: 40, location: "Ground Floor Room G-12" },
    { resourceId: "DIAG-XR2", type: "X-Ray", name: "Digital X-Ray Suite 2 (Fast-Track)", department: "Radiology", status: "AVAILABLE", queueLength: 1, averageWaitTime: 6, capacity: 40, location: "Ground Floor Room G-14" },
    { resourceId: "DIAG-CT1", type: "CT", name: "128-Slice Trauma CT Scanner", department: "Radiology", status: "BUSY", queueLength: 4, averageWaitTime: 25, capacity: 25, location: "Ground Floor Room G-18" },
    { resourceId: "DIAG-MRI1", type: "MRI", name: "3.0 Tesla High-Res MRI", department: "Radiology", status: "BUSY", queueLength: 6, averageWaitTime: 45, capacity: 16, location: "Basement 1, Room B-04" },
    { resourceId: "DIAG-US1", type: "Ultrasound", name: "Doppler Ultrasound Room 1", department: "Radiology", status: "BUSY", queueLength: 5, averageWaitTime: 20, capacity: 30, location: "Ground Floor Room G-20" },
    { resourceId: "DIAG-US2", type: "Ultrasound", name: "Point-of-Care Ultrasound 2", department: "Radiology", status: "AVAILABLE", queueLength: 0, averageWaitTime: 4, capacity: 30, location: "Emergency Annex G-02" },
    { resourceId: "DIAG-LAB-CBC", type: "Blood Lab", name: "Automated Hematology Lab (CBC)", department: "Pathology", status: "BUSY", queueLength: 12, averageWaitTime: 15, capacity: 150, location: "Floor 1 Central Lab" },
    { resourceId: "DIAG-LAB-BIO", type: "Blood Lab", name: "Biochemistry & Cardiac Markers (Troponin/LFT)", department: "Pathology", status: "AVAILABLE", queueLength: 3, averageWaitTime: 8, capacity: 150, location: "Floor 1 Stat Lab" },
    { resourceId: "DIAG-ECG1", type: "ECG", name: "Emergency ECG Station", department: "Cardiology", status: "AVAILABLE", queueLength: 1, averageWaitTime: 5, capacity: 60, location: "Emergency Bay Room 04" },
    { resourceId: "DIAG-ECHO1", type: "ECG", name: "Echocardiography Unit", department: "Cardiology", status: "BUSY", queueLength: 3, averageWaitTime: 22, capacity: 20, location: "Floor 2 Room 210" },
    { resourceId: "DIAG-PATH1", type: "Pathology", name: "Rapid Histopathology Center", department: "Pathology", status: "AVAILABLE", queueLength: 2, averageWaitTime: 30, capacity: 25, location: "Floor 1 Room 115" },
    { resourceId: "DIAG-PFT1", type: "Pathology", name: "Pulmonary Function Test Room", department: "Pulmonology", status: "MAINTENANCE", queueLength: 0, averageWaitTime: 0, capacity: 15, location: "Floor 2 Room 225" }
  ];
  await DiagnosticResource.insertMany(diagResources);

  // 7. Patients (100+ realistic patients)
  await Patient.deleteMany({});
  const patients = [];
  const firstNames = ["James", "Emma", "Liam", "Olivia", "Noah", "Ava", "William", "Sophia", "Benjamin", "Isabella", "Aarav", "Priya", "Rohan", "Ananya", "Vikram", "Sneha", "Kabir", "Meera", "Arjun", "Pooja"];
  const lastNames = ["Smith", "Patel", "Johnson", "Sharma", "Williams", "Verma", "Brown", "Rao", "Jones", "Gupta", "Miller", "Mehta", "Davis", "Kumar", "Wilson", "Chopra"];
  const bloods = ["O+", "A+", "B+", "AB+", "O-", "A-", "B-"];
  const departments = ["Emergency", "ICU", "Cardiology", "Neurology", "Pediatrics", "General Medicine", "Orthopedics"];

  for (let i = 1; i <= 100; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[i % lastNames.length];
    const acuity = i <= 6 ? "CRITICAL" : i <= 25 ? "HIGH" : i <= 65 ? "MEDIUM" : "LOW";
    const status = i <= 15 ? "Admitted" : i <= 30 ? "Doctor" : i <= 55 ? "Diagnostic" : i <= 75 ? "Triage" : "Waiting";
    
    patients.push({
      patientId: `P-${String(100 + i)}`,
      name: `${fn} ${ln}`,
      age: 18 + (i * 7) % 65,
      gender: i % 2 === 0 ? "Female" : "Male",
      contact: `+91 98${String(10000000 + i * 832).slice(0, 8)}`,
      bloodGroup: bloods[i % bloods.length],
      department: departments[i % departments.length],
      acuity,
      currentStatus: status,
      currentWard: status === "Admitted" ? (acuity === "CRITICAL" ? "WARD-ICU" : "WARD-GEN-A") : null,
      currentBed: status === "Admitted" ? (acuity === "CRITICAL" ? `ICU-${String((i % 8) + 1).padStart(2, "0")}` : `GEN-${String((i % 10) + 1).padStart(2, "0")}`) : null,
      admissionTime: new Date(Date.now() - (i * 45) * 60000),
      dischargeEstimate: new Date(Date.now() + ((i % 4) + 1) * 86400000),
      vitals: {
        heartRate: 65 + (i * 3) % 55,
        spO2: acuity === "CRITICAL" ? 82 + (i % 6) : 95 + (i % 5),
        bp: acuity === "CRITICAL" ? "85/55" : "120/80",
        temperature: 98.4 + (i % 3) * 0.5,
        respiratoryRate: acuity === "CRITICAL" ? 26 : 16 + (i % 6)
      },
      notes: `Patient assessed in ${departments[i % departments.length]} triage.`
    });
  }
  await Patient.insertMany(patients);

  // 8. RTLS Simulation Locations
  await RTLSLocation.deleteMany({});
  const rtlsItems = [
    { resourceId: "DOC-01", resourceType: "Doctor", resourceName: "Dr. Rajesh Kumar (Cardiology)", location: "Emergency", x: 28, y: 35, floor: 1, batteryLevel: 98, status: "ACTIVE" },
    { resourceId: "DOC-02", resourceType: "Doctor", resourceName: "Dr. Suresh Reddy (Neurology)", location: "OPD", x: 75, y: 25, floor: 1, batteryLevel: 92, status: "ACTIVE" },
    { resourceId: "DOC-05", resourceType: "Doctor", resourceName: "Dr. Priya Sharma (ICU Specialist)", location: "ICU", x: 42, y: 70, floor: 2, batteryLevel: 88, status: "ACTIVE" },
    { resourceId: "N-07", resourceType: "Nurse", resourceName: "Nurse Sarah Jenkins (N-07)", location: "ICU", x: 50, y: 75, floor: 2, batteryLevel: 95, status: "ACTIVE" },
    { resourceId: "N-12", resourceType: "Nurse", resourceName: "Nurse Kevin Lee (N-12)", location: "Emergency", x: 20, y: 40, floor: 1, batteryLevel: 84, status: "ACTIVE" },
    { resourceId: "V-04", resourceType: "Ventilator", resourceName: "Puritan Bennett 980 (V-04)", location: "Emergency", x: 25, y: 48, floor: 1, batteryLevel: 100, status: "READY" },
    { resourceId: "V-05", resourceType: "Ventilator", resourceName: "Maquet SERVO-u (V-05)", location: "ICU", x: 58, y: 68, floor: 2, batteryLevel: 90, status: "READY" },
    { resourceId: "ECG-02", resourceType: "ECG", resourceName: "Philips PageWriter (ECG-02)", location: "Emergency", x: 32, y: 42, floor: 1, batteryLevel: 94, status: "READY" },
    { resourceId: "WHEEL-01", resourceType: "Wheelchair", resourceName: "Smart Transporter W-01", location: "Emergency", x: 15, y: 30, floor: 1, batteryLevel: 85, status: "ACTIVE" },
    { resourceId: "P-104", resourceType: "Patient", resourceName: "Emergency Patient P-104", location: "Emergency", x: 22, y: 38, floor: 1, batteryLevel: 100, status: "CRITICAL" }
  ];
  await RTLSLocation.insertMany(rtlsItems);

  // 9. Forecast Data (Current, +1h, +2h, +4h)
  await Forecast.deleteMany({});
  const forecasts = [
    {
      department: "Emergency",
      timeWindow: "Current",
      currentLoad: 24,
      predictedLoad: 24,
      confidence: 96,
      riskLevel: "MEDIUM",
      recommendedActions: ["Maintain 3 ER triage bays open", "Keep fast-track ECG available"]
    },
    {
      department: "Emergency",
      timeWindow: "1 Hour",
      currentLoad: 24,
      predictedLoad: 30,
      confidence: 93,
      riskLevel: "HIGH",
      recommendedActions: ["Pre-alert on-call emergency physician", "Stage 2 transport stretchers at triage"]
    },
    {
      department: "Emergency",
      timeWindow: "2 Hours",
      currentLoad: 24,
      predictedLoad: 38,
      confidence: 89,
      riskLevel: "CRITICAL",
      recommendedActions: ["Activate overflow protocol", "Redirect non-urgent OPD cases to Clinic B", "Deploy 2 additional nurses from General Ward"]
    },
    {
      department: "Emergency",
      timeWindow: "4 Hours",
      currentLoad: 24,
      predictedLoad: 51,
      confidence: 84,
      riskLevel: "CRITICAL",
      recommendedActions: ["Enact surge staffing plan", "Expedite bed turnaround in General Ward A", "Coordinate standby ventilators with ICU"]
    },
    {
      department: "ICU",
      timeWindow: "Current",
      currentLoad: 8,
      predictedLoad: 8,
      confidence: 95,
      riskLevel: "HIGH",
      recommendedActions: ["ICU occupancy at 80% (8/10 beds). Monitor step-down discharges."]
    },
    {
      department: "ICU",
      timeWindow: "2 Hours",
      currentLoad: 8,
      predictedLoad: 10,
      confidence: 91,
      riskLevel: "CRITICAL",
      recommendedActions: ["Projected 100% ICU capacity. Expedite step-down transfer for P-ICU-02 to Surgical Recovery.", "Reserve ICU-05 for emergent cardiac admission."]
    },
    {
      department: "Diagnostics",
      timeWindow: "Current",
      currentLoad: 18,
      predictedLoad: 18,
      confidence: 94,
      riskLevel: "MEDIUM",
      recommendedActions: ["Route outpatient X-rays to Suite 2 to reduce Suite 1 queue."]
    },
    {
      department: "Diagnostics",
      timeWindow: "2 Hours",
      currentLoad: 18,
      predictedLoad: 28,
      confidence: 88,
      riskLevel: "HIGH",
      recommendedActions: ["Activate secondary CT scanner technician", "Prioritize in-patient emergency ultrasound"]
    }
  ];
  await Forecast.insertMany(forecasts);

  // 10. Initial Alerts
  await Alert.deleteMany({});
  const initialAlerts = [
    {
      alertId: "ALT-101",
      type: "BOTTLENECK",
      severity: "HIGH",
      recipientRole: "OPERATIONS",
      message: "Diagnostics: Digital X-Ray Suite 1 queue length exceeded 7 patients (38 min wait). Automated load-balancing recommended.",
      status: "UNREAD"
    },
    {
      alertId: "ALT-102",
      type: "BED_SHORTAGE",
      severity: "CRITICAL",
      recipientRole: "ADMIN",
      message: "ICU Capacity Alert: Only 2 ICU beds remaining. Predictive model forecasts +2 admissions within 120 minutes.",
      status: "UNREAD"
    },
    {
      alertId: "ALT-103",
      type: "STAFF_OVERLOAD",
      severity: "MEDIUM",
      recipientRole: "DOCTOR",
      message: "Staff Workload Warning: Dr. Priya Sharma workload score is at 78% (HIGH). Next shift rotation in 90 min.",
      status: "UNREAD"
    }
  ];
  // 11. Doctors & Appointments
  try {
    await Doctor.deleteMany({});
    const initialDoctors = [
      {
        _id: "6a3820c82cecc9714b826111",
        name: "Dr. Rajesh Kumar",
        email: "rajesh.kumar@medicare.com",
        password: "password123",
        specialization: "Cardiologist",
        imageUrl: "/assets/D6.png",
        experience: "16 years",
        qualifications: "MBBS, MD (General Medicine), DM (Cardiology)",
        location: "Indiranagar, Bangalore",
        about: "Senior Interventional Cardiologist specializing in coronary interventions, hypertension, and preventive cardiac wellness.",
        fee: 800,
        availability: "Available",
        rating: 4.9,
        patients: "3.5k+",
      },
      {
        _id: "6a3820c82cecc9714b826112",
        name: "Dr. Suresh Reddy",
        email: "suresh.reddy@medicare.com",
        password: "password123",
        specialization: "Neurologist",
        imageUrl: "/assets/D7.png",
        experience: "15 years",
        qualifications: "MBBS, DM (Neurology), DNB",
        location: "Koramangala, Bangalore",
        about: "Consultant Neurologist expert in chronic migraines, epilepsy, neuromuscular disorders, and acute stroke management.",
        fee: 900,
        availability: "Available",
        rating: 4.8,
        patients: "2.8k+",
      },
      {
        _id: "6a3820c82cecc9714b826113",
        name: "Dr. Ananya Deshmukh",
        email: "ananya.deshmukh@medicare.com",
        password: "password123",
        specialization: "Pediatrician",
        imageUrl: "/assets/D4.png",
        experience: "11 years",
        qualifications: "MBBS, MD (Pediatrics), DCH",
        location: "Whitefield, Bangalore",
        about: "Child specialist focused on pediatric nutrition, developmental milestones, vaccinations, and seasonal allergies.",
        fee: 600,
        availability: "Available",
        rating: 4.9,
        patients: "4.2k+",
      },
      {
        _id: "6a3820c82cecc9714b826114",
        name: "Dr. Vikram Hegde",
        email: "vikram.hegde@medicare.com",
        password: "password123",
        specialization: "Orthopedic Surgeon",
        imageUrl: "/assets/D8.png",
        experience: "18 years",
        qualifications: "MBBS, MS (Orthopaedics), M.Ch (Ortho)",
        location: "Jayanagar, Bangalore",
        about: "Expert in robotic joint replacement, arthroscopic knee reconstruction, and sports traumatology.",
        fee: 1000,
        availability: "Available",
        rating: 4.7,
        patients: "3.1k+",
      },
      {
        _id: "6a3820c82cecc9714b826115",
        name: "Dr. Priya Sharma",
        email: "priya.sharma@medicare.com",
        password: "password123",
        specialization: "Dermatologist",
        imageUrl: "/assets/HD5.png",
        experience: "10 years",
        qualifications: "MBBS, MD (Dermatology, Venereology & Leprosy)",
        location: "HSR Layout, Bangalore",
        about: "Clinical and aesthetic dermatologist specializing in acne scar treatments, pigmentation, and hair-loss therapies.",
        fee: 700,
        availability: "Available",
        rating: 4.8,
        patients: "2.9k+",
      },
      {
        _id: "6a3820c82cecc9714b826116",
        name: "Dr. Arvind Swaminathan",
        email: "arvind.swami@medicare.com",
        password: "password123",
        specialization: "Psychiatrist",
        imageUrl: "/assets/D9.png",
        experience: "14 years",
        qualifications: "MBBS, MD (Psychiatry), DPM",
        location: "Malleshwaram, Bangalore",
        about: "Neuropsychiatrist treating anxiety disorders, clinical depression, adult ADHD, and stress management.",
        fee: 850,
        availability: "Available",
        rating: 4.6,
        patients: "2.2k+",
      },
      {
        _id: "6a3820c82cecc9714b826117",
        name: "Dr. Sunita Kulkarni",
        email: "sunita.kulkarni@medicare.com",
        password: "password123",
        specialization: "Gynecologist",
        imageUrl: "/assets/D5.png",
        experience: "16 years",
        qualifications: "MBBS, MS (Obstetrics & Gynaecology), DGO",
        location: "Bellandur, Bangalore",
        about: "Senior Obstetrician and High-Risk Pregnancy Specialist with vast experience in minimally invasive laparoscopic surgeries.",
        fee: 750,
        availability: "Available",
        rating: 4.9,
        patients: "4.5k+",
      },
      {
        _id: "6a3820c82cecc9714b826118",
        name: "Dr. Karthik Venkatesh",
        email: "karthik.v@medicare.com",
        password: "password123",
        specialization: "General Physician",
        imageUrl: "/assets/D12.png",
        experience: "12 years",
        qualifications: "MBBS, MD (Internal Medicine)",
        location: "BTM Layout, Bangalore",
        about: "Consultant Physician focused on lifestyle diseases, type-2 diabetes reversal, hypertension, and infectious diseases.",
        fee: 500,
        availability: "Available",
        rating: 4.8,
        patients: "5.1k+",
      }
    ];
    await Doctor.insertMany(initialDoctors);

    await Appointment.deleteMany({});
    const appointmentsToInsert = mockAppointments.map((a) => ({
      owner: a.owner || "major_admin_id",
      createdBy: a.createdBy || null,
      patientName: a.patientName,
      mobile: a.mobile,
      age: a.age,
      gender: a.gender,
      doctorId: a.doctorId,
      doctorName: a.doctorName,
      speciality: a.speciality,
      doctorImage: { url: "", publicId: "" },
      date: a.date,
      time: a.time,
      fees: a.fees,
      status: a.status,
      payment: a.payment,
      notes: a.notes,
      createdAt: a.createdAt || new Date(),
    }));
    await Appointment.insertMany(appointmentsToInsert);
  } catch (err) {
    console.warn("⚠️ [seedService] Doctor/Appointment seed note:", err.message);
  }

  console.log("✅ [MediCare Nexus] Seeding complete! All resources, beds, staff, OTs, diagnostics, doctors, appointments, and forecast models ready.");
}
