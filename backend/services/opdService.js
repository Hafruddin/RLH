// backend/services/opdService.js
// Central Real-Time Hospital OPD Queue & Doctor Cabin Control Engine
import { broadcastEvent } from "./eventHub.js";

// Helper to format IST time "hh:mm AM/PM"
function formatISTTime(dateObj = new Date(), addMinutes = 0) {
  const d = new Date(dateObj.getTime() + addMinutes * 60000);
  return d.toLocaleTimeString("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// Initial 12 OPD Doctors (matching UI reference images)
const initialDoctors = [
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
    averageConsultationMinutes: 12,
    estNextTurnOffset: 16,
    onTimePerformance: 70,
    completionRate: 85,
    totalAppointments: 6,
    totalEarnings: 3600,
    cancelledCount: 0,
  },
  {
    id: "doc-2",
    doctorId: "doc-2",
    name: "Dr. Pradeep Patel",
    specialization: "Cardiology & Internal Medicine",
    status: "IN_CONSULTATION",
    currentToken: "#04",
    completedCount: 4,
    waitingCount: 1,
    delayMinutes: 12,
    averageConsultationMinutes: 14,
    estNextTurnOffset: 15,
    onTimePerformance: 75,
    completionRate: 90,
    totalAppointments: 6,
    totalEarnings: 4800,
    cancelledCount: 0,
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
    averageConsultationMinutes: 10,
    estNextTurnOffset: 35,
    onTimePerformance: 65,
    completionRate: 100,
    totalAppointments: 3,
    totalEarnings: 2100,
    cancelledCount: 0,
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
    averageConsultationMinutes: 11,
    estNextTurnOffset: 8,
    onTimePerformance: 75,
    completionRate: 100,
    totalAppointments: 3,
    totalEarnings: 2100,
    cancelledCount: 0,
    appointments: [
      { id: "apt-1", patientName: "Harsh Tripathi", age: 28, gender: "Male", phone: "8833882299", date: "3 Sept 2026", time: "2:30 PM", fee: 700, status: "Completed" },
      { id: "apt-2", patientName: "Harshit Verma", age: 33, gender: "Male", phone: "7010099112", date: "31 Aug 2026", time: "2:00 PM", fee: 700, status: "Completed" },
      { id: "apt-3", patientName: "Suresh Patel", age: 52, gender: "Male", phone: "9001122334", date: "28 Aug 2026", time: "2:00 PM", fee: 700, status: "Completed" },
    ]
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
    averageConsultationMinutes: 15,
    estNextTurnOffset: 25,
    onTimePerformance: 60,
    completionRate: 80,
    totalAppointments: 4,
    totalEarnings: 3600,
    cancelledCount: 0,
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
    averageConsultationMinutes: 10,
    estNextTurnOffset: 30,
    onTimePerformance: 80,
    completionRate: 90,
    totalAppointments: 4,
    totalEarnings: 2400,
    cancelledCount: 0,
  },
  {
    id: "doc-7",
    doctorId: "doc-7",
    name: "Dr. Vikramaditya Singh",
    specialization: "Orthopedics & Joint Surgery",
    status: "AVAILABLE",
    currentToken: "#02",
    completedCount: 2,
    waitingCount: 1,
    delayMinutes: 12,
    averageConsultationMinutes: 14,
    estNextTurnOffset: 12,
    onTimePerformance: 78,
    completionRate: 85,
    totalAppointments: 5,
    totalEarnings: 5000,
    cancelledCount: 0,
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
    averageConsultationMinutes: 16,
    estNextTurnOffset: 20,
    onTimePerformance: 70,
    completionRate: 75,
    totalAppointments: 4,
    totalEarnings: 3200,
    cancelledCount: 0,
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
    averageConsultationMinutes: 10,
    estNextTurnOffset: 8,
    onTimePerformance: 85,
    completionRate: 100,
    totalAppointments: 3,
    totalEarnings: 1950,
    cancelledCount: 0,
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
    averageConsultationMinutes: 12,
    estNextTurnOffset: 14,
    onTimePerformance: 88,
    completionRate: 92,
    totalAppointments: 8,
    totalEarnings: 6400,
    cancelledCount: 0,
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
    averageConsultationMinutes: 15,
    estNextTurnOffset: 10,
    onTimePerformance: 95,
    completionRate: 94,
    totalAppointments: 6,
    totalEarnings: 5400,
    cancelledCount: 0,
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
    averageConsultationMinutes: 10,
    estNextTurnOffset: 12,
    onTimePerformance: 90,
    completionRate: 88,
    totalAppointments: 5,
    totalEarnings: 3500,
    cancelledCount: 0,
  },
];

class OpdStore {
  constructor() {
    this.sessions = new Map();
    this.patientQueues = new Map();
    this.init();
  }

  init() {
    initialDoctors.forEach((doc) => {
      this.sessions.set(doc.id, {
        ...doc,
        estNextTurn: formatISTTime(new Date(), doc.estNextTurnOffset || 15),
        lastUpdated: new Date().toISOString(),
      });
      // also alias by doctorId
      if (doc.doctorId !== doc.id) {
        this.sessions.set(doc.doctorId, this.sessions.get(doc.id));
      }
    });
  }

  // Calculate dynamic ETA in IST
  computeEstNextTurn(doc) {
    const delay = doc.delayMinutes || 0;
    const avg = doc.averageConsultationMinutes || 12;
    const waitPatients = doc.waitingCount || 0;
    const buffer = doc.status === "ON_BREAK" ? 20 : doc.status === "EMERGENCY" ? 30 : 5;
    const totalMinutes = delay + (waitPatients > 0 ? waitPatients * avg : buffer);
    return formatISTTime(new Date(), totalMinutes);
  }

  getAllSessions() {
    // Unique list by doctor name
    const unique = new Map();
    for (const s of this.sessions.values()) {
      if (!unique.has(s.name)) {
        s.estNextTurn = this.computeEstNextTurn(s);
        unique.set(s.name, s);
      }
    }
    return Array.from(unique.values());
  }

  getSession(idOrName) {
    if (!idOrName) return null;
    let s = this.sessions.get(idOrName);
    if (!s) {
      // search by name or doctorId
      const lower = String(idOrName).toLowerCase();
      for (const val of this.sessions.values()) {
        if (
          val.id.toLowerCase() === lower ||
          val.doctorId.toLowerCase() === lower ||
          val.name.toLowerCase().includes(lower)
        ) {
          s = val;
          break;
        }
      }
    }
    if (s) {
      s.estNextTurn = this.computeEstNextTurn(s);
    }
    return s;
  }

  addDelay(id, minutesToAdd = 5, reason = "OPD extension") {
    const doc = this.getSession(id);
    if (!doc) return null;
    doc.delayMinutes = Math.max(0, (doc.delayMinutes || 0) + Number(minutesToAdd));
    if (doc.status === "AVAILABLE" && doc.delayMinutes > 0) {
      doc.status = "DELAYED";
    }
    doc.estNextTurn = this.computeEstNextTurn(doc);
    doc.lastUpdated = new Date().toISOString();

    broadcastEvent("QUEUE_UPDATED", doc);
    broadcastEvent("DELAY_UPDATED", { doctorId: doc.id, delayMinutes: doc.delayMinutes, reason });
    return doc;
  }

  clearDelay(id) {
    const doc = this.getSession(id);
    if (!doc) return null;
    doc.delayMinutes = 0;
    if (doc.status === "DELAYED") {
      doc.status = "AVAILABLE";
    }
    doc.estNextTurn = this.computeEstNextTurn(doc);
    doc.lastUpdated = new Date().toISOString();

    broadcastEvent("QUEUE_UPDATED", doc);
    broadcastEvent("DELAY_UPDATED", { doctorId: doc.id, delayMinutes: 0 });
    return doc;
  }

  setStatus(id, status) {
    const doc = this.getSession(id);
    if (!doc) return null;
    doc.status = status;
    doc.estNextTurn = this.computeEstNextTurn(doc);
    doc.lastUpdated = new Date().toISOString();

    broadcastEvent("QUEUE_UPDATED", doc);
    broadcastEvent("OPD_UPDATED", doc);
    return doc;
  }

  startConsultation(id) {
    const doc = this.getSession(id);
    if (!doc) return null;
    doc.status = "IN_CONSULTATION";
    doc.estNextTurn = this.computeEstNextTurn(doc);
    doc.lastUpdated = new Date().toISOString();

    broadcastEvent("QUEUE_UPDATED", doc);
    broadcastEvent("CONSULTATION_STARTED", { doctorId: doc.id, token: doc.currentToken });
    return doc;
  }

  completeConsultation(id) {
    const doc = this.getSession(id);
    if (!doc) return null;
    doc.completedCount = (doc.completedCount || 0) + 1;
    if (doc.waitingCount > 0) {
      doc.waitingCount -= 1;
    }
    
    // advance token
    const tokenNum = parseInt(String(doc.currentToken).replace(/\D/g, "") || "1", 10);
    const nextTokenNum = tokenNum + 1;
    doc.currentToken = `#${String(nextTokenNum).padStart(2, "0")}`;
    doc.status = "AVAILABLE";
    
    // update completion rate
    doc.totalAppointments = Math.max(doc.totalAppointments || 3, doc.completedCount);
    doc.completionRate = Math.min(100, Math.round((doc.completedCount / doc.totalAppointments) * 100));
    doc.estNextTurn = this.computeEstNextTurn(doc);
    doc.lastUpdated = new Date().toISOString();

    broadcastEvent("QUEUE_UPDATED", doc);
    broadcastEvent("CONSULTATION_COMPLETED", { doctorId: doc.id, completedToken: doc.currentToken });
    return doc;
  }

  toggleBreak(id) {
    const doc = this.getSession(id);
    if (!doc) return null;
    doc.status = doc.status === "ON_BREAK" ? "AVAILABLE" : "ON_BREAK";
    doc.estNextTurn = this.computeEstNextTurn(doc);
    doc.lastUpdated = new Date().toISOString();

    broadcastEvent("QUEUE_UPDATED", doc);
    broadcastEvent(doc.status === "ON_BREAK" ? "BREAK_STARTED" : "BREAK_ENDED", { doctorId: doc.id });
    return doc;
  }

  toggleEmergency(id) {
    const doc = this.getSession(id);
    if (!doc) return null;
    if (doc.status === "EMERGENCY") {
      doc.status = "AVAILABLE";
      doc.delayMinutes = Math.max(0, doc.delayMinutes - 15);
    } else {
      doc.status = "EMERGENCY";
      doc.delayMinutes += 15;
    }
    doc.estNextTurn = this.computeEstNextTurn(doc);
    doc.lastUpdated = new Date().toISOString();

    broadcastEvent("QUEUE_UPDATED", doc);
    broadcastEvent(doc.status === "EMERGENCY" ? "EMERGENCY_STARTED" : "EMERGENCY_ENDED", { doctorId: doc.id });
    return doc;
  }

  checkInPatient(appointmentId, doctorId, patientName) {
    const doc = this.getSession(doctorId) || this.getSession("doc-4");
    if (!doc) return null;
    doc.waitingCount = (doc.waitingCount || 0) + 1;
    const token = `#${String((doc.completedCount || 0) + (doc.waitingCount || 1)).padStart(2, "0")}`;
    
    const entry = {
      appointmentId,
      doctorId: doc.id,
      patientName: patientName || "Patient",
      token,
      status: "CHECKED_IN",
      checkedInAt: new Date().toISOString(),
      patientsAhead: Math.max(0, (doc.waitingCount || 1) - 1),
    };
    this.patientQueues.set(appointmentId, entry);

    doc.estNextTurn = this.computeEstNextTurn(doc);
    broadcastEvent("PATIENT_CHECKED_IN", entry);
    broadcastEvent("QUEUE_UPDATED", doc);
    return entry;
  }

  getPatientStatus(appointmentId, doctorId = null) {
    let entry = this.patientQueues.get(appointmentId);
    const doc = (doctorId ? this.getSession(doctorId) : null) || this.getSession("doc-4");
    
    if (!entry) {
      entry = {
        appointmentId,
        doctorId: doc?.id || "doc-4",
        token: "#04",
        status: "CHECKED_IN",
        patientsAhead: 1,
      };
    }

    const waitMins = ((entry.patientsAhead || 1) * (doc?.averageConsultationMinutes || 12)) + (doc?.delayMinutes || 0);
    const estTurn = formatISTTime(new Date(), waitMins);
    const recArrival = formatISTTime(new Date(), Math.max(0, waitMins - 10));

    return {
      ...entry,
      doctorName: doc?.name || "Dr. Aniket Roy",
      specialization: doc?.specialization || "Dermatology & Skin Care",
      doctorStatus: doc?.status || "AVAILABLE",
      currentToken: doc?.currentToken || "#03",
      completedCount: doc?.completedCount || 3,
      waitingCount: doc?.waitingCount || 1,
      delayMinutes: doc?.delayMinutes || 0,
      estimatedWaitMinutes: waitMins,
      estimatedTurn: estTurn,
      recommendedArrivalTime: recArrival,
    };
  }
}

export const opdStore = new OpdStore();
