// admin/src/components/Nexus/NexusMasterLayout.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  Bed,
  Bot,
  Calendar,
  ChevronRight,
  Clock,
  Cpu,
  FileText,
  HeartPulse,
  Home,
  Layers,
  MapPin,
  Microscope,
  Radio,
  RotateCcw,
  Sliders,
  Stethoscope,
  TrendingUp,
  Users,
  Zap
} from "lucide-react";

import NexusCommandCenter from "./NexusCommandCenter";
import EmergencyView from "./EmergencyView";
import OrchestratorView from "./OrchestratorView";
import BedsWardsView from "./BedsWardsView";
import EquipmentView from "./EquipmentView";
import RtlsMapView from "./RtlsMapView";
import StaffView from "./StaffView";
import OtManagerView from "./OtManagerView";
import DiagnosticsView from "./DiagnosticsView";
import ForecastingView from "./ForecastingView";
import SimulationStudio from "./SimulationStudio";
import EhrTimelineView from "./EhrTimelineView";
import NexusCopilot from "./NexusCopilot";
import logoImg from "../../assets/logo.png";

export default function NexusMasterLayout() {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Command Center", icon: Radio, badge: "LIVE" },
    { id: "emergency", label: "Emergency Orchestrator", icon: Zap, badge: "P-104" },
    { id: "orchestrator", label: "Autonomous Re-Optimizer", icon: RotateCcw, badge: "Auto" },
    { id: "beds", label: "Beds & Wards", icon: Bed, badge: "48 Beds" },
    { id: "equipment", label: "Life Support Devices", icon: HeartPulse, badge: "20 Assets" },
    { id: "rtls", label: "2D Floorplan Map", icon: MapPin, badge: "RTLS" },
    { id: "staff", label: "Staff & Workloads", icon: Users, badge: "90 Staff" },
    { id: "ot", label: "Operating Theatres", icon: Activity, badge: "8 Suites" },
    { id: "diagnostics", label: "Diagnostics & Queues", icon: Microscope, badge: "Balance" },
    { id: "forecasting", label: "Demand Forecasting", icon: TrendingUp, badge: "+4h" },
    { id: "simulation", label: "Simulation Studio", icon: Sliders, badge: "What-If" },
    { id: "ehr", label: "EHR & FHIR R4", icon: Layers, badge: "FHIR" },
    { id: "copilot", label: "Nexus AI Copilot", icon: Cpu, badge: "AI" }
  ];

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                  <HeartPulse className="w-5 h-5 text-emerald-400 animate-pulse" />
                </div>
              </div>
              <div>
                <span className="font-black text-lg tracking-tight text-white flex items-center gap-1.5">
                  MediCare <span className="text-emerald-400">NEXUS</span>
                </span>
                <span className="text-[10px] text-slate-400 block -mt-1 tracking-widest uppercase">
                  Autonomous Resource Orchestration Platform
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Right Links */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-slate-300 font-semibold">Hackathon PS-1: Theme-1</span>
            </div>

            {/* Link back to Classic Admin Panel */}
            <div className="flex items-center gap-1.5">
              <Link
                to="/appointments"
                className="hidden md:inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
              >
                Appointments
              </Link>
              <Link
                to="/list"
                className="hidden md:inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
              >
                Doctors
              </Link>
              <Link
                to="/service-dashboard"
                className="hidden md:inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
              >
                Services
              </Link>
              <Link
                to="/"
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition shadow-sm"
              >
                Home
              </Link>
            </div>
          </div>
        </div>

        {/* Tab Navigation Scrollbar */}
        <div className="bg-slate-950 border-t border-slate-800 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-2 no-scrollbar">
            {tabs.map(t => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/50"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                  {t.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold ${
                        isActive ? "bg-emerald-800 text-white" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {t.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "overview" && <NexusCommandCenter onNavigateTab={(tab) => setActiveTab(tab)} />}
        {activeTab === "emergency" && <EmergencyView />}
        {activeTab === "orchestrator" && <OrchestratorView />}
        {activeTab === "beds" && <BedsWardsView />}
        {activeTab === "equipment" && <EquipmentView />}
        {activeTab === "rtls" && <RtlsMapView />}
        {activeTab === "staff" && <StaffView />}
        {activeTab === "ot" && <OtManagerView />}
        {activeTab === "diagnostics" && <DiagnosticsView />}
        {activeTab === "forecasting" && <ForecastingView />}
        {activeTab === "simulation" && <SimulationStudio />}
        {activeTab === "ehr" && <EhrTimelineView />}
        {activeTab === "copilot" && <NexusCopilot />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-4 px-6 text-center">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>MediCare Nexus – Autonomous Hospital Resource Orchestration Engine (HL7 FHIR R4 Compliant)</span>
          <span className="text-emerald-400 font-semibold">Hackathon Theme-1 PS No: 1 • All 100+ Simulated Resources Operational</span>
        </div>
      </footer>
    </div>
  );
}
