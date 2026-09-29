// admin/src/components/Nexus/OrchestratorView.jsx
import React, { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bed,
  CheckCircle2,
  Clock,
  Cpu,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Zap
} from "lucide-react";
import { nexusApi } from "./nexusApi";

export default function OrchestratorView() {
  const [compromisedBed, setCompromisedBed] = useState("ICU-05");
  const [reason, setReason] = useState("Bed mechanical/electrical failure detected. Emergency maintenance initiated.");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSimulateConflict = async () => {
    setLoading(true);
    try {
      const res = await nexusApi.triggerReallocation(compromisedBed);
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 rounded-2xl p-6 text-white border border-amber-500/30">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-600 text-white uppercase tracking-wider">
            Continuous Re-Optimization Engine
          </span>
          <span className="text-xs text-slate-400">Zero-Latency Dynamic Constraint Solver</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black">
          Dynamic Conflict Resolution & Automated Reallocation
        </h1>
        <p className="text-slate-300 text-sm mt-1 max-w-3xl">
          When an allocated hospital asset unexpectedly fails, becomes contaminated, or faces higher-priority pre-emption, MediCare Nexus detects the constraint violation and re-solves optimal routing without human intervention.
        </p>
      </div>

      {/* Conflict Simulator Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <h2 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          Simulate Resource Failure / Conflict Scenario
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Target Compromised Bed</label>
            <select
              value={compromisedBed}
              onChange={e => setCompromisedBed(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 font-bold text-slate-800"
            >
              <option value="ICU-05">Bed ICU-05 (Currently Assigned to Patient P-104)</option>
              <option value="ICU-01">Bed ICU-01 (Floor 2, Pod 1)</option>
              <option value="ER-01">Bed ER-01 (Floor 1, Trauma Bay)</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-600 block mb-1">Failure Reason / Anomaly Details</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
              <button
                onClick={handleSimulateConflict}
                disabled={loading}
                className="px-5 py-2 whitespace-nowrap rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Re-optimizing..." : "Trigger Conflict"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reallocation Results Box */}
      {result && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-amber-50/80 border border-amber-200">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-amber-600" />
                <span className="font-bold text-amber-900 text-base">
                  Re-Optimization Complete (Autonomous Shift)
                </span>
              </div>
              <p className="text-xs text-amber-700 mt-1">
                Patient <strong>{result.patientId}</strong> was automatically re-routed with 0 human latency.
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Reallocation Score</span>
              <span className="text-2xl font-black text-emerald-600">{result.reallocatedTo?.score || 92}/100</span>
            </div>
          </div>

          {/* Visual Shift Before & After */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Old Compromised Resource */}
            <div className="p-4 rounded-xl border-2 border-red-200 bg-red-50/40 text-center">
              <span className="text-[11px] font-bold uppercase text-red-600 tracking-wider">Compromised Asset</span>
              <div className="text-2xl font-black text-red-700 mt-1">{result.conflict?.failedResource || "ICU-05"}</div>
              <div className="mt-2 inline-block px-2.5 py-0.5 rounded text-[11px] font-bold bg-red-600 text-white">
                STATUS: MAINTENANCE
              </div>
              <p className="text-[11px] text-slate-500 mt-2">Telemetry failure detected. Removed from active cluster.</p>
            </div>

            {/* Middle Direction Indicator */}
            <div className="flex flex-col items-center justify-center text-center p-2">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold mb-2 shadow-xs">
                <RefreshCw className="w-5 h-5 animate-spin" />
              </div>
              <span className="text-xs font-extrabold text-slate-700">Autonomous Pivot</span>
              <span className="text-[11px] text-slate-400">&lt; 1.2s recalculation</span>
            </div>

            {/* New Reallocated Resource */}
            <div className="p-4 rounded-xl border-2 border-emerald-300 bg-emerald-50/40 text-center">
              <span className="text-[11px] font-bold uppercase text-emerald-700 tracking-wider">New Assigned Asset</span>
              <div className="text-2xl font-black text-emerald-700 mt-1">{result.reallocatedTo?.bedId || "ICU-08"}</div>
              <div className="mt-2 inline-block px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-600 text-white">
                STATUS: OCCUPIED (P-104)
              </div>
              <p className="text-[11px] text-slate-500 mt-2">{result.reallocatedTo?.location || "Floor 2, ICU Pod 4"}</p>
            </div>
          </div>

          {/* Explainability Breakdown */}
          <div className="p-4 rounded-xl bg-slate-900 text-white">
            <h3 className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-2">
              <Sparkles className="w-4 h-4" />
              Why Was {result.reallocatedTo?.bedId || "ICU-08"} Chosen Over General Beds?
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {(result.reallocatedTo?.reasons || []).map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Multi-Criteria Constraint Formula Explainer */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-slate-700" />
          Multi-Criteria Constraint Scoring Model (0 - 100 Points)
        </h3>
        <p className="text-xs text-slate-600 mb-4">
          MediCare Nexus continuously re-evaluates candidate resources across five weighted constraint vectors:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Availability</span>
            <div className="text-lg font-black text-slate-900 mt-0.5">25 Pts</div>
            <p className="text-[10px] text-slate-500 mt-1">Zero wait time & unreserved state verified</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Clinical Match</span>
            <div className="text-lg font-black text-slate-900 mt-0.5">30 Pts</div>
            <p className="text-[10px] text-slate-500 mt-1">Subspecialty certification & high-acuity fit</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Transit Proximity</span>
            <div className="text-lg font-black text-slate-900 mt-0.5">15 Pts</div>
            <p className="text-[10px] text-slate-500 mt-1">&lt;30m radius or same floor transit corridor</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Workload Balance</span>
            <div className="text-lg font-black text-slate-900 mt-0.5">15 Pts</div>
            <p className="text-[10px] text-slate-500 mt-1">Fatigue mitigation & shift load index</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Acuity Priority</span>
            <div className="text-lg font-black text-slate-900 mt-0.5">15 Pts</div>
            <p className="text-[10px] text-slate-500 mt-1">Code Red life-threat pre-emption privilege</p>
          </div>
        </div>
      </div>
    </div>
  );
}
