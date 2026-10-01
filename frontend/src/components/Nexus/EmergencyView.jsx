// admin/src/components/Nexus/EmergencyView.jsx
import React, { useState } from "react";
import {
  AlertTriangle,
  Bed,
  CheckCircle2,
  Clock,
  HeartPulse,
  Send,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Users,
  Zap,
  RotateCcw
} from "lucide-react";
import { nexusApi } from "./nexusApi";

export default function EmergencyView() {
  const [patientId, setPatientId] = useState("P-104");
  const [patientName, setPatientName] = useState("Emergency Patient P-104");
  const [heartRate, setHeartRate] = useState(142);
  const [spO2, setSpO2] = useState(82);
  const [bp, setBp] = useState("85/55");
  const [acuity, setAcuity] = useState("CRITICAL");
  const [specialty, setSpecialty] = useState("Cardiologist");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(42);

  const handleTrigger = async () => {
    setLoading(true);
    try {
      const res = await nexusApi.triggerEmergency({
        patientId,
        patientName,
        vitals: { heartRate: Number(heartRate), spO2: Number(spO2), bp, temperature: 99.2, respiratoryRate: 28 },
        specialtyRequired: specialty,
        customAcuity: acuity
      });
      setResult(res);
      setTimerSeconds(res.allocation?.responseTime || 42);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 rounded-2xl p-6 text-white border border-red-500/30">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white uppercase tracking-wider">
            Critical Emergency Orchestration
          </span>
          <span className="text-xs text-slate-400">Response Benchmark: &lt;60s</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black">
          Autonomous Emergency Resource Orchestrator
        </h1>
        <p className="text-slate-300 text-sm mt-1 max-w-3xl">
          Instantly assesses patient acuity from vitals, conducts real-time constraint searches across 48 beds, 90 staff, and life-support assets, and mobilizes a dedicated critical care bundle with full audit transparency.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Patient Triage Admission Form */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <h2 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-red-600" />
            Patient Triage & Vital Parameters
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Patient Identifier</label>
              <input
                type="text"
                value={patientId}
                onChange={e => setPatientId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Patient Name</label>
              <input
                type="text"
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-hidden"
              />
            </div>

            {/* Vitals Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-red-50/50 p-3 rounded-xl border border-red-100">
                <label className="text-[11px] font-semibold text-red-800 block">Heart Rate (bpm)</label>
                <input
                  type="number"
                  value={heartRate}
                  onChange={e => setHeartRate(e.target.value)}
                  className="w-full mt-1 px-2 py-1 text-base font-bold text-red-600 bg-white border border-red-200 rounded"
                />
              </div>

              <div className="bg-red-50/50 p-3 rounded-xl border border-red-100">
                <label className="text-[11px] font-semibold text-red-800 block">SpO2 Oxygen (%)</label>
                <input
                  type="number"
                  value={spO2}
                  onChange={e => setSpO2(e.target.value)}
                  className="w-full mt-1 px-2 py-1 text-base font-bold text-red-600 bg-white border border-red-200 rounded"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="text-[11px] font-semibold text-slate-700 block">Blood Pressure</label>
                <input
                  type="text"
                  value={bp}
                  onChange={e => setBp(e.target.value)}
                  className="w-full mt-1 px-2 py-1 text-sm font-bold text-slate-800 bg-white border border-slate-200 rounded"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="text-[11px] font-semibold text-slate-700 block">Required Specialty</label>
                <input
                  type="text"
                  value={specialty}
                  onChange={e => setSpecialty(e.target.value)}
                  className="w-full mt-1 px-2 py-1 text-sm font-bold text-slate-800 bg-white border border-slate-200 rounded"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="text-xs font-semibold text-slate-600 block mb-1">Acuity Classification</label>
              <select
                value={acuity}
                onChange={e => setAcuity(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 font-semibold text-red-700 bg-red-50/40"
              >
                <option value="CRITICAL">CRITICAL (Code Red - Immediate Life Threat)</option>
                <option value="HIGH">HIGH (Urgent Resuscitation)</option>
                <option value="MEDIUM">MEDIUM (Standard Inpatient)</option>
              </select>
            </div>

            <button
              onClick={handleTrigger}
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-sm shadow-lg shadow-red-900/30 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              {loading ? "Orchestrating Allocation..." : "Execute Autonomous Allocation"}
            </button>
          </div>
        </div>

        {/* Right 2 Columns: Multi-Resource Allocation Breakdown & Explainability */}
        <div className="lg:col-span-2 space-y-6">
          {result ? (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6 animate-fade-in">
              {/* Header Box */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-emerald-900 text-base">Autonomous Allocation Locked</span>
                  </div>
                  <p className="text-xs text-emerald-700 mt-1">
                    Emergency ID: <strong>{result.emergencyId}</strong> | Patient: <strong>{result.patientId}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Response Time</span>
                    <span className="text-2xl font-black text-slate-900">{timerSeconds}s</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Score</span>
                    <span className="text-2xl font-black text-emerald-600">{result.allocation?.score || 94}/100</span>
                  </div>
                </div>
              </div>

              {/* Resource Bundle Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2">
                    <Bed className="w-4 h-4 text-emerald-600" />
                    Beds & Isolation Pod
                  </div>
                  <div className="text-lg font-black text-slate-900">
                    {result.allocation?.bed || "ICU-05"}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    High-acuity ICU Bed with negative-pressure isolation chamber & real-time telemetry.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2">
                    <Stethoscope className="w-4 h-4 text-blue-600" />
                    Cardiology Attending Physician
                  </div>
                  <div className="text-lg font-black text-slate-900">
                    {result.allocation?.doctor || "Dr. Sarah Johnson"}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Board-certified Cardiologist. Emergency ACLS certified. Proximity index: 1st floor corridor.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    Critical Care Lead Nurse
                  </div>
                  <div className="text-lg font-black text-slate-900">
                    {result.allocation?.nurse || "Nurse Sarah Jenkins (N-07)"}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    ICU Senior RN. On active morning shift with optimal workload index (28%).
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2">
                    <HeartPulse className="w-4 h-4 text-rose-600" />
                    Life-Support Devices Deployed
                  </div>
                  <div className="text-lg font-black text-slate-900">
                    {(result.allocation?.equipment || ["V-04", "ECG-02"]).join(" + ")}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Ventilator V-04 (Hamilton G5) + Philips TC70 ECG unit pre-calibrated.
                  </p>
                </div>
              </div>

              {/* Explainability Section */}
              <div className="p-4 rounded-xl bg-slate-900 text-white">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-2">
                  <Sparkles className="w-4 h-4" />
                  Autonomous Decision Explainability Rationale
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {(result.allocation?.reasons || []).map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Audit Trail Timeline */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-600" />
                  Sub-Minute Audit Trail
                </h3>
                <div className="border-l-2 border-slate-200 ml-2 pl-4 space-y-3">
                  {(result.auditTrail || []).map((step, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[23px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                      <div className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                        <span>{step.action}</span>
                        <span className="text-[10px] text-slate-400">({step.actor})</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{step.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center">
              <ShieldAlert className="w-12 h-12 text-slate-300 mb-4" />
              <h3 className="font-bold text-slate-700 text-lg">No Active Emergency Evaluated</h3>
              <p className="text-xs text-slate-500 max-w-md mt-1 mb-6">
                Click <strong>"Execute Autonomous Allocation"</strong> on the left console to simulate Patient P-104 arriving at triage with low oxygen and tachycardia.
              </p>
              <button
                onClick={handleTrigger}
                className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-xs hover:bg-red-700 transition cursor-pointer shadow-md"
              >
                Test Patient P-104 Demo Flow
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
