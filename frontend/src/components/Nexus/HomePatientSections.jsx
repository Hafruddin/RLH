// frontend/src/components/Nexus/HomePatientSections.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Activity,
  FileText,
  Calendar,
  HeartPulse,
  FileCheck,
  ShieldCheck,
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import PatientDashboardView from "./PatientDashboardView";

export default function HomePatientSections() {
  const [activeTab, setActiveTab] = useState("patient-dashboard");

  const sections = [
    { id: "patient-dashboard", label: "Patient Dashboard", icon: User },
    { id: "visit-center", label: "Unified Visit Center", icon: Activity },
    { id: "patient-registration", label: "Patient Registration", icon: FileText },
    { id: "book-appointment", label: "Book Appointment", icon: Calendar },
    { id: "journey-timeline", label: "Journey Timeline", icon: HeartPulse },
    { id: "health-records", label: "Health Records", icon: FileCheck },
    { id: "insurance-readiness", label: "Insurance Readiness", icon: ShieldCheck },
    { id: "emergency-request", label: "Emergency Request", icon: AlertTriangle }
  ];

  return (
    <section className="py-12 bg-slate-50 border-y border-emerald-100/60" id="patient-portal-sections">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-600 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              PORTAL 1: PATIENT & ATTENDANT
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              MediCare Nexus Patient Experience
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Real-time patient journey, intelligent OPD queue wait times, ABHA integration, digital visit center, and instant emergency response.
            </p>
          </div>

          <Link
            to="/patient/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition self-start md:self-auto cursor-pointer"
          >
            <span>Launch Dedicated Patient Portal</span>
            <ArrowRight className="w-4 h-4 text-emerald-400" />
          </Link>
        </div>

        {/* 7 Section Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeTab === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveTab(sec.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-md font-black"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-emerald-600"}`} />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Section Content */}
        <div className="bg-slate-100 rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs">
          <PatientDashboardView activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </div>
    </section>
  );
}
