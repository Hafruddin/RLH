// frontend/src/components/Nexus/HospitalRevenueView.jsx
// Hospital Revenue & Financial Operations: Total Revenue, Inpatient/Outpatient Inflows, Insurance TPA, and Live Ledger

import React, { useState, useMemo } from "react";
import {
  IndianRupee,
  TrendingUp,
  CreditCard,
  Landmark,
  ArrowUpRight,
  ShieldCheck,
  Search,
  Download,
  Printer,
  Plus,
  RefreshCw,
  Building2,
  Activity,
  Bed,
  Stethoscope,
  Microscope,
  Pill,
  CheckCircle2,
  Clock,
  Filter,
  Sparkles
} from "lucide-react";

// Pre-loaded realistic demo transactions
const INITIAL_TRANSACTIONS = [
  {
    id: "TXN-2026-9042",
    patientName: "Harsh Tripathi",
    patientId: "P-101",
    department: "Cardiology (ICU Telemetry)",
    category: "Inpatient / ICU",
    amount: 84500,
    paymentMode: "Star Health Insurance TPA",
    status: "Settled",
    time: "8 mins ago",
    date: "2026-10-03 18:22"
  },
  {
    id: "TXN-2026-9041",
    patientName: "Sunita Deshmukh",
    patientId: "P-104",
    department: "Emergency Trauma & Resuscitation",
    category: "Emergency & OT",
    amount: 165000,
    paymentMode: "Ayushman Bharat (AB-PMJAY)",
    status: "Approved",
    time: "25 mins ago",
    date: "2026-10-03 18:05"
  },
  {
    id: "TXN-2026-9040",
    patientName: "Elena Rostova",
    patientId: "P-102",
    department: "Orthopedic Joint Arthroplasty (OT-02)",
    category: "Surgeries & OT",
    amount: 125000,
    paymentMode: "HDFC ERGO Cashless",
    status: "Settled",
    time: "1 hour ago",
    date: "2026-10-03 17:30"
  },
  {
    id: "TXN-2026-9039",
    patientName: "Vikramaditya Rao",
    patientId: "P-105",
    department: "Radiology (Brain MRI & Contrast)",
    category: "Diagnostics",
    amount: 11500,
    paymentMode: "Credit Card (POS Desk)",
    status: "Settled",
    time: "2 hours ago",
    date: "2026-10-03 16:15"
  },
  {
    id: "TXN-2026-9038",
    patientName: "Devansh Mehra",
    patientId: "P-103",
    department: "Pulmonology Speciality OPD",
    category: "Outpatient (OPD)",
    amount: 2800,
    paymentMode: "UPI / PhonePe",
    status: "Settled",
    time: "3 hours ago",
    date: "2026-10-03 15:40"
  },
  {
    id: "TXN-2026-9037",
    patientName: "Ananya Sen",
    patientId: "P-106",
    department: "Laparoscopic Surgery (OT-03)",
    category: "Surgeries & OT",
    amount: 78000,
    paymentMode: "ICICI Lombard Health",
    status: "Settled",
    time: "4 hours ago",
    date: "2026-10-03 14:10"
  },
  {
    id: "TXN-2026-9036",
    patientName: "Mohammad Qureshi",
    patientId: "P-107",
    department: "Central 24/7 Pharmacy Dispensation",
    category: "Pharmacy",
    amount: 14200,
    paymentMode: "Debit Card",
    status: "Settled",
    time: "5 hours ago",
    date: "2026-10-03 13:25"
  },
  {
    id: "TXN-2026-9035",
    patientName: "Priya Nambiar",
    patientId: "P-108",
    department: "Pathology (CBC & Lipid Profile)",
    category: "Diagnostics",
    amount: 3400,
    paymentMode: "Google Pay / UPI",
    status: "Settled",
    time: "6 hours ago",
    date: "2026-10-03 12:05"
  },
  {
    id: "TXN-2026-9034",
    patientName: "Gurpreet Singh",
    patientId: "P-109",
    department: "Nephrology Dialysis Suite",
    category: "Inpatient / ICU",
    amount: 4500,
    paymentMode: "Cashless TPA",
    status: "Settled",
    time: "7 hours ago",
    date: "2026-10-03 11:30"
  },
  {
    id: "TXN-2026-9033",
    patientName: "Kavita Pillai",
    patientId: "P-110",
    department: "Pediatric Ward Bed (4 Days)",
    category: "Inpatient / ICU",
    amount: 42000,
    paymentMode: "Care Health Insurance",
    status: "Settled",
    time: "Today 10:15",
    date: "2026-10-03 10:15"
  }
];

export default function HospitalRevenueView() {
  const [timeRange, setTimeRange] = useState("Month"); // "Today" | "Week" | "Month" | "Quarter" | "YTD"
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  // Base revenue calculations with dynamic range multipliers
  const rangeMultiplier = useMemo(() => {
    switch (timeRange) {
      case "Today": return 0.035;
      case "Week": return 0.22;
      case "Month": return 1.0;
      case "Quarter": return 2.85;
      case "YTD": return 11.2;
      default: return 1.0;
    }
  }, [timeRange]);

  // Aggregate Totals based on multiplier
  const totalRevenue = Math.round(48290450 * rangeMultiplier);
  const todayInflow = 1485600;
  const ipdRevenue = Math.round(19840000 * rangeMultiplier);
  const otRevenue = Math.round(12465000 * rangeMultiplier);
  const opdRevenue = Math.round(6840000 * rangeMultiplier);
  const diagnosticsRevenue = Math.round(5420000 * rangeMultiplier);
  const pharmacyRevenue = Math.round(3725450 * rangeMultiplier);
  const tpaClaimsSettled = Math.round(29420000 * rangeMultiplier);
  const pendingReceivables = Math.round(3245000 * rangeMultiplier);

  // Formatter for INR Currency
  const formatINR = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchSearch =
        t.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.paymentMode.toLowerCase().includes(searchTerm.toLowerCase());

      const matchCategory = categoryFilter === "All" || t.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [transactions, searchTerm, categoryFilter]);

  // Simulate an incoming patient payment
  const handleSimulatePayment = () => {
    const demoPatients = [
      { name: "Rahul Saraf", id: "P-112", dept: "Cardiology Consult & Echo", cat: "Outpatient (OPD)", amt: 4500, mode: "UPI" },
      { name: "Meena Swaminathan", id: "P-113", dept: "ICU Isolation Bed Day 2", cat: "Inpatient / ICU", amt: 52000, mode: "Star Health TPA" },
      { name: "Kunal Bansal", id: "P-114", dept: "Emergency Stent Angioplasty", cat: "Surgeries & OT", amt: 185000, mode: "Cashless Insurance" },
      { name: "Deepika Joshi", id: "P-115", dept: "MRI Lumbar Spine", cat: "Diagnostics", amt: 9800, mode: "Credit Card" }
    ];
    const picked = demoPatients[Math.floor(Math.random() * demoPatients.length)];
    const newTxn = {
      id: `TXN-2026-${Math.floor(9043 + Math.random() * 500)}`,
      patientName: picked.name,
      patientId: picked.id,
      department: picked.dept,
      category: picked.cat,
      amount: picked.amt,
      paymentMode: picked.mode,
      status: "Settled",
      time: "Just now",
      date: new Date().toLocaleString()
    };

    setTransactions(prev => [newTxn, ...prev]);
    showToast(`✓ Received ${formatINR(picked.amt)} payment from ${picked.name} (${picked.dept})`);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Transaction ID", "Patient Name", "Patient ID", "Department", "Category", "Amount (INR)", "Payment Mode", "Status", "Date"];
    const rows = transactions.map(t => [
      t.id,
      `"${t.patientName}"`,
      t.patientId,
      `"${t.department}"`,
      `"${t.category}"`,
      t.amount,
      `"${t.paymentMode}"`,
      t.status,
      `"${t.date}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Hospital_Revenue_Ledger_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("✓ Financial ledger exported as CSV");
  };

  return (
    <div className="space-y-6 animate-scale-in">
      {/* Toast feedback */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toast}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. TOP EXECUTIVE HEADER
      ────────────────────────────────────────────────────────────── */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Hospital Financial Intelligence
              </span>
              <span className="text-xs text-slate-400">· Cashflow & Insurance Settlement Engine</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <Landmark className="w-8 h-8 text-emerald-400" />
              Hospital Revenue & Collections
            </h2>
            <p className="text-xs text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
              Real-time audit of total monies received across Inpatient Beds, Surgical Operating Suites, Outpatient Specialities, Diagnostics, and TPA Insurance Claims.
            </p>
          </div>

          {/* Time Filter Controls & Live Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-slate-800/90 p-1 rounded-2xl border border-slate-700 flex items-center gap-1 text-xs font-bold">
              {["Today", "Week", "Month", "Quarter", "YTD"].map(r => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                    timeRange === r
                      ? "bg-emerald-500 text-slate-950 font-black shadow-sm"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  {r === "Today" ? "Today" : r === "Week" ? "This Week" : r === "Month" ? "This Month" : r === "Quarter" ? "Q3" : "FY 2026"}
                </button>
              ))}
            </div>

            <button
              onClick={handleSimulatePayment}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
              title="Record an instant test collection"
            >
              <Plus className="w-4 h-4" />
              <span>Simulate Inflow</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. CORE REVENUE METRICS (HOW MUCH MONEY HAS COME IN)
      ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Hospital Revenue Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Revenue Received ({timeRange})
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {formatINR(totalRevenue)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold mt-2">
            <TrendingUp className="w-4 h-4" />
            <span>+18.4% growth vs previous {timeRange.toLowerCase()}</span>
          </div>
        </div>

        {/* Today's Inflow */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Today's Live Collections
            </span>
            <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-cyan-700 mt-2">
            {formatINR(todayInflow)}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>84 active patient transactions today</span>
          </div>
        </div>

        {/* Insurance & TPA Settled */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Insurance & TPA Claims Settled
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-700 mt-2">
            {formatINR(tpaClaimsSettled)}
          </div>
          <div className="text-xs text-indigo-600 font-bold mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>96.2% Cashless claim settlement rate</span>
          </div>
        </div>

        {/* In-Clearing Receivables */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              In-Clearing / Pre-Auth Pipeline
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-700 mt-2">
            {formatINR(pendingReceivables)}
          </div>
          <div className="text-xs text-amber-700 font-medium mt-2">
            <span>Pre-authorized for discharge processing</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. DEPARTMENTAL REVENUE STREAMS & PAYER MIX
      ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Revenue Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-black text-slate-900">Revenue by Clinical Department</h3>
              <p className="text-xs text-slate-500">Distribution of hospital collections across care units</p>
            </div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {timeRange} Overview
            </span>
          </div>

          <div className="space-y-4">
            {/* IPD & ICU */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-2">
                  <Bed className="w-4 h-4 text-emerald-600" />
                  Inpatient Department (IPD) & ICU Bed Charges
                </span>
                <span className="font-mono font-black text-slate-900">
                  {formatINR(ipdRevenue)} <span className="text-slate-400 font-normal">(41%)</span>
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "41%" }} />
              </div>
              <span className="text-[10px] text-slate-400 block">48 active beds · ARPOB: ₹38,500/day</span>
            </div>

            {/* Surgeries & Operating Theatres */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-600" />
                  Surgeries & Operating Theatres (OT Suites 1-8)
                </span>
                <span className="font-mono font-black text-slate-900">
                  {formatINR(otRevenue)} <span className="text-slate-400 font-normal">(26%)</span>
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: "26%" }} />
              </div>
              <span className="text-[10px] text-slate-400 block">46 major elective & emergency surgical procedures</span>
            </div>

            {/* Outpatient Consultations */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-blue-600" />
                  Outpatient OPD Consultations (Specialities)
                </span>
                <span className="font-mono font-black text-slate-900">
                  {formatINR(opdRevenue)} <span className="text-slate-400 font-normal">(14%)</span>
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: "14%" }} />
              </div>
              <span className="text-[10px] text-slate-400 block">1,420 outpatient consultations completed</span>
            </div>

            {/* Diagnostics & Radiology */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-2">
                  <Microscope className="w-4 h-4 text-indigo-600" />
                  Diagnostics, Radiology (MRI / CT / X-Ray) & Labs
                </span>
                <span className="font-mono font-black text-slate-900">
                  {formatINR(diagnosticsRevenue)} <span className="text-slate-400 font-normal">(11%)</span>
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: "11%" }} />
              </div>
              <span className="text-[10px] text-slate-400 block">890 imaging scans & pathology panels processed</span>
            </div>

            {/* Pharmacy & Consumables */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-2">
                  <Pill className="w-4 h-4 text-rose-500" />
                  Central 24/7 Hospital Pharmacy & Medical Consumables
                </span>
                <span className="font-mono font-black text-slate-900">
                  {formatINR(pharmacyRevenue)} <span className="text-slate-400 font-normal">(8%)</span>
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: "8%" }} />
              </div>
              <span className="text-[10px] text-slate-400 block">Inpatient medications, surgical implants & IV therapies</span>
            </div>
          </div>
        </div>

        {/* Payer Mix / Payment Modes Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Payer Mix & Channels</h3>
              <p className="text-xs text-slate-500">Breakdown of insurance vs direct patient payments</p>
            </div>

            <div className="space-y-3.5 mt-4 text-xs">
              <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                <div className="flex justify-between font-bold text-emerald-950">
                  <span>Ayushman Bharat (AB-PMJAY)</span>
                  <span className="font-mono">{formatINR(Math.round(11240000 * rangeMultiplier))}</span>
                </div>
                <p className="text-[11px] text-emerald-700">Govt scheme cashless claims (Settled via NHA)</p>
              </div>

              <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-1">
                <div className="flex justify-between font-bold text-indigo-950">
                  <span>Private TPA Insurers (Star, HDFC)</span>
                  <span className="font-mono">{formatINR(Math.round(18180000 * rangeMultiplier))}</span>
                </div>
                <p className="text-[11px] text-indigo-700">Cashless corporate & retail policies</p>
              </div>

              <div className="p-3 rounded-2xl bg-cyan-50/60 border border-cyan-100 space-y-1">
                <div className="flex justify-between font-bold text-cyan-950">
                  <span>Direct UPI, Cards & Cash Desk</span>
                  <span className="font-mono">{formatINR(Math.round(18870450 * rangeMultiplier))}</span>
                </div>
                <p className="text-[11px] text-cyan-700">Immediate settlement at billing counters & kiosk</p>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 text-white text-xs space-y-1">
            <span className="font-black text-emerald-400 block">ABAC & NABH Compliant</span>
            <p className="text-[11px] text-slate-300">
              All transactions are encrypted and audited per National Health Authority guidelines.
            </p>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. LIVE PATIENT INFLOW & FINANCIAL TRANSACTIONS LEDGER
      ────────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900">Hospital Collections & Inflows Ledger</h3>
            <p className="text-xs text-slate-500">Live itemized audit log of all clinical payments received by the hospital</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search patient, TXN ID, payer..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-emerald-500 w-52 sm:w-64"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
            >
              <option value="All">All Categories</option>
              <option value="Inpatient / ICU">Inpatient / ICU</option>
              <option value="Surgeries & OT">Surgeries & OT</option>
              <option value="Outpatient (OPD)">Outpatient (OPD)</option>
              <option value="Diagnostics">Diagnostics</option>
              <option value="Pharmacy">Pharmacy</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Clinical Department / Service</th>
                <th className="py-3 px-4">Payment Channel</th>
                <th className="py-3 px-4 text-right">Amount Received</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredTransactions.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                    {t.id}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-extrabold text-slate-900">{t.patientName}</div>
                    <span className="text-[10px] text-slate-400 font-mono">{t.patientId}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-800">{t.department}</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">{t.category}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 text-[11px] font-semibold inline-block">
                      {t.paymentMode}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <span className="font-mono font-black text-sm text-emerald-700">
                      {formatINR(t.amount)}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      t.status === "Settled"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-blue-100 text-blue-800 border border-blue-200"
                    }`}>
                      ● {t.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right text-slate-400 text-[11px] font-mono">
                    {t.time}
                  </td>
                </tr>
              ))}

              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                    No transactions matching your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
