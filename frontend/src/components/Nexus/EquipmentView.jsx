// admin/src/components/Nexus/EquipmentView.jsx
import React, { useState, useEffect } from "react";
import { BatteryCharging, CheckCircle2, HeartPulse, RefreshCw, ShieldCheck, Stethoscope, Zap } from "lucide-react";
import { nexusApi } from "./nexusApi";

export default function EquipmentView() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("ALL");

  const loadEquipment = async () => {
    try {
      const data = await nexusApi.getEquipment();
      setEquipment(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEquipment();
  }, []);

  const filtered = equipment.filter(e => {
    if (filterType !== "ALL" && e.type.toLowerCase() !== filterType.toLowerCase()) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-rose-600" />
            Critical Care & Life-Support Equipment Tracker
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Real-time battery telemetry, calibration certificates, and RTLS positioning across life-critical hospital assets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white text-slate-700"
          >
            <option value="ALL">All Categories</option>
            <option value="ventilator">Ventilators</option>
            <option value="ecg">ECG Units</option>
            <option value="defibrillator">Defibrillators</option>
            <option value="infusion pump">Infusion Pumps</option>
          </select>

          <button onClick={loadEquipment} className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-600 cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(item => (
          <div key={item.equipmentId} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500 transition">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {item.type}
                </span>
                <h3 className="font-extrabold text-base text-slate-900 mt-1">{item.name}</h3>
                <span className="text-xs text-slate-400 font-mono">{item.equipmentId}</span>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  item.status === "AVAILABLE" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
                }`}
              >
                {item.status}
              </span>
            </div>

            <div className="mt-4 space-y-2 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span>Current Location:</span>
                <span className="font-semibold text-slate-800">{item.currentLocation}</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Active Patient:</span>
                <span className="font-semibold text-slate-800">{item.assignedPatient || "Unassigned"}</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Calibration Status:</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> {item.maintenanceStatus}
                </span>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span className="flex items-center gap-1">
                    <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" /> Battery Health
                  </span>
                  <span className="font-bold text-slate-800">{item.batteryLevel}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${item.batteryLevel}%` }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
