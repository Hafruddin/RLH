// admin/src/components/Nexus/EhrTimelineView.jsx
import React, { useState, useEffect } from "react";
import { Check, Clipboard, Code2, Database, FileText, Layers, RefreshCw, Sparkles, User } from "lucide-react";
import { nexusApi } from "./nexusApi";

export default function EhrTimelineView() {
  const [activeTab, setActiveTab] = useState("timeline"); // timeline | fhir
  const [fhirResource, setFhirResource] = useState("Patient"); // Patient | Encounter | Observation
  const [fhirData, setFhirData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadFhir() {
      if (fhirResource === "Patient") {
        const d = await nexusApi.getFhirPatient("P-104");
        setFhirData(d);
      } else if (fhirResource === "Encounter") {
        const d = await nexusApi.getFhirEncounter("P-104");
        setFhirData(d);
      } else {
        const d = await nexusApi.getFhirObservation("P-104");
        setFhirData(d);
      }
    }
    loadFhir();
  }, [fhirResource]);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(fhirData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const journeySteps = [
    { time: "09:40:12", title: "Emergency Triage Arrival", desc: "Patient registered at ER West Entrance with SpO2: 82%, HR: 142 bpm. Rapid ECG attached.", badge: "ACUITY CRITICAL", color: "bg-red-500" },
    { time: "09:40:28", title: "Autonomous Severity Scoring", desc: "Nexus ML Engine computed Code Red threshold. Immediate escalation level 2 triggered.", badge: "SCORE 98", color: "bg-amber-500" },
    { time: "09:40:41", title: "Multi-Criteria Constraint Solver", desc: "Evaluated 48 beds, 90 staff, 20 devices. Bed ICU-05, Dr. Sarah Johnson & Ventilator V-04 allocated.", badge: "COMPOSITE 94/100", color: "bg-emerald-500" },
    { time: "09:40:54", title: "Staff Push Notification Dispatched", desc: "Mobile telemetry dispatched to Dr. Sarah and Nurse N-07. Response time: 42 seconds verified.", badge: "DISPATCH VERIFIED", color: "bg-blue-500" },
    { time: "09:41:20", title: "Patient En Route & Bed Transit", desc: "Patient transferred via Rapid Transit Corridor into ICU Pod 3 (Negative Pressure Bay).", badge: "IN-TRANSIT", color: "bg-purple-500" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-600" />
            EHR Patient Journey & HL7 FHIR R4 Integration
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            End-to-end audit trail of emergency patient orchestration alongside standards-compliant HL7 FHIR R4 JSON payloads for hospital EHR interoperability.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("timeline")}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
              activeTab === "timeline" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Clinical Journey Tracker
          </button>
          <button
            onClick={() => setActiveTab("fhir")}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
              activeTab === "fhir" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            HL7 FHIR R4 Inspector
          </button>
        </div>
      </div>

      {activeTab === "timeline" ? (
        /* Journey Timeline View */
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Target Record</span>
              <h2 className="text-lg font-black text-slate-900">Patient P-104 (Emergency Cardiac Triage)</h2>
            </div>
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700">
              Active In-Hospital Encounter
            </span>
          </div>

          <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-6">
            {journeySteps.map((step, idx) => (
              <div key={idx} className="relative group">
                <div className={`absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full ${step.color} ring-4 ring-white`} />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{step.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {step.badge}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{step.time}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* FHIR R4 JSON Inspector */
        <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold rounded-lg bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                HL7 FHIR Release 4 (JSON Format)
              </span>
              <span className="text-xs text-slate-400">Resource: {fhirResource}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setFhirResource("Patient")}
                  className={`px-3 py-1 rounded cursor-pointer ${
                    fhirResource === "Patient" ? "bg-indigo-600 text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Patient
                </button>
                <button
                  onClick={() => setFhirResource("Encounter")}
                  className={`px-3 py-1 rounded cursor-pointer ${
                    fhirResource === "Encounter" ? "bg-indigo-600 text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Encounter
                </button>
                <button
                  onClick={() => setFhirResource("Observation")}
                  className={`px-3 py-1 rounded cursor-pointer ${
                    fhirResource === "Observation" ? "bg-indigo-600 text-white font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Observation
                </button>
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
                {copied ? "Copied" : "Copy Payload"}
              </button>
            </div>
          </div>

          <pre className="bg-slate-900/90 p-4 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto max-h-[480px] border border-slate-800">
            {JSON.stringify(fhirData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
