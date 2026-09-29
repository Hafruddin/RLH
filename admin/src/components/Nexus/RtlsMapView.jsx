// admin/src/components/Nexus/RtlsMapView.jsx
import React, { useState, useEffect } from "react";
import { Bed, HeartPulse, Layers, MapPin, Radio, RefreshCw, Stethoscope, User, Users, Zap } from "lucide-react";
import { nexusApi } from "./nexusApi";

export default function RtlsMapView() {
  const [floor, setFloor] = useState(1);
  const [locations, setLocations] = useState([]);
  const [selectedPin, setSelectedPin] = useState(null);

  const loadLocations = async () => {
    try {
      const data = await nexusApi.getRtls();
      setLocations(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadLocations();
    const interval = setInterval(loadLocations, 8000);
    return () => clearInterval(interval);
  }, []);

  const floorLocations = locations.filter(l => l.floor === floor);

  const getPinIcon = (icon) => {
    switch (icon) {
      case "doctor": return <Stethoscope className="w-3.5 h-3.5" />;
      case "nurse": return <Users className="w-3.5 h-3.5" />;
      case "ventilator": return <HeartPulse className="w-3.5 h-3.5" />;
      case "patient": return <Zap className="w-3.5 h-3.5" />;
      case "bed": return <Bed className="w-3.5 h-3.5" />;
      default: return <MapPin className="w-3.5 h-3.5" />;
    }
  };

  const getPinColor = (type, status) => {
    if (status === "CODE_RED") return "bg-red-600 text-white ring-4 ring-red-400/50 animate-bounce";
    if (status === "MAINTENANCE") return "bg-slate-800 text-white ring-2 ring-slate-400";
    if (type === "STAFF") return "bg-blue-600 text-white ring-2 ring-blue-300";
    if (type === "EQUIPMENT") return "bg-emerald-600 text-white ring-2 ring-emerald-300";
    if (type === "BED") return "bg-purple-600 text-white ring-2 ring-purple-300";
    return "bg-slate-700 text-white";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Radio className="w-6 h-6 text-emerald-600 animate-pulse" />
            Hospital 2D RTLS Telemetry Floorplan
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Ultra-Wideband (UWB) & BLE live location tracking of clinical staff, life-support ventilators, and admitted trauma patients.
          </p>
        </div>

        {/* Floor Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => { setFloor(1); setSelectedPin(null); }}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                floor === 1 ? "bg-white text-emerald-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Floor 1: Emergency & Diagnostics
            </button>
            <button
              onClick={() => { setFloor(2); setSelectedPin(null); }}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                floor === 2 ? "bg-white text-emerald-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Floor 2: Intensive Care (ICU)
            </button>
          </div>

          <button onClick={loadLocations} className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-600 cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2D Interactive Hospital Canvas Floorplan */}
      <div className="relative bg-slate-950 rounded-2xl border-2 border-slate-800 p-4 shadow-xl overflow-hidden min-h-[460px]">
        {/* Architectural Grid Background */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: "radial-gradient(#10b981 1px, transparent 1px), radial-gradient(#059669 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            backgroundPosition: "0 0, 16px 16px"
          }}
        />

        {/* Floor Zones Layout Boundaries */}
        {floor === 1 ? (
          <div className="absolute inset-6 grid grid-cols-3 gap-4 pointer-events-none opacity-40">
            <div className="border-2 border-dashed border-red-500 rounded-xl p-3 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-red-400 uppercase tracking-widest">Zone 1A: ER Triage & Trauma Bays</span>
              <span className="text-[10px] text-slate-400">Crash Carts / Beds ER-01..10</span>
            </div>
            <div className="border-2 border-dashed border-blue-500 rounded-xl p-3 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest">Zone 1B: Central Transit Concourse</span>
              <span className="text-[10px] text-slate-400">Elevators / Rapid Transit Corridor</span>
            </div>
            <div className="border-2 border-dashed border-teal-500 rounded-xl p-3 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-teal-400 uppercase tracking-widest">Zone 1C: Radiology & Diagnostics Wing</span>
              <span className="text-[10px] text-slate-400">X-Ray Suite 1 & 2 / CT Scanner</span>
            </div>
          </div>
        ) : (
          <div className="absolute inset-6 grid grid-cols-3 gap-4 pointer-events-none opacity-40">
            <div className="border-2 border-dashed border-purple-500 rounded-xl p-3 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-purple-400 uppercase tracking-widest">Zone 2A: ICU Pods 1 & 2</span>
              <span className="text-[10px] text-slate-400">Beds ICU-01..04</span>
            </div>
            <div className="border-2 border-dashed border-emerald-500 rounded-xl p-3 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">Zone 2B: High-Acuity Isolation Bay</span>
              <span className="text-[10px] text-slate-400">Beds ICU-05..07 (Negative Pressure)</span>
            </div>
            <div className="border-2 border-dashed border-amber-500 rounded-xl p-3 flex flex-col justify-between">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">Zone 2C: Surgical Step-Down & Overflow</span>
              <span className="text-[10px] text-slate-400">Beds ICU-08..10</span>
            </div>
          </div>
        )}

        {/* Live Moving Pins */}
        <div className="relative w-full h-[420px]">
          {floorLocations.map(pin => (
            <div
              key={pin.resourceId}
              onClick={() => setSelectedPin(pin)}
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 transition-all duration-700 hover:scale-125 ${
                selectedPin?.resourceId === pin.resourceId ? "scale-125" : ""
              }`}
            >
              <div className={`p-2 rounded-full shadow-lg flex items-center justify-center ${getPinColor(pin.type, pin.status)}`}>
                {getPinIcon(pin.icon)}
              </div>
              <div className="text-[10px] font-black text-white bg-slate-900/90 px-1.5 py-0.5 rounded shadow-sm border border-slate-700 mt-1 whitespace-nowrap text-center">
                {pin.name.split(" ")[0]}
              </div>
            </div>
          ))}
        </div>

        {/* Pin Details Drawer */}
        {selectedPin && (
          <div className="absolute bottom-4 right-4 bg-slate-900/95 border border-emerald-500/40 p-4 rounded-xl text-white shadow-2xl max-w-xs z-20 animate-fade-in backdrop-blur-md">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider">{selectedPin.type}</span>
              <button onClick={() => setSelectedPin(null)} className="text-slate-400 hover:text-white text-xs cursor-pointer">
                ✕
              </button>
            </div>
            <h4 className="font-extrabold text-sm text-white">{selectedPin.name}</h4>
            <p className="text-xs text-slate-300 mt-0.5">{selectedPin.role}</p>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] space-y-1 text-slate-300">
              <div><strong>Zone:</strong> {selectedPin.zone}</div>
              <div><strong>Floor:</strong> Level {selectedPin.floor}</div>
              <div><strong>Telemetry:</strong> {selectedPin.status || "NOMINAL"}</div>
              <div><strong>Coordinates:</strong> X:{selectedPin.x}m, Y:{selectedPin.y}m</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
