import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Medal,
  ChevronsRight,
  MousePointer2Off,
  Search,
  CircleChevronUp,
  CircleChevronDown,
  X,
  Radio,
} from "lucide-react";
import { doctorsPageStyles } from "../../assets/dummyStyles";
import { fallbackDoctors } from "../../utils/fallbackDoctors";
import { getDoctorImage, handleImageError } from "../../utils/doctorImages";
import { formatExperience } from "../../utils/dateTime";
import { getDoctorOpdProfile, getStatusBadgeInfo } from "../../data/opdDemoData";
import LiveOpdModal from "../LiveOpdModal/LiveOpdModal";

const DoctorsPage = ({ apiBase }) => {
  const API_BASE = apiBase || import.meta.env.VITE_API_URL || "http://localhost:4000";

  const [allDoctors, setAllDoctors] = useState(fallbackDoctors);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [selectedQueueDoctor, setSelectedQueueDoctor] = useState(null);
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  const openQueue = (e, doc) => {
    e.preventDefault();
    e.stopPropagation();
    const prof = getDoctorOpdProfile(doc.id, doc.name);
    setSelectedQueueDoctor(prof);
    setIsQueueOpen(true);
  };

  // Load doctors once
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/doctors`);
        const json = await res.json().catch(() => null);

        if (!res.ok) {
          if (mounted) {
            setAllDoctors(fallbackDoctors);
          }
          return;
        }

        const items = (json && (json.data || json)) || [];
        if (!Array.isArray(items) || items.length === 0) {
          if (mounted) {
            setAllDoctors(fallbackDoctors);
          }
          return;
        }

        const normalized = items.map((d) => {
          const id = d._id || d.id;
          const image = getDoctorImage(d);
          // availability may be a string or boolean; normalize to boolean
          let available = true;
          if (typeof d.availability === "string") {
            available = d.availability.toLowerCase() === "available";
          } else if (typeof d.available === "boolean") {
            available = d.available;
          } else if (typeof d.availability === "boolean") {
            available = d.availability;
          } else {
            available = d.availability === "Available" || d.available === true;
          }
          return {
            id,
            name: d.name || "Unknown",
            specialization: d.specialization || "",
            image,
            experience:
              (d.experience ?? d.experience === 0) ? String(d.experience) : "—",
            fee: d.fee ?? d.price ?? 0,
            available,
            raw: d,
          };
        });

        if (mounted) {
          setAllDoctors(normalized);
          setError("");
        }
      } catch (err) {
        console.warn("load doctors error, using fallback:", err);
        if (mounted) {
          setAllDoctors(fallbackDoctors);
          setError("");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [API_BASE]);

  // Derived filtered list (memoized)
  const filteredDoctors = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return allDoctors;
    return allDoctors.filter(
      (doctor) =>
        (doctor.name || "").toLowerCase().includes(q) ||
        (doctor.specialization || "").toLowerCase().includes(q),
    );
  }, [allDoctors, searchTerm]);

  const displayedDoctors = showAll
    ? filteredDoctors
    : filteredDoctors.slice(0, 8);

  // Retry load
  const retry = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/doctors`);
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setError((json && json.message) || `Failed to load (${res.status})`);
        setAllDoctors([]);
        return;
      }
      const items = (json && (json.data || json)) || [];
      const normalized = (Array.isArray(items) ? items : []).map((d) => {
        const id = d._id || d.id;
        const image = d.imageUrl || d.image || "";
        let available = true;
        if (typeof d.availability === "string") {
          available = d.availability.toLowerCase() === "available";
        } else if (typeof d.available === "boolean") {
          available = d.available;
        } else {
          available = d.availability === "Available" || d.available === true;
        }
        return {
          id,
          name: d.name || "Unknown",
          specialization: d.specialization || "",
          image,
          experience: d.experience ?? "—",
          fee: d.fee ?? d.price ?? 0,
          available,
          raw: d,
        };
      });
      setAllDoctors(normalized);
      setError("");
    } catch (e) {
      console.error(e);
      setError("Network error while loading doctors.");
      setAllDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={doctorsPageStyles.mainContainer}>
      {/* Background shapes */}
      <div className={doctorsPageStyles.backgroundShape1}></div>
      <div className={doctorsPageStyles.backgroundShape2}></div>

      <div className={doctorsPageStyles.wrapper}>
        {/* Header */}
        <div className={doctorsPageStyles.headerContainer}>
          <h1 className={doctorsPageStyles.headerTitle}>Our Medical Experts</h1>
          <p className={doctorsPageStyles.headerSubtitle}>
            Find your ideal doctor by name or specialization
          </p>
        </div>

        {/* Search Bar */}
        <div className={doctorsPageStyles.searchContainer}>
          <div className={doctorsPageStyles.searchWrapper}>
            <input
              type="text"
              placeholder=" Search doctors by name or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={doctorsPageStyles.searchInput}
              aria-label="Search doctors"
            />

            <Search className={doctorsPageStyles.searchIcon} />

            {searchTerm.length > 0 && (
              <button
                onClick={() => setSearchTerm("")}
                className={doctorsPageStyles.clearButton}
                aria-label="Clear search"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        {/* Error area */}
        {error && (
          <div className={doctorsPageStyles.errorContainer}>
            <div className={doctorsPageStyles.errorText}>{error}</div>
            <div className="flex items-center justify-center gap-3">
              <button onClick={retry} className={doctorsPageStyles.retryButton}>
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Doctors Grid */}
        {loading ? (
          <div className={doctorsPageStyles.skeletonGrid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={doctorsPageStyles.skeletonCard}>
                <div className={doctorsPageStyles.skeletonImage} />
                <div className={doctorsPageStyles.skeletonName} />
                <div className={doctorsPageStyles.skeletonSpecialization} />
                <div className={doctorsPageStyles.skeletonButton} />
              </div>
            ))}
          </div>
        ) : (
          <div
            className={`${doctorsPageStyles.doctorsGrid} ${
              filteredDoctors.length === 0 ? "opacity-70" : "opacity-100"
            }`}
          >
            {displayedDoctors.length > 0 ? (
              displayedDoctors.map((doctor, index) => (
                <div
                  key={doctor.id || `${doctor.name}-${index}`}
                  className={`${doctorsPageStyles.doctorCard} ${
                    !doctor.available
                      ? doctorsPageStyles.doctorCardUnavailable
                      : ""
                  }`}
                  style={{ animationDelay: `${index * 90}ms` }}
                  role="article"
                  aria-label={`${doctor.name} profile`}
                >
                  {doctor.available ? (
                    <Link
                      to={`/doctors/${doctor.id}`}
                      state={{ doctor: doctor.raw || doctor }}
                      className={doctorsPageStyles.focusRing}
                    >
                      <div className={doctorsPageStyles.imageContainer}>
                        <img
                          src={doctor.image || getDoctorImage(doctor)}
                          alt={doctor.name}
                          loading="lazy"
                          className={doctorsPageStyles.doctorImage}
                          onError={(e) => handleImageError(e)}
                        />
                      </div>
                    </Link>
                  ) : (
                    <div
                      className={`${doctorsPageStyles.imageContainer} ${doctorsPageStyles.imageContainerUnavailable}`}
                    >
                      <img
                        src={doctor.image || getDoctorImage(doctor)}
                        alt={doctor.name}
                        loading="lazy"
                        className={doctorsPageStyles.doctorImageUnavailable}
                        onError={(e) => handleImageError(e)}
                      />
                    </div>
                  )}

                  <h3 className={doctorsPageStyles.doctorName}>
                    {doctor.name}
                  </h3>

                  <p className={doctorsPageStyles.doctorSpecialization}>
                    {doctor.specialization}
                  </p>

                  <div className={doctorsPageStyles.experienceBadge}>
                    <Medal className={doctorsPageStyles.experienceIcon} />
                    <span>{formatExperience(doctor.experience)}</span>
                  </div>

                  {/* Realtime OPD Live Queue Status Badge */}
                  {(() => {
                    const prof = getDoctorOpdProfile(doctor.id, doctor.name);
                    const statusInfo = getStatusBadgeInfo(prof.status);
                    return (
                      <div className="my-2 flex items-center justify-between gap-1 w-full px-1">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black border ${statusInfo.colorClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotColor}`}></span>
                          {statusInfo.badge}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          Now: {prof.currentToken}
                        </span>
                      </div>
                    );
                  })()}

                  <div className="flex items-center gap-2 w-full mt-2">
                    {doctor.available ? (
                      <Link
                        to={`/doctors/${doctor.id}`}
                        state={{ doctor: doctor.raw || doctor }}
                        className={`${doctorsPageStyles.bookButton} flex-1`}
                        aria-label={`Book appointment with ${doctor.name}`}
                      >
                        <ChevronsRight
                          className={doctorsPageStyles.bookButtonIcon}
                        />
                        Book Now
                      </Link>
                    ) : (
                      <button
                        disabled
                        className={`${doctorsPageStyles.notAvailableButton} flex-1`}
                        aria-label={`${doctor.name} not available`}
                      >
                        <MousePointer2Off
                          className={doctorsPageStyles.notAvailableIcon}
                        />
                        Not Available
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => openQueue(e, doctor)}
                      className="px-2.5 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs hover:shadow"
                      title="View Live OPD Queue"
                    >
                      <Radio size={14} className="text-teal-600 animate-pulse" />
                      <span className="hidden sm:inline">Live Queue</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className={doctorsPageStyles.noResults}>
                No doctors found matching your search criteria.
              </div>
            )}
          </div>
        )}

        {/* Show More / Hide Button */}
        {filteredDoctors.length > 8 && (
          <div className={doctorsPageStyles.showMoreContainer}>
            <button
              onClick={() => setShowAll(!showAll)}
              className={doctorsPageStyles.showMoreButton}
              aria-expanded={showAll}
            >
              {showAll ? (
                <>
                  <CircleChevronUp className={doctorsPageStyles.showMoreIcon} />
                  Hide
                </>
              ) : (
                <>
                  <CircleChevronDown
                    className={doctorsPageStyles.showMoreIcon}
                  />
                  Show More
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Animations - Keep inline style tag as it is */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.9s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.9s ease-out both; }
        .animate-slide-up { animation: slide-up 0.8s ease-out; }

        @media (max-width: 420px) {
          .max-w-7xl { padding-left: 10px; padding-right: 10px; }
        }

        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>

      {/* Live OPD Queue Modal */}
      <LiveOpdModal
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        doctorProfile={selectedQueueDoctor}
      />
    </div>
  );
};

export default DoctorsPage;
