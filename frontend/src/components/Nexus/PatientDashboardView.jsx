// frontend/src/components/Nexus/PatientDashboardView.jsx
import React, { useState, useEffect } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Award,
  Bed,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  CreditCard,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Heart,
  HeartPulse,
  HelpCircle,
  Info,
  Layers,
  MapPin,
  Microscope,
  Phone,
  PhoneCall,
  Pill,
  QrCode,
  Radio,
  RefreshCw,
  Search,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Truck,
  User,
  UserCheck,
  Zap
} from "lucide-react";
import { nexusApi } from "./nexusApi";
import { generatePrescriptionPdf } from "../../utils/prescriptionPdfGenerator";

export default function PatientDashboardView({ activeTab = "patient-dashboard", setActiveTab }) {
  // 1. Authoritative Patient Profile Data (Harsh Tripathi, P-101)
  const [patientData, setPatientData] = useState({
    patientId: "P-101",
    journeyId: "JRN-2026-9041",
    name: "Harsh Tripathi",
    age: 34,
    gender: "Male",
    bloodGroup: "O+",
    contact: "+91 98765 43210",
    email: "harsh.tripathi@email.com",
    address: "Flat 402, Green Glen Heights, Outer Ring Road, Bangalore - 560103",
    insurancePolicy: "Star Health Comprehensive (Policy #SH-8821-X9)",
    insuranceStatus: "VERIFIED & PRE-APPROVED",
    schemeEligibility: "PM-JAY Ayushman Bharat Eligible",
    abhaId: "91-8273-4412-9901",
    abhaAddress: "harsh.tripathi@abdm",
    aadhaarStatus: "Linked & Verified (XXXX-8921)",
    emergencyContact: {
      name: "Sunita Tripathi",
      relation: "Spouse",
      phone: "+91 98765 43211",
      accessLevel: "Full Proxy & Attendant Access"
    },
    criticalAlerts: [
      { id: "A1", type: "ALLERGY", title: "Penicillin Allergy", severity: "HIGH", note: "Risk of anaphylaxis. Contraindicated in all prescriptions." },
      { id: "A2", type: "CONDITION", title: "Mild Essential Hypertension", severity: "LOW", note: "Controlled with lifestyle & low-dose Metoprolol." }
    ]
  });

  // 2. Active Queue & Token Telemetry
  const [queueState, setQueueState] = useState({
    tokenNumber: "#04",
    status: "WAITING",
    doctorName: "Dr. Sarah Johnson",
    specialty: "Interventional Cardiology",
    cabinNumber: "OPD Cabin 102 (Floor 1, West Wing)",
    patientsAhead: 2,
    currentServingToken: "#02",
    avgConsultationMinutes: 9,
    doctorDelayMinutes: 0,
    doctorStatus: "IN_CONSULTATION",
    appointmentTime: "11:00 AM",
    suggestedArrival: "10:45 AM (Checked In)"
  });

  // 3. Live Health Vitals
  const [vitals, setVitals] = useState({
    bp: "120/80 mmHg",
    pulse: "72 bpm",
    spo2: "98%",
    temp: "98.6 °F",
    glucose: "95 mg/dL",
    measuredAt: "Today, 10:48 AM by Nurse Sarah Jenkins (N-07)"
  });

  // 4. Modals & Interactive States
  const [activeEmergency, setActiveEmergency] = useState(false);
  const [emergencyResult, setEmergencyResult] = useState(null);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [helpResponse, setHelpResponse] = useState(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [journeyFilter, setJourneyFilter] = useState("all");
  const [selectedJourneyStage, setSelectedJourneyStage] = useState(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // 5. Booking Form State
  const [bookingDept, setBookingDept] = useState("Cardiology");
  const [bookingDoctor, setBookingDoctor] = useState("Dr. Sarah Johnson");
  const [bookingSlot, setBookingSlot] = useState("11:00 AM");
  const [bookingDate, setBookingDate] = useState("2026-10-03");
  const [bookingType, setBookingType] = useState("In-Person");
  const [bookingReason, setBookingReason] = useState("Routine follow-up for mild chest tightness and reviewing recent ECG reports");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // 6. Persistent 8-Stage Journey Events
  const [journeyEvents, setJourneyEvents] = useState([
    {
      id: "STG-1",
      stage: "APPOINTMENT",
      title: "Appointment Confirmed",
      timestamp: "Today, 08:30 AM",
      actor: "Patient Care Portal",
      location: "Online Booking Engine",
      details: "Booked consultation with Dr. Sarah Johnson (Cardiology). Token #04 issued.",
      status: "COMPLETED",
      icon: Calendar,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200"
    },
    {
      id: "STG-2",
      stage: "ARRIVAL",
      title: "Hospital Smart Arrival",
      timestamp: "Today, 10:42 AM",
      actor: "Smart Kiosk (West Entrance)",
      location: "Main Lobby Kiosk #02",
      details: "Check-in verified via ABHA #91-8273-4412-9901. Patient status marked PRESENT.",
      status: "COMPLETED",
      icon: MapPin,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200"
    },
    {
      id: "STG-3",
      stage: "TRIAGE",
      title: "OPD Triage & Vitals Assessment",
      timestamp: "Today, 10:48 AM",
      actor: "Nurse Sarah Jenkins (N-07)",
      location: "Triage Bay 1 (OPD Lobby)",
      details: "Vitals recorded: BP 120/80 mmHg, SpO2 98%, Heart Rate 72 bpm. Patient stable.",
      status: "COMPLETED",
      icon: HeartPulse,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200"
    },
    {
      id: "STG-4",
      stage: "QUEUE",
      title: "OPD Live Queue Standby",
      timestamp: "Today, 11:00 AM",
      actor: "Nexus Queue Engine",
      location: "OPD Waiting Lounge B",
      details: "Token #04 waiting. Position #2 ahead in line. Real-time calculated ETA: ~18 mins.",
      status: "IN_PROGRESS",
      icon: Clock,
      color: "text-blue-600 bg-blue-50 border-blue-200"
    },
    {
      id: "STG-5",
      stage: "CONSULTATION",
      title: "Clinical Consultation",
      timestamp: "Estimated 11:18 AM",
      actor: "Dr. Sarah Johnson",
      location: "Cabin 102 (Floor 1)",
      details: "Comprehensive cardiac assessment, symptomatic review, and ECG evaluation.",
      status: "PENDING",
      icon: Stethoscope,
      color: "text-slate-400 bg-slate-50 border-slate-200"
    },
    {
      id: "STG-6",
      stage: "DIAGNOSTICS",
      title: "Diagnostic Imaging (ECG & Echo)",
      timestamp: "Scheduled 11:45 AM",
      actor: "Radiology & Cardiology Diagnostics",
      location: "Imaging Suite 2 (Ground Floor)",
      details: "12-Lead Resting Electrocardiogram & 2D Transthoracic Echocardiogram.",
      status: "PENDING",
      icon: Microscope,
      color: "text-slate-400 bg-slate-50 border-slate-200"
    },
    {
      id: "STG-7",
      stage: "PHARMACY",
      title: "Pharmacy Medication Dispense",
      timestamp: "Estimated 12:15 PM",
      actor: "Central Inpatient/Outpatient Dispensary",
      location: "Pharmacy Counter 3",
      details: "Digital e-Prescription fulfillment and drug allergy safety check.",
      status: "PENDING",
      icon: Pill,
      color: "text-slate-400 bg-slate-50 border-slate-200"
    },
    {
      id: "STG-8",
      stage: "FOLLOWUP",
      title: "Automated Care Follow-up",
      timestamp: "Scheduled in 14 Days",
      actor: "Nexus Care Continuum AI",
      location: "Remote Patient Monitoring Portal",
      details: "Digital health check survey and teleconsultation reminder.",
      status: "PENDING",
      icon: Award,
      color: "text-slate-400 bg-slate-50 border-slate-200"
    }
  ]);

  // ETA Calculation
  const calculateEtaMinutes = () => {
    if (queueState.patientsAhead === 0) return "< 3 mins";
    const totalMinutes = queueState.patientsAhead * queueState.avgConsultationMinutes + (queueState.doctorDelayMinutes || 0);
    return `~${totalMinutes} mins`;
  };

  // Emergency SOS Trigger
  const handleTriggerEmergency = async () => {
    setActiveEmergency(true);
    try {
      const res = await nexusApi.triggerEmergency({
        patientId: patientData.patientId,
        patientName: patientData.name,
        severity: "CRITICAL",
        location: "OPD Waiting Lobby B, 1st Floor",
        symptoms: "Sudden severe retrosternal chest pain radiating to left jaw, diaphoresis, dyspnea"
      });
      setEmergencyResult(res);

      setJourneyEvents(prev => [
        {
          id: "STG-EMG",
          stage: "EMERGENCY",
          title: "🚨 Emergency Code Red Initiated",
          timestamp: new Date().toLocaleTimeString(),
          actor: "Nexus Emergency Orchestrator",
          location: "ER Resuscitation Bay 03",
          details: `Autonomous allocation: Resuscitation Bay 03 reserved. Dr. Vikram Hegde and RRT-02 dispatched. Crash cart synced.`,
          status: "CRITICAL",
          icon: Zap,
          color: "text-red-700 bg-red-50 border-red-300"
        },
        ...prev
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  // Prescription PDF Download Handler
  const handleDownloadPrescription = () => {
    try {
      generatePrescriptionPdf({
        patientId: patientData.patientId,
        patientName: patientData.name,
        rxId: "RX-2026-8812",
        visitId: "VST-2026-8812",
        doctorName: "Dr. Sarah Johnson",
        date: new Date().toLocaleDateString("en-GB")
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (e) {
      console.error("PDF generation failed:", e);
    }
  };

  // Smart Guidance AI
  const handleSmartGuidance = (topic) => {
    let result = null;
    switch (topic) {
      case "mri":
        result = {
          title: "MRI & Diagnostic Imaging Guidance",
          department: "Department of Radiodiagnosis & Imaging (Basement Suite B)",
          action: "Direct routing to 128-Slice CT/MRI Counter 4",
          status: "Active Queue: 3 patients ahead (~18 min wait). Pre-registration ready.",
          note: "Please inform technicians if you have metallic implants, pacemakers, or claustrophobia."
        };
        break;
      case "chest-pain":
        result = {
          title: "Acute Chest Pain / Cardiac Evaluation",
          department: "Emergency Triage Care & Cardiac Resuscitation Bay",
          action: "IMMEDIATE FAST-TRACK: Walk directly into ER Bay 1.",
          status: "Dr. Sarah Johnson on standby. STAT ECG machine pre-calibrated.",
          note: "Do not wait in OPD line. Emergency triage nurses will attend immediately."
        };
        break;
      case "queue-token":
        result = {
          title: "Your OPD Queue Status",
          department: queueState.specialty,
          action: `Your token is ${queueState.tokenNumber}. You are in ${queueState.cabinNumber}.`,
          status: `There are ${queueState.patientsAhead} patients ahead. Estimated wait: ${calculateEtaMinutes()}.`,
          note: "Please remain in Waiting Lounge B outside Cabin 102."
        };
        break;
      case "insurance":
        result = {
          title: "Cashless Insurance & Scheme Discovery",
          department: "TPA & Ayushman Bharat Helpdesk (Floor 1, Room 108)",
          action: "Your policy Star Health Comprehensive is 100% Pre-Approved.",
          status: "PM-JAY Scheme Golden Card verified on portal.",
          note: "Show your ABHA ID #91-8273-4412-9901 for 100% cashless claims processing."
        };
        break;
      default:
        result = {
          title: "Central Patient Care Concierge",
          department: "Main Atrium Concierge Desk (Ground Floor)",
          action: "Approach Counter 1 or speak to our AI Voice Concierge.",
          status: "Open 24/7 with multi-lingual patient support.",
          note: "Wheelchair assistance and transport orderlies are available at West Entrance."
        };
    }
    setHelpResponse(result);
  };

  // Appointment Submission
  const handleConfirmBooking = (e) => {
    e.preventDefault();
    setBookingConfirmed(true);
    setTimeout(() => {
      setBookingConfirmed(false);
      if (setActiveTab) setActiveTab("visit-center");
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Patient Identity Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-2xl p-5 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-black text-xl shadow-inner">
            HT
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-black text-white tracking-tight">{patientData.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Patient ID: {patientData.patientId}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Blood: {patientData.bloodGroup}
              </span>
            </div>
            <div className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-3">
              <span>Age: {patientData.age} Y / Male</span>
              <span>•</span>
              <span className="text-cyan-400 font-mono font-semibold">ABHA: {patientData.abhaId}</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">{patientData.insuranceStatus}</span>
            </div>
          </div>
        </div>

        {/* Quick Help & SOS Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setHelpModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>I Don't Know — Help Me</span>
          </button>

          <button
            onClick={() => setQrModalOpen(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            title="View Patient QR Token"
          >
            <QrCode className="w-4 h-4" />
          </button>

          <button
            onClick={handleTriggerEmergency}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-red-900/30 animate-pulse"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>SOS EMERGENCY</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. SECTION: PATIENT DASHBOARD                            */}
      {/* ======================================================== */}
      {activeTab === "patient-dashboard" && (
        <div className="space-y-6">
          {/* Active OPD Token Hero Card & Live Vitals */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Live OPD Queue & Waiting Time Engine */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
                    <Clock className="w-5 h-5 text-cyan-700" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Live OPD Consultation Queue</h3>
                    <p className="text-xs text-slate-500">Autonomous Queue & Waiting Time Intelligence</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse">
                  🟢 {queueState.status}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[11px] font-bold uppercase text-slate-500">Your Active Token</div>
                  <div className="text-4xl font-black text-cyan-600 mt-1">{queueState.tokenNumber}</div>
                  <div className="text-[11px] text-slate-500 mt-1 font-medium">{queueState.cabinNumber}</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[11px] font-bold uppercase text-slate-500">Patients Ahead</div>
                  <div className="text-4xl font-black text-slate-800 mt-1">{queueState.patientsAhead}</div>
                  <div className="text-[11px] text-slate-500 mt-1 font-medium">Now in Cabin: Token {queueState.currentServingToken}</div>
                </div>

                <div className="p-4 rounded-xl bg-cyan-50/60 border border-cyan-200">
                  <div className="text-[11px] font-bold uppercase text-cyan-800">Real-Time Calculated Wait</div>
                  <div className="text-4xl font-black text-cyan-700 mt-1">{calculateEtaMinutes()}</div>
                  <div className="text-[11px] text-cyan-700 mt-1 font-medium">9 min avg / consult</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-2">
                  <span>Queue Flow: Token #01 (Completed)</span>
                  <span>Token #02 (In Cabin)</span>
                  <span className="font-bold text-cyan-700">Token #04 (You)</span>
                </div>
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 w-3/5 rounded-full" />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>Attending Doctor: <strong>{queueState.doctorName}</strong> ({queueState.specialty})</span>
                  <span className="text-emerald-700 font-semibold">Doctor Status: On Schedule</span>
                </div>
              </div>
            </div>

            {/* Right Col: Live Patient Health Vitals */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-rose-500" />
                  <h3 className="font-extrabold text-slate-900 text-sm">Live Vitals Telemetry</h3>
                </div>
                <span className="text-[10px] text-slate-400">10:48 AM</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-slate-500 text-[10px] font-bold uppercase">Blood Pressure</div>
                  <div className="text-base font-black text-slate-900 mt-0.5">{vitals.bp}</div>
                  <span className="text-[10px] text-emerald-600 font-semibold">Normal Range</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-slate-500 text-[10px] font-bold uppercase">Pulse Rate</div>
                  <div className="text-base font-black text-slate-900 mt-0.5">{vitals.pulse}</div>
                  <span className="text-[10px] text-emerald-600 font-semibold">Sinus Rhythm</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-slate-500 text-[10px] font-bold uppercase">Oxygen SpO2</div>
                  <div className="text-base font-black text-slate-900 mt-0.5">{vitals.spo2}</div>
                  <span className="text-[10px] text-emerald-600 font-semibold">Optimal</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-slate-500 text-[10px] font-bold uppercase">Body Temp</div>
                  <div className="text-base font-black text-slate-900 mt-0.5">{vitals.temp}</div>
                  <span className="text-[10px] text-emerald-600 font-semibold">Apyrexial</span>
                </div>
              </div>

              {/* Critical Alert Warning */}
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs">
                <div className="font-black text-red-900 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Clinical Allergy Flag</span>
                </div>
                <p className="text-red-700 text-[11px] mt-1">
                  <strong>Penicillin Allergy:</strong> High anaphylaxis risk. Red-flagged on digital EHR and pharmacy dispensary.
                </p>
              </div>

              <div className="text-[11px] text-slate-400 text-center">
                Vitals logged by Nurse Sarah Jenkins (N-07)
              </div>
            </div>
          </div>

          {/* Active Visit Card & Recent Prescriptions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Visit */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-extrabold text-slate-900 text-sm">Active Hospital Visit: VST-2026-8812</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                  OPD CARDIOLOGY
                </span>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-500">Attending Specialist:</span>
                  <span className="font-bold text-slate-900">Dr. Sarah Johnson (Cardiology)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-500">Cabin Location:</span>
                  <span className="font-bold text-slate-900">Floor 1, West Wing, Cabin 102</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-500">Check-in Timestamp:</span>
                  <span className="font-bold text-slate-900">Today, 10:42 AM (Smart Kiosk QR)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-500">Scheduled Investigations:</span>
                  <span className="font-bold text-cyan-700">12-Lead ECG & 2D Echo (Ground Floor)</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Cashless Insurance Status:</span>
                  <span className="font-bold text-emerald-600">Pre-Approved (Star Health #SH-8821)</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => setActiveTab && setActiveTab("visit-center")}
                  className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition text-center cursor-pointer"
                >
                  Open Unified Visit Center →
                </button>
              </div>
            </div>

            {/* Prescriptions & Medications */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Pill className="w-5 h-5 text-teal-600" />
                  <h3 className="font-extrabold text-slate-900 text-sm">Active Medications & e-Prescriptions</h3>
                </div>
                <span className="text-xs text-slate-400">2 Active</span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Atorvastatin 20mg</div>
                    <div className="text-[11px] text-slate-500">1 Tablet Once Daily at Bedtime · Lipid Management</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Ongoing
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Metoprolol Succinate 25mg</div>
                    <div className="text-[11px] text-slate-500">1 Tablet Daily Morning · Blood Pressure Control</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Ongoing
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={handleDownloadPrescription}
                  className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Prescription PDF</span>
                </button>
                <button
                  onClick={() => setActiveTab && setActiveTab("health-records")}
                  className="text-xs text-cyan-700 font-bold hover:underline cursor-pointer"
                >
                  View Health Records →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. SECTION: UNIFIED VISIT CENTER                         */}
      {/* ======================================================== */}
      {activeTab === "visit-center" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Unified Patient Visit Center</h3>
                <p className="text-xs text-slate-500">Comprehensive timeline of OPD, Inpatient, and Diagnostic Visits</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-100 text-cyan-800">
                Active Visit: VST-2026-8812
              </span>
            </div>

            {/* Current In-Hospital Active Visit */}
            <div className="mt-6 p-5 rounded-2xl bg-cyan-50/50 border border-cyan-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-cyan-900 tracking-wider flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-cyan-600 animate-pulse" />
                  Live In-Hospital Visit (Today)
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  Checked In (Token #04)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Visit ID</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">VST-2026-8812</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Department</span>
                  <span className="font-bold text-slate-900 text-sm">Cardiology OPD</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Attending Physician</span>
                  <span className="font-bold text-slate-900 text-sm">Dr. Sarah Johnson</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase font-bold block">Cabin & Floor</span>
                  <span className="font-bold text-cyan-700 text-sm">Cabin 102 · Floor 1</span>
                </div>
              </div>

              {/* Wayfinding directions */}
              <div className="p-3 bg-white rounded-xl border border-cyan-200 text-xs flex items-center gap-3">
                <MapPin className="w-5 h-5 text-cyan-600 shrink-0" />
                <div>
                  <strong className="text-slate-900">Wayfinding Directions:</strong> Take Elevator 2 to 1st Floor → Turn Left into Corridor B → Cabin 102 is immediately on your right (Opposite Waiting Lounge B).
                </div>
              </div>

              {/* Visit Progress Milestones */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 text-center text-xs">
                <div className="p-2.5 bg-emerald-100 text-emerald-900 rounded-xl font-bold border border-emerald-200">
                  ✓ Kiosk Check-In
                  <div className="text-[10px] font-normal text-emerald-700">10:42 AM</div>
                </div>
                <div className="p-2.5 bg-emerald-100 text-emerald-900 rounded-xl font-bold border border-emerald-200">
                  ✓ Triage Vitals
                  <div className="text-[10px] font-normal text-emerald-700">10:48 AM</div>
                </div>
                <div className="p-2.5 bg-cyan-100 text-cyan-900 rounded-xl font-bold border border-cyan-200 animate-pulse">
                  ⏳ Consultation
                  <div className="text-[10px] font-normal text-cyan-700">Token #04</div>
                </div>
                <div className="p-2.5 bg-white text-slate-400 rounded-xl font-bold border border-slate-200">
                  ○ Diagnostics
                  <div className="text-[10px] font-normal text-slate-400">Scheduled</div>
                </div>
                <div className="p-2.5 bg-white text-slate-400 rounded-xl font-bold border border-slate-200">
                  ○ Pharmacy
                  <div className="text-[10px] font-normal text-slate-400">Counter 3</div>
                </div>
              </div>
            </div>

            {/* Upcoming Visits */}
            <div className="mt-6 space-y-3">
              <h4 className="text-sm font-extrabold text-slate-900">Upcoming Scheduled Appointments</h4>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-slate-900 text-sm">Post-Treatment Cardiology Review (VST-2026-8950)</div>
                  <div className="text-slate-500 mt-0.5">14 Oct 2026 at 10:30 AM · Dr. Sarah Johnson · Cabin 102</div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 self-start sm:self-auto">
                  Confirmed
                </span>
              </div>
            </div>

            {/* Historic Visits */}
            <div className="mt-6 space-y-3">
              <h4 className="text-sm font-extrabold text-slate-900">Past Completed Hospital Encounters</h4>
              <div className="space-y-2">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs hover:border-slate-300 transition">
                  <div>
                    <div className="font-bold text-slate-900">Annual Routine Cardiac Evaluation (VST-2026-7041)</div>
                    <div className="text-slate-500">15 Aug 2026 · Dr. Sarah Johnson · Status: COMPLETED</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold flex items-center gap-1 cursor-pointer">
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs hover:border-slate-300 transition">
                  <div>
                    <div className="font-bold text-slate-900">Dermatology Skin Allergy Review (VST-2025-4190)</div>
                    <div className="text-slate-500">03 Dec 2025 · Dr. Aniket Roy · Status: COMPLETED</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold flex items-center gap-1 cursor-pointer">
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. SECTION: PATIENT REGISTRATION & ABHA PROFILE          */}
      {/* ======================================================== */}
      {activeTab === "patient-registration" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ABHA Digital Card */}
            <div className="bg-gradient-to-br from-teal-800 to-cyan-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[300px]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] tracking-widest uppercase font-bold text-cyan-300">National Health Authority</div>
                  <div className="text-lg font-black tracking-tight">ABHA Health ID</div>
                </div>
                <QrCode className="w-10 h-10 text-cyan-200" />
              </div>

              <div className="my-4">
                <div className="text-xs text-cyan-200">ABHA Number</div>
                <div className="text-xl font-mono font-black tracking-wider text-white">{patientData.abhaId}</div>
                <div className="text-xs text-cyan-300 mt-1 font-mono">{patientData.abhaAddress}</div>
              </div>

              <div className="pt-3 border-t border-cyan-700/60 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">{patientData.name}</div>
                  <div className="text-[10px] text-cyan-200">{patientData.gender} / {patientData.age} Y · Blood: {patientData.bloodGroup}</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-400 text-slate-950">
                  VERIFIED
                </span>
              </div>
            </div>

            {/* Demographics & Emergency Attendant Contact */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3">
                Patient Registration & Demographic Records
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-bold">Full Legal Name</label>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{patientData.name}</div>
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-bold">Registered Mobile</label>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{patientData.contact}</div>
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-bold">Primary Email</label>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{patientData.email}</div>
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-bold">Government ID Verification</label>
                  <div className="font-bold text-emerald-700 text-sm mt-0.5">Aadhaar Verified (XXXX-XXXX-8921)</div>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-slate-400 text-[10px] uppercase font-bold">Residential Address</label>
                  <div className="font-medium text-slate-700 text-xs mt-0.5">{patientData.address}</div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
                  <span>Authorized Next of Kin / Attendant</span>
                  <span className="text-emerald-700 font-semibold">{patientData.emergencyContact.accessLevel}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>Name: <strong>{patientData.emergencyContact.name}</strong></div>
                  <div>Relationship: <strong>{patientData.emergencyContact.relation}</strong></div>
                  <div>Phone: <strong>{patientData.emergencyContact.phone}</strong></div>
                </div>
              </div>

              {/* Consents & Data Sharing */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-emerald-900">
                    <strong>ABDM Digital Health Locker Sync:</strong> Active (6 diagnostic reports & prescriptions synced)
                  </span>
                </div>
                <button className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer">
                  Manage Consents
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. SECTION: BOOK APPOINTMENT                             */}
      {/* ======================================================== */}
      {activeTab === "book-appointment" && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 max-w-4xl mx-auto space-y-6">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900">Book OPD & Specialist Appointment</h3>
              <p className="text-xs text-slate-500">Autonomous Doctor Scheduling with Real-Time Token Generation</p>
            </div>
            <Calendar className="w-6 h-6 text-cyan-600" />
          </div>

          {bookingConfirmed && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-bounce">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Appointment successfully booked! Token #04 has been generated and synced with your Journey Timeline.</span>
            </div>
          )}

          <form onSubmit={handleConfirmBooking} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px] block mb-1">Select Specialty</label>
                <select
                  value={bookingDept}
                  onChange={(e) => setBookingDept(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="Cardiology">Cardiology (Heart & Vascular)</option>
                  <option value="Neurology">Neurology (Brain & Spine)</option>
                  <option value="Orthopedics">Orthopedics & Joint Care</option>
                  <option value="Pediatrics">Pediatrics & Neonatal</option>
                  <option value="General Medicine">General Internal Medicine</option>
                  <option value="Dermatology">Dermatology & Allergies</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px] block mb-1">Select Specialist Doctor</label>
                <select
                  value={bookingDoctor}
                  onChange={(e) => setBookingDoctor(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="Dr. Sarah Johnson">Dr. Sarah Johnson (Cardiology · Cabin 102 · ⭐ 4.9)</option>
                  <option value="Dr. Suresh Reddy">Dr. Suresh Reddy (Neurology · Cabin 103 · ⭐ 4.8)</option>
                  <option value="Dr. Vikram Hegde">Dr. Vikram Hegde (Emergency & Cardio · Cabin 105 · ⭐ 4.9)</option>
                  <option value="Dr. Aniket Roy">Dr. Aniket Roy (Dermatology · Cabin 104 · ⭐ 4.7)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px] block mb-1">Consultation Date</label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px] block mb-1">Available Time Slot</label>
                <select
                  value={bookingSlot}
                  onChange={(e) => setBookingSlot(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="09:30 AM">09:30 AM (Fast-Track Slot)</option>
                  <option value="11:00 AM">11:00 AM (Standard Slot - Selected)</option>
                  <option value="02:00 PM">02:00 PM (Afternoon Session)</option>
                  <option value="04:30 PM">04:30 PM (Evening Session)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px] block mb-1">Consultation Mode</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBookingType("In-Person")}
                    className={`flex-1 p-2.5 rounded-xl border text-center font-bold cursor-pointer ${
                      bookingType === "In-Person" ? "bg-cyan-50 border-cyan-500 text-cyan-900" : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    🏥 In-Person Visit
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingType("Video")}
                    className={`flex-1 p-2.5 rounded-xl border text-center font-bold cursor-pointer ${
                      bookingType === "Video" ? "bg-cyan-50 border-cyan-500 text-cyan-900" : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    💻 Video Teleconsult
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase text-[10px] block mb-1">Reason for Visit / Symptoms</label>
                <input
                  type="text"
                  value={bookingReason}
                  onChange={(e) => setBookingReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-slate-500 text-xs">
                Estimated Token: <strong>#04</strong> · Star Health Pre-Approved (₹0 Co-Pay)
              </span>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-black text-xs shadow-md transition cursor-pointer"
              >
                Confirm Appointment & Generate Token →
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. SECTION: JOURNEY TIMELINE                             */}
      {/* ======================================================== */}
      {activeTab === "journey-timeline" && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900">8-Stage Persistent Patient Journey</h3>
              <p className="text-xs text-slate-500">Continuous Longitudinal Healthcare Journey State Tracking</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-auto text-xs">
              {["all", "completed", "pending"].map((f) => (
                <button
                  key={f}
                  onClick={() => setJourneyFilter(f)}
                  className={`px-3 py-1 rounded-lg font-bold capitalize transition cursor-pointer ${
                    journeyFilter === f ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline Stream */}
          <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {journeyEvents
              .filter((ev) => {
                if (journeyFilter === "completed") return ev.status === "COMPLETED";
                if (journeyFilter === "pending") return ev.status === "PENDING" || ev.status === "IN_PROGRESS";
                return true;
              })
              .map((event, idx) => {
                const Icon = event.icon;
                const isSelected = selectedJourneyStage?.id === event.id;

                return (
                  <div
                    key={event.id}
                    onClick={() => setSelectedJourneyStage(event)}
                    className={`relative p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-cyan-50/70 border-cyan-400 shadow-md ring-1 ring-cyan-400/50"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs"
                    }`}
                  >
                    {/* Node Dot */}
                    <div
                      className={`absolute -left-[2.1rem] top-5 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white ${
                        event.status === "COMPLETED"
                          ? "border-emerald-500 text-emerald-600"
                          : event.status === "IN_PROGRESS"
                          ? "border-blue-500 text-blue-600 animate-pulse"
                          : "border-slate-300 text-slate-400"
                      }`}
                    >
                      <span className="text-[10px] font-black">{idx + 1}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl ${event.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm">{event.title}</h4>
                          <span className="text-[11px] text-slate-500">{event.location} • Actor: {event.actor}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-400 text-[11px]">{event.timestamp}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            event.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-800"
                              : event.status === "IN_PROGRESS"
                              ? "bg-blue-100 text-blue-800 animate-pulse"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {event.status}
                        </span>
                      </div>
                    </div>

                    <p className="mt-2 text-xs text-slate-600 leading-relaxed">{event.details}</p>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5B. SECTION: HEALTH RECORDS & DOCTOR PRESCRIPTIONS       */}
      {/* ======================================================== */}
      {activeTab === "health-records" && (
        <div className="space-y-6">
          {/* Top Banner with Download Action */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-teal-600">
                  <FileCheck className="w-4 h-4" />
                  <span>Verified Health Records · ABDM Compliant</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mt-1">Doctor Prescriptions & Clinical Records</h3>
                <p className="text-xs text-slate-500">Official digital e-prescriptions, diagnostic orders, and lab investigations</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPrescription}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-black text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Prescription PDF</span>
                </button>
              </div>
            </div>

            {/* Success toast alert */}
            {downloadSuccess && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-900 flex items-center gap-2 animate-bounce">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>✓ Prescription PDF "Medicare_Nexus_Prescription_Harsh_Tripathi_P101.pdf" downloaded successfully!</span>
              </div>
            )}

            {/* Doctor & Encounter Header */}
            <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Prescribing Specialist</span>
                <span className="font-bold text-slate-900 text-sm">Dr. Sarah Johnson</span>
                <div className="text-[11px] text-slate-500">MD, DM (Cardiology) · Reg #KMC-48291</div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Prescription ID</span>
                <span className="font-mono font-bold text-cyan-700 text-sm">RX-2026-8812</span>
                <div className="text-[11px] text-slate-500">Encounter: VST-2026-8812 (OPD)</div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Date of Prescription</span>
                <span className="font-bold text-slate-900 text-sm">Today (03 Oct 2026)</span>
                <div className="text-[11px] text-slate-500">Cabin 102 · Floor 1, West Wing</div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Dispensary Status</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-block mt-0.5">
                  🟢 Ready at Pharmacy Counter 3
                </span>
              </div>
            </div>

            {/* Clinical Diagnosis & Vitals Bar */}
            <div className="mt-4 p-3.5 bg-cyan-50/60 rounded-xl border border-cyan-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <strong className="text-cyan-950">Clinical Impression:</strong>{" "}
                <span className="text-slate-700">Essential Hypertension (Stage 1), Mild Dyslipidemia, Post-Triage Cardiovascular Screening</span>
              </div>
              <div className="font-mono text-cyan-800 text-[11px] shrink-0 font-semibold">
                Vitals: BP 120/80 | Pulse 72 | SpO2 98%
              </div>
            </div>

            {/* Prescribed Medicines Detailed Table */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <Pill className="w-4 h-4 text-teal-600" />
                  <span>Doctor Prescribed Medications (4 Active Formulations)</span>
                </h4>
                <span className="text-[11px] text-slate-500 font-semibold">Refills Allowed: 2</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                      <th className="py-2.5 px-3 font-bold rounded-l-lg">Medicine & Formulation</th>
                      <th className="py-2.5 px-3 font-bold">Dosage & Frequency</th>
                      <th className="py-2.5 px-3 font-bold">Timing / Instructions</th>
                      <th className="py-2.5 px-3 font-bold">Duration</th>
                      <th className="py-2.5 px-3 font-bold rounded-r-lg text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 text-sm">Tab. Atorvastatin Calcium 20mg</div>
                        <div className="text-[11px] text-slate-500">Lipid Lowering Statin · Oral Tablet</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-teal-700">1 Tablet (0-0-1)</span>
                        <div className="text-[11px] text-slate-500">Night at bedtime</div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        Take after food with water. Avoid grapefruit juice.
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        30 Days (30 Tab)
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Active
                        </span>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 text-sm">Tab. Metoprolol Succinate ER 25mg</div>
                        <div className="text-[11px] text-slate-500">Beta-Blocker Extended Release · Oral Tablet</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-teal-700">1 Tablet (1-0-0)</span>
                        <div className="text-[11px] text-slate-500">Morning after breakfast</div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        Blood pressure regulation. Monitor resting pulse rate.
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        30 Days (30 Tab)
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Active
                        </span>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 text-sm">Cap. Aspirin (Ecosprin) 75mg</div>
                        <div className="text-[11px] text-slate-500">Gastro-resistant Cardioprotective · Capsule</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-teal-700">1 Capsule (0-1-0)</span>
                        <div className="text-[11px] text-slate-500">Afternoon after lunch</div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        Antiplatelet therapy. Swallow whole with a full glass of water.
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        30 Days (30 Cap)
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Active
                        </span>
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 text-sm">Cap. Cholecalciferol (Vitamin D3) 60k IU</div>
                        <div className="text-[11px] text-slate-500">High-Potency Vitamin Supplement · Softgel</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-teal-700">1 Capsule Weekly</span>
                        <div className="text-[11px] text-slate-500">Sunday morning with milk</div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        Bone and cardiovascular metabolic support.
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        8 Weeks (8 Cap)
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Active
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Critical Allergy Warning */}
            <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-900 font-bold">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>Contraindicated Medicines: Penicillin, Amoxicillin, Ampicillin (Severe Anaphylaxis Risk).</span>
              </div>
              <span className="text-[10px] font-black uppercase text-red-700 bg-red-100 px-2 py-0.5 rounded">
                Safety Verified
              </span>
            </div>

            {/* Action Bar */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-500">
                Digitally signed by <strong>Dr. Sarah Johnson</strong> · MediCare Nexus Hospital EHR System
              </span>
              <button
                onClick={handleDownloadPrescription}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Download Official Prescription PDF</span>
              </button>
            </div>
          </div>

          {/* Diagnostic Reports & Lab Investigations with Downloads */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Microscope className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-900 text-base">Diagnostic Lab & Imaging Reports</h3>
              </div>
              <span className="text-xs text-slate-400">3 Reports Available</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Report #REP-ECG-9921</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">NORMAL</span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm mt-1">12-Lead Electrocardiogram (ECG)</h4>
                  <p className="text-xs text-slate-500 mt-1">Normal sinus rhythm, Heart Rate 72 bpm, normal PR and QTc intervals.</p>
                </div>
                <button
                  onClick={handleDownloadPrescription}
                  className="w-full py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Download ECG Report PDF</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Report #REP-LAB-4402</span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">BORDERLINE</span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm mt-1">Lipid Profile Blood Panel</h4>
                  <p className="text-xs text-slate-500 mt-1">Total Cholesterol: 188 mg/dL | LDL: 112 mg/dL | HDL: 48 mg/dL | Triglycerides: 140 mg/dL.</p>
                </div>
                <button
                  onClick={handleDownloadPrescription}
                  className="w-full py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Download Lab Report PDF</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Report #REP-ECHO-1204</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">NORMAL</span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm mt-1">2D Echocardiogram</h4>
                  <p className="text-xs text-slate-500 mt-1">LVEF: 62%, normal LV systolic function, no regional wall motion abnormality.</p>
                </div>
                <button
                  onClick={handleDownloadPrescription}
                  className="w-full py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Download Echo Report PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. SECTION: INSURANCE READINESS                          */}
      {/* ======================================================== */}
      {activeTab === "insurance-readiness" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Policy Card */}
            <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-teal-950 rounded-2xl p-6 text-white shadow-xl flex flex-col justify-between min-h-[300px]">
              <div>
                <div className="flex items-center justify-between">
                  <ShieldCheck className="w-8 h-8 text-emerald-400" />
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-400 text-slate-950">
                    CASHLESS PRE-APPROVED
                  </span>
                </div>
                <h3 className="text-lg font-black text-white mt-3">Star Health Comprehensive</h3>
                <p className="text-xs text-slate-300 font-mono">Policy #SH-8821-X9-2026</p>
              </div>

              <div className="my-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Total Sum Insured:</span>
                  <span className="font-bold text-white">₹ 5,00,000</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Available Balance:</span>
                  <span className="font-bold text-emerald-300">₹ 4,20,000</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Approved OPD Limit:</span>
                  <span className="font-bold text-cyan-300">₹ 45,000 (100% Cashless)</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>TPA: MediAssist (Ext 402)</span>
                <span className="text-white font-bold">Valid till: Dec 2027</span>
              </div>
            </div>

            {/* Scheme Discovery & Coverage Breakdown */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3">
                Healthcare Scheme Discovery & Pre-Authorization Status
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Ayushman Bharat PM-JAY</span>
                  </div>
                  <p className="text-slate-500 mt-1">Eligible for secondary and tertiary hospitalization coverage up to ₹ 5 Lakh per family.</p>
                  <span className="mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Golden Card Verified
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-cyan-600" />
                    <span>Current Visit Coverage</span>
                  </div>
                  <p className="text-slate-500 mt-1">OPD Consultation & Diagnostic ECG/Echo fully pre-authorized without out-of-pocket expenses.</p>
                  <span className="mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-100 text-cyan-800">
                    Estimated Co-Pay: ₹ 0
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap gap-2 text-xs">
                <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer">
                  <Download className="w-4 h-4" /> Download Pre-Authorization Letter
                </button>
                <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer">
                  <FileCheck className="w-4 h-4" /> Verify Hospital TPA Empanelment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 7. SECTION: EMERGENCY REQUEST                            */}
      {/* ======================================================== */}
      {activeTab === "emergency-request" && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-red-200 space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-red-100">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-bold animate-pulse">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-red-950">Immediate Emergency Care Request</h3>
                <p className="text-xs text-red-700">Autonomous Rapid Response Team & Emergency Bed Triage Dispatch</p>
              </div>
            </div>

            {/* Big SOS Trigger */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white text-center shadow-xl space-y-3">
              <AlertTriangle className="w-12 h-12 mx-auto text-white animate-bounce" />
              <h4 className="text-xl font-black">TRANSMIT CODE RED EMERGENCY ALERT</h4>
              <p className="text-xs text-red-100 max-w-md mx-auto">
                Pressing this button instantly alerts the Hospital Emergency Command Center, reserves a resuscitation bay, and dispatches the Rapid Response Team to your GPS location.
              </p>
              <button
                onClick={handleTriggerEmergency}
                className="mt-3 px-8 py-3.5 bg-white text-red-700 font-black text-sm rounded-xl hover:bg-red-50 shadow-2xl transition cursor-pointer uppercase tracking-wider"
              >
                🚨 ACTIVATE EMERGENCY TRIAGE NOW
              </button>
            </div>

            {/* Active Emergency Status Tracker */}
            {activeEmergency && (
              <div className="p-5 rounded-xl bg-red-50 border border-red-300 text-xs space-y-3 animate-scale-in">
                <div className="flex items-center justify-between font-black text-red-900 text-sm">
                  <span className="flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-red-600 animate-pulse" />
                    EMERGENCY ACTIVE: CODE RED
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-red-600 text-white text-xs">
                    RRT-02 EN ROUTE
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-white rounded-lg border border-red-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Reserved Bed</span>
                    <strong className="text-slate-900 text-sm">ER Bay 03 (Resuscitation)</strong>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-red-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Attending Physician</span>
                    <strong className="text-slate-900 text-sm">Dr. Vikram Hegde (ER)</strong>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-red-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Ambulance / Orderly ETA</span>
                    <strong className="text-red-700 text-sm font-black">3 Minutes</strong>
                  </div>
                </div>

                <div className="text-[11px] text-red-800">
                  📍 <strong>Reported Location:</strong> OPD Waiting Lobby B, 1st Floor (Near Elevator 2). Please remain seated with the patient.
                </div>
              </div>
            )}

            {/* Direct Hotlines */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div>
                <div className="font-bold text-slate-900">Hospital Emergency Hotline</div>
                <div className="text-slate-500">Direct line to Chief Medical Officer on duty</div>
              </div>
              <a
                href="tel:108"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-1.5"
              >
                <PhoneCall className="w-4 h-4 text-emerald-400" />
                <span>Call Emergency: 108 / Ext 100</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* "I Don't Know — Help Me" Guidance Modal */}
      {helpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-cyan-600" />
                <h3 className="font-extrabold text-slate-900 text-base">Patient Smart Guidance Assistant</h3>
              </div>
              <button
                onClick={() => setHelpModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Not sure where to go or what to do next? Select a topic below or let our AI guide your next step:
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleSmartGuidance("queue-token")}
                className="p-3 text-left rounded-xl border border-slate-200 hover:border-cyan-400 bg-slate-50 hover:bg-cyan-50/50 transition cursor-pointer font-bold text-slate-800"
              >
                🎟️ Where is my Cabin / Token?
              </button>
              <button
                onClick={() => handleSmartGuidance("chest-pain")}
                className="p-3 text-left rounded-xl border border-slate-200 hover:border-red-400 bg-slate-50 hover:bg-red-50/50 transition cursor-pointer font-bold text-slate-800"
              >
                ❤️ Acute Chest Pain / Urgent
              </button>
              <button
                onClick={() => handleSmartGuidance("mri")}
                className="p-3 text-left rounded-xl border border-slate-200 hover:border-cyan-400 bg-slate-50 hover:bg-cyan-50/50 transition cursor-pointer font-bold text-slate-800"
              >
                🔬 Where do I do my ECG / Echo?
              </button>
              <button
                onClick={() => handleSmartGuidance("insurance")}
                className="p-3 text-left rounded-xl border border-slate-200 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50/50 transition cursor-pointer font-bold text-slate-800"
              >
                🛡️ Cashless Insurance / PM-JAY
              </button>
            </div>

            {helpResponse && (
              <div className="p-4 rounded-xl bg-cyan-50/80 border border-cyan-200 text-xs space-y-1.5 animate-scale-in">
                <div className="font-extrabold text-cyan-950 text-sm">{helpResponse.title}</div>
                <div className="font-bold text-slate-900">{helpResponse.action}</div>
                <div className="text-slate-600">{helpResponse.status}</div>
                <div className="text-[11px] text-cyan-800 font-medium mt-1">📍 {helpResponse.note}</div>
              </div>
            )}

            <button
              onClick={() => setHelpModalOpen(false)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Done / Return to Portal
            </button>
          </div>
        </div>
      )}

      {/* QR Token Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xs w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4 animate-scale-in">
            <h3 className="font-black text-slate-900 text-base">Digital Token QR Code</h3>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block">
              <QrCode className="w-36 h-36 mx-auto text-slate-900" />
            </div>
            <div>
              <div className="text-2xl font-black text-cyan-700">TOKEN #04</div>
              <div className="text-xs text-slate-500 font-medium">Scan at Cabin 102 Reader or Kiosk</div>
            </div>
            <button
              onClick={() => setQrModalOpen(false)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
