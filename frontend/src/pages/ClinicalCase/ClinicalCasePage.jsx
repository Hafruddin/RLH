// frontend/src/pages/ClinicalCase/ClinicalCasePage.jsx
import React from "react";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import ClinicalCaseTakingView from "../../components/Nexus/ClinicalCaseTakingView";

export default function ClinicalCasePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <ClinicalCaseTakingView />
      </main>

      <Footer />
    </div>
  );
}
