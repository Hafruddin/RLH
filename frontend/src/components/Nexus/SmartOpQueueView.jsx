// frontend/src/components/Nexus/SmartOpQueueView.jsx
import React, { useState, useEffect } from "react";
import {
  Activity,
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck,
  FileText,
  Microscope,
  Pill,
  RefreshCw,
  Search,
  Sparkles,
  Stethoscope,
  User,
  Users,
  AlertTriangle,
  Zap,
  Play
} from "lucide-react";
import { nexusApi } from "./nexusApi";

export default function SmartOpQueueView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedJourneyId, setSelectedJourneyId] = useState("JRN-2026-8812");
  const [actionSuccess, setActionSuccess] = useState("");

  const loadData = async () => {
    try {
      const res = await nexusApi.getOpQueues();
      if (res && res.success) {
        setData(res);
      }
    } catch (e) {
      console.error("Failed to load OP queues", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const activeJourney = data?.activeJourneys?.find(j => j.journeyId === selectedJourneyId) || data?.activeJourneys?.[0];

  // Action 1: Doctor orders tests (Auto-routes without 2nd registration!)
  const handleOrderDiagnostics = async () => {
    try {
      const res = await nexusApi.orderDiagnostics({
        journeyId: activeJourney.journeyId,
        doctorId: "DOC-01"
      });
      if (res && res.success) {
        setActionSuccess("Diagnostics ordered! Tokens LAB-B205 & CT-C109 created automatically under Journey ID. Zero repeated registration required.");
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Action 2: Lab test completes -> emits LAB_RESULT_READY -> auto-triggers doctor-review queue
  const handleCompleteLab = async () => {
    try {
      const res = await nexusApi.completeDiagnosticTest({
        journeyId: activeJourney.journeyId,
        testId: activeJourney.diagnosticsOrdered[0]?.testId,
        resultSummary: "Troponin I: <0.01 ng/mL (Normal), Hb: 14.2 g/dL, WBC: 7.2 x 10^3/uL"
      });
      if (res && res.success) {
        setActionSuccess("LAB_RESULT_READY published! Result linked to Journey ID. Doctor-review queue triggered automatically!");
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Action 3: Doctor reviews & prescribes
  const handleReviewPrescribe = async () => {
    try {
      const res = await nexusApi.reviewAndPrescribe({
        journeyId: activeJourney.journeyId,
        doctorId: "DOC-01",
        diagnosis: "Atypical non-cardiac chest discomfort with mild musculoskeletal strain"
      });
      if (res && res.success) {
        setActionSuccess("Doctor review completed! Official e-prescription generated and sent to pharmacy dispensary.");
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ─────────────────────────────────────────────────────────────
          1. Header & Core Principle Banner
      ────────────────────────────────────────────────────────────── */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-emerald-500/10 via-teal-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Compass className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Smart OP & Virtual Queue Management
              </h1>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Journey-Aware Orchestration
              </span>
            </div>
            <p className="text-slate-400 text-xs max-w-3xl leading-relaxed">
              Jury Requirement 3 & 6: Journey-aware virtual dynamic queues that automatically move patients between consultation, diagnostic, result-ready, and doctor-review stages without repeated manual registration.
            </p>
          </div>

          <button
            onClick={loadData}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition cursor-pointer self-start lg:self-center"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
            Refresh Queues
          </button>
        </div>

        {/* Foundational Principle Quote */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-emerald-300 font-semibold flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Guiding Principle:</strong> <em>"Move the information, not the patient."</em> Zero physical waiting lines for diagnostics; automatic dependency tracking and instant virtual ETAs.
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 shrink-0 hidden sm:inline">
            Persistent Journey ID
          </span>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess("")} className="text-emerald-700 hover:text-emerald-900 text-[11px] underline">
            Dismiss
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. Patient Journey Selector Strip
      ────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Active Patient Journeys:</span>
          <div className="flex items-center gap-2">
            {(data?.activeJourneys || []).map(j => (
              <button
                key={j.journeyId}
                onClick={() => setSelectedJourneyId(j.journeyId)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  selectedJourneyId === j.journeyId
                    ? "bg-slate-900 text-white shadow-xs font-black"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                <User className="w-3.5 h-3.5 text-emerald-500" />
                <span>{j.patientName}</span>
                <span className="text-[10px] opacity-75 font-mono">({j.journeyId})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time SSE Virtual Dispatch Active</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. End-to-End Orchestrated OP Journey Timeline
      ────────────────────────────────────────────────────────────── */}
      {activeJourney && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left 2 Cols: Interactive Journey Timeline & Stage Transitions */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      {activeJourney.journeyId}
                    </span>
                    <span className="text-xs font-bold text-slate-400">ABHA: {activeJourney.abhaId}</span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900 mt-1">{activeJourney.patientName}</h2>
                  <p className="text-xs text-slate-500">
                    {activeJourney.age} Y / {activeJourney.gender} • Blood: {activeJourney.bloodGroup} • Doctor: {activeJourney.assignedDoctor.name} ({activeJourney.assignedDoctor.specialty})
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full block">
                    Token #{activeJourney.opdToken}
                  </span>
                  <span className="text-[11px] font-bold text-slate-400 mt-1 block">
                    Current: {activeJourney.stage.replace(/_/g, " ")}
                  </span>
                </div>
              </div>

              {/* Multi-Stage Visual Journey Stepper */}
              <div className="space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                  Closed-Loop Stage Progression (Move Info, Not Patient):
                </span>

                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                    <span className="font-black text-[11px] block">1. Consultation</span>
                    <span className="text-[9px] text-emerald-700 font-semibold">Token {activeJourney.opdToken} Done</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border text-xs ${
                    activeJourney.diagnosticsOrdered.some(d => d.status === "IN_QUEUE")
                      ? "bg-purple-50 border-purple-300 text-purple-900 ring-2 ring-purple-100"
                      : "bg-emerald-50 border-emerald-200 text-emerald-900"
                  }`}>
                    <Microscope className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                    <span className="font-black text-[11px] block">2. Auto Diagnostics</span>
                    <span className="text-[9px] text-purple-700 font-semibold">Zero 2nd Reg Required</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border text-xs ${
                    activeJourney.stage === "DOCTOR_REVIEW_QUEUED"
                      ? "bg-amber-50 border-amber-300 text-amber-900 ring-2 ring-amber-100 animate-pulse"
                      : activeJourney.stage === "PRESCRIPTION_GENERATED"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : "bg-slate-50 border-slate-200 text-slate-400"
                  }`}>
                    <Stethoscope className="w-4 h-4 mx-auto mb-1 text-amber-600" />
                    <span className="font-black text-[11px] block">3. Doctor Review</span>
                    <span className="text-[9px] text-amber-700 font-semibold">
                      {activeJourney.stage === "DOCTOR_REVIEW_QUEUED" ? "Ready (~8m)" : activeJourney.stage === "PRESCRIPTION_GENERATED" ? "Completed" : "Pending Tests"}
                    </span>
                  </div>

                  <div className={`p-2.5 rounded-xl border text-xs ${
                    activeJourney.stage === "PRESCRIPTION_GENERATED"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : "bg-slate-50 border-slate-200 text-slate-400"
                  }`}>
                    <Pill className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                    <span className="font-black text-[11px] block">4. e-Prescription</span>
                    <span className="text-[9px] text-slate-500 font-semibold">Pharmacy Dispatch</span>
                  </div>
                </div>
              </div>

              {/* Doctor-Ordered Diagnostic Suites (Zero Re-registration) */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Microscope className="w-4 h-4 text-purple-600" />
                    Virtual Diagnostic Queues (Connected to Journey ID)
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400">Auto-Enqueued by Clinical Engine</span>
                </div>

                <div className="space-y-2">
                  {activeJourney.diagnosticsOrdered.map(diag => (
                    <div
                      key={diag.testId}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                        diag.status === "RESULT_READY"
                          ? "bg-emerald-50/60 border-emerald-200"
                          : "bg-purple-50/60 border-purple-200"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-black text-purple-800 bg-purple-100 px-1.5 py-0.5 rounded">
                            {diag.token}
                          </span>
                          <span className="font-extrabold text-slate-900 text-xs">{diag.type}</span>
                          <span className="text-[10px] text-slate-500">({diag.department})</span>
                        </div>
                        {diag.resultSummary ? (
                          <p className="text-[11px] font-semibold text-emerald-800 mt-1 pl-1 border-l-2 border-emerald-400">
                            Result: {diag.resultSummary}
                          </p>
                        ) : (
                          <div className="text-[10px] text-purple-700 flex items-center gap-2 mt-1">
                            <span className="flex items-center gap-1 font-bold">
                              <Clock className="w-3 h-3" /> Virtual ETA: ~{diag.virtualEtaMin} mins
                            </span>
                            <span>• Queue Position #{diag.queuePosition}</span>
                            <span className="text-slate-400">(Patient remains relaxed in waiting lounge)</span>
                          </div>
                        )}
                      </div>

                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          diag.status === "RESULT_READY" ? "bg-emerald-600 text-white" : "bg-purple-600 text-white"
                        }`}
                      >
                        {diag.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Stage Simulation Toolbar */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-purple-600" />
                  Simulate Live Hospital Journey Triggers:
                </span>
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <button
                    onClick={handleOrderDiagnostics}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold transition cursor-pointer shadow-2xs"
                  >
                    1. Doctor Orders Lab & CT
                  </button>
                  <button
                    onClick={handleCompleteLab}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition cursor-pointer shadow-2xs"
                  >
                    2. Lab Test Completes (Emit LAB_RESULT_READY)
                  </button>
                  <button
                    onClick={handleReviewPrescribe}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition cursor-pointer shadow-2xs"
                  >
                    3. Doctor Reviews & Generates Rx
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Live Notifications & Doctor-Review Queue */}
          <div className="space-y-4">
            {/* Doctor Review Queue Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-purple-600" />
                  Subsequent Doctor-Review Queue
                </h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Auto-Enqueued
                </span>
              </div>

              <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700">Review Status:</span>
                  <span className="font-black text-purple-900 uppercase text-[10px] bg-purple-200 px-2 py-0.5 rounded">
                    {activeJourney.doctorReviewQueue?.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">Assigned Clinician:</span>
                  <span className="font-bold text-slate-800">{activeJourney.doctorReviewQueue?.assignedDoctor}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">Estimated Review Time:</span>
                  <span className="font-black text-purple-700">{activeJourney.doctorReviewQueue?.estimatedReviewTime}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">Virtual Queue ETA:</span>
                  <span className="font-black text-emerald-700">~{activeJourney.doctorReviewQueue?.virtualEtaMinutes} mins</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 italic">
                * When laboratory test completes, the patient is placed directly into the doctor's review queue. No second physical line or receptionist re-registration required.
              </p>
            </div>

            {/* Real-Time Patient Journey Notifications */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-amber-500" />
                  Live Patient Virtual Notifications
                </h3>
                <span className="text-[10px] font-bold text-slate-400">Push & SMS</span>
              </div>

              <div className="space-y-2">
                {activeJourney.notifications.map(notif => (
                  <div key={notif.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                      <span>SMS / App Push</span>
                      <span>{notif.time}</span>
                    </div>
                    <p className="text-slate-800 text-[11px] font-medium leading-relaxed">{notif.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
