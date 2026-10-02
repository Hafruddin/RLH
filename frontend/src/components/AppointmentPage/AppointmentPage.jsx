import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  CalendarDays,
  Clock,
  CreditCard,
  Wallet,
  CheckCircle,
  XCircle,
  Bell,
} from "lucide-react";
import { useAuth, useUser } from "@clerk/clerk-react";
import {
  appointmentPageStyles,
  cardStyles,
  badgeStyles,
  iconSize,
} from "../../assets/dummyStyles";
import { getDoctorImage, handleImageError } from "../../utils/doctorImages";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API = axios.create({ baseURL: API_BASE });

/* -------------------- Helpers -------------------- */
function pad(n) {
  return String(n ?? 0).padStart(2, "0");
}

function parseDateTime(dateStr, timeStr) {
  const fast = new Date(`${dateStr} ${timeStr}`);
  if (!isNaN(fast)) return fast;

  const parts = (dateStr || "").split(" ");
  if (parts.length === 3) {
    const [d, m, y] = parts;
    const months = {
      Jan: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Aug: 7,
      Sep: 8,
      Oct: 9,
      Nov: 10,
      Dec: 11,
    };
    const month = months[m];
    let [t, ampm] = (timeStr || "").split(" ");
    let [hh, mm] = (t || "0:00").split(":");
    hh = Number(hh || 0);
    mm = Number(mm || 0);

    if (ampm === "PM" && hh !== 12) hh += 12;
    if (ampm === "AM" && hh === 12) hh = 0;

    return new Date(Number(y), month, Number(d), hh, mm);
  }

  const iso = new Date(dateStr);
  if (!isNaN(iso)) return iso;
  return new Date();
}

function computeStatus(item) {
  const now = new Date();
  if (!item) return "Pending";

  if (item.status === "Canceled") return "Canceled";
  if (item.status === "Rescheduled") {
    if (
      item.rescheduledTo &&
      item.rescheduledTo.date &&
      item.rescheduledTo.time
    ) {
      const dt = parseDateTime(
        item.rescheduledTo.date,
        item.rescheduledTo.time,
      );
      if (now >= dt) return "Completed";
    }
    return "Rescheduled";
  }
  if (item.status === "Completed") return "Completed";
  if (item.status === "Confirmed") {
    const dtConfirmed = parseDateTime(item.date, item.time);
    if (now >= dtConfirmed) return "Completed";
    return "Confirmed";
  }
  if (item.status === "Pending") {
    const dtPending = parseDateTime(item.date, item.time);
    if (now >= dtPending) return "Completed";
    return "Pending";
  }

  const dt = parseDateTime(item.date, item.time);
  if (now >= dt) return "Completed";
  return item.confirmed ? "Confirmed" : "Pending";
}

/* -------------------- Badges -------------------- */
const PaymentBadge = ({ payment }) => {
  return payment === "Online" ? (
    <span className={badgeStyles.paymentBadge.online}>
      <CreditCard className={iconSize.small} /> Online
    </span>
  ) : (
    <span className={badgeStyles.paymentBadge.cash}>
      <Wallet className={iconSize.small} /> Cash
    </span>
  );
};

const StatusBadge = ({ itemStatus }) => {
  if (itemStatus === "Completed")
    return (
      <span className={badgeStyles.statusBadge.completed}>
        <CheckCircle className={iconSize.small} /> Completed
      </span>
    );

  if (itemStatus === "Confirmed")
    return (
      <span className={badgeStyles.statusBadge.confirmed}>
        <Bell className={iconSize.small} /> Confirmed
      </span>
    );

  if (itemStatus === "Pending")
    return (
      <span className={badgeStyles.statusBadge.pending}>
        <Clock className={iconSize.small} /> Pending
      </span>
    );

  if (itemStatus === "Canceled")
    return (
      <span className={badgeStyles.statusBadge.canceled}>
        <XCircle className={iconSize.small} /> Canceled
      </span>
    );

  return (
    <span className={badgeStyles.statusBadge.default}>
      <CalendarDays className={iconSize.small} /> Rescheduled
    </span>
  );
};

/* -------------------- Default Demo Data for Hackathon -------------------- */
const _nowDate = new Date();
const _todayDateStr = _nowDate.toISOString().split("T")[0];

const DEFAULT_DEMO_APPOINTMENTS = [
  {
    _id: "demo_appt_101",
    id: "demo_appt_101",
    patientName: "Harsh Tripathi",
    doctorName: "Dr. Rajesh Kumar",
    doctor: "Dr. Rajesh Kumar",
    specialization: "Interventional Cardiology",
    experience: "16 years",
    date: _todayDateStr,
    time: "10:30 AM",
    fees: 800,
    status: "Confirmed",
    confirmed: true,
    payment: { method: "Online", status: "Paid", amount: 800 },
    notes: "Follow-up Cardiology Consult • Token #04",
  },
  {
    _id: "demo_appt_102",
    id: "demo_appt_102",
    patientName: "Harsh Tripathi",
    doctorName: "Dr. Suresh Reddy",
    doctor: "Dr. Suresh Reddy",
    specialization: "Consultant Neurologist",
    experience: "15 years",
    date: _todayDateStr,
    time: "02:00 PM",
    fees: 900,
    status: "Confirmed",
    confirmed: true,
    payment: { method: "Online", status: "Paid", amount: 900 },
    notes: "Chronic Migraine & Stress Review • Token #05",
  },
  {
    _id: "demo_appt_103",
    id: "demo_appt_103",
    patientName: "Harsh Tripathi",
    doctorName: "Dr. Aniket Roy",
    doctor: "Dr. Aniket Roy",
    specialization: "Dermatology & Skin Care",
    experience: "10 years",
    date: _todayDateStr,
    time: "04:30 PM",
    fees: 700,
    status: "Confirmed",
    confirmed: true,
    payment: { method: "Cash", status: "Pending", amount: 700 },
    notes: "Skin Allergy Check • Token #06",
  }
];

const DEFAULT_DEMO_SERVICES = [
  {
    _id: "demo_srv_101",
    id: "demo_srv_101",
    name: "128-Slice Cardiac CT Angiography",
    price: 4500,
    date: _todayDateStr,
    time: "11:30 AM",
    payment: "Online",
    status: "Confirmed",
    image: "/assets/C1.png"
  },
  {
    _id: "demo_srv_102",
    id: "demo_srv_102",
    name: "Automated Hematology Lab (CBC & Troponin-I)",
    price: 1200,
    date: _todayDateStr,
    time: "09:00 AM",
    payment: "Online",
    status: "Completed",
    image: "/assets/C2.png"
  }
];

/* -------------------- Component -------------------- */
export default function AppointmentPage() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();

  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);

  const [doctorAppts, setDoctorAppts] = useState(() => DEFAULT_DEMO_APPOINTMENTS);
  const [serviceAppts, setServiceAppts] = useState(() => DEFAULT_DEMO_SERVICES);

  const [appointmentsRaw, setAppointmentsRaw] = useState({
    doctors: DEFAULT_DEMO_APPOINTMENTS,
    services: DEFAULT_DEMO_SERVICES,
  });
  const [error, setError] = useState(null);

  /* -------------------- Fetch Doctor Appointments -------------------- */
  const loadDoctorAppointments = useCallback(async () => {
    if (!isLoaded) return;
    setLoadingDoctors(true);
    setError(null);

    let token = null;
    try {
      token = await getToken();
      console.log(
        "Clerk token (frontend):",
        token ? `${token.slice(0, 20)}...` : null,
      );
    } catch (err) {
      console.error("Failed to get Clerk token (frontend):", err);
    }

    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    console.log("Outgoing headers for /api/appointments/me:", headers);

    try {
      const resp = await API.get("/api/appointments/me", { headers });
      console.log("Response from /api/appointments/me:", resp?.data);

      const fetched =
        resp?.data?.appointments ?? resp?.data?.data ?? resp?.data ?? [];
      const arr = Array.isArray(fetched) ? fetched : [];

      const doctors = arr.filter((a) => {
        return (
          (a.doctorId !== undefined && a.doctorId !== null) ||
          !!a.doctorName ||
          !a.serviceId
        );
      });

      if (doctors.length > 0) {
        setDoctorAppts(doctors);
        setAppointmentsRaw((p) => ({ ...p, doctors: doctors }));
      } else {
        setDoctorAppts(DEFAULT_DEMO_APPOINTMENTS);
        setAppointmentsRaw((p) => ({ ...p, doctors: DEFAULT_DEMO_APPOINTMENTS }));
      }
    } catch (err) {
      console.error(
        "Error calling /api/appointments/me:",
        err?.response?.data || err.message || err,
      );
      setDoctorAppts(DEFAULT_DEMO_APPOINTMENTS);
    } finally {
      setLoadingDoctors(false);
    }
  }, [isLoaded, getToken, user]);

  /* -------------------- Fetch Service Appointments -------------------- */
  const loadServiceAppointments = useCallback(async () => {
    if (!isLoaded) return;
    setLoadingServices(true);
    setError(null);

    let token = null;
    try {
      token = await getToken();
    } catch (err) {
      console.error("Failed to get Clerk token (frontend): err", err);
    }
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    try {
      const resp = await API.get("/api/service-appointments/me", { headers });
      const fetched =
        resp?.data?.appointments ?? resp?.data?.data ?? resp?.data ?? [];
      const arr = Array.isArray(fetched) ? fetched : [];

      if (arr.length > 0) {
        setServiceAppts(arr);
        setAppointmentsRaw((p) => ({ ...p, services: arr }));
      } else {
        setServiceAppts(DEFAULT_DEMO_SERVICES);
        setAppointmentsRaw((p) => ({ ...p, services: DEFAULT_DEMO_SERVICES }));
      }
    } catch (err) {
      console.warn("Service appointments load notice, falling back to demo services:", err.message);
      setServiceAppts(DEFAULT_DEMO_SERVICES);
      setAppointmentsRaw((p) => ({ ...p, services: DEFAULT_DEMO_SERVICES }));
    } finally {
      setLoadingServices(false);
    }
  }, [isLoaded, getToken, user]);

  /* -------------------- Combined loader -------------------- */
  useEffect(() => {
    loadDoctorAppointments();
    loadServiceAppointments();
  }, [
    isLoaded,
    isSignedIn,
    user,
    loadDoctorAppointments,
    loadServiceAppointments,
  ]);

  /* -------------------- Normalization for UI -------------------- */
  function normalizeRescheduled(rt) {
    if (!rt) return null;
    if (rt.date && rt.time) return { date: rt.date, time: rt.time };
    if (
      rt.date &&
      (rt.hour !== undefined || rt.minute !== undefined || rt.ampm)
    ) {
      const hour = rt.hour ?? 0;
      const minute = rt.minute ?? 0;
      const ampm = rt.ampm ?? "";
      return { date: rt.date, time: `${hour}:${pad(minute)} ${ampm}` };
    }
    return {
      date: rt.date || rt?.dateString || "",
      time:
        rt.time ||
        (rt.hour
          ? `${rt.hour}:${pad(rt.minute || 0)} ${rt.ampm || ""}`
          : rt?.timeString || ""),
    };
  }

  const appointmentData = useMemo(() => {
    return doctorAppts
      .map((a) => {
        const id = a._id || a.id || String(a._id || "");
        const doctorObj =
          typeof a.doctorId === "object" && a.doctorId ? a.doctorId : {};
        const doctorName =
          (doctorObj.name && String(doctorObj.name).trim()) ||
          (a.doctorName && String(a.doctorName).trim()) ||
          (a.doctor && String(a.doctor).trim()) ||
          "Dr. Sarah Johnson";
        const image = getDoctorImage(doctorObj.name ? doctorObj : { name: doctorName, id: a.doctorId, image: a.doctorImage?.url });

        const patientName = a.patientName || a.patient || "Patient";
        const specialization =
          doctorObj.specialization || a.specialization || a.speciality || "";
        const experience = doctorObj.experience || a.experience || "";
        const date = a.date || "";
        let time = a.time || "";

        if (!time) {
          if (a.hour !== undefined && a.minute !== undefined && a.ampm) {
            time = `${a.hour}:${pad(a.minute)} ${a.ampm}`;
          } else if (a.hour !== undefined && a.ampm) {
            time = `${a.hour}:00 ${a.ampm}`;
          }
        }

        const payment = (a.payment && a.payment.method) || "Cash";
        const status =
          a.status ||
          (a.payment && a.payment.status === "Paid" ? "Confirmed" : "Pending");
        const rescheduledTo = normalizeRescheduled(
          a.rescheduledTo || {
            date: a.rescheduledDate,
            time: a.rescheduledTime,
          },
        );

        return {
          id,
          image,
          doctor: doctorName,
          patientName,
          specialization,
          experience,
          date,
          time,
          payment,
          status,
          rescheduledTo,
        };
      })
      .map((x) => ({ ...x, status: computeStatus(x) }));
  }, [doctorAppts]);

  const serviceData = useMemo(() => {
    return serviceAppts
      .map((s) => {
        const id = s._id || s.id || String(s._id || "");
        const svc =
          typeof s.serviceId === "object" && s.serviceId ? s.serviceId : {};
        const image =
          svc.imageUrl ||
          svc.image ||
          svc.imageSmall ||
          s.serviceImage?.url ||
          s.serviceImage ||
          "";
        const name = s.serviceName || svc.name || svc.title || "Service";
        const patientName = s.patientName || s.patient || "Patient";
        const price = s.fees ?? s.amount ?? s.price ?? 0;
        const date = s.date || "";
        let time = s.time || "";
        if (!time) {
          if (s.hour !== undefined && s.minute !== undefined && s.ampm) {
            time = `${s.hour}:${pad(s.minute)} ${s.ampm}`;
          } else if (s.hour !== undefined && s.ampm) {
            time = `${s.hour}:00 ${s.ampm}`;
          }
        }

        const payment = (s.payment && s.payment.method) || "Cash";
        const status =
          s.status ||
          (s.payment && s.payment.status === "Paid" ? "Confirmed" : "Pending");

        const rescheduledTo = normalizeRescheduled(s.rescheduledTo || null);

        return {
          id,
          image,
          name,
          patientName,
          price,
          date,
          time,
          payment,
          status,
          rescheduledTo,
        };
      })
      .map((x) => ({ ...x, status: computeStatus(x) }));
  }, [serviceAppts]);

  /* -------------------- Render -------------------- */
  return (
    <div className={appointmentPageStyles.pageContainer}>
      <Toaster position="top-right" />
      <div className={appointmentPageStyles.maxWidthContainer}>
        {/* Hackathon Demo Multi-Portal Switcher */}
        <div className="mb-6 bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 border border-emerald-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
              👤
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-gray-900">Patient Care Portal (Active Demo Session)</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800">
                  Harsh Tripathi · ABHA #91-8273
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                Viewing active doctor appointments, live OPD queue token tracking, and diagnostic orders.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/doctor-admin/login"
              className="px-3.5 py-1.5 rounded-xl bg-white border border-gray-300 hover:border-emerald-500 text-gray-800 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
            >
              <span>👨‍⚕️ Doctor Login</span>
            </Link>
            <Link
              to="/admin"
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <span>🛡️ Admin Command Center</span>
            </Link>
          </div>
        </div>

        {/* Real-time Live OPD Banner */}
        <div className="mb-6 bg-gradient-to-r from-blue-950 via-slate-900 to-teal-950 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-teal-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-teal-500/20 text-teal-300 rounded-xl border border-teal-500/30">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-teal-400 text-teal-950 uppercase tracking-wider">
                  Live System
                </span>
                <h3 className="font-extrabold text-sm sm:text-base">Real-Time OPD Queue Tracking Active</h3>
              </div>
              <p className="text-xs text-teal-100/80 mt-0.5">
                Check real-time consulting tokens, doctor delays, and smart arrival alerts for all hospital OPD cabins.
              </p>
            </div>
          </div>
          <Link
            to="/live-opd"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-teal-400 hover:bg-teal-300 text-teal-950 text-xs font-black rounded-xl transition-all shadow-sm shrink-0"
          >
            Open Live OPD Monitor →
          </Link>
        </div>

        {/* ------------ DOCTOR APPOINTMENTS ------------ */}
        <h1 className={appointmentPageStyles.doctorTitle}>
          Your Doctor Appointments
        </h1>

        {loadingDoctors && (
          <div className={appointmentPageStyles.loadingText}>
            Loading doctors...
          </div>
        )}

        {!loadingDoctors && appointmentData.length === 0 && (
          <div className={appointmentPageStyles.emptyStateText}>
            No doctor appointments found.
          </div>
        )}

        <div className={appointmentPageStyles.doctorGrid}>
          {appointmentData.map((item, idx) => (
            <div key={item.id} className={cardStyles.doctorCard}>
              <div className={cardStyles.doctorImageContainer}>
                <img
                  src={item.image || getDoctorImage(item.doctor)}
                  alt={item.doctor}
                  className={cardStyles.image}
                  loading="lazy"
                  onError={(e) => handleImageError(e)}
                />
              </div>

              <h2 className={cardStyles.doctorName}>{item.doctor}</h2>

              <div className={cardStyles.specialization}>
                {item.specialization}{" "}
                {item.experience ? `• ${item.experience}` : ""}
              </div>

              <p className={cardStyles.dateContainer}>
                <CalendarDays className={iconSize.medium} /> {item.date}
              </p>

              <p className={cardStyles.timeContainer}>
                <Clock className={iconSize.medium} /> {item.time}
              </p>

              <div className={cardStyles.badgesContainer}>
                <PaymentBadge payment={item.payment} />
                <StatusBadge itemStatus={item.status} />
              </div>

              {/* Real-time OPD Live Queue Tracker */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="bg-gradient-to-r from-teal-50/70 to-emerald-50/70 rounded-xl p-3 border border-teal-200">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-extrabold text-teal-900 flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                      </span>
                      Live OPD Queue
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                      Token #{String(idx + 4).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[11px] text-gray-700 font-medium mb-2">
                    <div>Now Consulting: <strong className="text-gray-900 font-black">#03</strong></div>
                    <div>Ahead of you: <strong className="text-teal-700 font-black">{idx + 1} patient{idx > 0 ? "s" : ""}</strong></div>
                    <div>Wait Time: <strong className="text-amber-700 font-black">~{(idx + 1) * 15} mins</strong></div>
                    <div>Est. Turn: <strong className="text-gray-900 font-black">{item.time || "11:30 AM IST"}</strong></div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-[10px] text-amber-900 mb-2">
                    <strong>Smart Alert:</strong> Doctor is running 10 min behind schedule. Recommended arrival at clinic: <span className="font-bold underline">{item.time ? "10 min before " + item.time : "11:15 AM IST"}</span>
                  </div>

                  <Link
                    to="/live-opd"
                    className="block text-center text-[11px] font-bold text-teal-700 hover:text-teal-800 underline mt-1"
                  >
                    View Hospital Central Live OPD Monitor →
                  </Link>
                </div>
              </div>

              {item.status === "Rescheduled" && item.rescheduledTo ? (
                <div className={cardStyles.rescheduledText}>
                  Rescheduled to{" "}
                  <span className={cardStyles.rescheduledSpan}>
                    {item.rescheduledTo.date} : {item.rescheduledTo.time}
                  </span>
                </div>
              ) : null}
            </div>
          ))}
        </div>

        {/* ------------ SERVICE BOOKINGS ------------ */}
        <h2 className={appointmentPageStyles.serviceTitle}>
          Your Booked Services
        </h2>

        {loadingServices && (
          <div className={appointmentPageStyles.serviceLoadingText}>
            Loading service bookings...
          </div>
        )}

        {!loadingServices && serviceData.length === 0 && (
          <div className={appointmentPageStyles.serviceEmptyStateText}>
            No service bookings found.
          </div>
        )}

        <div className={appointmentPageStyles.serviceGrid}>
          {serviceData.map((srv) => (
            <div key={srv.id} className={cardStyles.serviceCard}>
              <div className={cardStyles.serviceImageContainer}>
                <img
                  src={srv.image || "/placeholder-service.png"}
                  alt={srv.name}
                  className={cardStyles.image}
                  loading="lazy"
                />
              </div>

              <h3 className={cardStyles.serviceName}>{srv.name}</h3>

              <p className={cardStyles.price}>₹{srv.price}</p>

              <p className={cardStyles.serviceDateContainer}>
                <CalendarDays className={iconSize.medium} /> {srv.date}
              </p>

              <p className={cardStyles.serviceTimeContainer}>
                <Clock className={iconSize.medium} /> {srv.time}
              </p>

              <div className={cardStyles.badgesContainer}>
                <PaymentBadge payment={srv.payment} />
                <StatusBadge itemStatus={srv.status} />
              </div>

              {srv.status === "Rescheduled" && srv.rescheduledTo ? (
                <div className={cardStyles.serviceRescheduledText}>
                  Rescheduled to{" "}
                  <span className={cardStyles.rescheduledSpan}>
                    {srv.rescheduledTo.date} : {srv.rescheduledTo.time}
                  </span>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
