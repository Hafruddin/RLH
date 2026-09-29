// admin/src/components/Nexus/SimulationStudio.jsx
import React, { useState } from "react";
import { AlertTriangle, ArrowRight, CheckCircle2, Play, RefreshCw, Sliders, Sparkles, TrendingUp } from "lucide-react";
import { nexusApi } from "./nexusApi";

export default function SimulationStudio() {
  const [demandDelta, setDemandDelta] = useState(20); // +20%
  const [icuBedDelta, setIcuBedDelta] = useState(-2); // -2 beds
  const [nurseDelta, setNurseDelta] = useState(-3);   // -3 nurses
  const [diagDelta, setDiagDelta] = useState(30);     // +30%

  const [loading, setLoading] = useState(false);
  const [simResult, setSimResult] = useState(null);

  const handleRunSimulation = async () => {
    setLoading(true);
    try {
      const res = await nexusApi.runSimulation({
        demandDeltaPercent: demandDelta,
        icuBedDelta,
        nurseDelta,
        diagnosticDeltaPercent: diagDelta
      });
      setSimResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 rounded-2xl p-6 text-white border border-blue-500/30">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white uppercase tracking-wider">
            Operational What-If Simulator
          </span>
          <span className="text-xs text-slate-400">Stress-Testing & Contingency Planning</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black">
          Hospital Resource Stress-Testing Studio
        </h1>
        <p className="text-slate-300 text-sm mt-1 max-w-3xl">
          Configure prospective surge scenarios (e.g. mass casualty influx, sudden ICU bed failures, or acute staffing deficits) and evaluate projected bottleneck horizons and AI-generated contingency interventions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Parameter Sliders */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600" />
            Scenario Parameters
          </h2>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Patient Influx Surge</span>
              <span className="text-blue-600 font-bold">+{demandDelta}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={demandDelta}
              onChange={e => setDemandDelta(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>ICU Bed Availability Change</span>
              <span className="text-red-600 font-bold">{icuBedDelta} beds</span>
            </div>
            <input
              type="range"
              min="-5"
              max="0"
              step="1"
              value={icuBedDelta}
              onChange={e => setIcuBedDelta(Number(e.target.value))}
              className="w-full accent-red-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Nursing Staff Deficit</span>
              <span className="text-amber-600 font-bold">{nurseDelta} nurses</span>
            </div>
            <input
              type="range"
              min="-8"
              max="0"
              step="1"
              value={nurseDelta}
              onChange={e => setNurseDelta(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Diagnostic Demand Surge</span>
              <span className="text-teal-600 font-bold">+{diagDelta}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              step="10"
              value={diagDelta}
              onChange={e => setDiagDelta(Number(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg transition active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            {loading ? "Simulating Impact..." : "Run Stress-Test Simulation"}
          </button>
        </div>

        {/* Right 2 Cols: Simulation Comparison Output */}
        <div className="lg:col-span-2 space-y-6">
          {simResult ? (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6 animate-fade-in">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Baseline vs. Projected Stress Matrix
              </h3>

              {/* Before vs After Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Avg ER Wait</span>
                  <div className="text-sm font-semibold text-slate-400 mt-1 line-through">
                    {simResult.baseline?.avgWaitMinutes} min
                  </div>
                  <div className="text-xl font-black text-red-600 mt-0.5">
                    {simResult.simulated?.avgWaitMinutes} min
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">ICU Saturation</span>
                  <div className="text-sm font-semibold text-slate-400 mt-1">
                    {simResult.baseline?.icuOccupancyPercent}%
                  </div>
                  <div className="text-xl font-black text-red-600 mt-0.5">
                    {simResult.simulated?.icuOccupancyPercent}%
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Staff Workload</span>
                  <div className="text-sm font-semibold text-slate-400 mt-1">
                    {simResult.baseline?.staffWorkloadPercent}%
                  </div>
                  <div className="text-xl font-black text-amber-600 mt-0.5">
                    {simResult.simulated?.staffWorkloadPercent}%
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Bottlenecks</span>
                  <div className="text-sm font-semibold text-slate-400 mt-1">
                    {simResult.baseline?.bottlenecksDetected}
                  </div>
                  <div className="text-xl font-black text-red-600 mt-0.5">
                    {simResult.simulated?.bottlenecksDetected} active
                  </div>
                </div>
              </div>

              {/* Detected Bottlenecks List */}
              <div className="p-4 rounded-xl bg-red-50/60 border border-red-200">
                <span className="text-xs font-bold text-red-900 block mb-2">Severe System Bottlenecks Flagged:</span>
                <ul className="space-y-1 text-xs text-red-800">
                  {(simResult.simulated?.bottleneckList || []).map((b, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* AI Contingency Plan Recommendations */}
              <div className="p-4 rounded-xl bg-slate-900 text-white">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-4 h-4" />
                  Orchestrator Autonomous Mitigation Recommendations:
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {(simResult.orchestratorRecommendations || []).map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center">
              <Sliders className="w-12 h-12 text-slate-300 mb-4" />
              <h3 className="font-bold text-slate-700 text-lg">Simulator Ready</h3>
              <p className="text-xs text-slate-500 max-w-md mt-1 mb-6">
                Adjust the scenario sliders on the left (e.g. +20% Patient Influx, -2 ICU beds) and click <strong>"Run Stress-Test Simulation"</strong> to visualize predicted impact.
              </p>
              <button
                onClick={handleRunSimulation}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition cursor-pointer shadow-md"
              >
                Run Standard Hackathon Scenario
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
