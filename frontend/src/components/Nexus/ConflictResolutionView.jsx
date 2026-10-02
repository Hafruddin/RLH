// frontend/src/components/Nexus/ConflictResolutionView.jsx
import React, { useState, useEffect } from "react";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Bed,
  Check,
  CheckCircle2,
  Clock,
  Layers,
  RefreshCw,
  Scale,
  ShieldAlert,
  UserCheck,
  X
} from "lucide-react";
import { nexusApi } from "./nexusApi";

const DEFAULT_CONFLICTS = [
  {
    conflictId: "CONF-ICU-12",
    resourceType: "BED",
    resourceId: "ICU-05",
    department: "Intensive Care Unit",
    sourceA: {
      system: "RTLS Physical Pressure Sensor (Bed 05)",
      reportedStatus: "AVAILABLE",
      timestamp: new Date(Date.now() - 120000).toISOString(),
      details: "Pressure sensors report zero physical load (Weight: 0.0 kg).",
    },
    sourceB: {
      system: "Hospital Admission Registration (ADT)",
      reportedStatus: "OCCUPIED",
      timestamp: new Date(Date.now() - 300000).toISOString(),
      details: "Patient P-104 reserved / checked-in via emergency triage registration.",
    },
    status: "OPEN",
    discrepancyDescription: "ICU-05 has conflicting occupancy: Physical Sensor reports AVAILABLE, but ADT reports OCCUPIED.",
    resolvedBy: null,
    resolvedAt: null,
    resolutionAction: null,
    finalStatus: null,
  },
  {
    conflictId: "CONF-OT-03",
    resourceType: "OPERATING_THEATRE",
    resourceId: "OT-03",
    department: "Surgery",
    sourceA: {
      system: "OT Environmental Airflow Telemetry",
      reportedStatus: "IN_USE",
      timestamp: new Date(Date.now() - 90000).toISOString(),
      details: "Surgical laminar airflow active, gas manifold active.",
    },
    sourceB: {
      system: "Surgical Roster Master Schedule",
      reportedStatus: "SCHEDULED",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      details: "Procedure CABG scheduled to start at 12:00 PM (30 min early prep).",
    },
    status: "OPEN",
    discrepancyDescription: "OT-03 surgical equipment and gas systems engaged prior to formal nursing admission sign-off.",
    resolvedBy: null,
    resolvedAt: null,
    resolutionAction: null,
    finalStatus: null,
  }
];

export default function ConflictResolutionView() {
  const [conflicts, setConflicts] = useState(DEFAULT_CONFLICTS);
  const [loading, setLoading] = useState(false);
  const [resolvingId, setResolvingId] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const loadConflicts = async () => {
    setLoading(true);
    try {
      const data = await nexusApi.getConflicts();
      if (Array.isArray(data) && data.length > 0) {
        setConflicts(data);
      } else {
        setConflicts(DEFAULT_CONFLICTS);
      }
    } catch (e) {
      console.error(e);
      setConflicts(DEFAULT_CONFLICTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConflicts();
  }, []);

  const handleResolve = async (conflictId, choice) => {
    setResolvingId(conflictId);
    setFeedbackMessage("");
    try {
      const res = await nexusApi.resolveConflict(
        conflictId,
        choice,
        `Resolved by Clinical Supervisor via direct bedside inspection: marked ${choice}`
      );
      setFeedbackMessage(`✓ Conflict resolved: Resource synchronized to ${choice === "MARK_OCCUPIED" ? "OCCUPIED" : "AVAILABLE"}. Audit log persisted.`);
      setConflicts(prev => prev.map(c => c.conflictId === conflictId ? {
        ...c,
        status: "RESOLVED",
        resolutionAction: choice,
        resolvedBy: "Operations Supervisor",
        resolvedAt: new Date().toISOString()
      } : c));
    } catch (e) {
      setFeedbackMessage("Failed to resolve conflict");
    } finally {
      setResolvingId("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 rounded-2xl p-6 text-white border border-amber-500/30 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white uppercase tracking-wider">
            Section 46 & 47 Innovation
          </span>
          <span className="text-xs text-amber-300">Conflict Detection & Non-Silencing Resolution Hub</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2">
              <Scale className="w-7 h-7 text-amber-400" />
              Resource State Discrepancy & Conflict Resolution
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              "The AI is not the sensor." When telemetry bed sensors contradict hospital ADT registration, NEXUS never silently guesses. It marks a formal RESOURCE_CONFLICT requiring authorized clinical verification.
            </p>
          </div>
          <button
            onClick={loadConflicts}
            className="self-start md:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-amber-500/30 transition shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Conflicts
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center justify-between">
          <span>{feedbackMessage}</span>
          <button onClick={() => setFeedbackMessage("")} className="text-amber-700 hover:text-amber-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Conflict Cards */}
      <div className="space-y-5">
        {conflicts.map((conf) => {
          const isOpen = conf.status === "OPEN";

          return (
            <div
              key={conf.conflictId}
              className={`rounded-2xl border p-6 shadow-xs space-y-4 transition ${
                isOpen ? "bg-white border-amber-300 ring-2 ring-amber-500/10" : "bg-slate-50 border-slate-200 opacity-80"
              }`}
            >
              {/* Top row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-amber-400">
                      {conf.conflictId}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      Resource: <strong className="text-amber-700">{conf.resourceId}</strong> ({conf.resourceType})
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        isOpen ? "bg-amber-100 text-amber-800 animate-pulse" : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {conf.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-semibold">{conf.discrepancyDescription}</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Department</span>
                  <span className="text-xs font-bold text-slate-800">{conf.department}</span>
                </div>
              </div>

              {/* Contradicting Source Cards Side-by-Side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Source A */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      Source A: {conf.sourceA?.system}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      {conf.sourceA?.reportedStatus}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{conf.sourceA?.details}</p>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    Timestamp: {new Date(conf.sourceA?.timestamp || Date.now()).toLocaleTimeString()}
                  </span>
                </div>

                {/* Source B */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                      Source B: {conf.sourceB?.system}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold text-[10px]">
                      {conf.sourceB?.reportedStatus}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{conf.sourceB?.details}</p>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    Timestamp: {new Date(conf.sourceB?.timestamp || Date.now()).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Resolution Controls */}
              {isOpen ? (
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
                  <span className="text-xs text-slate-500 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-amber-600" />
                    Authorized Supervisor must select verified real-world operational state.
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleResolve(conf.conflictId, "MARK_AVAILABLE")}
                      disabled={resolvingId === conf.conflictId}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs disabled:opacity-50"
                    >
                      Mark AVAILABLE
                    </button>
                    <button
                      onClick={() => handleResolve(conf.conflictId, "MARK_OCCUPIED")}
                      disabled={resolvingId === conf.conflictId}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition shadow-xs disabled:opacity-50"
                    >
                      Mark OCCUPIED
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5 pt-2 border-t border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Resolved by {conf.resolvedBy || "Supervisor"} as <strong>{conf.finalStatus}</strong> at{" "}
                  {new Date(conf.resolvedAt || Date.now()).toLocaleTimeString()}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
