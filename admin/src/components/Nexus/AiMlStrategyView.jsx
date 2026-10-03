// frontend/src/components/Nexus/AiMlStrategyView.jsx
import React, { useState, useEffect } from "react";
import {
  Brain,
  Cpu,
  Layers,
  LineChart,
  ShieldCheck,
  Sparkles,
  Zap,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  GitBranch,
  Target
} from "lucide-react";
import { nexusApi } from "./nexusApi";

export default function AiMlStrategyView() {
  const [strategy, setStrategy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModelIndex, setActiveModelIndex] = useState(0);

  // Live test inference
  const [testDemandInput, setTestDemandInput] = useState({ arrivals: 14, bedOccupancy: 84, emergencyLevel: "HIGH" });
  const [inferenceResult, setInferenceResult] = useState(null);

  const loadData = async () => {
    try {
      const data = await nexusApi.getAiMlStrategy();
      if (data && data.success) {
        setStrategy(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunInference = () => {
    // Deterministic ML inference demonstration
    setInferenceResult({
      predictedSurgeProbability: "87.4%",
      confidenceInterval: "95% [18 - 24 arrivals in next 4h]",
      recommendedAction: "Pre-emptively prepare 3 step-down beds in Ward B and float 2 on-call nurses",
      modelUsed: "XGBoost Regressor Ensemble + Isolation Forest",
      inferenceLatencyMs: 11.4
    });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* ─────────────────────────────────────────────────────────────
          1. Header & AI/ML Philosophy Banner
      ────────────────────────────────────────────────────────────── */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-cyan-500/10 via-blue-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Brain className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                AI / ML Algorithmic Strategy & Optimization Engine
              </h1>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Multi-Model Architecture
              </span>
            </div>
            <p className="text-slate-400 text-xs max-w-3xl leading-relaxed">
              Hospital Intelligence Architecture: Problem-specific algorithm selection rather than treating AI as a monolith. Combines Predictive ML (XGBoost/LightGBM) for demand and wait times, Constraint Programming (Google OR-Tools CP-SAT) for multi-resource allocation, Isolation Forest for anomaly detection, and Reinforcement Learning (DQN) as an advanced optimization layer.
            </p>
          </div>
        </div>

        {/* Guiding AI Philosophy */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-cyan-300 font-semibold flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              <strong>Guiding Philosophy:</strong> <em>"Use different AI/ML techniques for different optimization problems rather than using AI everywhere. AI predicts and optimizes; it does not independently make clinical decisions."</em>
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 shrink-0 hidden sm:inline">
            Predict → Optimize → Allocate → Verify → Learn
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. Closed-Loop Algorithmic Pipeline Strip
      ────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs space-y-2">
        <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
          Closed-Loop Continuous Learning & Optimization Loop:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs font-black">
          {["1. PREDICT", "2. OPTIMIZE", "3. ALLOCATE", "4. NOTIFY", "5. VERIFY", "6. UPDATE", "7. LEARN"].map((st, idx) => (
            <div key={st} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
              <span className="text-purple-600 block text-[10px]">STAGE 0{idx + 1}</span>
              <span className="text-xs mt-0.5 block">{st.split(". ")[1]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. Multi-Model Inventory Cards
      ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(strategy?.models || []).map((m, idx) => {
          const isSelected = activeModelIndex === idx;
          return (
            <div
              key={m.problem}
              onClick={() => setActiveModelIndex(idx)}
              className={`bg-white rounded-2xl p-5 border transition-all duration-200 shadow-xs cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "border-cyan-500 ring-2 ring-cyan-100 bg-linear-to-b from-cyan-50/20 to-white"
                  : "border-slate-200/80 hover:border-slate-300"
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-[10px] font-mono font-black text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded">
                    MODEL #{idx + 1}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">Latency: {m.latency}</span>
                </div>

                <h3 className="font-extrabold text-sm text-slate-900 leading-snug">{m.problem}</h3>
                <div className="mt-1 text-xs font-black text-purple-700 flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>{m.activeApproach || m.approach}</span>
                </div>

                <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Benchmark Accuracy:</span>
                    <span className="font-black text-emerald-700">{m.accuracy}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Candidate Frameworks:</span>
                    <span className="font-semibold text-slate-700 truncate max-w-[140px]">
                      {m.approaches ? m.approaches.join(", ") : "Specialized Engine"}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 mt-2.5 leading-relaxed">{m.output}</p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                <span>Features: {m.inputs?.length || 4} real-time signals</span>
                <span className="text-cyan-700 font-bold">Inspect Model →</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. Selected Model Deep Dive & Reinforcement Learning Telemetry
      ────────────────────────────────────────────────────────────── */}
      {strategy?.models?.[activeModelIndex] && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                ALGORITHMIC ARCHITECTURE EXPLORER
              </span>
              <h2 className="text-base font-black text-slate-900 mt-1">
                {strategy.models[activeModelIndex].problem} — {strategy.models[activeModelIndex].activeApproach || strategy.models[activeModelIndex].approach}
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Verified: {strategy.models[activeModelIndex].accuracy}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="font-bold text-slate-800 block">Feature Input Vector:</span>
              <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
                {(strategy.models[activeModelIndex].inputs || []).map(inp => (
                  <li key={inp}>{inp}</li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200 text-purple-950 space-y-2">
              <span className="font-bold block">Reinforcement Learning Optimization Layer:</span>
              <p className="text-[11px] leading-relaxed text-purple-900">
                Rather than acting as the sole decision-maker, Deep Q-Networks evaluate global hospital states and reward policies to avoid local optimization traps.
              </p>
              <div className="grid grid-cols-2 gap-1.5 text-[10px] pt-1 border-t border-purple-200/60 font-mono">
                <div>Reward 1: Lower wait time (-0.4)</div>
                <div>Reward 2: Zero conflicts (-1.0)</div>
                <div>Reward 3: Fewer delays (-0.3)</div>
                <div>Reward 4: Capacity efficiency (+0.5)</div>
              </div>
            </div>
          </div>

          {/* Test Live Inference Execution */}
          <div className="p-4 rounded-xl bg-cyan-50/40 border border-cyan-200 text-xs space-y-3">
            <div className="flex items-center justify-between font-black text-cyan-950">
              <span className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-cyan-600" />
                Execute Live Model Inference Simulation
              </span>
              <button
                onClick={handleRunInference}
                className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-black transition cursor-pointer shadow-xs"
              >
                Run Test Prediction
              </button>
            </div>

            {inferenceResult && (
              <div className="p-3 rounded-lg bg-white border border-cyan-200 space-y-1 text-slate-800 text-[11px]">
                <div className="flex justify-between font-bold">
                  <span>Surge Probability: {inferenceResult.predictedSurgeProbability}</span>
                  <span className="font-mono text-cyan-700">Latency: {inferenceResult.inferenceLatencyMs} ms</span>
                </div>
                <p className="text-slate-600">{inferenceResult.confidenceInterval}</p>
                <p className="font-bold text-purple-900 pt-1 border-t border-slate-100">
                  Recommendation: {inferenceResult.recommendedAction}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
