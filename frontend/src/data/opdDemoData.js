// frontend/src/data/opdDemoData.js

export const OPD_DOCTORS = [
  {
    id: "6a3820c82cecc9714b826111",
    doctorId: "6a3820c82cecc9714b826111",
    name: "Dr. Ananya Sharma",
    specialization: "Cardiologist",
    cabin: "Cabin 101 — Dept. of Cardiology",
    status: "AVAILABLE",
    currentToken: "#04",
    completedCount: 4,
    waitingCount: 2,
    delayMinutes: 0,
    fee: 800,
    estWait: "~15 mins",
    estTurn: "11:15 AM IST",
    completionRate: 95,
    onTimePerformance: 92,
    totalAppointments: 6,
    totalEarnings: 4800,
    cancelledCount: 0,
    patients: [
      { id: "p1", token: "#01", name: "Rahul Kumar", status: "Completed", time: "09:30 AM", fee: 800, notes: "Routine ECG & consult" },
      { id: "p2", token: "#02", name: "Priya Sharma", status: "Completed", time: "10:00 AM", fee: 800, notes: "Blood pressure review" },
      { id: "p3", token: "#03", name: "Arun Raj", status: "Completed", time: "10:30 AM", fee: 800, notes: "Post-angioplasty check" },
      { id: "p4", token: "#04", name: "Sunita Rao", status: "In Consultation", time: "11:00 AM", fee: 800, notes: "Lipid profile review" },
      { id: "p5", token: "#05", name: "Meena Devi", status: "Next in Queue", time: "11:20 AM", fee: 800, notes: "Palpitations evaluation" },
      { id: "p6", token: "#06", name: "David Miller", status: "Waiting", time: "11:40 AM", fee: 800, notes: "Follow-up consult" },
    ]
  },
  {
    id: "6a3820c82cecc9714b826112",
    doctorId: "6a3820c82cecc9714b826112",
    name: "Dr. Suresh Reddy",
    aliasName: "Dr. Michael Chen",
    specialization: "Neurologist",
    cabin: "Cabin 103 — Dept. of Neurology",
    status: "IN_CONSULTATION",
    currentToken: "#04",
    completedCount: 3,
    waitingCount: 3,
    delayMinutes: 0,
    fee: 900,
    estWait: "~20 mins",
    estTurn: "11:20 AM IST",
    completionRate: 90,
    onTimePerformance: 88,
    totalAppointments: 6,
    totalEarnings: 5400,
    cancelledCount: 0,
    patients: [
      { id: "p1", token: "#01", name: "Anand Verma", status: "Completed", time: "09:30 AM", fee: 900, notes: "Chronic migraine follow-up" },
      { id: "p2", token: "#02", name: "Sneha Nair", status: "Completed", time: "10:00 AM", fee: 900, notes: "EEG test interpretation" },
      { id: "p3", token: "#03", name: "Vikram Malhotra", status: "Completed", time: "10:30 AM", fee: 900, notes: "Epilepsy medication review" },
      { id: "p4", token: "#04", name: "Sunil Hegde", status: "In Consultation", time: "11:00 AM", fee: 900, notes: "Cervical radiculopathy" },
      { id: "p5", token: "#05", name: "Ananya Roy", status: "Next in Queue", time: "11:25 AM", fee: 900, notes: "Neuropathy assessment" },
      { id: "p6", token: "#06", name: "Rajesh Joshi", status: "Waiting", time: "11:45 AM", fee: 900, notes: "Tremor evaluation" },
    ]
  },
  {
    id: "6a3820c82cecc9714b826113",
    doctorId: "6a3820c82cecc9714b826113",
    name: "Dr. Vikram Hegde",
    specialization: "Cardiology (Critical Care)",
    cabin: "Cabin 105 — Emergency Cardiology ICU",
    status: "EMERGENCY",
    currentToken: "#02",
    completedCount: 2,
    waitingCount: 4,
    delayMinutes: 20,
    fee: 800,
    estWait: "~45 mins",
    estTurn: "12:00 PM IST",
    completionRate: 75,
    onTimePerformance: 65,
    totalAppointments: 6,
    totalEarnings: 4800,
    cancelledCount: 0,
    patients: [
      { id: "p1", token: "#01", name: "Kiran Mazumdar", status: "Completed", time: "09:00 AM", fee: 800, notes: "Pacemaker evaluation" },
      { id: "p2", token: "#02", name: "Vikram Singh (STEMI)", status: "Emergency Priority", time: "09:45 AM", fee: 800, notes: "Acute Coronary Syndrome" },
      { id: "p3", token: "#03", name: "Devika Rani", status: "Waiting (Delayed)", time: "11:30 AM", fee: 800, notes: "Chest pain review" },
      { id: "p4", token: "#04", name: "Mahesh Babu", status: "Waiting (Delayed)", time: "11:50 AM", fee: 800, notes: "Dyspnea on exertion" },
      { id: "p5", token: "#05", name: "Alok Nath", status: "Waiting (Delayed)", time: "12:15 PM", fee: 800, notes: "Hypertensive urgency" },
      { id: "p6", token: "#06", name: "Radha Krishnan", status: "Waiting (Delayed)", time: "12:35 PM", fee: 800, notes: "Holter review" },
    ]
  },
  {
    id: "doc-4",
    doctorId: "doc-4",
    name: "Dr. Aniket Roy",
    specialization: "Dermatology & Skin Care",
    cabin: "Cabin 104 — Dept. of Dermatology",
    status: "DELAYED",
    currentToken: "#03",
    completedCount: 3,
    waitingCount: 1,
    delayMinutes: 10,
    fee: 700,
    estWait: "~20 mins",
    estTurn: "11:20 AM IST",
    completionRate: 100,
    onTimePerformance: 75,
    totalAppointments: 3,
    totalEarnings: 2100,
    cancelledCount: 0,
    patients: [
      { id: "p1", token: "#01", name: "Harsh Tripathi", status: "Completed", time: "10:00 AM", fee: 700, notes: "General Checkup • Token #1" },
      { id: "p2", token: "#02", name: "Harshit Verma", status: "Completed", time: "10:30 AM", fee: 700, notes: "Skin Rash / Allergy • Token #2" },
      { id: "p3", token: "#03", name: "Suresh Patel", status: "Completed", time: "11:00 AM", fee: 700, notes: "Consultation • Token #3" },
    ]
  },
  {
    id: "6a3820c82cecc9714b826117",
    doctorId: "6a3820c82cecc9714b826117",
    name: "Dr. Sunita Kulkarni",
    specialization: "Gynecologist",
    cabin: "Cabin 106 — Dept. of Gynecology",
    status: "ON_BREAK",
    currentToken: "#05",
    completedCount: 4,
    waitingCount: 2,
    delayMinutes: 10,
    fee: 750,
    estWait: "~30 mins",
    estTurn: "11:45 AM IST",
    completionRate: 85,
    onTimePerformance: 80,
    totalAppointments: 6,
    totalEarnings: 4500,
    cancelledCount: 0,
    patients: [
      { id: "p1", token: "#01", name: "Rekha Sharma", status: "Completed", time: "09:30 AM", fee: 750, notes: "Antenatal 28 weeks" },
      { id: "p2", token: "#02", name: "Kavita Rao", status: "Completed", time: "10:00 AM", fee: 750, notes: "PCOD consultation" },
      { id: "p3", token: "#03", name: "Divya Nair", status: "Completed", time: "10:30 AM", fee: 750, notes: "Routine ultrasound check" },
      { id: "p4", token: "#04", name: "Shalini Patil", status: "Completed", time: "11:00 AM", fee: 750, notes: "Postnatal review" },
      { id: "p5", token: "#05", name: "Meera Sen", status: "Waiting (On Break)", time: "11:45 AM", fee: 750, notes: "First trimester check" },
      { id: "p6", token: "#06", name: "Pooja Hegde", status: "Waiting", time: "12:05 PM", fee: 750, notes: "General health review" },
    ]
  },
  {
    id: "6a3820c82cecc9714b826114",
    doctorId: "6a3820c82cecc9714b826114",
    name: "Dr. Pradeep Patel",
    specialization: "Orthopedics",
    cabin: "Cabin 102 — Dept. of Orthopedics",
    status: "IN_CONSULTATION",
    currentToken: "#05",
    completedCount: 4,
    waitingCount: 2,
    delayMinutes: 5,
    fee: 850,
    estWait: "~15 mins",
    estTurn: "11:30 AM IST",
    completionRate: 92,
    onTimePerformance: 89,
    totalAppointments: 6,
    totalEarnings: 5100,
    cancelledCount: 0,
    patients: [
      { id: "p1", token: "#01", name: "Deepak Rawat", status: "Completed", time: "09:30 AM", fee: 850, notes: "Knee osteoarthritis review" },
      { id: "p2", token: "#02", name: "Kavita Singh", status: "Completed", time: "10:00 AM", fee: 850, notes: "Post-wrist fracture plaster removal" },
      { id: "p3", token: "#03", name: "Mohan Lal", status: "Completed", time: "10:30 AM", fee: 850, notes: "Lumbar spondylosis" },
      { id: "p4", token: "#04", name: "Sanjay Singhal", status: "Completed", time: "11:00 AM", fee: 850, notes: "ACL injury consult" },
      { id: "p5", token: "#05", name: "Pankaj Tripathi", status: "In Consultation", time: "11:20 AM", fee: 850, notes: "Shoulder impingement" },
      { id: "p6", token: "#06", name: "Ritu Nambiar", status: "Next in Queue", time: "11:40 AM", fee: 850, notes: "Cervical spine therapy" },
    ]
  }
];

export function getDoctorOpdProfile(doctorId, docName) {
  const idStr = String(doctorId || "").toLowerCase();
  const nameStr = String(docName || "").toLowerCase();

  const found = OPD_DOCTORS.find((doc) => {
    return (
      doc.id.toLowerCase() === idStr ||
      doc.doctorId.toLowerCase() === idStr ||
      (doc.name && doc.name.toLowerCase().includes(nameStr)) ||
      (doc.aliasName && doc.aliasName.toLowerCase().includes(nameStr)) ||
      (nameStr && doc.name.toLowerCase().split(" ").some((p) => p.length > 2 && nameStr.includes(p)))
    );
  });

  if (found) return found;

  // Fallback realistic profile
  return {
    id: doctorId || "doc-generic",
    doctorId: doctorId || "doc-generic",
    name: docName || "Doctor",
    specialization: "General Physician",
    cabin: "Cabin 101 — Dept. of OPD Consultations",
    status: "AVAILABLE",
    currentToken: "#04",
    completedCount: 4,
    waitingCount: 2,
    delayMinutes: 0,
    fee: 700,
    estWait: "~15 mins",
    estTurn: "11:15 AM IST",
    completionRate: 95,
    onTimePerformance: 92,
    totalAppointments: 6,
    totalEarnings: 4200,
    cancelledCount: 0,
    patients: [
      { id: "p1", token: "#01", name: "Ramesh Gupta", status: "Completed", time: "09:30 AM", fee: 700, notes: "General health checkup" },
      { id: "p2", token: "#02", name: "Sunita Joshi", status: "Completed", time: "10:00 AM", fee: 700, notes: "Routine follow-up" },
      { id: "p3", token: "#03", name: "Karthik Reddy", status: "Completed", time: "10:30 AM", fee: 700, notes: "Prescription refill" },
      { id: "p4", token: "#04", name: "Deepak Chopra", status: "In Consultation", time: "11:00 AM", fee: 700, notes: "Consultation" },
      { id: "p5", token: "#05", name: "Radha Nair", status: "Next in Queue", time: "11:25 AM", fee: 700, notes: "Waiting" },
      { id: "p6", token: "#06", name: "Manoj Bajpayee", status: "Waiting", time: "11:45 AM", fee: 700, notes: "Waiting" },
    ]
  };
}

export function getStatusBadgeInfo(status) {
  switch (status) {
    case "IN_CONSULTATION":
      return {
        label: "In Consultation",
        badge: "🔵 In Consultation",
        colorClass: "bg-blue-100 text-blue-800 border-blue-200",
        indicatorClass: "bg-blue-600 animate-ping",
        dotColor: "bg-blue-600"
      };
    case "EMERGENCY":
      return {
        label: "Emergency Mode",
        badge: "🔴 Emergency Mode",
        colorClass: "bg-rose-100 text-rose-800 border-rose-200",
        indicatorClass: "bg-rose-600 animate-bounce",
        dotColor: "bg-rose-600"
      };
    case "ON_BREAK":
      return {
        label: "On Break",
        badge: "🟡 On Break",
        colorClass: "bg-purple-100 text-purple-800 border-purple-200",
        indicatorClass: "bg-purple-600",
        dotColor: "bg-purple-600"
      };
    case "DELAYED":
      return {
        label: "Delayed",
        badge: "🟠 Delayed",
        colorClass: "bg-amber-100 text-amber-800 border-amber-200",
        indicatorClass: "bg-amber-600 animate-pulse",
        dotColor: "bg-amber-600"
      };
    case "AVAILABLE":
    default:
      return {
        label: "Available",
        badge: "🟢 Available (On Duty)",
        colorClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
        indicatorClass: "bg-emerald-600",
        dotColor: "bg-emerald-600"
      };
  }
}

function formatIST(dateObj) {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(dateObj);
  } catch (e) {
    let hours = dateObj.getHours();
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  }
}

export function getDefaultOpdSessions() {
  const now = new Date();
  return [
    {
      id: "doc-1",
      doctorId: "doc-1",
      name: "Dr. Ananya Sharma",
      specialization: "Ayurveda & General Medicine",
      status: "IN_CONSULTATION",
      currentToken: "#04",
      completedCount: 4,
      waitingCount: 1,
      delayMinutes: 15,
      estNextTurn: formatIST(new Date(now.getTime() + (16 + 15) * 60000)),
    },
    {
      id: "doc-2",
      doctorId: "doc-2",
      name: "Dr. Pradeep Patel",
      specialization: "Cardiology & Critical Care",
      status: "EMERGENCY",
      currentToken: "#04 (ICU Code Red)",
      completedCount: 4,
      waitingCount: 2,
      delayMinutes: 25,
      estNextTurn: "Emergency Priority",
    },
    {
      id: "doc-3",
      doctorId: "doc-3",
      name: "Dr. Sunita Kumar",
      specialization: "Kayachikitsa (Ayurvedic Internal Medicine)",
      status: "ON_BREAK",
      currentToken: "#03",
      completedCount: 3,
      waitingCount: 0,
      delayMinutes: 20,
      estNextTurn: formatIST(new Date(now.getTime() + (35 + 20) * 60000)),
    },
    {
      id: "doc-4",
      doctorId: "doc-4",
      name: "Dr. Aniket Roy",
      specialization: "Dermatology & Skin Care",
      status: "AVAILABLE",
      currentToken: "#03",
      completedCount: 3,
      waitingCount: 0,
      delayMinutes: 10,
      estNextTurn: formatIST(new Date(now.getTime() + (8 + 10) * 60000)),
    },
    {
      id: "doc-5",
      doctorId: "doc-5",
      name: "Dr. Ritu Varma",
      specialization: "Neurology & Brain Health",
      status: "DELAYED",
      currentToken: "#02",
      completedCount: 2,
      waitingCount: 0,
      delayMinutes: 25,
      estNextTurn: formatIST(new Date(now.getTime() + (25 + 25) * 60000)),
    },
    {
      id: "doc-6",
      doctorId: "doc-6",
      name: "Dr. Sameer Deshmukh",
      specialization: "Pediatrics & Child Care",
      status: "ON_BREAK",
      currentToken: "#02",
      completedCount: 2,
      waitingCount: 0,
      delayMinutes: 15,
      estNextTurn: formatIST(new Date(now.getTime() + (30 + 15) * 60000)),
    },
    {
      id: "doc-7",
      doctorId: "doc-7",
      name: "Dr. Vikramaditya Singh",
      specialization: "Orthopedics & Emergency Trauma",
      status: "EMERGENCY",
      currentToken: "#02 (Trauma Bay 1)",
      completedCount: 2,
      waitingCount: 2,
      delayMinutes: 30,
      estNextTurn: "Emergency Priority",
    },
    {
      id: "doc-8",
      doctorId: "doc-8",
      name: "Dr. Manoj Nambiar",
      specialization: "Panchakarma & Wellness Therapy",
      status: "IN_CONSULTATION",
      currentToken: "#01",
      completedCount: 1,
      waitingCount: 1,
      delayMinutes: 18,
      estNextTurn: formatIST(new Date(now.getTime() + (20 + 18) * 60000)),
    },
    {
      id: "doc-9",
      doctorId: "doc-9",
      name: "Dr. Harish Chandra",
      specialization: "ENT (Ear, Nose & Throat)",
      status: "AVAILABLE",
      currentToken: "#02",
      completedCount: 2,
      waitingCount: 0,
      delayMinutes: 10,
      estNextTurn: formatIST(new Date(now.getTime() + (8 + 10) * 60000)),
    },
    {
      id: "6a3820c82cecc9714b826111",
      doctorId: "6a3820c82cecc9714b826111",
      name: "Dr. Rajesh Kumar",
      specialization: "Cardiology",
      status: "IN_CONSULTATION",
      currentToken: "#05",
      completedCount: 5,
      waitingCount: 2,
      delayMinutes: 8,
      estNextTurn: formatIST(new Date(now.getTime() + (14 + 8) * 60000)),
    },
    {
      id: "6a3820c82cecc9714b826112",
      doctorId: "6a3820c82cecc9714b826112",
      name: "Dr. Suresh Reddy",
      specialization: "Neurology",
      status: "AVAILABLE",
      currentToken: "#04",
      completedCount: 4,
      waitingCount: 1,
      delayMinutes: 0,
      estNextTurn: formatIST(new Date(now.getTime() + 10 * 60000)),
    },
    {
      id: "6a3820c82cecc9714b826115",
      doctorId: "6a3820c82cecc9714b826115",
      name: "Dr. Priya Sharma",
      specialization: "Dermatology",
      status: "IN_CONSULTATION",
      currentToken: "#03",
      completedCount: 3,
      waitingCount: 1,
      delayMinutes: 5,
      estNextTurn: formatIST(new Date(now.getTime() + (12 + 5) * 60000)),
    },
  ];
}
