// frontend/src/components/Nexus/MissionControlView.jsx
import React, { useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  Bot,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Cpu,
  Database,
  Layers,
  Network,
  Radio,
  RefreshCw,
  Send,
  Server,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  Workflow,
  Zap
} from "lucide-react";

export default function MissionControlView() {
  const [selectedNodeIndex, setSelectedNodeIndex] = useState(0);

  const pipelineNodes = [
    {
      id: "PATIENT",
      name: "1. Patient Arrival & Interaction",
      role: "PATIENT",
      icon: User,
      color: "from-blue-600 to-indigo-600",
      description: "Patient checks in via ABHA kiosk QR scan or mobile app at West Entrance.",
      payload: {
        patientId: "P-101",
        name: "Harsh Tripathi",
        abhaId: "91-8273-4412-9901",
        arrivalLocation: "West Entrance Kiosk #2",
        timestamp: "10:42:15 AM",
        acuity: "CRITICAL"
      },
      telemetry: "Scanned via Optical Reader 02. SpO2: 84%, Heart Rate: 142 bpm."
    },
    {
      id: "PORTAL",
      name: "2. Patient Care Portal",
      role: "PATIENT",
      icon: Compass,
      color: "from-indigo-600 to-purple-600",
      description: "Portal checks appointment, issues OPD token #04, and initializes live ETA engine.",
      payload: {
        tokenNumber: "#04",
        consultingDoctor: "Dr. Sarah Johnson (Cardiology)",
        cabinNumber: "Cabin 102 (Floor 1)",
        calculatedEta: "18 mins"
      },
      telemetry: "WebSocket channel subscribed: /ws/patient/P-101"
    },
    {
      id: "JOURNEY",
      name: "3. Persistent Patient Journey",
      role: "SYSTEM",
      icon: Layers,
      color: "from-purple-600 to-pink-600",
      description: "Immutable journey audit event JOURNEY_ARRIVED emitted under Journey ID JRN-2026-9041.",
      payload: {
        journeyId: "JRN-2026-9041",
        stage: "ARRIVAL_VERIFIED",
        previousStage: "APPOINTMENT_CONFIRMED",
        nextExpected: "OPD_CONSULTATION"
      },
      telemetry: "Persisted to MongoDB WorkflowEvent collection with cryptographic hash."
    },
    {
      id: "AI_AGENT",
      name: "4. Multi-Agent AI Subsystem",
      role: "AI",
      icon: Bot,
      color: "from-pink-600 to-rose-600",
      description: "Nexus Emergency & Triage Agent analyzes SpO2 84% telemetry and triggers Code Red escalation.",
      payload: {
        agent: "Nexus Emergency Orchestrator Agent",
        model: "Clinical Acuity Classifier v2.4",
        evaluatedAcuity: "CRITICAL",
        recommendation: "Immediate Telemetry Resuscitation Bay Required"
      },
      telemetry: "Inference latency: 142ms. Zero fabricated diagnoses."
    },
    {
      id: "N8N",
      name: "5. n8n Automation Engine",
      role: "INTEGRATION",
      icon: Workflow,
      color: "from-orange-600 to-amber-600",
      description: "n8n webhook triggers multi-system broadcast, SMS alert, and emergency paging.",
      payload: {
        webhookUrl: "https://n8n.hospital.internal/webhook/code-red",
        dispatchedServices: ["Twilio SMS", "Hospital Telemetry Pager", "Staff Mobile Push"],
        deliveryVerification: "100% ACKNOWLEDGED"
      },
      telemetry: "Execution duration: 320ms via authenticated service key."
    },
    {
      id: "BACKEND",
      name: "6. Express / Node Source of Truth",
      role: "BACKEND",
      icon: Server,
      color: "from-amber-600 to-emerald-600",
      description: "Authoritative hospital operational state receives emergency event and opens transaction.",
      payload: {
        activeBedsMonitored: 48,
        onDutyStaff: 90,
        equipmentMonitored: 20,
        orchestrationState: "OPTIMIZE"
      },
      telemetry: "DB connection verified (MongoDB readyState: 1)."
    },
    {
      id: "STATE",
      name: "7. Live Hospital State & Telemetry",
      role: "STATE",
      icon: Radio,
      color: "from-emerald-600 to-teal-600",
      description: "Real-time RTLS and bed sensors verify ICU-05 is physically vacant and pre-calibrated.",
      payload: {
        selectedBedId: "ICU-05",
        sensorOccupancy: "0.0 kg (AVAILABLE)",
        equipmentOnline: ["Ventilator V-04", "Patient Monitor PM-08"]
      },
      telemetry: "RTLS tag sync: 100ms interval."
    },
    {
      id: "DEPENDENCY",
      name: "8. Dependency Graph & Cascade Engine",
      role: "GRAPH",
      icon: Network,
      color: "from-teal-600 to-cyan-600",
      description: "Evaluates multi-tier downstream impact on PACU recovery beds, float nursing, and surgical schedule.",
      payload: {
        affectedResources: 3,
        primaryDownstream: "Ventilator V-04 pre-allocated to Bed ICU-05",
        secondaryDownstream: "Nurse Sarah Jenkins (N-07) workload increases to 78%"
      },
      telemetry: "Graph traversed 8 nodes and 5 relational links."
    },
    {
      id: "OPTIMIZATION",
      name: "9. Constraint-Based Optimizer",
      role: "OPTIMIZER",
      icon: BrainCircuit,
      color: "from-cyan-600 to-blue-600",
      description: "Multi-criteria solver calculates composite score 94/100, preserving minimum staffing buffer.",
      payload: {
        algorithm: "Multi-Objective Constraint Satisfaction (MOCS)",
        minimumCapacityPreserved: true,
        bufferRetained: "1 floater nurse retained in General Ward",
        allocatedResource: "ICU-05 + Dr. Sarah Johnson"
      },
      telemetry: "Optimization completed in 42ms."
    },
    {
      id: "APPROVAL",
      name: "10. Human-in-the-Loop Supervisor Approval",
      role: "ADMIN",
      icon: ShieldCheck,
      color: "from-blue-600 to-indigo-600",
      description: "High-impact reallocations require authorized supervisor sign-off before state mutation.",
      payload: {
        recommendationId: "REC-NEXUS-001",
        authorizedApprover: "Hospital Operations Supervisor",
        approvalStatus: "APPROVED",
        overrideAllowed: true
      },
      telemetry: "Digitally signed with supervisor audit token."
    },
    {
      id: "EXECUTION",
      name: "11. Resource Allocation & Mutated State",
      role: "EXECUTION",
      icon: Zap,
      color: "from-indigo-600 to-purple-600",
      description: "Bed ICU-05 locked as OCCUPIED. Ventilator V-04 marked IN_USE. Audit log finalized.",
      payload: {
        bedUpdated: "ICU-05 -> OCCUPIED",
        patientAssigned: "P-101",
        mobilizationTime: "42 seconds verified"
      },
      telemetry: "Database transaction committed."
    },
    {
      id: "NOTIFICATION",
      name: "12. WebSocket Broadcast & Updated Journey",
      role: "NOTIFICATION",
      icon: Send,
      color: "from-purple-600 to-emerald-600",
      description: "Simultaneous real-time update sent to Patient Portal, Doctor Workbench, and Command Center.",
      payload: {
        patientUpdated: "Journey stage advanced to IN_TRANSIT",
        doctorNotified: "Push alert sounded on Doctor Workbench",
        commandCenterUpdated: "Active emergency counter incremented to 1"
      },
      telemetry: "Closed-loop orchestration completed."
    }
  ];

  const activeNode = pipelineNodes[selectedNodeIndex];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-indigo-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-500 text-white uppercase tracking-wider">
              Section 53 Full Flow Visualizer
            </span>
            <span className="text-xs text-indigo-300">Closed-Loop Autonomous Hospital Orchestration</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <Workflow className="w-8 h-8 text-indigo-400" />
            <span>Mission Control / End-to-End System Flow</span>
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm max-w-3xl">
            Trace the live operational data lifecycle: Patient → Portal → Journey → AI Agent → n8n → Backend → State → Graph → Optimization → Human Approval → Resource → Notification → Updated Journey.
          </p>
        </div>
      </div>

      {/* Main Grid: Interactive Horizontal/Vertical Pipeline + Node Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: 12-Step Interactive Pipeline Flow */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              12-Stage Execution Pipeline
            </h2>
            <span className="text-xs font-mono font-bold text-indigo-600">
              Stage {selectedNodeIndex + 1} / 12
            </span>
          </div>

          <div className="space-y-1.5 max-h-[620px] overflow-y-auto pr-1">
            {pipelineNodes.map((node, idx) => {
              const Icon = node.icon;
              const isSelected = selectedNodeIndex === idx;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNodeIndex(idx)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? "bg-indigo-50 border-indigo-500 shadow-xs ring-1 ring-indigo-500/20"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${node.color} text-white flex items-center justify-center shrink-0 shadow-xs`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{node.name}</div>
                      <div className="text-[10px] text-slate-500">{node.role}</div>
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 transition ${
                      isSelected ? "text-indigo-600 translate-x-1" : "text-slate-300"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Deep Telemetry & Payload Inspector */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
            {/* Inspector Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${activeNode.color} text-white flex items-center justify-center shadow-md`}
                >
                  {React.createElement(activeNode.icon, { className: "w-6 h-6" })}
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                    Pipeline Node Inspector
                  </span>
                  <h2 className="text-xl font-black text-slate-900">{activeNode.name}</h2>
                </div>
              </div>

              {/* Step Navigation */}
              <div className="flex items-center gap-1.5">
                <button
                  disabled={selectedNodeIndex === 0}
                  onClick={() => setSelectedNodeIndex(i => Math.max(0, i - 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  ← Prev
                </button>
                <button
                  disabled={selectedNodeIndex === pipelineNodes.length - 1}
                  onClick={() => setSelectedNodeIndex(i => Math.min(pipelineNodes.length - 1, i + 1))}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-40 cursor-pointer"
                >
                  Next →
                </button>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
              {activeNode.description}
            </p>

            {/* Live Operational Telemetry Strip */}
            <div className="p-3.5 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs flex items-center gap-2 shadow-inner">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
              <span>{activeNode.telemetry}</span>
            </div>

            {/* JSON Payload Inspector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-indigo-600" />
                  Live JSON Transaction Payload
                </span>
                <span className="text-[10px] font-mono text-slate-400">Content-Type: application/json</span>
              </div>

              <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner">
                {JSON.stringify(activeNode.payload, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
