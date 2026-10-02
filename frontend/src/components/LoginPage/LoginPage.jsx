import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import logo from "../../assets/logo.png";
import { ArrowLeft, Radio } from "lucide-react";
import { loginPageStyles, toastStyles } from "../../assets/dummyStyles";

const STORAGE_KEY = "doctorToken_v1";

export default function LoginPage({ apiBase }) {
  const API_BASE = apiBase || import.meta.env.VITE_API_URL || "http://localhost:4000";
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("All fields are required!", {
        style: toastStyles.errorToast,
      });
      return;
    }

    setBusy(true);
    try {
      // First try unified RBAC login endpoint
      let res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      let json = await res.json().catch(() => null);

      // Fallback to doctor login if unified auth fails
      if (!res.ok) {
        res = await fetch(`${API_BASE}/api/doctors/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        json = await res.json().catch(() => null);
      }

      if (!res.ok) {
        toast.error(json?.message || "Login failed", { duration: 4000 });
        setBusy(false);
        return;
      }

      /* ================= ROLE-BASED SESSION RESOLUTION ================= */
      const token = json?.token || json?.data?.token;
      const role = (json?.user?.role || json?.role || "DOCTOR").toUpperCase();
      const redirectUrl = json?.redirectUrl || (
        role === "PATIENT" ? "/patient/dashboard" :
        role === "DOCTOR" ? "/doctor/dashboard" :
        role === "STAFF" ? "/staff/dashboard" :
        "/admin/dashboard"
      );

      if (token) {
        localStorage.setItem("nexus_token", token);
        localStorage.setItem("nexus_role", role);
        localStorage.setItem(STORAGE_KEY, token);
        window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY, newValue: token }));
      }

      toast.success(`Signed in as ${role} — redirecting...`, {
        style: toastStyles.successToast,
      });

      // ✅ Navigate to strict role-based dashboard route
      setTimeout(() => {
        navigate(redirectUrl);
      }, 700);
    } catch (err) {
      console.error("login error", err);
      toast.error("Network error during login");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={loginPageStyles.mainContainer}>
      <Toaster position="top-right" reverseOrder={false} />

      <button
        onClick={() => navigate("/")}
        className={loginPageStyles.backButton}
      >
        <ArrowLeft className={loginPageStyles.backButtonIcon} />
        Back to Home
      </button>

      <div className={loginPageStyles.loginCard}>
        <div className={loginPageStyles.logoContainer}>
          <img src={logo} alt="Doctor Logo" className={loginPageStyles.logo} />
        </div>

        <h2 className={loginPageStyles.title}>Doctor Admin</h2>
        <p className={loginPageStyles.subtitle}>
          Sign in to manage your profile & schedule
        </p>

        <form onSubmit={handleLogin} className={loginPageStyles.form}>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className={loginPageStyles.input}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className={loginPageStyles.input}
            required
          />

          <button
            type="submit"
            disabled={busy}
            className={loginPageStyles.submitButton}
          >
            {busy ? "Signing in…" : "Login"}
          </button>
        </form>

        {/* Quick Demo Doctor Logins with Live Statuses */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-black text-gray-500 uppercase tracking-wider">
              ⚡ Multi-Role Hackathon Demo Portals
            </span>
            <Link
              to="/live-opd"
              className="text-xs font-bold text-teal-700 hover:text-teal-800 underline flex items-center gap-1"
            >
              <Radio className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
              View Live Queue
            </Link>
          </div>

          {/* 4 Portals Direct Access */}
          <div className="grid grid-cols-2 gap-2 text-xs mb-4">
            <button
              type="button"
              onClick={() => {
                localStorage.setItem("nexus_role", "PATIENT");
                navigate("/patient/dashboard");
              }}
              className="p-2.5 rounded-xl border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100 text-left transition-all cursor-pointer shadow-2xs"
            >
              <div className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                <span>👤 Patient Portal</span>
              </div>
              <div className="text-[10px] text-emerald-700">Harsh Tripathi · P-101</div>
            </button>

            <button
              type="button"
              onClick={() => {
                localStorage.setItem("nexus_role", "DOCTOR");
                navigate("/doctor/dashboard");
              }}
              className="p-2.5 rounded-xl border border-blue-300 bg-blue-50/70 hover:bg-blue-100 text-left transition-all cursor-pointer shadow-2xs"
            >
              <div className="font-extrabold text-blue-950 flex items-center gap-1.5">
                <span>👨‍⚕️ Doctor Workbench</span>
              </div>
              <div className="text-[10px] text-blue-700">Dr. Sarah Johnson · DOC-01</div>
            </button>

            <button
              type="button"
              onClick={() => {
                localStorage.setItem("nexus_role", "ADMIN");
                navigate("/admin/dashboard");
              }}
              className="p-2.5 rounded-xl border border-indigo-300 bg-indigo-50/70 hover:bg-indigo-100 text-left transition-all cursor-pointer shadow-2xs"
            >
              <div className="font-extrabold text-indigo-950 flex items-center gap-1.5">
                <span>🛡️ Hospital Admin</span>
              </div>
              <div className="text-[10px] text-indigo-700">Command Center · ADM-01</div>
            </button>

            <button
              type="button"
              onClick={() => {
                localStorage.setItem("nexus_role", "STAFF");
                navigate("/staff/dashboard");
              }}
              className="p-2.5 rounded-xl border border-teal-300 bg-teal-50/70 hover:bg-teal-100 text-left transition-all cursor-pointer shadow-2xs"
            >
              <div className="font-extrabold text-teal-950 flex items-center gap-1.5">
                <span>🩺 Staff & Services</span>
              </div>
              <div className="text-[10px] text-teal-700">Nurse Sarah Jenkins · N-07</div>
            </button>
          </div>

          <div className="text-[11px] font-black text-gray-500 uppercase tracking-wider mb-2">
            👨‍⚕️ Individual Doctor OPD Cabins (Live State)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => navigate("/doctor-admin/6a3820c82cecc9714b826111")}
              className="p-2.5 rounded-xl border border-gray-200 hover:border-emerald-300 bg-gray-50/70 hover:bg-emerald-50/50 text-left transition-all cursor-pointer flex items-center justify-between shadow-2xs"
            >
              <div>
                <div className="font-extrabold text-gray-900">Dr. Ananya Sharma</div>
                <div className="text-[11px] text-gray-500">Cardiology · Cabin 101</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800">
                🟢 Available
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/doctor-admin/6a3820c82cecc9714b826112")}
              className="p-2.5 rounded-xl border border-gray-200 hover:border-blue-300 bg-gray-50/70 hover:bg-blue-50/50 text-left transition-all cursor-pointer flex items-center justify-between shadow-2xs"
            >
              <div>
                <div className="font-extrabold text-gray-900">Dr. Suresh Reddy</div>
                <div className="text-[11px] text-gray-500">Neurology · Cabin 103</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-800">
                🔵 In Consultation
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/doctor-admin/6a3820c82cecc9714b826113")}
              className="p-2.5 rounded-xl border border-gray-200 hover:border-rose-300 bg-gray-50/70 hover:bg-rose-50/50 text-left transition-all cursor-pointer flex items-center justify-between shadow-2xs"
            >
              <div>
                <div className="font-extrabold text-gray-900">Dr. Vikram Hegde</div>
                <div className="text-[11px] text-gray-500">Cardiology ICU · Cabin 105</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800">
                🔴 Emergency
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/doctor-admin/doc-4")}
              className="p-2.5 rounded-xl border border-gray-200 hover:border-amber-300 bg-gray-50/70 hover:bg-amber-50/50 text-left transition-all cursor-pointer flex items-center justify-between shadow-2xs"
            >
              <div>
                <div className="font-extrabold text-gray-900">Dr. Aniket Roy</div>
                <div className="text-[11px] text-gray-500">Dermatology · Cabin 104</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800">
                🟠 Delayed (+10m)
              </span>
            </button>
          </div>

          <div className="mt-3.5 text-center">
            <Link
              to="/live-opd"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl text-xs font-black hover:from-teal-700 hover:to-emerald-700 shadow-2xs transition-all"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Open Hospital Central Live OPD Monitor</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
