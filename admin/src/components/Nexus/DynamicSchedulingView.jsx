// frontend/src/components/Nexus/DynamicSchedulingView.jsx
import React, { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
  ShieldAlert,
  Sliders,
  Sparkles,
  User,
  Users,
  AlertTriangle,
  ArrowRight,
  Check,
  RefreshCw,
  Zap,
  Activity
} from "lucide-react";
import { nexusApi } from "./nexusApi";

export default function DynamicSchedulingView() {
  const [patientId, setPatientId] = useState("P-101");
  const [procedureType, setProcedureType] = useState("Elective Orthopedic Joint Arthroplasty");
  const [preferredDoctor, setPreferredDoctor] = useState("Dr. Rajesh Gupta");
  const [urgency, setUrgency] = useState("SCHEDULED"); // "EMERGENCY" | "URGENT" | "SCHEDULED"
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [loading, setLoading] = useState(false);
  const [solution, setSolution] = useState(null);
  const [allocatedSlotId, setAllocatedSlotId] = useState(null);
  const [allocationSuccess, setAllocationSuccess] = useState(false);

  const handleSolve = async () => {
    setLoading(true);
    setAllocationSuccess(false);
    try {
      const data = await nexusApi.solveDynamicSchedule({
        patientId,
        procedureType,
        preferredDoctor,
        urgency,
        durationMinutes
      });
      if (data && data.success) {
        setSolution(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAllocate = async (slotId) => {
    try {
      const res = await nexusApi.allocateScheduleSlot(slotId);
      if (res && res.success) {
        setAllocatedSlotId(slotId);
        setAllocationSuccess(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ─────────────────────────────────────────────────────────────
          1. Header: Dynamic Multi-Resource Scheduling
      ────────────────────────────────────────────────────────────── */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-indigo-500/10 via-purple-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Cpu className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Dynamic Scheduling & Time Dependency Engine
              </h1>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Google OR-Tools CP-SAT
              </span>
            </div>
            <p className="text-slate-400 text-xs max-w-3xl leading-relaxed">
              Multi-Resource Constraint Engine: Solves dynamic clinical scheduling with strict hard constraints (no overlapping OT, no doctor double-booking, simultaneous staff readiness) and soft constraints (preferred surgeon, minimized wait time, high capacity efficiency).
            </p>
          </div>
        </div>

        {/* Architectural Principle */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-indigo-300 font-semibold flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>
            <em>"We don't treat scheduling as a simple calendar problem. We model it as a constraint optimization problem where OT, staff, equipment, patient readiness and time dependencies are considered together."</em>
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. Solver Input Parameters Form
      ────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-600" />
            Constraint Solver Inputs & Surgical Parameters
          </h2>
          <span className="text-xs text-slate-400">Step 1: Define Patient Case & Resource Demands</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Patient ID / Identifier</label>
            <input
              type="text"
              value={patientId}
              onChange={e => setPatientId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Surgical / Clinical Procedure</label>
            <input
              type="text"
              value={procedureType}
              onChange={e => setProcedureType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Preferred Lead Surgeon</label>
            <select
              value={preferredDoctor}
              onChange={e => setPreferredDoctor(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
            >
              <option value="Dr. Rajesh Gupta">Dr. Rajesh Gupta (Orthopedics)</option>
              <option value="Dr. Sarah Johnson">Dr. Sarah Johnson (Cardiology)</option>
              <option value="Dr. Michael Chen">Dr. Michael Chen (Neurosurgery)</option>
              <option value="Dr. Lisa Ray">Dr. Lisa Ray (General Surgery)</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Clinical Priority</label>
            <select
              value={urgency}
              onChange={e => setUrgency(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
            >
              <option value="SCHEDULED">Scheduled / Elective</option>
              <option value="URGENT">Urgent Priority (Within 4h)</option>
              <option value="EMERGENCY">Emergency Trauma Pre-emption</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="font-bold text-slate-700">Required Simultaneous Roles:</span>
            <span className="px-2 py-0.5 rounded bg-slate-100 font-mono">Lead Surgeon + Anesthetist + 2 Nurses</span>
          </div>

          <button
            onClick={handleSolve}
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Cpu className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Running CP-SAT Solver..." : "Execute Constraint Optimization Solver"}
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. Solver Pipeline & Constraint Checks
      ────────────────────────────────────────────────────────────── */}
      {solution && (
        <div className="space-y-4">
          {/* Hard Constraints Verification Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Hard Constraints Verification (100% Satisfied)
                </h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Feasible Domain Space Validated
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {solution.hardConstraints.map(hc => (
                <div key={hc.id} className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/70 text-xs space-y-1">
                  <div className="flex items-center justify-between font-black text-slate-900">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      {hc.description}
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-mono">
                      {hc.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 pl-5.5">{hc.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mathematical Explanation Banner */}
          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-xs space-y-1.5">
            <div className="flex items-center justify-between text-indigo-950 font-black">
              <span className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-indigo-600" />
                CP-SAT Mathematical Objective Formulation
              </span>
              <span className="text-[10px] text-indigo-700 font-mono">Solve Time: {solution.solverExplanation.solveTimeMs} ms</span>
            </div>
            <p className="font-mono text-[11px] text-indigo-900 bg-white/70 p-2 rounded-lg border border-indigo-100">
              {solution.solverExplanation.objectiveFunction}
            </p>
          </div>

          {/* Candidate Slots Scored by Objective Function */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Scored Candidate Schedules (Soft Constraint Optimization)
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {solution.candidateSlots.map(slot => (
                <div
                  key={slot.slotId}
                  className={`bg-white rounded-2xl p-5 border-2 transition shadow-xs flex flex-col justify-between ${
                    slot.isOptimal ? "border-purple-500 ring-2 ring-purple-100 bg-linear-to-b from-purple-50/20 to-white" : "border-slate-200"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${slot.isOptimal ? "bg-purple-600 text-white" : "bg-slate-700 text-white"}`}>
                            {slot.isOptimal ? "⭐ Optimal Schedule" : "Feasible Candidate"}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-500">{slot.slotId}</span>
                        </div>
                        <h4 className="font-black text-base text-slate-900 mt-1">{slot.otName}</h4>
                        <div className="text-xs text-slate-600 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1 font-bold text-purple-700">
                            <Clock className="w-3 h-3" /> {slot.startTime} - {slot.endTime} ({slot.date})
                          </span>
                          <span>• Lead: {slot.doctor}</span>
                        </div>
                      </div>

                      {/* Overall CP-SAT Score */}
                      <div className="text-right">
                        <span className="text-2xl font-black text-purple-900">{slot.totalScore}</span>
                        <span className="text-[10px] text-slate-400 block font-bold">/100 Score</span>
                      </div>
                    </div>

                    {/* Soft Score Breakdown */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 p-2.5 rounded-xl bg-slate-50 text-[10px] border border-slate-100">
                      <div>
                        <span className="text-slate-400 block">Surgeon Match:</span>
                        <span className="font-black text-slate-800">{slot.softScores.preferredDoctorMatch}/25</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Wait Minimization:</span>
                        <span className="font-black text-slate-800">{slot.softScores.minimizedWaitTime}/30</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Capacity Util:</span>
                        <span className="font-black text-slate-800">{slot.softScores.resourceUtilization}/20</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Conflict Reduction:</span>
                        <span className="font-black text-slate-800">{slot.softScores.reducedConflictDelay}/25</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 mt-3 italic">"{slot.reason}"</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400">
                      Equipment: {slot.equipment.join(", ")}
                    </span>

                    {allocatedSlotId === slot.slotId ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Allocated & Locked
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAllocate(slot.slotId)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs ${
                          slot.isOptimal
                            ? "bg-purple-600 hover:bg-purple-700 text-white"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        }`}
                      >
                        Commit & Allocate Slot
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {allocationSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Multi-resource allocation committed! Real-time notifications dispatched to surgeon, OR scrub team, and patient.</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-700">Events: OT_RESOURCE_CHANGED, STAFF_AVAILABILITY_CHANGED</span>
        </div>
      )}
    </div>
  );
}
