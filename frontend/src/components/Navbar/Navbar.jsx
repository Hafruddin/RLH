"use client";

import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { Menu, X, Stethoscope, ShieldCheck, Key } from "lucide-react";

// Clerk
import { SignedIn, SignedOut, useClerk, UserButton } from "@clerk/clerk-react";
import { navbarStyles } from "../../assets/dummyStyles";

const STORAGE_KEY = "doctorToken_v1";
const rawAdminUrl = import.meta.env.VITE_ADMIN_URL;
// Only consider admin URL external if set and not pointing to localhost/127.0.0.1
const isExternalAdmin = Boolean(
  rawAdminUrl &&
  !rawAdminUrl.includes("localhost") &&
  !rawAdminUrl.includes("127.0.0.1")
);
const ADMIN_URL = isExternalAdmin ? rawAdminUrl : "/doctor-admin/login";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isDoctorLoggedIn, setIsDoctorLoggedIn] = useState(() => {
    try {
      return Boolean(localStorage.getItem(STORAGE_KEY));
    } catch {
      return false;
    }
  });

  const location = useLocation();
  const navRef = useRef(null);
  const clerk = useClerk();
  const navigate = useNavigate();

  /* Hide / show navbar on scroll */
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  /* Sync doctor login state */
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        setIsDoctorLoggedIn(Boolean(e.newValue));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  /* Close mobile menu on outside click */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && navRef.current && !navRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Doctors", href: "/doctors" },
    { label: "Services", href: "/services" },
    { label: "Appointments", href: "/appointments" },
    { label: "Contact", href: "/contact" },
  ];

  function doctorLogout() {
    localStorage.removeItem(STORAGE_KEY);
    setIsDoctorLoggedIn(false);
    navigate("/");
  }

  return (
    <>
      <div className={navbarStyles.navbarBorder} />

      <nav
        ref={navRef}
        className={`${navbarStyles.navbarContainer} ${
          showNavbar ? navbarStyles.navbarVisible : navbarStyles.navbarHidden
        }`}
      >
        <div className={navbarStyles.contentWrapper}>
          <div className={navbarStyles.flexContainer}>
            {/* Logo */}
            <Link to="/" className={navbarStyles.logoLink}>
              <div className={navbarStyles.logoContainer}>
                <div className={navbarStyles.logoImageWrapper}>
                  <img
                    src={logo}
                    alt="MedBook logo"
                    className={navbarStyles.logoImage}
                  />
                </div>
              </div>
              <div className={navbarStyles.logoTextContainer}>
                <h1 className={navbarStyles.logoTitle}>
                  MediCare <span className="text-emerald-500 font-bold">Nexus</span>
                </h1>
                <p className={navbarStyles.logoSubtitle}>
                  Autonomous Hospital Operations
                </p>
              </div>
            </Link>

            {/* Desktop navigation */}
            <div className={navbarStyles.desktopNav}>
              <div className={navbarStyles.navItemsContainer}>
                {navItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`${navbarStyles.navItem} ${
                        isActive
                          ? navbarStyles.navItemActive
                          : navbarStyles.navItemInactive
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right side */}
            <div className={navbarStyles.rightContainer}>
              {/* 1. Doctor Login */}
              <Link
                to="/doctor-admin/login"
                className={navbarStyles.doctorButton}
                title="Doctor Login Portal"
              >
                <Stethoscope className={navbarStyles.doctorIcon} />
                <span className={navbarStyles.doctorText}>Doctor</span>
              </Link>

              {/* 2. Admin Command Center */}
              <Link
                to="/admin"
                className={navbarStyles.adminButton}
                title="MediCare Nexus Command Center"
              >
                <ShieldCheck className={navbarStyles.adminIcon} />
                <span className={navbarStyles.adminText}>Admin</span>
              </Link>

              {/* 3. Patient / User Login */}
              <SignedOut>
                <button
                  onClick={() => clerk.openSignIn()}
                  className={navbarStyles.loginButton}
                  title="Patient / User Login"
                >
                  <Key className={navbarStyles.loginIcon} />
                  <span className={navbarStyles.loginText}>Login</span>
                </button>
              </SignedOut>

              {/* Patient Logged In */}
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>

              {/* Mobile/Tablet toggle */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={navbarStyles.mobileToggle}
                aria-expanded={isOpen}
                aria-label="Open menu"
              >
                {isOpen ? (
                  <X className={navbarStyles.toggleIcon} />
                ) : (
                  <Menu className={navbarStyles.toggleIcon} />
                )}
              </button>
            </div>
          </div>

          {/* Mobile/Tablet menu */}
          {isOpen && (
            <div className={navbarStyles.mobileMenu}>
              {navItems.map((item, idx) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={idx}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`${navbarStyles.mobileMenuItem} ${
                      isActive
                        ? navbarStyles.mobileMenuItemActive
                        : navbarStyles.mobileMenuItemInactive
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {/* 3 Logins in mobile menu */}
              <div className="pt-3 border-t border-emerald-100 space-y-2">
                <Link
                  to="/doctor-admin/login"
                  onClick={() => setIsOpen(false)}
                  className={navbarStyles.mobileDoctorButton}
                >
                  <Stethoscope className="w-4 h-4 text-emerald-600" />
                  <span>Doctor Login</span>
                </Link>

                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className={navbarStyles.mobileAdminButton}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Admin Command Center</span>
                </Link>

                <SignedOut>
                  <div className={navbarStyles.mobileLoginContainer}>
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        clerk.openSignIn();
                      }}
                      className={navbarStyles.mobileLoginButton}
                    >
                      <Key className="w-4 h-4 text-white" />
                      <span>User Login</span>
                    </button>
                  </div>
                </SignedOut>

                <SignedIn>
                  <div className="flex justify-center pt-2">
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </SignedIn>
              </div>
            </div>
          )}
        </div>
        {/* Animations */}
        <style>{navbarStyles.animationStyles}</style>
      </nav>
    </>
  );
}