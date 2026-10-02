// frontend/src/components/Nexus/SimulationStudio.jsx
import React, { useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bed,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
  Play,
  RefreshCw,
  Scale,
  ShieldAlert,
  Sliders,
  Sparkles,
  TrendingUp,
  Truck,
  Users,
  Zap
} from "lucide-react";
import { nexusApi } from "./nexusApi";

export default function SimulationStudio() {
  const [activeTab, setActiveTab] = useState("scenarios"); // "scenarios" | "sandbox"
  
  // Custom What-If Sandbox Parameters
  const [demandDelta, setDemandDelta] = useState(20);
  const [icuBedDelta, setIcuBedDelta] = useState(-2);
  const [nurseDelta, setNurseDelta] = useState(-3);
  const [diagDelta, setDiagDelta] = useState(30);

  const [loading, setLoading] = useState(false);
  const [simResult, setSimResult] = useState(null);

  // Reproducible Scenario Runner State
  const [scenarioLoading, setScenarioLoading] = useState("");
  const [scenarioResult, setScenarioResult] = useState(null);

  const handleRunSimulation = async () => {
    setLoading(true);
    try {
      const res = await nexusApi.runSimulation({
        demandDeltaPercent: demandDelta,
        icuBedDelta,
        nurseDelta,
        diagnosticDeltaPercent: diagDelta
      });
      setSimResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunScenario = async (scenarioType, params = {}) => {
    setScenarioLoading(scenarioType);
    setScenarioResult(null);
    try {
      const res = await nexusApi.runScenario(scenarioType, params);
      setScenarioResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setScenarioLoading("");
    }
  };

  const scenariosList = [
    {
      id: "EMERGENCY_SURGE",
      title: "1. Emergency Surge & Nurse Reallocation (Section 52)",
      subtitle: "General Ward 6 nurses (4 req + 1 buffer = 1 releasable). Emergency 2 nurses -> 4 required.",
      icon: Zap,
      color: "border-red-400 bg-red-50/40 text-red-900",
      badgeColor: "bg-red-500 text-white",
      description: "Emergency demand increases. NEXUS evaluates candidates, checks qualifications, shift, workload, preserves General Ward minimum safe capacity (+1 buffer), and submits human approval recommendation."
    },
    {
      id: "PATIENT_TRANSFER",
      title: "2. Clinical Patient Transfer Lifecycle (Section 53)",
      subtitle: "Patient Vikram Malhotra (P-101) from General Bed GEN-A-02 -> Emergency Resuscitation Bay ER-02",
      icon: Truck,
      color: "border-teal-400 bg-teal-50/40 text-teal-900",
      badgeColor: "bg-teal-600 text-white",
      description: "Full 5-stage lifecycle: REQUESTED -> APPROVED -> IN_TRANSIT -> ARRIVED -> ASSIGNED. Receiving bed becomes occupied, source bed released to terminal disinfection, and nursing ratios recalculate."
    },
    {
      id: "OT_CASCADE",
      title: "3. OT-02 Delay Cascading Impact (Section 54)",
      subtitle: "Emergency surgery in OT Suite 2 prolonged by 45 minutes",
      icon: Clock,
      color: "border-amber-400 bg-amber-50/40 text-amber-900",
      badgeColor: "bg-amber-600 text-white",
      description: "Detects surgery overrun, calculates PACU recovery bed lock, surgeon schedule shift, surgical nursing workload surge, and generates a dynamic recovery slot mitigation."
    },
    {
      id: "CT_FAILURE",
      title: "4. CT Scanner Failure & Auto-Reroute (Section 55)",
      subtitle: "Siemens 128-Slice CT Scanner (DIAG-CT-01) experiences sudden detector failure",
      icon: AlertTriangle,
      color: "border-purple-400 bg-purple-50/40 text-purple-900",
      badgeColor: "bg-purple-600 text-white",
      description: "Flags CT-01 DOWN, tests compatibility of 64-slice CT-02, verifies certified technician availability, and automatically re-routes emergency neuro-scans with zero clinical disruption."
    },
    {
      id: "NURSE_UNAVAILABLE",
      title: "5. Nurse Unavailable & Self-Replanning (Section 12)",
      subtitle: "Allocated staff N-07 becomes suddenly unavailable during triage surge",
      icon: RefreshCw,
      color: "border-blue-400 bg-blue-50/40 text-blue-900",
      badgeColor: "bg-blue-600 text-white",
      description: "Demonstrates continuous self-replanning: invalidates initial recommendation, queries alternate feasible candidates, and proposes Nurse Anita Roy (N-08) within 30 seconds."
    },
    {
      id: "BED_RELEASE",
      title: "6. Bed Release & Disinfection Lifecycle (Section 32)",
      subtitle: "Patient discharge from ICU-08: OCCUPIED -> DISCHARGE_PENDING -> CLEANING -> VERIFIED_AVAILABLE",
      icon: Bed,
      color: "border-emerald-400 bg-emerald-50/40 text-emerald-900",
      badgeColor: "bg-emerald-600 text-white",
      description: "Bed availability is never assumed simply because patient departed. Implements bio-cleaning countdown and supervisor sign-off before admission flag is cleared."
    },
    {
      id: "COMPETING_DEMAND",
      title: "7. Competing Demand Resolution (Section 23, 56)",
      subtitle: "Single bottleneck CT-01 requested concurrently by Emergency, Urgent Inpatient & Routine Outpatient",
      icon: Scale,
      color: "border-slate-400 bg-slate-50 text-slate-900",
      badgeColor: "bg-slate-700 text-white",
      description: "Hospital-configured clinical priority tiering arbitrates access without AI hallucination. Prioritizes Acute Stroke Emergency while load-balancing routine requests."
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 rounded-2xl p-6 text-white border border-blue-500/30 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500 text-white uppercase tracking-wider">
            Sections 51-56 & 70
          </span>
          <span className="text-xs text-blue-300">Continuous Resource Orchestration & Scenario Validation</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">
              Hospital Simulation Studio & Scenario Runner
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              Execute reproducible specification scenarios or explore custom hypothetical what-if states. Every action triggers the exact backend event pipeline, dependency graph, and constraint optimizer.
            </p>
          </div>
          {/* Tab Selector */}
          <div className="flex items-center gap-1 bg-slate-800 p-1.5 rounded-xl border border-slate-700 self-start md:self-auto">
            <button
              onClick={() => setActiveTab("scenarios")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === "scenarios" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
              }`}
            >
              Specification Scenarios (7)
            </button>
            <button
              onClick={() => setActiveTab("sandbox")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === "sandbox" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
              }`}
            >
              What-If Sandbox Sliders
            </button>
          </div>
        </div>
      </div>

      {activeTab === "scenarios" ? (
        /* Scenarios View */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenariosList.map((sc) => {
              const isRunning = scenarioLoading === sc.id;
              const Icon = sc.icon;

              return (
                <div
                  key={sc.id}
                  className={`rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition hover:shadow-md ${sc.color}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${sc.badgeColor}`}>
                        1-Click Demo
                      </span>
                      <Icon className="w-5 h-5 opacity-70" />
                    </div>
                    <h3 className="text-sm font-bold leading-tight">{sc.title}</h3>
                    <p className="text-[11px] opacity-80 leading-relaxed">{sc.description}</p>
                  </div>

                  <div className="pt-4 border-t border-slate-200/60 mt-3">
                    <button
                      onClick={() => handleRunScenario(sc.id)}
                      disabled={isRunning}
                      className="w-full flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
                    >
                      <Play className={`w-3.5 h-3.5 ${isRunning ? "animate-spin" : ""}`} />
                      {isRunning ? "Executing Closed Loop..." : "Run Scenario"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Scenario Result View */}
          {scenarioResult && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-base font-black text-slate-900">
                    Execution Output: {scenarioResult.scenario}
                  </h2>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  Closed-Loop Event Pipeline Verified ✓
                </span>
              </div>

              {/* Emergency Surge Output Display */}
              {scenarioResult.scenario === "EMERGENCY_SURGE" && (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-slate-500 font-bold block mb-1">Donor: General Ward</span>
                      <div>Current: <strong>{scenarioResult.generalDepartment?.currentStaff}</strong></div>
                      <div>Required: <strong>{scenarioResult.generalDepartment?.estimatedRequiredStaff}</strong></div>
                      <div>Protected Buffer: <strong>{scenarioResult.generalDepartment?.protectedBuffer}</strong></div>
                      <div className="text-emerald-700 font-bold mt-1">Releasable: {scenarioResult.generalDepartment?.releasableCapacity} nurse</div>
                    </div>
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                      <span className="text-red-700 font-bold block mb-1">Recipient: Emergency</span>
                      <div>Initial Staff: <strong>2</strong></div>
                      <div>Surge Demand Required: <strong>4</strong></div>
                      <div className="text-red-700 font-bold mt-1">Shortage Detected: 2 nurses</div>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                      <span className="text-emerald-700 font-bold block mb-1">NEXUS Recommendation</span>
                      <div className="font-bold text-slate-900">{scenarioResult.recommendation?.title}</div>
                      <div className="text-[11px] text-slate-600 mt-1">{scenarioResult.recommendation?.reason}</div>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-semibold">
                    {scenarioResult.nextStep} Check the Recommendations tab to approve.
                  </div>
                </div>
              )}

              {/* Patient Transfer Output Display */}
              {scenarioResult.scenario === "PATIENT_TRANSFER" && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-teal-50 border border-teal-200">
                    <span className="font-bold text-teal-900 block mb-1">Transfer Milestones Executed:</span>
                    <div className="space-y-1">
                      {scenarioResult.lifecycle?.map((stg, i) => (
                        <div key={i} className="text-teal-800 font-semibold">• {stg}</div>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>Receiving Bed: <strong>{scenarioResult.stateChanges?.receivingBedOccupied} (OCCUPIED)</strong></div>
                    <div>Source Bed: <strong>{scenarioResult.stateChanges?.sourceBedReleasedToCleaning} (CLEANING)</strong></div>
                    <div>Location: <strong>{scenarioResult.stateChanges?.patientCurrentLocation}</strong></div>
                  </div>
                </div>
              )}

              {/* OT Cascade Output Display */}
              {scenarioResult.scenario === "OT_CASCADE" && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="font-bold text-amber-900 block mb-1">
                      Primary & Secondary Impacts (+{scenarioResult.delayMinutes} min):
                    </span>
                    <div className="space-y-1 text-slate-700">
                      {scenarioResult.primaryImpacts?.map((p, i) => (
                        <div key={i}>• <strong>{p.dependentWorkflow}:</strong> {p.description} (Lock: {p.affectedResource})</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* CT Failure Output Display */}
              {scenarioResult.scenario === "CT_FAILURE_SUBSTITUTION" && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
                    <span className="font-bold text-purple-900 block mb-1">
                      Resource Substitution Handled Automatically:
                    </span>
                    <div className="text-purple-800 font-semibold mb-2">
                      Failed Resource: {scenarioResult.failedResource}
                    </div>
                    <div className="space-y-1">
                      {scenarioResult.substitutionResult?.mitigationPlan?.map((plan, i) => (
                        <div key={i}>• {plan}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Competing Demand Output Display */}
              {scenarioResult.scenario === "COMPETING_DEMAND_RESOLUTION" && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-900 block mb-1">Hospital Clinical Priority Sequence:</span>
                    <div className="space-y-1.5">
                      {scenarioResult.result?.recommendedSequence?.map((seq) => (
                        <div key={seq.sequenceOrder} className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900 mr-2">#{seq.sequenceOrder} {seq.patientName}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">{seq.priorityTier}</span>
                            <div className="text-[11px] text-slate-500 mt-0.5">{seq.clinicalJustification}</div>
                          </div>
                          <span className="font-mono text-slate-400 font-bold">Est: {seq.estimatedDurationMinutes}m</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Nurse Unavailable Output Display */}
              {scenarioResult.scenario === "SELF_REPLANNING" && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                    <span className="font-bold text-blue-900 block mb-1">Continuous Self-Replanning Activated:</span>
                    <div className="text-red-700 font-semibold">• Invalidated Allocation: {scenarioResult.invalidatedAllocation}</div>
                    <div className="text-emerald-800 font-semibold mt-1">• New Feasible Candidate: {scenarioResult.selfReplannedRecommendation?.title}</div>
                  </div>
                </div>
              )}

              {/* Bed Release Output Display */}
              {scenarioResult.scenario === "BED_RELEASE_LIFECYCLE" && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="font-bold text-emerald-900 block mb-1">Bed {scenarioResult.bedId} State Transition:</span>
                    <div className="space-y-1">
                      {scenarioResult.lifecycleSteps?.map((stg, i) => (
                        <div key={i} className="text-emerald-800">• <strong>{stg.status}:</strong> {stg.patient}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* What-If Sandbox Sliders */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-600" />
              Scenario Parameters
            </h2>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Patient Influx Surge</span>
                <span className="text-blue-600 font-bold">+{demandDelta}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="60"
                step="5"
                value={demandDelta}
                onChange={(e) => setDemandDelta(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>ICU Bed Availability Change</span>
                <span className="text-red-600 font-bold">{icuBedDelta} beds</span>
              </div>
              <input
                type="range"
                min="-5"
                max="0"
                step="1"
                value={icuBedDelta}
                onChange={(e) => setIcuBedDelta(Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Nursing Staff Deficit</span>
                <span className="text-amber-600 font-bold">{nurseDelta} nurses</span>
              </div>
              <input
                type="range"
                min="-8"
                max="0"
                step="1"
                value={nurseDelta}
                onChange={(e) => setNurseDelta(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Radiology Load Surge</span>
                <span className="text-purple-600 font-bold">+{diagDelta}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="10"
                value={diagDelta}
                onChange={(e) => setDiagDelta(Number(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

            <button
              onClick={handleRunSimulation}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Play className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Simulate Prospective State
            </button>
          </div>

          {/* Results Side */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            {simResult ? (
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    Simulated Output
                  </span>
                  <h2 className="text-xl font-black text-slate-900">
                    Comparative Impact: Baseline vs Simulated
                  </h2>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Avg Wait Time</span>
                    <span className="text-lg font-black text-slate-900">{simResult.simulated.avgWaitMinutes}m</span>
                    <span className="text-[10px] text-red-500 font-bold block">+{simResult.simulated.avgWaitMinutes - simResult.baseline.avgWaitMinutes}m</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">ICU Occupancy</span>
                    <span className="text-lg font-black text-slate-900">{simResult.simulated.icuOccupancyPercent}%</span>
                    <span className="text-[10px] text-red-500 font-bold block">+{simResult.simulated.icuOccupancyPercent - simResult.baseline.icuOccupancyPercent}%</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Staff Load</span>
                    <span className="text-lg font-black text-slate-900">{simResult.simulated.staffWorkloadPercent}%</span>
                    <span className="text-[10px] text-amber-500 font-bold block">+{simResult.simulated.staffWorkloadPercent - simResult.baseline.staffWorkloadPercent}%</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Bottlenecks</span>
                    <span className="text-lg font-black text-red-600">{simResult.simulated.bottlenecksDetected} Critical</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Orchestrator Recommended Mitigations:
                  </h3>
                  <div className="space-y-1.5">
                    {simResult.orchestratorRecommendations?.map((rec, i) => (
                      <div key={i} className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-slate-400 text-xs">
                Adjust prospective parameters on the left and click "Simulate Prospective State" to test without modifying live data.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
