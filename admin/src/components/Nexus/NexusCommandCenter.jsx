// admin/src/components/Nexus/NexusCommandCenter.jsx
import React, { useState, useEffect } from "react";
import {
  Activity,
  AlertTriangle,
  Bed,
  CheckCircle2,
  Clock,
  Cpu,
  HeartPulse,
  Radio,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Users,
  Zap,
  ArrowRight,
  Sliders,
  ChevronRight
} from "lucide-react";
import { nexusApi } from "./nexusApi";

export default function NexusCommandCenter({ onNavigateTab }) {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState(null);
  const [activeEmergency, setActiveEmergency] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [actionLoading, setActionLoading] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const refreshData = async () => {
    try {
      const data = await nexusApi.getOverview();
      setKpis(data.kpis);
      if (data.activeEmergencies && data.activeEmergencies.length > 0) {
        setActiveEmergency(data.activeEmergencies[0]);
      } else {
        setActiveEmergency(null);
      }
      setAlerts(data.recentAlerts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerEmergency = async () => {
    setActionLoading("emergency");
    setActionMessage("");
    try {
      const res = await nexusApi.triggerEmergency();
      setActiveEmergency(res);
      setActionMessage("🚨 Patient P-104 Code Red triggered! ICU-05, Dr. Sarah & Ventilator V-04 allocated.");
      refreshData();
    } catch (e) {
      setActionMessage("Failed to trigger emergency");
    } finally {
      setActionLoading("");
    }
  };

  const handleSimulateConflict = async () => {
    setActionLoading("conflict");
    setActionMessage("");
    try {
      const res = await nexusApi.triggerReallocation("ICU-05");
      setActionMessage("🔄 Conflict detected: ICU-05 failed. Autonomous Re-optimizer shifted Patient P-104 to ICU-08!");
      refreshData();
    } catch (e) {
      setActionMessage("Failed to trigger conflict");
    } finally {
      setActionLoading("");
    }
  };

  const handleRerouteDiagnostics = async () => {
    setActionLoading("reroute");
    setActionMessage("");
    try {
      await nexusApi.rerouteDiagnostics("DIAG-XR-01", "DIAG-XR-02", 4);
      setActionMessage("⚖️ Re-routed 4 patients from Suite 1 to Suite 2. Wait time reduced from 38m to 14m!");
      refreshData();
    } catch (e) {
      setActionMessage("Failed to reroute diagnostics");
    } finally {
      setActionLoading("");
    }
  };

  const handleResetDemo = async () => {
    setActionLoading("reset");
    setActionMessage("");
    try {
      await nexusApi.resetDemo();
      setActiveEmergency(null);
      setActionMessage("✅ System state reset to initial demo configuration.");
      refreshData();
    } catch (e) {
      setActionMessage("Failed to reset");
    } finally {
      setActionLoading("");
    }
  };

  if (loading && !kpis) {
    return (
      <div className="flex flex-col items-center justify-center p-16">
        <RefreshCw className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Connecting to MediCare Nexus Orchestration Engine...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Live Status */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-emerald-500/20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs uppercase tracking-widest font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                LIVE ORCHESTRATION ENGINE ACTIVE
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Avg Response: 42s
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              MediCare Nexus <span className="text-emerald-400">Command Center</span>
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Autonomous multi-criteria optimization across beds, clinical staff, surgical suites, and diagnostic pipelines with sub-second conflict re-allocation.
            </p>
          </div>

          {/* Quick Demo Controller Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleTriggerEmergency}
              disabled={actionLoading !== ""}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/40 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5" />
              {actionLoading === "emergency" ? "Allocating..." : "1. Trigger Code Red (P-104)"}
            </button>
            <button
              onClick={handleSimulateConflict}
              disabled={actionLoading !== ""}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/40 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              {actionLoading === "conflict" ? "Re-optimizing..." : "2. Simulate ICU-05 Down"}
            </button>
            <button
              onClick={handleRerouteDiagnostics}
              disabled={actionLoading !== ""}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-900/40 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {actionLoading === "reroute" ? "Balancing..." : "3. Re-Route Diagnostics"}
            </button>
            <button
              onClick={handleResetDemo}
              disabled={actionLoading !== ""}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              title="Reset system to clean demo state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Demo
            </button>
          </div>
        </div>

        {/* Action feedback banner */}
        {actionMessage && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between animate-fade-in">
            <span className="font-medium">{actionMessage}</span>
            <button onClick={() => setActionMessage("")} className="text-emerald-400 hover:text-white text-xs underline cursor-pointer">
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* 2. Active Emergency Live Banner (When Patient P-104 is active) */}
      {activeEmergency && (
        <div className="bg-gradient-to-r from-red-950 via-rose-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border-2 border-red-500/60 animate-pulse-slow">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-600 text-white uppercase tracking-wider animate-bounce">
                  CRITICAL CODE RED ACTIVE
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded bg-slate-800 text-red-200 border border-red-500/40">
                  Escalation Level 2: Hospital-Wide Alert
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-2 text-white">
                Patient P-104: Acute Cardiac Crisis / SpO2 82%
              </h2>
              <p className="text-slate-300 text-xs mt-1">
                Autonomous resource bundle locked in <strong>42 seconds</strong>. Patient pre-empted into ICU isolation bed.
              </p>
            </div>

            <div className="flex flex-col items-end">
              <div className="text-right">
                <span className="text-xs text-slate-400 uppercase">Composite Score</span>
                <div className="text-3xl font-black text-emerald-400">{activeEmergency.allocation?.score || 94}/100</div>
              </div>
            </div>
          </div>

          {/* Allocated Resource Bundle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            <div className="bg-slate-900/80 p-3 rounded-xl border border-red-500/30">
              <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <Bed className="w-3.5 h-3.5 text-emerald-400" />
                Allocated Bed
              </div>
              <div className="text-base font-bold text-white">
                {activeEmergency.allocation?.bed || "ICU-05"}
              </div>
              <div className="text-[11px] text-slate-400">Floor 2, ICU Pod 3 (Negative Pressure)</div>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-red-500/30">
              <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <Stethoscope className="w-3.5 h-3.5 text-blue-400" />
                Primary Physician
              </div>
              <div className="text-base font-bold text-white">
                {activeEmergency.allocation?.doctor || "Dr. Sarah Johnson"}
              </div>
              <div className="text-[11px] text-slate-400">Cardiology Specialist (ACLS Certified)</div>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-red-500/30">
              <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                Assigned Nurse
              </div>
              <div className="text-base font-bold text-white">
                {activeEmergency.allocation?.nurse || "Nurse Sarah Jenkins (N-07)"}
              </div>
              <div className="text-[11px] text-slate-400">ICU Critical Care Lead (Floor 2)</div>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-red-500/30">
              <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                Equipment Deployed
              </div>
              <div className="text-base font-bold text-white">
                Ventilator V-04 + ECG-02
              </div>
              <div className="text-[11px] text-slate-400">Pre-calibrated & RTLS verified</div>
            </div>
          </div>

          {/* Explainability bullet points */}
          <div className="mt-4 pt-3 border-t border-red-500/20">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Autonomous Decision Explainability Engine:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
              {(activeEmergency.allocation?.reasons || []).map((reason, idx) => (
                <div key={idx} className="flex items-start gap-1.5 bg-slate-900/40 p-1.5 rounded">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. KPI Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Beds */}
        <div
          onClick={() => onNavigateTab && onNavigateTab("beds")}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Hospital Beds</span>
            <Bed className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {kpis?.availableBeds || 8} <span className="text-xs font-normal text-slate-500">/ {kpis?.totalBeds || 48} avail</span>
          </div>
          <div className="text-xs mt-2 flex items-center justify-between text-slate-500">
            <span>Occupancy</span>
            <span className="font-semibold text-emerald-600">{kpis?.bedOccupancyRate || 83}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
            <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${kpis?.bedOccupancyRate || 83}%` }} />
          </div>
        </div>

        {/* ICU Beds */}
        <div
          onClick={() => onNavigateTab && onNavigateTab("beds")}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-red-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>ICU Life Support</span>
            <ShieldAlert className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-red-600">
            {kpis?.icuAvailable ?? 2} <span className="text-xs font-normal text-slate-500">/ {kpis?.icuTotal || 10} avail</span>
          </div>
          <div className="text-xs mt-2 flex items-center justify-between text-slate-500">
            <span>Saturation</span>
            <span className="font-semibold text-red-600">{kpis?.icuOccupancyRate || 80}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
            <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${kpis?.icuOccupancyRate || 80}%` }} />
          </div>
        </div>

        {/* Staff */}
        <div
          onClick={() => onNavigateTab && onNavigateTab("staff")}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>On-Duty Staff</span>
            <Users className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {kpis?.onDutyStaff || 38} <span className="text-xs font-normal text-slate-500">/ {kpis?.totalStaff || 90}</span>
          </div>
          <div className="text-xs mt-2 flex items-center justify-between text-slate-500">
            <span>Readiness</span>
            <span className="font-semibold text-blue-600">96% nominal</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: "96%" }} />
          </div>
        </div>

        {/* Operating Theatres */}
        <div
          onClick={() => onNavigateTab && onNavigateTab("ot")}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-purple-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>OT Suites</span>
            <Activity className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {kpis?.availableOTs ?? 2} <span className="text-xs font-normal text-slate-500">/ {kpis?.totalOTs || 8} free</span>
          </div>
          <div className="text-xs mt-2 flex items-center justify-between text-slate-500">
            <span>Active Surgeries</span>
            <span className="font-semibold text-purple-600">6 running</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
            <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${kpis?.otUtilizationRate || 75}%` }} />
          </div>
        </div>

        {/* Diagnostics Bottlenecks */}
        <div
          onClick={() => onNavigateTab && onNavigateTab("diagnostics")}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-amber-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Diagnostics</span>
            <AlertTriangle className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-amber-600">
            {kpis?.diagnosticBottlenecks ?? 1} <span className="text-xs font-normal text-slate-500">bottleneck</span>
          </div>
          <div className="text-xs mt-2 flex items-center justify-between text-slate-500">
            <span>X-Ray Suite 1</span>
            <span className="font-semibold text-amber-600">38m wait</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
            <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: "80%" }} />
          </div>
        </div>

        {/* Predictive Horizon */}
        <div
          onClick={() => onNavigateTab && onNavigateTab("forecasting")}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>2h Forecast</span>
            <TrendingUp className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            +39 <span className="text-xs font-normal text-slate-500">ER peak</span>
          </div>
          <div className="text-xs mt-2 flex items-center justify-between text-slate-500">
            <span>Surge Risk</span>
            <span className="font-semibold text-red-600 uppercase text-[11px]">CRITICAL</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
            <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: "90%" }} />
          </div>
        </div>
      </div>

      {/* 4. Two-Column Operational Section: Bottleneck Radar + Alerts & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Bottleneck Radar & Department Status */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-emerald-600 animate-pulse" />
              <h3 className="font-bold text-slate-900 text-base">Hospital Resource Bottleneck Radar</h3>
            </div>
            <span className="text-xs text-slate-400">Live Telemetry Refresh (every 10s)</span>
          </div>

          <div className="space-y-4">
            {/* ICU Saturation Card */}
            <div className="p-4 rounded-xl bg-red-50/60 border border-red-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-600 text-white uppercase">Critical</span>
                  <span className="font-bold text-slate-900 text-sm">Intensive Care Unit (ICU) Capacity Warning</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  ICU bed occupancy is at <strong>80%</strong>. Predictive model forecasts +2 admissions within 120 minutes.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab && onNavigateTab("beds")}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition cursor-pointer"
              >
                Inspect ICU Beds
              </button>
            </div>

            {/* Diagnostic Queue Card */}
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-600 text-white uppercase">High Load</span>
                  <span className="font-bold text-slate-900 text-sm">Digital X-Ray Suite 1 Queue Congestion</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  7 patients in line (38 min average wait). Suite 2 (Fast-Track) is idle with only 1 patient.
                </p>
              </div>
              <button
                onClick={handleRerouteDiagnostics}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition cursor-pointer"
              >
                1-Click Balance
              </button>
            </div>

            {/* Staff Workload */}
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-600 text-white uppercase">Nominal</span>
                  <span className="font-bold text-slate-900 text-sm">Emergency & Trauma Staff Ready</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Dr. Sarah Johnson, Dr. Michael Chen & Nurse N-07 ready for rapid emergency resuscitation.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab && onNavigateTab("staff")}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer"
              >
                View Staff
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Live Operational Alerts */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-slate-700" />
                Live Audit & Alerts
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                {alerts.length} total
              </span>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {alerts.slice(0, 5).map((a, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border text-xs ${
                    a.severity === "CRITICAL"
                      ? "bg-red-50/80 border-red-200 text-red-900"
                      : a.severity === "HIGH"
                      ? "bg-amber-50/80 border-amber-200 text-amber-900"
                      : "bg-slate-50 border-slate-200 text-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold mb-1">
                    <span>{a.type || "SYSTEM ALERT"}</span>
                    <span className="text-[10px] opacity-75">{a.alertId}</span>
                  </div>
                  <p className="text-slate-700">{a.message}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigateTab && onNavigateTab("copilot")}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-xs shadow-md transition cursor-pointer"
            >
              <Cpu className="w-4 h-4" />
              Ask Nexus AI Operations Copilot
              <ChevronRight className="w-4 h-4 ml-auto" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
