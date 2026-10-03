// admin/src/components/Nexus/OtManagerView.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Filter,
  RefreshCw,
  Scissors,
  Search,
  Sliders,
  Sparkles,
  User,
  Zap,
  Check,
  X,
  Eye,
  ShieldCheck,
  Plus
} from "lucide-react";
import { nexusApi } from "./nexusApi";

// Default standard rates and surgical procedures by specialty
const SPECIALTY_DEFAULTS = {
  Cardiovascular: {
    baseRate: 850,
    prepFee: 150,
    procedures: ["Coronary Artery Bypass", "Aortic Valve Replacement", "Pacemaker Implantation", "Carotid Endarterectomy"],
    equipment: ["Heart-Lung Bypass Machine", "Fluoroscopy C-Arm", "Anesthesia Workstation"]
  },
  "Trauma & General": {
    baseRate: 750,
    prepFee: 120,
    procedures: ["Emergency Exploratory Laparotomy", "Splenectomy", "Thoracotomy", "Major Fracture Stabilization"],
    equipment: ["Rapid Blood Infuser", "Surgical Laparoscopy Tower", "Defibrillator"]
  },
  Neurosurgery: {
    baseRate: 950,
    prepFee: 180,
    procedures: ["Craniotomy Decompression", "Spinal Microdiscectomy", "Aneurysm Clipping", "Stereotactic Biopsy"],
    equipment: ["Surgical Microscope", "Stealth Navigation", "Intra-op Monitoring"]
  },
  Orthopedics: {
    baseRate: 650,
    prepFee: 130,
    procedures: ["Total Knee Arthroplasty", "Total Hip Replacement", "Anterior Cruciate Ligament (ACL) Reconstruction", "Open Reduction Internal Fixation"],
    equipment: ["Orthopedic Traction Table", "C-Arm", "Power Saws"]
  },
  General: {
    baseRate: 450,
    prepFee: 100,
    procedures: ["Laparoscopic Cholecystectomy", "Appendectomy", "Inguinal Hernia Repair", "Thyroidectomy"],
    equipment: ["4K Endoscopy Tower", "Harmonic Scalpel"]
  },
  Pediatrics: {
    baseRate: 550,
    prepFee: 120,
    procedures: ["Pediatric Herniotomy", "Pyloromyotomy", "Orchidopexy", "Cleft Palate Repair"],
    equipment: ["Neonatal Warmer", "Micro Instruments", "Pediatric Ventilator"]
  },
  Urology: {
    baseRate: 500,
    prepFee: 110,
    procedures: ["Holmium Laser Enucleation (HoLEP)", "Ureteroscopy & Stone Removal", "Transurethral Resection (TURP)", "Radical Prostatectomy"],
    equipment: ["Holmium Laser", "Urology Table", "Flexible Cystoscope"]
  },
  Microsurgery: {
    baseRate: 400,
    prepFee: 90,
    procedures: ["Phacoemulsification & IOL Implant", "Vitrectomy", "Reconstructive Blepharoplasty", "Microvascular Free Flap"],
    equipment: ["Phacoemulsification Machine", "Zeiss Lumera Microscope"]
  }
};

const STANDARD_SLOTS = [
  { id: "slot-morning", label: "Morning", time: "08:00 - 11:30", key: "morning" },
  { id: "slot-afternoon", label: "Afternoon", time: "12:00 - 15:30", key: "afternoon" },
  { id: "slot-evening", label: "Evening", time: "16:00 - 19:30", key: "evening" },
  { id: "slot-night", label: "Night Emergency", time: "20:00 - 07:30", key: "night" }
];

export default function OtManagerView() {
  const [ots, setOts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedSlotFilter, setSelectedSlotFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("cards"); // "cards" | "schedule"

  // Booking Modal State
  const [bookingOt, setBookingOt] = useState(null);
  const [bookingDate, setBookingDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [bookingSlot, setBookingSlot] = useState("12:00 - 15:30");
  const [surgeryType, setSurgeryType] = useState("Emergency Laparotomy / Hemostasis");
  const [patientName, setPatientName] = useState("Patient P-109");
  const [surgeonName, setSurgeonName] = useState("Dr. Rajesh Gupta");
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [priority, setPriority] = useState("EMERGENCY");
  const [includeAdvancedTech, setIncludeAdvancedTech] = useState(true);
  const [anesthesiaType, setAnesthesiaType] = useState("General Anesthesia");
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState("");

  // Schedule Timeline Drawer / Modal
  const [detailOt, setDetailOt] = useState(null);

  // Cost Calculator Modal
  const [costCalculatorOt, setCostCalculatorOt] = useState(null);
  const [calcDuration, setCalcDuration] = useState(120);
  const [calcPriority, setCalcPriority] = useState("ELECTIVE");
  const [calcTech, setCalcTech] = useState(true);

  const loadOts = async () => {
    try {
      const data = await nexusApi.getOperatingTheatres();
      setOts(data || []);
    } catch (e) {
      console.error("Failed to load OT suites", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOts();
    const interval = setInterval(loadOts, 15000);
    return () => clearInterval(interval);
  }, []);

  // Sync procedure list when bookingOt changes
  useEffect(() => {
    if (bookingOt) {
      const spec = SPECIALTY_DEFAULTS[bookingOt.specialty] || SPECIALTY_DEFAULTS.General;
      setSurgeryType(spec.procedures[0] || "General Surgical Procedure");
      setBookingDate(selectedDate);
    }
  }, [bookingOt, selectedDate]);

  // Dynamic slot availability calculation per OT
  const getSuiteSlotAvailability = (ot, dateStr) => {
    const isToday = dateStr === new Date().toISOString().split("T")[0];
    const slots = [
      { id: "morning", label: "08:00 - 11:30", name: "Morning", status: "FREE", procedure: null, surgeon: null },
      { id: "afternoon", label: "12:00 - 15:30", name: "Afternoon", status: "FREE", procedure: null, surgeon: null },
      { id: "evening", label: "16:00 - 19:30", name: "Evening", status: "FREE", procedure: null, surgeon: null },
      { id: "night", label: "20:00 - 07:30", name: "Night", status: "EMERGENCY_STANDBY", procedure: null, surgeon: "Trauma On-Call" }
    ];

    if (isToday) {
      if (ot.status === "OCCUPIED" && ot.currentProcedure) {
        slots[0].status = "OCCUPIED";
        slots[0].procedure = ot.currentProcedure.surgeryType;
        slots[0].surgeon = ot.currentProcedure.surgeonName;
        slots[1].status = "OCCUPIED";
        slots[1].procedure = "Intra-op Extension / Recovery";
        slots[1].surgeon = ot.currentProcedure.surgeonName;
      } else if (ot.status === "CLEANING") {
        slots[0].status = "STERILIZING";
        slots[0].procedure = "Laminar Turnover & Bio-Decon";
        slots[0].surgeon = "Sterile Staff";
      }

      if (ot.upcomingSchedule && ot.upcomingSchedule.length > 0) {
        const up = ot.upcomingSchedule[0];
        slots[2].status = "BOOKED";
        slots[2].procedure = up.surgeryType;
        slots[2].surgeon = up.surgeonName;
      }
    } else {
      // Deterministic synthetic booking for future dates to allow realistic preview
      const hash = (ot.otId.charCodeAt(4) || 1) + new Date(dateStr).getDate();
      if (hash % 3 === 0) {
        slots[0].status = "BOOKED";
        slots[0].procedure = "Scheduled Elective Case";
        slots[0].surgeon = "Dr. S. Johnson";
      }
      if (hash % 2 === 0) {
        slots[2].status = "BOOKED";
        slots[2].procedure = "Scheduled Specialized Case";
        slots[2].surgeon = "Dr. M. Chen";
      }
    }

    return slots;
  };

  // Cost calculator computation
  const calculateCost = (rate, prepFee, durationMin, priorityType = "ELECTIVE", techIncluded = true) => {
    const baseHourRate = rate || 650;
    const prep = prepFee || 120;
    const hours = durationMin / 60;
    const timeCost = Math.round(baseHourRate * hours);
    const techSurcharge = techIncluded ? 180 : 0;
    const anesthesiaCost = 220;
    const subtotal = timeCost + prep + techSurcharge + anesthesiaCost;
    const multiplier = priorityType === "EMERGENCY" ? 1.25 : priorityType === "URGENT" ? 1.1 : 1.0;
    const total = Math.round(subtotal * multiplier);

    return {
      timeCost,
      prep,
      techSurcharge,
      anesthesiaCost,
      subtotal,
      multiplier,
      total
    };
  };

  const handleScheduleSurgery = async () => {
    if (!bookingOt) return;
    try {
      const rate = bookingOt.hourlyRate || SPECIALTY_DEFAULTS[bookingOt.specialty]?.baseRate || 650;
      const prepFee = bookingOt.sterilePrepFee || 120;
      const costObj = calculateCost(rate, prepFee, durationMinutes, priority, includeAdvancedTech);

      await nexusApi.scheduleOT({
        otId: bookingOt.otId,
        surgeryType,
        patientName,
        surgeonName,
        scheduledTime: `${bookingDate}T${bookingSlot.split(" - ")[0]}:00.000Z`,
        durationMinutes: Number(durationMinutes),
        priority,
        estimatedCost: costObj.total,
        notes: `Anesthesia: ${anesthesiaType}. Date: ${bookingDate}, Slot: ${bookingSlot}`
      });

      setBookingSuccessMsg(`Surgery successfully scheduled for ${bookingOt.otId} on ${bookingDate} (${bookingSlot})!`);
      setTimeout(() => {
        setBookingOt(null);
        setBookingSuccessMsg("");
      }, 1400);

      loadOts();
    } catch (e) {
      console.error(e);
      alert("Failed to schedule surgery. Please check console.");
    }
  };

  const handleUpdateStatus = async (otId, newStatus) => {
    try {
      await nexusApi.updateOTStatus(otId, newStatus);
      loadOts();
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  // Filtered OT Suites
  const filteredOts = useMemo(() => {
    return ots.filter(ot => {
      // Specialty filter
      if (selectedSpecialty !== "ALL" && ot.specialty !== selectedSpecialty) return false;
      // Status filter
      if (statusFilter !== "ALL" && ot.status !== statusFilter) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = ot.name?.toLowerCase().includes(q);
        const matchesId = ot.otId?.toLowerCase().includes(q);
        const matchesSpec = ot.specialty?.toLowerCase().includes(q);
        const matchesSurgeon = ot.currentProcedure?.surgeonName?.toLowerCase().includes(q);
        const matchesProcedure = ot.currentProcedure?.surgeryType?.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesSpec && !matchesSurgeon && !matchesProcedure) return false;
      }
      // Slot filter
      if (selectedSlotFilter !== "ALL") {
        const slots = getSuiteSlotAvailability(ot, selectedDate);
        const matchingSlot = slots.find(s => s.id === selectedSlotFilter);
        if (matchingSlot && matchingSlot.status !== "FREE") return false;
      }
      return true;
    });
  }, [ots, selectedSpecialty, statusFilter, searchQuery, selectedSlotFilter, selectedDate]);

  // KPI calculations
  const totalCount = ots.length;
  const availableCount = ots.filter(o => o.status === "AVAILABLE").length;
  const occupiedCount = ots.filter(o => o.status === "OCCUPIED").length;
  const cleaningCount = ots.filter(o => o.status === "CLEANING").length;
  const utilization = totalCount > 0 ? Math.round(((occupiedCount) / totalCount) * 100) : 0;

  const specialties = useMemo(() => {
    const list = Array.from(new Set(ots.map(o => o.specialty).filter(Boolean)));
    return ["ALL", ...list];
  }, [ots]);

  return (
    <div className="space-y-4">
      {/* ─────────────────────────────────────────────────────────────
          1. Header & Live Metrics Bar (Compact & Sleek)
      ────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-100 text-purple-700 rounded-lg">
                <Activity className="w-5 h-5" />
              </div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Operating Theatre (OT) Suites Orchestrator
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                8 Suites Live
              </span>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              Live surgical scheduling, real-time hourly slot checking, sterile turnaround & cost transparency.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Toggle */}
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-semibold">
              <button
                onClick={() => setViewMode("cards")}
                className={`px-2.5 py-1 rounded-md transition ${viewMode === "cards" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"}`}
              >
                Compact Cards
              </button>
              <button
                onClick={() => setViewMode("schedule")}
                className={`px-2.5 py-1 rounded-md transition ${viewMode === "schedule" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"}`}
              >
                24h Schedule Matrix
              </button>
            </div>

            <button
              onClick={loadOts}
              title="Refresh OT Suites"
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-purple-600" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Live OT KPI Mini Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-3">
          <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500">Total Suites</span>
              <p className="text-base font-black text-slate-900">{totalCount}</p>
            </div>
            <span className="text-[11px] font-bold text-slate-400">100%</span>
          </div>

          <div className="bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-700">Available</span>
              <p className="text-base font-black text-emerald-800">{availableCount}</p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          <div className="bg-purple-50/70 p-2.5 rounded-lg border border-purple-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-purple-700">In Surgery</span>
              <p className="text-base font-black text-purple-900">{occupiedCount}</p>
            </div>
            <Scissors className="w-3.5 h-3.5 text-purple-600" />
          </div>

          <div className="bg-amber-50/70 p-2.5 rounded-lg border border-amber-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-700">Sterilizing</span>
              <p className="text-base font-black text-amber-900">{cleaningCount}</p>
            </div>
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
          </div>

          <div className="bg-indigo-50/70 p-2.5 rounded-lg border border-indigo-100 col-span-2 sm:col-span-1 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-700">Active Utilization</span>
              <p className="text-base font-black text-indigo-900">{utilization}%</p>
            </div>
            <div className="text-[10px] font-bold text-indigo-600">Peak Cap</div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. Doctor's Date & Time Slot Checking Control Bar
      ────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Date Selector for Doctor */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-600" />
              Check Date:
            </span>

            {/* Quick Date Pills */}
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
              <button
                onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
                className={`px-2.5 py-1 rounded-md transition ${selectedDate === new Date().toISOString().split("T")[0] ? "bg-white text-purple-700 shadow-xs font-black" : "text-slate-600 hover:text-slate-900"}`}
              >
                Today
              </button>
              <button
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() + 1);
                  setSelectedDate(d.toISOString().split("T")[0]);
                }}
                className={`px-2.5 py-1 rounded-md transition ${selectedDate === new Date(Date.now() + 86400000).toISOString().split("T")[0] ? "bg-white text-purple-700 shadow-xs font-black" : "text-slate-600 hover:text-slate-900"}`}
              >
                Tomorrow
              </button>
            </div>

            {/* Custom Date Input */}
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-hidden focus:border-purple-500"
            />
          </div>

          {/* Time Slot Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-600" />
              Slot Availability:
            </span>
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold flex-wrap">
              <button
                onClick={() => setSelectedSlotFilter("ALL")}
                className={`px-2 py-1 rounded-md transition ${selectedSlotFilter === "ALL" ? "bg-white text-purple-700 shadow-xs font-bold" : "text-slate-600"}`}
              >
                All Hours
              </button>
              <button
                onClick={() => setSelectedSlotFilter("morning")}
                className={`px-2 py-1 rounded-md transition ${selectedSlotFilter === "morning" ? "bg-white text-purple-700 shadow-xs font-bold" : "text-slate-600"}`}
              >
                Morning (08-11:30)
              </button>
              <button
                onClick={() => setSelectedSlotFilter("afternoon")}
                className={`px-2 py-1 rounded-md transition ${selectedSlotFilter === "afternoon" ? "bg-white text-purple-700 shadow-xs font-bold" : "text-slate-600"}`}
              >
                Afternoon (12-15:30)
              </button>
              <button
                onClick={() => setSelectedSlotFilter("evening")}
                className={`px-2 py-1 rounded-md transition ${selectedSlotFilter === "evening" ? "bg-white text-purple-700 shadow-xs font-bold" : "text-slate-600"}`}
              >
                Evening (16-19:30)
              </button>
            </div>
          </div>
        </div>

        {/* Search & Specialty Filter Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search suite, surgeon, procedure..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-purple-500"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Status:</span>
            {["ALL", "AVAILABLE", "OCCUPIED", "CLEANING"].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2 py-1 text-[11px] font-bold rounded-lg transition whitespace-nowrap ${
                  statusFilter === st
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {st === "ALL" ? "All Status" : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. Compact OT Suite Cards View (User requested: Box sizes small)
      ────────────────────────────────────────────────────────────── */}
      {viewMode === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
          {filteredOts.map(ot => {
            const specData = SPECIALTY_DEFAULTS[ot.specialty] || SPECIALTY_DEFAULTS.General;
            const rate = ot.hourlyRate || specData.baseRate;
            const prep = ot.sterilePrepFee || specData.prepFee;
            const slots = getSuiteSlotAvailability(ot, selectedDate);
            const freeSlotsCount = slots.filter(s => s.status === "FREE").length;
            const nextFreeText = ot.status === "AVAILABLE" ? "Available Immediately" : ot.status === "CLEANING" ? "Free in ~15 min" : "Free at 15:30";

            return (
              <div
                key={ot.otId}
                className={`bg-white p-3.5 sm:p-4 rounded-xl border transition-all duration-200 shadow-2xs hover:shadow-xs flex flex-col justify-between ${
                  ot.status === "OCCUPIED"
                    ? "border-purple-200/90 bg-linear-to-b from-purple-50/30 to-white"
                    : ot.status === "AVAILABLE"
                    ? "border-emerald-200/90 bg-linear-to-b from-emerald-50/20 to-white"
                    : "border-amber-200/90 bg-linear-to-b from-amber-50/20 to-white"
                }`}
              >
                {/* Compact Card Header */}
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-purple-800 bg-purple-100 px-1.5 py-0.5 rounded">
                        {ot.otId}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded truncate max-w-[110px]">
                        {ot.specialty}
                      </span>
                    </div>

                    {/* Live Status Badge */}
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs ${
                        ot.status === "AVAILABLE"
                          ? "bg-emerald-600 text-white"
                          : ot.status === "OCCUPIED"
                          ? "bg-purple-600 text-white"
                          : "bg-amber-600 text-white"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                      {ot.status}
                    </span>
                  </div>

                  {/* Suite Title (Compact font) */}
                  <h3 className="font-extrabold text-[13px] text-slate-900 leading-snug line-clamp-1" title={ot.name}>
                    {ot.name}
                  </h3>

                  {/* Location & Tech Tier tag */}
                  <div className="text-[10px] text-slate-400 flex items-center justify-between mt-0.5">
                    <span>{ot.location || "Surgical Wing 3F"}</span>
                    <span className="text-purple-600 font-semibold truncate max-w-[130px]" title={ot.techTier}>
                      {ot.techTier || specData.equipment[0]}
                    </span>
                  </div>

                  {/* ─────────────────────────────────────────────
                      Cost Checking Strip (User requirement)
                  ────────────────────────────────────────────── */}
                  <div className="mt-2.5 p-2 rounded-lg bg-slate-50/80 border border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-slate-700">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-black text-slate-900">${rate}</span>
                        <span className="text-[10px] text-slate-500">/hr</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block leading-tight">+${prep} sterile prep</span>
                      <button
                        onClick={() => {
                          setCostCalculatorOt(ot);
                          setCalcDuration(120);
                        }}
                        className="text-[10px] font-bold text-purple-700 hover:text-purple-900 underline decoration-purple-300 cursor-pointer"
                      >
                        Est. Cost Breakup
                      </button>
                    </div>
                  </div>

                  {/* ─────────────────────────────────────────────
                      Date & Time Slot Availability (User requirement)
                  ────────────────────────────────────────────── */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span className="font-black text-slate-700 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-purple-600" />
                        Slots ({selectedDate === new Date().toISOString().split("T")[0] ? "Today" : selectedDate.slice(5)}):
                      </span>
                      <span className={`text-[10px] font-bold ${freeSlotsCount > 0 ? "text-emerald-700" : "text-amber-700"}`}>
                        {freeSlotsCount} free
                      </span>
                    </div>

                    {/* Compact 4-Shift Timeline Pill Strip */}
                    <div className="grid grid-cols-4 gap-1">
                      {slots.map(s => {
                        const isFree = s.status === "FREE";
                        const isOcc = s.status === "OCCUPIED" || s.status === "BOOKED";
                        return (
                          <div
                            key={s.id}
                            title={`${s.name} (${s.label}): ${s.status}${s.procedure ? ` - ${s.procedure}` : ""}`}
                            className={`p-1 rounded text-center cursor-default transition ${
                              isFree
                                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                                : isOcc
                                ? "bg-purple-100 border border-purple-200 text-purple-800"
                                : "bg-amber-50 border border-amber-200 text-amber-800"
                            }`}
                          >
                            <span className="text-[9px] font-black block uppercase">{s.name.slice(0, 3)}</span>
                            <span className="text-[8px] font-bold opacity-80 block truncate">
                              {isFree ? "Free" : isOcc ? "Booked" : "Sterile"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ─────────────────────────────────────────────
                      Active Surgical Status / Live Progress
                  ────────────────────────────────────────────── */}
                  <div className="mt-2.5">
                    {ot.status === "OCCUPIED" && ot.currentProcedure ? (
                      <div className="p-2 rounded-lg bg-purple-50/70 border border-purple-200 text-xs space-y-1">
                        <div className="font-bold text-purple-950 flex items-center justify-between">
                          <span className="truncate flex items-center gap-1 text-[11px]">
                            <Scissors className="w-3 h-3 text-purple-600 shrink-0" />
                            {ot.currentProcedure.surgeryType}
                          </span>
                          <span className="text-[9px] font-black uppercase text-purple-700 bg-purple-200/60 px-1 py-0.2 rounded">
                            {ot.currentProcedure.priority || "Live"}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-600 flex items-center justify-between">
                          <span>Pt: {ot.currentProcedure.patientName}</span>
                          <span className="font-semibold text-slate-700">{ot.currentProcedure.surgeonName}</span>
                        </div>
                        {/* Live Duration Indicator */}
                        <div className="text-[10px] font-bold text-purple-700 flex items-center justify-between pt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 animate-spin" /> In progress (~{ot.currentProcedure.durationMinutes || 90}m)
                          </span>
                          <button
                            onClick={() => handleUpdateStatus(ot.otId, "CLEANING")}
                            className="text-[9px] font-black text-purple-900 bg-purple-200/70 hover:bg-purple-300 px-1.5 py-0.5 rounded cursor-pointer transition"
                            title="Complete procedure and send suite for sterile turnaround"
                          >
                            End & Clean
                          </button>
                        </div>
                      </div>
                    ) : ot.status === "CLEANING" ? (
                      <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200 text-xs flex items-center justify-between">
                        <div>
                          <div className="font-bold text-amber-900 flex items-center gap-1 text-[11px]">
                            <ShieldCheck className="w-3 h-3 text-amber-600" />
                            Turnaround Decontamination
                          </div>
                          <span className="text-[10px] text-amber-700">Laminar airflow sterilization (~15m)</span>
                        </div>
                        <button
                          onClick={() => handleUpdateStatus(ot.otId, "AVAILABLE")}
                          className="text-[9px] font-black text-emerald-900 bg-emerald-200 hover:bg-emerald-300 px-1.5 py-0.5 rounded cursor-pointer transition"
                          title="Mark suite sterile and immediately available"
                        >
                          Mark Ready
                        </button>
                      </div>
                    ) : (
                      <div className="p-2 rounded-lg bg-emerald-50/50 border border-emerald-100 text-xs flex items-center justify-between text-emerald-800">
                        <div className="flex items-center gap-1 text-[11px] font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Prepped for Immediate Trauma</span>
                        </div>
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                          Class 100
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Compact Card Action Footer */}
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  <button
                    onClick={() => setDetailOt(ot)}
                    className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-md transition text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    title="View full day schedule and slots"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Schedule</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {ot.status === "AVAILABLE" ? (
                      <button
                        onClick={() => {
                          setBookingOt(ot);
                          setBookingSlot("12:00 - 15:30");
                        }}
                        className="px-2.5 py-1 text-[11px] font-black rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <Scissors className="w-3 h-3" />
                        Book Suite
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setBookingOt(ot);
                          setBookingSlot("16:00 - 19:30");
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-purple-300 hover:bg-purple-50 text-purple-700 transition cursor-pointer"
                        title="Reserve future slot for this OT"
                      >
                        Reserve Slot
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. Alternative View: 24h Interactive Schedule Matrix
      ────────────────────────────────────────────────────────────── */}
      {viewMode === "schedule" && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              Surgical Suite Schedule Grid for {selectedDate}
            </span>
            <span className="text-[11px] text-slate-500 font-semibold">
              Click any free slot to instantly schedule a procedure
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-600 font-bold text-[11px]">
                  <th className="p-3 w-48">Suite & Specialty</th>
                  <th className="p-3 w-28">Base Rate</th>
                  {STANDARD_SLOTS.map(sl => (
                    <th key={sl.id} className="p-3 text-center">
                      <span className="block font-black text-slate-800">{sl.label}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{sl.time}</span>
                    </th>
                  ))}
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOts.map(ot => {
                  const rate = ot.hourlyRate || SPECIALTY_DEFAULTS[ot.specialty]?.baseRate || 650;
                  const slots = getSuiteSlotAvailability(ot, selectedDate);

                  return (
                    <tr key={ot.otId} className="hover:bg-slate-50/60 transition">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                            {ot.otId}
                          </span>
                          <div>
                            <p className="font-extrabold text-slate-900 text-[12px]">{ot.name}</p>
                            <span className="text-[10px] text-slate-500">{ot.specialty}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-black text-slate-800">
                        ${rate}<span className="text-[10px] text-slate-400 font-normal">/hr</span>
                      </td>

                      {/* 4 Shift Slot Cells */}
                      {slots.map((s, idx) => {
                        const isFree = s.status === "FREE";
                        const isOcc = s.status === "OCCUPIED" || s.status === "BOOKED";
                        return (
                          <td key={s.id} className="p-2 text-center">
                            {isFree ? (
                              <button
                                onClick={() => {
                                  setBookingOt(ot);
                                  setBookingSlot(STANDARD_SLOTS[idx]?.time || "08:00 - 11:30");
                                }}
                                className="w-full py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-[10px] transition cursor-pointer"
                              >
                                + Book Free
                              </button>
                            ) : isOcc ? (
                              <div className="py-1 px-2 rounded-lg bg-purple-100 border border-purple-200 text-purple-900 text-[10px] text-left">
                                <span className="font-bold truncate block">{s.procedure || "In Surgery"}</span>
                                <span className="text-[9px] text-purple-700 block truncate">{s.surgeon || "Assigned Team"}</span>
                              </div>
                            ) : (
                              <div className="py-1 px-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[10px]">
                                <span className="font-bold block">Sterilizing</span>
                              </div>
                            )}
                          </td>
                        );
                      })}

                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setBookingOt(ot);
                            setBookingSlot("12:00 - 15:30");
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-purple-600 hover:bg-purple-700 text-white cursor-pointer transition shadow-2xs"
                        >
                          Book OT
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. Doctor's Surgery Booking & Cost Transparency Modal
      ────────────────────────────────────────────────────────────── */}
      {bookingOt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                  {bookingOt.otId} • {bookingOt.specialty}
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1 flex items-center gap-1.5">
                  <Scissors className="w-4 h-4 text-purple-600" />
                  Schedule Surgical Procedure
                </h3>
                <p className="text-xs text-slate-500">{bookingOt.name}</p>
              </div>
              <button
                onClick={() => setBookingOt(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bookingSuccessMsg ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600" />
                <h4 className="font-black text-sm">Procedure Dispatched</h4>
                <p className="text-xs">{bookingSuccessMsg}</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {/* Date & Slot selection */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-black text-slate-700 block mb-1">Surgery Date</label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={e => setBookingDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-slate-700 block mb-1">Time Slot</label>
                    <select
                      value={bookingSlot}
                      onChange={e => setBookingSlot(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-slate-50"
                    >
                      <option value="08:00 - 11:30">Morning (08:00 - 11:30)</option>
                      <option value="12:00 - 15:30">Afternoon (12:00 - 15:30)</option>
                      <option value="16:00 - 19:30">Evening (16:00 - 19:30)</option>
                      <option value="20:00 - 23:30">Night / Trauma (20:00 - 23:30)</option>
                    </select>
                  </div>
                </div>

                {/* Procedure Selection */}
                <div>
                  <label className="text-[11px] font-black text-slate-700 block mb-1">Surgical Procedure</label>
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      value={surgeryType}
                      onChange={e => setSurgeryType(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg focus:outline-hidden focus:border-purple-500"
                    />
                    {/* Quick Suggestions based on specialty */}
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[10px] text-slate-400 font-semibold">Common:</span>
                      {(SPECIALTY_DEFAULTS[bookingOt.specialty]?.procedures || []).slice(0, 3).map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setSurgeryType(p)}
                          className="text-[10px] font-semibold bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-800 px-1.5 py-0.5 rounded transition cursor-pointer"
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Patient & Lead Surgeon */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-black text-slate-700 block mb-1">Patient Name / ID</label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={e => setPatientName(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-slate-700 block mb-1">Lead Surgeon</label>
                    <input
                      type="text"
                      value={surgeonName}
                      onChange={e => setSurgeonName(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg font-semibold text-slate-800"
                    />
                  </div>
                </div>

                {/* Duration & Priority */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] font-black text-slate-700 block mb-1">
                      Estimated Duration: {durationMinutes} min ({Math.round(durationMinutes / 60 * 10) / 10} hrs)
                    </label>
                    <input
                      type="range"
                      min={30}
                      max={360}
                      step={15}
                      value={durationMinutes}
                      onChange={e => setDurationMinutes(Number(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-black text-slate-700 block mb-1">Priority / Case Type</label>
                    <select
                      value={priority}
                      onChange={e => setPriority(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg"
                    >
                      <option value="ELECTIVE">Elective (Standard)</option>
                      <option value="URGENT">Urgent Priority (Within 4 hrs)</option>
                      <option value="EMERGENCY">Emergency Trauma (Immediate Pre-emption)</option>
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setBookingOt(null)}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleScheduleSurgery}
                    className="px-4 py-1.5 text-xs font-black rounded-lg bg-purple-600 hover:bg-purple-700 text-white shadow-md cursor-pointer flex items-center gap-1.5 transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Confirm & Dispatch Surgery
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. Cost Calculator & Rate Breakdown Drawer / Modal
      ────────────────────────────────────────────────────────────── */}
      {costCalculatorOt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                  {costCalculatorOt.otId} Cost Analyzer
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">{costCalculatorOt.name}</h3>
                <span className="text-xs text-slate-500">{costCalculatorOt.specialty} Surgical Suite</span>
              </div>
              <button
                onClick={() => setCostCalculatorOt(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Interactive Calculator Controls */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Procedure Length</span>
                  <span>{calcDuration} minutes ({Math.round(calcDuration / 60 * 10) / 10} hours)</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={360}
                  step={15}
                  value={calcDuration}
                  onChange={e => setCalcDuration(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Scheduling Tier</label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {["ELECTIVE", "URGENT", "EMERGENCY"].map(pr => (
                    <button
                      key={pr}
                      onClick={() => setCalcPriority(pr)}
                      className={`py-1 px-2 rounded-lg font-bold border transition ${
                        calcPriority === pr
                          ? "bg-purple-600 text-white border-purple-600"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {pr}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold text-slate-700">Include Advanced Tech / Robotic Suite</span>
                <input
                  type="checkbox"
                  checked={calcTech}
                  onChange={e => setCalcTech(e.target.checked)}
                  className="w-4 h-4 accent-purple-600"
                />
              </div>

              {/* Computed Breakdown Table */}
              {(() => {
                const rate = costCalculatorOt.hourlyRate || SPECIALTY_DEFAULTS[costCalculatorOt.specialty]?.baseRate || 650;
                const prep = costCalculatorOt.sterilePrepFee || 120;
                const cost = calculateCost(rate, prep, calcDuration, calcPriority, calcTech);

                return (
                  <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-200 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-600">
                      <span>Base Suite Rate (${rate}/hr × {calcDuration / 60}h)</span>
                      <span className="font-bold text-slate-800">${cost.timeCost}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Laminar Airflow & Sterile Prep Fee</span>
                      <span className="font-bold text-slate-800">${cost.prep}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Advanced Instrumentation / Navigation</span>
                      <span className="font-bold text-slate-800">${cost.techSurcharge}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Standard Anesthesia Workstation</span>
                      <span className="font-bold text-slate-800">${cost.anesthesiaCost}</span>
                    </div>
                    {cost.multiplier > 1 && (
                      <div className="flex justify-between text-purple-700 font-semibold">
                        <span>{calcPriority} Surcharge</span>
                        <span>+{Math.round((cost.multiplier - 1) * 100)}%</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-black text-purple-950 pt-2 border-t border-purple-200">
                      <span>Total Estimated Cost</span>
                      <span>${cost.total}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            <button
              onClick={() => {
                setCostCalculatorOt(null);
                setBookingOt(costCalculatorOt);
                setDurationMinutes(calcDuration);
                setPriority(calcPriority);
              }}
              className="w-full py-2 text-xs font-black rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition shadow-md cursor-pointer"
            >
              Proceed to Book With This Estimate
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          7. Suite Day Schedule Detail Modal
      ────────────────────────────────────────────────────────────── */}
      {detailOt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-5 max-w-lg w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                  {detailOt.otId} • 24h Schedule Timeline
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">{detailOt.name}</h3>
                <p className="text-xs text-slate-500">Date: {selectedDate}</p>
              </div>
              <button
                onClick={() => setDetailOt(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of slots with booking status */}
            <div className="space-y-2">
              {getSuiteSlotAvailability(detailOt, selectedDate).map((s, idx) => {
                const isFree = s.status === "FREE";
                const isOcc = s.status === "OCCUPIED" || s.status === "BOOKED";

                return (
                  <div
                    key={s.id}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                      isFree
                        ? "bg-emerald-50/60 border-emerald-200"
                        : isOcc
                        ? "bg-purple-50/60 border-purple-200"
                        : "bg-amber-50/60 border-amber-200"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-900 text-xs">{s.name} ({s.label})</span>
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${
                            isFree ? "bg-emerald-200 text-emerald-900" : isOcc ? "bg-purple-200 text-purple-900" : "bg-amber-200 text-amber-900"
                          }`}
                        >
                          {s.status}
                        </span>
                      </div>
                      {s.procedure && (
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          <span className="font-bold">{s.procedure}</span> • Lead: {s.surgeon || "Staff"}
                        </p>
                      )}
                    </div>

                    {isFree && (
                      <button
                        onClick={() => {
                          setDetailOt(null);
                          setBookingOt(detailOt);
                          setBookingSlot(STANDARD_SLOTS[idx]?.time || "08:00 - 11:30");
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-purple-600 hover:bg-purple-700 text-white cursor-pointer transition shadow-2xs"
                      >
                        Book Slot
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setDetailOt(null)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
