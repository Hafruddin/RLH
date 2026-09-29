"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Zap, Radio, ArrowRight, Activity } from "lucide-react";
import AnimatedNavbar from "../Navbar/Navbar";
import logoImg from "../../assets/logo.png";
import { heroStyles } from "../../assets/dummyStyles";

export default function Hero({ role = "admin", userName = "Doctor" }) {
  const isDoctor = role === "doctor";

  return (
    <div className={heroStyles.container}>
      {/* Navbar */}
      <AnimatedNavbar />

      {/* Centered Hero */}
      <main className={heroStyles.mainContainer}>
        <section className={heroStyles.section}>
          {/* Soft decorative background */}
          <div className={heroStyles.decorativeBg.container}>
            <div className={heroStyles.decorativeBg.blurBackground}>
              <div className={heroStyles.decorativeBg.blurShape} />
            </div>

            <div className={heroStyles.contentBox}>
              {/* Image */}
              <div className={heroStyles.logoContainer}>
                <img
                  src={logoImg}
                  alt="Medtek"
                  className={heroStyles.logo}
                />
              </div>

              {/* Heading */}
              <h1 className={heroStyles.heading}>
                {isDoctor
                  ? `Welcome, Dr. ${userName}`
                  : "WELCOME TO MEDICARE ADMIN PANEL"}
              </h1>

              <p className={heroStyles.description}>
                {isDoctor
                  ? "Access your patient records, manage appointments, and review medical reports securely from your dashboard."
                  : "Manage hospital operations, doctors, staff, patient records, and system settings from a centralized control panel."}
              </p>

              {/* MediCare Nexus Hackathon Spotlight CTA */}
              <div className="my-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/nexus"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-emerald-900/30 transition-all transform hover:scale-105 active:scale-95 border border-emerald-400/40"
                >
                  <Activity className="w-5 h-5 text-emerald-200 animate-pulse" />
                  <span>Launch MediCare Nexus Command Center</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <Link
                  to="/nexus"
                  className="text-xs font-bold px-4 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-emerald-400 border border-slate-700 transition"
                >
                  Theme-1 PS-1: Autonomous Resource Orchestrator
                </Link>
              </div>

              {/* Info Cards */}
              <div className={heroStyles.infoCards.container}>
                <div className={heroStyles.infoCards.card}>
                  <h3 className={heroStyles.infoCards.cardTitle}>
                    Secure Access
                  </h3>
                  <p className={heroStyles.infoCards.cardText}>
                    Role-based login with protected medical data.
                  </p>
                </div>

                <div className={heroStyles.infoCards.card}>
                  <h3 className={heroStyles.infoCards.cardTitle}>
                    Real-time Management
                  </h3>
                  <p className={heroStyles.infoCards.cardText}>
                    Monitor hospital activity and patient flow.
                  </p>
                </div>

                <div className={heroStyles.infoCards.card}>
                  <h3 className={heroStyles.infoCards.cardTitle}>
                    Medical Dashboard
                  </h3>
                  <p className={heroStyles.infoCards.cardText}>
                    Clean, fast, and doctor-friendly interface.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}