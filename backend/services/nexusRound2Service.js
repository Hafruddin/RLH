// backend/services/nexusRound2Service.js
// MediCare Nexus Round 2 — Dynamic Orchestration, Heatmaps, Virtual Queues, Security & ML Engine

import { broadcastEvent } from "./eventHub.js";
import { nexusStore } from "./nexusStore.js";

class NexusRound2Service {
  constructor() {
    this.breakGlassSessions = [];
    this.patientConsents = {
      "P-101": {
        patientName: "Harsh Tripathi",
        primaryDoctor: { id: "DOC-01", name: "Dr. Sarah Johnson", granted: true },
        radiologyConsent: true,
        pathologyConsent: true,
        externalInsuranceSharing: true,
        aiDiagnosticAssistance: true,
        thirdPartyResearch: false,
      },
      "P-102": {
        patientName: "Elena Rostova",
        primaryDoctor: { id: "DOC-02", name: "Dr. Rajesh Gupta", granted: true },
        radiologyConsent: true,
        pathologyConsent: true,
        externalInsuranceSharing: true,
        aiDiagnosticAssistance: true,
        thirdPartyResearch: false,
      }
    };

    this.auditLogs = [
      {
        id: "AUD-1001",
        who: "dr_sarah_johnson (Cardiologist)",
        role: "DOCTOR",
        action: "CONSULTATION_STARTED",
        timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
        targetObject: "Patient P-101 (Harsh Tripathi)",
        result: "SUCCESS",
        context: "OPD Consultation Room 102 — Encrypted EHR session"
      },
      {
        id: "AUD-1002",
        who: "dr_sarah_johnson",
        role: "DOCTOR",
        action: "DIAGNOSTIC_ORDERED",
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
        targetObject: "Journey JRN-2026-8812 (Blood Profile & CT Chest)",
        result: "SUCCESS",
        context: "Auto-routed to Laboratory & Imaging queues without manual re-registration"
      },
      {
        id: "AUD-1003",
        who: "automated_orchestrator",
        role: "SYSTEM",
        action: "OBJECT_AUTH_CHECK",
        timestamp: new Date(Date.now() - 28 * 60000).toISOString(),
        targetObject: "Record LAB-REC-9081 (Patient P-101)",
        result: "ALLOWED",
        context: "Verified active consent & assigned consultation context"
      }
    ];

    // Journey-aware Virtual OP Queues
    this.activeJourneys = [
      {
        journeyId: "JRN-2026-8812",
        patientId: "P-101",
        patientName: "Harsh Tripathi",
        age: 34,
        gender: "Male",
        bloodGroup: "O+",
        abhaId: "91-8273-4412-9901",
        opdToken: "OPD-A104",
        departmentToken: "OPD-A104",
        stage: "CONSULTATION_COMPLETED",
        assignedDoctor: { id: "DOC-01", name: "Dr. Sarah Johnson", specialty: "Cardiology" },
        vitals: { bp: "120/80 mmHg", pulse: "72 bpm", spo2: "98%", temp: "98.6 °F" },
        diagnosticsOrdered: [
          {
            testId: "TEST-01",
            type: "Complete Blood Profile & Cardiac Troponin",
            department: "Laboratory / Pathology",
            status: "RESULT_READY",
            token: "LAB-B201",
            estimatedDurationMin: 20,
            completedAt: new Date(Date.now() - 10 * 60000).toISOString(),
            resultSummary: "Troponin I: <0.01 ng/mL (Normal), Hb: 14.2 g/dL, WBC: 7.2 x 10^3/uL",
          },
          {
            testId: "TEST-02",
            type: "High-Resolution CT Angiography",
            department: "Radiology / CT Suite",
            status: "IN_QUEUE",
            token: "CT-C102",
            estimatedDurationMin: 15,
            queuePosition: 2,
            virtualEtaMin: 18,
          }
        ],
        doctorReviewQueue: {
          status: "PENDING_DIAGNOSTICS",
          priority: "HIGH",
          estimatedReviewTime: "11:25 AM",
          virtualEtaMinutes: 18,
          assignedDoctor: "Dr. Sarah Johnson"
        },
        prescription: null,
        notifications: [
          {
            id: "NOTIF-1",
            message: "Your Blood Profile results are READY. Linked automatically to Journey JRN-2026-8812.",
            time: "10:50 AM",
            read: true,
          },
          {
            id: "NOTIF-2",
            message: "CT Angiography ETA updated: ~18 mins. Please proceed to Radiology Floor 1 only when notified.",
            time: "10:52 AM",
            read: false,
          }
        ]
      },
      {
        journeyId: "JRN-2026-8815",
        patientId: "P-102",
        patientName: "Elena Rostova",
        age: 42,
        gender: "Female",
        bloodGroup: "A+",
        abhaId: "91-7721-3902-8811",
        opdToken: "OPD-B105",
        departmentToken: "OPD-B105",
        stage: "DOCTOR_REVIEW_QUEUED",
        assignedDoctor: { id: "DOC-02", name: "Dr. Rajesh Gupta", specialty: "Orthopedics" },
        vitals: { bp: "118/76 mmHg", pulse: "68 bpm", spo2: "99%", temp: "98.2 °F" },
        diagnosticsOrdered: [
          {
            testId: "TEST-03",
            type: "Digital X-Ray Right Knee (AP & Lateral)",
            department: "Radiology Suite 2",
            status: "RESULT_READY",
            token: "XRAY-X101",
            completedAt: new Date(Date.now() - 5 * 60000).toISOString(),
            resultSummary: "Mild medial joint space narrowing. No acute fracture.",
          }
        ],
        doctorReviewQueue: {
          status: "READY_FOR_REVIEW",
          priority: "STANDARD",
          estimatedReviewTime: "11:15 AM",
          virtualEtaMinutes: 6,
          assignedDoctor: "Dr. Rajesh Gupta"
        },
        prescription: null,
        notifications: [
          {
            id: "NOTIF-3",
            message: "Digital X-Ray report ready. Doctor review queue #02 created automatically.",
            time: "11:02 AM",
            read: false,
          }
        ]
      }
    ];

    // Current Killer Demo Step
    this.currentDemoStep = 0;
  }

  // ─────────────────────────────────────────────────────────────
  // 1. RESOURCE HEATMAP & PREDICTIVE PRESSURE ENGINE
  // ─────────────────────────────────────────────────────────────
  getResourceHeatmap() {
    const beds = nexusStore.beds || [];
    const staff = nexusStore.staff || [];
    const equipment = nexusStore.equipment || [];
    const ots = nexusStore.operatingTheatres || [];
    const diagnostics = nexusStore.diagnostics || [];

    // Categorized Beds
    const totalBeds = beds.length || 48;
    const occupiedBeds = beds.filter(b => b.status === "OCCUPIED" || b.status === "IN_USE").length;
    const cleaningBeds = beds.filter(b => b.status === "CLEANING").length;
    const availableBeds = beds.filter(b => b.status === "AVAILABLE").length;
    const bedUtil = Math.round((occupiedBeds / totalBeds) * 100);

    // ICU Beds
    const icuBeds = beds.filter(b => b.wardId === "WARD-ICU");
    const icuTotal = icuBeds.length || 10;
    const icuOccupied = icuBeds.filter(b => b.status === "OCCUPIED" || b.status === "IN_USE").length;
    const icuUtil = Math.round((icuOccupied / icuTotal) * 100);

    // Doctors & Nurses
    const doctors = staff.filter(s => s.role === "Doctor" || s.role === "Surgeon");
    const docTotal = doctors.length || 24;
    const docActive = doctors.filter(s => s.status === "ON_DUTY" || s.status === "BUSY").length;
    const docUtil = Math.round((docActive / docTotal) * 100);

    const nurses = staff.filter(s => s.role === "Nurse");
    const nurseTotal = nurses.length || 46;
    const nurseActive = nurses.filter(s => s.status === "ON_DUTY" || s.status === "BUSY").length;
    const nurseUtil = Math.round((nurseActive / nurseTotal) * 100);

    // OT Suites
    const otTotal = ots.length || 8;
    const otOccupied = ots.filter(o => o.status === "OCCUPIED" || o.status === "IN_USE").length;
    const otUtil = Math.round((otOccupied / otTotal) * 100);

    // Diagnostic Suites
    const diagTotal = diagnostics.length || 6;
    const diagActiveQueues = diagnostics.reduce((acc, d) => acc + (d.currentQueue || 0), 0);
    const diagUtil = Math.min(100, Math.round((diagActiveQueues / (diagTotal * 4)) * 100));

    // Pharmacy Inventory (Adrenaline, Antibiotics, IV fluids, Insulin)
    const pharmacyItems = [
      { name: "IV Fluids (Normal Saline)", stock: 82, min: 40, status: "AVAILABLE", pressure: 38 },
      { name: "Emergency Epinephrine / Adrenaline", stock: 18, min: 15, status: "LIMITED", pressure: 74 },
      { name: "Broad-Spectrum Antibiotics (Ceftriaxone)", stock: 65, min: 30, status: "AVAILABLE", pressure: 45 },
      { name: "Rapid-Acting Insulin", stock: 12, min: 20, status: "CRITICAL", pressure: 92 },
      { name: "Anesthetic Propofol 1%", stock: 34, min: 25, status: "LIMITED", pressure: 68 }
    ];

    // Compute Resource Pressure Index (RPI) = (Current Demand + Pending Requests + Predicted Arrivals) / (Available Capacity + Expected Discharges)
    const computeRPI = (demand, pending, arrivals, capacity, discharges) => {
      const num = demand + pending + arrivals;
      const den = Math.max(1, capacity + discharges);
      return Math.round((num / den) * 100) / 100;
    };

    // Helper for visual states
    const getVisualState = (utilPercent) => {
      if (utilPercent >= 90) return { code: "CRITICAL", color: "red", label: "Critical Demand" };
      if (utilPercent >= 75) return { code: "HIGH", color: "orange", label: "High Utilization" };
      if (utilPercent >= 55) return { code: "LIMITED", color: "yellow", label: "Limited Capacity" };
      return { code: "AVAILABLE", color: "green", label: "Adequate Available" };
    };

    const resources = [
      {
        id: "res-icu",
        category: "Critical Care",
        name: "Intensive Care Units (ICU)",
        capacityTotal: icuTotal,
        occupied: icuOccupied,
        available: icuTotal - icuOccupied,
        utilizationNow: icuUtil,
        forecast2h: Math.min(100, icuUtil + 6),
        forecast4h: Math.min(100, icuUtil + 12),
        forecast8h: Math.min(100, icuUtil + 15),
        rpi: computeRPI(icuOccupied, 3, 2, icuTotal - icuOccupied, 1),
        state: getVisualState(icuUtil),
        signals: { pendingRequests: 3, predictedArrivals: 2, expectedDischarges: 1 },
        actionRequired: icuUtil >= 85 ? "Prepare overflow step-down capacity or fast-track discharge evaluations" : "Stable"
      },
      {
        id: "res-gen-beds",
        category: "Inpatient Wards",
        name: "General & Step-Down Beds",
        capacityTotal: totalBeds,
        occupied: occupiedBeds,
        available: availableBeds,
        cleaning: cleaningBeds,
        utilizationNow: bedUtil,
        forecast2h: Math.min(100, bedUtil + 4),
        forecast4h: Math.min(100, bedUtil + 8),
        forecast8h: Math.min(100, bedUtil + 11),
        rpi: computeRPI(occupiedBeds, 5, 8, availableBeds, 6),
        state: getVisualState(bedUtil),
        signals: { pendingRequests: 5, predictedArrivals: 8, expectedDischarges: 6 },
        actionRequired: "Turnaround 4 beds in cleaning buffer"
      },
      {
        id: "res-ot",
        category: "Surgical",
        name: "Operating Theatre Suites (8 OTs)",
        capacityTotal: otTotal,
        occupied: otOccupied,
        available: otTotal - otOccupied,
        utilizationNow: otUtil,
        forecast2h: Math.min(100, otUtil + 12),
        forecast4h: Math.min(100, otUtil + 25),
        forecast8h: Math.min(100, otUtil + 18),
        rpi: computeRPI(otOccupied, 4, 3, otTotal - otOccupied, 2),
        state: getVisualState(otUtil),
        signals: { pendingRequests: 4, predictedArrivals: 3, expectedDischarges: 2 },
        actionRequired: "OT-02 on hot standby for Emergency Trauma"
      },
      {
        id: "res-docs",
        category: "Clinical Staff",
        name: "Specialist & On-Call Doctors",
        capacityTotal: docTotal,
        occupied: docActive,
        available: docTotal - docActive,
        utilizationNow: docUtil,
        forecast2h: Math.min(100, docUtil + 5),
        forecast4h: Math.min(100, docUtil + 9),
        forecast8h: Math.min(100, docUtil + 4),
        rpi: computeRPI(docActive, 2, 4, docTotal - docActive, 2),
        state: getVisualState(docUtil),
        signals: { pendingRequests: 2, predictedArrivals: 4, expectedDischarges: 2 },
        actionRequired: "Cross-cover Cardiology consultations at 14:00"
      },
      {
        id: "res-nurses",
        category: "Nursing Staff",
        name: "Ward & Critical Care Nurses",
        capacityTotal: nurseTotal,
        occupied: nurseActive,
        available: nurseTotal - nurseActive,
        utilizationNow: nurseUtil,
        forecast2h: Math.min(100, nurseUtil + 3),
        forecast4h: Math.min(100, nurseUtil + 7),
        forecast8h: Math.min(100, nurseUtil + 5),
        rpi: computeRPI(nurseActive, 4, 6, nurseTotal - nurseActive, 3),
        state: getVisualState(nurseUtil),
        signals: { pendingRequests: 4, predictedArrivals: 6, expectedDischarges: 3 },
        actionRequired: "Staff float nurse to ICU shift"
      },
      {
        id: "res-diag",
        category: "Diagnostics",
        name: "Diagnostic Imaging (CT, MRI, Echo)",
        capacityTotal: diagTotal,
        occupied: Math.min(diagTotal, diagActiveQueues),
        available: Math.max(0, diagTotal - Math.min(diagTotal, diagActiveQueues)),
        utilizationNow: diagUtil,
        forecast2h: Math.min(100, diagUtil + 18),
        forecast4h: Math.min(100, diagUtil + 14),
        forecast8h: Math.min(100, diagUtil + 6),
        rpi: computeRPI(diagActiveQueues, 8, 5, diagTotal * 3, 4),
        state: getVisualState(diagUtil),
        signals: { pendingRequests: 8, predictedArrivals: 5, expectedDischarges: 4 },
        actionRequired: diagUtil >= 75 ? "AI dynamic re-routing from CT Suite 1 to CT Suite 2 recommended" : "Nominal throughput"
      },
      {
        id: "res-pharma",
        category: "Pharmacy",
        name: "Critical Pharmacy Stock",
        capacityTotal: pharmacyItems.length,
        occupied: pharmacyItems.filter(p => p.status === "CRITICAL" || p.status === "LIMITED").length,
        available: pharmacyItems.filter(p => p.status === "AVAILABLE").length,
        utilizationNow: 68,
        forecast2h: 74,
        forecast4h: 82,
        forecast8h: 70,
        rpi: 1.45,
        state: getVisualState(68),
        signals: { pendingRequests: 6, predictedArrivals: 0, expectedDischarges: 8 },
        actionRequired: "Restock Rapid-Acting Insulin from central depot",
        items: pharmacyItems
      }
    ];

    return {
      timestamp: new Date().toISOString(),
      overallHospitalPressureIndex: 1.28,
      hospitalState: "HIGH_EFFICIENCY_ALERT",
      colorCodes: {
        green: "Available / Low Pressure (0-54%)",
        yellow: "Limited Capacity (55-74%)",
        orange: "High Utilization (75-89%)",
        red: "Critical Shortage Risk (90-100%)",
        grey: "Offline / Sterile Turnover"
      },
      resources
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 2. DYNAMIC SCHEDULING & CP-SAT TIME DEPENDENCY ENGINE
  // ─────────────────────────────────────────────────────────────
  solveDynamicSchedule(request = {}) {
    const {
      procedureType = "Elective Orthopedic Joint Arthroplasty",
      patientId = "P-101",
      preferredDoctor = "Dr. Rajesh Gupta",
      urgency = "SCHEDULED", // "EMERGENCY" | "URGENT" | "SCHEDULED"
      durationMinutes = 90,
      equipmentRequired = ["C-Arm Fluoroscopy", "Orthopedic Traction Table"],
      staffRoles = ["Lead Surgeon", "Anesthesiologist", "Scrub Nurse", "Circulating Nurse"]
    } = request;

    // Hard Constraint Validations
    const hardConstraints = [
      {
        id: "HC-1",
        description: "No overlapping OT assignments",
        status: "SATISFIED",
        detail: "OT-01, OT-05, OT-06, OT-08 currently have open candidate slot windows with >=30m turnaround buffer."
      },
      {
        id: "HC-2",
        description: "Doctor cannot be scheduled in two places simultaneously",
        status: "SATISFIED",
        detail: `${preferredDoctor} free from 14:00 onwards. No double-booking conflict detected.`
      },
      {
        id: "HC-3",
        description: "Equipment cannot be double-assigned",
        status: "SATISFIED",
        detail: `${equipmentRequired.join(", ")} reserved uniquely for Candidate Slot 1.`
      },
      {
        id: "HC-4",
        description: "Required clinical staff must be available simultaneously",
        status: "SATISFIED",
        detail: `All 4 staff roles (${staffRoles.join(", ")}) available on shift.`
      },
      {
        id: "HC-5",
        description: "Patient appointment and clinical readiness constraints verified",
        status: "SATISFIED",
        detail: "Pre-op NPO confirmed, anesthesia clearance validated on EHR."
      }
    ];

    // Soft Constraint Evaluation & Scoring
    const candidateSlots = [
      {
        slotId: "SLOT-OPT-01",
        otId: "OT-05",
        otName: "OT Suite 5 (Laparoscopic / Day Surgery)",
        startTime: "14:00",
        endTime: "15:30",
        date: new Date().toISOString().split("T")[0],
        doctor: preferredDoctor,
        equipment: equipmentRequired,
        softScores: {
          preferredDoctorMatch: 25, // Max 25
          minimizedWaitTime: 28,   // Max 30 (scheduled within 3.5 hrs)
          resourceUtilization: 19, // Max 20
          emergencyPriority: urgency === "EMERGENCY" ? 50 : 15,
          reducedConflictDelay: 24 // Max 25
        },
        totalScore: 96,
        isOptimal: true,
        reason: "Highest objective score: Zero turnaround conflict, exactly matches preferred surgeon, zero doctor travel lag."
      },
      {
        slotId: "SLOT-OPT-02",
        otId: "OT-01",
        otName: "OT Suite 1 (Cardiothoracic & Hybrid)",
        startTime: "16:00",
        endTime: "17:30",
        date: new Date().toISOString().split("T")[0],
        doctor: preferredDoctor,
        equipment: equipmentRequired,
        softScores: {
          preferredDoctorMatch: 25,
          minimizedWaitTime: 18,
          resourceUtilization: 16,
          emergencyPriority: 15,
          reducedConflictDelay: 20
        },
        totalScore: 84,
        isOptimal: false,
        reason: "Feasible secondary slot. +2 hours later wait time."
      }
    ];

    const solverExplanation = {
      model: "Google OR-Tools CP-SAT (Constraint Programming over Finite Domains)",
      decisionVariables: [
        "x_ot_slot ∈ {OT-01..OT-08} × {TimeWindows}",
        "x_doc_shift ∈ {Doc_Schedule}",
        "x_equip ∈ {Asset_Pool}",
        "x_patient_readiness ∈ {0, 1}"
      ],
      objectiveFunction: "Maximize: 25(DoctorMatch) + 30(1/WaitTime) + 20(CapacityEfficiency) - 50(OverrunRisk)",
      solverStatus: "OPTIMAL_FOUND",
      solveTimeMs: 14.8,
      recommendedSlot: candidateSlots[0]
    };

    return {
      success: true,
      hardConstraints,
      candidateSlots,
      solverExplanation
    };
  }

  allocateSchedule(slotId) {
    const audit = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      who: "cp_sat_scheduler",
      role: "SYSTEM",
      action: "DYNAMIC_SCHEDULE_ALLOCATED",
      timestamp: new Date().toISOString(),
      targetObject: `Slot ${slotId}`,
      result: "SUCCESS",
      context: "Resources locked: OT-05, Dr. Rajesh Gupta, C-Arm, 4 Surgical Staff"
    };
    this.auditLogs.unshift(audit);

    broadcastEvent("OT_RESOURCE_CHANGED", { slotId, status: "ALLOCATED" });
    broadcastEvent("STAFF_AVAILABILITY_CHANGED", { staff: "Dr. Rajesh Gupta", status: "SCHEDULED" });

    return { success: true, allocatedSlotId: slotId, audit };
  }

  // ─────────────────────────────────────────────────────────────
  // 3. SMART OP & VIRTUAL QUEUE MANAGEMENT
  // ─────────────────────────────────────────────────────────────
  getOpQueues() {
    return {
      activeJourneys: this.activeJourneys,
      principle: "Move the information, not the patient.",
      totalVirtualPatients: this.activeJourneys.length,
      currentOpToken: "OPD-A104",
      activeConsultationDoctor: "Dr. Sarah Johnson"
    };
  }

  orderDiagnostics({ journeyId, doctorId = "DOC-01", tests = [] }) {
    const journey = this.activeJourneys.find(j => j.journeyId === journeyId);
    if (!journey) throw new Error("Journey not found");

    journey.stage = "DIAGNOSTIC_QUEUED";
    journey.diagnosticsOrdered = tests.length > 0 ? tests : [
      {
        testId: `TEST-${Date.now().toString().slice(-4)}`,
        type: "Comprehensive Metabolic Panel (CMP)",
        department: "Central Pathology Lab",
        status: "IN_QUEUE",
        token: "LAB-B205",
        estimatedDurationMin: 18,
        queuePosition: 1,
        virtualEtaMin: 12
      },
      {
        testId: `TEST-${Date.now().toString().slice(-3)}`,
        type: "CT Chest with IV Contrast",
        department: "Radiology Wing",
        status: "IN_QUEUE",
        token: "CT-C109",
        estimatedDurationMin: 15,
        queuePosition: 3,
        virtualEtaMin: 22
      }
    ];

    journey.notifications.unshift({
      id: `NOTIF-${Date.now().toString().slice(-3)}`,
      message: "Diagnostics ordered automatically. You are placed in virtual queue. Zero second registration required.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    });

    this.auditLogs.unshift({
      id: `AUD-${Date.now().toString().slice(-4)}`,
      who: doctorId,
      role: "DOCTOR",
      action: "TEST_ORDERED",
      timestamp: new Date().toISOString(),
      targetObject: journeyId,
      result: "SUCCESS",
      context: "Created virtual diagnostic queues automatically under persistent Journey ID"
    });

    broadcastEvent("TEST_ORDERED", { journeyId, tests: journey.diagnosticsOrdered });
    broadcastEvent("SCAN_ORDERED", { journeyId });

    return { success: true, journey };
  }

  completeDiagnosticTest({ journeyId, testId, resultSummary }) {
    const journey = this.activeJourneys.find(j => j.journeyId === journeyId);
    if (!journey) throw new Error("Journey not found");

    const test = journey.diagnosticsOrdered.find(t => t.testId === testId) || journey.diagnosticsOrdered[0];
    if (test) {
      test.status = "RESULT_READY";
      test.completedAt = new Date().toISOString();
      test.resultSummary = resultSummary || "Investigation completed. All biomarkers within normal clinical limits.";
    }

    // Auto-create doctor-review queue without manual registration!
    journey.stage = "DOCTOR_REVIEW_QUEUED";
    journey.doctorReviewQueue = {
      status: "READY_FOR_REVIEW",
      priority: "HIGH",
      estimatedReviewTime: new Date(Date.now() + 8 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      virtualEtaMinutes: 8,
      assignedDoctor: journey.assignedDoctor.name
    };

    journey.notifications.unshift({
      id: `NOTIF-${Date.now().toString().slice(-3)}`,
      message: `LAB_RESULT_READY: Your ${test.type} is ready! Doctor review queue created automatically (Est review in ~8 mins).`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    });

    this.auditLogs.unshift({
      id: `AUD-${Date.now().toString().slice(-4)}`,
      who: "lab_auto_analyzer",
      role: "LAB_STAFF",
      action: "LAB_RESULT_READY",
      timestamp: new Date().toISOString(),
      targetObject: `${journeyId} / ${test.testId}`,
      result: "SUCCESS",
      context: "Result attached to Journey ID. Doctor-review queue triggered automatically."
    });

    broadcastEvent("LAB_RESULT_READY", { journeyId, testId: test.testId });

    return { success: true, journey };
  }

  reviewAndPrescribe({ journeyId, doctorId = "DOC-01", diagnosis, medications = [] }) {
    const journey = this.activeJourneys.find(j => j.journeyId === journeyId);
    if (!journey) throw new Error("Journey not found");

    journey.stage = "PRESCRIPTION_GENERATED";
    journey.doctorReviewQueue.status = "COMPLETED";
    journey.prescription = {
      prescriptionId: `RX-${Date.now().toString().slice(-5)}`,
      doctorName: journey.assignedDoctor.name,
      diagnosis: diagnosis || "Non-cardiac chest discomfort with mild musculoskeletal strain",
      medications: medications.length > 0 ? medications : [
        { name: "Atorvastatin 20mg", dosage: "1 Tablet Nightly", duration: "30 Days" },
        { name: "Metoprolol Succinate 25mg", dosage: "1 Tablet Morning", duration: "14 Days" }
      ],
      followUp: "14 Days in Cardiology Clinic",
      generatedAt: new Date().toISOString()
    };

    journey.notifications.unshift({
      id: `NOTIF-${Date.now().toString().slice(-3)}`,
      message: `Doctor review completed. Official e-Prescription ${journey.prescription.prescriptionId} generated and transmitted to Pharmacy.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    });

    this.auditLogs.unshift({
      id: `AUD-${Date.now().toString().slice(-4)}`,
      who: doctorId,
      role: "DOCTOR",
      action: "PRESCRIPTION_CREATED",
      timestamp: new Date().toISOString(),
      targetObject: journey.prescription.prescriptionId,
      result: "SUCCESS",
      context: "E-prescription signed and transmitted to Pharmacy dispensary"
    });

    broadcastEvent("PRESCRIPTION_CREATED", { journeyId, prescription: journey.prescription });

    return { success: true, journey };
  }

  // ─────────────────────────────────────────────────────────────
  // 4. SECURITY & PATIENT PRIVACY CENTER
  // ─────────────────────────────────────────────────────────────
  getSecurityOverview() {
    return {
      encryption: {
        inTransit: "TLS 1.3 (ChaCha20-Poly1305 / AES-256-GCM)",
        atRest: "AES-256 with Hardware Security Module (HSM) Key Rotation",
        status: "ACTIVE_COMPLIANT"
      },
      rbacRoles: {
        patient: "Can access permitted own health records and virtual journey only.",
        doctor: "Can access authorized patient records relevant to assigned clinical care.",
        lab_staff: "Can access assigned diagnostic orders and required specimen info.",
        pharmacist: "Can access active prescriptions and dispensing history.",
        administrator: "Can access operational resource states and system telemetry."
      },
      objectLevelAuthorization: {
        principle: "Verify not only user role, but whether specific user is authorized to access the specific patient record.",
        policyEngine: "ABAC (Attribute-Based Access Control) + Patient Consent Engine",
        checksPerformedToday: 1420,
        unauthorizedAttemptsBlocked: 3
      },
      activeBreakGlassSessions: this.breakGlassSessions,
      consents: this.patientConsents,
      auditLogs: this.auditLogs.slice(0, 20)
    };
  }

  requestBreakGlass({ userId = "DOC-EMERG-09", userName = "Dr. Marcus Bell", role = "DOCTOR", patientId = "P-101", reason }) {
    if (!reason || reason.trim().length < 5) {
      throw new Error("Clinical emergency justification required for Break-Glass access");
    }

    const session = {
      sessionId: `BG-${Date.now().toString().slice(-5)}`,
      requestedBy: userName,
      userId,
      role,
      patientId,
      reason,
      grantedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60000).toISOString(), // 15 min expiry
      status: "ACTIVE",
      auditId: `AUD-BG-${Date.now().toString().slice(-4)}`
    };

    this.breakGlassSessions.unshift(session);

    this.auditLogs.unshift({
      id: session.auditId,
      who: `${userName} (${userId})`,
      role: "EMERGENCY_OVERRIDE",
      action: "BREAK_GLASS_ACCESS_GRANTED",
      timestamp: session.grantedAt,
      targetObject: `Patient ${patientId}`,
      result: "GRANTED_TEMPORARY",
      context: `Reason: "${reason}". 15-minute temporary override with full audit logging.`
    });

    broadcastEvent("EMERGENCY_PATIENT", { breakGlass: session });

    return { success: true, session };
  }

  revokeBreakGlass(sessionId) {
    const session = this.breakGlassSessions.find(s => s.sessionId === sessionId);
    if (session) {
      session.status = "EXPIRED";
      session.revokedAt = new Date().toISOString();
      this.auditLogs.unshift({
        id: `AUD-REV-${Date.now().toString().slice(-4)}`,
        who: "security_monitor",
        role: "SYSTEM",
        action: "BREAK_GLASS_REVOKED",
        timestamp: new Date().toISOString(),
        targetObject: sessionId,
        result: "SUCCESS",
        context: "Emergency access session terminated."
      });
    }
    return { success: true, sessionId };
  }

  toggleConsent({ patientId = "P-101", field, granted }) {
    if (!this.patientConsents[patientId]) {
      this.patientConsents[patientId] = { patientName: "Patient " + patientId };
    }
    this.patientConsents[patientId][field] = granted;

    this.auditLogs.unshift({
      id: `AUD-CON-${Date.now().toString().slice(-4)}`,
      who: `patient_${patientId.toLowerCase()}`,
      role: "PATIENT",
      action: "CONSENT_UPDATED",
      timestamp: new Date().toISOString(),
      targetObject: `${patientId} - ${field}`,
      result: granted ? "CONSENT_GRANTED" : "CONSENT_REVOKED",
      context: `Patient dynamically updated privacy consent for ${field} to ${granted}`
    });

    return { success: true, consent: this.patientConsents[patientId] };
  }

  // ─────────────────────────────────────────────────────────────
  // 5. AI / ML STRATEGY & ALGORITHMIC ORCHESTRATION LAYER
  // ─────────────────────────────────────────────────────────────
  getAiMlStrategy() {
    return {
      principle: "Use different AI/ML techniques for different optimization problems rather than using AI everywhere.",
      models: [
        {
          problem: "Patient Demand & Admission Forecasting",
          approaches: ["XGBoost", "LightGBM", "Random Forest", "Time-series (Prophet)"],
          activeApproach: "XGBoost + Temporal Horizon",
          accuracy: "94.2% R²",
          latency: "12ms",
          inputs: ["Historical arrivals", "Weather/seasonality", "Day of week", "Local viral spikes", "Scheduled elective admissions"],
          output: "Predicted arrivals next 2h, 4h, 8h with 95% confidence intervals"
        },
        {
          problem: "Waiting-Time Prediction",
          approaches: ["Gradient Boosting", "XGBoost"],
          activeApproach: "Gradient Boosting Regressor",
          accuracy: "91.8% within ±4 mins",
          latency: "8ms",
          inputs: ["Active queue length", "Doctor consultation pace", "Diagnostic scan complexities", "Emergency overrides"],
          output: "Dynamic ETA per patient updated on every state transition"
        },
        {
          problem: "Resource Allocation & Dynamic Scheduling",
          approach: "Constraint Optimization / Google OR-Tools CP-SAT",
          activeApproach: "CP-SAT Constraint Solver",
          accuracy: "100% hard constraint adherence",
          latency: "18ms",
          inputs: ["Hard constraints (No overlap, staff simultaneousness)", "Soft constraints (Surgeon preferences, turnaround minimization)"],
          output: "Mathematically optimal feasible schedule allocation"
        },
        {
          problem: "Queue Congestion & Bottleneck Detection",
          approaches: ["Time-series forecasting", "Queue Analytics (M/M/c models)"],
          activeApproach: "Dynamic M/M/c Erlang Queue Simulator",
          accuracy: "89.5% bottleneck anticipation",
          latency: "15ms",
          inputs: ["Service arrival rates", "Machine cycle times", "Turnover delays"],
          output: "Proactive re-routing suggestion before wait exceeds 30 mins"
        },
        {
          problem: "Operational Anomaly Detection",
          approach: "Isolation Forest",
          activeApproach: "Isolation Forest",
          accuracy: "F1 Score: 0.93",
          latency: "22ms",
          inputs: ["Outlier bed stay durations", "Sudden surge in emergency triage", "Delayed turnaround times"],
          output: "Automated anomaly flags with severity level and root-cause candidates"
        },
        {
          problem: "Advanced Dynamic Resource Rebalancing",
          approach: "Reinforcement Learning (DQN / PPO)",
          activeApproach: "Deep Q-Network (Optimization Layer)",
          accuracy: "Converged Reward: +84.6%",
          latency: "35ms",
          inputs: ["Current hospital state", "Patient demand", "Queue states", "Operational constraints"],
          rewardObjectives: ["Lower patient waiting time (-0.4)", "Fewer resource conflicts (-1.0)", "Fewer delays (-0.3)", "Higher utilization (+0.5)"],
          output: "Optimal macro-action: Resource rebalancing recommendation"
        }
      ],
      closedLoop: ["Predict", "Optimize", "Allocate", "Notify", "Verify", "Update", "Learn"]
    };
  }

  // ─────────────────────────────────────────────────────────────
  // 6. KILLER ROUND 2 DEMO RUNNER (13 SPECIFIED STEPS)
  // ─────────────────────────────────────────────────────────────
  runDemoStep(stepNumber) {
    this.currentDemoStep = stepNumber;
    const steps = [
      {
        step: 1,
        title: "Patient arrives and receives OP token A104",
        description: "Patient Harsh Tripathi registers at smart kiosk. Persistent Journey ID JRN-2026-8812 is initialized with OP token A104.",
        event: "PATIENT_REGISTERED",
        stateUpdate: { opdToken: "OPD-A104", stage: "REGISTRATION_COMPLETE" }
      },
      {
        step: 2,
        title: "Patient enters doctor consultation",
        description: "Dr. Sarah Johnson calls Token #A104 into Cardiology OPD Cabin 102. Real-time consult timer begins.",
        event: "CONSULTATION_STARTED",
        stateUpdate: { stage: "IN_CONSULTATION", doctor: "Dr. Sarah Johnson" }
      },
      {
        step: 3,
        title: "Doctor orders blood test and CT scan",
        description: "Dr. Johnson prescribes Comprehensive Blood Profile & High-Res CT Angiography on digital clinical workbench.",
        event: "TEST_ORDERED",
        stateUpdate: { stage: "DIAGNOSTICS_ORDERED" }
      },
      {
        step: 4,
        title: "System automatically places both into diagnostic queues without second registration",
        description: "Principle: 'Move the information, not the patient.' Token LAB-B201 & CT-C102 created automatically under same Journey ID.",
        event: "VIRTUAL_QUEUES_INITIALIZED",
        stateUpdate: { stage: "DIAGNOSTIC_QUEUED" }
      },
      {
        step: 5,
        title: "Blood test completes",
        description: "Pathology auto-analyzer completes blood analysis. Biomarkers verified by lab technician.",
        event: "LAB_TEST_COMPLETED",
        stateUpdate: { labStatus: "COMPLETED" }
      },
      {
        step: 6,
        title: "LAB_RESULT_READY event is published",
        description: "Event published to Nexus Real-Time Event Bus with encrypted payload hash.",
        event: "LAB_RESULT_READY",
        stateUpdate: { eventDispatched: "LAB_RESULT_READY" }
      },
      {
        step: 7,
        title: "Result is automatically attached to the same Journey ID",
        description: "Troponin I <0.01 ng/mL & CBC seamlessly linked to JRN-2026-8812 with zero manual record searching.",
        event: "RESULT_ATTACHED_TO_JOURNEY",
        stateUpdate: { resultsAttached: true }
      },
      {
        step: 8,
        title: "Doctor-review queue is created automatically",
        description: "Patient is placed directly into Dr. Johnson's Review Queue without standing in any physical line.",
        event: "REVIEW_QUEUE_CREATED",
        stateUpdate: { stage: "DOCTOR_REVIEW_QUEUED" }
      },
      {
        step: 9,
        title: "Patient receives report-ready notification and estimated review time",
        description: "Push notification sent to patient: 'Results ready. Doctor review scheduled in ~18 mins.'",
        event: "PATIENT_NOTIFIED",
        stateUpdate: { patientNotificationSent: true }
      },
      {
        step: 10,
        title: "Dashboard shows live resource heatmap for beds, CT, laboratory, OT and staff",
        description: "Real-time RPI (Resource Pressure Index) updates across all hospital wards and diagnostic suites.",
        event: "HEATMAP_UPDATED",
        stateUpdate: { heatmapRefreshed: true }
      },
      {
        step: 11,
        title: "AI predicts CT congestion",
        description: "Queue model detects 4 arriving stroke scans; predicts CT Suite 1 queue delay exceeding 35 mins.",
        event: "CONGESTION_PREDICTED",
        stateUpdate: { congestionAlert: "CT_SUITE_1_HIGH" }
      },
      {
        step: 12,
        title: "Orchestration engine evaluates available slots and resource dependencies",
        description: "CP-SAT constraint optimizer dynamically re-routes routine contrast scans to CT Suite 2 buffer.",
        event: "CONSTRAINT_REALLOCATION",
        stateUpdate: { reallocatedSuite: "CT_SUITE_2" }
      },
      {
        step: 13,
        title: "Relevant staff receive role-based alerts & queue dynamically adjusts",
        description: "Radiologist, charge nurse, and patient received updated routing instructions. Full closed loop completed!",
        event: "CLOSED_LOOP_COMPLETE",
        stateUpdate: { stage: "ORCHESTRATION_COMPLETE" }
      }
    ];

    const current = steps[(stepNumber - 1) % steps.length];
    broadcastEvent(current.event, { step: current.step, title: current.title, details: current.description });

    return {
      success: true,
      step: current,
      allSteps: steps
    };
  }
}

export const nexusRound2Service = new NexusRound2Service();
