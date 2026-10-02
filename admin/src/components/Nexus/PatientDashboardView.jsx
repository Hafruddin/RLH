// frontend/src/components/Nexus/PatientDashboardView.jsx
import React, { useState, useEffect } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bed,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  CreditCard,
  FileCheck,
  FileText,
  Heart,
  HeartPulse,
  HelpCircle,
  Info,
  MapPin,
  Microscope,
  Pill,
  Radio,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  TrendingUp,
  User,
  Zap
} from "lucide-react";
import { nexusApi } from "./nexusApi";

export default function PatientDashboardView() {
  const [patientData, setPatientData] = useState({
    patientId: "P-101",
    journeyId: "JRN-2026-9041",
    name: "Harsh Tripathi",
    age: 34,
    gender: "Male",
    bloodGroup: "O+",
    contact: "+91 98765 43210",
    insurancePolicy: "Star Health Premier (Policy #SH-8821-X9)",
    insuranceStatus: "VERIFIED & PRE-APPROVED",
    schemeEligibility: "PM-JAY Ayushman Bharat Eligible",
    abhaId: "91-8273-4412-9901"
  });

  const [queueState, setQueueState] = useState({
    tokenNumber: "#04",
    status: "WAITING",
    doctorName: "Dr. Sarah Johnson",
    specialty: "Interventional Cardiology",
    cabinNumber: "OPD Cabin 102 (Floor 1)",
    patientsAhead: 2,
    currentServingToken: "#02",
    avgConsultationMinutes: 9,
    doctorDelayMinutes: 0,
    doctorStatus: "IN_CONSULTATION",
    appointmentTime: "11:00 AM",
    suggestedArrival: "10:45 AM (15 min buffer)"
  });

  const [activeEmergency, setActiveEmergency] = useState(false);
  const [emergencyResult, setEmergencyResult] = useState(null);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [helpQuery, setHelpQuery] = useState("");
  const [helpResponse, setHelpResponse] = useState(null);
  const [journeyFilter, setJourneyFilter] = useState("all");

  // Persistent Journey Stages (Section 10)
  const [journeyEvents, setJourneyEvents] = useState([
    {
      stage: "APPOINTMENT",
      title: "Appointment Confirmed",
      timestamp: "Today, 08:30 AM",
      actor: "Patient Care Portal",
      details: "Booked with Dr. Sarah Johnson (Cardiology). Token #04 issued.",
      status: "COMPLETED",
      icon: Calendar,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200"
    },
    {
      stage: "ARRIVAL",
      title: "Hospital Smart Arrival",
      timestamp: "Today, 10:42 AM",
      actor: "Kiosk QR Scanner (West Gate)",
      details: "Check-in verified via ABHA #91-8273. Patient marked PRESENT in OPD Lobby.",
      status: "COMPLETED",
      icon: MapPin,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200"
    },
    {
      stage: "QUEUE",
      title: "OPD Live Queue Standby",
      timestamp: "Today, 10:45 AM",
      actor: "Nexus Queue Engine",
      details: "Position #2 ahead. Current Token in Cabin: #02. ETA calculated: ~18 mins.",
      status: "IN_PROGRESS",
      icon: Clock,
      color: "text-blue-600 bg-blue-50 border-blue-200"
    },
    {
      stage: "CONSULTATION",
      title: "Clinical Consultation",
      timestamp: "Estimated 11:03 AM",
      actor: "Dr. Sarah Johnson",
      details: "Pending doctor call next. Cabin 102 ready.",
      status: "PENDING",
      icon: Stethoscope,
      color: "text-slate-400 bg-slate-50 border-slate-200"
    },
    {
      stage: "DIAGNOSTICS",
      title: "Diagnostics & Imaging",
      timestamp: "Scheduled Post-Consult",
      actor: "Radiology & Pathology Suite",
      details: "Pre-requisite orders: 12-Lead ECG & High-Sensitivity Troponin-I test.",
      status: "PENDING",
      icon: Microscope,
      color: "text-slate-400 bg-slate-50 border-slate-200"
    },
    {
      stage: "ADMISSION",
      title: "Inpatient Bed Admission",
      timestamp: "Contingent on Assessment",
      actor: "Nexus Bed Orchestrator",
      details: "Telemetry and acute bed pre-screened in General Ward A / ICU.",
      status: "STANDBY",
      icon: Bed,
      color: "text-slate-400 bg-slate-50 border-slate-200"
    },
    {
      stage: "PHARMACY",
      title: "Pharmacy Dispense",
      timestamp: "Post-Consult",
      actor: "Central Dispensary",
      details: "E-Prescription delivery to Counter 3.",
      status: "PENDING",
      icon: Pill,
      color: "text-slate-400 bg-slate-50 border-slate-200"
    },
    {
      stage: "BILLING",
      title: "Insurance Cashless Clearance",
      timestamp: "Pre-Authorized",
      actor: "TPA Desk",
      details: "Star Health pre-authorization approved for ₹ 45,000 cashless limit.",
      status: "READY",
      icon: CreditCard,
      color: "text-slate-400 bg-slate-50 border-slate-200"
    }
  ]);

  // Real-time ETA Calculation (Section 9)
  const calculateEtaMinutes = () => {
    if (queueState.patientsAhead === 0) return "< 3 mins";
    const totalMinutes = queueState.patientsAhead * queueState.avgConsultationMinutes + (queueState.doctorDelayMinutes || 0);
    return `~${totalMinutes} mins`;
  };

  // Trigger Emergency Request (Section 13)
  const handleTriggerEmergency = async () => {
    setActiveEmergency(true);
    try {
      const res = await nexusApi.triggerEmergency({
        patientId: patientData.patientId,
        patientName: patientData.name,
        severity: "CRITICAL",
        location: "Emergency West Entrance",
        symptoms: "Sudden severe chest pressure, radiating left arm pain, SpO2 84%"
      });
      setEmergencyResult(res);

      // Add Emergency event to patient journey
      setJourneyEvents(prev => [
        {
          stage: "EMERGENCY",
          title: "🚨 Emergency Code Red Initiated",
          timestamp: new Date().toLocaleTimeString(),
          actor: "Nexus Emergency Orchestrator",
          details: `Autonomous allocation: Resuscitation Bay ${res?.allocation?.bed || "ICU-05"} reserved under Dr. Sarah Johnson. Ventilator synced.`,
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

  // "I Don't Know — Help Me" Guidance (Section 12)
  const handleSmartGuidance = (topic) => {
    let result = null;
    switch (topic) {
      case "mri":
        result = {
          title: "MRI & Advanced Diagnostic Imaging",
          department: "Department of Radiodiagnosis & Imaging (Basement Suite B)",
          action: "Direct routing to Siemens 128-Slice CT/MRI Desk",
          status: "Active Queue: 3 patients (~18 min wait). Pre-registration available at Counter 4.",
          note: "Please inform staff if you have metal implants, pacemakers, or claustrophobia."
        };
        break;
      case "chest-pain":
        result = {
          title: "Acute Chest Pain / Cardiac Evaluation",
          department: "Emergency Triage Care & Cardiac Resuscitation Bay",
          action: "IMMEDIATE FAST-TRACK ACCESS: Walk directly into ER Bay 1.",
          status: "Dr. Sarah Johnson (Cardiologist) on duty. STAT ECG pre-calibrated.",
          note: "Do not wait in regular OPD line. Emergency triage nurses will attend immediately."
        };
        break;
      case "queue-token":
        result = {
          title: "Your OPD Queue Status",
          department: queueState.specialty,
          action: `Your token is ${queueState.tokenNumber}. You are in ${queueState.cabinNumber}.`,
          status: `There are ${queueState.patientsAhead} patients ahead of you. Estimated wait: ${calculateEtaMinutes()}.`,
          note: "Please proceed towards the waiting lounge outside Cabin 102."
        };
        break;
      case "insurance":
        result = {
          title: "Cashless Insurance & Scheme Discovery",
          department: "TPA & Ayushman Bharat Helpdesk (Floor 1, Room 108)",
          action: "Your policy Star Health Premier is Pre-Approved.",
          status: "PM-JAY Scheme Golden Card verified on portal.",
          note: "Show your ABHA ID #91-8273-4412-9901 for 100% cashless claims processing."
        };
        break;
      default:
        result = {
          title: "General Hospital Helpdesk",
          department: "Central Patient Care Concierge (Main Atrium)",
          action: "Please approach Counter 1 or speak to our AI Voice Concierge.",
          status: "Open 24/7 with multi-lingual patient support.",
          note: "Wheelchair assistance and transport orderlies are available at West Entrance."
        };
    }
    setHelpResponse(result);
  };

  return (
    <div className="space-y-6">
      {/* Patient Welcome Banner with Persistent Identifiers */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-8 text-white border border-emerald-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-slate-950 uppercase tracking-wider">
                Patient Care Portal
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-800 text-emerald-300 border border-slate-700">
                MRN: {patientData.patientId}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                JOURNEY ID: {patientData.journeyId}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>Welcome back, {patientData.name}</span>
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
              MediCare Nexus tracks your clinical journey, live queue position, diagnostic investigations, and insurance readiness in real-time.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setHelpModalOpen(true);
                handleSmartGuidance("general");
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-emerald-400 font-bold text-xs border border-emerald-500/30 shadow-md transition cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>I Don't Know — Help Me</span>
            </button>

            <button
              onClick={handleTriggerEmergency}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-lg shadow-red-600/30 transition cursor-pointer animate-pulse"
            >
              <Zap className="w-4 h-4" />
              <span>SOS Emergency Request</span>
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Active Notification Card */}
      {activeEmergency && (
        <div className="bg-red-500 text-white rounded-2xl p-5 shadow-lg border border-red-400 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
              <Zap className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base">🚨 EMERGENCY ORCHESTRATION ACTIVE (Code Red)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-white text-red-700 uppercase">
                  Mobilized
                </span>
              </div>
              <p className="text-xs text-red-100 mt-0.5">
                Bed <span className="font-bold underline">{emergencyResult?.allocation?.bed || "ICU-05"}</span> allocated. Attending Physician: <span className="font-bold">Dr. Sarah Johnson</span>. Emergency clinical transport dispatched.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveEmergency(false)}
            className="px-4 py-1.5 rounded-xl bg-white text-red-700 font-black text-xs hover:bg-red-50 transition self-start md:self-auto cursor-pointer"
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* Grid: Live OPD Queue + Real-Time ETA + Insurance Readiness */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Active OPD Queue & Token */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-emerald-600 animate-pulse" />
              <h2 className="font-black text-slate-900 text-sm">Active OPD Token</h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
              LIVE QUEUE
            </span>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-center space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Your Consulting Token</span>
            <div className="text-4xl font-black text-emerald-600 font-mono tracking-tight">
              {queueState.tokenNumber}
            </div>
            <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
              Current Token in Cabin: {queueState.currentServingToken}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Consulting Physician</span>
              <span className="font-bold text-slate-800">{queueState.doctorName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Specialty & Cabin</span>
              <span className="font-bold text-slate-800">{queueState.cabinNumber}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Doctor Current Status</span>
              <span className="font-bold text-blue-700 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                In Consultation
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Real-Time Calculated ETA (Section 9) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h2 className="font-black text-slate-900 text-sm">Real-Time Waiting ETA</h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 font-mono">
              Calculated
            </span>
          </div>

          <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-100 text-center space-y-1">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Estimated Wait Duration</span>
            <div className="text-4xl font-black text-blue-900 font-mono tracking-tight">
              {calculateEtaMinutes()}
            </div>
            <span className="text-xs text-blue-700 font-semibold">
              Based on {queueState.patientsAhead} patients ahead @ ~9 min/visit
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Patients Ahead of You</span>
              <span className="font-black text-slate-900 text-sm">{queueState.patientsAhead}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Smart Arrival Guidance</span>
              <span className="font-bold text-emerald-700">{queueState.suggestedArrival}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Known Doctor Delay</span>
              <span className="font-bold text-slate-700">0 mins (On Schedule)</span>
            </div>
          </div>
        </div>

        {/* Card 3: Insurance Readiness & Healthcare Scheme Discovery */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <h2 className="font-black text-slate-900 text-sm">Insurance & Schemes</h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              Cashless Ready
            </span>
          </div>

          <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-950">{patientData.insurancePolicy}</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-600 text-white">
                Pre-Approved
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              ABHA ID: <span className="font-mono font-semibold text-slate-900">{patientData.abhaId}</span>
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">PM-JAY Scheme Discovery</div>
                <div className="text-[11px] text-slate-500">Eligible for tertiary cardiology package</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Persistent Patient Journey Timeline (Section 10) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                Protected Section
              </span>
              <span className="text-xs text-slate-400 font-mono">Journey ID: {patientData.journeyId}</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
              <Compass className="w-6 h-6 text-emerald-600" />
              Persistent Patient Journey Timeline
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live operational connection across registration, OPD queue, clinical workbench, diagnostics, and admission.
            </p>
          </div>

          {/* Timeline Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setJourneyFilter("all")}
              className={`px-3 py-1 rounded-lg transition ${
                journeyFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Stages
            </button>
            <button
              onClick={() => setJourneyFilter("active")}
              className={`px-3 py-1 rounded-lg transition ${
                journeyFilter === "active" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Active & Next
            </button>
          </div>
        </div>

        {/* Timeline Path */}
        <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-6">
          {journeyEvents
            .filter(e => journeyFilter === "all" || e.status === "COMPLETED" || e.status === "IN_PROGRESS" || e.status === "CRITICAL")
            .map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="relative group">
                  <div
                    className={`absolute -left-[35px] top-1 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white ${item.color}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  <div className="bg-slate-50/60 hover:bg-slate-100/70 p-4 rounded-xl border border-slate-200 transition space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{item.title}</span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                            item.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-800"
                              : item.status === "IN_PROGRESS"
                              ? "bg-blue-100 text-blue-800 animate-pulse"
                              : item.status === "CRITICAL"
                              ? "bg-red-100 text-red-800 animate-bounce"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-400">{item.timestamp}</span>
                    </div>

                    <p className="text-xs text-slate-600">{item.details}</p>

                    <div className="text-[11px] text-slate-400 pt-1 flex items-center gap-2">
                      <span>Source: <strong className="text-slate-600">{item.actor}</strong></span>
                      <span>•</span>
                      <span>Stage Key: <strong className="font-mono text-indigo-600">{item.stage}</strong></span>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* "I Don't Know — Help Me" Smart Guidance Modal (Section 12) */}
      {helpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-emerald-600" />
                <h3 className="font-black text-slate-900 text-base sm:text-lg">
                  "I Don't Know — Help Me" Guidance
                </h3>
              </div>
              <button
                onClick={() => setHelpModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Select what you need help with. The NEXUS Knowledge Navigator resolves your request to the right department, live resources, and queue without inventing clinical diagnoses.
            </p>

            {/* Quick Topic Chips */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleSmartGuidance("mri")}
                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-left font-bold transition cursor-pointer"
              >
                🩻 I need an MRI / CT Scan
              </button>
              <button
                onClick={() => handleSmartGuidance("chest-pain")}
                className="p-3 rounded-xl border border-red-200 hover:border-red-500 hover:bg-red-50 text-left font-bold text-red-900 transition cursor-pointer"
              >
                🚨 Severe Chest Pain / ER
              </button>
              <button
                onClick={() => handleSmartGuidance("queue-token")}
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-left font-bold transition cursor-pointer"
              >
                🎫 Where is my Queue Cabin?
              </button>
              <button
                onClick={() => handleSmartGuidance("insurance")}
                className="p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 text-left font-bold transition cursor-pointer"
              >
                💳 Cashless Insurance Help
              </button>
            </div>

            {/* Resolved Guidance Output */}
            {helpResponse && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  {helpResponse.title}
                </div>
                <div className="text-slate-700">
                  <strong>Location:</strong> {helpResponse.department}
                </div>
                <div className="text-slate-700">
                  <strong>Next Action:</strong> {helpResponse.action}
                </div>
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200">
                  {helpResponse.status}
                </div>
                <p className="text-[11px] text-slate-500 italic">{helpResponse.note}</p>
              </div>
            )}

            <button
              onClick={() => setHelpModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
