// backend/services/nexusStore.js
// Ultra-fast In-Memory + MongoDB Hybrid Engine for MediCare Nexus
// Ensures instant boot, zero network latency, and reliable hackathon execution

export class NexusStore {
  constructor() {
    this.wards = [];
    this.beds = [];
    this.staff = [];
    this.equipment = [];
    this.operatingTheatres = [];
    this.diagnostics = [];
    this.emergencies = [];
    this.assignments = [];
    this.forecasts = [];
    this.alerts = [];
    this.rtlsLocations = [];
    this.patients = [];

    this.resetToDefaults();
  }

  resetToDefaults() {
    // 1. Wards
    this.wards = [
      { wardId: "WARD-ICU", name: "Intensive Care Unit (ICU)", type: "ICU", floor: 2, totalBeds: 10, availableBeds: 2, occupiedBeds: 8, location: "Floor 2, Wing A" },
      { wardId: "WARD-EMG", name: "Emergency Department", type: "Emergency", floor: 1, totalBeds: 10, availableBeds: 3, occupiedBeds: 7, location: "Floor 1, West Entrance" },
      { wardId: "WARD-GEN-A", name: "General Ward A", type: "General", floor: 3, totalBeds: 10, availableBeds: 4, occupiedBeds: 6, location: "Floor 3, East Wing" },
      { wardId: "WARD-GEN-B", name: "General Ward B", type: "General", floor: 3, totalBeds: 10, availableBeds: 5, occupiedBeds: 5, location: "Floor 3, West Wing" },
      { wardId: "WARD-SURG", name: "Surgical Recovery Ward", type: "Surgical", floor: 4, totalBeds: 8, availableBeds: 3, occupiedBeds: 5, location: "Floor 4, North Wing" }
    ];

    // 2. Beds (48 Beds)
    this.beds = [];
    // ICU Beds: ICU-01 to ICU-10 (ICU-05 and ICU-08 AVAILABLE)
    for (let i = 1; i <= 10; i++) {
      const bedId = `ICU-${String(i).padStart(2, "0")}`;
      const isAvail = i === 5 || i === 8;
      this.beds.push({
        _id: `bed_icu_${i}`,
        bedId,
        wardId: "WARD-ICU",
        roomNumber: `20${i}`,
        bedType: "ICU",
        status: isAvail ? "AVAILABLE" : "OCCUPIED",
        patientId: isAvail ? null : `P-ICU-${i}`,
        location: `Floor 2, ICU Pod ${Math.ceil(i / 2)}`,
        isolationCapable: i === 1 || i === 5,
        equipment: ["Ventilator", "Patient Monitor", "Infusion Pump", "ECG"],
        lastUpdated: new Date().toISOString()
      });
    }

    // Emergency Beds: ER-01 to ER-10
    for (let i = 1; i <= 10; i++) {
      const bedId = `ER-${String(i).padStart(2, "0")}`;
      const isAvail = i === 2 || i === 7 || i === 9;
      this.beds.push({
        _id: `bed_er_${i}`,
        bedId,
        wardId: "WARD-EMG",
        roomNumber: `10${i}`,
        bedType: "Emergency",
        status: isAvail ? "AVAILABLE" : "OCCUPIED",
        patientId: isAvail ? null : `P-ER-${i}`,
        location: `Floor 1, ER Bay ${i}`,
        isolationCapable: i === 1,
        equipment: ["Crash Cart", "Monitor", "Defibrillator"],
        lastUpdated: new Date().toISOString()
      });
    }

    // General Ward A Beds: GEN-A-01 to GEN-A-10
    for (let i = 1; i <= 10; i++) {
      const bedId = `GEN-A-${String(i).padStart(2, "0")}`;
      const isAvail = i % 2 === 0;
      this.beds.push({
        _id: `bed_gena_${i}`,
        bedId,
        wardId: "WARD-GEN-A",
        roomNumber: `30${i}`,
        bedType: "Standard",
        status: isAvail ? "AVAILABLE" : "OCCUPIED",
        patientId: isAvail ? null : `P-GA-${i}`,
        location: "Floor 3, General Wing A",
        isolationCapable: false,
        equipment: ["IV Pole", "Nurse Call System"],
        lastUpdated: new Date().toISOString()
      });
    }

    // General Ward B Beds: GEN-B-01 to GEN-B-10
    for (let i = 1; i <= 10; i++) {
      const bedId = `GEN-B-${String(i).padStart(2, "0")}`;
      const isAvail = i % 2 === 1;
      this.beds.push({
        _id: `bed_genb_${i}`,
        bedId,
        wardId: "WARD-GEN-B",
        roomNumber: `31${i}`,
        bedType: "Standard",
        status: isAvail ? "AVAILABLE" : "OCCUPIED",
        patientId: isAvail ? null : `P-GB-${i}`,
        location: "Floor 3, General Wing B",
        isolationCapable: false,
        equipment: ["IV Pole", "Nurse Call System"],
        lastUpdated: new Date().toISOString()
      });
    }

    // Surgical Recovery Beds: SURG-01 to SURG-08
    for (let i = 1; i <= 8; i++) {
      const bedId = `SURG-${String(i).padStart(2, "0")}`;
      const isAvail = i === 3 || i === 6 || i === 8;
      this.beds.push({
        _id: `bed_surg_${i}`,
        bedId,
        wardId: "WARD-SURG",
        roomNumber: `40${i}`,
        bedType: "Recovery",
        status: isAvail ? "AVAILABLE" : "OCCUPIED",
        patientId: isAvail ? null : `P-SURG-${i}`,
        location: "Floor 4, Surgical Recovery",
        isolationCapable: false,
        equipment: ["Post-Op Monitor", "Oxygen Port", "Infusion Pump"],
        lastUpdated: new Date().toISOString()
      });
    }

    // 3. Staff (Key Clinicians & Nurses)
    this.staff = [
      {
        _id: "staff_01",
        staffId: "DOC-01",
        name: "Dr. Sarah Johnson",
        role: "Doctor",
        specialization: "Cardiologist",
        department: "Emergency",
        currentWard: "WARD-EMG",
        status: "ON_DUTY",
        shift: "Morning",
        workload: "LOW",
        workloadScore: 35,
        emergencyEligible: true,
        contact: "+91 9811002201"
      },
      {
        _id: "staff_02",
        staffId: "DOC-02",
        name: "Dr. Michael Chen",
        role: "Doctor",
        specialization: "Neurologist",
        department: "ICU",
        currentWard: "WARD-ICU",
        status: "ON_DUTY",
        shift: "Morning",
        workload: "MEDIUM",
        workloadScore: 55,
        emergencyEligible: true,
        contact: "+91 9811002202"
      },
      {
        _id: "staff_03",
        staffId: "DOC-03",
        name: "Dr. Rajesh Gupta",
        role: "Surgeon",
        specialization: "General & Trauma Surgery",
        department: "Surgical",
        currentWard: "WARD-SURG",
        status: "ON_DUTY",
        shift: "Morning",
        workload: "HIGH",
        workloadScore: 78,
        emergencyEligible: true,
        contact: "+91 9811002203"
      },
      {
        _id: "staff_04",
        staffId: "DOC-04",
        name: "Dr. Priya Sharma",
        role: "Doctor",
        specialization: "Critical Care Specialist",
        department: "ICU",
        currentWard: "WARD-ICU",
        status: "ON_DUTY",
        shift: "Morning",
        workload: "MEDIUM",
        workloadScore: 62,
        emergencyEligible: true,
        contact: "+91 9811002204"
      },
      {
        _id: "staff_05",
        staffId: "DOC-05",
        name: "Dr. David Kim",
        role: "Doctor",
        specialization: "Pulmonologist",
        department: "General",
        currentWard: "WARD-GEN-A",
        status: "ON_DUTY",
        shift: "Morning",
        workload: "LOW",
        workloadScore: 30,
        emergencyEligible: false,
        contact: "+91 9811002205"
      },
      {
        _id: "staff_06",
        staffId: "N-07",
        name: "Nurse Sarah Jenkins (N-07)",
        role: "Nurse",
        specialization: "ICU Critical Care Registered Nurse",
        department: "ICU",
        currentWard: "WARD-ICU",
        status: "ON_DUTY",
        shift: "Morning",
        workload: "LOW",
        workloadScore: 28,
        emergencyEligible: true,
        contact: "+91 9811002206"
      },
      {
        _id: "staff_07",
        staffId: "N-08",
        name: "Nurse Anita Roy",
        role: "Nurse",
        specialization: "Emergency Trauma Protocol",
        department: "Emergency",
        currentWard: "WARD-EMG",
        status: "ON_DUTY",
        shift: "Morning",
        workload: "MEDIUM",
        workloadScore: 60,
        emergencyEligible: true,
        contact: "+91 9811002207"
      },
      {
        _id: "staff_08",
        staffId: "N-09",
        name: "Nurse Marcus Vance",
        role: "Nurse",
        specialization: "Surgical Recovery",
        department: "Surgical",
        currentWard: "WARD-SURG",
        status: "ON_DUTY",
        shift: "Morning",
        workload: "HIGH",
        workloadScore: 72,
        emergencyEligible: false,
        contact: "+91 9811002208"
      },
      {
        _id: "staff_09",
        staffId: "TECH-01",
        name: "Karan Verma",
        role: "Technician",
        specialization: "Radiology & CT Tech",
        department: "Diagnostics",
        currentWard: "Diagnostics Wing",
        status: "ON_DUTY",
        shift: "Morning",
        workload: "HIGH",
        workloadScore: 84,
        emergencyEligible: true,
        contact: "+91 9811002209"
      }
    ];

    // 4. Equipment
    this.equipment = [
      {
        _id: "eq_01",
        equipmentId: "V-04",
        name: "Hamilton G5 Ventilator (V-04)",
        type: "Ventilator",
        model: "Hamilton Medical G5",
        status: "AVAILABLE",
        currentLocation: "Floor 2, ICU Central Corridor",
        assignedWard: "WARD-ICU",
        batteryLevel: 98,
        maintenanceStatus: "GOOD",
        lastPing: new Date().toISOString()
      },
      {
        _id: "eq_02",
        equipmentId: "V-01",
        name: "Dräger Evita V500 (V-01)",
        type: "Ventilator",
        model: "Dräger V500",
        status: "IN_USE",
        assignedPatient: "P-ICU-01",
        currentLocation: "Floor 2, Room 201",
        assignedWard: "WARD-ICU",
        batteryLevel: 85,
        maintenanceStatus: "GOOD",
        lastPing: new Date().toISOString()
      },
      {
        _id: "eq_03",
        equipmentId: "ECG-02",
        name: "Philips PageWriter TC70 (ECG-02)",
        type: "ECG",
        model: "Philips TC70",
        status: "AVAILABLE",
        currentLocation: "Floor 1, ER Trauma Bay",
        assignedWard: "WARD-EMG",
        batteryLevel: 94,
        maintenanceStatus: "GOOD",
        lastPing: new Date().toISOString()
      },
      {
        _id: "eq_04",
        equipmentId: "DEFIB-01",
        name: "Zoll R Series Defibrillator",
        type: "Defibrillator",
        model: "Zoll R Series Plus",
        status: "AVAILABLE",
        currentLocation: "Floor 1, Emergency Crash Bay",
        assignedWard: "WARD-EMG",
        batteryLevel: 100,
        maintenanceStatus: "GOOD",
        lastPing: new Date().toISOString()
      },
      {
        _id: "eq_05",
        equipmentId: "INF-03",
        name: "Alaris Smart Pump Plus",
        type: "Infusion Pump",
        model: "BD Alaris 8015",
        status: "AVAILABLE",
        currentLocation: "Floor 2, ICU Clean Supply",
        assignedWard: "WARD-ICU",
        batteryLevel: 92,
        maintenanceStatus: "GOOD",
        lastPing: new Date().toISOString()
      }
    ];

    // 5. Operating Theatres (8 OT Suites)
    this.operatingTheatres = [
      {
        _id: "ot_01",
        otId: "OT-01",
        name: "OT Suite 1 (Cardiothoracic & Hybrid)",
        specialty: "Cardiovascular",
        status: "AVAILABLE",
        currentProcedure: null,
        equipment: ["Heart-Lung Bypass Machine", "Fluoroscopy C-Arm", "Anesthesia Workstation"],
        upcomingSchedule: [
          { surgeryType: "Elective Valve Repair", patientName: "Arthur King", surgeonName: "Dr. Sarah Johnson", scheduledTime: new Date(Date.now() + 4 * 3600000).toISOString(), durationMinutes: 180, priority: "SCHEDULED" }
        ]
      },
      {
        _id: "ot_02",
        otId: "OT-02",
        name: "OT Suite 2 (Emergency Trauma)",
        specialty: "Trauma & General",
        status: "AVAILABLE",
        currentProcedure: null,
        equipment: ["Rapid Blood Infuser", "Surgical Laparoscopy Tower", "Defibrillator"],
        upcomingSchedule: []
      },
      {
        _id: "ot_03",
        otId: "OT-03",
        name: "OT Suite 3 (Neuro & Spine)",
        specialty: "Neurosurgery",
        status: "OCCUPIED",
        currentProcedure: { surgeryType: "Craniotomy Decompression", patientName: "Robert Green", surgeonName: "Dr. Michael Chen", scheduledTime: new Date(Date.now() - 3600000).toISOString(), durationMinutes: 240, priority: "EMERGENCY" },
        equipment: ["Surgical Microscope", "Stealth Navigation", "Intra-op Monitoring"],
        upcomingSchedule: []
      },
      {
        _id: "ot_04",
        otId: "OT-04",
        name: "OT Suite 4 (Orthopedic Joint & Bone)",
        specialty: "Orthopedics",
        status: "OCCUPIED",
        currentProcedure: { surgeryType: "Total Knee Arthroplasty", patientName: "Evelyn Reed", surgeonName: "Dr. Rajesh Gupta", scheduledTime: new Date(Date.now() - 1800000).toISOString(), durationMinutes: 120, priority: "SCHEDULED" },
        equipment: ["Orthopedic Traction Table", "C-Arm", "Power Saws"],
        upcomingSchedule: []
      },
      { _id: "ot_05", otId: "OT-05", name: "OT Suite 5 (Laparoscopic Day Surgery)", specialty: "General", status: "AVAILABLE", equipment: ["4K Endoscopy Tower"], upcomingSchedule: [] },
      { _id: "ot_06", otId: "OT-06", name: "OT Suite 6 (Pediatric & Neonatal Surgery)", specialty: "Pediatrics", status: "AVAILABLE", equipment: ["Neonatal Warmer", "Micro Instruments"], upcomingSchedule: [] },
      { _id: "ot_07", otId: "OT-07", name: "OT Suite 7 (Urology & Laser)", specialty: "Urology", status: "CLEANING", equipment: ["Holmium Laser", "Urology Table"], upcomingSchedule: [] },
      { _id: "ot_08", otId: "OT-08", name: "OT Suite 8 (Ophthalmology & Plastics)", specialty: "Microsurgery", status: "AVAILABLE", equipment: ["Phacoemulsification Machine"], upcomingSchedule: [] }
    ];

    // 6. Diagnostics Suites
    this.diagnostics = [
      {
        _id: "diag_01",
        resourceId: "DIAG-XR-01",
        name: "Digital X-Ray Suite 1",
        type: "X-Ray",
        floor: 1,
        location: "Diagnostic Center, Room 102",
        currentQueue: 7,
        avgWaitMinutes: 38,
        status: "ONLINE",
        bottleneckScore: 82,
        throughputPerHour: 6
      },
      {
        _id: "diag_02",
        resourceId: "DIAG-XR-02",
        name: "Digital X-Ray Suite 2 (Fast-Track)",
        type: "X-Ray",
        floor: 1,
        location: "Diagnostic Center, Room 104",
        currentQueue: 1,
        avgWaitMinutes: 6,
        status: "ONLINE",
        bottleneckScore: 15,
        throughputPerHour: 8
      },
      {
        _id: "diag_03",
        resourceId: "DIAG-CT-01",
        name: "Siemens 128-Slice CT Scanner",
        type: "CT",
        floor: 1,
        location: "Diagnostic Center, Room 110",
        currentQueue: 4,
        avgWaitMinutes: 24,
        status: "ONLINE",
        bottleneckScore: 60,
        throughputPerHour: 4
      },
      {
        _id: "diag_04",
        resourceId: "DIAG-MRI-01",
        name: "3.0T High-Field MRI Scanner",
        type: "MRI",
        floor: 1,
        location: "Diagnostic Center, Suite B",
        currentQueue: 3,
        avgWaitMinutes: 45,
        status: "ONLINE",
        bottleneckScore: 55,
        throughputPerHour: 2
      },
      {
        _id: "diag_05",
        resourceId: "DIAG-US-01",
        name: "Ultrasound & Doppler Unit",
        type: "Ultrasound",
        floor: 1,
        location: "Diagnostic Center, Room 108",
        currentQueue: 2,
        avgWaitMinutes: 12,
        status: "ONLINE",
        bottleneckScore: 25,
        throughputPerHour: 5
      }
    ];

    // 7. RTLS 2D Floorplan Locations
    this.rtlsLocations = [
      { resourceId: "DOC-01", name: "Dr. Sarah Johnson", type: "STAFF", role: "Cardiologist", floor: 1, zone: "Emergency Wing", x: 28, y: 42, icon: "doctor", status: "READY" },
      { resourceId: "N-07", name: "Nurse Sarah Jenkins (N-07)", type: "STAFF", role: "Critical Care Nurse", floor: 2, zone: "ICU Pod A", x: 64, y: 35, icon: "nurse", status: "READY" },
      { resourceId: "V-04", name: "Ventilator V-04", type: "EQUIPMENT", role: "Life-Support", floor: 2, zone: "ICU Hallway Corridor", x: 58, y: 48, icon: "ventilator", status: "AVAILABLE" },
      { resourceId: "ECG-02", name: "ECG-02", type: "EQUIPMENT", role: "Diagnostics", floor: 1, zone: "ER Bay 3", x: 34, y: 55, icon: "ecg", status: "AVAILABLE" },
      { resourceId: "P-104", name: "Patient P-104", type: "PATIENT", role: "Critical Cardiac", floor: 1, zone: "ER Triage Receiving", x: 18, y: 62, icon: "patient", status: "CODE_RED" },
      { resourceId: "ICU-05", name: "Bed ICU-05", type: "BED", role: "Isolation Resuscitation Bay", floor: 2, zone: "ICU Pod 3", x: 72, y: 38, icon: "bed", status: "AVAILABLE" },
      { resourceId: "ICU-08", name: "Bed ICU-08", type: "BED", role: "ICU Bed", floor: 2, zone: "ICU Pod 4", x: 78, y: 52, icon: "bed", status: "AVAILABLE" }
    ];

    // 8. Forecasts
    this.forecasts = [
      { department: "Emergency", timeWindow: "Current", currentLoad: 24, predictedLoad: 24, confidence: 96, riskLevel: "MEDIUM", recommendedActions: ["Maintain 3 ER triage bays active", "Keep standby rapid ECG ready"] },
      { department: "Emergency", timeWindow: "1 Hour", currentLoad: 24, predictedLoad: 31, confidence: 93, riskLevel: "HIGH", recommendedActions: ["Pre-alert on-call emergency physician", "Stage 2 transport stretchers at triage"] },
      { department: "Emergency", timeWindow: "2 Hours", currentLoad: 24, predictedLoad: 39, confidence: 89, riskLevel: "CRITICAL", recommendedActions: ["Activate overflow protocol", "Redirect non-urgent OPD cases to Clinic B", "Deploy 2 nurses from General Ward"] },
      { department: "Emergency", timeWindow: "4 Hours", currentLoad: 24, predictedLoad: 52, confidence: 84, riskLevel: "CRITICAL", recommendedActions: ["Enact surge staffing plan", "Expedite bed turnaround in General Ward A", "Coordinate standby ventilators with ICU"] },
      { department: "ICU", timeWindow: "Current", currentLoad: 8, predictedLoad: 8, confidence: 95, riskLevel: "HIGH", recommendedActions: ["ICU occupancy at 80% capacity. Screen potential step-down transfers."] },
      { department: "ICU", timeWindow: "2 Hours", currentLoad: 8, predictedLoad: 10, confidence: 91, riskLevel: "CRITICAL", recommendedActions: ["Projected 100% ICU capacity. Expedite step-down transfer for P-ICU-02 to Surgical Recovery.", "Reserve ICU-05 for emergent cardiac admission."] },
      { department: "Diagnostics", timeWindow: "Current", currentLoad: 17, predictedLoad: 17, confidence: 94, riskLevel: "MEDIUM", recommendedActions: ["Route outpatient X-rays to Suite 2 to balance Suite 1 queue."] },
      { department: "Diagnostics", timeWindow: "2 Hours", currentLoad: 17, predictedLoad: 27, confidence: 88, riskLevel: "HIGH", recommendedActions: ["Activate secondary CT scanner technician", "Prioritize emergency ultrasound"] }
    ];

    // 9. Initial Alerts
    this.alerts = [
      { alertId: "ALT-100", type: "EMERGENCY", severity: "CRITICAL", recipientRole: "ALL", message: "🚨 CODE RED: Critical Patient P-104 (Acute STEMI) allocated to Bed ICU-05 under Dr. Sarah Johnson. Mobilization verified (42s).", status: "UNREAD", createdAt: new Date(Date.now() - 300000).toISOString() },
      { alertId: "ALT-101", type: "BOTTLENECK", severity: "HIGH", recipientRole: "OPERATIONS", message: "Diagnostics: Digital X-Ray Suite 1 queue length exceeded 7 patients (38 min wait). Automated load-balancing recommended.", status: "UNREAD", createdAt: new Date().toISOString() },
      { alertId: "ALT-102", type: "BED_SHORTAGE", severity: "CRITICAL", recipientRole: "ADMIN", message: "ICU Capacity Warning: Only 2 ICU beds remaining. Predictive model forecasts +2 admissions within 120 minutes.", status: "UNREAD", createdAt: new Date().toISOString() },
      { alertId: "ALT-103", type: "STAFF_OVERLOAD", severity: "MEDIUM", recipientRole: "DOCTOR", message: "Staff Workload Warning: Dr. Rajesh Gupta workload score is at 78% (HIGH). Shift rotation in 90 min.", status: "UNREAD", createdAt: new Date().toISOString() }
    ];

    this.emergencies = [
      {
        emergencyId: "EMG-882104",
        patientId: "P-104",
        patientName: "Arjun Verma (Acute STEMI)",
        severity: "CRITICAL",
        vitals: { heartRate: 142, spO2: 82, bp: "85/55", temperature: 99.2, respiratoryRate: 28 },
        requiredResources: ["ICU Bed", "Cardiologist", "Nurse", "Ventilator", "ECG"],
        status: "ACTIVE",
        assignedResources: {
          bedId: "ICU-05",
          doctorId: "DOC-01",
          doctorName: "Dr. Sarah Johnson",
          nurseId: "N-07",
          nurseName: "Nurse Sarah Jenkins (N-07)",
          equipmentIds: ["V-04", "ECG-02"]
        },
        escalationLevel: 2,
        responseTime: 42,
        createdAt: new Date(Date.now() - 300000).toISOString(),
        auditTrail: [
          { timestamp: new Date(Date.now() - 300000).toISOString(), action: "Triage Alert Received", details: "Patient P-104 registered with SpO2: 82%, HR: 142 bpm (Critical STEMI).", actor: "Emergency Triage" },
          { timestamp: new Date(Date.now() - 280000).toISOString(), action: "Severity Classified", details: "Acuity evaluated as CRITICAL - Code Red protocol initiated.", actor: "Nexus AI Engine" },
          { timestamp: new Date(Date.now() - 250000).toISOString(), action: "Multi-Criteria Allocation", details: "Bed ICU-05, Dr. Sarah Johnson & Life Support V-04 allocated (Match score 94/100).", actor: "Nexus Orchestration Engine" },
          { timestamp: new Date(Date.now() - 210000).toISOString(), action: "Mobilization Dispatched", details: "Mobile alert dispatched to Cardiac Rapid Response Team.", actor: "Dispatch Subsystem" }
        ]
      }
    ];
    this.assignments = [];
    this.patients = [];
  }
}

export const nexusStore = new NexusStore();
