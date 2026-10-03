// frontend/src/components/Nexus/ResourceHeatmapView.jsx
import React, { useState, useMemo } from "react";
import {
  Bed,
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Users,
  Monitor,
  Wrench,
  X,
  Sparkles,
  RefreshCw,
  Plus,
  ArrowRight,
  Filter,
  Check,
  Search,
  Eye,
  FileText
} from "lucide-react";

// Initial Bed Data Matrix (Matching reference design)
const INITIAL_BEDS = [
  {
    ward: "General Ward",
    floor: "1st Floor",
    beds: [
      { id: "Bed 101", status: "AVAILABLE", occupant: null, cleaner: null, notes: "Ready for immediate admission" },
      { id: "Bed 102", status: "OCCUPIED", occupant: "Harsh Tripathi (P-101)", doctor: "Dr. Sarah Johnson", notes: "Cardiac observation — post-ECG" },
      { id: "Bed 103", status: "AVAILABLE", occupant: null, cleaner: null, notes: "Sanitized & verified" },
      { id: "Bed 104", status: "CLEANING", occupant: null, cleaner: "Cleaning Staff 2", notes: "Terminal disinfection in progress (ETA 10m)" },
      { id: "Bed 105", status: "AVAILABLE", occupant: null, cleaner: null, notes: "Ready for walk-in" },
      { id: "Bed 106", status: "AVAILABLE", occupant: null, cleaner: null, notes: "Oxygen port verified" },
    ]
  },
  {
    ward: "General Ward",
    floor: "2nd Floor",
    beds: [
      { id: "Bed 201", status: "PENDING", occupant: "Transfer Pending (ER Bay 02)", doctor: "Dr. Vikram Hegde", notes: "Awaiting bed turnover confirmation" },
      { id: "Bed 202", status: "AVAILABLE", occupant: null, cleaner: null, notes: "Inspected by Nurse Anita" },
      { id: "Bed 203", status: "OCCUPIED", occupant: "Elena Rostova (P-102)", doctor: "Dr. Rajesh Gupta", notes: "Orthopedic knee observation" },
      { id: "Bed 204", status: "AVAILABLE", occupant: null, cleaner: null, notes: "Sanitized & pre-made" },
      { id: "Bed 205", status: "CLEANING", occupant: null, cleaner: "Cleaning Staff 1", notes: "Routine linen change and floor mopping" },
      { id: "Bed 206", status: "AVAILABLE", occupant: null, cleaner: null, notes: "Telemetry monitor connected" },
    ]
  },
  {
    ward: "ICU",
    floor: "3rd Floor",
    beds: [
      { id: "Bed 301", status: "OCCUPIED", occupant: "Vikram Singh (P-105)", doctor: "Dr. Sarah Johnson", notes: "Post-CABG Day 1, Arterial Line active" },
      { id: "Bed 302", status: "OCCUPIED", occupant: "Mohammed Al-Rashid (P-103)", doctor: "Dr. Priya Sharma", notes: "Non-invasive BiPAP ventilation" },
      { id: "Bed 303", status: "AVAILABLE", occupant: null, cleaner: null, notes: "High-spec ventilator on standby" },
      { id: "Bed 304", status: "OCCUPIED", occupant: "Kavita Reddy (P-107)", doctor: "Dr. Marcus Bell", notes: "Sepsis protocol active" },
      { id: "Bed 305", status: "EQUIPMENT", occupant: null, cleaner: null, notes: "Defibrillator sensor error — recalibration requested" },
      { id: "Bed 306", status: "AVAILABLE", occupant: null, cleaner: null, notes: "Negative pressure isolation unit ready" },
    ]
  },
  {
    ward: "Surgery Ward",
    floor: "4th Floor",
    beds: [
      { id: "Bed 401", status: "AVAILABLE", occupant: null, cleaner: null, notes: "Pre-op checklist ready" },
      { id: "Bed 402", status: "PENDING", occupant: "Post-Op Transfer (OT-1)", doctor: "Dr. Rajesh Gupta", notes: "Recovery phase in PACU" },
      { id: "Bed 403", status: "AVAILABLE", occupant: null, cleaner: null, notes: "Ready for post-surgical intake" },
      { id: "Bed 404", status: "AVAILABLE", occupant: null, cleaner: null, notes: "IV Infusion stand checked" },
      { id: "Bed 405", status: "OCCUPIED", occupant: "Priya Menon (P-108)", doctor: "Dr. Aniket Roy", notes: "Post-Laparoscopy, vitals stable" },
      { id: "Bed 406", status: "AVAILABLE", occupant: null, cleaner: null, notes: "Wound care kit stocked" },
    ]
  },
  {
    ward: "Pediatrics",
    floor: "5th Floor",
    beds: [
      { id: "Bed 501", status: "AVAILABLE", occupant: null, cleaner: null, notes: "Pediatric cot ready" },
      { id: "Bed 502", status: "AVAILABLE", occupant: null, cleaner: null, notes: "Parent attendant couch ready" },
      { id: "Bed 503", status: "CLEANING", occupant: null, cleaner: "Cleaning Staff 3", notes: "Deep UV sterilization in progress" },
      { id: "Bed 504", status: "AVAILABLE", occupant: null, cleaner: null, notes: "Pediatric pulse oximeter verified" },
      { id: "Bed 505", status: "AVAILABLE", occupant: null, cleaner: null, notes: "Sanitized & verified" },
      { id: "Bed 506", status: "PENDING", occupant: "Admission Planned (OPD-Peds)", doctor: "Dr. Meera Iyer", notes: "Severe dehydration observation" },
    ]
  },
  {
    ward: "Maternity",
    floor: "6th Floor",
    beds: [
      { id: "Bed 601", status: "OCCUPIED", occupant: "Sunita Sharma (P-109)", doctor: "Dr. Vikram Nair", notes: "Postnatal Day 2 — newborn in nursery" },
      { id: "Bed 602", status: "AVAILABLE", occupant: null, cleaner: null, notes: "Fetal Doppler unit ready" },
      { id: "Bed 603", status: "AVAILABLE", occupant: null, cleaner: null, notes: "Electric delivery cot verified" },
      { id: "Bed 604", status: "CLEANING", occupant: null, cleaner: "Cleaning Staff 2", notes: "Post-discharge sanitization" },
      { id: "Bed 605", status: "AVAILABLE", occupant: null, cleaner: null, notes: "Maternity suite ready" },
      { id: "Bed 606", status: "OCCUPIED", occupant: "Ananya K. (P-104)", doctor: "Dr. Vikram Nair", notes: "Active labor monitoring" },
    ]
  }
];

// OT Matrix Data
const INITIAL_OT = [
  {
    ward: "General Surgery",
    floor: "OT Suite 1",
    beds: [
      { id: "Slot 1 (08:00)", status: "OCCUPIED", occupant: "Laparoscopic Cholecystectomy", doctor: "Dr. Rajesh Gupta", notes: "In progress — 45 mins elapsed" },
      { id: "Slot 2 (10:30)", status: "AVAILABLE", occupant: null, notes: "Sterilized & draped" },
      { id: "Slot 3 (13:00)", status: "PENDING", occupant: "Hernioplasty", doctor: "Dr. Aniket Roy", notes: "Awaiting patient pre-medication" },
      { id: "Slot 4 (15:30)", status: "AVAILABLE", occupant: null, notes: "Ready for scheduling" },
      { id: "Slot 5 (18:00)", status: "AVAILABLE", occupant: null, notes: "Evening slot open" },
      { id: "Emergency", status: "AVAILABLE", occupant: null, notes: "Standby for trauma triage" },
    ]
  },
  {
    ward: "Cardiac Suite",
    floor: "OT Suite 2",
    beds: [
      { id: "Slot 1 (08:00)", status: "OCCUPIED", occupant: "CABG 3-Vessel Bypass", doctor: "Dr. Sarah Johnson", notes: "On pump — estimated end: 12:30 PM" },
      { id: "Slot 2 (10:30)", status: "EQUIPMENT", occupant: null, notes: "Heart-lung machine inspection due" },
      { id: "Slot 3 (13:00)", status: "AVAILABLE", occupant: null, notes: "Ready for afternoon valve repair" },
      { id: "Slot 4 (15:30)", status: "CLEANING", occupant: null, cleaner: "OT Sanitization Team", notes: "Air filtration exchange" },
      { id: "Slot 5 (18:00)", status: "AVAILABLE", occupant: null, notes: "Emergency backup suite" },
      { id: "Emergency", status: "OCCUPIED", occupant: "Aortic Dissection Emergency", doctor: "Dr. Sarah Johnson", notes: "Code Red in OT-2" },
    ]
  },
  {
    ward: "Orthopedics",
    floor: "OT Suite 3",
    beds: [
      { id: "Slot 1 (08:00)", status: "AVAILABLE", occupant: null, notes: "C-Arm checked and calibrated" },
      { id: "Slot 2 (10:30)", status: "OCCUPIED", occupant: "Total Knee Replacement", doctor: "Dr. Rajesh Gupta", notes: "Implant positioned, cement curing" },
      { id: "Slot 3 (13:00)", status: "CLEANING", occupant: null, cleaner: "Staff 1", notes: "Post-op clean down" },
      { id: "Slot 4 (15:30)", status: "AVAILABLE", occupant: null, notes: "Ready" },
      { id: "Slot 5 (18:00)", status: "AVAILABLE", occupant: null, notes: "Available" },
      { id: "Emergency", status: "AVAILABLE", occupant: null, notes: "Fracture reduction on call" },
    ]
  },
  {
    ward: "Neuro Suite",
    floor: "OT Suite 4",
    beds: [
      { id: "Slot 1 (08:00)", status: "OCCUPIED", occupant: "Craniotomy for SDH", doctor: "Dr. Marcus Bell", notes: "Microsurgical microscope active" },
      { id: "Slot 2 (10:30)", status: "OCCUPIED", occupant: "Spinal Decompression", doctor: "Dr. Marcus Bell", notes: "Intraoperative neuro-monitoring" },
      { id: "Slot 3 (13:00)", status: "AVAILABLE", occupant: null, notes: "Ready" },
      { id: "Slot 4 (15:30)", status: "CLEANING", occupant: null, notes: "Clean down" },
      { id: "Slot 5 (18:00)", status: "AVAILABLE", occupant: null, notes: "Available" },
      { id: "Emergency", status: "AVAILABLE", occupant: null, notes: "Neuro standby" },
    ]
  }
];

// Equipment Matrix Data
const INITIAL_EQUIPMENT = [
  {
    ward: "Ventilators (ICU)",
    floor: "Floor 3",
    beds: [
      { id: "V-01", status: "OCCUPIED", occupant: "Assigned Bed 302 (Al-Rashid)", notes: "FiO2 45%, PEEP 8 cmH2O" },
      { id: "V-02", status: "OCCUPIED", occupant: "Assigned Bed 301 (V. Singh)", notes: "Synchronized SIMV mode" },
      { id: "V-03", status: "AVAILABLE", occupant: null, notes: "Battery 100%, circuit sterile" },
      { id: "V-04", status: "EQUIPMENT", occupant: null, notes: "Sensor calibration drift alert" },
      { id: "V-05", status: "AVAILABLE", occupant: null, notes: "Checked by Biomed Team" },
      { id: "V-06", status: "AVAILABLE", occupant: null, notes: "Portable transport model" },
    ]
  },
  {
    ward: "Defibrillators",
    floor: "All Floors",
    beds: [
      { id: "DEF-01 (ER)", status: "AVAILABLE", occupant: null, notes: "Daily test pass: 200J ready" },
      { id: "DEF-02 (ICU)", status: "OCCUPIED", occupant: "Bedside ICU-01", notes: "Pacing pads attached" },
      { id: "DEF-03 (OT)", status: "AVAILABLE", occupant: null, notes: "Sterile internal paddles ready" },
      { id: "DEF-04 (Floor 1)", status: "AVAILABLE", occupant: null, notes: "AED ready in lobby" },
      { id: "DEF-05 (Floor 4)", status: "AVAILABLE", occupant: null, notes: "Checked at 08:00 AM" },
      { id: "DEF-06 (Floor 6)", status: "PENDING", occupant: null, notes: "Battery replacement scheduled" },
    ]
  },
  {
    ward: "Dialysis Units",
    floor: "Floor 2",
    beds: [
      { id: "DIA-01", status: "OCCUPIED", occupant: "Patient Hemodialysis (P-112)", notes: "Heparin infusion active" },
      { id: "DIA-02", status: "OCCUPIED", occupant: "Emergency SDo2 Filter", notes: "Filter pressure normal" },
      { id: "DIA-03", status: "AVAILABLE", occupant: null, notes: "Prime & rinse cycle done" },
      { id: "DIA-04", status: "CLEANING", occupant: null, cleaner: "Staff 3", notes: "Chemical disinfection cycle" },
      { id: "DIA-05", status: "AVAILABLE", occupant: null, notes: "Ready" },
      { id: "DIA-06", status: "AVAILABLE", occupant: null, notes: "Backup unit" },
    ]
  }
];

// Staff Matrix Data
const INITIAL_STAFF = [
  {
    ward: "ICU Nursing",
    floor: "Shift A (Morning)",
    beds: [
      { id: "Nurse Sarah Jenkins", status: "OCCUPIED", occupant: "Bed 301 & 302", notes: "Senior ICU Charge Nurse" },
      { id: "Nurse Anita Roy", status: "OCCUPIED", occupant: "Bed 304 (Sepsis)", notes: "Arterial line monitoring" },
      { id: "Nurse David Lee", status: "AVAILABLE", occupant: null, notes: "Float pool cover" },
      { id: "Nurse Rachel Adams", status: "CLEANING", occupant: null, notes: "Medication prep counter" },
      { id: "Nurse Emily Chen", status: "AVAILABLE", occupant: null, notes: "Intake triage ready" },
      { id: "Nurse Kevin Patel", status: "PENDING", occupant: null, notes: "Shift handover in progress" },
    ]
  },
  {
    ward: "Ward Nursing",
    floor: "Floors 1-3",
    beds: [
      { id: "Nurse Priya M.", status: "OCCUPIED", occupant: "General Ward 101-106", notes: "Vitals round ongoing" },
      { id: "Nurse John K.", status: "AVAILABLE", occupant: null, notes: "Discharge desk" },
      { id: "Nurse Fatima S.", status: "OCCUPIED", occupant: "General Ward 201-206", notes: "IV antibiotic administration" },
      { id: "Nurse Ravi T.", status: "CLEANING", occupant: null, notes: "Inventory restock" },
      { id: "Nurse Maya V.", status: "AVAILABLE", occupant: null, notes: "On desk" },
      { id: "Nurse Sneha R.", status: "AVAILABLE", occupant: null, notes: "Ready" },
    ]
  },
  {
    ward: "Attending Doctors",
    floor: "Specialists",
    beds: [
      { id: "Dr. Sarah Johnson", status: "OCCUPIED", occupant: "OT-2 & ICU-301", notes: "Interventional Cardiology" },
      { id: "Dr. Rajesh Gupta", status: "OCCUPIED", occupant: "OT-3 Knee Arthroplasty", notes: "Orthopedics Lead" },
      { id: "Dr. Priya Sharma", status: "AVAILABLE", occupant: "OPD Cabin 104", notes: "General Medicine Consults" },
      { id: "Dr. Vikram Hegde", status: "OCCUPIED", occupant: "ER Resuscitation Bay 03", notes: "Trauma Specialist on Duty" },
      { id: "Dr. Marcus Bell", status: "AVAILABLE", occupant: "ICU Floor 3", notes: "Intensivist / Critical Care" },
      { id: "Dr. Vikram Nair", status: "OCCUPIED", occupant: "Maternity Ward 606", notes: "Obstetrician on delivery call" },
    ]
  }
];

// Rooms Matrix Data
const INITIAL_ROOMS = [
  {
    ward: "OPD Consultation",
    floor: "Floor 1",
    beds: [
      { id: "Cabin 101", status: "AVAILABLE", occupant: null, notes: "Dr. Aniket Roy" },
      { id: "Cabin 102", status: "OCCUPIED", occupant: "Harsh Tripathi (P-101)", notes: "Dr. Sarah Johnson — In Session" },
      { id: "Cabin 103", status: "AVAILABLE", occupant: null, notes: "Dr. Rajesh Gupta" },
      { id: "Cabin 104", status: "OCCUPIED", occupant: "Token #02 Cons.", notes: "Dr. Priya Sharma" },
      { id: "Cabin 105", status: "CLEANING", occupant: null, notes: "Sanitizing" },
      { id: "Cabin 106", status: "AVAILABLE", occupant: null, notes: "Ready for afternoon clinic" },
    ]
  },
  {
    ward: "Isolation Suites",
    floor: "Floor 2",
    beds: [
      { id: "Room 201", status: "OCCUPIED", occupant: "Airborne Precaution (P-114)", notes: "Negative pressure -2.5 Pa" },
      { id: "Room 202", status: "AVAILABLE", occupant: null, notes: "Antechamber sterile" },
      { id: "Room 203", status: "CLEANING", occupant: null, notes: "Formalin fumigation underway" },
      { id: "Room 204", status: "OCCUPIED", occupant: "Neutropenic Precaution", notes: "HEPA positive pressure" },
      { id: "Room 205", status: "AVAILABLE", occupant: null, notes: "Verified" },
      { id: "Room 206", status: "AVAILABLE", occupant: null, notes: "Ready" },
    ]
  }
];

export default function ResourceHeatmapView() {
  const [activeTab, setActiveTab] = useState("Beds"); // "Beds" | "OT" | "Equipment" | "Staff" | "Rooms"
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [selectedFloor, setSelectedFloor] = useState("All Floors");
  const [resourceTypeFilter, setResourceTypeFilter] = useState("Beds");

  // State matrices
  const [bedsData, setBedsData] = useState(INITIAL_BEDS);
  const [otData, setOtData] = useState(INITIAL_OT);
  const [equipmentData, setEquipmentData] = useState(INITIAL_EQUIPMENT);
  const [staffData, setStaffData] = useState(INITIAL_STAFF);
  const [roomsData, setRoomsData] = useState(INITIAL_ROOMS);

  // Recent Alerts State (from reference image)
  const [alerts, setAlerts] = useState([
    {
      id: "ALT-01",
      time: "11:32 AM",
      resource: "Bed 102 (General Ward)",
      issue: "Occupied (expected available)",
      staff: "Nurse A",
      action: "Verify",
      actionColor: "bg-red-500 hover:bg-red-600 text-white",
      status: "ACTIVE"
    },
    {
      id: "ALT-02",
      time: "11:20 AM",
      resource: "Bed 105 (General Ward)",
      issue: "Cleaning pending",
      staff: "Cleaning Staff 2",
      action: "Mark Done",
      actionColor: "bg-amber-400 hover:bg-amber-500 text-slate-950 font-black",
      status: "ACTIVE"
    },
    {
      id: "ALT-03",
      time: "10:45 AM",
      resource: "OT-2",
      issue: "Equipment not ready",
      staff: "OT Staff 1",
      action: "Resolve",
      actionColor: "bg-purple-600 hover:bg-purple-700 text-white",
      status: "ACTIVE"
    }
  ]);

  // Modal States
  const [selectedTile, setSelectedTile] = useState(null); // When user clicks ANY tile in matrix
  const [quickActionModal, setQuickActionModal] = useState(null); // "bed-details" | "assign-cleaning" | "equipment-request" | "patient-journey" | "all-alerts"
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Get current active matrix
  const currentMatrix = useMemo(() => {
    switch (activeTab) {
      case "OT": return otData;
      case "Equipment": return equipmentData;
      case "Staff": return staffData;
      case "Rooms": return roomsData;
      default: return bedsData;
    }
  }, [activeTab, bedsData, otData, equipmentData, staffData, roomsData]);

  // Filter matrix by department and floor
  const filteredMatrix = useMemo(() => {
    return currentMatrix.filter(row => {
      const matchDept = selectedDept === "All Departments" || row.ward.toLowerCase().includes(selectedDept.toLowerCase());
      const matchFloor = selectedFloor === "All Floors" || row.floor.toLowerCase().includes(selectedFloor.toLowerCase());
      return matchDept && matchFloor;
    });
  }, [currentMatrix, selectedDept, selectedFloor]);

  // Calculate dynamic Summary Counts from active matrix
  const summaryCounts = useMemo(() => {
    let available = 0;
    let pending = 0;
    let occupied = 0;
    let maintenance = 0;

    currentMatrix.forEach(row => {
      row.beds.forEach(b => {
        if (b.status === "AVAILABLE") available++;
        else if (b.status === "PENDING" || b.status === "CLEANING") pending++;
        else if (b.status === "OCCUPIED") occupied++;
        else if (b.status === "EQUIPMENT" || b.status === "MAINTENANCE") maintenance++;
      });
    });

    return { available, pending, occupied, maintenance };
  }, [currentMatrix]);

  // Helper for Tile Style based on status (Exact to reference image)
  const getTileStyle = (status) => {
    switch (status) {
      case "AVAILABLE":
        return {
          bg: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs",
          label: "Available",
          iconColor: "text-white",
          dotColor: "bg-emerald-300"
        };
      case "OCCUPIED":
        return {
          bg: "bg-red-500 hover:bg-red-600 text-white shadow-xs",
          label: "Occupied",
          iconColor: "text-white",
          dotColor: "bg-red-300"
        };
      case "CLEANING":
        return {
          bg: "bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold shadow-xs",
          label: "Cleaning",
          iconColor: "text-slate-900",
          dotColor: "bg-amber-700"
        };
      case "PENDING":
        return {
          bg: "bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold shadow-xs",
          label: "Pending",
          iconColor: "text-slate-900",
          dotColor: "bg-amber-700"
        };
      case "EQUIPMENT":
        return {
          bg: "bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold shadow-xs",
          label: "Equipment",
          iconColor: "text-slate-900",
          dotColor: "bg-purple-700"
        };
      default:
        return {
          bg: "bg-slate-300 hover:bg-slate-400 text-slate-800",
          label: "Unknown",
          iconColor: "text-slate-700",
          dotColor: "bg-slate-500"
        };
    }
  };

  // Action handlers
  const handleAlertAction = (alert) => {
    if (alert.action === "Mark Done") {
      // Find Bed 105 and update to AVAILABLE
      setBedsData(prev => prev.map(row => ({
        ...row,
        beds: row.beds.map(b => b.id === "Bed 105" ? { ...b, status: "AVAILABLE", notes: "Cleaning marked complete" } : b)
      })));
      triggerToast("✓ Bed 105 cleaning verified! Status updated to AVAILABLE.");
    } else if (alert.action === "Resolve") {
      setOtData(prev => prev.map(row => ({
        ...row,
        beds: row.beds.map(b => b.id.includes("OT-2") || b.id.includes("Slot 2") ? { ...b, status: "AVAILABLE", notes: "Equipment resolved" } : b)
      })));
      triggerToast("✓ OT-2 equipment resolved and cleared for operation.");
    } else {
      triggerToast(`✓ Alert for ${alert.resource} verified by Staff on duty.`);
    }

    // Dismiss alert
    setAlerts(prev => prev.filter(a => a.id !== alert.id));
  };

  const updateTileStatus = (wardIndex, bedId, newStatus) => {
    const updater = (prev) => prev.map(row => ({
      ...row,
      beds: row.beds.map(b => b.id === bedId ? { ...b, status: newStatus } : b)
    }));

    if (activeTab === "Beds") setBedsData(updater);
    else if (activeTab === "OT") setOtData(updater);
    else if (activeTab === "Equipment") setEquipmentData(updater);
    else if (activeTab === "Staff") setStaffData(updater);
    else if (activeTab === "Rooms") setRoomsData(updater);

    if (selectedTile) {
      setSelectedTile(prev => ({ ...prev, tile: { ...prev.tile, status: newStatus } }));
    }
    triggerToast(`✓ ${bedId} updated to ${newStatus}`);
  };

  return (
    <div className="space-y-5 text-slate-800 animate-fade-in font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-slate-900 text-white shadow-2xl border border-emerald-500/40 text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. Header & Filtering Controls (Exact Layout to Reference Image)
      ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Staff Resource Heat Map
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View the real-time status of beds, equipment and other resources under your responsibility.
          </p>
        </div>

        {/* Dropdown Filters & Timestamp */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Department */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Department</label>
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition"
            >
              <option>All Departments</option>
              <option>General Ward</option>
              <option>ICU</option>
              <option>Surgery</option>
              <option>Pediatrics</option>
              <option>Maternity</option>
            </select>
          </div>

          {/* Floor / Ward */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Floor / Ward</label>
            <select
              value={selectedFloor}
              onChange={e => setSelectedFloor(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition"
            >
              <option>All Floors</option>
              <option>1st Floor</option>
              <option>2nd Floor</option>
              <option>3rd Floor</option>
              <option>4th Floor</option>
              <option>5th Floor</option>
              <option>6th Floor</option>
            </select>
          </div>

          {/* Resource Type */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Resource Type</label>
            <select
              value={resourceTypeFilter}
              onChange={e => {
                setResourceTypeFilter(e.target.value);
                setActiveTab(e.target.value);
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition"
            >
              <option value="Beds">Beds</option>
              <option value="OT">OT</option>
              <option value="Equipment">Equipment</option>
              <option value="Staff">Staff</option>
              <option value="Rooms">Rooms</option>
            </select>
          </div>

          {/* Live Date / Time Badge */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-center shrink-0 self-end sm:self-auto">
            <div className="flex items-center gap-1.5 text-slate-800 font-bold text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>27 Sep 2026</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium">11:42 AM</div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. Resource Type Tabs (Beds | OT | Equipment | Staff | Rooms)
      ────────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold no-scrollbar">
        {[
          { id: "Beds", label: "Beds", icon: Bed },
          { id: "OT", label: "OT", icon: Activity },
          { id: "Equipment", label: "Equipment", icon: Monitor },
          { id: "Staff", label: "Staff", icon: Users },
          { id: "Rooms", label: "Rooms", icon: Sparkles }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setResourceTypeFilter(tab.id);
              }}
              className={`px-5 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs ${
                isActive
                  ? "bg-blue-600 text-white shadow-md font-black"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. Main 2-Column Split: Matrix Grid (Left) + Sidebar Widgets (Right)
      ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 items-start">
        {/* LEFT COLUMN: Heatmap Grid Table + Recent Alerts (Span 3 Cols) */}
        <div className="xl:col-span-3 space-y-5">
          {/* Heatmap Matrix Grid Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-center border-separate border-spacing-2">
                <thead>
                  <tr className="text-xs font-black text-slate-700">
                    <th className="text-left font-black p-2 text-slate-900 text-xs w-36">
                      {activeTab === "Beds" ? "Ward / Floor" : activeTab === "OT" ? "Suite / Specialty" : activeTab === "Equipment" ? "Category / Ward" : activeTab === "Staff" ? "Role / Ward" : "Wing / Specialty"}
                    </th>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <th key={i} className="p-2 font-black text-xs text-slate-800">
                        {activeTab === "Beds" ? `Bed 10${i}` : activeTab === "OT" ? `Slot ${i}` : activeTab === "Equipment" ? `Unit 0${i}` : activeTab === "Staff" ? `Station ${i}` : `Room 0${i}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredMatrix.map((row, rowIdx) => (
                    <tr key={row.ward + row.floor}>
                      {/* Row Label (Ward + Floor) */}
                      <td className="text-left p-2 align-middle">
                        <div className="font-extrabold text-xs text-slate-900 leading-tight">
                          {row.ward}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          ({row.floor})
                        </div>
                      </td>

                      {/* 6 Status Tiles */}
                      {row.beds.map((b, colIdx) => {
                        const style = getTileStyle(b.status);
                        return (
                          <td key={b.id} className="p-1">
                            <button
                              onClick={() => setSelectedTile({ row, tile: b, rowIdx, colIdx })}
                              className={`w-full h-16 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-150 transform hover:scale-[1.03] active:scale-95 cursor-pointer ${style.bg}`}
                              title={`${b.id}: ${b.status} — Click for full details`}
                            >
                              <Bed className={`w-4 h-4 ${style.iconColor}`} />
                              <span className="text-[10px] font-black uppercase tracking-tight">
                                {style.label}
                              </span>
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>* Click on any bed tile above to inspect details, admit patient, or reassign cleaners.</span>
              <span className="font-bold text-slate-600">Showing {filteredMatrix.length} Wards · 36 Resource Units</span>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              Recent Alerts Section (Exact match to bottom left of reference)
          ────────────────────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <h3 className="font-black text-sm text-slate-900">Recent Alerts</h3>
              </div>
              <button
                onClick={() => setQuickActionModal("all-alerts")}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-slate-400 text-[10px] uppercase font-bold border-b border-slate-100">
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Resource</th>
                    <th className="py-2.5 px-3">Issue</th>
                    <th className="py-2.5 px-3">Responsible Staff</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {alerts.map(alt => (
                    <tr key={alt.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 font-medium text-slate-500 whitespace-nowrap">{alt.time}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{alt.resource}</td>
                      <td className="py-3 px-3 text-slate-700">{alt.issue}</td>
                      <td className="py-3 px-3 text-slate-500">{alt.staff}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleAlertAction(alt)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer shadow-xs ${alt.actionColor}`}
                        >
                          {alt.action}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {alerts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400 font-medium">
                        ✓ All alerts cleared. No pending operational exceptions.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Resource Summary, Legend, Quick Actions (Span 1 Col) */}
        <div className="space-y-5">
          {/* 1. Resource Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-slate-900 flex items-center justify-center text-white text-[9px] font-black">
                ⊞
              </div>
              <h3 className="font-black text-sm text-slate-900">Resource Summary</h3>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              {/* Available */}
              <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-xs">
                <div className="text-xl font-black">{summaryCounts.available}</div>
                <div className="text-[10px] font-bold mt-0.5 opacity-90">Available</div>
              </div>

              {/* Pending */}
              <div className="p-2 rounded-xl bg-amber-400 text-slate-950 shadow-xs">
                <div className="text-xl font-black">{summaryCounts.pending}</div>
                <div className="text-[10px] font-black mt-0.5">Pending</div>
              </div>

              {/* Occupied */}
              <div className="p-2 rounded-xl bg-red-500 text-white shadow-xs">
                <div className="text-xl font-black">{summaryCounts.occupied}</div>
                <div className="text-[10px] font-bold mt-0.5 opacity-90">Occupied</div>
              </div>

              {/* Maintenance */}
              <div className="p-2 rounded-xl bg-slate-300 text-slate-800 shadow-xs">
                <div className="text-xl font-black">{summaryCounts.maintenance}</div>
                <div className="text-[10px] font-bold mt-0.5">Maintenance</div>
              </div>
            </div>
          </div>

          {/* 2. Status Legend Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600" />
              <h3 className="font-black text-sm text-slate-900">Status Legend</h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-bold text-slate-900">Available</span>
                </div>
                <span className="text-slate-400 text-[11px]">Ready / Verified</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-400 shrink-0" />
                  <span className="font-bold text-slate-900">Pending</span>
                </div>
                <span className="text-slate-400 text-[11px]">Awaiting action / Cleaning</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-red-500 shrink-0" />
                  <span className="font-bold text-slate-900">Occupied</span>
                </div>
                <span className="text-slate-400 text-[11px]">In use</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-purple-600 shrink-0" />
                  <span className="font-bold text-slate-900">Equipment</span>
                </div>
                <span className="text-slate-400 text-[11px]">Equipment not ready</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-slate-400 shrink-0" />
                  <span className="font-bold text-slate-900">Unknown</span>
                </div>
                <span className="text-slate-400 text-[11px]">Not updated</span>
              </div>
            </div>
          </div>

          {/* 3. Quick Actions Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-600 flex items-center justify-center text-white text-[9px] font-black">
                ⚡
              </div>
              <h3 className="font-black text-sm text-slate-900">Quick Actions</h3>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setQuickActionModal("bed-details")}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-800 text-xs font-bold transition flex items-center gap-2.5 cursor-pointer"
              >
                <Bed className="w-4 h-4 text-blue-600 shrink-0" />
                <span>View Bed Details</span>
              </button>

              <button
                onClick={() => setQuickActionModal("assign-cleaning")}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-800 text-xs font-bold transition flex items-center gap-2.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-cyan-600 shrink-0" />
                <span>Assign Cleaning Staff</span>
              </button>

              <button
                onClick={() => setQuickActionModal("equipment-request")}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-800 text-xs font-bold transition flex items-center gap-2.5 cursor-pointer"
              >
                <Wrench className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Raise Equipment Request</span>
              </button>

              <button
                onClick={() => setQuickActionModal("patient-journey")}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-800 text-xs font-bold transition flex items-center gap-2.5 cursor-pointer"
              >
                <Users className="w-4 h-4 text-blue-600 shrink-0" />
                <span>View Patient Journey</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODAL 1: INNER INTERFACE FOR TILE CLICK
      ────────────────────────────────────────────────────────────── */}
      {selectedTile && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">
                  {selectedTile.row.ward} · {selectedTile.row.floor}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">
                  {selectedTile.tile.id} Inspector
                </h3>
              </div>
              <button
                onClick={() => setSelectedTile(null)}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Status Pill */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <span className="font-bold text-slate-600">Current Status:</span>
              <span className={`px-3 py-1 rounded-full font-black text-xs ${
                selectedTile.tile.status === "AVAILABLE"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : selectedTile.tile.status === "OCCUPIED"
                  ? "bg-red-100 text-red-800 border border-red-300"
                  : selectedTile.tile.status === "CLEANING"
                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                  : "bg-purple-100 text-purple-900 border border-purple-300"
              }`}>
                ● {selectedTile.tile.status}
              </span>
            </div>

            {/* Details Section */}
            <div className="space-y-2.5 text-xs">
              {selectedTile.tile.occupant && (
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200">
                  <span className="text-[10px] font-bold uppercase text-blue-600 block">Active Occupant / Case</span>
                  <div className="font-black text-slate-900 text-sm mt-0.5">{selectedTile.tile.occupant}</div>
                  {selectedTile.tile.doctor && (
                    <div className="text-slate-600 text-xs mt-1">Lead Physician: <strong>{selectedTile.tile.doctor}</strong></div>
                  )}
                </div>
              )}

              {selectedTile.tile.cleaner && (
                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200">
                  <span className="text-[10px] font-bold uppercase text-amber-700 block">Assigned Sanitation Team</span>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedTile.tile.cleaner}</div>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Operational Notes</span>
                <p className="text-slate-700 font-medium mt-0.5 leading-relaxed">{selectedTile.tile.notes || "Standard clinical protocol maintained."}</p>
              </div>
            </div>

            {/* Action Buttons inside modal */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400 block">Change Status Directly:</span>
              <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                <button
                  onClick={() => updateTileStatus(selectedTile.rowIdx, selectedTile.tile.id, "AVAILABLE")}
                  className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer"
                >
                  Mark Available
                </button>
                <button
                  onClick={() => updateTileStatus(selectedTile.rowIdx, selectedTile.tile.id, "CLEANING")}
                  className="py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black transition cursor-pointer"
                >
                  Mark Cleaning
                </button>
                <button
                  onClick={() => updateTileStatus(selectedTile.rowIdx, selectedTile.tile.id, "OCCUPIED")}
                  className="py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white transition cursor-pointer"
                >
                  Mark Occupied
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 2: QUICK ACTION - VIEW BED DETAILS
      ────────────────────────────────────────────────────────────── */}
      {quickActionModal === "bed-details" && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bed className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-lg text-slate-900">Hospital Bed Capacity Inspector</h3>
              </div>
              <button onClick={() => setQuickActionModal(null)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-emerald-800 font-bold block">Total Operational Beds</span>
                <span className="text-2xl font-black text-emerald-900">36 Beds</span>
              </div>
              <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                <span className="text-red-800 font-bold block">Current Occupancy Rate</span>
                <span className="text-2xl font-black text-red-900">22% (6 In Use)</span>
              </div>
            </div>

            <div className="space-y-2 text-xs max-h-60 overflow-y-auto pr-1">
              {bedsData.flatMap(w => w.beds.map(b => ({ ...b, ward: w.ward, floor: w.floor }))).map(b => (
                <div key={b.id + b.ward} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">{b.id}</span> · <span className="text-slate-500">{b.ward} ({b.floor})</span>
                    {b.occupant && <div className="text-[11px] text-blue-700 font-medium">Occupant: {b.occupant}</div>}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                    b.status === "AVAILABLE" ? "bg-emerald-100 text-emerald-800" : b.status === "OCCUPIED" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-900"
                  }`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setQuickActionModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer hover:bg-black"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 3: QUICK ACTION - ASSIGN CLEANING STAFF
      ────────────────────────────────────────────────────────────── */}
      {quickActionModal === "assign-cleaning" && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-600" />
                <h3 className="font-black text-lg text-slate-900">Assign Cleaning & Sanitation</h3>
              </div>
              <button onClick={() => setQuickActionModal(null)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Ward & Floor</label>
                <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium">
                  <option>General Ward (1st Floor) — Bed 104</option>
                  <option>General Ward (2nd Floor) — Bed 205</option>
                  <option>Pediatrics (5th Floor) — Bed 503</option>
                  <option>Maternity (6th Floor) — Bed 604</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Available Sanitation Crew</label>
                <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium">
                  <option>Cleaning Staff 1 (On Duty, Free)</option>
                  <option>Cleaning Staff 2 (Terminal Sanitization Specialist)</option>
                  <option>Cleaning Staff 3 (UV Disinfection Crew)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Protocol Priority</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" className="p-2 rounded-xl bg-amber-50 border border-amber-300 font-bold text-amber-900 text-center">
                    ⚡ Urgent Turnaround
                  </button>
                  <button type="button" className="p-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700 text-center">
                    Standard Disinfection
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setQuickActionModal(null);
                triggerToast("✓ Cleaning staff dispatched! Target bed turnover ETA: 12 minutes.");
              }}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs cursor-pointer shadow-md"
            >
              Confirm Dispatch
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 4: QUICK ACTION - RAISE EQUIPMENT REQUEST
      ────────────────────────────────────────────────────────────── */}
      {quickActionModal === "equipment-request" && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-lg text-slate-900">Emergency Equipment Requisition</h3>
              </div>
              <button onClick={() => setQuickActionModal(null)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Required Asset Type</label>
                <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium">
                  <option>High-Spec Ventilator (Adult SIMV)</option>
                  <option>Crash Cart Defibrillator (200J Biphasic)</option>
                  <option>Dialysis Unit (Mobile)</option>
                  <option>Syringe Infusion Pump</option>
                  <option>Multi-Parameter Telemetry Monitor</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Destination Location</label>
                <input
                  type="text"
                  defaultValue="ICU Bed 305 — 3rd Floor"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Clinical Urgency</label>
                <select className="w-full px-3 py-2 bg-red-50 border border-red-200 text-red-900 font-bold rounded-xl">
                  <option>Code Red (Immediate 3-min transport)</option>
                  <option>Urgent Clinical Need (&lt; 15 mins)</option>
                  <option>Standard Elective Requisition</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => {
                setQuickActionModal(null);
                triggerToast("✓ Equipment request dispatched to Biomedical Central Pool! Tracking #EQ-8812.");
              }}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-md"
            >
              Submit Equipment Request
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 5: QUICK ACTION - VIEW PATIENT JOURNEY
      ────────────────────────────────────────────────────────────── */}
      {quickActionModal === "patient-journey" && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-lg text-slate-900">Active Inpatient Journeys</h3>
              </div>
              <button onClick={() => setQuickActionModal(null)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Harsh Tripathi (P-101)</span>
                  <span className="text-blue-700">Bed 102 · Floor 1</span>
                </div>
                <p className="text-slate-500">Journey JRN-2026-8812: Blood profile done, CT Angiography pending in queue.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Elena Rostova (P-102)</span>
                  <span className="text-purple-700">Bed 203 · Floor 2</span>
                </div>
                <p className="text-slate-500">Journey JRN-2026-8815: X-Ray ready, waiting for Dr. Rajesh Gupta review.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Mohammed Al-Rashid (P-103)</span>
                  <span className="text-red-700">ICU Bed 302 · Floor 3</span>
                </div>
                <p className="text-slate-500">Journey JRN-2026-8820: BiPAP ventilation active, continuous SpO2 telemetry.</p>
              </div>
            </div>

            <button
              onClick={() => setQuickActionModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 6: VIEW ALL RECENT ALERTS
      ────────────────────────────────────────────────────────────── */}
      {quickActionModal === "all-alerts" && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="font-black text-lg text-slate-900">All Operational Exception Alerts</h3>
              </div>
              <button onClick={() => setQuickActionModal(null)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs max-h-72 overflow-y-auto">
              {alerts.map(alt => (
                <div key={alt.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 font-mono text-[10px]">{alt.time}</span>
                    <div className="font-bold text-slate-900">{alt.resource}</div>
                    <div className="text-slate-600 text-[11px]">{alt.issue} (Staff: {alt.staff})</div>
                  </div>
                  <button
                    onClick={() => handleAlertAction(alt)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${alt.actionColor}`}
                  >
                    {alt.action}
                  </button>
                </div>
              ))}
              {alerts.length === 0 && (
                <div className="p-6 text-center text-slate-400 font-bold">
                  Zero active alerts. All resources operating normally.
                </div>
              )}
            </div>

            <button
              onClick={() => setQuickActionModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
