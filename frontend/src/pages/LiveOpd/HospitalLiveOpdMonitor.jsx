// frontend/src/pages/LiveOpd/HospitalLiveOpdMonitor.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  RefreshCw,
  Activity,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Radio,
  Users,
  Eye,
  AlertTriangle,
  Coffee,
  Check,
  Stethoscope,
} from "lucide-react";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import {
  getDefaultOpdSessions,
  getDoctorOpdProfile,
  getStatusBadgeInfo,
} from "../../data/opdDemoData";
import LiveOpdModal from "../../components/LiveOpdModal/LiveOpdModal";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function HospitalLiveOpdMonitor() {
  const [sessions, setSessions] = useState(() => getDefaultOpdSessions());
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/opd/sessions`);
      if (res.ok) {
        const json = await res.json();
        if (json?.data && Array.isArray(json.data) && json.data.length > 0) {
          setSessions(json.data);
          setLastUpdated(new Date());
          return;
        }
      }
    } catch (err) {
      console.warn("OPD fetch note, retaining active live sessions:", err.message);
    } finally {
      setLoading(false);
    }
    // Fallback if empty to ensure the monitor is never blank
    setSessions((prev) => (prev && prev.length > 0 ? prev : getDefaultOpdSessions()));
  };

  useEffect(() => {
    fetchSessions();

    // Setup polling every 3 seconds for real-time live updates
    const timer = setInterval(fetchSessions, 3000);

    // Also connect to SSE real-time stream if available
    let sse;
    try {
      sse = new EventSource(`${API_BASE}/api/nexus/events`);
      sse.onmessage = () => fetchSessions();
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
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
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

  const openQueueModal = (doctorItem) => {
    const prof = getDoctorOpdProfile(
      doctorItem.doctorId || doctorItem.id,
      doctorItem.name
    );
    // Overlay the current session's live values
    const merged = {
      ...prof,
      ...doctorItem,
      status: doctorItem.status || prof.status,
      currentToken: doctorItem.currentToken || prof.currentToken,
      delayMinutes: doctorItem.delayMinutes ?? prof.delayMinutes,
      estTurn: doctorItem.estNextTurn || prof.estTurn,
    };
    setSelectedDoctor(merged);
    setIsModalOpen(true);
  };

  // Metrics calculation
  const metrics = useMemo(() => {
    const total = sessions.length;
    const inConsultation = sessions.filter((s) => s.status === "IN_CONSULTATION").length;
    const available = sessions.filter((s) => s.status === "AVAILABLE").length;
    const delayed = sessions.filter((s) => s.status === "DELAYED").length;
    const onBreak = sessions.filter((s) => s.status === "ON_BREAK").length;
    const emergency = sessions.filter((s) => s.status === "EMERGENCY").length;
    const totalWaiting = sessions.reduce((acc, s) => acc + (s.waitingCount || 0), 0);
    const totalCompleted = sessions.reduce((acc, s) => acc + (s.completedCount || 0), 0);

    return {
      total,
      inConsultation,
      available,
      delayed,
      onBreak,
      emergency,
      totalWaiting,
      totalCompleted,
    };
  }, [sessions]);

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    if (activeFilter === "ALL") return sessions;
    return sessions.filter((s) => s.status === activeFilter);
  }, [sessions, activeFilter]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Header Banner */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Hospital Central Live OPD Monitor
              </h1>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 uppercase tracking-wide flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                MediCare+ OPD REALTIME
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Live tracking of all doctor OPD sessions, active consulting tokens, delays, and patient queues across departments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/doctor-admin/login"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs shadow-2xs transition-all cursor-pointer"
            >
              <Stethoscope size={15} className="text-slate-600" />
              Doctor Portal Login
            </Link>
            <button
              onClick={fetchSessions}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm hover:shadow transition-all shrink-0 cursor-pointer"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Refresh Monitor
            </button>
          </div>
        </div>

        {/* Real-time KPI Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Doctors
              </span>
              <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                🩺
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 font-mono">
              {metrics.total}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 font-medium">
              Across all OPD departments
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-blue-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                In Consultation
              </span>
              <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                🔵
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-blue-900 mt-2 font-mono">
              {metrics.inConsultation}
            </div>
            <div className="text-[11px] text-blue-600 mt-1 font-medium">
              Active patient tokens running
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Available On Duty
              </span>
              <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                🟢
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-900 mt-2 font-mono">
              {metrics.available}
            </div>
            <div className="text-[11px] text-emerald-600 mt-1 font-medium">
              Ready for immediate consult
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200/80 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                Delayed / Break
              </span>
              <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                🟠
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-900 mt-2 font-mono">
              {metrics.delayed + metrics.onBreak + metrics.emergency}
            </div>
            <div className="text-[11px] text-amber-600 mt-1 font-medium">
              Dynamic buffer ETA adjusted
            </div>
          </div>
        </div>

        {/* Doctor OPD Session Overview Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Doctor OPD Session Overview
              </h2>
              <span className="text-xs font-semibold text-slate-500">
                Showing {filteredSessions.length} of {sessions.length} Active Sessions
              </span>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { key: "ALL", label: `All (${sessions.length})` },
                { key: "IN_CONSULTATION", label: `In Consultation (${metrics.inConsultation})` },
                { key: "AVAILABLE", label: `Available (${metrics.available})` },
                { key: "DELAYED", label: `Delayed (${metrics.delayed})` },
                { key: "ON_BREAK", label: `On Break (${metrics.onBreak})` },
                { key: "EMERGENCY", label: `Emergency (${metrics.emergency})` },
              ].map((btn) => (
                <button
                  key={btn.key}
                  type="button"
                  onClick={() => setActiveFilter(btn.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeFilter === btn.key
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
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
                  <th className="py-3.5 px-6 text-right">Live Queue Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredSessions.map((s) => (
                  <tr key={s.id || s.doctorId || s.name} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{s.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium">{s.specialization}</td>
                    <td className="py-4 px-6">{getStatusBadge(s.status)}</td>
                    <td className="py-4 px-6 font-black text-slate-900 text-sm font-mono">{s.currentToken}</td>
                    <td className="py-4 px-6 font-bold text-emerald-600">{s.completedCount}</td>
                    <td className="py-4 px-6 font-bold text-amber-600">{s.waitingCount}</td>
                    <td className="py-4 px-6 font-medium text-slate-700">{s.estNextTurn || "—"}</td>
                    <td className="py-4 px-6 font-bold text-amber-600">
                      {s.delayMinutes > 0 ? (
                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                          +{s.delayMinutes} min
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          On Time
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => openQueueModal(s)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold shadow-2xs hover:shadow transition-all cursor-pointer"
                        title="View Token Queue & Realtime Schedule"
                      >
                        <Radio size={13} className="text-teal-600 animate-pulse" />
                        <span>View Live Queue</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live sync footer */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 px-2 gap-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live OPD Sync Active · Asia/Kolkata (IST)</span>
          </div>
          <span>Last polled: {lastUpdated.toLocaleTimeString()}</span>
        </div>
      </main>

      <Footer />

      {/* Live OPD Queue Modal */}
      <LiveOpdModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        doctorProfile={selectedDoctor}
      />
    </div>
  );
}
