// frontend/src/components/Nexus/StaffDashboardView.jsx
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
  FileCheck,
  FileText,
  Filter,
  Layers,
  MapPin,
  Microscope,
  Pill,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Trash2,
  Truck,
  UserCheck,
  Users,
  Wrench,
  Zap
} from "lucide-react";
import { nexusApi } from "./nexusApi";

export default function StaffDashboardView({ staffDepartment = "NURSING" }) {
  const [selectedDept, setSelectedDept] = useState(staffDepartment.toUpperCase());
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [activeTaskFilter, setActiveTaskFilter] = useState("ALL");

  // 1. Unified Task Inbox (Section 2)
  const [tasks, setTasks] = useState([
    {
      taskId: "TSK-BED-101",
      title: "Clean & Sanitize Bed ICU-05 Post-Discharge",
      department: "BED_CLEANING",
      priority: "CRITICAL",
      room: "Floor 2, ICU Pod 3",
      assignedTo: "Sanitation Team Rajesh",
      status: "IN_PROGRESS",
      createdAt: "10 mins ago",
      estimatedMinutes: 20,
      lifecycleStage: "CLEANING_REQUIRED"
    },
    {
      taskId: "TSK-TRF-204",
      title: "Patient P-104 Emergency Transfer Escort to ICU",
      department: "TRANSFER",
      priority: "CRITICAL",
      room: "From ER-01 to ICU-05",
      assignedTo: "Orderly Transport Escort",
      status: "IN_TRANSIT",
      createdAt: "5 mins ago",
      estimatedMinutes: 10,
      lifecycleStage: "IN_TRANSIT"
    },
    {
      taskId: "TSK-LAB-301",
      title: "Process STAT Troponin-I & 12-Lead ECG for P-101",
      department: "LABORATORY",
      priority: "STAT",
      room: "Pathology Stat Lab Suite",
      assignedTo: "Lab Specialist Kumar",
      status: "SAMPLE_RECEIVED",
      createdAt: "15 mins ago",
      estimatedMinutes: 15,
      lifecycleStage: "ANALYSIS"
    },
    {
      taskId: "TSK-PHM-401",
      title: "Dispense Cardiac Sublingual Sorbitrate for P-101",
      department: "PHARMACY",
      priority: "HIGH",
      room: "Outpatient Pharmacy Counter 3",
      assignedTo: "Lead Pharmacist Priya",
      status: "READY_FOR_PICKUP",
      createdAt: "8 mins ago",
      estimatedMinutes: 5,
      lifecycleStage: "DISPENSED"
    },
    {
      taskId: "TSK-EQP-501",
      title: "Routine Calibration: Hamilton G5 Ventilator (V-04)",
      department: "EQUIPMENT",
      priority: "MEDIUM",
      room: "Biomedical Engineering Bay 2",
      assignedTo: "Biomed Tech Rahul",
      status: "COMPLETED",
      createdAt: "45 mins ago",
      estimatedMinutes: 30,
      lifecycleStage: "CALIBRATED"
    }
  ]);

  // 2. Bed Lifecycle Tracker (Section 22)
  const [bedLifecycle, setBedLifecycle] = useState([
    {
      bedId: "ICU-05",
      ward: "Intensive Care Unit (ICU)",
      status: "CLEANING_REQUIRED",
      patientId: null,
      dischargedPatient: "P-1002 (Discharged 09:30 AM)",
      cleaningStartedAt: "10:15 AM",
      verifiedBy: null,
      steps: [
        { label: "Patient Left", done: true, time: "09:30 AM" },
        { label: "Cleaning Required", done: true, time: "09:35 AM" },
        { label: "Cleaning Completed", done: false, time: "Pending" },
        { label: "Verified Available", done: false, time: "Pending" }
      ]
    },
    {
      bedId: "GEN-A-02",
      ward: "General Ward A",
      status: "VERIFIED_AVAILABLE",
      patientId: null,
      dischargedPatient: "P-101 (Transferred to ER)",
      cleaningStartedAt: "08:45 AM",
      verifiedBy: "Sister Maria (Head Nurse)",
      steps: [
        { label: "Patient Left", done: true, time: "08:45 AM" },
        { label: "Cleaning Required", done: true, time: "08:50 AM" },
        { label: "Cleaning Completed", done: true, time: "09:10 AM" },
        { label: "Verified Available", done: true, time: "09:15 AM" }
      ]
    },
    {
      bedId: "ER-02",
      ward: "Emergency Care Pod",
      status: "OCCUPIED",
      patientId: "P-101",
      dischargedPatient: null,
      cleaningStartedAt: null,
      verifiedBy: "Nurse Anita Roy",
      steps: [
        { label: "Occupied", done: true, time: "10:45 AM" },
        { label: "Discharge Pending", done: false, time: "Not reached" },
        { label: "Cleaning Required", done: false, time: "Not reached" },
        { label: "Verified Available", done: false, time: "Not reached" }
      ]
    }
  ]);

  // Handle Mark Cleaning Completed
  const handleMarkCleaned = (bedId) => {
    setBedLifecycle(prev =>
      prev.map(b => {
        if (b.bedId === bedId) {
          return {
            ...b,
            status: "VERIFICATION_PENDING",
            steps: b.steps.map(s => s.label === "Cleaning Completed" ? { ...s, done: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : s)
          };
        }
        return b;
      })
    );
    setFeedbackMessage(`✓ Bed ${bedId} marked CLEANING_COMPLETED. Awaiting nursing supervisor verification.`);
  };

  // Handle Supervisor Verify Available (Section 22)
  const handleVerifyAvailable = (bedId) => {
    setBedLifecycle(prev =>
      prev.map(b => {
        if (b.bedId === bedId) {
          return {
            ...b,
            status: "VERIFIED_AVAILABLE",
            verifiedBy: "Supervisor Verified",
            steps: b.steps.map(s => s.label === "Verified Available" ? { ...s, done: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : s)
          };
        }
        return b;
      })
    );
    setFeedbackMessage(`✓ Bed ${bedId} marked VERIFIED_AVAILABLE and returned to live admissions inventory.`);
  };

  // Handle Complete Task
  const handleCompleteTask = (taskId) => {
    setTasks(prev =>
      prev.map(t => (t.taskId === taskId ? { ...t, status: "COMPLETED" } : t))
    );
    setFeedbackMessage(`✓ Task ${taskId} completed and logged to hospital audit trail.`);
  };

  const filteredTasks = tasks.filter(t => {
    if (selectedDept !== "ALL" && selectedDept !== "NURSING" && t.department !== selectedDept) return false;
    if (activeTaskFilter !== "ALL" && t.status !== activeTaskFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Staff Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-teal-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-teal-500 text-slate-950 uppercase tracking-wider">
              Staff & Services (Portal 4)
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-800 text-teal-300 border border-slate-700">
              Department: {selectedDept}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-teal-400" />
            <span>Staff Operations & Unified Task Inbox</span>
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm">
            Department-scoped task execution across nursing, bed sanitation lifecycle, patient transfers, pharmacy, and laboratory.
          </p>
        </div>

        {/* Department Switcher Tabs (Section 2 RBAC) */}
        <div className="flex flex-wrap gap-1.5 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700 text-xs">
          {["ALL", "NURSING", "BED_CLEANING", "TRANSFER", "LABORATORY", "PHARMACY"].map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                selectedDept === dept
                  ? "bg-teal-500 text-slate-950 shadow-sm"
                  : "text-slate-300 hover:text-white hover:bg-slate-700"
              }`}
            >
              {dept.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {feedbackMessage && (
        <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-950 text-xs font-semibold flex items-center justify-between animate-fade-in">
          <span>{feedbackMessage}</span>
          <button onClick={() => setFeedbackMessage("")} className="text-teal-700 hover:text-teal-900 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Grid: Left Column Bed Lifecycle (Section 22), Right Column Task Inbox */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Bed Cleaning & Verification Lifecycle (Section 22) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Bed className="w-5 h-5 text-teal-600" />
              Bed Cleaning & Verification
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800">
              Section 22
            </span>
          </div>

          <p className="text-xs text-slate-500">
            Never automatically mark a bed available when a patient leaves. Strict protocol: OCCUPIED → DISCHARGE PENDING → CLEANING REQUIRED → VERIFIED AVAILABLE.
          </p>

          <div className="space-y-4">
            {bedLifecycle.map((bed) => (
              <div key={bed.bedId} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono font-black text-sm text-slate-900">{bed.bedId}</span>
                    <span className="text-xs text-slate-500 ml-2">({bed.ward})</span>
                  </div>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                      bed.status === "VERIFIED_AVAILABLE"
                        ? "bg-emerald-100 text-emerald-800"
                        : bed.status === "CLEANING_REQUIRED"
                        ? "bg-amber-100 text-amber-800 animate-pulse"
                        : bed.status === "VERIFICATION_PENDING"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {bed.status.replace("_", " ")}
                  </span>
                </div>

                {/* Micro Steps */}
                <div className="grid grid-cols-4 gap-1 text-[10px] text-center font-bold">
                  {bed.steps.map((st, i) => (
                    <div
                      key={i}
                      className={`p-1 rounded-lg border ${
                        st.done
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-white text-slate-400 border-slate-200"
                      }`}
                    >
                      <div>{st.label}</div>
                      <div className="text-[9px] font-normal font-mono">{st.time}</div>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                  {bed.status === "CLEANING_REQUIRED" && (
                    <button
                      onClick={() => handleMarkCleaned(bed.bedId)}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                    >
                      Mark Cleaning Complete
                    </button>
                  )}
                  {bed.status === "VERIFICATION_PENDING" && (
                    <button
                      onClick={() => handleVerifyAvailable(bed.bedId)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verify & Release Bed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Columns: Unified Task Inbox */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-teal-600" />
                  Unified Task Inbox ({filteredTasks.length})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time operational queue dispatched by NEXUS autonomous constraint engine.
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 text-xs bg-slate-100 p-1 rounded-xl">
                {["ALL", "IN_PROGRESS", "COMPLETED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setActiveTaskFilter(st)}
                    className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                      activeTaskFilter === st ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Task Cards */}
            <div className="space-y-3">
              {filteredTasks.map((t) => (
                <div
                  key={t.taskId}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-teal-300 bg-white transition shadow-2xs space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-teal-300">
                        {t.taskId}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {t.department}
                      </span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                          t.priority === "CRITICAL" || t.priority === "STAT"
                            ? "bg-red-100 text-red-800 animate-pulse"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {t.priority}
                      </span>
                    </div>

                    <span className="text-xs font-mono text-slate-400">{t.createdAt}</span>
                  </div>

                  <h3 className="text-sm font-black text-slate-900">{t.title}</h3>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <div>
                      <span>Location: <strong className="text-slate-700">{t.room}</strong></span>
                      <span className="mx-2">•</span>
                      <span>Assigned: <strong className="text-slate-700">{t.assignedTo}</strong></span>
                    </div>

                    <div>
                      {t.status === "COMPLETED" ? (
                        <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Done
                        </span>
                      ) : (
                        <button
                          onClick={() => handleCompleteTask(t.taskId)}
                          className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Mark Completed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
