// admin/src/components/Nexus/OtManagerView.jsx
import React, { useState, useEffect } from "react";
import { Activity, AlertTriangle, Calendar, CheckCircle2, Clock, Plus, RefreshCw, Scissors, User } from "lucide-react";
import { nexusApi } from "./nexusApi";

export default function OtManagerView() {
  const [ots, setOts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOt, setModalOt] = useState(null);
  const [surgeryType, setSurgeryType] = useState("Emergency Laparotomy / Hemostasis");
  const [patientName, setPatientName] = useState("Trauma Patient P-109");
  const [surgeonName, setSurgeonName] = useState("Dr. Rajesh Gupta");

  const loadOts = async () => {
    try {
      const data = await nexusApi.getOperatingTheatres();
      setOts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOts();
  }, []);

  const handleScheduleSurgery = async () => {
    if (!modalOt) return;
    try {
      await nexusApi.scheduleOT({
        otId: modalOt.otId,
        surgeryType,
        patientName,
        surgeonName,
        priority: "EMERGENCY",
        durationMinutes: 90
      });
      setModalOt(null);
      loadOts();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-purple-600" />
            Operating Theatre (OT) Suites Orchestrator
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Dynamic scheduling, emergency surgical pre-emption, and sterile turnaround management across 8 surgical suites.
          </p>
        </div>

        <button onClick={loadOts} className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-600 cursor-pointer">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {ots.map(ot => (
          <div
            key={ot.otId}
            className={`bg-white p-5 rounded-2xl border-2 transition shadow-xs flex flex-col justify-between ${
              ot.status === "OCCUPIED"
                ? "border-purple-300 bg-purple-50/20"
                : ot.status === "AVAILABLE"
                ? "border-emerald-300 bg-emerald-50/20"
                : "border-slate-300 bg-slate-50/40"
            }`}
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                    {ot.otId}
                  </span>
                  <h3 className="font-extrabold text-sm text-slate-900 mt-1">{ot.name}</h3>
                  <span className="text-[11px] text-slate-500">{ot.specialty}</span>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    ot.status === "AVAILABLE"
                      ? "bg-emerald-600 text-white"
                      : ot.status === "OCCUPIED"
                      ? "bg-purple-600 text-white"
                      : "bg-slate-700 text-white"
                  }`}
                >
                  {ot.status}
                </span>
              </div>

              {/* Current Procedure or Standby */}
              <div className="mt-4 pt-3 border-t border-slate-200/60">
                {ot.currentProcedure ? (
                  <div className="space-y-1.5 text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-purple-200">
                    <div className="font-bold text-purple-900 flex items-center gap-1">
                      <Scissors className="w-3 h-3 text-purple-600" />
                      {ot.currentProcedure.surgeryType}
                    </div>
                    <div className="text-[11px] text-slate-500">Patient: {ot.currentProcedure.patientName}</div>
                    <div className="text-[11px] text-slate-500">Lead: {ot.currentProcedure.surgeonName}</div>
                    <div className="text-[10px] font-semibold text-purple-700 flex items-center gap-1 pt-1">
                      <Clock className="w-3 h-3" /> Live in progress (~{ot.currentProcedure.durationMinutes} min)
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs text-emerald-800">
                    <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                    Clean & Prepped for Emergency Trauma
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {ot.equipment?.slice(0, 1).join("") || "Standard Sterile"}
              </span>

              {ot.status === "AVAILABLE" && (
                <button
                  onClick={() => setModalOt(ot)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition cursor-pointer"
                >
                  Book Surgery
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Emergency Surgery Booking Modal */}
      {modalOt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Scissors className="w-5 h-5 text-purple-600" />
              Schedule Emergency Procedure in {modalOt.otId}
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Surgery / Procedure</label>
              <input
                type="text"
                value={surgeryType}
                onChange={e => setSurgeryType(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Patient Name / Identifier</label>
              <input
                type="text"
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Lead Surgeon</label>
              <input
                type="text"
                value={surgeonName}
                onChange={e => setSurgeonName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setModalOt(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleSurgery}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow-md cursor-pointer"
              >
                Confirm Surgery Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
