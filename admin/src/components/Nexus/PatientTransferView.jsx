// frontend/src/components/Nexus/PatientTransferView.jsx
import React, { useState, useEffect } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bed,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  MapPin,
  Plus,
  RefreshCw,
  Send,
  ShieldCheck,
  Truck,
  UserCheck,
  Users,
  X,
  Zap
} from "lucide-react";
import { nexusApi } from "./nexusApi";

export default function PatientTransferView() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // Initiate Transfer Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    patientId: "P-101",
    patientName: "Vikram Malhotra",
    sourceDepartment: "General",
    sourceWard: "WARD-GEN-A",
    sourceBedId: "GEN-A-02",
    targetDepartment: "Emergency",
    targetWard: "WARD-EMG",
    targetBedId: "ER-02",
    clinicalReason: "Sudden desaturation (SpO2: 83%) requiring emergency resuscitation bay",
    priority: "CRITICAL",
    requestedBy: "Ward In-Charge"
  });

  const loadTransfers = async () => {
    setLoading(true);
    try {
      const data = await nexusApi.getTransfers();
      setTransfers(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransfers();
  }, []);

  const handleRequestTransfer = async (e) => {
    e.preventDefault();
    setActionLoading("create");
    try {
      const res = await nexusApi.requestTransfer(formData);
      setFeedbackMessage("✓ Transfer requested successfully. Awaiting receiving department approval.");
      setShowModal(false);
      loadTransfers();
    } catch (err) {
      setFeedbackMessage("Failed to initiate transfer");
    } finally {
      setActionLoading("");
    }
  };

  const handleApproveTransfer = async (id) => {
    setActionLoading(id);
    try {
      await nexusApi.approveTransfer(id, "Dr. Sarah Johnson (ED In-Charge)");
      setFeedbackMessage("✓ Transfer approved! Receiving bed pre-reserved.");
      loadTransfers();
    } catch (err) {
      setFeedbackMessage("Approval failed");
    } finally {
      setActionLoading("");
    }
  };

  const handleConfirmArrival = async (id) => {
    setActionLoading(id);
    try {
      const res = await nexusApi.confirmTransferArrival(id, "Nurse Anita Roy (Emergency RN)");
      setFeedbackMessage("✓ Physical arrival confirmed! Receiving bed marked OCCUPIED, source bed released to CLEANING.");
      loadTransfers();
    } catch (err) {
      setFeedbackMessage("Confirmation failed");
    } finally {
      setActionLoading("");
    }
  };

  const stages = [
    { key: "TRANSFER_REQUESTED", label: "Requested", icon: FileText },
    { key: "TRANSFER_APPROVED", label: "Approved", icon: CheckCircle2 },
    { key: "IN_TRANSIT", label: "In Transit", icon: Truck },
    { key: "ARRIVED", label: "Arrived", icon: MapPin },
    { key: "ASSIGNED", label: "Bed Assigned", icon: Bed }
  ];

  const getStageIndex = (status) => {
    switch (status) {
      case "TRANSFER_REQUESTED": return 0;
      case "TRANSFER_APPROVED": return 1;
      case "IN_TRANSIT": return 2;
      case "ARRIVED": return 3;
      case "ASSIGNED": return 4;
      default: return 0;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-2xl p-6 text-white border border-teal-500/30 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500 text-white uppercase tracking-wider">
            Section 13, 14, 15 & 53 Innovation
          </span>
          <span className="text-xs text-teal-300">Closed-Loop Patient Movement & Clinical Transfer Orchestration</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2">
              <Compass className="w-7 h-7 text-teal-400" />
              Patient Transfer Orchestrator
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              Tracks clinical transfer milestones through verified workflow events. Only upon confirmed physical arrival does the receiving bed become occupied, the source bed release into terminal cleaning, and ward nursing ratios recalculate.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Initiate Transfer
            </button>
            <button
              onClick={loadTransfers}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-bold border border-teal-500/30 transition shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-4 rounded-xl bg-teal-50 border border-teal-300 text-teal-900 text-xs font-semibold flex items-center justify-between">
          <span>{feedbackMessage}</span>
          <button onClick={() => setFeedbackMessage("")} className="text-teal-700 hover:text-teal-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Active Transfer Trackers */}
      <div className="space-y-5">
        {transfers.map((trf) => {
          const currentStageIdx = getStageIndex(trf.status);

          return (
            <div key={trf.transferId} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
              {/* Top Row: Meta info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-teal-400">
                      {trf.transferId}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      Patient: <span className="text-teal-700 font-extrabold">{trf.patientName}</span> ({trf.patientId})
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800">
                      {trf.priority}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-3">
                    <span>From: <strong>{trf.sourceDepartment} (Bed {trf.sourceBedId})</strong></span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span>To: <strong>{trf.targetDepartment} (Bay {trf.targetBedId})</strong></span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Status</span>
                  <span className="text-xs font-extrabold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                    {trf.currentStageDisplay || trf.status}
                  </span>
                </div>
              </div>

              {/* 5-Stage Visual Progress Stepper */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {stages.map((stg, idx) => {
                  const isDone = idx <= currentStageIdx;
                  const isCurrent = idx === currentStageIdx;
                  const Icon = stg.icon;

                  return (
                    <div
                      key={stg.key}
                      className={`p-3 rounded-xl border flex flex-col items-center text-center gap-1.5 transition ${
                        isCurrent
                          ? "bg-teal-500 text-white border-teal-600 shadow-sm"
                          : isDone
                          ? "bg-teal-50 text-teal-900 border-teal-200"
                          : "bg-slate-50 text-slate-400 border-slate-200"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[11px] font-bold">{stg.label}</span>
                      <span className="text-[10px] opacity-80">
                        {isCurrent ? "Active Stage" : isDone ? "✓ Complete" : "Pending"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Clinical Note & Controls */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-900 block mb-0.5">Clinical Indication:</span>
                  <span>{trf.clinicalReason}</span>
                </div>

                {/* Workflow Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {trf.status === "TRANSFER_REQUESTED" && (
                    <button
                      onClick={() => handleApproveTransfer(trf.transferId)}
                      disabled={actionLoading === trf.transferId}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition shadow-xs disabled:opacity-50"
                    >
                      Approve Transfer (ED In-Charge)
                    </button>
                  )}

                  {trf.status === "TRANSFER_APPROVED" && (
                    <button
                      onClick={() => handleConfirmArrival(trf.transferId)}
                      disabled={actionLoading === trf.transferId}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs disabled:opacity-50"
                    >
                      Confirm Physical Arrival (Receiving RN)
                    </button>
                  )}

                  {(trf.status === "ARRIVED" || trf.status === "ASSIGNED") && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Transfer Handover Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Audit Stage Log */}
              {trf.auditLog && trf.auditLog.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Chain of Custody Audit Trail
                  </span>
                  <div className="space-y-1">
                    {trf.auditLog.map((log, idx) => (
                      <div key={idx} className="text-[11px] text-slate-600 flex items-center gap-2">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="font-mono text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span>•</span>
                        <strong className="text-slate-800">{log.actor}:</strong>
                        <span>{log.note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal: Initiate Transfer */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Compass className="w-5 h-5 text-teal-600" />
                Initiate Clinical Patient Transfer
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRequestTransfer} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Patient MRN</label>
                  <input
                    type="text"
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Patient Full Name</label>
                  <input
                    type="text"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Source Bed ID</label>
                  <input
                    type="text"
                    value={formData.sourceBedId}
                    onChange={(e) => setFormData({ ...formData, sourceBedId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Resuscitation Bay</label>
                  <input
                    type="text"
                    value={formData.targetBedId}
                    onChange={(e) => setFormData({ ...formData, targetBedId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Clinical Indication & Urgency</label>
                <textarea
                  rows={3}
                  value={formData.clinicalReason}
                  onChange={(e) => setFormData({ ...formData, clinicalReason: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "create"}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold disabled:opacity-50"
                >
                  Submit Transfer Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
