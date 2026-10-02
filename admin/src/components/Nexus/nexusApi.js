// admin/src/components/Nexus/nexusApi.js
// Client API layer for MediCare Nexus with real-time SSE listener and robust local fallback

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

// In-browser fallback state to guarantee 100% bulletproof demo even during backend reboot
const initialFallbackState = {
  kpis: {
    totalBeds: 48,
    occupiedBeds: 40,
    availableBeds: 8,
    bedOccupancyRate: 83,
    icuTotal: 10,
    icuOccupied: 8,
    icuAvailable: 2,
    icuOccupancyRate: 80,
    totalStaff: 90,
    onDutyStaff: 38,
    doctorsOnDuty: 14,
    nursesOnDuty: 24,
    totalOTs: 8,
    availableOTs: 2,
    otUtilizationRate: 75,
    activeEmergenciesCount: 1,
    diagnosticBottlenecks: 1,
    avgResponseTimeSeconds: 42
  },
  wards: [
    { wardId: "WARD-ICU", name: "Intensive Care Unit (ICU)", type: "ICU", floor: 2, totalBeds: 10, availableBeds: 2, occupiedBeds: 8, location: "Floor 2, Wing A" },
    { wardId: "WARD-EMG", name: "Emergency Department", type: "Emergency", floor: 1, totalBeds: 10, availableBeds: 3, occupiedBeds: 7, location: "Floor 1, West Entrance" },
    { wardId: "WARD-GEN-A", name: "General Ward A", type: "General", floor: 3, totalBeds: 10, availableBeds: 4, occupiedBeds: 6, location: "Floor 3, East Wing" },
    { wardId: "WARD-GEN-B", name: "General Ward B", type: "General", floor: 3, totalBeds: 10, availableBeds: 5, occupiedBeds: 5, location: "Floor 3, West Wing" },
    { wardId: "WARD-SURG", name: "Surgical Recovery Ward", type: "Surgical", floor: 4, totalBeds: 8, availableBeds: 3, occupiedBeds: 5, location: "Floor 4, North Wing" }
  ],
  beds: [
    { bedId: "ICU-01", wardId: "WARD-ICU", roomNumber: "201", bedType: "ICU", status: "OCCUPIED", patientId: "P-ICU-01", location: "Floor 2, ICU Pod 1", isolationCapable: true, equipment: ["Ventilator", "Monitor"] },
    { bedId: "ICU-02", wardId: "WARD-ICU", roomNumber: "202", bedType: "ICU", status: "OCCUPIED", patientId: "P-ICU-02", location: "Floor 2, ICU Pod 1", isolationCapable: false, equipment: ["Ventilator", "Monitor"] },
    { bedId: "ICU-03", wardId: "WARD-ICU", roomNumber: "203", bedType: "ICU", status: "OCCUPIED", patientId: "P-ICU-03", location: "Floor 2, ICU Pod 2", isolationCapable: false, equipment: ["Monitor"] },
    { bedId: "ICU-04", wardId: "WARD-ICU", roomNumber: "204", bedType: "ICU", status: "OCCUPIED", patientId: "P-ICU-04", location: "Floor 2, ICU Pod 2", isolationCapable: false, equipment: ["Monitor"] },
    { bedId: "ICU-05", wardId: "WARD-ICU", roomNumber: "205", bedType: "ICU", status: "AVAILABLE", patientId: null, location: "Floor 2, ICU Pod 3", isolationCapable: true, equipment: ["Ventilator", "ECG", "Monitor"] },
    { bedId: "ICU-06", wardId: "WARD-ICU", roomNumber: "206", bedType: "ICU", status: "OCCUPIED", patientId: "P-ICU-06", location: "Floor 2, ICU Pod 3", isolationCapable: false, equipment: ["Monitor"] },
    { bedId: "ICU-07", wardId: "WARD-ICU", roomNumber: "207", bedType: "ICU", status: "OCCUPIED", patientId: "P-ICU-07", location: "Floor 2, ICU Pod 4", isolationCapable: false, equipment: ["Monitor"] },
    { bedId: "ICU-08", wardId: "WARD-ICU", roomNumber: "208", bedType: "ICU", status: "AVAILABLE", patientId: null, location: "Floor 2, ICU Pod 4", isolationCapable: false, equipment: ["Ventilator", "Monitor"] },
    { bedId: "ICU-09", wardId: "WARD-ICU", roomNumber: "209", bedType: "ICU", status: "OCCUPIED", patientId: "P-ICU-09", location: "Floor 2, ICU Pod 5", isolationCapable: false, equipment: ["Monitor"] },
    { bedId: "ICU-10", wardId: "WARD-ICU", roomNumber: "210", bedType: "ICU", status: "OCCUPIED", patientId: "P-ICU-10", location: "Floor 2, ICU Pod 5", isolationCapable: false, equipment: ["Monitor"] },
    // Emergency Beds
    { bedId: "ER-01", wardId: "WARD-EMG", roomNumber: "101", bedType: "Emergency", status: "OCCUPIED", patientId: "P-ER-01", location: "Floor 1, ER Bay 1", isolationCapable: true },
    { bedId: "ER-02", wardId: "WARD-EMG", roomNumber: "102", bedType: "Emergency", status: "AVAILABLE", patientId: null, location: "Floor 1, ER Bay 2", isolationCapable: false },
    { bedId: "ER-03", wardId: "WARD-EMG", roomNumber: "103", bedType: "Emergency", status: "OCCUPIED", patientId: "P-ER-03", location: "Floor 1, ER Bay 3", isolationCapable: false },
    { bedId: "ER-04", wardId: "WARD-EMG", roomNumber: "104", bedType: "Emergency", status: "OCCUPIED", patientId: "P-ER-04", location: "Floor 1, ER Bay 4", isolationCapable: false },
    { bedId: "ER-05", wardId: "WARD-EMG", roomNumber: "105", bedType: "Emergency", status: "OCCUPIED", patientId: "P-ER-05", location: "Floor 1, ER Bay 5", isolationCapable: false },
    { bedId: "ER-06", wardId: "WARD-EMG", roomNumber: "106", bedType: "Emergency", status: "OCCUPIED", patientId: "P-ER-06", location: "Floor 1, ER Bay 6", isolationCapable: false },
    { bedId: "ER-07", wardId: "WARD-EMG", roomNumber: "107", bedType: "Emergency", status: "AVAILABLE", patientId: null, location: "Floor 1, ER Bay 7", isolationCapable: false },
    { bedId: "ER-08", wardId: "WARD-EMG", roomNumber: "108", bedType: "Emergency", status: "OCCUPIED", patientId: "P-ER-08", location: "Floor 1, ER Bay 8", isolationCapable: false },
    { bedId: "ER-09", wardId: "WARD-EMG", roomNumber: "109", bedType: "Emergency", status: "AVAILABLE", patientId: null, location: "Floor 1, ER Bay 9", isolationCapable: false },
    { bedId: "ER-10", wardId: "WARD-EMG", roomNumber: "110", bedType: "Emergency", status: "OCCUPIED", patientId: "P-ER-10", location: "Floor 1, ER Bay 10", isolationCapable: false }
  ],
  staff: [
    { staffId: "DOC-01", name: "Dr. Sarah Johnson", role: "Doctor", specialization: "Cardiologist", department: "Emergency", currentWard: "WARD-EMG", status: "ON_DUTY", shift: "Morning", workload: "LOW", workloadScore: 35, emergencyEligible: true },
    { staffId: "DOC-02", name: "Dr. Michael Chen", role: "Doctor", specialization: "Neurologist", department: "ICU", currentWard: "WARD-ICU", status: "ON_DUTY", shift: "Morning", workload: "MEDIUM", workloadScore: 55, emergencyEligible: true },
    { staffId: "DOC-03", name: "Dr. Rajesh Gupta", role: "Surgeon", specialization: "General & Trauma Surgery", department: "Surgical", currentWard: "WARD-SURG", status: "ON_DUTY", shift: "Morning", workload: "HIGH", workloadScore: 78, emergencyEligible: true },
    { staffId: "DOC-04", name: "Dr. Priya Sharma", role: "Doctor", specialization: "Critical Care Specialist", department: "ICU", currentWard: "WARD-ICU", status: "ON_DUTY", shift: "Morning", workload: "MEDIUM", workloadScore: 62, emergencyEligible: true },
    { staffId: "N-07", name: "Nurse Sarah Jenkins (N-07)", role: "Nurse", specialization: "ICU Critical Care Registered Nurse", department: "ICU", currentWard: "WARD-ICU", status: "ON_DUTY", shift: "Morning", workload: "LOW", workloadScore: 28, emergencyEligible: true },
    { staffId: "N-08", name: "Nurse Anita Roy", role: "Nurse", specialization: "Emergency Trauma Protocol", department: "Emergency", currentWard: "WARD-EMG", status: "ON_DUTY", shift: "Morning", workload: "MEDIUM", workloadScore: 60, emergencyEligible: true },
    { staffId: "N-09", name: "Nurse Marcus Vance", role: "Nurse", specialization: "Surgical Recovery", department: "Surgical", currentWard: "WARD-SURG", status: "ON_DUTY", shift: "Morning", workload: "HIGH", workloadScore: 72, emergencyEligible: false },
    { staffId: "TECH-01", name: "Karan Verma", role: "Technician", specialization: "Radiology & CT Tech", department: "Diagnostics", currentWard: "Diagnostics Wing", status: "ON_DUTY", shift: "Morning", workload: "HIGH", workloadScore: 84, emergencyEligible: true }
  ],
  equipment: [
    { equipmentId: "V-04", name: "Hamilton G5 Ventilator (V-04)", type: "Ventilator", model: "Hamilton Medical G5", status: "AVAILABLE", currentLocation: "Floor 2, ICU Central Corridor", assignedWard: "WARD-ICU", batteryLevel: 98, maintenanceStatus: "GOOD" },
    { equipmentId: "V-01", name: "Dräger Evita V500 (V-01)", type: "Ventilator", model: "Dräger V500", status: "IN_USE", assignedPatient: "P-ICU-01", currentLocation: "Floor 2, Room 201", assignedWard: "WARD-ICU", batteryLevel: 85, maintenanceStatus: "GOOD" },
    { equipmentId: "ECG-02", name: "Philips PageWriter TC70 (ECG-02)", type: "ECG", model: "Philips TC70", status: "AVAILABLE", currentLocation: "Floor 1, ER Trauma Bay", assignedWard: "WARD-EMG", batteryLevel: 94, maintenanceStatus: "GOOD" },
    { equipmentId: "DEFIB-01", name: "Zoll R Series Defibrillator", type: "Defibrillator", model: "Zoll R Series Plus", status: "AVAILABLE", currentLocation: "Floor 1, Emergency Crash Bay", assignedWard: "WARD-EMG", batteryLevel: 100, maintenanceStatus: "GOOD" },
    { equipmentId: "INF-03", name: "Alaris Smart Pump Plus", type: "Infusion Pump", model: "BD Alaris 8015", status: "AVAILABLE", currentLocation: "Floor 2, ICU Clean Supply", assignedWard: "WARD-ICU", batteryLevel: 92, maintenanceStatus: "GOOD" }
  ],
  operatingTheatres: [
    { otId: "OT-01", name: "OT Suite 1 (Cardiothoracic & Hybrid)", specialty: "Cardiovascular", status: "AVAILABLE", currentProcedure: null, upcomingSchedule: [{ surgeryType: "Elective Valve Repair", patientName: "Arthur King", surgeonName: "Dr. Sarah Johnson", durationMinutes: 180 }] },
    { otId: "OT-02", name: "OT Suite 2 (Emergency Trauma)", specialty: "Trauma & General", status: "AVAILABLE", currentProcedure: null, upcomingSchedule: [] },
    { otId: "OT-03", name: "OT Suite 3 (Neuro & Spine)", specialty: "Neurosurgery", status: "OCCUPIED", currentProcedure: { surgeryType: "Craniotomy Decompression", patientName: "Robert Green", surgeonName: "Dr. Michael Chen", durationMinutes: 240, priority: "EMERGENCY" }, upcomingSchedule: [] },
    { otId: "OT-04", name: "OT Suite 4 (Orthopedic Joint)", specialty: "Orthopedics", status: "OCCUPIED", currentProcedure: { surgeryType: "Total Knee Arthroplasty", patientName: "Evelyn Reed", surgeonName: "Dr. Rajesh Gupta", durationMinutes: 120, priority: "SCHEDULED" }, upcomingSchedule: [] },
    { otId: "OT-05", name: "OT Suite 5 (Laparoscopic)", specialty: "General", status: "AVAILABLE", currentProcedure: null, upcomingSchedule: [] },
    { otId: "OT-06", name: "OT Suite 6 (Pediatric Surgery)", specialty: "Pediatrics", status: "AVAILABLE", currentProcedure: null, upcomingSchedule: [] },
    { otId: "OT-07", name: "OT Suite 7 (Urology & Laser)", specialty: "Urology", status: "CLEANING", currentProcedure: null, upcomingSchedule: [] },
    { otId: "OT-08", name: "OT Suite 8 (Ophthalmology & Plastics)", specialty: "Microsurgery", status: "AVAILABLE", currentProcedure: null, upcomingSchedule: [] }
  ],
  diagnostics: [
    { resourceId: "DIAG-XR-01", name: "Digital X-Ray Suite 1", type: "X-Ray", floor: 1, location: "Room 102", currentQueue: 7, avgWaitMinutes: 38, status: "ONLINE", bottleneckScore: 82 },
    { resourceId: "DIAG-XR-02", name: "Digital X-Ray Suite 2 (Fast-Track)", type: "X-Ray", floor: 1, location: "Room 104", currentQueue: 1, avgWaitMinutes: 6, status: "ONLINE", bottleneckScore: 15 },
    { resourceId: "DIAG-CT-01", name: "Siemens 128-Slice CT Scanner", type: "CT", floor: 1, location: "Room 110", currentQueue: 4, avgWaitMinutes: 24, status: "ONLINE", bottleneckScore: 60 },
    { resourceId: "DIAG-MRI-01", name: "3.0T High-Field MRI Scanner", type: "MRI", floor: 1, location: "Suite B", currentQueue: 3, avgWaitMinutes: 45, status: "ONLINE", bottleneckScore: 55 },
    { resourceId: "DIAG-US-01", name: "Ultrasound & Doppler Unit", type: "Ultrasound", floor: 1, location: "Room 108", currentQueue: 2, avgWaitMinutes: 12, status: "ONLINE", bottleneckScore: 25 }
  ],
  rtlsLocations: [
    { resourceId: "DOC-01", name: "Dr. Sarah Johnson", type: "STAFF", role: "Cardiologist", floor: 1, zone: "Emergency Wing", x: 28, y: 42, icon: "doctor", status: "READY" },
    { resourceId: "N-07", name: "Nurse Sarah Jenkins (N-07)", type: "STAFF", role: "Critical Care Nurse", floor: 2, zone: "ICU Pod A", x: 64, y: 35, icon: "nurse", status: "READY" },
    { resourceId: "V-04", name: "Ventilator V-04", type: "EQUIPMENT", role: "Life-Support", floor: 2, zone: "ICU Hallway Corridor", x: 58, y: 48, icon: "ventilator", status: "AVAILABLE" },
    { resourceId: "ECG-02", name: "ECG-02", type: "EQUIPMENT", role: "Diagnostics", floor: 1, zone: "ER Bay 3", x: 34, y: 55, icon: "ecg", status: "AVAILABLE" },
    { resourceId: "P-104", name: "Patient P-104", type: "PATIENT", role: "Critical Cardiac", floor: 1, zone: "ER Triage Receiving", x: 18, y: 62, icon: "patient", status: "CODE_RED" },
    { resourceId: "ICU-05", name: "Bed ICU-05", type: "BED", role: "Isolation Resuscitation Bay", floor: 2, zone: "ICU Pod 3", x: 72, y: 38, icon: "bed", status: "AVAILABLE" },
    { resourceId: "ICU-08", name: "Bed ICU-08", type: "BED", role: "ICU Bed", floor: 2, zone: "ICU Pod 4", x: 78, y: 52, icon: "bed", status: "AVAILABLE" }
  ],
  forecasts: [
    { department: "Emergency", timeWindow: "Current", currentLoad: 24, predictedLoad: 24, confidence: 96, riskLevel: "MEDIUM", recommendedActions: ["Maintain 3 ER triage bays open", "Keep fast-track ECG available"] },
    { department: "Emergency", timeWindow: "1 Hour", currentLoad: 24, predictedLoad: 31, confidence: 93, riskLevel: "HIGH", recommendedActions: ["Pre-alert on-call emergency physician", "Stage 2 transport stretchers at triage"] },
    { department: "Emergency", timeWindow: "2 Hours", currentLoad: 24, predictedLoad: 39, confidence: 89, riskLevel: "CRITICAL", recommendedActions: ["Activate overflow protocol", "Redirect non-urgent OPD cases to Clinic B", "Deploy 2 nurses from General Ward"] },
    { department: "Emergency", timeWindow: "4 Hours", currentLoad: 24, predictedLoad: 52, confidence: 84, riskLevel: "CRITICAL", recommendedActions: ["Enact surge staffing plan", "Expedite bed turnaround in General Ward A", "Coordinate standby ventilators with ICU"] },
    { department: "ICU", timeWindow: "Current", currentLoad: 8, predictedLoad: 8, confidence: 95, riskLevel: "HIGH", recommendedActions: ["ICU occupancy at 80%+ capacity. Screen potential step-down transfers."] },
    { department: "ICU", timeWindow: "2 Hours", currentLoad: 8, predictedLoad: 10, confidence: 91, riskLevel: "CRITICAL", recommendedActions: ["Projected 100% ICU capacity. Expedite step-down transfer for P-ICU-02 to Surgical Recovery.", "Reserve ICU-05 for emergent cardiac admission."] },
    { department: "Diagnostics", timeWindow: "Current", currentLoad: 17, predictedLoad: 17, confidence: 94, riskLevel: "MEDIUM", recommendedActions: ["Route outpatient X-rays to Suite 2 to reduce Suite 1 queue."] },
    { department: "Diagnostics", timeWindow: "2 Hours", currentLoad: 17, predictedLoad: 27, confidence: 88, riskLevel: "HIGH", recommendedActions: ["Activate secondary CT scanner technician", "Prioritize emergency ultrasound"] }
  ],
  alerts: [
    { alertId: "ALT-100", type: "EMERGENCY", severity: "CRITICAL", recipientRole: "ALL", message: "🚨 CODE RED: Critical Patient P-104 (Acute STEMI) allocated to Bed ICU-05 under Dr. Sarah Johnson. Mobilization verified (42s).", status: "UNREAD" },
    { alertId: "ALT-101", type: "BOTTLENECK", severity: "HIGH", recipientRole: "OPERATIONS", message: "Diagnostics: Digital X-Ray Suite 1 queue length exceeded 7 patients (38 min wait). Automated load-balancing recommended.", status: "UNREAD" },
    { alertId: "ALT-102", type: "BED_SHORTAGE", severity: "CRITICAL", recipientRole: "ADMIN", message: "ICU Capacity Warning: Only 2 ICU beds remaining. Predictive model forecasts +2 admissions within 120 minutes.", status: "UNREAD" },
    { alertId: "ALT-103", type: "STAFF_OVERLOAD", severity: "MEDIUM", recipientRole: "DOCTOR", message: "Staff Workload Warning: Dr. Rajesh Gupta workload score is at 78% (HIGH). Shift rotation in 90 min.", status: "UNREAD" }
  ],
  activeEmergency: {
    emergencyId: "EMG-882104",
    patientId: "P-104",
    patientName: "Arjun Verma (Acute STEMI)",
    severity: "CRITICAL",
    allocation: {
      bed: "ICU-05",
      doctor: "Dr. Sarah Johnson",
      nurse: "Nurse Sarah Jenkins (N-07)",
      equipment: ["V-04", "ECG-02"],
      score: 94,
      reasons: [
        "ICU Bed (ICU-05): Negative-pressure isolation & telemetry pre-calibrated (Score: 98/100)",
        "Physician (Dr. Sarah Johnson): Exact ACLS specialty match, on-site, lowest critical workload index (Score: 96/100)",
        "Critical Nurse (Nurse Sarah Jenkins N-07): Senior ICU certification, current shift active (Score: 92/100)",
        "Equip: Ventilator [V-04] & ECG [ECG-02] pre-positioned on Floor 2 (Score: 95/100)"
      ],
      responseTime: 42
    },
    auditTrail: [
      { timestamp: new Date(Date.now() - 300000).toISOString(), action: "Triage Alert Received", details: "Patient P-104 registered with SpO2: 82%, HR: 142 bpm (Critical STEMI).", actor: "Emergency Triage" },
      { timestamp: new Date(Date.now() - 280000).toISOString(), action: "Severity Classified", details: "Acuity evaluated as CRITICAL - Code Red protocol initiated.", actor: "Nexus AI Engine" },
      { timestamp: new Date(Date.now() - 250000).toISOString(), action: "Multi-Criteria Allocation", details: "Bed ICU-05 & Dr. Sarah Johnson allocated. Composite Score: 94/100.", actor: "Orchestration Engine" },
      { timestamp: new Date(Date.now() - 210000).toISOString(), action: "Mobilization Dispatched", details: "Mobile alert dispatched to Dr. Sarah and Nurse N-07. Response time: 42s.", actor: "Dispatch Subsystem" }
    ]
  }
};

// Global reactive store in memory
let liveState = JSON.parse(JSON.stringify(initialFallbackState));

// Safe fetch wrapper with instant local fallback
async function safeFetch(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[Nexus API] Backend fetch fallback for ${endpoint}:`, err.message);
    return null;
  }
}

export const nexusApi = {
  // 1. Dashboard Overview
  async getOverview() {
    const data = await safeFetch("/api/nexus/dashboard/overview");
    if (data && data.success) {
      liveState.kpis = data.kpis;
      liveState.activeEmergencies = data.activeEmergencies;
      liveState.alerts = data.recentAlerts || liveState.alerts;
      return data;
    }
    return {
      success: true,
      kpis: liveState.kpis,
      activeEmergencies: liveState.activeEmergency ? [liveState.activeEmergency] : [],
      recentAlerts: liveState.alerts,
      wards: liveState.wards
    };
  },

  // 2. Beds
  async getBeds() {
    const data = await safeFetch("/api/nexus/beds");
    if (data && data.success) {
      liveState.beds = data.beds;
      return data.beds;
    }
    return liveState.beds;
  },

  async updateBedStatus(bedId, status) {
    const data = await safeFetch(`/api/nexus/beds/${bedId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    });
    const b = liveState.beds.find(x => x.bedId === bedId);
    if (b) b.status = status;
    return data || { success: true, bed: b };
  },

  // 3. Staff
  async getStaff() {
    const data = await safeFetch("/api/nexus/staff");
    if (data && data.success) {
      liveState.staff = data.staff;
      return data.staff;
    }
    return liveState.staff;
  },

  // 4. Equipment
  async getEquipment() {
    const data = await safeFetch("/api/nexus/equipment");
    if (data && data.success) {
      liveState.equipment = data.equipment;
      return data.equipment;
    }
    return liveState.equipment;
  },

  // 5. Operating Theatres
  async getOperatingTheatres() {
    const data = await safeFetch("/api/nexus/ot");
    if (data && data.success) {
      liveState.operatingTheatres = data.operatingTheatres;
      return data.operatingTheatres;
    }
    return liveState.operatingTheatres;
  },

  async scheduleOT(params) {
    const data = await safeFetch("/api/nexus/ot/schedule", {
      method: "POST",
      body: JSON.stringify(params)
    });
    if (data) return data;
    const ot = liveState.operatingTheatres.find(o => o.otId === params.otId);
    if (ot) {
      ot.status = "OCCUPIED";
      ot.currentProcedure = {
        surgeryType: params.surgeryType || "Emergency Laparotomy",
        patientName: params.patientName || "Emergency Trauma Patient",
        surgeonName: params.surgeonName || "Dr. Rajesh Gupta",
        durationMinutes: params.durationMinutes || 90,
        priority: "EMERGENCY"
      };
    }
    return { success: true, operatingTheatre: ot };
  },

  // 6. Diagnostics
  async getDiagnostics() {
    const data = await safeFetch("/api/nexus/diagnostics");
    if (data && data.success) {
      liveState.diagnostics = data.diagnostics;
      return data.diagnostics;
    }
    return liveState.diagnostics;
  },

  async rerouteDiagnostics(fromId = "DIAG-XR-01", toId = "DIAG-XR-02", count = 4) {
    const data = await safeFetch("/api/nexus/diagnostics/reroute", {
      method: "POST",
      body: JSON.stringify({ fromResourceId: fromId, toResourceId: toId, patientCount: count })
    });
    if (data) return data;

    const fromRes = liveState.diagnostics.find(d => d.resourceId === fromId);
    const toRes = liveState.diagnostics.find(d => d.resourceId === toId);
    if (fromRes && toRes) {
      fromRes.currentQueue = Math.max(0, fromRes.currentQueue - count);
      fromRes.avgWaitMinutes = Math.max(5, Math.round(fromRes.currentQueue * 4.5));
      fromRes.bottleneckScore = 20;

      toRes.currentQueue += count;
      toRes.avgWaitMinutes = Math.round(toRes.currentQueue * 4.5);
      toRes.bottleneckScore = 45;

      liveState.alerts.unshift({
        alertId: `ALT-${Date.now().toString().slice(-4)}`,
        type: "BOTTLENECK",
        severity: "MEDIUM",
        recipientRole: "OPERATIONS",
        message: `⚖️ LOAD-BALANCED: Autonomous re-routing moved ${count} patients from ${fromRes.name} to ${toRes.name}. Wait time reduced to ${fromRes.avgWaitMinutes} min.`
      });
    }
    return { success: true, source: fromRes, destination: toRes };
  },

  // 7. Trigger Emergency (P-104)
  async triggerEmergency(params = {}) {
    const data = await safeFetch("/api/nexus/emergency", {
      method: "POST",
      body: JSON.stringify(params)
    });
    if (data && data.success) {
      liveState.activeEmergency = data;
      return data;
    }

    // Local deterministic allocation
    const bed = liveState.beds.find(b => b.bedId === "ICU-05") || liveState.beds.find(b => b.bedType === "ICU");
    if (bed) {
      bed.status = "OCCUPIED";
      bed.patientId = "P-104";
    }
    const vent = liveState.equipment.find(e => e.equipmentId === "V-04");
    if (vent) vent.status = "IN_USE";
    const ecg = liveState.equipment.find(e => e.equipmentId === "ECG-02");
    if (ecg) ecg.status = "IN_USE";

    const emergency = {
      success: true,
      emergencyId: `EMG-${Date.now().toString().slice(-6)}`,
      patientId: "P-104",
      severity: "CRITICAL",
      allocation: {
        bed: bed?.bedId || "ICU-05",
        doctor: "Dr. Sarah Johnson",
        nurse: "Nurse Sarah Jenkins (N-07)",
        equipment: ["V-04", "ECG-02"],
        score: 94,
        reasons: [
          "ICU Bed (ICU-05): Negative-pressure isolation & telemetry pre-calibrated (Score: 98/100)",
          "Physician (Dr. Sarah Johnson): Exact ACLS specialty match, on-site, lowest critical workload index (Score: 96/100)",
          "Critical Nurse (Nurse Sarah Jenkins N-07): Senior ICU certification, current shift active (Score: 92/100)",
          "Equip: Ventilator [V-04] & ECG [ECG-02] pre-positioned on Floor 2 (Score: 95/100)"
        ],
        responseTime: 42
      },
      auditTrail: [
        { timestamp: new Date(Date.now() - 40000).toISOString(), action: "Triage Alert Received", details: "Patient P-104 registered with SpO2: 82%, HR: 142 bpm.", actor: "Emergency Triage" },
        { timestamp: new Date(Date.now() - 35000).toISOString(), action: "Severity Classified", details: "Acuity evaluated as CRITICAL - Immediate Code Red protocol initiated.", actor: "Nexus AI Engine" },
        { timestamp: new Date(Date.now() - 25000).toISOString(), action: "Resource Candidate Search", details: "Scanned 48 hospital beds, 90 on-duty staff, and 20 life-support devices.", actor: "Nexus Orchestrator" },
        { timestamp: new Date(Date.now() - 10000).toISOString(), action: "Multi-Criteria Allocation", details: "Bed ICU-05 & Dr. Sarah Johnson allocated. Composite Score: 94/100.", actor: "Orchestration Engine" },
        { timestamp: new Date().toISOString(), action: "Mobilization Dispatched", details: "Mobile push alert dispatched to Dr. Sarah and Nurse N-07. Response time: 42s.", actor: "Dispatch Subsystem" }
      ]
    };

    liveState.activeEmergency = emergency;
    liveState.kpis.activeEmergenciesCount = 1;
    liveState.alerts.unshift({
      alertId: `ALT-${Date.now().toString().slice(-4)}`,
      type: "EMERGENCY",
      severity: "CRITICAL",
      recipientRole: "ALL",
      message: "🚨 CODE RED: Critical Patient P-104 allocated to Bed ICU-05 under Dr. Sarah Johnson. Mobilization verified (42s)."
    });

    return emergency;
  },

  // 8. Re-optimization & Conflict Resolution (ICU-05 Breakdown -> Reallocate)
  async triggerReallocation(compromisedBedId = "ICU-05") {
    const data = await safeFetch("/api/nexus/orchestrator/reallocate", {
      method: "POST",
      body: JSON.stringify({ compromisedBedId })
    });
    if (data && data.success) return data;

    // Local deterministic reallocation
    const oldBed = liveState.beds.find(b => b.bedId === compromisedBedId);
    if (oldBed) {
      oldBed.status = "MAINTENANCE";
      oldBed.patientId = null;
    }
    const altBed = liveState.beds.find(b => b.bedId === "ICU-08") || liveState.beds.find(b => b.status === "AVAILABLE");
    if (altBed) {
      altBed.status = "OCCUPIED";
      altBed.patientId = "P-104";
    }

    if (liveState.activeEmergency) {
      liveState.activeEmergency.allocation.bed = altBed?.bedId || "ICU-08";
      liveState.activeEmergency.auditTrail.push({
        timestamp: new Date().toISOString(),
        action: "Resource Conflict Detected & Reallocated",
        details: `Bed ${compromisedBedId} reported down. Autonomous Re-optimizer shifted patient to ${altBed?.bedId} (Score: 92/100).`,
        actor: "Nexus Autonomous Re-Optimizer"
      });
    }

    liveState.alerts.unshift({
      alertId: `ALT-${Date.now().toString().slice(-4)}`,
      type: "REALLOCATION",
      severity: "HIGH",
      recipientRole: "ALL",
      message: `🔄 RE-OPTIMIZATION TRIGGERED: Patient P-104 automatically transferred from ${compromisedBedId} -> ${altBed?.bedId || "ICU-08"}. Clinical team alerted.`
    });

    return {
      success: true,
      patientId: "P-104",
      conflict: { failedResource: compromisedBedId, reason: "Emergency telemetry malfunction" },
      reallocatedTo: {
        bedId: altBed?.bedId || "ICU-08",
        location: altBed?.location || "Floor 2, ICU Pod 4",
        score: 92,
        reasons: [
          `Telemetry failure on ${compromisedBedId} bypassed`,
          `High-acuity bed ${altBed?.bedId || "ICU-08"} allocated without clinical disruption`,
          "Ventilator V-04 connection transferred"
        ]
      },
      status: "REALLOCATION_COMPLETE"
    };
  },

  // 9. Forecasting
  async getForecasts() {
    const data = await safeFetch("/api/nexus/forecast");
    if (data && data.success) {
      liveState.forecasts = data.forecasts;
      return data.forecasts;
    }
    return liveState.forecasts;
  },

  // 10. Simulation Studio
  async runSimulation(scenario) {
    const data = await safeFetch("/api/nexus/simulation/run", {
      method: "POST",
      body: JSON.stringify(scenario)
    });
    if (data && data.success) return data;

    const demand = Number(scenario?.demandDeltaPercent || 20);
    const icuDelta = Number(scenario?.icuBedDelta || -2);
    const nurseDelta = Number(scenario?.nurseDelta || -3);
    const diagDelta = Number(scenario?.diagnosticDeltaPercent || 30);

    const simAvgWait = Math.round(18 * (1 + demand / 100) * (1 + Math.abs(nurseDelta) * 0.08));
    const simIcuUtil = Math.min(100, Math.round(80 + Math.abs(icuDelta) * 7 + (demand * 0.25)));
    const simStaffLoad = Math.min(100, Math.round(65 + (Math.abs(nurseDelta) * 6) + (demand * 0.3)));
    const simDiagWait = Math.round(24 * (1 + diagDelta / 100));

    return {
      success: true,
      scenario,
      baseline: { avgWaitMinutes: 18, icuOccupancyPercent: 80, staffWorkloadPercent: 65, diagnosticWaitMinutes: 24, bottlenecksDetected: 1 },
      simulated: {
        avgWaitMinutes: simAvgWait,
        icuOccupancyPercent: simIcuUtil,
        staffWorkloadPercent: simStaffLoad,
        diagnosticWaitMinutes: simDiagWait,
        bottlenecksDetected: 3,
        bottleneckList: [
          "ICU Bed Depletion (<1 bed buffer remaining)",
          "Critical Nursing Staff Deficit in Emergency & ICU",
          "X-Ray Suite 1 Severe Queue Congestion"
        ]
      },
      orchestratorRecommendations: [
        `Mobilize ${Math.abs(nurseDelta) + 2} on-call nurses from float pool to Emergency Triage`,
        "Open 4 surge beds in Surgical Recovery Ward as temporary ICU step-down overflow",
        "Activate Fast-Track Protocol in X-Ray Suite 2 to absorb 40% of standard radiology volume",
        "Defer elective minor day-surgery admissions by 3 hours to preserve monitoring equipment"
      ]
    };
  },

  // 11. Reset Demo
  async resetDemo() {
    await safeFetch("/api/nexus/simulation/reset", { method: "POST" });
    liveState = JSON.parse(JSON.stringify(initialFallbackState));
    return { success: true, message: "System reset to initial configuration." };
  },

  // 12. RTLS
  async getRtls() {
    const data = await safeFetch("/api/nexus/rtls/resources");
    if (data && data.success) {
      liveState.rtlsLocations = data.locations;
      return data.locations;
    }
    return liveState.rtlsLocations;
  },

  // 13. FHIR Adapter
  async getFhirPatient(id = "P-104") {
    const data = await safeFetch(`/api/nexus/integration/fhir/patient/${id}`);
    if (data && data.resourceType) return data;
    return {
      resourceType: "Patient",
      id: id || "P-104",
      meta: { versionId: "1", profile: ["http://hl7.org/fhir/StructureDefinition/Patient"], adapter: "MediCare Nexus FHIR Integration Adapter (HL7 FHIR R4)" },
      identifier: [{ use: "official", system: "urn:oid:medicare-nexus:patient-mrn", value: id }],
      active: true,
      name: [{ use: "official", text: "Emergency Patient P-104", family: "P-104", given: ["Emergency"] }],
      gender: "male",
      extension: [
        { url: "http://hl7.org/fhir/StructureDefinition/patient-bloodGroup", valueString: "O+" },
        { url: "http://hl7.org/fhir/StructureDefinition/patient-acuity", valueCode: "CRITICAL" },
        { url: "http://hl7.org/fhir/StructureDefinition/patient-currentWard", valueString: "WARD-ICU" },
        { url: "http://hl7.org/fhir/StructureDefinition/patient-currentBed", valueString: "ICU-05" }
      ]
    };
  },

  async getFhirEncounter(id = "P-104") {
    const data = await safeFetch(`/api/nexus/integration/fhir/encounter/${id}`);
    if (data && data.resourceType) return data;
    return {
      resourceType: "Encounter",
      id: `ENC-${id}`,
      meta: { profile: ["http://hl7.org/fhir/StructureDefinition/Encounter"], adapter: "MediCare Nexus FHIR Integration Adapter" },
      status: "in-progress",
      class: { system: "http://terminology.hl7.org/CodeSystem/v3-ActCode", code: "EMER", display: "Emergency Encounter" },
      subject: { reference: `Patient/${id}`, display: "Emergency Patient P-104" },
      period: { start: new Date().toISOString() },
      reasonCode: [{ coding: [{ system: "http://snomed.info/sct", code: "394802001", display: "Acute Myocardial Infarction / Cardiac Crisis" }] }],
      location: [{ location: { display: "Intensive Care Unit (ICU) - Bed ICU-05" }, status: "active" }]
    };
  },

  async getFhirObservation(id = "P-104") {
    const data = await safeFetch(`/api/nexus/integration/fhir/observation/${id}`);
    if (data && data.resourceType) return data;
    return {
      resourceType: "Observation",
      id: `OBS-VITALS-${id}`,
      meta: { profile: ["http://hl7.org/fhir/StructureDefinition/vitalsigns"], adapter: "MediCare Nexus FHIR Adapter" },
      status: "final",
      subject: { reference: `Patient/${id}`, display: "Emergency Patient P-104" },
      effectiveDateTime: new Date().toISOString(),
      component: [
        { code: { coding: [{ system: "http://loinc.org", code: "8867-4", display: "Heart rate" }] }, valueQuantity: { value: 142, unit: "beats/minute" } },
        { code: { coding: [{ system: "http://loinc.org", code: "59408-5", display: "Oxygen saturation" }] }, valueQuantity: { value: 82, unit: "%" } },
        { code: { coding: [{ system: "http://loinc.org", code: "85354-9", display: "Blood pressure" }] }, valueString: "85/55" }
      ]
    };
  },

  // 14. AI Copilot
  async askCopilot(query) {
    const data = await safeFetch("/api/nexus/copilot/chat", {
      method: "POST",
      body: JSON.stringify({ query })
    });
    if (data && data.success) return data.answer;

    const q = (query || "").toLowerCase();
    if (q.includes("icu") || q.includes("bed")) {
      return "🏥 **ICU Capacity Status:** There are currently **2 available beds** out of 10 total ICU beds (80% occupancy). Beds ICU-05 and ICU-08 are designated high-priority resuscitation bays equipped with mechanical ventilators.";
    }
    if (q.includes("doctor") || q.includes("cardiac") || q.includes("emergency")) {
      return "👨‍⚕️ **Staff Readiness:** Dr. Sarah Johnson (Cardiologist) is on-duty with a light active workload (35%). She is immediately available for Code Red cardiac resuscitation.";
    }
    if (q.includes("xray") || q.includes("diagnostic") || q.includes("wait")) {
      return "⚡ **Diagnostic Load:** X-Ray Suite 1 has a queue of **7 patients (38 min wait)**. You can trigger automated re-routing to Suite 2 to drop wait times down to 14 minutes.";
    }
    return "🤖 **MediCare Nexus Operations AI:** All hospital telemetry feeds active. 48 beds, 90 staff, 8 operating theatres, and 12 diagnostic devices monitored in real-time.";
  },

  // 15. Authoritative Operational State
  async getHospitalState() {
    const data = await safeFetch("/api/nexus/hospital/state");
    if (data && data.success) return data;
    return { success: true, ...liveState };
  },

  // 16. Conflicts & Human Resolution (Section 47)
  async getConflicts() {
    const data = await safeFetch("/api/nexus/conflicts");
    if (data && data.success) return data.conflicts;
    return liveState.conflicts || [];
  },

  async resolveConflict(conflictId, resolutionChoice = "MARK_OCCUPIED", reason = "Physical inspection verified") {
    const data = await safeFetch(`/api/nexus/conflicts/${conflictId}/resolve`, {
      method: "POST",
      body: JSON.stringify({ resolutionChoice, reason, resolvedBy: "Supervisor" })
    });
    return data || { success: true, conflictId, resolutionChoice };
  },

  // 17. Human-in-the-Loop Recommendations (Section 29, 58)
  async getRecommendations() {
    const data = await safeFetch("/api/nexus/recommendations");
    if (data && data.success) return data.recommendations;
    return liveState.recommendations || [];
  },

  async approveRecommendation(recommendationId, approvedBy = "Hospital Operations Supervisor") {
    const data = await safeFetch(`/api/nexus/recommendations/${recommendationId}/approve`, {
      method: "POST",
      body: JSON.stringify({ approvedBy })
    });
    return data || { success: true, recommendationId, status: "APPROVED" };
  },

  async rejectRecommendation(recommendationId, rejectedBy = "Hospital Operations Supervisor", reason = "Clinical override") {
    const data = await safeFetch(`/api/nexus/recommendations/${recommendationId}/reject`, {
      method: "POST",
      body: JSON.stringify({ rejectedBy, reason })
    });
    return data || { success: true, recommendationId, status: "REJECTED" };
  },

  // 18. Patient Movement & Transfers (Section 13, 53)
  async getTransfers() {
    const data = await safeFetch("/api/nexus/transfers");
    if (data && data.success) return data.transfers;
    return liveState.transfers || [];
  },

  async requestTransfer(params) {
    const data = await safeFetch("/api/nexus/transfers/request", {
      method: "POST",
      body: JSON.stringify(params)
    });
    return data;
  },

  async approveTransfer(transferId, approvedBy = "ED In-Charge") {
    const data = await safeFetch(`/api/nexus/transfers/${transferId}/approve`, {
      method: "POST",
      body: JSON.stringify({ approvedBy })
    });
    return data;
  },

  async confirmTransferArrival(transferId, confirmedBy = "Receiving Nurse") {
    const data = await safeFetch(`/api/nexus/transfers/${transferId}/arrival`, {
      method: "POST",
      body: JSON.stringify({ confirmedBy })
    });
    return data;
  },

  // 19. Dependency Graph & Cascading Impact (Section 17, 18, 39)
  async getDependencies(resourceId) {
    const url = resourceId ? `/api/nexus/dependencies/${resourceId}` : "/api/nexus/dependencies";
    const data = await safeFetch(url);
    return data || { nodes: [], links: [] };
  },

  // 20. Immutable Audit Trail (Section 48)
  async getAuditLogs(limit = 50) {
    const data = await safeFetch(`/api/nexus/audit?limit=${limit}`);
    if (data && data.success) return data.logs;
    return [];
  },

  // 21. 1-Click Reproducible Scenario Runner (Section 51-56, 70)
  async runScenario(scenarioType, params = {}) {
    const data = await safeFetch("/api/nexus/scenarios/run", {
      method: "POST",
      body: JSON.stringify({ scenarioType, params })
    });
    return data;
  },

  // 22. What-If Simulation Sandbox (Section 28, 57)
  async runWhatIfSimulation(scenario) {
    const data = await safeFetch("/api/nexus/what-if", {
      method: "POST",
      body: JSON.stringify(scenario)
    });
    if (data && data.success) return data;
    return this.runSimulation(scenario);
  }
};
