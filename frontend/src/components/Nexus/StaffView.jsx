// admin/src/components/Nexus/StaffView.jsx
import React, { useState, useEffect } from "react";
import { CheckCircle, RefreshCw, ShieldCheck, Stethoscope, UserCheck, Users, AlertCircle } from "lucide-react";
import { nexusApi } from "./nexusApi";

export default function StaffView() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState("ALL");

  const loadStaff = async () => {
    try {
      const data = await nexusApi.getStaff();
      setStaff(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const filtered = staff.filter(s => {
    if (filterRole !== "ALL" && s.role.toLowerCase() !== filterRole.toLowerCase()) return false;
    return true;
  });

  const getWorkloadColor = (score) => {
    if (score >= 75) return "bg-red-500 text-red-700";
    if (score >= 50) return "bg-amber-500 text-amber-700";
    return "bg-emerald-500 text-emerald-700";
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Clinical Staff Workload & Roster Orchestrator
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Dynamic clinician fatigue index, real-time department assignments, and emergency trauma eligibility.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white text-slate-700"
          >
            <option value="ALL">All Roles</option>
            <option value="Doctor">Doctors / Surgeons</option>
            <option value="Nurse">Registered Nurses</option>
            <option value="Technician">Technicians</option>
          </select>

          <button onClick={loadStaff} className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-600 cursor-pointer">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(person => (
          <div key={person.staffId} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-500 transition">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                  {person.role} • {person.department}
                </span>
                <h3 className="font-extrabold text-base text-slate-900 mt-1">{person.name}</h3>
                <span className="text-xs text-slate-500">{person.specialization}</span>
              </div>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {person.status}
              </span>
            </div>

            <div className="mt-4 space-y-2 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span>Current Ward:</span>
                <span className="font-semibold text-slate-800">{person.currentWard}</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Shift Rotation:</span>
                <span className="font-semibold text-slate-800">{person.shift} (08:00 - 16:00)</span>
              </div>

              <div className="flex items-center justify-between">
                <span>Emergency ACLS Certified:</span>
                <span className={`font-semibold ${person.emergencyEligible ? "text-emerald-600" : "text-slate-400"}`}>
                  {person.emergencyEligible ? "✓ Certified Active" : "Standard"}
                </span>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span>Workload Saturation</span>
                  <span className="font-bold text-slate-800">{person.workloadScore || 35}% ({person.workload})</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full ${
                      (person.workloadScore || 35) > 75
                        ? "bg-red-500"
                        : (person.workloadScore || 35) > 50
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${person.workloadScore || 35}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
