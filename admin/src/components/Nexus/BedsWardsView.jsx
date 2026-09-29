// admin/src/components/Nexus/BedsWardsView.jsx
import React, { useState, useEffect } from "react";
import { Bed, CheckCircle2, Filter, RefreshCw, ShieldAlert, Sparkles, XCircle } from "lucide-react";
import { nexusApi } from "./nexusApi";

export default function BedsWardsView() {
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWard, setSelectedWard] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [inspectBed, setInspectBed] = useState(null);

  const loadBeds = async () => {
    try {
      const data = await nexusApi.getBeds();
      setBeds(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBeds();
  }, []);

  const handleStatusChange = async (bedId, newStatus) => {
    await nexusApi.updateBedStatus(bedId, newStatus);
    loadBeds();
    if (inspectBed && inspectBed.bedId === bedId) {
      setInspectBed(prev => ({ ...prev, status: newStatus }));
    }
  };

  const filteredBeds = beds.filter(b => {
    if (selectedWard !== "ALL" && b.wardId !== selectedWard) return false;
    if (selectedStatus !== "ALL" && b.status !== selectedStatus) return false;
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "AVAILABLE": return "bg-emerald-50 text-emerald-700 border-emerald-300 hover:border-emerald-500";
      case "OCCUPIED": return "bg-rose-50 text-rose-700 border-rose-200 hover:border-rose-400";
      case "MAINTENANCE": return "bg-slate-200 text-slate-800 border-slate-400";
      case "CLEANING": return "bg-blue-50 text-blue-700 border-blue-200";
      default: return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "AVAILABLE": return "bg-emerald-600 text-white";
      case "OCCUPIED": return "bg-rose-600 text-white";
      case "MAINTENANCE": return "bg-slate-800 text-white";
      case "CLEANING": return "bg-blue-600 text-white";
      default: return "bg-amber-600 text-white";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Bed className="w-6 h-6 text-emerald-600" />
            Hospital Bed & Ward Orchestration Matrix
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Real-time status across 48 operational hospital beds. Click any bed to inspect telemetry, attached devices, or change status.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedWard}
            onChange={e => setSelectedWard(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white text-slate-700"
          >
            <option value="ALL">All Wards (48 Beds)</option>
            <option value="WARD-ICU">ICU Ward (10 Beds)</option>
            <option value="WARD-EMG">Emergency Ward (10 Beds)</option>
            <option value="WARD-GEN-A">General Ward A (10 Beds)</option>
            <option value="WARD-GEN-B">General Ward B (10 Beds)</option>
            <option value="WARD-SURG">Surgical Recovery (8 Beds)</option>
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="OCCUPIED">Occupied</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="CLEANING">Cleaning</option>
          </select>

          <button
            onClick={loadBeds}
            className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-600 cursor-pointer"
            title="Refresh bed grid"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Ward Beds Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-3">
        {filteredBeds.map(bed => (
          <div
            key={bed.bedId}
            onClick={() => setInspectBed(bed)}
            className={`p-3 rounded-xl border-2 transition-all cursor-pointer shadow-2xs hover:scale-102 flex flex-col justify-between min-h-[110px] ${getStatusColor(
              bed.status
            )} ${inspectBed?.bedId === bed.bedId ? "ring-2 ring-emerald-600 scale-102" : ""}`}
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-sm text-slate-900">{bed.bedId}</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${getStatusBadge(bed.status)}`}>
                {bed.status}
              </span>
            </div>

            <div className="my-1.5 text-[11px] text-slate-600 font-medium">
              <div>{bed.bedType}</div>
              {bed.patientId && <div className="text-slate-900 font-bold truncate">Pt: {bed.patientId}</div>}
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
              <span>{bed.isolationCapable ? "🛡️ Isolate" : "Standard"}</span>
              <span className="text-[9px]">Rm {bed.roomNumber}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Inspect Bed Drawer / Modal */}
      {inspectBed && (
        <div className="bg-white rounded-2xl p-6 border-2 border-emerald-500/40 shadow-lg animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Bed Inspector</span>
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                {inspectBed.bedId} <span className="text-sm font-normal text-slate-500">({inspectBed.location})</span>
              </h2>
            </div>
            <button
              onClick={() => setInspectBed(null)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1 bg-slate-100 rounded-lg cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 uppercase font-semibold">Ward Group</span>
              <div className="text-sm font-bold text-slate-800">{inspectBed.wardId}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 uppercase font-semibold">Current Patient</span>
              <div className="text-sm font-bold text-slate-800">{inspectBed.patientId || "Unassigned"}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 uppercase font-semibold">Isolation Specification</span>
              <div className="text-sm font-bold text-slate-800">{inspectBed.isolationCapable ? "Negative Pressure (Level 3)" : "Standard Non-Isolate"}</div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 uppercase font-semibold">Attached Equipment</span>
              <div className="text-xs font-bold text-slate-800">{(inspectBed.equipment || ["Standard IV"]).join(", ")}</div>
            </div>
          </div>

          {/* Quick Status Control Buttons */}
          <div className="border-t border-slate-100 pt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-700 mr-2">Override Bed Status:</span>
            <button
              onClick={() => handleStatusChange(inspectBed.bedId, "AVAILABLE")}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
            >
              Mark Available
            </button>
            <button
              onClick={() => handleStatusChange(inspectBed.bedId, "OCCUPIED")}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
            >
              Mark Occupied
            </button>
            <button
              onClick={() => handleStatusChange(inspectBed.bedId, "MAINTENANCE")}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-800 text-white hover:bg-slate-900 cursor-pointer"
            >
              Mark Maintenance (Simulate Defect)
            </button>
            <button
              onClick={() => handleStatusChange(inspectBed.bedId, "CLEANING")}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
            >
              Mark Cleaning
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
