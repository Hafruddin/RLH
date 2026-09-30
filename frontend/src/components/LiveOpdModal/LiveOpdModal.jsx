import React from "react";
import { Link } from "react-router-dom";
import { X, Radio, Clock, Users, ExternalLink, Activity, AlertTriangle, Coffee, CheckCircle2 } from "lucide-react";
import { getStatusBadgeInfo } from "../../data/opdDemoData";

export default function LiveOpdModal({ isOpen, onClose, doctorProfile }) {
  if (!isOpen || !doctorProfile) return null;

  const statusInfo = getStatusBadgeInfo(doctorProfile.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-blue-950 text-white p-5 sm:p-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center font-bold text-xl shrink-0 shadow-inner">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-teal-400 text-teal-950">
                  Live OPD Queue
                </span>
                <span className="text-xs text-teal-200 font-medium">
                  {doctorProfile.cabin || "OPD Cabin"}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-1 text-white">
                {doctorProfile.name}
              </h2>
              <p className="text-xs text-teal-200/80">
                {doctorProfile.specialization} · Real-time Patient Queue
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status Bar */}
        <div className="bg-gray-50 border-b border-gray-100 p-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Doctor Status:
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1.5 ${statusInfo.colorClass}`}>
              <span className={`w-2 h-2 rounded-full ${statusInfo.dotColor}`}></span>
              {statusInfo.badge}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-gray-700">
            <div>
              Current Token: <strong className="text-blue-900 font-black text-sm">{doctorProfile.currentToken}</strong>
            </div>
            <div>
              Waiting: <strong className="text-teal-700 font-black text-sm">{doctorProfile.waitingCount}</strong>
            </div>
            <div>
              Est. Turn: <strong className="text-gray-900 font-black text-sm">{doctorProfile.estTurn || "11:30 AM IST"}</strong>
            </div>
          </div>
        </div>

        {/* Modal Body: Queue List */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
              Today's Consultation Schedule & Queue
            </h3>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 rounded-md px-2 py-0.5">
              Live Synchronized
            </span>
          </div>

          <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
            {(doctorProfile.patients || []).map((p, idx) => {
              const isConsulting = p.status === "In Consultation" || p.token === doctorProfile.currentToken;
              const isEmergency = p.status.includes("Emergency") || p.status.includes("STAT");
              const isCompleted = p.status === "Completed";

              return (
                <div
                  key={p.id || idx}
                  className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-colors ${
                    isConsulting
                      ? "bg-blue-50/70 border-l-4 border-l-blue-600"
                      : isEmergency
                      ? "bg-rose-50/70 border-l-4 border-l-rose-600"
                      : "bg-white hover:bg-gray-50/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-black text-gray-900 bg-gray-100 border border-gray-200 px-2 py-1 rounded-lg">
                      {p.token}
                    </span>
                    <div>
                      <div className="font-bold text-sm text-gray-900 flex items-center gap-2">
                        {p.name}
                        {isConsulting && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-600 text-white animate-pulse">
                            Inside Cabin
                          </span>
                        )}
                        {isEmergency && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-600 text-white">
                            Priority
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {p.time} · {p.notes || "General Consultation"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                        isCompleted
                          ? "bg-emerald-100 text-emerald-800"
                          : isConsulting
                          ? "bg-blue-100 text-blue-800"
                          : isEmergency
                          ? "bg-rose-100 text-rose-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {p.status}
                    </span>
                    <span className="text-xs font-bold text-gray-900 font-mono">
                      ₹{p.fee || doctorProfile.fee || 800}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Smart Delay Alert if present */}
          {doctorProfile.delayMinutes > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Smart Operational Alert:</strong> Doctor is running <strong>+{doctorProfile.delayMinutes} mins</strong> delayed. Turn times automatically recalculated in IST.
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Link
            to="/live-opd"
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold shadow-xs transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open Central Hospital Live OPD Monitor</span>
          </Link>

          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold bg-white hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
