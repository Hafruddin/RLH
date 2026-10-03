// src/pages/DoctorDetail/DoctorDetail.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarCheck,
  MapPin,
  BadgeInfo,
  GraduationCap,
  Award,
  Clock,
  Star,
  Heart,
  Zap,
  Shield,
  Users,
  Phone,
  Radio,
  Eye,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LiveOpdModal from "../../components/LiveOpdModal/LiveOpdModal";
import { getDoctorOpdProfile, getStatusBadgeInfo } from "../../data/opdDemoData";
import { fallbackDoctors } from "../../utils/fallbackDoctors";
import { getDoctorImage, handleImageError } from "../../utils/doctorImages";
import {
  formatExperience,
  getAvailableSlots,
  getHospitalDateString,
  isPastDate,
} from "../../utils/dateTime";

// Clerk client hooks
import { useAuth, useUser } from "@clerk/clerk-react";
import { doctorDetailStyles } from "../../assets/dummyStyles";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

function getScheduleDates(schedule) {
  if (!schedule) return [];

  const keys =
    typeof schedule === "object" && !Array.isArray(schedule)
      ? Object.keys(schedule)
      : [];

  // Parse keys into Date objects (supporting YYYY-MM-DD and ISO)
  const parsed = keys
    .map((k) => {
      const d = new Date(k);
      if (!isNaN(d)) return { key: k, date: d };

      // fallback: try splitting YYYY-MM-DD
      const parts = k.split("-").map((n) => Number(n));
      if (parts.length >= 3) {
        const [y, m, day] = parts;
        const dd = new Date(y, m - 1, day);
        if (!isNaN(dd)) return { key: k, date: dd };
      }
      return null;
    })
    .filter(Boolean);

  // Use IST today string for comparison
  const todayStr = getHospitalDateString(); // "YYYY-MM-DD" in IST

  const past = parsed
    .filter((p) => p.key < todayStr)
    .sort((a, b) => (a.key > b.key ? -1 : 1)); // most recent past first

  const future = parsed
    .filter((p) => p.key >= todayStr)
    .sort((a, b) => (a.key < b.key ? -1 : 1)); // earliest first

  // Return array of Date objects in desired order
  return [...past, ...future].map((p) => p.date);
}

/**
 * Normalize phone string: remove non-digits and return up to last 10 digits.
 * Returns empty string if no digits.
 */
function normalizePhoneTo10(phone) {
  if (!phone) return "";
  const digits = ("" + phone).replace(/\D/g, "");
  if (!digits) return "";
  // prefer last 10 digits (common when country code present)
  return digits.length <= 10 ? digits : digits.slice(-10);
}

export default function DoctorDetail() {
  const { id } = useParams();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    mobile: "",
    gender: "",
    email: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [liveOpdSession, setLiveOpdSession] = useState(null);

  useEffect(() => {
    async function loadOpd() {
      try {
        const res = await fetch(`${API_BASE}/api/opd/doctor/${id}`);
        if (res.ok) {
          const json = await res.json();
          if (json?.data) setLiveOpdSession(json.data);
        }
      } catch (e) {}
    }
    loadOpd();
    const interval = setInterval(loadOpd, 4000);
    return () => clearInterval(interval);
  }, [id]);

  const opdProfile = useMemo(() => {
    const base = getDoctorOpdProfile(id, doctor?.name);
    if (liveOpdSession) {
      return {
        ...base,
        status: liveOpdSession.status || base.status,
        currentToken: liveOpdSession.currentToken || base.currentToken,
        waitingCount: liveOpdSession.waitingCount != null ? liveOpdSession.waitingCount : base.waitingCount,
        completedCount: liveOpdSession.completedCount != null ? liveOpdSession.completedCount : base.completedCount,
        delayMinutes: liveOpdSession.delayMinutes != null ? liveOpdSession.delayMinutes : base.delayMinutes,
        estTurn: liveOpdSession.estNextTurn || base.estTurn,
      };
    }
    return base;
  }, [id, doctor, liveOpdSession]);

  const opdStatusInfo = useMemo(() => {
    return getStatusBadgeInfo(opdProfile.status);
  }, [opdProfile.status]);

  // Clerk hooks
  const { getToken, isLoaded: authLoaded } = useAuth();
  const { isSignedIn, user, isLoaded: userLoaded } = useUser();
  const [userAppointments, setUserAppointments] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function fetchUserAppointments() {
      if (!isSignedIn) return;
      try {
        const token = await getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${API_BASE}/api/appointments/me`, { headers });
        if (res.ok) {
          const data = await res.json();
          const list = data?.appointments || data?.data || (Array.isArray(data) ? data : []);
          if (mounted && Array.isArray(list)) {
            setUserAppointments(list);
          }
        }
      } catch (e) {
        console.warn("Could not fetch user appointments:", e);
      }
    }
    fetchUserAppointments();
    return () => {
      mounted = false;
    };
  }, [isSignedIn, getToken]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Prefill the form fields quietly if user is available (no UI markup change)
  useEffect(() => {
    if (!userLoaded) return;
    if (user) {
      const fullName =
        user.fullName ||
        `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
        "";
      const rawPhone =
        user.primaryPhone ||
        (user.phoneNumbers && user.phoneNumbers.length > 0
          ? user.phoneNumbers[0]
          : "") ||
        "";
      const phone = normalizePhoneTo10(rawPhone);
      const email =
        (user.emailAddresses && user.emailAddresses[0]?.emailAddress) ||
        user.primaryEmailAddress ||
        "";

      setFormData((prev) => ({
        ...prev,
        name: prev.name || fullName,
        mobile: prev.mobile || phone,
        email: prev.email || email,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLoaded, user]);

  useEffect(() => {
    let mounted = true;
    async function fetchDoctor() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/doctors/${id}`);
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            body.message || `Failed to fetch (status ${res.status})`,
          );
        }
        const payload = await res.json();
        const doc = payload?.data || null;
        if (mounted) setDoctor(doc);
      } catch (err) {
        const found = fallbackDoctors.find(
          (d) => String(d.id) === String(id) || String(d._id) === String(id)
        );
        if (mounted) {
          if (found) {
            const schedule = {};
            const standardSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"];
            for (let i = 0; i < 7; i++) {
              const d = new Date();
              d.setDate(d.getDate() + i);
              const k = d.toISOString().split("T")[0];
              schedule[k] = standardSlots;
            }
            setDoctor({ ...found, schedule });
            setError(null);
          } else {
            setError(err.message || "Failed to fetch doctor");
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchDoctor();
    return () => {
      mounted = false;
    };
  }, [id]);

  const next7 = useMemo(() => getScheduleDates(doctor?.schedule), [doctor]);
  const fee = Number(doctor?.fee ?? doctor?.fees ?? 0);

  const selectedDateISO = useMemo(() => {
    if (!selectedDate) return "";
    return selectedDate.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
  }, [selectedDate]);

  const sameDayExistingAppointment = useMemo(() => {
    if (!selectedDateISO || !doctor) return null;
    const docIdStr = String(doctor._id || doctor.id || "").toLowerCase();
    const docNameStr = String(doctor.name || "").toLowerCase().trim();

    return userAppointments.find((a) => {
      if (!a || a.status === "Canceled") return false;

      let aDateStr = "";
      if (a.date) {
        if (typeof a.date === "string" && a.date.length === 10 && a.date.includes("-")) {
          aDateStr = a.date;
        } else {
          try {
            aDateStr = new Date(a.date).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
          } catch {
            aDateStr = String(a.date);
          }
        }
      }
      if (aDateStr !== selectedDateISO) return false;

      const aDocId = String(a.doctorId?._id || a.doctorId?.id || a.doctorId || "").toLowerCase();
      const aDocName = String(a.doctorName || a.doctor || a.doctorId?.name || "").toLowerCase().trim();

      const docIdMatch = docIdStr && aDocId && (aDocId === docIdStr);
      const docNameMatch = docNameStr && aDocName && (
        aDocName === docNameStr ||
        aDocName.includes(docNameStr) ||
        docNameStr.includes(aDocName)
      );

      return docIdMatch || docNameMatch;
    });
  }, [selectedDateISO, doctor, userAppointments]);

  const slots = useMemo(() => {
    if (!selectedDate || !doctor?.schedule) return [];
    const key = selectedDate.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    return getAvailableSlots(doctor.schedule, key);
  }, [selectedDate, doctor]);

  // Mobile input handlers: only digits, max 10
  const handleMobileChange = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, mobile: digits }));
  };

  const handleMobilePaste = (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData("text");
    const digits = pasted.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, mobile: digits }));
  };

  const handleBooking = async () => {
    if (isSubmitting) return;

    // Validate patient details
    if (
      !formData.name ||
      !formData.age ||
      !formData.mobile ||
      !formData.gender
    ) {
      toast.error("Please fill all patient details!", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    // Mobile must be exactly 10 digits
    const mobileDigits = (formData.mobile || "").replace(/\D/g, "");
    if (mobileDigits.length !== 10) {
      toast.error("Mobile number must be exactly 10 digits.", {
        position: "top-center",
        autoClose: 2500,
      });
      return;
    }

    if (!selectedDate || !selectedSlot) {
      toast.error("Please select a date and time slot", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    if (sameDayExistingAppointment) {
      toast.error(
        `You already have an appointment with this doctor on this day (at ${sameDayExistingAppointment.time || "scheduled slot"}). Patients cannot book multiple appointments on the same day for the same doctor.`,
        {
          position: "top-center",
          autoClose: 3500,
        }
      );
      return;
    }

    if (!authLoaded || !userLoaded) {
      toast.error("Authentication not ready. Please try again in a moment.", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    if (!isSignedIn) {
      toast.error("You must sign in to create an appointment.", {
        position: "top-center",
        autoClose: 2200,
      });
      return;
    }

    setIsSubmitting(true);

    const dateISO = selectedDate.toISOString().split("T")[0]; // YYYY-MM-DD

    // prefer fields from doctor object (this is only sent as a hint; backend will use DB)
    const doctorNameValue = doctor?.name || "";
    const specialityValue =
      doctor?.specialization ||
      doctor?.speciality ||
      doctor?.specialityName ||
      "";

    // optional owner from doctor object (backend will prefer doctor.owner)
    const ownerValue = doctor?.owner || undefined;

    const payload = {
      doctorId: doctor._id || doctor.id,
      doctorName: doctorNameValue,
      speciality: specialityValue,
      owner: ownerValue,
      // NEW: send image hints (optional — backend prefers DB but accepts these)
      doctorImageUrl: doctor?.imageUrl || doctor?.image || "",
      doctorImagePublicId:
        doctor?.imagePublicId || doctor?.image?.publicId || "",
      patientName: formData.name,
      mobile: mobileDigits,
      age: formData.age,
      gender: formData.gender,
      date: dateISO,
      time: selectedSlot,
      fee: fee,
      fees: fee,
      paymentMethod: paymentMethod || "Online",
      email: formData.email || undefined,
    };

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Failed to obtain authentication token.");
      }

      const res = await fetch(`${API_BASE}/api/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const body = await res.json().catch(() => null);
      if (!res.ok) {
        const message =
          body?.message || body?.error || `Booking failed (${res.status})`;
        toast.error(message, { position: "top-center" });
        setIsSubmitting(false);
        return;
      }

      // If checkoutUrl is returned -> redirect to Stripe Checkout
      if (body.checkoutUrl) {
        // redirect user to Stripe Checkout
        window.location.href = body.checkoutUrl;
        return;
      }

      // Booking created (Cash or free)
      toast.success("Booking successful", {
        position: "top-center",
        autoClose: 1500,
      });

      // navigate to appointments list (you can change this path)
      setTimeout(() => {
        window.location.href = "/appointments?payment_status=Pending";
      }, 700);
    } catch (err) {
      console.error("Booking error:", err);
      toast.error(
        err?.message || "Network error - booking failed (auth or server issue)",
        { position: "top-center" },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className={doctorDetailStyles.loadingContainer}>
        <div>Loading doctor...</div>
      </div>
    );

  if (error)
    return (
      <div className={doctorDetailStyles.errorContainer}>
        <div className={doctorDetailStyles.errorContent}>
          <div className={doctorDetailStyles.errorText}>Error</div>
          <div className={doctorDetailStyles.errorMessage}>{error}</div>
          <Link to="/doctors" className={doctorDetailStyles.backButton}>
            <ArrowLeft size={20} />
            Back to Doctors
          </Link>
        </div>
      </div>
    );

  if (!doctor)
    return (
      <div className={doctorDetailStyles.notFoundContainer}>
        <div className={doctorDetailStyles.notFoundContent}>
          <div className={doctorDetailStyles.notFoundEmoji}>😷</div>
          <h1 className={doctorDetailStyles.notFoundTitle}>Doctor Not Found</h1>
          <Link to="/doctors" className={doctorDetailStyles.backButton}>
            <ArrowLeft size={20} />
            Back to Doctors
          </Link>
        </div>
      </div>
    );

  return (
    <div className={doctorDetailStyles.pageContainer}>
      <ToastContainer />
      {/* Header */}
      <div className={doctorDetailStyles.headerContainer}>
        <div className={doctorDetailStyles.headerContent}>
          <div className={doctorDetailStyles.headerFlex}>
            <Link to="/doctors" className={doctorDetailStyles.headerBackButton}>
              <ArrowLeft size={18} />
              <span className={doctorDetailStyles.headerBackButtonText}>
                Back
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <h1 className={doctorDetailStyles.headerTitle}>Doctor Profile</h1>
            </div>

            <div className={doctorDetailStyles.headerRatingContainer}>
              <Star className={doctorDetailStyles.headerRatingIcon} size={18} />
              <span className={doctorDetailStyles.headerRatingText}>
                {doctor.rating}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`${doctorDetailStyles.mainContent} ${
          isVisible
            ? doctorDetailStyles.visibleState
            : doctorDetailStyles.hiddenState
        }`}
      >
        {/* profile card */}
        <div className={doctorDetailStyles.profileCard}>
          <div className={doctorDetailStyles.profileGrid}>
            <div className={doctorDetailStyles.leftColumn}>
              <div className={doctorDetailStyles.avatarContainer}>
                <div className={doctorDetailStyles.avatarGlow}></div>

                <img
                  src={getDoctorImage(doctor)}
                  alt={doctor.name}
                  className={doctorDetailStyles.avatarImage}
                  style={{ objectPosition: "center" }}
                  onError={(e) => handleImageError(e)}
                />
              </div>

              <div className={doctorDetailStyles.statsGrid}>
                <div className={doctorDetailStyles.statBox}>
                  <Award
                    className={`${doctorDetailStyles.statIcon} ${doctorDetailStyles.awardIcon}`}
                  />
                  <div className={doctorDetailStyles.statValue}>
                    {formatExperience(doctor.experience)}
                  </div>
                  <div className={doctorDetailStyles.statLabel}>Experience</div>
                </div>
                <div className={doctorDetailStyles.statBox}>
                  <Users
                    className={`${doctorDetailStyles.statIcon} ${doctorDetailStyles.usersIcon}`}
                  />
                  <div className={doctorDetailStyles.statValue}>
                    {doctor.patients}
                  </div>
                  <div className={doctorDetailStyles.statLabel}>Patients</div>
                </div>
              </div>
            </div>

            {/* RIGHT */}
            <div className={doctorDetailStyles.rightColumn}>
              <div className="space-y-3">
                <h1 className={doctorDetailStyles.doctorName}>{doctor.name}</h1>
                <div className={doctorDetailStyles.specializationBadge}>
                  <Zap className={doctorDetailStyles.badgeIcon} />
                  {doctor.specialization ||
                    doctor.speciality ||
                    doctor.specialization}
                </div>
              </div>

              <div className={doctorDetailStyles.infoGrid}>
                <div className={doctorDetailStyles.infoItem}>
                  <GraduationCap className={doctorDetailStyles.infoIcon} />
                  <div>
                    <div className={doctorDetailStyles.infoLabel}>
                      Qualifications
                    </div>
                    <div className={doctorDetailStyles.infoValue}>
                      {doctor.qualifications}
                    </div>
                  </div>
                </div>

                <div className={doctorDetailStyles.infoItem}>
                  <MapPin className={doctorDetailStyles.infoIcon} />
                  <div>
                    <div className={doctorDetailStyles.infoLabel}>Location</div>
                    <div className={doctorDetailStyles.infoValue}>
                      {doctor.location}
                    </div>
                  </div>
                </div>

                <div className={doctorDetailStyles.infoItem}>
                  <Clock className={doctorDetailStyles.infoIcon} />
                  <div>
                    <div className={doctorDetailStyles.infoLabel}>
                      Consultation Fee
                    </div>
                    <div className={doctorDetailStyles.feeValue}>₹{fee}</div>
                  </div>
                </div>

                <div className={doctorDetailStyles.infoItem}>
                  <Shield className={doctorDetailStyles.infoIcon} />
                  <div>
                    <div className={doctorDetailStyles.infoLabel}>
                      Availability
                    </div>
                    <div className={doctorDetailStyles.infoValue}>
                      {doctor.availability === "Available" || doctor.available
                        ? "Available"
                        : "Available Soon"}
                    </div>
                  </div>
                </div>
              </div>

              {/* LIVE OPD QUEUE WIDGET WITH ICON & VIEW LIVE QUEUE BUTTON */}
              <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-teal-50/90 via-emerald-50/70 to-blue-50/90 border border-teal-200/90 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                      <Radio className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-black text-teal-950 uppercase tracking-wider bg-teal-200/80 px-2 py-0.5 rounded">
                          Live OPD Status
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border flex items-center gap-1.5 ${opdStatusInfo.colorClass}`}>
                          <span className={`w-2 h-2 rounded-full ${opdStatusInfo.dotColor}`}></span>
                          {opdStatusInfo.badge}
                        </span>
                      </div>
                      <div className="text-xs text-gray-700 mt-1 font-medium flex flex-wrap items-center gap-x-3 gap-y-0.5">
                        <span>Current Token: <strong className="text-blue-900 font-extrabold">{opdProfile.currentToken}</strong></span>
                        <span>•</span>
                        <span>Waiting: <strong className="text-teal-900 font-extrabold">{opdProfile.waitingCount} patients</strong></span>
                        <span>•</span>
                        <span>Est. Wait: <strong className="text-amber-800 font-extrabold">{opdProfile.estWait}</strong></span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowQueueModal(true)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-extrabold shadow-sm transition-all shrink-0 cursor-pointer"
                  >
                    <Users className="w-4 h-4" />
                    <span>View Live Queue</span>
                  </button>
                </div>
              </div>

              <div className={doctorDetailStyles.aboutContainer}>
                <div className={doctorDetailStyles.aboutHeader}>
                  <BadgeInfo className={doctorDetailStyles.aboutIcon} />
                  <h3 className={doctorDetailStyles.aboutTitle}>
                    About Doctor
                  </h3>
                </div>
                <p className={doctorDetailStyles.aboutText}>
                  {doctor.about || doctor.bio}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* APPOINTMENT */}
        <div className={doctorDetailStyles.appointmentContainer}>
          <div className={doctorDetailStyles.appointmentContent}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 mb-2">
              <div className={doctorDetailStyles.appointmentHeader}>
                <CalendarCheck className={doctorDetailStyles.appointmentIcon} />
                <h2 className={doctorDetailStyles.appointmentTitle}>
                  Book Your Appointment
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowQueueModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 hover:bg-teal-100 text-teal-800 text-xs font-extrabold transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
              >
                <Radio className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
                <span>View Live Queue</span>
              </button>
            </div>

            <div className={doctorDetailStyles.appointmentGrid}>
              {/* LEFT COLUMN */}
              <div className={doctorDetailStyles.dateSection}>
                <h3 className={doctorDetailStyles.dateTitle}>
                  <CalendarCheck className={doctorDetailStyles.dateTitleIcon} />{" "}
                  Select Date
                </h3>

                <div className={doctorDetailStyles.dateScrollContainer}>
                  <div className={doctorDetailStyles.dateButtonsContainer}>
                    {next7.map((date) => {
                      const isSelected =
                        selectedDate?.toDateString() === date.toDateString();
                      return (
                        <button
                          key={date.toISOString()}
                          onClick={() => setSelectedDate(date)}
                          className={`${doctorDetailStyles.dateButton} ${
                            isSelected
                              ? doctorDetailStyles.dateButtonSelected
                              : doctorDetailStyles.dateButtonUnselected
                          }`}
                        >
                          <div className={doctorDetailStyles.dateContent}>
                            <div className={doctorDetailStyles.dateWeekday}>
                              {date.toLocaleDateString("en-US", {
                                weekday: "short",
                              })}
                            </div>
                            <div className={doctorDetailStyles.dateDay}>
                              {date.getDate()}
                            </div>
                            <div className={doctorDetailStyles.dateMonth}>
                              {date.toLocaleDateString("en-US", {
                                month: "short",
                              })}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* PATIENT FORM */}
                <div className={doctorDetailStyles.patientForm}>
                  <h3 className={doctorDetailStyles.patientFormTitle}>
                    Patient Details
                  </h3>

                  <div className={doctorDetailStyles.patientFormGrid}>
                    <input
                      type="text"
                      placeholder="Full Name"
                      className={doctorDetailStyles.formInput}
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />

                    <input
                      type="number"
                      placeholder="Age"
                      className={doctorDetailStyles.formInput}
                      value={formData.age}
                      onChange={(e) =>
                        setFormData({ ...formData, age: e.target.value })
                      }
                    />

                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="\d{10}"
                      maxLength={10}
                      placeholder="Mobile Number (10 digits)"
                      className={doctorDetailStyles.formInput}
                      value={formData.mobile}
                      onChange={(e) => handleMobileChange(e.target.value)}
                      onPaste={handleMobilePaste}
                    />

                    <select
                      className={doctorDetailStyles.formSelect}
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                    >
                      <option value="">Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>

                    <input
                      type="email"
                      placeholder="Email (optional - for receipts)"
                      className={doctorDetailStyles.emailInput}
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className={doctorDetailStyles.timeSlotsSection}>
                {sameDayExistingAppointment && (
                  <div className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5 shadow-2xs">
                    <div className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center shrink-0 font-bold mt-0.5">
                      !
                    </div>
                    <div className="space-y-1">
                      <div className="font-bold text-amber-950">
                        Appointment Already Booked on this Date
                      </div>
                      <p className="text-amber-800 leading-relaxed">
                        You already have an active appointment scheduled with <strong>{doctor?.name}</strong> on this date ({selectedDateISO}) at <strong>{sameDayExistingAppointment.time}</strong>. Hospital policy does not permit booking multiple appointments on the same day for the same doctor.
                      </p>
                    </div>
                  </div>
                )}

                <h3 className={doctorDetailStyles.timeSlotsTitle}>
                  <Clock className={doctorDetailStyles.timeSlotsIcon} />{" "}
                  Available Time Slots
                </h3>

                <div className={doctorDetailStyles.timeSlotsContainer}>
                  {slots.length === 0 && (
                    <p className={doctorDetailStyles.noSlotsMessage}>
                      No time slots for this date.
                    </p>
                  )}

                  {slots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`${doctorDetailStyles.timeSlotButton} ${
                        selectedSlot === slot
                          ? doctorDetailStyles.timeSlotButtonSelected
                          : doctorDetailStyles.timeSlotButtonUnselected
                      }`}
                    >
                      <div className={doctorDetailStyles.timeSlotContent}>
                        <Clock className={doctorDetailStyles.timeSlotIcon} />
                        <span>{slot}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* SUMMARY */}
                <div className={doctorDetailStyles.summaryContainer}>
                  <div className={doctorDetailStyles.summaryItem}>
                    <div className={doctorDetailStyles.summaryRow}>
                      <span className={doctorDetailStyles.summaryLabel}>
                        Selected Doctor:
                      </span>
                      <span className={doctorDetailStyles.summaryValue}>
                        {doctor?.name || "—"}
                      </span>
                    </div>

                    <div className={doctorDetailStyles.summaryRow}>
                      <span className={doctorDetailStyles.summaryLabel}>
                        Doctor Speciality:
                      </span>
                      <span className={doctorDetailStyles.summaryValue}>
                        {doctor?.specialization || doctor?.speciality || "—"}
                      </span>
                    </div>

                    <div className={doctorDetailStyles.summaryRow}>
                      <span className={doctorDetailStyles.summaryLabel}>
                        Selected Date:
                      </span>
                      <span className={doctorDetailStyles.summaryValue}>
                        {selectedDate
                          ? selectedDate.toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "Not selected"}
                      </span>
                    </div>

                    <div className={doctorDetailStyles.summaryRow}>
                      <span className={doctorDetailStyles.summaryLabel}>
                        Selected Time:
                      </span>
                      <span className={doctorDetailStyles.summaryValue}>
                        {selectedSlot || "Not selected"}
                      </span>
                    </div>

                    <div className={doctorDetailStyles.summaryRow}>
                      <span className={doctorDetailStyles.summaryLabel}>
                        Consultation Fee:
                      </span>
                      <span className={doctorDetailStyles.feeDisplay}>
                        ₹{fee}
                      </span>
                    </div>
                  </div>

                  {/* PAYMENT METHOD SELECTOR */}
                  <div className={doctorDetailStyles.paymentContainer}>
                    <label className={doctorDetailStyles.paymentLabel}>
                      Payment:
                    </label>
                    <div className={doctorDetailStyles.paymentOptions}>
                      <label
                        className={`${doctorDetailStyles.paymentOption} ${
                          paymentMethod === "Cash"
                            ? doctorDetailStyles.paymentOptionSelected
                            : doctorDetailStyles.paymentOptionUnselected
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value="Cash"
                          checked={paymentMethod === "Cash"}
                          onChange={() => setPaymentMethod("Cash")}
                          className={doctorDetailStyles.paymentRadio}
                        />
                        Cash
                      </label>
                      <label
                        className={`${doctorDetailStyles.paymentOption} ${
                          paymentMethod === "Online"
                            ? doctorDetailStyles.paymentOptionSelected
                            : doctorDetailStyles.paymentOptionUnselected
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value="Online"
                          checked={paymentMethod === "Online"}
                          onChange={() => setPaymentMethod("Online")}
                          className={doctorDetailStyles.paymentRadio}
                        />
                        Online
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleBooking}
                    disabled={!selectedDate || !selectedSlot || isSubmitting || Boolean(sameDayExistingAppointment)}
                    className={`${doctorDetailStyles.bookingButton} ${
                      !selectedDate || !selectedSlot || isSubmitting || Boolean(sameDayExistingAppointment)
                        ? doctorDetailStyles.bookingButtonDisabled
                        : doctorDetailStyles.bookingButtonEnabled
                    }`}
                  >
                    <div className={doctorDetailStyles.bookingButtonContent}>
                      <Phone className={doctorDetailStyles.bookingIcon} />
                      <span>
                        {sameDayExistingAppointment
                          ? "Already Booked for this Day"
                          : isSubmitting
                          ? "Booking..."
                          : "Confirm Booking"}
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LiveOpdModal
        isOpen={showQueueModal}
        onClose={() => setShowQueueModal(false)}
        doctorProfile={opdProfile}
      />
    </div>
  );
}
