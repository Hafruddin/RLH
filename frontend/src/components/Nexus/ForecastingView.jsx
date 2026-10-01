// admin/src/components/Nexus/ForecastingView.jsx
import React, { useState, useEffect } from "react";
import { AlertTriangle, Clock, RefreshCw, Sparkles, TrendingUp, Zap } from "lucide-react";
import { nexusApi } from "./nexusApi";

export default function ForecastingView() {
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const loadForecasts = async () => {
    try {
      const data = await nexusApi.getForecasts();
      setForecasts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForecasts();
  }, []);

  const handleRegenerate = async () => {
    setGenerating(true);
    try {
      await loadForecasts();
    } finally {
      setGenerating(false);
    }
  };

  const getRiskBadge = (risk) => {
    switch (risk) {
      case "CRITICAL": return "bg-red-600 text-white";
      case "HIGH": return "bg-amber-600 text-white";
      default: return "bg-emerald-600 text-white";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            Multi-Horizon Predictive Hospital Demand Model
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Statistical & machine-learning projections across Emergency, ICU, and Diagnostics for +1h, +2h, and +4h planning windows.
          </p>
        </div>

        <button
          onClick={handleRegenerate}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${generating ? "animate-spin" : ""}`} />
          {generating ? "Recalculating..." : "Re-Calculate Demand Horizon"}
        </button>
      </div>

      {/* Multi-Horizon Horizon Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {forecasts.map((f, idx) => (
          <div
            key={idx}
            className={`bg-white p-5 rounded-2xl border-2 transition shadow-xs flex flex-col justify-between ${
              f.riskLevel === "CRITICAL"
                ? "border-red-300 bg-red-50/15"
                : f.riskLevel === "HIGH"
                ? "border-amber-300 bg-amber-50/15"
                : "border-slate-200"
            }`}
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {f.department}
                  </span>
                  <h3 className="font-extrabold text-base text-slate-900 mt-1 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-500" />
                    {f.timeWindow}
                  </h3>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getRiskBadge(f.riskLevel)}`}>
                  {f.riskLevel}
                </span>
              </div>

              {/* Load Projections */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Current Load</span>
                  <span className="text-lg font-black text-slate-700">{f.currentLoad}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Projected</span>
                  <span className={`text-lg font-black ${f.predictedLoad > f.currentLoad ? "text-red-600" : "text-slate-900"}`}>
                    {f.predictedLoad} {f.predictedLoad > f.currentLoad && `(+${f.predictedLoad - f.currentLoad})`}
                  </span>
                </div>
              </div>

              {/* Confidence */}
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>Model Confidence</span>
                <span className="font-bold text-emerald-600">{f.confidence}%</span>
              </div>

              {/* Recommendations */}
              <div className="mt-3 pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-700 block mb-1">Autonomous Actions:</span>
                <ul className="text-[11px] text-slate-600 space-y-1">
                  {(f.recommendedActions || []).map((rec, rIdx) => (
                    <li key={rIdx} className="flex items-start gap-1">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
