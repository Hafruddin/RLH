// frontend/src/components/Nexus/NexusMasterLayout.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Bed,
  Bell,
  Bot,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Compass,
  Cpu,
  Database,
  FileCheck,
  FileText,
  GitBranch,
  HeartPulse,
  Home,
  Layers,
  LogOut,
  MapPin,
  Microscope,
  Network,
  Pill,
  Radio,
  RefreshCw,
  RotateCcw,
  Scale,
  Search,
  Server,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Trophy,
  Truck,
  User,
  UserCheck,
  Users,
  Workflow,
  X,
  Zap,
  Flame,
  Brain
} from "lucide-react";

// Existing Views
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
import VoiceAgentMonitorView from "./VoiceAgentMonitorView";
import DependencyGraphView from "./DependencyGraphView";
import RecommendationsView from "./RecommendationsView";
import PatientTransferView from "./PatientTransferView";
import ConflictResolutionView from "./ConflictResolutionView";

// Round 2 Modules (Jury 25 Marks Specifications)
import ResourceHeatmapView from "./ResourceHeatmapView";
import DynamicSchedulingView from "./DynamicSchedulingView";
import SmartOpQueueView from "./SmartOpQueueView";
import SecurityPrivacyCenterView from "./SecurityPrivacyCenterView";
import AiMlStrategyView from "./AiMlStrategyView";
import Round2JuryDemoView from "./Round2JuryDemoView";

// Role-Specific Views
import PatientDashboardView from "./PatientDashboardView";
import DoctorWorkbenchView from "./DoctorWorkbenchView";
import StaffDashboardView from "./StaffDashboardView";
import MissionControlView from "./MissionControlView";

import { nexusApi } from "./nexusApi";

export default function NexusMasterLayout({ initialRole = null }) {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Role Resolution from URL, Prop, or Local Storage
  const resolvedRole = useMemo(() => {
    if (initialRole) return initialRole.toUpperCase();
    const p = location.pathname.toLowerCase();
    if (p.includes("/patient")) return "PATIENT";
    if (p.includes("/doctor")) return "DOCTOR";
    if (p.includes("/staff")) return "STAFF";
    const saved = localStorage.getItem("nexus_role");
    if (saved) return saved.toUpperCase();
    return "ADMIN";
  }, [location.pathname, initialRole]);

  const [currentRole, setCurrentRole] = useState(resolvedRole);
  const [currentUser, setCurrentUser] = useState(() => {
    switch (resolvedRole) {
      case "PATIENT":
        return { name: "Harsh Tripathi", id: "P-101", title: "Patient (ABHA #91-8273)" };
      case "DOCTOR":
        return { name: "Dr. Sarah Johnson", id: "DOC-01", title: "Consultant Cardiologist" };
      case "STAFF":
        return { name: "Nurse Sarah Jenkins", id: "N-07", title: "Senior ICU Nurse" };
      default:
        return { name: "Operations Supervisor", id: "ADM-01", title: "Hospital Administrator" };
    }
  });

  // Default active tab per role
  const defaultTabForRole = (r) => {
    switch (r) {
      case "PATIENT":
        return "patient-dashboard";
      case "DOCTOR":
        return "doctor-dashboard";
      case "STAFF":
        return "staff-dashboard";
      default:
        return "overview";
    }
  };

  const [activeTab, setActiveTab] = useState(() => defaultTabForRole(resolvedRole));
  const [orchestrationStage, setOrchestrationStage] = useState("MONITOR");
  const [connectivityStatus, setConnectivityStatus] = useState("LIVE");
  const [searchQuery, setSearchQuery] = useState("");
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: "N1", title: "🚨 Emergency Code Red", text: "Bed ICU-05 allocated for cardiac triage.", time: "2m ago", unread: true },
    { id: "N2", title: "⚖️ Autonomous Load-Balancing", text: "4 patients transferred from X-Ray 1 to X-Ray 2.", time: "8m ago", unread: true },
    { id: "N3", title: "🔄 RTLS Telemetry Drift", text: "Sensor conflict on ICU-05 verified by supervisor.", time: "15m ago", unread: false }
  ]);

  // Sync role changes if URL changes
  useEffect(() => {
    setCurrentRole(resolvedRole);
    setActiveTab(defaultTabForRole(resolvedRole));
    switch (resolvedRole) {
      case "PATIENT":
        setCurrentUser({ name: "Harsh Tripathi", id: "P-101", title: "Patient (ABHA #91-8273)" });
        break;
      case "DOCTOR":
        setCurrentUser({ name: "Dr. Sarah Johnson", id: "DOC-01", title: "Consultant Cardiologist" });
        break;
      case "STAFF":
        setCurrentUser({ name: "Nurse Sarah Jenkins", id: "N-07", title: "Senior ICU Nurse" });
        break;
      default:
        setCurrentUser({ name: "Operations Supervisor", id: "ADM-01", title: "Hospital Administrator" });
    }
    localStorage.setItem("nexus_role", resolvedRole);
  }, [resolvedRole]);

  // Polling for live authoritative hospital state
  useEffect(() => {
    const fetchState = async () => {
      try {
        const state = await nexusApi.getHospitalState();
        if (state && state.orchestrationStage) {
          setOrchestrationStage(state.orchestrationStage);
        }
      } catch (err) {
        setConnectivityStatus("CACHED — LAST UPDATED");
      }
    };
    fetchState();
    const interval = setInterval(fetchState, 6000);
    return () => clearInterval(interval);
  }, []);

  const stages = [
    "MONITOR",
    "PREDICT",
    "DETECT",
    "IMPACT ANALYSIS",
    "OPTIMIZE",
    "RECOMMEND",
    "APPROVAL",
    "ALLOCATE",
    "REPLAN"
  ];

  // 2. Strict Role-Based Tab Matrix (Section 2)
  const roleTabs = useMemo(() => {
    if (currentRole === "PATIENT") {
      return [
        { id: "patient-dashboard", label: "Patient Dashboard", icon: User },
        { id: "smart-op-queues", label: "My Virtual Queue & Journey", icon: Compass, badge: "Live ETA" },
        { id: "security-privacy", label: "My Privacy & Consent", icon: ShieldCheck, badge: "DPDP" },
        { id: "jury-demo", label: "Round 2 Demo", icon: Trophy, badge: "25 Marks ⭐" },
        { id: "visit-center", label: "Unified Visit Center", icon: Activity },
        { id: "patient-registration", label: "Patient Registration", icon: FileText },
        { id: "book-appointment", label: "Book Appointment", icon: Calendar },
        { id: "journey-timeline", label: "Journey Timeline", icon: HeartPulse },
        { id: "health-records", label: "Health Records", icon: FileCheck },
        { id: "insurance-readiness", label: "Insurance Readiness", icon: ShieldCheck },
        { id: "emergency-request", label: "Emergency Request", icon: AlertTriangle }
      ];
    }

    if (currentRole === "DOCTOR") {
      return [
        { id: "doctor-dashboard", label: "Doctor Dashboard", icon: Stethoscope, badge: "OPD Live" },
        { id: "smart-op-queues", label: "Smart OP Queues", icon: Compass, badge: "Auto-Routing" },
        { id: "dynamic-scheduling", label: "Dynamic Scheduling", icon: Cpu, badge: "CP-SAT" },
        { id: "resource-heatmap", label: "Resource Heatmap", icon: Flame, badge: "Live" },
        { id: "security-privacy", label: "Patient Privacy & Consent", icon: ShieldCheck, badge: "ABAC" },
        { id: "jury-demo", label: "Round 2 Demo", icon: Trophy, badge: "25 Marks ⭐" },
        { id: "ot", label: "Operating Theatres", icon: Activity, badge: "8 Suites" },
        { id: "diagnostics", label: "Diagnostic Orders", icon: Microscope, badge: "Imaging" },
        { id: "journey", label: "Patient Clinical Journey", icon: Compass, badge: "EHR" },
        { id: "copilot", label: "Clinical Decision Support", icon: Cpu, badge: "AI" }
      ];
    }

    if (currentRole === "STAFF") {
      return [
        { id: "staff-dashboard", label: "Task Inbox & Dashboard", icon: UserCheck, badge: "Active" },
        { id: "smart-op-queues", label: "Virtual Queues & ETA", icon: Compass, badge: "Live" },
        { id: "resource-heatmap", label: "Resource Heatmap", icon: Flame, badge: "RPI" },
        { id: "security-privacy", label: "Emergency Access", icon: ShieldCheck, badge: "Break-Glass" },
        { id: "transfers", label: "Patient Transfers", icon: Truck, badge: "5 Stages" },
        { id: "equipment", label: "Life Support Equipment", icon: HeartPulse, badge: "20 Assets" },
        { id: "jury-demo", label: "Round 2 Demo", icon: Trophy, badge: "25 Marks ⭐" },
        { id: "copilot", label: "Staff Assistant", icon: Cpu, badge: "AI" }
      ];
    }

    // HOSPITAL ADMIN (Full 23-Section Operational Command)
    return [
      { id: "jury-demo", label: "Round 2 Jury Demo", icon: Trophy, badge: "25 Marks ⭐" },
      { id: "resource-heatmap", label: "Resource Heatmap", icon: Flame, badge: "RPI Live" },
      { id: "dynamic-scheduling", label: "Dynamic Scheduling", icon: Cpu, badge: "CP-SAT" },
      { id: "smart-op-queues", label: "Smart OP Queues", icon: Compass, badge: "Virtual" },
      { id: "security-privacy", label: "Security & Privacy", icon: ShieldCheck, badge: "Break-Glass" },
      { id: "ai-ml-strategy", label: "AI/ML Strategy", icon: Brain, badge: "6 Models" },
      { id: "overview", label: "Command Center", icon: Radio, badge: "LIVE" },
      { id: "recommendations", label: "Approvals & Recommendations", icon: ShieldCheck, badge: "Decision" },
      { id: "dependencies", label: "Dependency & Cascade Graph", icon: Network, badge: "Graph" },
      { id: "transfers", label: "Patient Transfers", icon: Compass, badge: "5 Stages" },
      { id: "conflicts", label: "Conflict Resolution", icon: Scale, badge: "Non-Silent" },
      { id: "simulation", label: "Simulation Studio & Scenarios", icon: Sliders, badge: "16 Scenarios" },
      { id: "emergency", label: "Emergency Orchestrator", icon: Zap, badge: "Code Red" },
      { id: "orchestrator", label: "Autonomous Re-Optimizer", icon: RotateCcw, badge: "Auto" },
      { id: "beds", label: "Beds & Wards", icon: Bed, badge: "48 Beds" },
      { id: "equipment", label: "Life Support Devices", icon: HeartPulse, badge: "20 Assets" },
      { id: "rtls", label: "2D Floorplan Map", icon: MapPin, badge: "RTLS" },
      { id: "staff", label: "Staff & Workloads", icon: Users, badge: "90 Staff" },
      { id: "ot", label: "Operating Theatres", icon: Activity, badge: "8 Suites" },
      { id: "diagnostics", label: "Diagnostics & Queues", icon: Microscope, badge: "Balance" },
      { id: "forecasting", label: "Demand Forecasting", icon: TrendingUp, badge: "+4h" },
      { id: "ehr", label: "EHR & FHIR R4", icon: Layers, badge: "FHIR" },
      { id: "mission-control", label: "Mission Control Flow", icon: Workflow, badge: "Sec 53" },
      { id: "copilot", label: "Nexus AI Copilot", icon: Cpu, badge: "AI" },
      { id: "voice-monitor", label: "AI Agent Monitor", icon: Bot, badge: "Voice 🎙" }
    ];
  }, [currentRole]);

  // Handle Role Switching for Hackathon Evaluation
  const handleSwitchRole = async (targetRole) => {
    try {
      const res = await fetch("/api/auth/switch-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole })
      });
      const data = await res.json().catch(() => null);
      if (data && data.token) {
        localStorage.setItem("nexus_token", data.token);
      }
    } catch (e) {}

    localStorage.setItem("nexus_role", targetRole);
    setCurrentRole(targetRole);
    setActiveTab(defaultTabForRole(targetRole));
    setShowRoleSwitcher(false);

    if (targetRole === "PATIENT") navigate("/patient/dashboard");
    else if (targetRole === "DOCTOR") navigate("/doctor/dashboard");
    else if (targetRole === "STAFF") navigate("/staff/dashboard");
    else navigate("/admin/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
      {/* Top Application Header (Uniform Across All Roles - Section 1) */}
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left Brand */}
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
                  Autonomous Hospital Resource Orchestration Platform
                </span>
              </div>
            </Link>
          </div>

          {/* Role-Scoped Search Bar (Section 48) */}
          <div className="hidden md:flex items-center flex-1 max-w-xs mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  currentRole === "PATIENT"
                    ? "Search my appointments, reports..."
                    : currentRole === "DOCTOR"
                    ? "Search patients, consultations..."
                    : currentRole === "STAFF"
                    ? "Search department tasks..."
                    : "Search beds, staff, OT, alerts..."
                }
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-400"
              />
            </div>
          </div>

          {/* Right Action Tools: WebSocket Status, Notifications, Role Badge & Switcher */}
          <div className="flex items-center gap-2.5">
            {/* WebSocket Status Indicator (Section 41) */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs bg-slate-800/90 px-3 py-1.5 rounded-full border border-slate-700">
              <span className={`w-2 h-2 rounded-full ${connectivityStatus === "LIVE" ? "bg-emerald-400 animate-ping" : "bg-amber-400"}`} />
              <span className="text-slate-300 font-semibold">{connectivityStatus}</span>
            </div>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition relative cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {notifications.some(n => n.unread) && (
                  <span className="w-2 h-2 rounded-full bg-red-500 absolute top-1.5 right-1.5" />
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 text-slate-800 p-4 z-50 space-y-3 animate-scale-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-bold text-xs text-slate-900">Hospital Notifications</span>
                    <button
                      onClick={() => setNotifications(notifications.map(n => ({ ...n, unread: false })))}
                      className="text-[11px] text-indigo-600 font-semibold hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {notifications.map(n => (
                      <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-0.5">
                        <div className="font-bold text-slate-900 flex justify-between">
                          <span>{n.title}</span>
                          <span className="text-[10px] text-slate-400">{n.time}</span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{n.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile / Role Badge with Role Consistency (Section 1, 5) */}
            <div className="relative">
              <button
                onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer border shadow-xs ${
                  currentRole === "PATIENT"
                    ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                    : currentRole === "DOCTOR"
                    ? "bg-blue-950 text-blue-300 border-blue-800"
                    : currentRole === "STAFF"
                    ? "bg-teal-950 text-teal-300 border-teal-800"
                    : "bg-slate-800 text-white border-slate-700"
                }`}
              >
                <span>
                  {currentRole === "PATIENT" && "👤 Patient"}
                  {currentRole === "DOCTOR" && "👨‍⚕️ Doctor"}
                  {currentRole === "STAFF" && "🩺 Staff"}
                  {currentRole === "ADMIN" && "🛡️ Admin"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {/* Hackathon Role Switcher Dropdown */}
              {showRoleSwitcher && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 text-slate-800 p-3 z-50 space-y-2 animate-scale-in">
                  <div className="px-2 py-1 text-[11px] font-black uppercase text-slate-400">
                    Switch Active Portal Session
                  </div>

                  <button
                    onClick={() => handleSwitchRole("PATIENT")}
                    className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition flex items-center justify-between ${
                      currentRole === "PATIENT" ? "bg-emerald-50 text-emerald-900 border border-emerald-300" : "hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <div>👤 Patient Portal</div>
                      <div className="text-[10px] text-slate-500 font-normal">Harsh Tripathi · P-101</div>
                    </div>
                    {currentRole === "PATIENT" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>

                  <button
                    onClick={() => handleSwitchRole("DOCTOR")}
                    className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition flex items-center justify-between ${
                      currentRole === "DOCTOR" ? "bg-blue-50 text-blue-900 border border-blue-300" : "hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <div>👨‍⚕️ Doctor Workbench</div>
                      <div className="text-[10px] text-slate-500 font-normal">Dr. Sarah Johnson · DOC-01</div>
                    </div>
                    {currentRole === "DOCTOR" && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                  </button>

                  <button
                    onClick={() => handleSwitchRole("ADMIN")}
                    className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition flex items-center justify-between ${
                      currentRole === "ADMIN" ? "bg-indigo-50 text-indigo-900 border border-indigo-300" : "hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <div>🛡️ Hospital Admin</div>
                      <div className="text-[10px] text-slate-500 font-normal">Command Center · ADM-01</div>
                    </div>
                    {currentRole === "ADMIN" && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                  </button>

                  <button
                    onClick={() => handleSwitchRole("STAFF")}
                    className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition flex items-center justify-between ${
                      currentRole === "STAFF" ? "bg-teal-50 text-teal-900 border border-teal-300" : "hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <div>🩺 Staff & Services</div>
                      <div className="text-[10px] text-slate-500 font-normal">Nurse Sarah Jenkins · N-07</div>
                    </div>
                    {currentRole === "STAFF" && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
                  </button>
                </div>
              )}
            </div>

            {/* Quick Home / Logout */}
            <Link
              to="/"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Home"
            >
              <Home className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Closed-Loop Orchestration Status Bar (Section 61 & 71) */}
        <div className="bg-slate-900/95 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto text-[11px] no-scrollbar">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 shrink-0 flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-emerald-400" />
              Closed-Loop Orchestration:
            </span>
            <div className="flex items-center gap-1">
              {stages.map((stg, idx) => {
                const isCurrent =
                  orchestrationStage === stg ||
                  orchestrationStage?.replace("_", " ") === stg;

                return (
                  <React.Fragment key={stg}>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold uppercase transition ${
                        isCurrent
                          ? "bg-emerald-500 text-slate-950 font-black shadow-xs animate-pulse ring-1 ring-emerald-300"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {stg}
                    </span>
                    {idx < stages.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-slate-600 shrink-0" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Strictly Role-Filtered Tab Navigation Bar (Section 1, 2) */}
        <div className="bg-slate-950 border-t border-slate-800 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto py-2 no-scrollbar">
            {roleTabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? "bg-emerald-500 text-slate-950 shadow-md font-black"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{t.label}</span>
                  {t.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-md uppercase font-mono ${
                        isActive
                          ? "bg-slate-950 text-emerald-300"
                          : "bg-slate-800 text-slate-400"
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

      {/* Main Content Area with Left Sidebar (Matching media_1790965751916.png) */}
      <div className="flex-1 flex flex-col md:flex-row w-full overflow-hidden min-h-[calc(100vh-4rem)]">
        {/* Left Persistent Dark Navy Sidebar */}
        <aside className="w-full md:w-64 lg:w-72 bg-[#090e1c] border-r border-slate-800/80 p-4 shrink-0 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Top Brand Logo */}
            <div className="flex items-center gap-3 px-1 py-1">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-inner">
                <HeartPulse className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <div className="text-base font-black text-white tracking-tight leading-tight">
                  MediCare Nexus
                </div>
                <div className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
                  HOSPITAL PLATFORM
                </div>
              </div>
            </div>

            {/* Hospital Simulator Button (Scenarios A-H) */}
            <button
              onClick={() => setActiveTab("hospital-simulator")}
              className={`w-full mt-4 p-3 rounded-xl border transition-all text-left flex items-center justify-between group cursor-pointer ${
                activeTab === "hospital-simulator"
                  ? "bg-[#0e2744] border-cyan-400 shadow-md ring-1 ring-cyan-400/50"
                  : "bg-[#0e2238] border-cyan-800/40 hover:border-cyan-500/60"
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-black text-cyan-400">
                <span className="text-cyan-400 font-bold">▶</span>
                <span className="text-slate-100 group-hover:text-cyan-300">Hospital Simulator</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                SCENARIOS A-H
              </span>
            </button>

            {/* Round 2 Jury Demo Button (25 Marks) */}
            <button
              onClick={() => setActiveTab("jury-demo")}
              className={`w-full mt-2 p-3 rounded-xl border transition-all text-left flex items-center justify-between group cursor-pointer ${
                activeTab === "jury-demo"
                  ? "bg-[#2d1b06] border-amber-400 shadow-md ring-1 ring-amber-400/50"
                  : "bg-[#1f1304] border-amber-800/40 hover:border-amber-500/60"
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-black text-amber-400">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-100 group-hover:text-amber-300">Round 2 Jury Demo</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-500/30">
                25 MARKS ⭐
              </span>
            </button>

            {/* Section Category Title */}
            <div className="mt-6 px-1 text-[11px] font-black uppercase text-slate-400 tracking-wider">
              {currentRole === "PATIENT"
                ? "PORTAL 1: PATIENT & ATTENDANT"
                : currentRole === "DOCTOR"
                ? "PORTAL 2: DOCTOR WORKBENCH"
                : currentRole === "STAFF"
                ? "PORTAL 4: STAFF & SERVICES"
                : "PORTAL 3: HOSPITAL ADMIN"}
            </div>

            {/* Menu Items List */}
            <nav className="mt-3 space-y-1">
              {roleTabs.map((t) => {
                const Icon = t.icon;
                const isActive = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                      isActive
                        ? "bg-slate-800/90 text-white border-l-4 border-cyan-400 font-bold shadow-xs"
                        : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                    <span className="truncate">{t.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* User badge at bottom of sidebar */}
          <div className="pt-4 border-t border-slate-800/80 mt-6 text-xs text-slate-400 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-200">{currentUser.name}</div>
              <div className="text-[10px] text-slate-500">{currentUser.id} · {currentRole}</div>
            </div>
            <Link to="/" className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300" title="Home">
              <Home className="w-3.5 h-3.5" />
            </Link>
          </div>
        </aside>

        {/* Right Main Content Panel */}
        <main className="flex-1 bg-slate-100 text-slate-900 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Universal Round 2 Core Module Views (25 Marks) */}
          {activeTab === "jury-demo" && <Round2JuryDemoView />}
          {activeTab === "resource-heatmap" && <ResourceHeatmapView />}
          {activeTab === "dynamic-scheduling" && <DynamicSchedulingView />}
          {activeTab === "smart-op-queues" && <SmartOpQueueView />}
          {activeTab === "security-privacy" && <SecurityPrivacyCenterView />}
          {activeTab === "ai-ml-strategy" && <AiMlStrategyView />}

          {/* 1. PATIENT PORTAL VIEWS */}
          {currentRole === "PATIENT" && (
            <>
              {activeTab === "hospital-simulator" ? (
                <SimulationStudio />
              ) : activeTab === "jury-demo" || activeTab === "resource-heatmap" || activeTab === "dynamic-scheduling" || activeTab === "smart-op-queues" || activeTab === "security-privacy" || activeTab === "ai-ml-strategy" ? null : (
                <PatientDashboardView activeTab={activeTab} setActiveTab={setActiveTab} />
              )}
            </>
          )}

          {/* 2. DOCTOR WORKBENCH VIEWS */}
          {currentRole === "DOCTOR" && (
            <>
              {activeTab === "hospital-simulator" && <SimulationStudio />}
              {activeTab === "doctor-dashboard" && <DoctorWorkbenchView />}
              {activeTab === "ot" && <OtManagerView />}
              {activeTab === "diagnostics" && <DiagnosticsView />}
              {activeTab === "journey" && <EhrTimelineView />}
              {activeTab === "copilot" && <NexusCopilot />}
            </>
          )}

          {/* 3. STAFF & SERVICES VIEWS */}
          {currentRole === "STAFF" && (
            <>
              {activeTab === "hospital-simulator" && <SimulationStudio />}
              {activeTab === "staff-dashboard" && <StaffDashboardView staffDepartment="NURSING" />}
              {activeTab === "transfers" && <PatientTransferView />}
              {activeTab === "equipment" && <EquipmentView />}
              {activeTab === "copilot" && <NexusCopilot />}
            </>
          )}

          {/* 4. HOSPITAL ADMIN COMMAND CENTER VIEWS */}
          {currentRole === "ADMIN" && (
            <>
              {activeTab === "hospital-simulator" && <SimulationStudio />}
              {activeTab === "overview" && <NexusCommandCenter />}
              {activeTab === "recommendations" && <RecommendationsView />}
              {activeTab === "dependencies" && <DependencyGraphView />}
              {activeTab === "transfers" && <PatientTransferView />}
              {activeTab === "conflicts" && <ConflictResolutionView />}
              {activeTab === "simulation" && <SimulationStudio />}
              {activeTab === "emergency" && <EmergencyView />}
              {activeTab === "orchestrator" && <OrchestratorView />}
              {activeTab === "beds" && <BedsWardsView />}
              {activeTab === "equipment" && <EquipmentView />}
              {activeTab === "rtls" && <RtlsMapView />}
              {activeTab === "staff" && <StaffView />}
              {activeTab === "ot" && <OtManagerView />}
              {activeTab === "diagnostics" && <DiagnosticsView />}
              {activeTab === "forecasting" && <ForecastingView />}
              {activeTab === "ehr" && <EhrTimelineView />}
              {activeTab === "mission-control" && <MissionControlView />}
              {activeTab === "copilot" && <NexusCopilot />}
              {activeTab === "voice-monitor" && <VoiceAgentMonitorView />}
            </>
          )}
        </main>
      </div>

      {/* Unified Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-4 px-4 sm:px-6 lg:px-8 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-semibold text-white">MediCare Nexus</span>
            <span>· Autonomous Hospital Resource Orchestration Platform</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Server Time: {new Date().toLocaleTimeString()} (Asia/Kolkata)</span>
            <span>•</span>
            <span className="font-mono text-emerald-400">Authenticated: {currentUser.name} ({currentRole})</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
