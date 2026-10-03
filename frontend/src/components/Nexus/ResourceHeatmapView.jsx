// frontend/src/components/Nexus/ResourceHeatmapView.jsx
import React, { useState, useEffect } from "react";
import {
  Flame,
  Activity,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Bed,
  Stethoscope,
  Microscope,
  Pill,
  Users,
  TrendingUp,
  RefreshCw,
  CheckCircle2,
  Info,
  Layers,
  ArrowRight
} from "lucide-react";
import { nexusApi } from "./nexusApi";

export default function ResourceHeatmapView() {
  const [heatmapData, setHeatmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedHorizon, setSelectedHorizon] = useState("now"); // "now" | "2h" | "4h" | "8h"
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const loadData = async () => {
    try {
      const data = await nexusApi.getResourceHeatmap();
      if (data && data.success) {
        setHeatmapData(data);
      }
    } catch (e) {
      console.error("Failed to load heatmap data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 12000);
    return () => clearInterval(interval);
  }, []);

  const getPressureVal = (res) => {
    if (selectedHorizon === "2h") return res.forecast2h;
    if (selectedHorizon === "4h") return res.forecast4h;
    if (selectedHorizon === "8h") return res.forecast8h;
    return res.utilizationNow;
  };

  const getHeatmapColor = (percent) => {
    if (percent >= 90) return { bg: "bg-red-500", text: "text-red-950", border: "border-red-300", lightBg: "bg-red-50", badge: "Critical Shortage Risk (>=90%)", bar: "bg-red-600" };
    if (percent >= 75) return { bg: "bg-amber-500", text: "text-amber-950", border: "border-amber-300", lightBg: "bg-amber-50", badge: "High Utilization (75-89%)", bar: "bg-amber-500" };
    if (percent >= 55) return { bg: "bg-yellow-400", text: "text-yellow-950", border: "border-yellow-300", lightBg: "bg-yellow-50", badge: "Limited Capacity (55-74%)", bar: "bg-yellow-500" };
    return { bg: "bg-emerald-500", text: "text-emerald-950", border: "border-emerald-300", lightBg: "bg-emerald-50", badge: "Available / Low Pressure", bar: "bg-emerald-500" };
  };

  const categories = ["ALL", "Critical Care", "Inpatient Wards", "Surgical", "Clinical Staff", "Nursing Staff", "Diagnostics", "Pharmacy"];

  const filteredResources = (heatmapData?.resources || []).filter(r => {
    if (selectedCategory === "ALL") return true;
    return r.category === selectedCategory;
  });

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ─────────────────────────────────────────────────────────────
          1. Header & Predictive Pressure Concept Banner
      ────────────────────────────────────────────────────────────── */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-purple-500/10 via-amber-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Flame className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Hospital Resource Heatmap & Predictive Pressure Engine
              </h1>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Real-Time + Forecast
              </span>
            </div>
            <p className="text-slate-400 text-xs max-w-3xl leading-relaxed">
              Hospital-Wide Resource Intelligence: Real-time and predictive resource heatmaps across beds, ICU, doctors, nurses, OT suites, diagnostic machines, and pharmacy inventory. Combines current occupancy with pending requests, predicted arrivals, and expected discharges.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
              Refresh Heatmap
            </button>
          </div>
        </div>

        {/* Predictive Callout Box */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-300 font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              <strong>Predictive Insight:</strong> ICU current utilization 90% → forecasted utilization 96% in 2 hours → <span className="underline decoration-amber-400">shortage risk</span> → prepare alternative capacity.
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 shrink-0">
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-emerald-400">
              RPI = Demand / Available Capacity
            </span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. Forecast Horizon & Category Filter Toolbar
      ────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Forecast Horizon Pills */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-black text-slate-700 flex items-center gap-1.5 shrink-0">
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            Forecast Horizon:
          </span>
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
            <button
              onClick={() => setSelectedHorizon("now")}
              className={`px-3 py-1 rounded-md transition ${selectedHorizon === "now" ? "bg-white text-slate-900 font-black shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
            >
              Current Status
            </button>
            <button
              onClick={() => setSelectedHorizon("2h")}
              className={`px-3 py-1 rounded-md transition ${selectedHorizon === "2h" ? "bg-amber-500 text-slate-950 font-black shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
            >
              +2h Forecast
            </button>
            <button
              onClick={() => setSelectedHorizon("4h")}
              className={`px-3 py-1 rounded-md transition ${selectedHorizon === "4h" ? "bg-red-500 text-white font-black shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
            >
              +4h Forecast
            </button>
            <button
              onClick={() => setSelectedHorizon("8h")}
              className={`px-3 py-1 rounded-md transition ${selectedHorizon === "8h" ? "bg-purple-600 text-white font-black shadow-xs" : "text-slate-500 hover:text-slate-800"}`}
            >
              +8h Shift End
            </button>
          </div>
        </div>

        {/* Visual State Color Legend */}
        <div className="flex items-center gap-2 text-[10px] font-bold overflow-x-auto w-full sm:w-auto">
          <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> &lt;55% Available
          </span>
          <span className="flex items-center gap-1 text-yellow-800 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200">
            <span className="w-2 h-2 rounded-full bg-yellow-400" /> 55-74% Limited
          </span>
          <span className="flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> 75-89% High
          </span>
          <span className="flex items-center gap-1 text-red-800 bg-red-50 px-2 py-0.5 rounded border border-red-200">
            <span className="w-2 h-2 rounded-full bg-red-500" /> 90%+ Critical
          </span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl transition whitespace-nowrap cursor-pointer ${
              selectedCategory === cat
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {cat === "ALL" ? "All Hospital Resources" : cat}
          </button>
        ))}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. Real-Time & Predictive Resource Heatmap Grid
      ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredResources.map(res => {
          const pressure = getPressureVal(res);
          const color = getHeatmapColor(pressure);

          return (
            <div
              key={res.id}
              className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
                pressure >= 90
                  ? "border-red-300 ring-2 ring-red-100 bg-linear-to-b from-red-50/20 to-white"
                  : pressure >= 75
                  ? "border-amber-300 bg-linear-to-b from-amber-50/20 to-white"
                  : pressure >= 55
                  ? "border-yellow-200"
                  : "border-emerald-200"
              }`}
            >
              <div>
                {/* Category & Status Badge */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {res.category}
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${color.lightBg} ${color.text} border ${color.border} flex items-center gap-1`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${color.bg} animate-pulse`} />
                    {pressure}% Pressure ({color.badge.split(" ")[0]})
                  </span>
                </div>

                {/* Resource Title */}
                <h3 className="font-extrabold text-base text-slate-900 leading-snug">{res.name}</h3>

                {/* Capacity & Occupancy Counts */}
                <div className="grid grid-cols-3 gap-2 mt-3 p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 text-center">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Total Cap</span>
                    <span className="font-black text-sm text-slate-800">{res.capacityTotal}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Active/In-Use</span>
                    <span className="font-black text-sm text-purple-700">{res.occupied}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Available</span>
                    <span className="font-black text-sm text-emerald-600">{res.available}</span>
                  </div>
                </div>

                {/* Dynamic Utilization Progress Bar */}
                <div className="mt-3.5 space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600">
                      {selectedHorizon === "now" ? "Current Occupancy" : `${selectedHorizon} Forecasted Demand`}:
                    </span>
                    <span className={`font-black ${color.text}`}>{pressure}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${color.bar}`}
                      style={{ width: `${Math.min(100, pressure)}%` }}
                    />
                  </div>
                </div>

                {/* Multi-Horizon Forecast Strip */}
                <div className="grid grid-cols-3 gap-1.5 mt-3 pt-2.5 border-t border-slate-100 text-center text-xs">
                  <div className="p-1.5 rounded-lg bg-slate-50">
                    <span className="text-[9px] text-slate-400 block font-semibold">+2h</span>
                    <span className="font-black text-slate-700">{res.forecast2h}%</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-50">
                    <span className="text-[9px] text-slate-400 block font-semibold">+4h</span>
                    <span className="font-black text-slate-700">{res.forecast4h}%</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-50">
                    <span className="text-[9px] text-slate-400 block font-semibold">+8h</span>
                    <span className="font-black text-slate-700">{res.forecast8h}%</span>
                  </div>
                </div>

                {/* Resource Pressure Index (RPI) Signals */}
                <div className="mt-3 p-2 rounded-lg bg-purple-50/50 border border-purple-100/70 text-[11px] space-y-1">
                  <div className="flex items-center justify-between font-bold text-purple-900">
                    <span>Resource Pressure Index (RPI):</span>
                    <span className="px-1.5 py-0.2 rounded bg-purple-200 text-purple-950 font-black">{res.rpi}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 flex justify-between">
                    <span>Pending: +{res.signals?.pendingRequests || 0}</span>
                    <span>Arrivals: +{res.signals?.predictedArrivals || 0}</span>
                    <span>Discharges: -{res.signals?.expectedDischarges || 0}</span>
                  </div>
                </div>
              </div>

              {/* Action Required Banner */}
              <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] font-bold text-slate-500 truncate max-w-[200px]" title={res.actionRequired}>
                  {res.actionRequired}
                </span>
                <span className="text-[10px] font-black text-purple-600 hover:text-purple-800 flex items-center gap-0.5 cursor-pointer">
                  Details <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
