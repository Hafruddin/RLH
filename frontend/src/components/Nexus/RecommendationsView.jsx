// frontend/src/components/Nexus/RecommendationsView.jsx
import React, { useState, useEffect } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  X,
  XCircle,
  Zap
} from "lucide-react";
import { nexusApi } from "./nexusApi";

export default function RecommendationsView() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const recs = await nexusApi.getRecommendations();
      setRecommendations(recs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const handleApprove = async (id) => {
    setActionInProgress(id);
    setFeedbackMessage("");
    try {
      const res = await nexusApi.approveRecommendation(id, "Hospital Operations Supervisor");
      setFeedbackMessage("✓ Recommendation approved and autonomously executed across operational systems!");
      loadRecommendations();
    } catch (e) {
      setFeedbackMessage("Failed to approve recommendation");
    } finally {
      setActionInProgress("");
    }
  };

  const handleReject = async (id) => {
    setActionInProgress(id);
    setFeedbackMessage("");
    try {
      const res = await nexusApi.rejectRecommendation(id, "Hospital Operations Supervisor", "Clinical priority override");
      setFeedbackMessage("Recommendation rejected. Constraint optimizer flagged with override reason.");
      loadRecommendations();
    } catch (e) {
      setFeedbackMessage("Failed to reject recommendation");
    } finally {
      setActionInProgress("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-2xl p-6 text-white border border-emerald-500/30 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-white uppercase tracking-wider">
            Section 29 & 58 Innovation
          </span>
          <span className="text-xs text-emerald-300">Human-in-the-Loop Autonomous Orchestration Deck</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-emerald-400" />
              Resource Optimization Recommendations
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              NEXUS generates formal, constraint-verified proposals to resolve hospital deficits. High-impact operational moves require authorized supervisor approval before mutating hospital state.
            </p>
          </div>
          <button
            onClick={loadRecommendations}
            className="self-start md:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold border border-emerald-500/30 transition shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Queue
          </button>
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center justify-between">
          <span>{feedbackMessage}</span>
          <button onClick={() => setFeedbackMessage("")} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Recommendations Cards */}
      <div className="grid grid-cols-1 gap-6">
        {recommendations.map((rec) => {
          const isPending = rec.status === "PENDING";
          const isApproved = rec.status === "APPROVED" || rec.status === "EXECUTED";
          const isRejected = rec.status === "REJECTED";

          return (
            <div
              key={rec.recommendationId}
              className={`rounded-2xl border p-6 shadow-xs transition ${
                isPending
                  ? "bg-white border-blue-300 ring-2 ring-blue-500/10"
                  : isApproved
                  ? "bg-emerald-50/50 border-emerald-200"
                  : "bg-slate-50 border-slate-200 opacity-75"
              }`}
            >
              {/* Card Top Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-emerald-400">
                      {rec.recommendationId}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {rec.action}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        isPending
                          ? "bg-amber-100 text-amber-800 animate-pulse"
                          : isApproved
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {rec.status}
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900">{rec.title}</h2>
                </div>

                {/* Confidence & Risk */}
                <div className="flex items-center gap-3 text-xs">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Match Confidence</span>
                    <span className="font-bold text-emerald-600">{rec.confidenceScore}%</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Risk Profile</span>
                    <span className="font-bold text-blue-600">{rec.riskLevel}</span>
                  </div>
                </div>
              </div>

              {/* Justification & Clinical Need */}
              <div className="mt-4 space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Operational Rationale
                  </h3>
                  <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                    {rec.reason}
                  </p>
                </div>

                {/* Constraint Verifications Checklist (Section 22) */}
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Constraints & Safety Boundaries
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {rec.constraintChecks?.map((c, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200/60 text-xs"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-emerald-950 block">{c.rule}</span>
                          <span className="text-[11px] text-slate-600">{c.detail}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expected Operational Effect */}
                {rec.operationalImpact && (
                  <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/60 text-xs space-y-1">
                    <div className="font-bold text-blue-950">Projected System Impact:</div>
                    <div className="text-slate-700">
                      • <span className="font-semibold text-emerald-700">Recipient Unit:</span>{" "}
                      {rec.operationalImpact.recipientGain}
                    </div>
                    <div className="text-slate-700">
                      • <span className="font-semibold text-blue-700">Donor Unit:</span>{" "}
                      {rec.operationalImpact.donorImpact}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {isPending && (
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                    <span className="text-xs text-slate-500 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-blue-600" />
                      Requires Supervisor Authorization before executing state transition.
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReject(rec.recommendationId)}
                        disabled={actionInProgress === rec.recommendationId}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(rec.recommendationId)}
                        disabled={actionInProgress === rec.recommendationId}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve & Execute
                      </button>
                    </div>
                  </div>
                )}

                {isApproved && (
                  <div className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5 pt-2 border-t border-emerald-200/60">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Executed by {rec.approvedBy || "Supervisor"} at{" "}
                    {new Date(rec.approvedAt || rec.executedAt || Date.now()).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
