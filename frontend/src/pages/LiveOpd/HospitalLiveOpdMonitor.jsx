// frontend/src/pages/LiveOpd/HospitalLiveOpdMonitor.jsx
import React, { useState, useEffect } from "react";
import { RefreshCw, Activity, ShieldAlert, Clock, CheckCircle2 } from "lucide-react";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function HospitalLiveOpdMonitor() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/opd/sessions`);
      if (res.ok) {
        const json = await res.json();
        if (json?.data) {
          setSessions(json.data);
          setLastUpdated(new Date());
        }
      }
    } catch (err) {
      console.warn("OPD fetch note:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();

    // Setup polling every 3 seconds for real-time live updates
    const timer = setInterval(fetchSessions, 3000);

    // Also connect to SSE real-time stream if available
    let sse;
    try {
      sse = new EventSource(`${API_BASE}/api/nexus/events`);
      sse.onmessage = () => {
        fetchSessions();
      };
      sse.addEventListener("QUEUE_UPDATED", () => fetchSessions());
      sse.addEventListener("DELAY_UPDATED", () => fetchSessions());
      sse.addEventListener("OPD_UPDATED", () => fetchSessions());
    } catch (e) {}

    return () => {
      clearInterval(timer);
      if (sse) sse.close();
    };
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "IN_CONSULTATION":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            IN CONSULTATION
          </span>
        );
      case "ON_BREAK":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
            <span className="w-2 h-2 rounded-full bg-purple-600"></span>
            ON BREAK
          </span>
        );
      case "DELAYED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            DELAYED
          </span>
        );
      case "EMERGENCY":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
            EMERGENCY
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            AVAILABLE
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Header Banner */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Hospital Central Live OPD Monitor
              </h1>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-wide">
                MediCare+ OPD REALTIME
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Live tracking of all doctor OPD sessions, active consulting tokens, delays, and queues.
            </p>
          </div>

          <button
            onClick={fetchSessions}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm hover:shadow transition-all shrink-0 cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh Monitor
          </button>
        </div>

        {/* Doctor OPD Session Overview Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Doctor OPD Session Overview
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              Total Active Doctors: {sessions.length}
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Doctor</th>
                  <th className="py-3.5 px-6">Specialization</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Current Token</th>
                  <th className="py-3.5 px-6">Completed</th>
                  <th className="py-3.5 px-6">Waiting</th>
                  <th className="py-3.5 px-6">Est. Next Turn</th>
                  <th className="py-3.5 px-6">Delay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {sessions.map((s) => (
                  <tr key={s.id || s.name} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">{s.name}</td>
                    <td className="py-4 px-6 text-slate-600">{s.specialization}</td>
                    <td className="py-4 px-6">{getStatusBadge(s.status)}</td>
                    <td className="py-4 px-6 font-black text-slate-900 text-sm">{s.currentToken}</td>
                    <td className="py-4 px-6 font-bold text-emerald-600">{s.completedCount}</td>
                    <td className="py-4 px-6 font-bold text-amber-600">{s.waitingCount}</td>
                    <td className="py-4 px-6 font-medium text-slate-700">{s.estNextTurn || "—"}</td>
                    <td className="py-4 px-6 font-bold text-amber-600">
                      {s.delayMinutes > 0 ? (
                        <span className="inline-flex items-center gap-1">
                          +{s.delayMinutes} min
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">On Time</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live sync footer */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400 px-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live OPD Sync Active · Asia/Kolkata</span>
          </div>
          <span>Last polled: {lastUpdated.toLocaleTimeString()}</span>
        </div>
      </main>

      <Footer />
    </div>
  );
}
