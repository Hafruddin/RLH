// frontend/src/components/Nexus/SecurityPrivacyCenterView.jsx
import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Lock,
  Key,
  FileText,
  AlertTriangle,
  Clock,
  Eye,
  CheckCircle2,
  RefreshCw,
  XCircle,
  ShieldAlert,
  Zap,
  UserCheck,
  Check,
  X
} from "lucide-react";
import { nexusApi } from "./nexusApi";

export default function SecurityPrivacyCenterView() {
  const [secData, setSecData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Break-Glass Modal State
  const [showBreakGlassModal, setShowBreakGlassModal] = useState(false);
  const [bgClinician, setBgClinician] = useState("Dr. Marcus Bell (ER Resident)");
  const [bgPatientId, setBgPatientId] = useState("P-101");
  const [bgReason, setBgReason] = useState("Acute hemodynamic instability in trauma bay. Patient unresponsive, immediate surgical chart and allergy history override required.");
  const [bgSuccessMsg, setBgSuccessMsg] = useState("");

  const loadData = async () => {
    try {
      const res = await nexusApi.getSecurityOverview();
      if (res && res.success) {
        setSecData(res);
      }
    } catch (e) {
      console.error("Failed to load security overview", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleRequestBreakGlass = async (e) => {
    e.preventDefault();
    try {
      const res = await nexusApi.requestBreakGlass({
        userName: bgClinician,
        patientId: bgPatientId,
        reason: bgReason
      });
      if (res && res.success) {
        setBgSuccessMsg(`Emergency Break-Glass Session ${res.session.sessionId} granted for 15 minutes! Fully audited.`);
        setTimeout(() => {
          setShowBreakGlassModal(false);
          setBgSuccessMsg("");
          loadData();
        }, 1500);
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const handleRevoke = async (sessionId) => {
    try {
      await nexusApi.revokeBreakGlass(sessionId);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleConsent = async (field, currentVal) => {
    try {
      await nexusApi.toggleConsent({
        patientId: "P-101",
        field,
        granted: !currentVal
      });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const patientConsent = secData?.consents?.["P-101"] || {};

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ─────────────────────────────────────────────────────────────
          1. Header & Layered Security Plane Banner
      ────────────────────────────────────────────────────────────── */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-red-500/10 via-purple-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Security & Patient Privacy Control Center
              </h1>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                HIPAA & DPDP Compliant
              </span>
            </div>
            <p className="text-slate-400 text-xs max-w-3xl leading-relaxed">
              Zero-Trust Clinical Security Architecture: Layered authentication, RBAC, object-level authorization, encryption at rest & in-transit, dynamic patient consent management, tamper-evident audit logging, and controlled emergency break-glass access.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBreakGlassModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              Request Emergency Break-Glass
            </button>
            <button
              onClick={loadData}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-purple-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Security Policy Statement */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-purple-300 font-semibold">
            <Lock className="w-4 h-4 text-purple-400 shrink-0" />
            <span>
              <strong>Object-Level Rule:</strong> <em>"Do not rely only on the user's role. Verify that the specific user is authorized to access the specific patient or record."</em>
            </span>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-emerald-400">
            TLS 1.3 + AES-256 Active
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. Layered Architecture Telemetry Strip
      ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>In-Transit Protection</span>
            <Lock className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-sm font-black text-slate-900">TLS 1.3 Encrypted</p>
          <span className="text-[10px] text-slate-500 font-mono">ChaCha20-Poly1305 / AES-GCM</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>At-Rest Storage</span>
            <Key className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-sm font-black text-slate-900">AES-256 + HSM</p>
          <span className="text-[10px] text-slate-500 font-mono">Hardware Security Module Key Rotation</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>Object Auth Checks</span>
            <UserCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-sm font-black text-slate-900">1,420 Checks / Day</p>
          <span className="text-[10px] text-emerald-700 font-bold">3 Unauthorized Blocked</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
            <span>Break-Glass Status</span>
            <Zap className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-sm font-black text-slate-900">
            {secData?.activeBreakGlassSessions?.filter(s => s.status === "ACTIVE").length || 0} Active Session(s)
          </p>
          <span className="text-[10px] text-red-600 font-bold">15-Min Auto Expiry</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. RBAC Matrix & Object-Level Authorization Table
      ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* RBAC Policy Table */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              Role-Based Access Control (RBAC) Hierarchy
            </h3>
            <span className="text-[10px] text-slate-400 font-bold">Least Privilege Principle</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
              <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded shrink-0">
                PATIENT
              </span>
              <p className="text-slate-700 text-[11px] leading-tight">
                Can access permitted own clinical records, prescriptions, and virtual OP journey only.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
              <span className="text-[10px] font-black uppercase bg-purple-100 text-purple-800 px-2 py-0.5 rounded shrink-0">
                DOCTOR
              </span>
              <p className="text-slate-700 text-[11px] leading-tight">
                Can access authorized patient records relevant to actively assigned clinical care encounters.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
              <span className="text-[10px] font-black uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded shrink-0">
                LAB STAFF
              </span>
              <p className="text-slate-700 text-[11px] leading-tight">
                Can access assigned diagnostic orders and specimen metadata. Restricted from financial/billing EHR.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
              <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded shrink-0">
                PHARMACIST
              </span>
              <p className="text-slate-700 text-[11px] leading-tight">
                Can access active prescriptions and medication dispensing history required for safety verification.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5">
              <span className="text-[10px] font-black uppercase bg-slate-800 text-white px-2 py-0.5 rounded shrink-0">
                ADMIN
              </span>
              <p className="text-slate-700 text-[11px] leading-tight">
                Can access operational resource states, heatmaps, and audit logs. Zero clinical snooping permitted.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Patient Consent Management (DPDP / HIPAA) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                Dynamic Patient Consent Portal (Patient P-101)
              </h3>
              <p className="text-[10px] text-slate-500">Patient exercises fine-grained data sharing control</p>
            </div>
            <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Active Consent Verified
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">Primary Attending Physician (Dr. Sarah Johnson)</span>
                <span className="text-[10px] text-slate-400">Direct consultation, diagnosis & treatment rights</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800">
                GRANTED (MANDATORY)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">Radiology & Imaging Suite Sharing</span>
                <span className="text-[10px] text-slate-400">Permit CT / MRI technicians to view clinical history</span>
              </div>
              <button
                onClick={() => handleToggleConsent("radiologyConsent", patientConsent.radiologyConsent)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  patientConsent.radiologyConsent ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                }`}
              >
                {patientConsent.radiologyConsent ? "GRANTED ✓" : "REVOKED ✗"}
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">Cashless Insurance Claim Pre-Authorization</span>
                <span className="text-[10px] text-slate-400">Transmit ICD-10 diagnostics to Star Health Insurance</span>
              </div>
              <button
                onClick={() => handleToggleConsent("externalInsuranceSharing", patientConsent.externalInsuranceSharing)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  patientConsent.externalInsuranceSharing ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                }`}
              >
                {patientConsent.externalInsuranceSharing ? "GRANTED ✓" : "REVOKED ✗"}
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block">Third-Party Research & Pharma Studies</span>
                <span className="text-[10px] text-slate-400">De-identified clinical data for academic studies</span>
              </div>
              <button
                onClick={() => handleToggleConsent("thirdPartyResearch", patientConsent.thirdPartyResearch)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  patientConsent.thirdPartyResearch ? "bg-emerald-600 text-white" : "bg-red-100 text-red-800"
                }`}
              >
                {patientConsent.thirdPartyResearch ? "GRANTED ✓" : "REVOKED ✗"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. Active Break-Glass Emergency Overrides Strip
      ────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-red-600" />
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Controlled Emergency Access (Break-Glass Sessions)
            </h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400">
            Emergency override with mandatory clinical justification & automatic expiration
          </span>
        </div>

        {(!secData?.activeBreakGlassSessions || secData.activeBreakGlassSessions.length === 0) ? (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
            Zero active emergency break-glass sessions. Standard consent policies fully enforced.
          </div>
        ) : (
          <div className="space-y-2">
            {secData.activeBreakGlassSessions.map(sess => (
              <div
                key={sess.sessionId}
                className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
                  sess.status === "ACTIVE"
                    ? "bg-red-50/70 border-red-200"
                    : "bg-slate-50 border-slate-200 opacity-60"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-black text-red-900 bg-red-200 px-1.5 py-0.2 rounded">
                      {sess.sessionId}
                    </span>
                    <span className="font-extrabold text-slate-900">{sess.requestedBy}</span>
                    <span className="text-slate-400">({sess.userId})</span>
                    <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                      Target: {sess.patientId}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 mt-1 italic">
                    Reason: "{sess.reason}"
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Expires at: {new Date(sess.expiresAt).toLocaleTimeString()}
                  </span>
                </div>

                {sess.status === "ACTIVE" && (
                  <button
                    onClick={() => handleRevoke(sess.sessionId)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white font-bold text-[11px] transition cursor-pointer self-end sm:self-center shrink-0"
                  >
                    Revoke Early
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. Immutable Tamper-Evident Audit Trail
      ────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-600" />
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Immutable Cryptographic Audit Trail (Who, What, When, Record, Result)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
            SHA-256 Chain
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-[10px] font-bold uppercase">
                <th className="p-2.5">Who (User / Actor)</th>
                <th className="p-2.5">What Action</th>
                <th className="p-2.5">When (Timestamp)</th>
                <th className="p-2.5">Which Record / Object</th>
                <th className="p-2.5">Result</th>
                <th className="p-2.5">Access Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px]">
              {(secData?.auditLogs || []).map(log => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition">
                  <td className="p-2.5 font-bold text-slate-900">
                    <span className="text-[10px] text-purple-700 font-mono block">[{log.role}]</span>
                    {log.who}
                  </td>
                  <td className="p-2.5 font-mono text-[10px] font-black text-slate-800">{log.action}</td>
                  <td className="p-2.5 text-slate-400 font-mono text-[10px] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="p-2.5 font-bold text-purple-900 truncate max-w-[180px]">{log.targetObject}</td>
                  <td className="p-2.5">
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${
                        log.result.includes("SUCCESS") || log.result.includes("ALLOWED")
                          ? "bg-emerald-100 text-emerald-800"
                          : log.result.includes("GRANTED")
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {log.result}
                    </span>
                  </td>
                  <td className="p-2.5 text-slate-500 text-[10px] truncate max-w-[220px]" title={log.context}>
                    {log.context}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          6. Emergency Break-Glass Request Modal
      ────────────────────────────────────────────────────────────── */}
      {showBreakGlassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black text-red-700 bg-red-100 px-2 py-0.5 rounded">
                  PROTOCOL: CODE RED EMERGENCY OVERRIDE
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-red-600" />
                  Request Controlled Break-Glass Access
                </h3>
              </div>
              <button
                onClick={() => setShowBreakGlassModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bgSuccessMsg ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600" />
                <h4 className="font-black text-sm">Emergency Override Granted</h4>
                <p className="text-xs">{bgSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleRequestBreakGlass} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Clinician Requesting Access</label>
                  <input
                    type="text"
                    value={bgClinician}
                    onChange={e => setBgClinician(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Patient ID</label>
                  <input
                    type="text"
                    value={bgPatientId}
                    onChange={e => setBgPatientId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Mandatory Emergency Clinical Justification
                  </label>
                  <textarea
                    rows={3}
                    value={bgReason}
                    onChange={e => setBgReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
                    placeholder="Enter acute clinical rationale..."
                    required
                  />
                  <span className="text-[10px] text-red-600 font-semibold block mt-0.5">
                    * This action is cryptographically recorded in the permanent hospital audit log.
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                    Temporary 15-Minute Expiration:
                  </div>
                  <p>Access privileges automatically expire after 15 minutes. Consent locks will automatically reinstate.</p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowBreakGlassModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-black shadow-md transition"
                  >
                    Confirm & Grant Emergency Access
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
