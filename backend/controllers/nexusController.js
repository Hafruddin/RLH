// backend/controllers/nexusController.js
import { nexusStore } from "../services/nexusStore.js";
import { registerClient, broadcastEvent } from "../services/eventHub.js";

/**
 * 1. Real-time Server-Sent Events (SSE) Stream
 */
export const streamEvents = (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "Access-Control-Allow-Origin": "*"
  });

  res.write("event: connected\ndata: " + JSON.stringify({ status: "connected", timestamp: new Date().toISOString() }) + "\n\n");
  registerClient(res);

  const heartbeat = setInterval(() => {
    try {
      res.write(": heartbeat\n\n");
    } catch (e) {
      clearInterval(heartbeat);
    }
  }, 20000);

  req.on("close", () => {
    clearInterval(heartbeat);
  });
};

/**
 * 2. Hospital Command Center Overview KPIs
 */
export const getDashboardOverview = (req, res) => {
  try {
    const totalBeds = nexusStore.beds.length;
    const occupiedBeds = nexusStore.beds.filter(b => b.status === "OCCUPIED").length;
    const availableBeds = nexusStore.beds.filter(b => b.status === "AVAILABLE").length;
    const icuTotal = nexusStore.beds.filter(b => b.wardId === "WARD-ICU").length;
    const icuOccupied = nexusStore.beds.filter(b => b.wardId === "WARD-ICU" && b.status === "OCCUPIED").length;

    const totalStaff = nexusStore.staff.length;
    const onDutyStaff = nexusStore.staff.filter(s => s.status === "ON_DUTY").length;
    const doctorsOnDuty = nexusStore.staff.filter(s => s.role === "Doctor" || s.role === "Surgeon").length;
    const nursesOnDuty = nexusStore.staff.filter(s => s.role === "Nurse").length;

    const totalOTs = nexusStore.operatingTheatres.length;
    const availableOTs = nexusStore.operatingTheatres.filter(o => o.status === "AVAILABLE").length;

    let diagnosticBottlenecks = 0;
    nexusStore.diagnostics.forEach(d => {
      if (d.currentQueue > 5 || d.avgWaitMinutes > 25) diagnosticBottlenecks++;
    });

    const activeEmergencies = nexusStore.emergencies.filter(e => e.status === "ACTIVE");

    res.json({
      success: true,
      kpis: {
        totalBeds,
        occupiedBeds,
        availableBeds,
        bedOccupancyRate: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
        icuTotal,
        icuOccupied,
        icuAvailable: icuTotal - icuOccupied,
        icuOccupancyRate: icuTotal > 0 ? Math.round((icuOccupied / icuTotal) * 100) : 0,
        totalStaff,
        onDutyStaff,
        doctorsOnDuty,
        nursesOnDuty,
        totalOTs,
        availableOTs,
        otUtilizationRate: totalOTs > 0 ? Math.round(((totalOTs - availableOTs) / totalOTs) * 100) : 0,
        activeEmergenciesCount: activeEmergencies.length,
        diagnosticBottlenecks,
        avgResponseTimeSeconds: 42
      },
      activeEmergencies,
      recentAlerts: nexusStore.alerts.slice(0, 8),
      wards: nexusStore.wards
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 3. Bed Management
 */
export const getBeds = (req, res) => {
  try {
    const { wardId, status, bedType } = req.query;
    let list = [...nexusStore.beds];
    if (wardId) list = list.filter(b => b.wardId === wardId);
    if (status) list = list.filter(b => b.status === status);
    if (bedType) list = list.filter(b => b.bedType === bedType);
    res.json({ success: true, count: list.length, beds: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBedStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status, patientId } = req.body;
    const bed = nexusStore.beds.find(b => b.bedId === id);
    if (!bed) return res.status(404).json({ success: false, message: "Bed not found" });

    if (status) bed.status = status;
    if (patientId !== undefined) bed.patientId = patientId;
    bed.lastUpdated = new Date().toISOString();

    broadcastEvent("bedUpdated", bed);
    res.json({ success: true, bed });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 4. Staff Management
 */
export const getStaff = (req, res) => {
  try {
    const { role, department, status } = req.query;
    let list = [...nexusStore.staff];
    if (role) list = list.filter(s => s.role.toLowerCase() === role.toLowerCase());
    if (department) list = list.filter(s => s.department.toLowerCase() === department.toLowerCase());
    if (status) list = list.filter(s => s.status.toLowerCase() === status.toLowerCase());
    res.json({ success: true, count: list.length, staff: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStaffStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status, workloadScore, currentWard } = req.body;
    const staff = nexusStore.staff.find(s => s.staffId === id);
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

    if (status) staff.status = status;
    if (workloadScore !== undefined) {
      staff.workloadScore = workloadScore;
      staff.workload = workloadScore > 75 ? "CRITICAL" : workloadScore > 50 ? "HIGH" : workloadScore > 25 ? "MEDIUM" : "LOW";
    }
    if (currentWard) staff.currentWard = currentWard;

    broadcastEvent("staffUpdated", staff);
    res.json({ success: true, staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 5. Equipment Tracking
 */
export const getEquipment = (req, res) => {
  try {
    const { type, status } = req.query;
    let list = [...nexusStore.equipment];
    if (type) list = list.filter(e => e.type.toLowerCase() === type.toLowerCase());
    if (status) list = list.filter(e => e.status.toLowerCase() === status.toLowerCase());
    res.json({ success: true, count: list.length, equipment: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateEquipmentLocation = (req, res) => {
  try {
    const { id } = req.params;
    const { currentLocation, status, assignedPatient } = req.body;
    const eq = nexusStore.equipment.find(e => e.equipmentId === id);
    if (!eq) return res.status(404).json({ success: false, message: "Equipment not found" });

    if (currentLocation) eq.currentLocation = currentLocation;
    if (status) eq.status = status;
    if (assignedPatient !== undefined) eq.assignedPatient = assignedPatient;
    eq.lastPing = new Date().toISOString();

    broadcastEvent("equipmentMoved", eq);
    res.json({ success: true, equipment: eq });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 6. Operating Theatres (OT)
 */
export const getOperatingTheatres = (req, res) => {
  try {
    res.json({ success: true, count: nexusStore.operatingTheatres.length, operatingTheatres: nexusStore.operatingTheatres });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const scheduleOT = (req, res) => {
  try {
    const { otId, surgeryType, patientId, patientName, surgeonName, scheduledTime, durationMinutes, priority } = req.body;
    const ot = nexusStore.operatingTheatres.find(o => o.otId === otId);
    if (!ot) return res.status(404).json({ success: false, message: "Operating Theatre not found" });

    const procedure = {
      surgeryType: surgeryType || "Emergency Laparotomy",
      patientId: patientId || `P-${Date.now().toString().slice(-4)}`,
      patientName: patientName || "Emergency Trauma Patient",
      surgeonName: surgeonName || "Dr. Rajesh Gupta",
      scheduledTime: scheduledTime || new Date(Date.now() + 15 * 60000).toISOString(),
      durationMinutes: durationMinutes || 90,
      priority: priority || "EMERGENCY"
    };

    ot.upcomingSchedule.unshift(procedure);
    if (priority === "EMERGENCY" && ot.status === "AVAILABLE") {
      ot.status = "OCCUPIED";
      ot.currentProcedure = procedure;
    }

    broadcastEvent("otUpdated", ot);
    res.json({ success: true, operatingTheatre: ot, procedure });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 7. Diagnostics Suites & Dynamic Queue Re-routing
 */
export const getDiagnosticResources = (req, res) => {
  try {
    res.json({ success: true, count: nexusStore.diagnostics.length, diagnostics: nexusStore.diagnostics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rerouteDiagnostics = (req, res) => {
  try {
    const { fromResourceId = "DIAG-XR-01", toResourceId = "DIAG-XR-02", patientCount = 4 } = req.body;
    const fromRes = nexusStore.diagnostics.find(d => d.resourceId === fromResourceId);
    const toRes = nexusStore.diagnostics.find(d => d.resourceId === toResourceId);

    if (!fromRes || !toRes) {
      return res.status(404).json({ success: false, message: "Diagnostic suite not found" });
    }

    const shiftCount = Math.min(patientCount, fromRes.currentQueue);
    fromRes.currentQueue = Math.max(0, fromRes.currentQueue - shiftCount);
    fromRes.avgWaitMinutes = Math.max(5, Math.round(fromRes.currentQueue * 4.5));
    fromRes.bottleneckScore = Math.max(10, Math.round(fromRes.currentQueue * 10));

    toRes.currentQueue += shiftCount;
    toRes.avgWaitMinutes = Math.round(toRes.currentQueue * 4.5);
    toRes.bottleneckScore = Math.min(100, Math.round(toRes.currentQueue * 10));

    const alert = {
      alertId: `ALT-${Date.now().toString().slice(-6)}`,
      type: "BOTTLENECK",
      severity: "MEDIUM",
      recipientRole: "OPERATIONS",
      message: `⚖️ LOAD-BALANCED: Autonomous re-routing moved ${shiftCount} patients from ${fromRes.name} to ${toRes.name}. Wait time reduced to ${fromRes.avgWaitMinutes} min.`,
      status: "UNREAD",
      createdAt: new Date().toISOString()
    };
    nexusStore.alerts.unshift(alert);

    broadcastEvent("diagnosticBalanced", { from: fromRes, to: toRes, shifted: shiftCount });

    res.json({
      success: true,
      message: `Successfully shifted ${shiftCount} patients from ${fromRes.name} to ${toRes.name}`,
      source: fromRes,
      destination: toRes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 8. Emergency Orchestration (P-104 Demo Flow)
 */
export const triggerEmergency = (req, res) => {
  try {
    const {
      patientId = "P-104",
      patientName = "Emergency Patient P-104",
      vitals = { heartRate: 142, spO2: 82, bp: "85/55", temperature: 99.2, respiratoryRate: 28 },
      specialtyRequired = "Cardiologist",
      customAcuity = "CRITICAL"
    } = req.body;

    const startTime = Date.now();
    const severity = customAcuity || (vitals.spO2 < 85 ? "CRITICAL" : "HIGH");

    // 1. Bed: Find ICU-05 or best available ICU bed
    let bed = nexusStore.beds.find(b => b.bedId === "ICU-05" && b.status === "AVAILABLE");
    if (!bed) bed = nexusStore.beds.find(b => b.bedType === "ICU" && b.status === "AVAILABLE");
    if (!bed) bed = nexusStore.beds.find(b => b.status === "AVAILABLE");

    if (bed) {
      bed.status = "OCCUPIED";
      bed.patientId = patientId;
      bed.lastUpdated = new Date().toISOString();
    }

    // 2. Doctor: Find Dr. Sarah Johnson (DOC-01) or Cardiologist
    let doctor = nexusStore.staff.find(s => s.staffId === "DOC-01");
    if (!doctor) doctor = nexusStore.staff.find(s => s.role === "Doctor" && s.emergencyEligible);
    if (doctor) {
      doctor.workloadScore = Math.min(100, doctor.workloadScore + 20);
      doctor.workload = doctor.workloadScore > 75 ? "CRITICAL" : "HIGH";
    }

    // 3. Nurse: Nurse Sarah Jenkins (N-07)
    let nurse = nexusStore.staff.find(s => s.staffId === "N-07");
    if (!nurse) nurse = nexusStore.staff.find(s => s.role === "Nurse");
    if (nurse) {
      nurse.workloadScore = Math.min(100, nurse.workloadScore + 15);
    }

    // 4. Equipment: Ventilator V-04 & ECG-02
    let vent = nexusStore.equipment.find(e => e.equipmentId === "V-04");
    if (vent) {
      vent.status = "IN_USE";
      vent.assignedPatient = patientId;
    }
    let ecg = nexusStore.equipment.find(e => e.equipmentId === "ECG-02");
    if (ecg) {
      ecg.status = "IN_USE";
      ecg.assignedPatient = patientId;
    }

    // Update RTLS locations
    const rtlsPatient = nexusStore.rtlsLocations.find(r => r.resourceId === "P-104");
    if (rtlsPatient) {
      rtlsPatient.floor = 2;
      rtlsPatient.zone = "ICU Pod 3 (Bed ICU-05)";
      rtlsPatient.x = 70;
      rtlsPatient.y = 40;
    }
    const rtlsDoc = nexusStore.rtlsLocations.find(r => r.resourceId === "DOC-01");
    if (rtlsDoc) {
      rtlsDoc.floor = 2;
      rtlsDoc.zone = "En route to ICU-05";
      rtlsDoc.x = 65;
      rtlsDoc.y = 42;
    }

    const responseTimeSec = 42;
    const compositeScore = 94;
    const reasons = [
      `ICU Bed (${bed?.bedId || "ICU-05"}): Verified available with negative-pressure isolation & full telemetry (Score: 98/100)`,
      `Cardiologist (${doctor?.name || "Dr. Sarah"}): Exact ACLS specialty match, on-site, lowest critical workload index (Score: 96/100)`,
      `Critical Care Nurse (${nurse?.name || "Nurse N-07"}): Senior ICU certification, current shift active, immediate proximity (Score: 92/100)`,
      `Life Support (${vent?.equipmentId || "V-04"} & ${ecg?.equipmentId || "ECG-02"}): Calibration verified 100%, pre-positioned on Floor 2 (Score: 95/100)`
    ];

    const emergency = {
      emergencyId: `EMG-${Date.now().toString().slice(-6)}`,
      patientId,
      patientName,
      severity,
      vitals,
      requiredResources: ["ICU Bed", "Cardiologist", "Nurse", "Ventilator", "ECG"],
      status: "ACTIVE",
      assignedResources: {
        bedId: bed?.bedId || "ICU-05",
        doctorId: doctor?.staffId || "DOC-01",
        doctorName: doctor?.name || "Dr. Sarah Johnson",
        nurseId: nurse?.staffId || "N-07",
        nurseName: nurse?.name || "Nurse Sarah Jenkins (N-07)",
        equipmentIds: [vent?.equipmentId || "V-04", ecg?.equipmentId || "ECG-02"]
      },
      escalationLevel: 2,
      responseTime: responseTimeSec,
      createdAt: new Date().toISOString(),
      auditTrail: [
        { timestamp: new Date(Date.now() - 40000).toISOString(), action: "Triage Alert Received", details: `Patient ${patientId} registered with SpO2: ${vitals.spO2}%, HR: ${vitals.heartRate} bpm.`, actor: "Emergency Triage" },
        { timestamp: new Date(Date.now() - 35000).toISOString(), action: "Severity Classified", details: `Acuity evaluated as ${severity} - Immediate Code Red protocol initiated.`, actor: "Nexus AI Engine" },
        { timestamp: new Date(Date.now() - 25000).toISOString(), action: "Resource Candidate Search", details: "Scanned 48 hospital beds, 90 on-duty staff, and 20 life-support devices.", actor: "Nexus Orchestrator" },
        { timestamp: new Date(Date.now() - 10000).toISOString(), action: "Multi-Criteria Allocation", details: `Bed ${bed?.bedId} & Dr. ${doctor?.name} allocated. Score: ${compositeScore}/100.`, actor: "Orchestration Engine" },
        { timestamp: new Date().toISOString(), action: "Mobilization Dispatched", details: `Mobile push alert dispatched to ${doctor?.name} and ${nurse?.name}. Response timer: ${responseTimeSec}s.`, actor: "Dispatch Subsystem" }
      ]
    };

    nexusStore.emergencies.unshift(emergency);

    const alert = {
      alertId: `ALT-${Date.now().toString().slice(-6)}`,
      type: "EMERGENCY",
      severity: "CRITICAL",
      recipientRole: "ALL",
      message: `🚨 CODE RED: Critical Patient ${patientId} allocated to Bed ${bed?.bedId || "ICU-05"} under Dr. ${doctor?.name}. Mobilization verified (${responseTimeSec}s).`,
      status: "UNREAD",
      createdAt: new Date().toISOString()
    };
    nexusStore.alerts.unshift(alert);

    broadcastEvent("emergencyCreated", { emergency, bed, doctor, nurse, score: compositeScore });

    res.json({
      success: true,
      emergencyId: emergency.emergencyId,
      patientId,
      severity,
      allocation: {
        bed: bed?.bedId || "ICU-05",
        doctor: doctor?.name || "Dr. Sarah Johnson",
        nurse: nurse?.name || "Nurse Sarah Jenkins (N-07)",
        equipment: [vent?.equipmentId || "V-04", ecg?.equipmentId || "ECG-02"],
        score: compositeScore,
        reasons,
        responseTime: responseTimeSec
      },
      auditTrail: emergency.auditTrail
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 9. Re-Optimization & Conflict Simulation (ICU-05 Down -> Auto-Reallocate)
 */
export const triggerReallocation = (req, res) => {
  try {
    const {
      compromisedBedId = "ICU-05",
      reason = "Emergency electrical/telemetry sensor malfunction detected on Bed ICU-05."
    } = req.body;

    // 1. Mark ICU-05 as MAINTENANCE
    const oldBed = nexusStore.beds.find(b => b.bedId === compromisedBedId);
    if (oldBed) {
      oldBed.status = "MAINTENANCE";
      oldBed.patientId = null;
      oldBed.lastUpdated = new Date().toISOString();
    }

    // 2. Select next best available ICU bed (e.g. ICU-08)
    let altBed = nexusStore.beds.find(b => b.bedType === "ICU" && b.status === "AVAILABLE" && b.bedId !== compromisedBedId);
    if (!altBed) altBed = nexusStore.beds.find(b => b.status === "AVAILABLE");

    if (altBed) {
      altBed.status = "OCCUPIED";
      altBed.patientId = "P-104";
      altBed.lastUpdated = new Date().toISOString();
    }

    // Update active emergency record
    const emg = nexusStore.emergencies[0];
    if (emg) {
      emg.assignedResources.bedId = altBed?.bedId || "ICU-08";
      emg.auditTrail.push({
        timestamp: new Date().toISOString(),
        action: "Resource Conflict Detected & Reallocated",
        details: `Bed ${compromisedBedId} reported down. Autonomous Re-optimizer shifted patient to ${altBed?.bedId} (Score: 92/100).`,
        actor: "Nexus Autonomous Re-Optimizer"
      });
    }

    // Update RTLS Bed
    const rtlsBed = nexusStore.rtlsLocations.find(r => r.resourceId === "ICU-05");
    if (rtlsBed) rtlsBed.status = "MAINTENANCE";
    const rtlsAltBed = nexusStore.rtlsLocations.find(r => r.resourceId === altBed?.bedId);
    if (rtlsAltBed) rtlsAltBed.status = "OCCUPIED";

    const reallocAlert = {
      alertId: `ALT-${Date.now().toString().slice(-6)}`,
      type: "REALLOCATION",
      severity: "HIGH",
      recipientRole: "ALL",
      message: `🔄 RE-OPTIMIZATION TRIGGERED: Patient P-104 automatically transferred from ${compromisedBedId} -> ${altBed?.bedId}. Clinical team alerted.`,
      status: "UNREAD",
      createdAt: new Date().toISOString()
    };
    nexusStore.alerts.unshift(reallocAlert);

    broadcastEvent("resourceReallocated", {
      compromisedBedId,
      newBedId: altBed?.bedId || "ICU-08",
      patientId: "P-104",
      score: 92,
      reasons: [
        `Conflict auto-resolved: Bed ${compromisedBedId} telemetry failure.`,
        `Alternative Bed ${altBed?.bedId || "ICU-08"} verified immediate availability and ICU isolation standard.`,
        `Zero human dispatch latency (reallocated within 1.2 seconds).`
      ]
    });

    res.json({
      success: true,
      patientId: "P-104",
      conflict: {
        failedResource: compromisedBedId,
        reason
      },
      reallocatedTo: {
        bedId: altBed?.bedId || "ICU-08",
        location: altBed?.location || "Floor 2, ICU Pod 4",
        score: 92,
        reasons: [
          `Telemetry failure on ${compromisedBedId} bypassed`,
          `High-acuity bed ${altBed?.bedId || "ICU-08"} allocated without clinical disruption`,
          `Ventilator V-04 connection transferred`
        ]
      },
      status: "REALLOCATION_COMPLETE",
      auditTrail: emg ? emg.auditTrail : []
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 10. Multi-Horizon Forecasting
 */
export const getForecasts = (req, res) => {
  res.json({ success: true, forecasts: nexusStore.forecasts });
};

export const generateForecasts = (req, res) => {
  try {
    const hour = new Date().getHours();
    const multiplier = (hour >= 9 && hour <= 21) ? 1.35 : 0.85;

    const baseEr = 24;
    nexusStore.forecasts = [
      { department: "Emergency", timeWindow: "Current", currentLoad: baseEr, predictedLoad: baseEr, confidence: 96, riskLevel: "MEDIUM", recommendedActions: ["Maintain 3 ER triage bays open", "Keep fast-track ECG available"] },
      { department: "Emergency", timeWindow: "1 Hour", currentLoad: baseEr, predictedLoad: Math.round(baseEr * 1.25 * multiplier), confidence: 93, riskLevel: "HIGH", recommendedActions: ["Pre-alert on-call emergency physician", "Stage 2 transport stretchers at triage"] },
      { department: "Emergency", timeWindow: "2 Hours", currentLoad: baseEr, predictedLoad: Math.round(baseEr * 1.58 * multiplier), confidence: 89, riskLevel: "CRITICAL", recommendedActions: ["Activate overflow protocol", "Redirect non-urgent OPD cases to Clinic B", "Deploy 2 nurses from General Ward"] },
      { department: "Emergency", timeWindow: "4 Hours", currentLoad: baseEr, predictedLoad: Math.round(baseEr * 2.12 * multiplier), confidence: 84, riskLevel: "CRITICAL", recommendedActions: ["Enact surge staffing plan", "Expedite bed turnaround in General Ward A", "Coordinate standby ventilators with ICU"] },
      { department: "ICU", timeWindow: "Current", currentLoad: 8, predictedLoad: 8, confidence: 95, riskLevel: "HIGH", recommendedActions: ["ICU occupancy at 80%+ capacity. Screen potential step-down transfers."] },
      { department: "ICU", timeWindow: "2 Hours", currentLoad: 8, predictedLoad: 10, confidence: 91, riskLevel: "CRITICAL", recommendedActions: ["Projected 100% ICU capacity. Expedite step-down transfer for P-ICU-02 to Surgical Recovery.", "Reserve ICU-05 for emergent cardiac admission."] },
      { department: "Diagnostics", timeWindow: "Current", currentLoad: 17, predictedLoad: 17, confidence: 94, riskLevel: "MEDIUM", recommendedActions: ["Route outpatient X-rays to Suite 2 to reduce Suite 1 queue."] },
      { department: "Diagnostics", timeWindow: "2 Hours", currentLoad: 17, predictedLoad: 27, confidence: 88, riskLevel: "HIGH", recommendedActions: ["Activate secondary CT scanner technician", "Prioritize emergency ultrasound"] }
    ];

    broadcastEvent("forecastGenerated", nexusStore.forecasts);
    res.json({ success: true, forecasts: nexusStore.forecasts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 11. What-If Simulation Studio
 */
export const runSimulation = (req, res) => {
  try {
    const {
      demandDeltaPercent = 20,
      icuBedDelta = -2,
      nurseDelta = -3,
      diagnosticDeltaPercent = 30
    } = req.body;

    const currentAvgWait = 18;
    const currentIcuUtil = 80;
    const currentStaffLoad = 65;
    const currentDiagWait = 24;

    const simAvgWait = Math.round(currentAvgWait * (1 + Number(demandDeltaPercent) / 100) * (1 + Math.abs(Number(nurseDelta)) * 0.08));
    const simIcuUtil = Math.min(100, Math.round(currentIcuUtil + Math.abs(Number(icuBedDelta)) * 7 + (Number(demandDeltaPercent) * 0.25)));
    const simStaffLoad = Math.min(100, Math.round(currentStaffLoad + (Math.abs(Number(nurseDelta)) * 6) + (Number(demandDeltaPercent) * 0.3)));
    const simDiagWait = Math.round(currentDiagWait * (1 + Number(diagnosticDeltaPercent) / 100));

    const bottlenecks = [];
    if (simIcuUtil >= 95) bottlenecks.push("ICU Bed Depletion (<1 bed buffer remaining)");
    if (simStaffLoad >= 85) bottlenecks.push("Critical Nursing Staff Deficit in Emergency & ICU");
    if (simDiagWait > 35) bottlenecks.push("X-Ray Suite 1 Severe Queue Congestion");

    const recommendations = [
      `Mobilize ${Math.abs(Number(nurseDelta)) + 2} on-call nurses from float pool to Emergency Triage`,
      "Open 4 surge beds in Surgical Recovery Ward as temporary ICU step-down overflow",
      "Activate Fast-Track Protocol in X-Ray Suite 2 to absorb 40% of standard radiology volume",
      "Defer elective minor day-surgery admissions by 3 hours to preserve monitoring equipment"
    ];

    res.json({
      success: true,
      scenario: { demandDeltaPercent, icuBedDelta, nurseDelta, diagnosticDeltaPercent },
      baseline: {
        avgWaitMinutes: currentAvgWait,
        icuOccupancyPercent: currentIcuUtil,
        staffWorkloadPercent: currentStaffLoad,
        diagnosticWaitMinutes: currentDiagWait,
        bottlenecksDetected: 1
      },
      simulated: {
        avgWaitMinutes: simAvgWait,
        icuOccupancyPercent: simIcuUtil,
        staffWorkloadPercent: simStaffLoad,
        diagnosticWaitMinutes: simDiagWait,
        bottlenecksDetected: bottlenecks.length,
        bottleneckList: bottlenecks
      },
      orchestratorRecommendations: recommendations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetSimulationDemo = (req, res) => {
  try {
    nexusStore.resetToDefaults();
    broadcastEvent("systemReset", { timestamp: new Date().toISOString() });
    res.json({ success: true, message: "System state successfully reset to initial demo configuration." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 12. Alerts
 */
export const getAlerts = (req, res) => {
  res.json({ success: true, alerts: nexusStore.alerts });
};

export const acknowledgeAlert = (req, res) => {
  try {
    const { id } = req.params;
    const alert = nexusStore.alerts.find(a => a.alertId === id);
    if (alert) {
      alert.status = "ACKNOWLEDGED";
    }
    res.json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 13. RTLS Locations
 */
export const getRtlsLocations = (req, res) => {
  res.json({ success: true, locations: nexusStore.rtlsLocations });
};

export const updateRtlsLocation = (req, res) => {
  try {
    const { resourceId } = req.params;
    const { x, y, floor, zone } = req.body;
    let loc = nexusStore.rtlsLocations.find(r => r.resourceId === resourceId);
    if (!loc) {
      loc = { resourceId, x, y, floor, zone };
      nexusStore.rtlsLocations.push(loc);
    } else {
      if (x !== undefined) loc.x = x;
      if (y !== undefined) loc.y = y;
      if (floor !== undefined) loc.floor = floor;
      if (zone !== undefined) loc.zone = zone;
    }
    broadcastEvent("rtlsMoved", loc);
    res.json({ success: true, location: loc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * 14. FHIR R4 Integration
 */
export const getFhirPatientResource = (req, res) => {
  const { id } = req.params;
  const fhir = {
    resourceType: "Patient",
    id: id || "P-104",
    meta: {
      versionId: "1",
      lastUpdated: new Date().toISOString(),
      profile: ["http://hl7.org/fhir/StructureDefinition/Patient"],
      adapter: "MediCare Nexus FHIR Integration Adapter (HL7 FHIR R4)"
    },
    identifier: [
      { use: "official", system: "urn:oid:medicare-nexus:patient-mrn", value: id || "P-104" }
    ],
    active: true,
    name: [{ use: "official", text: id === "P-104" ? "Emergency Patient P-104" : `Patient ${id}`, family: "P-104", given: ["Emergency"] }],
    telecom: [{ system: "phone", value: "+91 9800000000", use: "mobile" }],
    gender: "male",
    extension: [
      { url: "http://hl7.org/fhir/StructureDefinition/patient-bloodGroup", valueString: "O+" },
      { url: "http://hl7.org/fhir/StructureDefinition/patient-acuity", valueCode: "CRITICAL" },
      { url: "http://hl7.org/fhir/StructureDefinition/patient-currentWard", valueString: "WARD-ICU" },
      { url: "http://hl7.org/fhir/StructureDefinition/patient-currentBed", valueString: "ICU-05" }
    ]
  };
  res.json(fhir);
};

export const getFhirEncounterResource = (req, res) => {
  const { id } = req.params;
  const fhir = {
    resourceType: "Encounter",
    id: `ENC-${id || "P-104"}`,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/Encounter"],
      adapter: "MediCare Nexus FHIR Integration Adapter"
    },
    status: "in-progress",
    class: {
      system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      code: "EMER",
      display: "Emergency Encounter"
    },
    subject: {
      reference: `Patient/${id || "P-104"}`,
      display: id === "P-104" ? "Emergency Patient P-104" : `Patient ${id}`
    },
    period: { start: new Date().toISOString() },
    reasonCode: [
      {
        coding: [{ system: "http://snomed.info/sct", code: "394802001", display: "Acute Myocardial Infarction / Cardiac Crisis" }]
      }
    ],
    location: [
      { location: { display: "Intensive Care Unit (ICU) - Bed ICU-05" }, status: "active" }
    ]
  };
  res.json(fhir);
};

export const getFhirObservationResource = (req, res) => {
  const { id } = req.params;
  const fhir = {
    resourceType: "Observation",
    id: `OBS-VITALS-${id || "P-104"}`,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/vitalsigns"],
      adapter: "MediCare Nexus FHIR Adapter"
    },
    status: "final",
    category: [
      {
        coding: [{ system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "vital-signs", display: "Vital Signs" }]
      }
    ],
    subject: {
      reference: `Patient/${id || "P-104"}`,
      display: id === "P-104" ? "Emergency Patient P-104" : `Patient ${id}`
    },
    effectiveDateTime: new Date().toISOString(),
    component: [
      {
        code: { coding: [{ system: "http://loinc.org", code: "8867-4", display: "Heart rate" }] },
        valueQuantity: { value: 142, unit: "beats/minute", system: "http://unitsofmeasure.org", code: "/min" }
      },
      {
        code: { coding: [{ system: "http://loinc.org", code: "59408-5", display: "Oxygen saturation in Arterial blood" }] },
        valueQuantity: { value: 82, unit: "%", system: "http://unitsofmeasure.org", code: "%" }
      },
      {
        code: { coding: [{ system: "http://loinc.org", code: "85354-9", display: "Blood pressure" }] },
        valueString: "85/55"
      }
    ]
  };
  res.json(fhir);
};

/**
 * 15. Nexus Operations AI Copilot
 */
export const copilotQuery = (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ success: false, message: "Query text is required." });

    const q = query.toLowerCase();
    let reply = "";

    const icuAvail = nexusStore.beds.filter(b => b.wardId === "WARD-ICU" && b.status === "AVAILABLE").length;
    const icuTotal = nexusStore.beds.filter(b => b.wardId === "WARD-ICU").length;
    const xRay1 = nexusStore.diagnostics.find(d => d.resourceId === "DIAG-XR-01");

    if (q.includes("icu") || q.includes("bed")) {
      reply = `🏥 **ICU Capacity Status:** There are currently **${icuAvail} available beds** out of ${icuTotal} total ICU beds. Occupancy is at **${Math.round(((icuTotal - icuAvail)/icuTotal)*100)}%**. Beds ICU-05 and ICU-08 are designated high-priority resuscitation bays equipped with dedicated mechanical ventilators.`;
    } else if (q.includes("doctor") || q.includes("staff") || q.includes("on duty")) {
      reply = `👨‍⚕️ **Staffing Status:** **${nexusStore.staff.filter(s => s.role === "Doctor" || s.role === "Surgeon").length} physicians** are currently on active duty across Emergency, ICU, and Surgical units. Dr. Sarah Johnson (Cardiology) is cleared with high readiness for Code Red cardiac resuscitation.`;
    } else if (q.includes("xray") || q.includes("diagnostic") || q.includes("wait") || q.includes("queue")) {
      reply = `⚡ **Diagnostic Throughput:** X-Ray Suite 1 has a queue of **${xRay1?.currentQueue || 7} patients** with an estimated wait time of **${xRay1?.avgWaitMinutes || 38} minutes**. Our automated load-balancing engine can re-route 4 non-urgent patients to Suite 2 to reduce wait times to 12 minutes.`;
    } else if (q.includes("emergency") || q.includes("code red") || q.includes("p-104")) {
      reply = `🚨 **Emergency Protocol:** Active emergencies: **${nexusStore.emergencies.filter(e => e.status === "ACTIVE").length}**. When an emergency occurs (such as Patient P-104 with SpO2 < 85%), MediCare Nexus automatically evaluates 48 beds, scans on-duty clinicians, assigns ICU-05, dispatches Dr. Sarah Johnson & Nurse N-07, and provisions Ventilator V-04 within an average response time of 42 seconds.`;
    } else if (q.includes("reallocate") || q.includes("conflict") || q.includes("down") || q.includes("failure")) {
      reply = `🔄 **Autonomous Re-Optimization:** If an allocated resource fails (e.g. telemetry failure on ICU-05), Nexus detects the constraint violation instantly, identifies the next highest-scoring alternative (such as ICU-08), updates patient records, and alerts clinical staff with zero human latency.`;
    } else {
      reply = `🤖 **MediCare Nexus AI Copilot:** System status nominal. Real-time constraints monitored across **48 beds**, **90+ staff**, **8 operating theatres**, and **12 diagnostic suites**. How can I assist you with clinical orchestration, predictive forecasting, or resource allocation?`;
    }

    res.json({
      success: true,
      answer: reply,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
