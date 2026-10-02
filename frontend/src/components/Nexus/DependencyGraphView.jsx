// frontend/src/components/Nexus/DependencyGraphView.jsx
import React, { useState, useEffect } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Cpu,
  GitBranch,
  Layers,
  Network,
  RefreshCw,
  Sliders,
  Sparkles,
  Zap
} from "lucide-react";
import { nexusApi } from "./nexusApi";

const DEFAULT_NODES = [
  { id: "OT-02", name: "Emergency Hybrid OT (OT-02)", type: "OPERATING_THEATRE", status: "SCHEDULED" },
  { id: "BED-PACU-01", name: "Surgical Recovery PACU Bed 1", type: "BED", status: "RESERVED" },
  { id: "N-07", name: "Nurse Sarah Jenkins (N-07)", type: "STAFF", status: "ON_DUTY" },
  { id: "DIAG-CT-01", name: "Siemens 128-Slice CT-01", type: "EQUIPMENT", status: "ONLINE" },
  { id: "DIAG-CT-02", name: "GE 64-Slice CT-02", type: "EQUIPMENT", status: "STANDBY" },
  { id: "ICU-05", name: "Isolation Resuscitation Bed ICU-05", type: "BED", status: "RESERVED" },
  { id: "V-04", name: "Hamilton G5 Ventilator (V-04)", type: "EQUIPMENT", status: "DEPLOYED" },
  { id: "WARD-GEN-A", name: "General Ward A Nursing Pool", type: "DEPARTMENT", status: "NORMAL" }
];

const DEFAULT_LINKS = [
  { source: "OT-02", target: "BED-PACU-01", relation: "Locks Post-Op Recovery" },
  { source: "OT-02", target: "N-07", relation: "Requires Surgical Nurse" },
  { source: "DIAG-CT-01", target: "DIAG-CT-02", relation: "Failover Candidate" },
  { source: "ICU-05", target: "V-04", relation: "Requires Life Support" },
  { source: "N-07", target: "WARD-GEN-A", relation: "Donor Staff Pool" }
];

const DEFAULT_CASCADES = {
  "OT-02": {
    totalAffectedResources: 4,
    primaryImpacts: [
      { resource: "BED-PACU-01", impact: "Surgical Recovery Bed locked for 90 minutes post-surgery." },
      { resource: "DOC-04", impact: "Dr. Vikram Hegde scheduled roster shifted by 25 minutes." }
    ],
    secondaryImpacts: [
      { resource: "PACU Nursing Pool", impact: "Post-Anesthesia nurse workload increases to 85%." },
      { resource: "General Ward Admissions", impact: "Elective admissions held until recovery beds clear." }
    ],
    mitigationAlternatives: [
      "Pre-stage recovery overflow in Surgical Ward Pod B",
      "Alert PACU standby nurse on Floor 4",
      "Reschedule non-urgent day-surgery checkups"
    ]
  },
  "DIAG-CT-01": {
    totalAffectedResources: 5,
    primaryImpacts: [
      { resource: "DIAG-CT-02", impact: "Automated failover candidate absorbs active trauma scan queue." },
      { resource: "TECH-01", impact: "Technician reassigned to CT-02 console." }
    ],
    secondaryImpacts: [
      { resource: "Emergency Triage", impact: "Stroke protocol imaging delay minimized from 45m to 4m." }
    ],
    mitigationAlternatives: [
      "Activate fast-track protocol on CT-02",
      "Direct contrast studies to Basement Suite B"
    ]
  },
  "ICU-05": {
    totalAffectedResources: 3,
    primaryImpacts: [
      { resource: "V-04", impact: "Ventilator pre-calibrated and telemetry synced." },
      { resource: "N-07", impact: "ICU Nurse Sarah Jenkins assigned 1:1 acuity watch." }
    ],
    secondaryImpacts: [
      { resource: "ICU Capacity", impact: "Only 1 emergency isolation bed remains unallocated." }
    ],
    mitigationAlternatives: [
      "Expedite step-down transfer for P-ICU-02 to Surgical Recovery"
    ]
  }
};

export default function DependencyGraphView() {
  const [loading, setLoading] = useState(false);
  const [graphData, setGraphData] = useState({ nodes: DEFAULT_NODES, links: DEFAULT_LINKS });
  const [selectedNode, setSelectedNode] = useState(DEFAULT_NODES[0]);
  const [cascadeAnalysis, setCascadeAnalysis] = useState(DEFAULT_CASCADES["OT-02"]);
  const [analyzingId, setAnalyzingId] = useState("");

  const loadGraph = async () => {
    setLoading(true);
    try {
      const data = await nexusApi.getDependencies();
      if (data && data.nodes && data.nodes.length > 0) {
        setGraphData(data);
        if (!selectedNode) {
          setSelectedNode(data.nodes[0]);
          triggerCascadeAnalysis(data.nodes[0].id);
        }
      } else {
        setGraphData({ nodes: DEFAULT_NODES, links: DEFAULT_LINKS });
        if (!selectedNode) {
          setSelectedNode(DEFAULT_NODES[0]);
          setCascadeAnalysis(DEFAULT_CASCADES["OT-02"]);
        }
      }
    } catch (e) {
      console.error(e);
      setGraphData({ nodes: DEFAULT_NODES, links: DEFAULT_LINKS });
      if (!selectedNode) {
        setSelectedNode(DEFAULT_NODES[0]);
        setCascadeAnalysis(DEFAULT_CASCADES["OT-02"]);
      }
    } finally {
      setLoading(false);
    }
  };

  const triggerCascadeAnalysis = async (resourceId) => {
    setAnalyzingId(resourceId);
    try {
      const res = await nexusApi.getDependencies(resourceId);
      if (res && res.impact) {
        setCascadeAnalysis(res.impact);
      } else {
        setCascadeAnalysis(DEFAULT_CASCADES[resourceId] || DEFAULT_CASCADES["OT-02"]);
      }
    } catch (e) {
      console.error(e);
      setCascadeAnalysis(DEFAULT_CASCADES[resourceId] || DEFAULT_CASCADES["OT-02"]);
    } finally {
      setAnalyzingId("");
    }
  };

  useEffect(() => {
    loadGraph();
  }, []);

  const handleSelectNode = (node) => {
    setSelectedNode(node);
    triggerCascadeAnalysis(node.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-indigo-500/30 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500 text-white uppercase tracking-wider">
            Section 17 & 18 Innovation
          </span>
          <span className="text-xs text-indigo-300">Multi-Resource Dependency Graph & Cascading Impact Engine</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2">
              <Network className="w-7 h-7 text-indigo-400" />
              Hospital Dependency & Cascading Impact Graph
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              NEXUS does not treat hospital resources in isolation. When an OT delays, CT scanner fails, or emergency surges, the system evaluates secondary downstream impacts across PACU recovery beds, nursing workload, and diagnostic queues.
            </p>
          </div>
          <button
            onClick={loadGraph}
            className="self-start md:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold border border-indigo-500/30 transition shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Graph
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Resource Nodes */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-indigo-600" />
              Monitored Assets ({graphData.nodes.length})
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
              Interactive
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Click any resource to inspect its dependency linkages and simulate cascading impact down the clinical pathway.
          </p>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {graphData.nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => handleSelectNode(node)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? "bg-indigo-50 border-indigo-500 shadow-xs"
                      : "bg-slate-50/60 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      {node.name}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span className="font-mono text-indigo-600 font-semibold">{node.id}</span>
                      <span>•</span>
                      <span className="capitalize">{node.type?.toLowerCase().replace("_", " ")}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      isSelected ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {node.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Cascading Impact Analysis Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Node Detail */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  Inspecting Resource Dependencies
                </span>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 mt-0.5">
                  {selectedNode?.name || "Select an Asset"}
                  <span className="text-xs font-mono font-normal text-slate-500">
                    ({selectedNode?.id})
                  </span>
                </h2>
              </div>
              <button
                onClick={() => selectedNode && triggerCascadeAnalysis(selectedNode.id)}
                disabled={!selectedNode || analyzingId === selectedNode.id}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
              >
                <Zap className={`w-3.5 h-3.5 ${analyzingId ? "animate-spin" : ""}`} />
                Simulate Cascade Impact
              </button>
            </div>

            {/* Downstream Cascade Details */}
            {cascadeAnalysis ? (
              <div className="mt-5 space-y-5">
                {/* Impact Summary Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Affected Assets</span>
                    <span className="text-xl font-black text-slate-900">{cascadeAnalysis.totalAffectedResources}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="text-[10px] uppercase font-bold text-amber-700 block">Primary Impacts</span>
                    <span className="text-xl font-black text-amber-800">{cascadeAnalysis.primaryImpacts?.length || 0}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                    <span className="text-[10px] uppercase font-bold text-red-700 block">Secondary Cascades</span>
                    <span className="text-xl font-black text-red-800">{cascadeAnalysis.secondaryImpacts?.length || 0}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 block">Mitigations Ready</span>
                    <span className="text-xl font-black text-emerald-800">
                      {cascadeAnalysis.mitigationAlternatives?.length || 0}
                    </span>
                  </div>
                </div>

                {/* Primary Impacts */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    1st Order Primary Downstream Impact
                  </h3>
                  <div className="space-y-2">
                    {cascadeAnalysis.primaryImpacts?.map((imp, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-slate-800 space-y-1.5"
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-amber-900 flex items-center gap-1.5">
                            <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
                            {imp.dependentWorkflow}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-[10px] font-bold">
                            {imp.impactType} (+{imp.estimatedDelayMinutes}m)
                          </span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{imp.description}</p>
                        <div className="text-[11px] font-semibold text-amber-800">
                          Affected: <span className="font-bold">{imp.affectedResource}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Secondary Cascades */}
                {cascadeAnalysis.secondaryImpacts && cascadeAnalysis.secondaryImpacts.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      2nd Order Secondary Cascade (Cascading Deadlock Prevention)
                    </h3>
                    <div className="space-y-2">
                      {cascadeAnalysis.secondaryImpacts.map((sImp, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-red-50/70 border border-red-200 text-xs text-slate-800 space-y-1.5"
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-red-900 flex items-center gap-1.5">
                              <ArrowRight className="w-3.5 h-3.5 text-red-600" />
                              {sImp.dependentWorkflow}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-red-200/80 text-red-900 text-[10px] font-bold">
                              {sImp.impactType}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px]">{sImp.description}</p>
                          <div className="text-[11px] font-semibold text-red-800">
                            Downstream Lock: <span className="font-bold">{sImp.affectedResource}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI / Optimization Mitigations */}
                {cascadeAnalysis.mitigationAlternatives && cascadeAnalysis.mitigationAlternatives.length > 0 && (
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      Recommended Orchestration Interventions
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {cascadeAnalysis.mitigationAlternatives.map((mit, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-slate-800 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-emerald-900">{mit.strategy}</span>
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                              Score: {mit.feasibilityScore}/100
                            </span>
                          </div>
                          <p className="text-slate-700 text-[11px]">{mit.action}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                Select a resource to calculate dependency chain.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
