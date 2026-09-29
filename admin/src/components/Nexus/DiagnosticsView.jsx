// admin/src/components/Nexus/DiagnosticsView.jsx
import React, { useState, useEffect } from "react";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, Microscope, RefreshCw, Zap } from "lucide-react";
import { nexusApi } from "./nexusApi";

export default function DiagnosticsView() {
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [rebalancing, setRebalancing] = useState(false);

  const loadDiagnostics = async () => {
    try {
      const data = await nexusApi.getDiagnostics();
      setDiagnostics(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiagnostics();
  }, []);

  const handleReroute = async () => {
    setRebalancing(true);
    setFeedback("");
    try {
      const res = await nexusApi.rerouteDiagnostics("DIAG-XR-01", "DIAG-XR-02", 4);
      setFeedback("⚖️ Autonomous Load-Balancing Activated: 4 patients moved from Suite 1 to Suite 2. Wait time reduced to 14 minutes!");
      loadDiagnostics();
    } catch (e) {
      setFeedback("Failed to reroute diagnostics");
    } finally {
      setRebalancing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Microscope className="w-6 h-6 text-teal-600" />
            Diagnostic Suites & Dynamic Load-Balancing Engine
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Real-time queue monitoring across radiology, CT, MRI, and ultrasound imaging with autonomous load-balancing rerouting.
          </p>
        </div>

        <button onClick={loadDiagnostics} className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-600 cursor-pointer">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {feedback && (
        <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold flex items-center justify-between animate-fade-in">
          <span>{feedback}</span>
          <button onClick={() => setFeedback("")} className="text-teal-600 underline cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* 1-Click Load-Balancing Spotlight Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-slate-900 to-slate-900 rounded-2xl p-6 text-white border border-teal-500/30">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950 uppercase tracking-wider">
                Bottleneck Detected
              </span>
              <span className="text-xs text-teal-300">X-Ray Suite 1: Queue Saturation</span>
            </div>
            <h2 className="text-xl font-bold">Dynamic Queue Re-Routing Recommendation</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Digital X-Ray Suite 1 has <strong>7 patients in queue (38 min wait)</strong>, while adjacent Suite 2 (Fast-Track) is idle with only 1 patient. Autonomous re-routing can immediately balance patient throughput.
            </p>
          </div>

          <button
            onClick={handleReroute}
            disabled={rebalancing}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 font-black text-xs shadow-lg transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-current" />
            {rebalancing ? "Balancing Queues..." : "Re-Route 4 Patients to Suite 2"}
          </button>
        </div>
      </div>

      {/* Diagnostic Suites Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {diagnostics.map(suite => (
          <div
            key={suite.resourceId}
            className={`bg-white p-5 rounded-2xl border-2 transition shadow-xs ${
              suite.currentQueue > 5 ? "border-amber-300 bg-amber-50/15" : "border-slate-200"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {suite.type} • Floor {suite.floor}
                </span>
                <h3 className="font-extrabold text-base text-slate-900 mt-1">{suite.name}</h3>
                <span className="text-xs text-slate-400 font-mono">{suite.resourceId}</span>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  suite.currentQueue > 5 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {suite.status}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Queue Depth</span>
                <span className={`text-xl font-black ${suite.currentQueue > 5 ? "text-amber-600" : "text-slate-900"}`}>
                  {suite.currentQueue} patients
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Estimated Wait</span>
                <span className={`text-xl font-black ${suite.avgWaitMinutes > 30 ? "text-red-600" : "text-emerald-600"}`}>
                  {suite.avgWaitMinutes} min
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Throughput: {suite.throughputPerHour || 6} / hr</span>
              <span className="font-semibold text-slate-700">{suite.location}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
