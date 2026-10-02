// frontend/src/components/Nexus/DoctorWorkbenchView.jsx
import React, { useState, useEffect } from "react";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Bed,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coffee,
  FileCheck,
  FilePlus,
  FileText,
  HeartPulse,
  Microscope,
  Pill,
  Plus,
  Radio,
  RefreshCw,
  Send,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Trash2,
  User,
  Users,
  X,
  Zap
} from "lucide-react";
import { nexusApi } from "./nexusApi";

export default function DoctorWorkbenchView() {
  const [doctorProfile, setDoctorProfile] = useState({
    doctorId: "DOC-01",
    name: "Dr. Sarah Johnson",
    specialty: "Interventional Cardiology",
    department: "Cardiology",
    cabinNumber: "Cabin 102 (Floor 1)",
    status: "AVAILABLE",
    activeDelayMinutes: 0,
    totalConsultationsToday: 14,
    shift: "Morning (08:00 - 16:00)"
  });

  // OPD Patient Queue (Section 15)
  const [patientQueue, setPatientQueue] = useState([
    {
      tokenId: "#04",
      patientId: "P-101",
      name: "Harsh Tripathi",
      age: 34,
      gender: "Male",
      symptoms: "Atypical chest tightness, exertional dyspnea (2 days)",
      vitals: { bp: "128/84", hr: "82 bpm", spO2: "98%", temp: "98.6 °F" },
      status: "CALLED",
      arrivedAt: "10:42 AM",
      priority: "ROUTINE",
      pastHistory: "Mild hypertension, non-smoker"
    },
    {
      tokenId: "#05",
      patientId: "P-1002",
      name: "Meena Devi",
      age: 52,
      gender: "Female",
      symptoms: "Severe headache, persistent BP spikes > 150/95",
      vitals: { bp: "152/96", hr: "88 bpm", spO2: "97%", temp: "98.4 °F" },
      status: "WAITING",
      arrivedAt: "10:50 AM",
      priority: "URGENT",
      pastHistory: "Essential hypertension for 5 years"
    },
    {
      tokenId: "#06",
      patientId: "P-1003",
      name: "Arun Raj",
      age: 44,
      gender: "Male",
      symptoms: "Post-stent 6-month routine clinical follow-up",
      vitals: { bp: "120/78", hr: "72 bpm", spO2: "99%", temp: "98.2 °F" },
      status: "WAITING",
      arrivedAt: "11:00 AM",
      priority: "ROUTINE",
      pastHistory: "Stent placed in LAD (Oct 2025)"
    }
  ]);

  const [activePatient, setActivePatient] = useState(patientQueue[0]);
  const [consultationActive, setConsultationActive] = useState(false);
  const [consultationDuration, setConsultationDuration] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // Clinical Workbench Form States
  const [clinicalNotes, setClinicalNotes] = useState(
    "Patient presents with intermittent exertional chest tightness. Normal S1/S2 heart sounds. Bilateral lungs clear to auscultation. Advise STAT 12-lead ECG and Troponin-I test to rule out acute coronary syndrome."
  );
  const [diagnosis, setDiagnosis] = useState("Atypical Chest Pain / Rule out Unstable Angina");

  const [prescriptions, setPrescriptions] = useState([
    { medicine: "Tab. Sorbitrate 5mg", dosage: "1 tab", frequency: "Sublingual PRN for acute chest pain", duration: "5 days" },
    { medicine: "Tab. Aspirin 75mg", dosage: "1 tab", frequency: "Once daily (Post lunch)", duration: "30 days" },
    { medicine: "Tab. Atorvastatin 20mg", dosage: "1 tab", frequency: "Once daily (Bedtime)", duration: "30 days" }
  ]);
  const [newMed, setNewMed] = useState({ medicine: "", dosage: "", frequency: "", duration: "" });

  const [orderedDiagnostics, setOrderedDiagnostics] = useState([
    { id: "DIAG-ORD-01", name: "12-Lead Emergency ECG", priority: "STAT", status: "SCHEDULED" },
    { id: "DIAG-ORD-02", name: "High-Sensitivity Troponin-I", priority: "STAT", status: "ORDERED" }
  ]);

  // Admission & Surgery Request Modals
  const [showAdmissionModal, setShowAdmissionModal] = useState(false);
  const [admissionWard, setAdmissionWard] = useState("WARD-GEN-A");
  const [admissionReason, setAdmissionReason] = useState("Continuous cardiac telemetry observation and serial cardiac enzyme monitoring");

  const [showSurgeryModal, setShowSurgeryModal] = useState(false);
  const [surgeryProcedure, setSurgeryProcedure] = useState("Coronary Angiogram & Possible PCI");

  // Timer for active consultation
  useEffect(() => {
    let timer = null;
    if (consultationActive) {
      timer = setInterval(() => {
        setConsultationDuration(d => d + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [consultationActive]);

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // 1. Start Consultation (Section 15, 16)
  const handleStartConsultation = () => {
    setConsultationActive(true);
    setDoctorProfile(prev => ({ ...prev, status: "IN_CONSULTATION" }));
    if (activePatient) {
      activePatient.status = "IN_CONSULTATION";
    }
    setFeedbackMessage(`✓ Consultation started for ${activePatient?.name || "Patient"} (Token ${activePatient?.tokenId}). Closed-loop state broadcasted across hospital network.`);
  };

  // 2. Complete Consultation (Section 15, 16)
  const handleCompleteConsultation = () => {
    setConsultationActive(false);
    setConsultationDuration(0);
    setDoctorProfile(prev => ({
      ...prev,
      status: "AVAILABLE",
      totalConsultationsToday: prev.totalConsultationsToday + 1
    }));
    setFeedbackMessage(`✓ Consultation completed for ${activePatient?.name}. Prescriptions and lab orders routed to respective departments.`);

    // Remove or mark completed and select next
    const remaining = patientQueue.filter(p => p.patientId !== activePatient.patientId);
    setPatientQueue(remaining);
    if (remaining.length > 0) {
      setActivePatient(remaining[0]);
    }
  };

  // 3. Call Next Patient
  const handleCallNext = () => {
    if (patientQueue.length > 1) {
      const nextP = patientQueue[1];
      setActivePatient(nextP);
      nextP.status = "CALLED";
      setFeedbackMessage(`✓ Called next patient: ${nextP.name} (Token ${nextP.tokenId}). Alert sounded in OPD Waiting Lounge.`);
    } else {
      setFeedbackMessage("No further waiting patients in this OPD session.");
    }
  };

  // 4. Add Doctor Delay (+10m)
  const handleAddDelay = () => {
    const newDelay = doctorProfile.activeDelayMinutes + 10;
    setDoctorProfile(prev => ({ ...prev, activeDelayMinutes: newDelay, status: "DELAYED" }));
    setFeedbackMessage(`⚠️ Doctor delay of +10 mins logged. ETA engine recalculated across all ${patientQueue.length} waiting patient portals.`);
  };

  // 5. Toggle Break
  const handleToggleBreak = () => {
    const isBreak = doctorProfile.status === "ON_BREAK";
    setDoctorProfile(prev => ({ ...prev, status: isBreak ? "AVAILABLE" : "ON_BREAK" }));
    setFeedbackMessage(isBreak ? "✓ Resumed duty from break. Queue active." : "☕ Doctor marked ON_BREAK. Patients notified.");
  };

  // Add prescription item
  const handleAddMed = (e) => {
    e.preventDefault();
    if (!newMed.medicine) return;
    setPrescriptions([...prescriptions, newMed]);
    setNewMed({ medicine: "", dosage: "", frequency: "", duration: "" });
  };

  // Submit Admission Request (Section 18)
  const handleSubmitAdmission = () => {
    setShowAdmissionModal(false);
    setFeedbackMessage(`✓ Inpatient admission request created for ${activePatient?.name} in ${admissionWard}. Nexus Bed Orchestrator pre-screened bed availability.`);
  };

  // Submit Surgery / OT Request (Section 19)
  const handleSubmitSurgery = () => {
    setShowSurgeryModal(false);
    setFeedbackMessage(`✓ OT surgical request submitted for ${surgeryProcedure}. Feasibility checks verifying surgeon roster, anesthetist, and sterile suite.`);
  };

  return (
    <div className="space-y-6">
      {/* Doctor Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-blue-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-500 text-slate-950 uppercase tracking-wider">
              Doctor Workbench (Portal 2)
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-800 text-blue-300 border border-slate-700">
              ID: {doctorProfile.doctorId}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-emerald-400">
              {doctorProfile.cabinNumber}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Stethoscope className="w-8 h-8 text-blue-400" />
            <span>{doctorProfile.name}</span>
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm">
            {doctorProfile.specialty} · Live OPD Queue Management, Clinical Workbench & Surgical Order Entry.
          </p>
        </div>

        {/* Doctor Operational Status Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleAddDelay}
            className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 transition cursor-pointer flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Add Delay (+10m)</span>
          </button>

          <button
            onClick={handleToggleBreak}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
              doctorProfile.status === "ON_BREAK"
                ? "bg-purple-600 text-white shadow-md"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>{doctorProfile.status === "ON_BREAK" ? "Resume Duty" : "Take Break"}</span>
          </button>

          <span
            className={`px-3.5 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-1.5 ${
              doctorProfile.status === "IN_CONSULTATION"
                ? "bg-blue-600 text-white animate-pulse"
                : doctorProfile.status === "ON_BREAK"
                ? "bg-purple-600 text-white"
                : "bg-emerald-600 text-white"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            {doctorProfile.status.replace("_", " ")}
          </span>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold flex items-center justify-between animate-fade-in">
          <span>{feedbackMessage}</span>
          <button onClick={() => setFeedbackMessage("")} className="text-blue-600 hover:text-blue-800 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Left Column OPD Queue, Right Column Clinical Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live OPD Patient Queue (Section 15) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              OPD Patient Queue ({patientQueue.length})
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
              Live State
            </span>
          </div>

          <div className="space-y-2.5">
            {patientQueue.map((p) => {
              const isSelected = activePatient?.patientId === p.patientId;
              return (
                <div
                  key={p.patientId}
                  onClick={() => setActivePatient(p)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition space-y-1 ${
                    isSelected
                      ? "bg-blue-50/80 border-blue-500 shadow-xs ring-1 ring-blue-500/20"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-black text-slate-900 text-sm flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-[11px]">
                        {p.tokenId}
                      </span>
                      <span>{p.name}</span>
                    </div>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                        p.status === "IN_CONSULTATION"
                          ? "bg-blue-600 text-white animate-pulse"
                          : p.status === "CALLED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  <p className="text-slate-600 text-[11px] line-clamp-1">{p.symptoms}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>{p.age} yrs · {p.gender}</span>
                    <span>Arrived: {p.arrivedAt}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Queue Actions */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
            <button
              onClick={handleCallNext}
              className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer"
            >
              Call Next Token
            </button>
            <button
              onClick={() => {
                setPatientQueue([
                  ...patientQueue,
                  {
                    tokenId: `#0${patientQueue.length + 4}`,
                    patientId: `P-${Date.now().toString().slice(-4)}`,
                    name: "Walk-in Emergency Patient",
                    age: 45,
                    gender: "Male",
                    symptoms: "Acute chest discomfort",
                    vitals: { bp: "140/90", hr: "96", spO2: "95%", temp: "98.6" },
                    status: "WAITING",
                    arrivedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    priority: "URGENT",
                    pastHistory: "None reported"
                  }
                ]);
                setFeedbackMessage("✓ Added walk-in triage token to current OPD queue.");
              }}
              className="py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition cursor-pointer"
            >
              + Walk-in Patient
            </button>
          </div>
        </div>

        {/* Right 2 Columns: Clinical Workbench (Section 17) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Patient Inspection Header with Consultation Timer */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Active Clinical Consultation
                </span>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 mt-0.5">
                  <span>{activePatient?.name || "Select a Patient"}</span>
                  <span className="text-xs font-mono font-normal text-slate-400">
                    (Token: {activePatient?.tokenId} · MRN: {activePatient?.patientId})
                  </span>
                </h2>
              </div>

              {/* Consultation Controls */}
              <div className="flex items-center gap-2">
                {consultationActive ? (
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 font-mono font-black text-xs border border-red-200 animate-pulse">
                      ⏱ {formatTimer(consultationDuration)}
                    </span>
                    <button
                      onClick={handleCompleteConsultation}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Complete Consultation
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleStartConsultation}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition shadow-sm cursor-pointer flex items-center gap-1.5"
                  >
                    <Stethoscope className="w-4 h-4" />
                    Start Consultation
                  </button>
                )}
              </div>
            </div>

            {/* Patient Vitals Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Blood Pressure</span>
                <span className="text-base font-black text-slate-900">{activePatient?.vitals?.bp}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Heart Rate</span>
                <span className="text-base font-black text-slate-900">{activePatient?.vitals?.hr}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">SpO2 Oxygen</span>
                <span className="text-base font-black text-slate-900">{activePatient?.vitals?.spO2}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Body Temp</span>
                <span className="text-base font-black text-slate-900">{activePatient?.vitals?.temp}</span>
              </div>
            </div>

            {/* AI Assistive Clinical Record Summary (Assistive only - Section 17, 44) */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200/80 space-y-1.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-black text-indigo-950 uppercase tracking-wider">
                  NEXUS Assistive Clinical Summary
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-indigo-100 text-indigo-800">
                  Doctor Final Authority
                </span>
              </div>
              <p className="text-xs text-indigo-900">
                Patient has 5-year history of controlled hypertension. Active symptoms of atypical exertional chest tightness require immediate evaluation to rule out acute myocardial ischemia. Last lab lipid profile was within normal limits.
              </p>
            </div>

            {/* Clinical Notes & Working Diagnosis */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Working Diagnosis</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Examination & Assessment</label>
                <textarea
                  rows={3}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Prescriptions Table */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-emerald-600" />
                  Prescriptions & Medication Orders ({prescriptions.length})
                </h3>
              </div>

              <div className="space-y-2">
                {prescriptions.map((med, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{med.medicine}</span>
                      <span className="text-slate-500 ml-2">({med.dosage} · {med.frequency} · {med.duration})</span>
                    </div>
                    <button
                      onClick={() => setPrescriptions(prescriptions.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-red-600 font-bold p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Med Line */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1 text-xs">
                <input
                  type="text"
                  placeholder="Medicine name..."
                  value={newMed.medicine}
                  onChange={e => setNewMed({ ...newMed, medicine: e.target.value })}
                  className="px-3 py-1.5 rounded-lg border border-slate-300"
                />
                <input
                  type="text"
                  placeholder="Dosage (e.g. 1 tab)"
                  value={newMed.dosage}
                  onChange={e => setNewMed({ ...newMed, dosage: e.target.value })}
                  className="px-3 py-1.5 rounded-lg border border-slate-300"
                />
                <input
                  type="text"
                  placeholder="Frequency (e.g. BD)"
                  value={newMed.frequency}
                  onChange={e => setNewMed({ ...newMed, frequency: e.target.value })}
                  className="px-3 py-1.5 rounded-lg border border-slate-300"
                />
                <button
                  type="button"
                  onClick={handleAddMed}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-700 cursor-pointer"
                >
                  + Add Medication
                </button>
              </div>
            </div>

            {/* Quick Diagnostic Orders Strip */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Microscope className="w-4 h-4 text-purple-600" />
                Ordered Diagnostic Investigations
              </h3>
              <div className="flex flex-wrap gap-2 text-xs">
                {orderedDiagnostics.map((d) => (
                  <span key={d.id} className="px-3 py-1 rounded-lg bg-purple-50 text-purple-900 border border-purple-200 font-bold flex items-center gap-1.5">
                    <span>{d.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-200 text-purple-950 font-mono">{d.priority}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Action Triggers: Admission & Surgery Requests (Section 18, 19) */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowAdmissionModal(true)}
                className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition cursor-pointer flex items-center gap-1.5"
              >
                <Bed className="w-4 h-4" />
                Request Inpatient Bed Admission
              </button>

              <button
                type="button"
                onClick={() => setShowSurgeryModal(true)}
                className="px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs border border-teal-200 transition cursor-pointer flex items-center gap-1.5"
              >
                <Activity className="w-4 h-4" />
                Request OT / Surgery Booking
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Admission Request Modal (Section 18) */}
      {showAdmissionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Bed className="w-5 h-5 text-indigo-600" />
                Inpatient Admission Request
              </h3>
              <button onClick={() => setShowAdmissionModal(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Ward</label>
                <select
                  value={admissionWard}
                  onChange={e => setAdmissionWard(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                >
                  <option value="WARD-GEN-A">General Ward A (4 beds available)</option>
                  <option value="WARD-ICU">Intensive Care Unit (2 isolation beds available)</option>
                  <option value="WARD-SURG">Surgical Recovery PACU (3 beds available)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Clinical Justification</label>
                <textarea
                  rows={3}
                  value={admissionReason}
                  onChange={e => setAdmissionReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-900 text-[11px]">
                ℹ️ <strong>NEXUS Allocation Rule:</strong> Doctor request generates operational proposal. Bed orchestrator allocates feasible bed without clinical disruption.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowAdmissionModal(false)} className="px-4 py-2 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-100">Cancel</button>
              <button onClick={handleSubmitAdmission} className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700">Submit Request</button>
            </div>
          </div>
        </div>
      )}

      {/* Surgery / OT Request Modal (Section 19) */}
      {showSurgeryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-600" />
                OT Surgery Booking Request
              </h3>
              <button onClick={() => setShowSurgeryModal(false)} className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Planned Surgical Procedure</label>
                <input
                  type="text"
                  value={surgeryProcedure}
                  onChange={e => setSurgeryProcedure(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estimated Duration</label>
                  <select className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold">
                    <option>60 Minutes</option>
                    <option>90 Minutes</option>
                    <option>120 Minutes</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority</label>
                  <select className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold">
                    <option>URGENT - Within 4h</option>
                    <option>ELECTIVE - Next Slot</option>
                    <option>STAT - Emergency</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-teal-50 text-teal-900 text-[11px]">
                ℹ️ <strong>NEXUS Check:</strong> Verifies OT sterile availability, surgical scrub nurse N-07, anesthetist Dr. David Kim, and PACU recovery bed before locking schedule.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowSurgeryModal(false)} className="px-4 py-2 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-100">Cancel</button>
              <button onClick={handleSubmitSurgery} className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700">Lock OT Schedule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
