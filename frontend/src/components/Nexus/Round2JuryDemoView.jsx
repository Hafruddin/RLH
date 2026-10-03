// frontend/src/components/Nexus/Round2JuryDemoView.jsx
import React, { useState, useEffect } from "react";
import {
  Workflow,
  Play,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Zap,
  Activity,
  Layers,
  RotateCcw,
  Check,
  Compass,
  Microscope,
  Stethoscope,
  Flame,
  Cpu,
  ShieldCheck,
  Volume2,
  Sliders
} from "lucide-react";
import { nexusApi } from "./nexusApi";

const DEMO_STEPS = [
  {
    step: 1,
    title: "Patient arrives and receives OP token A104",
    description: "Patient Harsh Tripathi registers at smart kiosk. Persistent Journey ID JRN-2026-8812 is initialized with OP token A104.",
    event: "PATIENT_REGISTERED",
    icon: Compass,
    module: "Smart OP Management",
    badge: "Token A104"
  },
  {
    step: 2,
    title: "Patient enters doctor consultation",
    description: "Dr. Sarah Johnson calls Token #A104 into Cardiology OPD Cabin 102. Real-time consult timer begins on Doctor Workbench.",
    event: "CONSULTATION_STARTED",
    icon: Stethoscope,
    module: "Doctor Workbench",
    badge: "In Consult"
  },
  {
    step: 3,
    title: "Doctor orders blood test and CT scan",
    description: "Dr. Johnson prescribes Comprehensive Blood Profile & High-Res CT Angiography on digital clinical workbench.",
    event: "TEST_ORDERED",
    icon: Microscope,
    module: "Diagnostic Orders",
    badge: "Lab + CT"
  },
  {
    step: 4,
    title: "System automatically places both into diagnostic queues without second registration",
    description: "Principle: 'Move the information, not the patient.' Token LAB-B201 & CT-C102 created automatically under same Journey ID.",
    event: "VIRTUAL_QUEUES_INITIALIZED",
    icon: Layers,
    module: "Virtual Queues",
    badge: "Zero 2nd Reg"
  },
  {
    step: 5,
    title: "Blood test completes",
    description: "Pathology auto-analyzer completes blood analysis. Biomarkers verified by lab technician.",
    event: "LAB_TEST_COMPLETED",
    icon: CheckCircle2,
    module: "Lab Automation",
    badge: "Analyzed"
  },
  {
    step: 6,
    title: "LAB_RESULT_READY event is published",
    description: "Event published to Nexus Real-Time Event Bus with encrypted payload hash.",
    event: "LAB_RESULT_READY",
    icon: Zap,
    module: "Event Bus (SSE)",
    badge: "Event Emitted"
  },
  {
    step: 7,
    title: "Result is automatically attached to the same Journey ID",
    description: "Troponin I <0.01 ng/mL & CBC seamlessly linked to JRN-2026-8812 with zero manual record searching.",
    event: "RESULT_ATTACHED_TO_JOURNEY",
    icon: Compass,
    module: "Journey Linking",
    badge: "JRN-8812"
  },
  {
    step: 8,
    title: "Doctor-review queue is created automatically",
    description: "Patient is placed directly into Dr. Johnson's Review Queue without standing in any physical line.",
    event: "REVIEW_QUEUE_CREATED",
    icon: Stethoscope,
    module: "Review Queue",
    badge: "Review Slot"
  },
  {
    step: 9,
    title: "Patient receives report-ready notification and estimated review time",
    description: "Push notification sent to patient: 'Results ready. Doctor review scheduled in ~18 mins.'",
    event: "PATIENT_NOTIFIED",
    icon: Clock,
    module: "Push Notifications",
    badge: "SMS / Push"
  },
  {
    step: 10,
    title: "Dashboard shows live resource heatmap for beds, CT, laboratory, OT and staff",
    description: "Real-time RPI (Resource Pressure Index) updates across all hospital wards and diagnostic suites.",
    event: "HEATMAP_UPDATED",
    icon: Flame,
    module: "Resource Heatmap",
    badge: "RPI Live"
  },
  {
    step: 11,
    title: "AI predicts CT congestion",
    description: "Queue model detects 4 arriving stroke scans; predicts CT Suite 1 queue delay exceeding 35 mins.",
    event: "CONGESTION_PREDICTED",
    icon: Cpu,
    module: "AI Demand Model",
    badge: "Congestion Alert"
  },
  {
    step: 12,
    title: "Orchestration engine evaluates available slots and resource dependencies",
    description: "CP-SAT constraint optimizer dynamically re-routes routine contrast scans to CT Suite 2 buffer.",
    event: "CONSTRAINT_REALLOCATION",
    icon: Sliders,
    module: "CP-SAT Engine",
    badge: "Re-Optimized"
  },
  {
    step: 13,
    title: "Relevant staff receive role-based alerts & queue dynamically adjusts",
    description: "Radiologist, charge nurse, and patient receive updated routing instructions. Full closed loop completed!",
    event: "CLOSED_LOOP_COMPLETE",
    icon: ShieldCheck,
    module: "Closed Loop",
    badge: "Completed ✓"
  }
];

export default function Round2JuryDemoView() {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [executedSteps, setExecutedSteps] = useState([0]);

  const handleExecuteStep = async (idx) => {
    setCurrentStepIdx(idx);
    if (!executedSteps.includes(idx)) {
      setExecutedSteps(prev => [...prev, idx]);
    }
    try {
      await nexusApi.runDemoStep(idx + 1);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNextStep = () => {
    if (currentStepIdx < DEMO_STEPS.length - 1) {
      handleExecuteStep(currentStepIdx + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIdx > 0) {
      handleExecuteStep(currentStepIdx - 1);
    }
  };

  const handleReset = () => {
    setCurrentStepIdx(0);
    setExecutedSteps([0]);
    setIsRunningAll(false);
  };

  // Play All sequence
  useEffect(() => {
    let timer;
    if (isRunningAll && currentStepIdx < DEMO_STEPS.length - 1) {
      timer = setTimeout(() => {
        handleExecuteStep(currentStepIdx + 1);
      }, 3000);
    } else if (currentStepIdx === DEMO_STEPS.length - 1) {
      setIsRunningAll(false);
    }
    return () => clearTimeout(timer);
  }, [isRunningAll, currentStepIdx]);

  const current = DEMO_STEPS[currentStepIdx];
  const StepIcon = current.icon;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ─────────────────────────────────────────────────────────────
          1. Header: Integrated Clinical Journey Orchestrator
      ────────────────────────────────────────────────────────────── */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-indigo-500/10 via-purple-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Workflow className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Integrated Clinical Care Pathway Simulator
              </h1>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                13-Stage Operational Workflow
              </span>
            </div>
            <p className="text-slate-400 text-xs max-w-3xl leading-relaxed">
              Real-time operational walkthrough of an unbroken hospital care pathway: Smart Kiosk Check-In → Dynamic Consultation → Automated Diagnostic Routing → Predictive Congestion Detection → CP-SAT Re-Optimization → Dynamic Discharge & Care Continuity.
            </p>
          </div>

          {/* Interactive Player Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsRunningAll(!isRunningAll)}
              className={`px-4 py-2 rounded-xl text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer ${
                isRunningAll
                  ? "bg-amber-500 hover:bg-amber-600 text-slate-950"
                  : "bg-emerald-500 hover:bg-emerald-600 text-slate-950"
              }`}
            >
              <Play className={`w-3.5 h-3.5 ${isRunningAll ? "animate-pulse" : ""}`} />
              {isRunningAll ? "Pause Pathway" : "▶ Run Care Pathway (13 Stages)"}
            </button>

            <button
              onClick={handleReset}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
              title="Reset Pathway to Stage 1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Progress Bar Across 13 Steps */}
        <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
            <span>Pathway Progress: Stage {currentStepIdx + 1} of 13</span>
            <span className="text-emerald-400 font-mono">{Math.round(((currentStepIdx + 1) / 13) * 100)}% Completed</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-purple-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${((currentStepIdx + 1) / 13) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. Active Step Spotlight Card
      ────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-6 border-2 border-purple-300 ring-4 ring-purple-50 shadow-md space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-100 text-purple-700 shrink-0">
              <StepIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                  STEP #{current.step} OF 13
                </span>
                <span className="text-xs font-bold text-slate-400">• {current.module}</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {current.badge}
                </span>
              </div>
              <h2 className="text-lg font-black text-slate-900 mt-1">{current.title}</h2>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-purple-800 bg-purple-50 px-2 py-1 rounded border border-purple-200 block">
              Event: {current.event}
            </span>
          </div>
        </div>

        <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200/80 leading-relaxed font-medium">
          {current.description}
        </p>

        {/* Step Navigation Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            onClick={handlePrevStep}
            disabled={currentStepIdx === 0}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs disabled:opacity-40 transition cursor-pointer"
          >
            ← Previous Step
          </button>

          <span className="text-xs font-semibold text-slate-400">
            Journey ID: <strong className="text-slate-800 font-mono">JRN-2026-8812</strong> (Harsh Tripathi)
          </span>

          <button
            onClick={handleNextStep}
            disabled={currentStepIdx === DEMO_STEPS.length - 1}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs disabled:opacity-40 shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>Next Step</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. 13-Step Matrix Grid (Click to Jump)
      ────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-600" />
            Complete 13-Step Closed Loop Flow (Click Any Step to Execute)
          </h3>
          <span className="text-[10px] text-slate-400 font-bold">Closed Loop: Predict → Optimize → Allocate → Verify → Learn</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
          {DEMO_STEPS.map((s, idx) => {
            const isCurrent = currentStepIdx === idx;
            const isExecuted = executedSteps.includes(idx);
            const Icon = s.icon;

            return (
              <button
                key={s.step}
                onClick={() => handleExecuteStep(idx)}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-start gap-2.5 ${
                  isCurrent
                    ? "border-purple-500 bg-purple-50/60 ring-2 ring-purple-100 shadow-xs"
                    : isExecuted
                    ? "border-emerald-200 bg-emerald-50/20 hover:bg-emerald-50/40"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${isCurrent ? "bg-purple-600 text-white" : isExecuted ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black text-slate-400 font-mono">#{s.step}</span>
                    <span className="text-[11px] font-black text-slate-900 truncate block">{s.title}</span>
                  </div>
                  <span className="text-[9px] text-slate-500 truncate block mt-0.5">{s.module}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. Enterprise Architectural & Clinical Standards
      ────────────────────────────────────────────────────────────── */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3 text-xs">
        <h3 className="font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          Enterprise Architectural & Clinical Standards
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-slate-700">
          <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
            <strong className="text-purple-900 block">1. Dynamic Multi-Resource Scheduling:</strong>
            <p>
              "Schedules are solved as constraint optimization problems where operating theatres, surgical staff, life support equipment, patient readiness and time dependencies are harmonized simultaneously."
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
            <strong className="text-emerald-900 block">2. Smart OP & Continuous Journey Routing:</strong>
            <p>
              "Move information, not the patient. Diagnostic orders route automatically without second physical registration, and doctor-review queues trigger dynamically upon report sign-off."
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
            <strong className="text-amber-900 block">3. Predictive Operational Heatmaps:</strong>
            <p>
              "Real-time visibility combined with predictive forecasts (+2h, +4h, +8h) factoring in current occupancy, queue velocity, incoming emergencies, and planned discharges."
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
            <strong className="text-blue-900 block">4. Zero-Trust Security & Patient Consent:</strong>
            <p>
              "Layered security with object-level authorization, DPDP-compliant patient consent preferences, and an audited 15-minute emergency break-glass clinical override protocol."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
