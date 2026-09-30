import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Users,
  Phone,
  BadgeIndianRupee,
  AlertTriangle,
  Activity,
  Bed,
  Clock,
  Stethoscope,
  ShieldAlert,
  HeartPulse,
  FileText,
  ChevronRight,
  UserCheck,
  RefreshCw,
  Syringe,
  Radio,
  Check,
  Sparkles,
  IndianRupee,
  Coffee,
} from "lucide-react";
import { dashboardStyles } from "../../assets/dummyStyles";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000"; // override by passing apiBase prop

/* -------------------------
   Helpers: date/time + status mapping
   ------------------------- */
function parseDateTime(date, time) {
  return new Date(`${date}T${time}:00`);
}

function formatTimeAMPM(time24) {
  if (!time24) return "";
  const [hh, mm] = time24.split(":");
  let h = parseInt(hh, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${mm} ${ampm}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function backendToFrontendStatus(s) {
  if (!s) return "pending";
  const v = String(s).toLowerCase();
  if (v === "pending") return "pending";
  if (v === "confirmed") return "confirmed";
  if (v === "completed") return "complete";
  if (v === "canceled" || v === "cancelled") return "cancelled";
  if (v === "rescheduled") return "rescheduled";
  return v;
}

function frontendToBackendStatus(fs) {
  if (!fs) return "Pending";
  const v = String(fs).toLowerCase();
  if (v === "pending") return "Pending";
  if (v === "confirmed") return "Confirmed";
  if (v === "complete") return "Completed";
  if (v === "cancelled") return "Canceled";
  if (v === "rescheduled") return "Rescheduled";
  return fs;
}

function to24Hour(timeStr) {
  if (!timeStr) return "00:00";
  const m = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return timeStr;
  let hh = Number(m[1]);
  const mm = m[2];
  const ampm = m[3];
  if (!ampm) {
    return `${String(hh).padStart(2, "0")}:${mm}`;
  }
  const up = ampm.toUpperCase();
  if (up === "AM") {
    if (hh === 12) hh = 0;
  } else {
    if (hh !== 12) hh += 12;
  }
  return `${String(hh).padStart(2, "0")}:${mm}`;
}

function to12HourFrom24(hhmm) {
  if (!hhmm) return "12:00 AM";
  const [hh, mm] = hhmm.split(":").map(Number);
  const ampm = hh >= 12 ? "PM" : "AM";
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${String(h12)}:${String(mm).padStart(2, "0")} ${ampm}`;
}

/* -------------------------
   Normalizer: backend -> frontend shape used in this page
   ------------------------- */
function normalizeAppointment(a) {
  if (!a) return null;
  const id = a._id || a.id || String(Math.random()).slice(2);
  const patient = a.patientName || a.patient || a.name || "Unknown";
  const age = a.age ?? a.patientAge ?? "";
  const gender = a.gender || "";
  // inside normalizeAppointment(a) ...
  const doctorName =
    (a.doctorId && typeof a.doctorId === "object" && a.doctorId.name) ||
    a.doctorName ||
    a.doctor ||
    "Doctor";

  const doctorImage =
    (a.doctorId && typeof a.doctorId === "object" && a.doctorId.imageUrl) ||
    a.doctorImage ||
    a.doctorImageUrl ||
    "";

  const speciality =
    (a.doctorId && (a.doctorId.specialization || a.doctorId.speciality)) ||
    a.speciality ||
    a.specialization ||
    "";
  const mobile = a.mobile || a.phone || "";
  const fee = Number(a.fees ?? a.fee ?? a.payment?.amount ?? 0) || 0;
  const date = a.date || (a.slot && a.slot.date) || "";
  const rawTime =
    a.time ||
    (a.slot && a.slot.time) ||
    (a.hour != null && a.minute != null
      ? `${String(a.hour).padStart(2, "0")}:${String(a.minute).padStart(
          2,
          "0",
        )}`
      : "");
  const time24 = to24Hour(rawTime);
  const status = backendToFrontendStatus(
    a.status || (a.payment && a.payment.status) || "Pending",
  );
  return {
    id,
    patient,
    age,
    gender,
    doctorName,
    doctorImage,
    speciality,
    mobile,
    date,
    time: time24,
    fee,
    status,
    raw: a,
  };
}

const defaultDoc4Appointments = [
  {
    id: "appt_aniket_01",
    patient: "Harsh Tripathi",
    age: 32,
    gender: "Male",
    doctorName: "Dr. Aniket Roy",
    speciality: "Dermatology & Skin Care",
    date: new Date().toISOString().split("T")[0],
    time: "10:00 AM",
    fee: 700,
    status: "complete",
    token: "#01",
    raw: {
      patientName: "Harsh Tripathi",
      time: "10:00 AM",
      token: "#01",
      notes: "General Checkup • Token #1",
      fees: 700,
    },
  },
  {
    id: "appt_aniket_02",
    patient: "Harshit Verma",
    age: 27,
    gender: "Male",
    doctorName: "Dr. Aniket Roy",
    speciality: "Dermatology & Skin Care",
    date: new Date().toISOString().split("T")[0],
    time: "10:30 AM",
    fee: 700,
    status: "complete",
    token: "#02",
    raw: {
      patientName: "Harshit Verma",
      time: "10:30 AM",
      token: "#02",
      notes: "Skin Rash / Allergy • Token #2",
      fees: 700,
    },
  },
  {
    id: "appt_aniket_03",
    patient: "Suresh Patel",
    age: 41,
    gender: "Male",
    doctorName: "Dr. Aniket Roy",
    speciality: "Dermatology & Skin Care",
    date: new Date().toISOString().split("T")[0],
    time: "11:00 AM",
    fee: 700,
    status: "complete",
    token: "#03",
    raw: {
      patientName: "Suresh Patel",
      time: "11:00 AM",
      token: "#03",
      notes: "Consultation • Token #3",
      fees: 700,
    },
  },
];

/* -------------------------
   Component: DashboardPage (fetch + update + reschedule)
   ------------------------- */
export default function DashboardPage({ apiBase }) {
  const params = useParams();
  const location = useLocation();

  const [appointments, setAppointments] = useState(() => {
    return params.id === "doc-4" || !params.id ? defaultDoc4Appointments : [];
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // resolved API base and doctorId detection order:
  // 1) prop doctorId
  // 2) route param :doctorId
  // 3) query string ?doctorId=
  // resolved API base and doctorId detection order:
  location.search;
  const API = apiBase || API_BASE;
  const doctorId = params.id;

  // MediCare Nexus Clinical Operations State
  const [activeTab, setActiveTab] = useState("appointments");
  const [doctorStatus, setDoctorStatus] = useState("AVAILABLE");
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [emergencyAccepted, setEmergencyAccepted] = useState(false);
  const [nexusStatus, setNexusStatus] = useState("CONNECTED");

  // Real-time Live OPD Session State (Synchronized across all roles)
  const [opdSession, setOpdSession] = useState(null);
  const [opdLoading, setOpdLoading] = useState(false);

  const fetchOpdSession = async () => {
    try {
      const res = await fetch(`${API}/api/opd/doctor/${doctorId || "doc-4"}`);
      if (res.ok) {
        const json = await res.json();
        if (json?.data) {
          setOpdSession(json.data);
          setDoctorStatus(json.data.status);
        }
      }
    } catch (err) {
      console.warn("fetchOpdSession err:", err.message);
    }
  };

  useEffect(() => {
    fetchOpdSession();
    const timer = setInterval(fetchOpdSession, 2500);

    let sse;
    try {
      sse = new EventSource(`${API}/api/nexus/events`);
      sse.addEventListener("QUEUE_UPDATED", () => fetchOpdSession());
      sse.addEventListener("DELAY_UPDATED", () => fetchOpdSession());
      sse.addEventListener("OPD_UPDATED", () => fetchOpdSession());
      sse.addEventListener("CONSULTATION_STARTED", () => fetchOpdSession());
      sse.addEventListener("CONSULTATION_COMPLETED", () => fetchOpdSession());
    } catch (e) {}

    return () => {
      clearInterval(timer);
      if (sse) sse.close();
    };
  }, [doctorId, API]);

  const handleOpdDelay = async (mins) => {
    try {
      setOpdLoading(true);
      const res = await fetch(`${API}/api/opd/doctor/${doctorId || "doc-4"}/delay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delayMinutes: mins }),
      });
      if (res.ok) {
        const json = await res.json();
        setOpdSession(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setOpdLoading(false);
    }
  };

  const handleClearDelay = async () => {
    try {
      setOpdLoading(true);
      const res = await fetch(`${API}/api/opd/doctor/${doctorId || "doc-4"}/clear-delay`, {
        method: "POST",
      });
      if (res.ok) {
        const json = await res.json();
        setOpdSession(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setOpdLoading(false);
    }
  };

  const handleStartConsultation = async () => {
    try {
      setOpdLoading(true);
      const res = await fetch(`${API}/api/opd/doctor/${doctorId || "doc-4"}/start-consultation`, {
        method: "POST",
      });
      if (res.ok) {
        const json = await res.json();
        setOpdSession(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setOpdLoading(false);
    }
  };

  const handleCompleteConsultation = async () => {
    try {
      setOpdLoading(true);
      const res = await fetch(`${API}/api/opd/doctor/${doctorId || "doc-4"}/complete-consultation`, {
        method: "POST",
      });
      if (res.ok) {
        const json = await res.json();
        setOpdSession(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setOpdLoading(false);
    }
  };

  const handleToggleBreak = async () => {
    try {
      setOpdLoading(true);
      const res = await fetch(`${API}/api/opd/doctor/${doctorId || "doc-4"}/break`, {
        method: "POST",
      });
      if (res.ok) {
        const json = await res.json();
        setOpdSession(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setOpdLoading(false);
    }
  };

  const handleToggleEmergency = async () => {
    try {
      setOpdLoading(true);
      const res = await fetch(`${API}/api/opd/doctor/${doctorId || "doc-4"}/emergency`, {
        method: "POST",
      });
      if (res.ok) {
        const json = await res.json();
        setOpdSession(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setOpdLoading(false);
    }
  };

  const [queuePatients, setQueuePatients] = useState([
    {
      token: "Q-101",
      patientId: "P-1003",
      name: "Arun Raj",
      age: 45,
      gender: "Male",
      acuity: "HIGH",
      acuityColor: "bg-amber-100 text-amber-800 border-amber-300",
      reason: "Post-Angioplasty Stent Evaluation",
      waitTime: "14 mins",
      vitals: { bp: "135/88", hr: "84 bpm", spO2: "97%" },
      assignedBed: "ER-04 (Observation)",
      status: "Waiting"
    },
    {
      token: "Q-102",
      patientId: "P-1004",
      name: "Meena Devi",
      age: 52,
      gender: "Female",
      acuity: "MEDIUM",
      acuityColor: "bg-blue-100 text-blue-800 border-blue-300",
      reason: "Hypertension Stage 2 & Exertional Angina",
      waitTime: "22 mins",
      vitals: { bp: "152/94", hr: "92 bpm", spO2: "96%" },
      assignedBed: "GEN-04",
      status: "Triage"
    },
    {
      token: "Q-103",
      patientId: "P-1006",
      name: "Sunita Rao",
      age: 34,
      gender: "Female",
      acuity: "LOW",
      acuityColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
      reason: "Intermittent Palpitations Review",
      waitTime: "8 mins",
      vitals: { bp: "118/76", hr: "78 bpm", spO2: "99%" },
      assignedBed: "OPD Bay 2",
      status: "Checked In"
    }
  ]);

  const [assignedBeds, setAssignedBeds] = useState([
    {
      bedId: "ICU-05",
      ward: "Intensive Care Unit (ICU)",
      patientId: "P-1005",
      patientName: "Vikram Singh",
      age: 58,
      diagnosis: "Acute Coronary Syndrome (STEMI)",
      vitals: { bp: "168/104", hr: "128 bpm", spO2: "86%" },
      equipment: ["Puritan Bennett 980 (V-04)", "Philips TC70 ECG (ECG-02)", "IntelliVue MX750"],
      oxygenStatus: "Mechanical Ventilation (100% FiO2)",
      primaryNurse: "Nurse Sarah Jenkins (N-07)",
      status: "CRITICAL"
    },
    {
      bedId: "ICU-08",
      ward: "Intensive Care Unit (ICU)",
      patientId: "P-ICU-08",
      patientName: "Robert Vance",
      age: 64,
      diagnosis: "Post-CABG Step Down Watch",
      vitals: { bp: "124/82", hr: "76 bpm", spO2: "98%" },
      equipment: ["Patient Monitor", "Infusion Pump"],
      oxygenStatus: "Nasal Cannula (2 L/min)",
      primaryNurse: "Nurse Specialist 12",
      status: "STABLE"
    },
    {
      bedId: "GEN-04",
      ward: "General Ward A",
      patientId: "P-1004",
      patientName: "Meena Devi",
      age: 52,
      diagnosis: "Severe Hypertension Observation",
      vitals: { bp: "152/94", hr: "92 bpm", spO2: "96%" },
      equipment: ["Mindray BeneVision Monitor"],
      oxygenStatus: "Room Air",
      primaryNurse: "Nurse Specialist 24",
      status: "OBSERVATION"
    }
  ]);

  const [diagnosticRequests, setDiagnosticRequests] = useState([
    {
      testId: "REQ-901",
      testName: "High-Sensitivity Troponin-I (STAT)",
      patientName: "Vikram Singh (P-1005)",
      orderedAt: "10 mins ago",
      priority: "STAT - EMERGENCY",
      status: "Completed",
      result: "4.8 ng/mL (Critical Elevation)",
      department: "Pathology Stat Lab"
    },
    {
      testId: "REQ-902",
      testName: "12-Lead Emergency ECG",
      patientName: "Vikram Singh (P-1005)",
      orderedAt: "25 mins ago",
      priority: "STAT - EMERGENCY",
      status: "Completed",
      result: "Anterior ST-Elevation (>2mm V1-V4)",
      department: "Cardiology Suite"
    },
    {
      testId: "REQ-903",
      testName: "Transthoracic 2D Echocardiogram",
      patientName: "Arun Raj (P-1003)",
      orderedAt: "45 mins ago",
      priority: "URGENT",
      status: "In Progress",
      result: "LVEF 48%, Anterior wall hypokinesia",
      department: "Cardiology Suite"
    },
    {
      testId: "REQ-904",
      testName: "Lipid Profile + HbA1c",
      patientName: "Meena Devi (P-1004)",
      orderedAt: "1 hour ago",
      priority: "ROUTINE",
      status: "Sample Collected",
      result: "Pending lab verification",
      department: "Central Hematology Lab"
    }
  ]);

  const [otSchedule, setOtSchedule] = useState([
    {
      otId: "OT-01",
      suite: "Cardiac Surgical Suite 1",
      procedure: "Emergency Coronary Angiogram & PCI",
      patientName: "Vikram Singh (P-1005)",
      time: "12:15 PM (Prepped)",
      surgeon: "Dr. Sarah Johnson",
      anesthetist: "Dr. David Kim",
      status: "STANDBY READY",
      equipment: ["C-Arm Fluoroscopy", "Bypass Standby", "Intra-Aortic Balloon Pump"]
    },
    {
      otId: "OT-04",
      suite: "Emergency Hybrid OT",
      procedure: "Elective Stent Revision",
      patientName: "David Miller (P-1007)",
      time: "03:30 PM",
      surgeon: "Dr. Sarah Johnson",
      anesthetist: "Dr. David Kim",
      status: "SCHEDULED",
      equipment: ["C-Arm Fluoroscopy", "Ventilator V-05"]
    }
  ]);

  // Live SSE listener for real-time synchronization with Admin & Orchestrator
  useEffect(() => {
    let es;
    try {
      es = new EventSource(`${API}/api/nexus/events`);
      es.onopen = () => setNexusStatus("CONNECTED");
      es.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.event === "emergencyCreated") {
            setEmergencyActive(true);
            setEmergencyAccepted(false);
          } else if (payload.event === "systemReset") {
            setEmergencyActive(true);
            setEmergencyAccepted(false);
          }
        } catch (e) {}
      };
      es.onerror = () => setNexusStatus("POLLING");
    } catch (e) {}

    return () => {
      if (es) es.close();
    };
  }, [API]);

  const handleStatusChange = async (newStatus) => {
    setDoctorStatus(newStatus);
    try {
      await fetch(`${API}/api/nexus/staff/DOC-01/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus === "AVAILABLE" ? "ON_DUTY" : newStatus })
      });
    } catch (e) {
      console.warn("Status update fallback:", e.message);
    }
  };

  async function fetchAppointments() {
    setLoading(true);
    setError(null);
    try {
      // If doctorId present, call the doctor-specific endpoint.
      // Backend route: GET /api/appointments/doctor/:doctorId
      const basePath = `${API}/api/appointments/doctor/${encodeURIComponent(
        doctorId,
      )}`;

      // keep limit modest
      const url = `${basePath}`;
      console.log(url);

      const res = await fetch(url);

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body?.message || `Failed to fetch appointments (${res.status})`,
        );
      }
      const body = await res.json();

      // backend may return appointments array at body.appointments
      const list = Array.isArray(body.appointments)
        ? body.appointments
        : Array.isArray(body)
          ? body
          : (body.items ?? body.data ?? []);

      const normalized = (Array.isArray(list) ? list : [])
        .map(normalizeAppointment)
        .filter(Boolean);

      if (normalized.length === 0 && (doctorId === "doc-4" || !doctorId)) {
        setAppointments(defaultDoc4Appointments);
      } else {
        setAppointments(normalized);
      }
    } catch (err) {
      console.error("fetchAppointments:", err);
      setError(err.message || "Failed to load appointments");
      if (doctorId === "doc-4" || !doctorId) {
        setAppointments(defaultDoc4Appointments);
      } else {
        setAppointments([]);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API, doctorId]);

  // computed values
  const sorted = useMemo(() => {
    return [...appointments].sort(
      (a, b) => parseDateTime(b.date, b.time) - parseDateTime(a.date, a.time),
    );
  }, [appointments]);

  const top8 = sorted.slice(0, 12);

  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(
    (a) => a.status === "complete",
  ).length;
  const cancelledAppointments = appointments.filter(
    (a) => a.status === "cancelled",
  ).length;
  const totalEarnings = appointments
    .filter((a) => a.status === "complete" || a.status === "confirmed")
    .reduce((s, a) => s + (Number(a.fee) || 0), 0);

  /* -------------------------
     Update status (remote)
     ------------------------- */
  async function updateStatusRemote(id, newStatusFrontend) {
    const appt = appointments.find((p) => p.id === id);
    if (!appt) return;
    if (appt.status === "complete" || appt.status === "cancelled") return;

    const backendStatus = frontendToBackendStatus(newStatusFrontend);

    // optimistic update
    setAppointments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatusFrontend } : p)),
    );

    try {
      const res = await fetch(`${API}/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: backendStatus }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body?.message || `Status update failed (${res.status})`,
        );
      }
      const data = await res.json();
      const updated = data.appointment || data;

      // Merge server update with previous raw appointment so we don't lose fields like doctorImage/doctorId
      setAppointments((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;

          // Use previous raw data as base, overlay server returned fields
          const mergedRaw = { ...(p.raw || {}), ...(updated || {}) };

          // normalizeAppointment will prefer doctorId.imageUrl, doctorImage, etc.
          const normalized = normalizeAppointment(mergedRaw);
          if (normalized) return normalized;

          // fallback: keep existing p but update status conservatively
          return {
            ...p,
            status: backendToFrontendStatus(updated.status || backendStatus),
            raw: mergedRaw,
          };
        }),
      );
    } catch (err) {
      console.error("updateStatusRemote:", err);
      // revert optimistic
      setAppointments((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: appt.status } : p)),
      );
      setError(err.message || "Failed to update status");
    }
  }

  /* -------------------------
     Reschedule (remote): send { date, time } where time is "hh:mm AM/PM"
     ------------------------- */
  async function rescheduleRemote(id, newDate, newTime24) {
    const appt = appointments.find((p) => p.id === id);
    if (!appt) return;
    if (appt.status === "complete" || appt.status === "cancelled") return;

    const hhmm = newTime24;
    const time12 = to12HourFrom24(hhmm);

    // optimistic
    setAppointments((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, date: newDate, time: hhmm, status: "rescheduled" }
          : p,
      ),
    );

    try {
      const res = await fetch(`${API}/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: newDate, time: time12 }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || `Reschedule failed (${res.status})`);
      }
      const data = await res.json();
      const updated = data.appointment || data;

      setAppointments((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;

          // Merge server-provided fields with existing raw so we don't drop images/doctor info
          const mergedRaw = { ...(p.raw || {}), ...(updated || {}) };

          const normalized = normalizeAppointment(mergedRaw);
          if (normalized) return normalized;

          // Fallback: apply the optimistic values we already used
          return {
            ...p,
            date: newDate,
            time: hhmm,
            status: backendToFrontendStatus(updated.status || "Rescheduled"),
            raw: mergedRaw,
          };
        }),
      );
    } catch (err) {
      console.error("rescheduleRemote:", err);
      setError(err.message || "Failed to reschedule");
      // simplest recovery: reload list to restore server state
      await fetchAppointments();
    }
  }

  /* -------------------------
     UI helpers passed down to controls
     ------------------------- */
  function updateStatus(id, newStatus) {
    updateStatusRemote(id, newStatus);
  }

  function updateDateTime(id, newDate, newTime) {
    rescheduleRemote(id, newDate, newTime);
  }

  // Doctor's name resolution
  const currentDoctorName =
    opdSession?.doctorName ||
    doctorNameFromData ||
    (doctorId === "doc-4" ? "Dr. Aniket Roy" : "Dr. Sarah Johnson");

  return (
    <div className={dashboardStyles.pageContainer}>
      <div className={dashboardStyles.contentWrapper}>
        {/* Header matching Image 2 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              {currentDoctorName.toUpperCase()} — DASHBOARD
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Showing appointments for doctor {doctorId || "doc-4"} ({totalAppointments} total)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                fetchAppointments();
                fetchOpdSession();
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl border border-gray-200 shadow-2xs transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* 4 Stat Cards matching Image 2 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Card 1: Total Appointments */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Appointments</div>
              <div className="text-3xl font-extrabold text-gray-900 mt-1">{totalAppointments}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Total Earnings */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Earnings</div>
              <div className="text-3xl font-extrabold text-gray-900 mt-1">₹ {totalEarnings}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Completed */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Completed</div>
              <div className="text-3xl font-extrabold text-gray-900 mt-1">{completedAppointments}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Cancelled */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cancelled</div>
              <div className="text-3xl font-extrabold text-gray-900 mt-1">{cancelledAppointments}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* ⚡ Live OPD Cabin Controls Card matching Image 2 */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100 mb-6">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">⚡</span>
              <h2 className="text-xl font-bold text-gray-900">Live OPD Cabin Controls</h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleBreak}
                disabled={opdLoading}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  opdSession?.status === "ON_BREAK"
                    ? "bg-purple-600 text-white border-purple-600"
                    : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                }`}
              >
                <Coffee className="w-3.5 h-3.5" />
                {opdSession?.status === "ON_BREAK" ? "Resume Duty" : "Start Break"}
              </button>

              <button
                onClick={handleToggleEmergency}
                disabled={opdLoading}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  opdSession?.status === "EMERGENCY"
                    ? "bg-rose-600 text-white border-rose-600 animate-pulse"
                    : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                {opdSession?.status === "EMERGENCY" ? "Clear Emergency" : "Emergency Mode"}
              </button>
            </div>
          </div>

          {/* 3 Cabin Controls Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Box 1: Currently Consulting Token */}
            <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  CURRENTLY CONSULTING TOKEN
                </span>
                <div className="text-4xl font-black text-blue-900 mt-2 font-mono">
                  #{String(opdSession?.currentToken || 3).padStart(2, "0")}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-5">
                <button
                  onClick={handleStartConsultation}
                  disabled={opdLoading}
                  className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-black rounded-lg shadow-2xs transition-all uppercase tracking-wide cursor-pointer text-center"
                >
                  START CONSULTATION
                </button>
                <button
                  onClick={handleCompleteConsultation}
                  disabled={opdLoading}
                  className="w-full py-2.5 px-3 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-black rounded-lg shadow-2xs transition-all uppercase tracking-wide cursor-pointer text-center"
                >
                  COMPLETE
                </button>
              </div>
            </div>

            {/* Box 2: Declare OPD Delay */}
            <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  DECLARE OPD DELAY
                </span>
                <div className="text-base font-bold text-amber-900 mt-2">
                  Current Delay: <span className="text-amber-700 font-black">+{opdSession?.delayMinutes != null ? opdSession.delayMinutes : 10} minutes</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mt-5">
                <button
                  onClick={() => handleOpdDelay(5)}
                  disabled={opdLoading}
                  className="py-2 px-1 bg-amber-200 hover:bg-amber-300 active:bg-amber-400 text-amber-950 font-black text-xs rounded-lg transition-colors cursor-pointer text-center"
                >
                  +5 MIN
                </button>
                <button
                  onClick={() => handleOpdDelay(10)}
                  disabled={opdLoading}
                  className="py-2 px-1 bg-amber-200 hover:bg-amber-300 active:bg-amber-400 text-amber-950 font-black text-xs rounded-lg transition-colors cursor-pointer text-center"
                >
                  +10 MIN
                </button>
                <button
                  onClick={() => handleOpdDelay(15)}
                  disabled={opdLoading}
                  className="py-2 px-1 bg-amber-200 hover:bg-amber-300 active:bg-amber-400 text-amber-950 font-black text-xs rounded-lg transition-colors cursor-pointer text-center"
                >
                  +15 MIN
                </button>
                <button
                  onClick={handleClearDelay}
                  disabled={opdLoading}
                  className="py-2 px-1 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-800 font-black text-xs rounded-lg transition-colors cursor-pointer text-center"
                >
                  CLEAR
                </button>
              </div>
            </div>

            {/* Box 3: OPD Completion Rate */}
            <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  OPD COMPLETION RATE
                </span>
                <div className="text-4xl font-black text-emerald-600 mt-2">
                  100%
                </div>
              </div>

              <div className="mt-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-md">
                  <Check className="w-3.5 h-3.5" />
                  On-Time Performance: 75%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Latest Appointments List matching Image 2 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Latest Appointments</h2>
          </div>

          <div className="space-y-3">
            {appointments.map((a, idx) => (
              <div
                key={a.id || idx}
                className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs hover:border-gray-300 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm shrink-0">
                    {a.patient ? a.patient[0].toUpperCase() : "P"}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">
                      {a.patient}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <span className="font-semibold text-gray-700">
                        {a.token || `#0${idx + 1}`} • {formatTimeAMPM(a.time) || a.time}
                      </span>
                      <span>•</span>
                      <span>{a.raw?.notes || `${a.speciality || "General"} • Token #${idx + 1}`}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-full uppercase">
                    Completed
                  </span>
                  <div className="text-sm font-extrabold text-gray-900 font-mono">
                    ₹ {a.fee || 700}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clean Clinical Tabs Navigation */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200 overflow-x-auto bg-gray-50/60">
            <button
              onClick={() => setActiveTab("appointments")}
              className={`flex items-center gap-2 px-5 py-3.5 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "appointments"
                  ? "border-emerald-600 text-emerald-700 bg-white"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Calendar className="w-4 h-4" />
              Appointments ({appointments.length || 8})
            </button>

            <button
              onClick={() => setActiveTab("queue")}
              className={`flex items-center gap-2 px-5 py-3.5 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "queue"
                  ? "border-emerald-600 text-emerald-700 bg-white"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Clock className="w-4 h-4" />
              Patient Queue ({queuePatients.length})
            </button>

            <button
              onClick={() => setActiveTab("beds")}
              className={`flex items-center gap-2 px-5 py-3.5 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "beds"
                  ? "border-emerald-600 text-emerald-700 bg-white"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Bed className="w-4 h-4" />
              Ward Beds ({assignedBeds.length})
            </button>

            <button
              onClick={() => setActiveTab("diagnostics")}
              className={`flex items-center gap-2 px-5 py-3.5 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "diagnostics"
                  ? "border-emerald-600 text-emerald-700 bg-white"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <FileText className="w-4 h-4" />
              Diagnostic Requests ({diagnosticRequests.length})
            </button>

            <button
              onClick={() => setActiveTab("ot")}
              className={`flex items-center gap-2 px-5 py-3.5 font-bold text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "ot"
                  ? "border-emerald-600 text-emerald-700 bg-white"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Activity className="w-4 h-4" />
              OT Schedule ({otSchedule.length})
            </button>
          </div>

          {/* TAB 1: APPOINTMENTS */}
          {activeTab === "appointments" && (
            <div className="p-6">
              <div className={dashboardStyles.appointmentsHeader}>
                <div>
                  <h2 className={dashboardStyles.appointmentsTitle}>
                    Latest Scheduled Appointments
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Click status to change lifecycle or reschedule date/time in real time
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className={dashboardStyles.appointmentsTotal}>
                    <Users className={dashboardStyles.totalIcon} />
                    <span>{totalAppointments} total</span>
                  </div>
                </div>
              </div>

              {/* Cards grid */}
              <div className={dashboardStyles.cardsGrid}>
                {top8.map((a) => (
                  <div key={a.id} className={dashboardStyles.appointmentCard}>
                    <div className={dashboardStyles.cardHeader}>
                      <div className={dashboardStyles.cardAvatar}>
                        {a.doctorImage ? (
                          <img
                            src={a.doctorImage}
                            alt={a.doctorName}
                            onError={(e) =>
                              (e.currentTarget.style.display = "none")
                            }
                            className={dashboardStyles.cardAvatarImage}
                          />
                        ) : (
                          <div className={dashboardStyles.cardAvatarFallback}>
                            {(a.doctorName || "D").charAt(0)}
                          </div>
                        )}
                      </div>

                      <div className={dashboardStyles.cardContent}>
                        <div className={dashboardStyles.cardPatientName}>
                          {a.patient}
                        </div>
                        <div className={dashboardStyles.cardPatientInfo}>
                          {a.age} yrs · {a.gender}
                        </div>
                        <div className={dashboardStyles.cardDoctorInfo}>
                          <span className={dashboardStyles.cardDoctorName}>
                            {a.doctorName}
                          </span>
                        </div>
                        <div className={dashboardStyles.cardSpeciality}>
                          {a.speciality}
                        </div>
                        <div className={dashboardStyles.cardPhoneContainer}>
                          <Phone className={dashboardStyles.cardPhoneIcon} />
                          <span>{a.mobile}</span>
                        </div>
                      </div>
                    </div>

                    <div className={dashboardStyles.dateTimeContainer}>
                      <div className={dashboardStyles.dateText}>
                        {formatDate(a.date)}
                      </div>
                      <div className={dashboardStyles.timeText}>
                        {formatTimeAMPM(a.time)}
                      </div>
                    </div>

                    <div>
                      <div className={dashboardStyles.cardFooter}>
                        <div className={dashboardStyles.feeText}>₹{a.fee}</div>

                        <div className={dashboardStyles.statusContainer}>
                          <StatusBadge status={a.status} />
                          <StatusSelect
                            appointment={a}
                            onChange={(s) => updateStatus(a.id, s)}
                          />
                        </div>

                        <div className="mt-2 w-full">
                          <RescheduleButton
                            appointment={a}
                            onReschedule={(newDate, newTime) =>
                              updateDateTime(a.id, newDate, newTime)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={dashboardStyles.showMoreContainer}>
                <Link
                  to={
                    doctorId
                      ? `/doctor-admin/${doctorId}/appointments`
                      : "/appointments"
                  }
                  className={dashboardStyles.showMoreButton}
                >
                  View Full Schedule & Archive
                </Link>
              </div>
            </div>
          )}

          {/* TAB 2: PATIENT QUEUE */}
          {activeTab === "queue" && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Live Clinical Triage Queue</h3>
                  <p className="text-xs text-gray-500">Autonomous priority sorting by acuity, vitals, and wait times</p>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {queuePatients.length} Waiting
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-xs font-semibold text-gray-700 uppercase">
                    <tr>
                      <th className="py-3 px-4">Token</th>
                      <th className="py-3 px-4">Patient</th>
                      <th className="py-3 px-4">Reason / Notes</th>
                      <th className="py-3 px-4">Acuity</th>
                      <th className="py-3 px-4">Live Vitals</th>
                      <th className="py-3 px-4">Wait Time</th>
                      <th className="py-3 px-4">Assigned Bay</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {queuePatients.map((qp, idx) => (
                      <tr key={qp.token} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{qp.token}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-gray-900">{qp.name}</div>
                          <div className="text-xs text-gray-500">{qp.age} yrs · {qp.gender} · {qp.patientId}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs max-w-xs">{qp.reason}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${qp.acuityColor}`}>
                            {qp.acuity}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-gray-700">
                          <div>BP: {qp.vitals.bp}</div>
                          <div>HR: {qp.vitals.hr} · SpO2: {qp.vitals.spO2}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-semibold text-gray-700">{qp.waitTime}</td>
                        <td className="py-3.5 px-4 text-xs font-medium text-emerald-800">{qp.assignedBed}</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => alert(`Calling in patient ${qp.name} (${qp.token}) to Consultation Desk`)}
                              className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-2xs"
                            >
                              Call In
                            </button>
                            <button
                              onClick={() => alert(`Diagnostics requisition form opened for ${qp.name}`)}
                              className="px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                            >
                              Order Test
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: WARD & BEDS */}
          {activeTab === "beds" && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Inpatient Beds Under Dr. Sarah Johnson</h3>
                  <p className="text-xs text-gray-500">Real-time telemetry, ventilator synchronization, and ward assignments</p>
                </div>
                <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                  {assignedBeds.length} Monitored Beds
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {assignedBeds.map((bed) => (
                  <div key={bed.bedId} className="p-4 rounded-xl border border-gray-200 bg-white hover:border-emerald-300 transition-all shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-700 text-sm bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {bed.bedId}
                        </span>
                        <span className="text-xs text-gray-500">{bed.ward}</span>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        bed.status === "CRITICAL" ? "bg-rose-100 text-rose-800 border border-rose-300 animate-pulse" : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {bed.status}
                      </span>
                    </div>

                    <div className="mt-2">
                      <div className="font-bold text-gray-900">{bed.patientName}</div>
                      <div className="text-xs text-gray-500">{bed.diagnosis} ({bed.patientId})</div>
                    </div>

                    <div className="mt-3 p-2 bg-gray-50 rounded-lg text-xs font-mono space-y-0.5 text-gray-700">
                      <div>BP: <strong>{bed.vitals.bp} mmHg</strong></div>
                      <div>HR: <strong>{bed.vitals.hr}</strong> | SpO2: <strong>{bed.vitals.spO2}</strong></div>
                    </div>

                    <div className="mt-3 text-xs text-gray-600">
                      <div className="font-semibold text-gray-700">Oxygen/Vent:</div>
                      <div className="text-gray-500 truncate">{bed.oxygenStatus}</div>
                    </div>

                    <div className="mt-2 text-xs text-gray-600">
                      <div className="font-semibold text-gray-700">Assigned Nurse:</div>
                      <div className="text-gray-500">{bed.primaryNurse}</div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <button
                        onClick={() => alert(`Opening telemetry feed for Bed ${bed.bedId}`)}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-800"
                      >
                        Telemetry Feed →
                      </button>
                      <button
                        onClick={() => alert(`Discharge/Step-down transfer requested for ${bed.patientName} at ${bed.bedId}`)}
                        className="text-xs font-medium text-gray-500 hover:text-gray-800"
                      >
                        Step Down
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DIAGNOSTIC REQUESTS */}
          {activeTab === "diagnostics" && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Diagnostic Tests & Lab Requisitions</h3>
                  <p className="text-xs text-gray-500">Autonomous routing through fast-track imaging suites and biochemistry stat labs</p>
                </div>
                <button
                  onClick={() => alert("Requisitioning stat diagnostic order...")}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                >
                  + Requisition Test
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-xs font-semibold text-gray-700 uppercase">
                    <tr>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Diagnostic Test</th>
                      <th className="py-3 px-4">Patient</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Status & Result</th>
                      <th className="py-3 px-4 text-right">Report</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {diagnosticRequests.map((diag) => (
                      <tr key={diag.testId} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-gray-800 text-xs">{diag.testId}</td>
                        <td className="py-3.5 px-4 font-bold text-gray-900 text-xs">{diag.testName}</td>
                        <td className="py-3.5 px-4 text-xs text-gray-700">{diag.patientName}</td>
                        <td className="py-3.5 px-4 text-xs text-gray-500">{diag.department}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-2xs font-black uppercase ${
                            diag.priority.includes("STAT")
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : diag.priority === "URGENT"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-gray-100 text-gray-700"
                          }`}>
                            {diag.priority}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          <span className="font-semibold text-gray-800">{diag.status}</span>
                          <div className="text-2xs text-gray-500 font-mono mt-0.5">{diag.result}</div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => alert(`Viewing lab report for ${diag.testName}`)}
                            className="text-xs font-bold text-emerald-600 hover:text-emerald-800"
                          >
                            View Result
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: OT SCHEDULE */}
          {activeTab === "ot" && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Operating Theatre Roster & Surgical Allocation</h3>
                  <p className="text-xs text-gray-500">Autonomous OT slot orchestration and surgical team scheduling</p>
                </div>
                <span className="text-xs font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                  {otSchedule.length} Procedures Scheduled
                </span>
              </div>

              <div className="space-y-4">
                {otSchedule.map((ot) => (
                  <div key={ot.otId} className="p-4 rounded-xl border border-gray-200 bg-white hover:border-purple-300 transition-all shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-xs border border-purple-200">
                            {ot.otId}
                          </span>
                          <h4 className="text-sm font-bold text-gray-900">{ot.suite}</h4>
                        </div>
                        <p className="text-xs font-semibold text-purple-900 mt-1">{ot.procedure}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-700 bg-gray-50 px-3 py-1 rounded-lg border border-gray-200">
                          🕒 {ot.time}
                        </span>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {ot.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 text-xs text-gray-600">
                      <div>
                        <span className="text-gray-400">Patient:</span> <strong>{ot.patientName}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400">Surgeon:</span> <strong>{ot.surgeon}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400">Anesthetist:</span> <strong>{ot.anesthetist}</strong>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-2xs text-gray-500">
                        <span>Equipment:</span>
                        {ot.equipment.map((eq, i) => (
                          <span key={i} className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">
                            {eq}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => alert(`Checklist verified for ${ot.procedure} in ${ot.suite}`)}
                        className="px-3 py-1 bg-purple-50 text-purple-700 font-semibold text-xs rounded-lg hover:bg-purple-100 border border-purple-200"
                      >
                        Verify OT Readiness
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* -----------------------
   Reusable components (unchanged but using styles)
   ----------------------- */

function StatCard({
  title,
  value,
  icon,
  accentTop = dashboardStyles.accentTopEmeraldLight,
  accentBottom = dashboardStyles.accentBottomEmerald,
}) {
  return (
    <div className={dashboardStyles.statCard}>
      <div className={dashboardStyles.statContent}>
        <div className={dashboardStyles.statTextContainer}>
          <div className={dashboardStyles.statTitle}>{title}</div>
          <div className={dashboardStyles.statValue}>{value}</div>
        </div>

        <div
          className={`${dashboardStyles.statIconContainer} ${accentTop} ${accentBottom}`}
        >
          <div className={dashboardStyles.statIcon}>{icon}</div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const base = dashboardStyles.statusBadgeBase;
  if (status === "complete")
    return (
      <span className={`${base} ${dashboardStyles.statusBadgeComplete}`}>
        Completed
      </span>
    );
  if (status === "cancelled")
    return (
      <span className={`${base} ${dashboardStyles.statusBadgeCancelled}`}>
        Cancelled
      </span>
    );
  if (status === "confirmed")
    return (
      <span className={`${base} ${dashboardStyles.statusBadgeConfirmed}`}>
        Confirmed
      </span>
    );
  if (status === "rescheduled")
    return (
      <span className={`${base} ${dashboardStyles.statusBadgeRescheduled}`}>
        Rescheduled
      </span>
    );
  return (
    <span className={`${base} ${dashboardStyles.statusBadgePending}`}>
      Pending
    </span>
  );
}

function StatusSelect({ appointment, onChange }) {
  const terminal =
    appointment.status === "complete" || appointment.status === "cancelled";

  if (appointment.status === "rescheduled") {
    return (
      <select
        value={appointment.status}
        onChange={(e) => onChange(e.target.value)}
        className={`${dashboardStyles.statusSelect} ${
          terminal
            ? dashboardStyles.statusSelectDisabled
            : dashboardStyles.statusSelectEnabled
        }`}
        title="Change status (only Completed or Cancelled allowed after reschedule)"
      >
        <option value="rescheduled" disabled>
          Rescheduled
        </option>
        <option value="complete">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
    );
  }

  const options = [
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "complete", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  return (
    <select
      value={appointment.status}
      onChange={(e) => onChange(e.target.value)}
      disabled={terminal}
      className={`${dashboardStyles.statusSelect} ${
        terminal
          ? dashboardStyles.statusSelectDisabled
          : dashboardStyles.statusSelectEnabled
      }`}
      title={terminal ? "Status cannot be changed" : "Change status"}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="text-sm">
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function RescheduleButton({ appointment, onReschedule }) {
  const terminal =
    appointment.status === "complete" || appointment.status === "cancelled";
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("09:00");

  // compute minDate as YYYY-MM-DD for today (local timezone)
  const minDate = React.useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }, []);

  React.useEffect(() => {
    // Normalize appointment.date to yyyy-mm-dd (handles ISO or plain date strings)
    const apptRaw = appointment.date ? String(appointment.date) : "";
    const apptDate = apptRaw.slice(0, 10); // safe for "YYYY-MM-DD..." or "YYYY-MM-DD"

    // If appointment date is today or in the future, use it; otherwise use minDate
    setDate(apptDate && apptDate >= minDate ? apptDate : minDate);
    setTime(appointment.time || "09:00");
  }, [appointment.date, appointment.time, minDate]);

  function save() {
    if (!date || !time) return;
    // defensive: ensure we never submit a past date
    if (date < minDate) {
      setDate(minDate);
      return;
    }
    onReschedule(date, time); // time is 24-hour "HH:MM"
    setEditing(false);
  }

  function cancel() {
    const apptRaw = appointment.date ? String(appointment.date) : "";
    const apptDate = apptRaw.slice(0, 10);
    setDate(apptDate && apptDate >= minDate ? apptDate : minDate);
    setTime(appointment.time || "09:00");
    setEditing(false);
  }

  return (
    <div className="w-full">
      {!editing ? (
        <div className="flex justify-end">
          <button
            onClick={() => setEditing(true)}
            disabled={terminal}
            title={
              terminal ? "Cannot reschedule completed/cancelled" : "Reschedule"
            }
            className={`${dashboardStyles.rescheduleButton} ${
              terminal
                ? dashboardStyles.rescheduleButtonDisabled
                : dashboardStyles.rescheduleButtonEnabled
            }`}
          >
            Reschedule
          </button>
        </div>
      ) : (
        <div className={dashboardStyles.rescheduleForm}>
          <input
            type="date"
            value={date}
            min={minDate}
            onChange={(e) => setDate(e.target.value)}
            className={dashboardStyles.rescheduleDateInput}
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={dashboardStyles.rescheduleTimeInput}
          />
          <div className={dashboardStyles.rescheduleButtons}>
            <button onClick={save} className={dashboardStyles.saveButton}>
              Save
            </button>
            <button onClick={cancel} className={dashboardStyles.cancelButton}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
