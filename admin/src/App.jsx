import React from "react";
import { Routes, Route } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

// Import your pages
import Home from "./pages/Home/Home";
import Add from "./pages/Add/Add";
import List from "./pages/List/List";
import Appointments from "./pages/Appointments/Appointments";
import SerDashboard from "./pages/SerDashboard/SerDashboard";
import AddSer from "./pages/AddSer/AddSer";
import ListService from "./pages/ListService/ListService";
import ServiceAppointments from "./pages/ServiceAppointments/ServiceAppointments";
import Hero from "./components/Hero/Hero";
import NexusMasterLayout from "./components/Nexus/NexusMasterLayout";
import NexusVoiceAgent from "./components/Voice/NexusVoiceAgent";

function RequireAuth({ children }) {
  const { isLoaded, isSignedIn } = useUser();
  const clerk = useClerk();
  const [demoBypass, setDemoBypass] = React.useState(false);

  if (!isLoaded) return null; // prevent flicker
  if (isSignedIn || demoBypass) return children;

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-emerald-50 via-green-50 to-emerald-100 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-emerald-100 text-center animate-fade-in">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Admin Portal Authentication
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Sign in with Clerk to access hospital operations, appointments, and resource management.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => clerk.openSignIn()}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>🔐 Sign In with Clerk</span>
          </button>

          <button
            onClick={() => setDemoBypass(true)}
            className="w-full py-2.5 px-4 rounded-xl border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold text-sm transition-all cursor-pointer"
          >
            ⚡ Quick Demo Access (Bypass)
          </button>

          <Link
            to="/"
            className="block text-xs font-semibold text-gray-500 hover:text-gray-800 pt-2"
          >
            ← Return to Command Center
          </Link>
        </div>
      </div>
    </div>
  );
}

const App = () => {
  return (
    <>
      <Routes>
      <Route path="/" element={<NexusMasterLayout />} />
      <Route path="/hero" element={<Hero />} />
      <Route path="/nexus" element={<NexusMasterLayout />} />
      <Route
        path="/h"
        element={<NexusMasterLayout />}
      />
      <Route
        path="/add"
        element={
          <RequireAuth>
            <Add />
          </RequireAuth>
        }
      />
      <Route
        path="/list"
        element={
          <RequireAuth>
            <List />
          </RequireAuth>
        }
      />
      <Route
        path="/appointments"
        element={
          <RequireAuth>
            <Appointments />
          </RequireAuth>
        }
      />
      <Route
        path="/service-dashboard"
        element={
          <RequireAuth>
            <SerDashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/add-service"
        element={
          <RequireAuth>
            <AddSer />
          </RequireAuth>
        }
      />
      <Route
        path="/list-service"
        element={
          <RequireAuth>
            <ListService />
          </RequireAuth>
        }
      />
      <Route
        path="/service-appointments"
        element={
          <RequireAuth>
            <ServiceAppointments />
          </RequireAuth>
        }
      />
    </Routes>
    <NexusVoiceAgent />
  </>
  );
};

export default App;
