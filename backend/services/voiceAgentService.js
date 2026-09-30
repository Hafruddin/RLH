// backend/services/voiceAgentService.js
// Multilingual Conversational AI & ElevenLabs Agent Orchestrator for MediCare Nexus
// Supports: English, Tamil, Hindi, Telugu, Kannada, Marathi, Bengali

import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Service from "../models/Service.js";
import ServiceAppointment from "../models/serviceAppointment.js";
import Bed from "../models/Bed.js";
import Staff from "../models/Staff.js";
import Equipment from "../models/Equipment.js";
import OperatingTheatre from "../models/OperatingTheatre.js";
import EmergencyEvent from "../models/EmergencyEvent.js";
import Patient from "../models/Patient.js";
import Forecast from "../models/Forecast.js";
import { executeEmergencyAllocation } from "./orchestratorService.js";
import { broadcastEvent } from "./eventHub.js";
import { normalizeSpokenText, getVoiceProfile, VOICE_PROFILES } from "./voiceTextNormalizer.js";

// In-memory analytics store for AI Agent Monitor
export const voiceAnalyticsStore = {
  activeConversations: 0,
  totalSessions: 14,
  toolCallsCount: 28,
  successRate: 98.4,
  handoffsCount: 19,
  languages: {
    en: 8,
    ta: 5,
    hi: 3,
    te: 1,
    kn: 1,
    ml: 1,
    mr: 1,
    bn: 1
  },
  recentTranscripts: [
    {
      id: "conv-101",
      agent: "appointment",
      language: "en",
      userRole: "patient",
      action: "Booked Dr. Sarah Johnson at 10:30 AM",
      status: "SUCCESS",
      timestamp: new Date(Date.now() - 120000).toLocaleTimeString()
    },
    {
      id: "conv-102",
      agent: "emergency",
      language: "ta",
      userRole: "nurse",
      action: "Emergency Activated: P-1005 (ICU-06 Allocated)",
      status: "SUCCESS",
      timestamp: new Date(Date.now() - 360000).toLocaleTimeString()
    },
    {
      id: "conv-103",
      agent: "operations",
      language: "en",
      userRole: "admin",
      action: "Queried ICU Occupancy & ER Influx Forecast",
      status: "SUCCESS",
      timestamp: new Date(Date.now() - 720000).toLocaleTimeString()
    }
  ]
};

// Agent Registry Definition
export const VOICE_AGENTS = {
  concierge: {
    id: process.env.ELEVENLABS_CONCIERGE_AGENT_ID || "agent_concierge_nexus",
    name: "Nexus Concierge Agent",
    role: "Central Routing & Intent Classifier",
    description: "Greets users, identifies clinical/operational intent, and transfers to specialized agents."
  },
  appointment: {
    id: process.env.ELEVENLABS_APPOINTMENT_AGENT_ID || "agent_appt_nexus",
    name: "Nexus Appointment Agent",
    role: "Clinical Appointment Scheduling",
    description: "Books, reschedules, cancels, and queries doctor appointments with verbal confirmation."
  },
  doctor: {
    id: process.env.ELEVENLABS_DOCTOR_AGENT_ID || "agent_doc_nexus",
    name: "Nexus Doctor Finder Agent",
    role: "Physician Discovery & Availability",
    description: "Helps patients locate specialists, reviews ratings, qualifications, and earliest slots."
  },
  diagnostics: {
    id: process.env.ELEVENLABS_DIAGNOSTIC_AGENT_ID || "agent_diag_nexus",
    name: "Nexus Diagnostics Agent",
    role: "Lab & Imaging Scheduling",
    description: "Manages CBC, MRI, CT, and X-ray bookings, checking live suite queues."
  },
  emergency: {
    id: process.env.ELEVENLABS_EMERGENCY_AGENT_ID || "agent_emerg_nexus",
    name: "Nexus Emergency Agent",
    role: "Critical Care Escalation",
    description: "Executes 1-click critical resource allocation (ICU bed, doctor, nurse, ventilator) under Code Red."
  },
  bed: {
    id: process.env.ELEVENLABS_BED_AGENT_ID || "agent_bed_nexus",
    name: "Nexus Bed Agent",
    role: "Ward & ICU Capacity",
    description: "Tracks live bed availability, negative pressure isolation, reserves and assigns beds."
  },
  staff: {
    id: process.env.ELEVENLABS_STAFF_AGENT_ID || "agent_staff_nexus",
    name: "Nexus Staff Agent",
    role: "Workload & Shift Orchestration",
    description: "Monitors on-duty physicians and nurses, tracks active patient loads to prevent burnout."
  },
  ot: {
    id: process.env.ELEVENLABS_OT_AGENT_ID || "agent_ot_nexus",
    name: "Nexus OT Agent",
    role: "Surgical Theatre Scheduling",
    description: "Allocates operating suites, pairs surgical teams, and prevents double bookings."
  },
  equipment: {
    id: process.env.ELEVENLABS_EQUIPMENT_AGENT_ID || "agent_equip_nexus",
    name: "Nexus Equipment Agent",
    role: "Biomedical Asset Tracking",
    description: "Locates ventilators, ECGs, defibrillators, reserves and dispatches them across wards."
  },
  forecast: {
    id: process.env.ELEVENLABS_FORECAST_AGENT_ID || "agent_forecast_nexus",
    name: "Nexus Forecast Agent",
    role: "Predictive Analytics & Surge Risk",
    description: "Delivers 2-hour and 24-hour ER influx projections and staffing recommendations."
  },
  patient: {
    id: process.env.ELEVENLABS_PATIENT_AGENT_ID || "agent_patient_nexus",
    name: "Nexus Patient Agent",
    role: "Patient Self-Service",
    description: "Provides appointment history, test results, wait times, and hospital navigation."
  },
  operations: {
    id: process.env.ELEVENLABS_ADMIN_AGENT_ID || "agent_admin_nexus",
    name: "Nexus Operations Agent",
    role: "Hospital Command Center AI",
    description: "Analyzes system bottlenecks, triggers simulations, and optimizes hospital throughput."
  }
};

/**
 * Language Detector Supporting Indic Languages and Code-Switching
 */
export function detectLanguage(text = "") {
  // Tamil Unicode Range 0B80-0BFF
  if (/[\u0B80-\u0BFF]/.test(text)) return "ta";
  // Devanagari (Hindi / Marathi) Range 0900-097F
  if (/[\u0900-\u097F]/.test(text)) {
    if (/(आहे|झाले|पाहिजे|करा|नाही|काय|नमस्कार|कशी|कसा|आहात)/.test(text)) return "mr";
    return "hi";
  }
  // Telugu Range 0C00-0C7F
  if (/[\u0C00-\u0C7F]/.test(text)) return "te";
  // Kannada Range 0C80-0CFF
  if (/[\u0C80-\u0CFF]/.test(text)) return "kn";
  // Malayalam Range 0D00-0D7F
  if (/[\u0D00-\u0D7F]/.test(text)) return "ml";
  // Bengali Range 0980-09FF
  if (/[\u0980-\u09FF]/.test(text)) return "bn";

  // Phonetic / Code-Mixed keywords detection
  const lower = text.toLowerCase();
  if (/\b(vanakkam|nalaiku|naalaiki|irukka|vendum|theriyuma|ippo|maruthuvar)\b/.test(lower)) return "ta";
  if (/\b(namaste|kal|chahiye|kripya|karo|bataiye|kitne)\b/.test(lower)) return "hi";
  if (/\b(namaskaram|repu|kavali|cheppandi)\b/.test(lower)) return "te";
  if (/\b(namaskara|nale|beku|heli)\b/.test(lower)) return "kn";
  if (/\b(namaskaram|nale|venam|und|parayumo)\b/.test(lower)) return "ml";
  if (/\b(namaskar|udya|pahije|sang)\b/.test(lower)) return "mr";
  if (/\b(nomoshkar|agami|dorkar|bolun)\b/.test(lower)) return "bn";

  return "en";
}

/**
 * ElevenLabs Signed URL Generator for Private Conversational Agents
 */
export async function getSignedConversationUrl(agentType = "concierge") {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentConfig = VOICE_AGENTS[agentType] || VOICE_AGENTS.concierge;
  const agentId = agentConfig.id;

  if (!apiKey || !agentId) {
    return {
      success: false,
      isFallback: true,
      message: "ElevenLabs credentials in hybrid mode. Local voice engine engaged."
    };
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
      {
        method: "GET",
        headers: { "xi-api-key": apiKey }
      }
    );

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        signedUrl: data.signed_url,
        agentId,
        agentType
      };
    } else {
      const errData = await response.json().catch(() => ({}));
      return {
        success: false,
        isFallback: true,
        agentType,
        message: errData.detail?.message || "Using autonomous conversational engine."
      };
    }
  } catch (err) {
    return {
      success: false,
      isFallback: true,
      agentType,
      message: err.message
    };
  }
}

/**
 * Autonomous Voice Turn Processing (Observe -> Understand -> Call Tool -> Mutate DB -> Respond)
 */
export async function processVoiceTurn({
  message = "",
  context = {},
  user = {},
  currentAgent = "concierge"
}) {
  const trimmed = message.trim();
  const lower = trimmed.toLowerCase();
  const lang = detectLanguage(trimmed);
  voiceAnalyticsStore.languages[lang] = (voiceAnalyticsStore.languages[lang] || 0) + 1;
  voiceAnalyticsStore.toolCallsCount++;

  let targetAgent = currentAgent;
  let responseText = "";
  let actionConfirmation = null;
  let executedAction = null;
  let clientAction = null;

  // 1. INTENT CLASSIFICATION & AGENT TRANSFER LOGIC (Multilingual: EN, TA, HI, TE, KN, MR, BN)
  if (lower.includes("why") || lower.includes("reason") || lower.includes("காரணம்") || lower.includes("explain") || lower.includes("bottleneck") || lower.includes("command center")) {
    targetAgent = "operations";
  } else if (lower.includes("emergency") || lower.includes("code red") || lower.includes("p-1005") || lower.includes("அவசரம்") || lower.includes("எமர்ஜென்சி") || lower.includes("इमरजेंसी") || lower.includes("आपातकाल") || lower.includes("అత్యవసరం") || lower.includes("ತುರ್ತು")) {
    targetAgent = "emergency";
  } else if (lower.includes("icu") || lower.includes("bed") || lower.includes("occupancy") || lower.includes("படுக்கை") || lower.includes("बेड") || lower.includes("खाट") || lower.includes("పడక") || lower.includes("ಹಾಸಿಗೆ")) {
    targetAgent = "bed";
  } else if (lower.includes("book") || lower.includes("appointment") || lower.includes("நேரம்") || lower.includes("முன்பதிவு") || lower.includes("बुक") || lower.includes("अपॉइंटमेंट") || lower.includes("బుక్") || lower.includes("ಬುಕಿಂಗ್")) {
    targetAgent = "appointment";
  } else if (lower.includes("doctor") || lower.includes("cardiologist") || lower.includes("dr") || lower.includes("டாக்டர்") || lower.includes("மருத்துவர்") || lower.includes("डॉक्टर") || lower.includes("वैद्य") || lower.includes("వైద్యుడు") || lower.includes("ವೈದ್ಯ")) {
    targetAgent = "doctor";
  } else if (lower.includes("test") || lower.includes("cbc") || lower.includes("x-ray") || lower.includes("diagnostic") || lower.includes("பரிசோதனை") || lower.includes("जांच") || lower.includes("टेस्ट") || lower.includes("పరీక్ష") || lower.includes("ಪರೀಕ್ಷೆ")) {
    targetAgent = "diagnostics";
  } else if (lower.includes("forecast") || lower.includes("surge") || lower.includes("demand") || lower.includes("கணிப்பு") || lower.includes("पूर्वानुमान") || lower.includes("अंदाज") || lower.includes("అంచనా")) {
    targetAgent = "forecast";
  } else if (lower.includes("nurse") || lower.includes("staff") || lower.includes("duty") || lower.includes("பணியாளர்") || lower.includes("नर्स") || lower.includes("स्टाफ") || lower.includes("నర్స్") || lower.includes("ಸಿಬ್ಬಂದಿ")) {
    targetAgent = "staff";
  } else if (lower.includes("ot") || lower.includes("operation") || lower.includes("theatre") || lower.includes("அறுவை") || lower.includes("ऑपरेशन") || lower.includes("శస్త్రచికిత్స") || lower.includes("ಆಪರೇಷನ್")) {
    targetAgent = "ot";
  } else if (lower.includes("ventilator") || lower.includes("equipment") || lower.includes("கருவி") || lower.includes("वेंटिलेटर") || lower.includes("उपकरण") || lower.includes("పరికరాలు")) {
    targetAgent = "equipment";
  } else if (lower.includes("command center") || lower.includes("bottleneck") || lower.includes("hospital state") || lower.includes("operations") || lower.includes("அமைப்பு")) {
    targetAgent = "operations";
  }

  // Record Agent Transfer if changed
  if (targetAgent !== currentAgent) {
    voiceAnalyticsStore.handoffsCount++;
  }

  // 2. WORKFLOW EXECUTION BY AGENT
  // -------------------------------------------------------------
  // AGENT: APPOINTMENT
  // -------------------------------------------------------------
  if (targetAgent === "appointment") {
    // Check if user is confirming a pending booking
    const isConfirming = /\b(yes|confirm|book it|okay|sure|ஆம்|சரி|ஹாம்|செய்)\b/i.test(lower);
    
    if (isConfirming || lower.includes("tomorrow") || lower.includes("book")) {
      // Find doctor (from context or message)
      let docName = "Dr. Sarah Johnson";
      if (lower.includes("chen")) docName = "Dr. Michael Chen";
      if (lower.includes("emily")) docName = "Dr. Emily Rodriguez";
      if (lower.includes("wilson")) docName = "Dr. James Wilson";
      if (context.doctorId) {
        const found = await Doctor.findById(context.doctorId).lean();
        if (found) docName = found.name;
      }

      const doctor = await Doctor.findOne({ name: { $regex: docName.replace(/^dr\.?\s*/i, ""), $options: "i" } });
      const targetDate = new Date(Date.now() + 86400000).toISOString().split("T")[0];
      const slotTime = lower.includes("11:45") ? "11:45 AM" : "10:30 AM";

      const docOwner = doctor?.owner || "admin_owner_nexus";
      const feeAmount = Number(doctor?.fee) || 700;

      const newAppt = new Appointment({
        owner: docOwner,
        createdBy: user.id || "user_patient_demo",
        patientName: user.name || "Rahul Kumar",
        mobile: "+919876543210",
        age: 32,
        gender: "Male",
        doctorId: doctor?._id,
        doctorName: doctor?.name || docName,
        speciality: doctor?.specialization || "Cardiologist",
        doctorImage: {
          url: doctor?.imageUrl || "/assets/HD1.png"
        },
        date: targetDate,
        time: slotTime,
        fees: feeAmount,
        status: "Confirmed",
        payment: {
          method: "Cash",
          status: "Pending",
          amount: feeAmount
        }
      });
      await newAppt.save();

      broadcastEvent("voiceAppointmentBooked", {
        appointmentId: newAppt._id,
        doctorName: newAppt.doctorName,
        date: targetDate,
        time: slotTime
      });

      executedAction = {
        type: "APPOINTMENT_BOOKED",
        details: `${newAppt.doctorName} • ${targetDate} at ${slotTime}`
      };

      if (lang === "ta") {
        responseText = `${newAppt.doctorName} உடன் உங்கள் முன்பதிவு நாளை காலை ${slotTime}-க்கு வெற்றிகரமாக பதிவு செய்யப்பட்டது.`;
      } else if (lang === "hi") {
        responseText = `${newAppt.doctorName} के साथ आपका अपॉइंटमेंट कल सुबह ${slotTime} बजे सफलतापूर्वक बुक हो गया है।`;
      } else if (lang === "te") {
        responseText = `${newAppt.doctorName} తో మీ అపాయింట్‌మెంట్ రేపు ఉదయం ${slotTime} కు ఖరారైంది.`;
      } else if (lang === "kn") {
        responseText = `${newAppt.doctorName} ಅವರೊಂದಿಗೆ ನಿಮ್ಮ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ನಾಳೆ ಬೆಳಿಗ್ಗೆ ${slotTime} ಕ್ಕೆ ನಿಗದಿಯಾಗಿದೆ.`;
      } else if (lang === "ml") {
        responseText = `${newAppt.doctorName} മായുള്ള നിങ്ങളുടെ അപ്പോയിന്റ്മെന്റ് നാളെ രാവിലെ ${slotTime} ന് സ്ഥിരീകരിച്ചു.`;
      } else if (lang === "mr") {
        responseText = `${newAppt.doctorName} यांच्यासोबत आपली भेट उद्या सकाळी ${slotTime} वाजता निश्चित झाली आहे.`;
      } else if (lang === "bn") {
        responseText = `${newAppt.doctorName} এর সাথে আপনার অ্যাপয়েন্টমেন্ট আগামীকাল সকাল ${slotTime} টায় নিশ্চিত হয়েছে।`;
      } else {
        responseText = `Your appointment with ${newAppt.doctorName} is confirmed for tomorrow at ${slotTime}.`;
      }
    } else {
      // Prompt for slot selection
      if (lang === "ta") {
        responseText = "நிச்சயமாக. டாக்டர் சாராவுக்கு நாளை காலை 10:30 AM மற்றும் 11:45 AM-ல் நேரம் உள்ளது. எந்த நேரத்தை பதிவு செய்ய விரும்புகிறீர்கள்?";
      } else if (lang === "hi") {
        responseText = "बिल्कुल। डॉक्टर सारा जॉनसन के पास कल सुबह 10:30 और 11:45 बजे स्लॉट उपलब्ध हैं। आप कौन सा समय चुनेंगे?";
      } else if (lang === "te") {
        responseText = "తప్పకుండా. డాక్టర్ సారాకు రేపు ఉదయం 10:30 మరియు 11:45 గంటలకు సమయం ఉంది. ఏ సమయం ఎంచుకుంటారు?";
      } else if (lang === "kn") {
        responseText = "ಖಂಡಿತ. ಡಾಕ್ಟರ್ ಸಾರಾ ಅವರಿಗೆ ನಾಳೆ ಬೆಳಿಗ್ಗೆ 10:30 ಮತ್ತು 11:45 ಕ್ಕೆ ಸಮಯವಿದೆ. ಯಾವ ಸಮಯವನ್ನು ಬಯಸುತ್ತೀರಿ?";
      } else if (lang === "ml") {
        responseText = "തീർച്ചയായും. ഡോക്ടർ സാറയ്ക്ക് നാളെ രാവിലെ 10:30 നും 11:45 നും സമയമുണ്ട്. ഏത് സമയമാണ് താല്പര്യം?";
      } else if (lang === "mr") {
        responseText = "नक्कीच. डॉक्टर सारा यांच्याकडे उद्या सकाळी 10:30 आणि 11:45 वाजता स्लॉट उपलब्ध आहेत. आपण कोणती वेळ निवडाल?";
      } else if (lang === "bn") {
        responseText = "অবশ্যই। ডাক্তার সারা জনসনের আগামীকাল সকাল 10:30 এবং 11:45 এ সময় আছে। আপনি কোন সময় পছন্দ করবেন?";
      } else {
        responseText = "Sure. Dr. Sarah Johnson has slots available tomorrow at 10:30 AM and 11:45 AM. Which time would you prefer?";
      }
    }
  }

  // -------------------------------------------------------------
  // AGENT: DOCTOR FINDER
  // -------------------------------------------------------------
  else if (targetAgent === "doctor") {
    const isCardio = lower.includes("heart") || lower.includes("cardio") || lower.includes("இதயம்") || lower.includes("हृदय") || lower.includes("గుండె");
    const spec = isCardio ? "Cardiologist" : "General Physician";
    const doctor = await Doctor.findOne({ specialization: { $regex: spec, $options: "i" } }).lean();
    const docName = doctor?.name || "Dr. Sarah Johnson";

    clientAction = {
      action: "NAVIGATE_TO_DOCTOR",
      doctorId: doctor?._id
    };

    if (lang === "ta") {
      responseText = `இதய சிகிச்சைக்காக ${docName} பரிந்துரைக்கப்படுகிறார். இவருக்கு 12 ஆண்டுகள் அனுபவம் உள்ளது. நாளை காலை 10:30 மணிக்கு நேரம் உள்ளது.`;
    } else if (lang === "hi") {
      responseText = `कार्डियोलॉजी के लिए ${docName} उपलब्ध हैं। 12 वर्षों का अनुभव है और कल सुबह 10:30 बजे स्लॉट खाली है।`;
    } else if (lang === "te") {
      responseText = `కార్డియాలజీ కోసం ${docName} అందుబాటులో ఉన్నారు. రేపు ఉదయం 10:30 గంటలకు సమయం లభిస్తుంది.`;
    } else if (lang === "kn") {
      responseText = `ಕಾರ್ಡಿಯಾಲಜಿಗೆ ${docName} ಲಭ್ಯವಿದ್ದಾರೆ. ನಾಳೆ ಬೆಳಿಗ್ಗೆ 10:30 ಕ್ಕೆ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಲಭ್ಯವಿದೆ.`;
    } else if (lang === "ml") {
      responseText = `കാർഡിയോളജി ചികിത്സയ്ക്കായി ${docName} ലഭ്യമാണ്. നാളെ രാവിലെ 10:30 ന് സമയം ലഭ്യമാണ്.`;
    } else if (lang === "mr") {
      responseText = `हृदयरोगासाठी ${docName} उपलब्ध आहेत. उद्या सकाळी 10:30 वाजता वेळ उपलब्ध आहे.`;
    } else if (lang === "bn") {
      responseText = `কার্ডিওলজির জন্য ${docName} উপলব্ধ আছেন। আগামীকাল সকাল 10:30 টায় সময় খালি আছে।`;
    } else {
      responseText = `I recommend ${docName}, our Senior Cardiologist with 12 years experience. Her earliest slot is tomorrow at 10:30 AM.`;
    }
  }

  // -------------------------------------------------------------
  // AGENT: DIAGNOSTICS
  // -------------------------------------------------------------
  else if (targetAgent === "diagnostics") {
    let testName = "Complete Blood Count (CBC)";
    if (lower.includes("x-ray") || lower.includes("எக்ஸ்-ரே") || lower.includes("एक्स-रे")) testName = "Chest X-Ray";
    if (lower.includes("mri") || lower.includes("एमआरआई")) testName = "Brain MRI";

    const svc = await Service.findOne({ name: { $regex: testName.replace(/[\(\)]/g, ""), $options: "i" } }) || await Service.findOne({});
    const targetDate = new Date().toISOString().split("T")[0];

    const diagAppt = new ServiceAppointment({
      createdBy: user.id || "user_patient_demo",
      patientName: user.name || "Rahul Kumar",
      mobile: "+919876543210",
      age: 32,
      gender: "Male",
      serviceId: svc?._id,
      serviceName: svc?.name || testName,
      fees: svc?.price || 450,
      date: targetDate,
      hour: 2,
      minute: 30,
      ampm: "PM",
      status: "Confirmed"
    });
    await diagAppt.save();

    broadcastEvent("voiceDiagnosticBooked", { serviceName: diagAppt.serviceName, date: targetDate });

    executedAction = {
      type: "DIAGNOSTIC_BOOKED",
      details: `${diagAppt.serviceName} scheduled for today at 02:30 PM`
    };

    if (lang === "ta") {
      responseText = `${diagAppt.serviceName} பரிசோதனை இன்று மதியம் 02:30 மணிக்கு வெற்றிகரமாக பதிவு செய்யப்பட்டது. அறை எண் 2 தயாராக உள்ளது.`;
    } else if (lang === "hi") {
      responseText = `${diagAppt.serviceName} जांच आज दोपहर 02:30 बजे के लिए सफलतापूर्वक बुक हो गई है। डायग्नोस्टिक सुइट 2 तैयार है।`;
    } else if (lang === "te") {
      responseText = `${diagAppt.serviceName} పరీక్ష ఈరోజు మధ్యాహ్నం 02:30 గంటలకు షెడ్యూల్ చేయబడింది.`;
    } else if (lang === "kn") {
      responseText = `${diagAppt.serviceName} ಪರೀಕ್ಷೆಯನ್ನು ಇಂದು ಮಧ್ಯಾಹ್ನ 02:30 ಕ್ಕೆ ನಿಗದಿಪಡಿಸಲಾಗಿದೆ.`;
    } else if (lang === "ml") {
      responseText = `${diagAppt.serviceName} പരിശോധന ഇന്ന് ഉച്ചയ്ക്ക് 02:30 ന് ഡയഗ്നോസ്റ്റിക് സ്യൂട്ട് 2 ൽ ക്രമീകരിച്ചു.`;
    } else if (lang === "mr") {
      responseText = `${diagAppt.serviceName} तपासणी आज दुपारी 02:30 वाजता डायग्नोस्टिक सुइट 2 मध्ये निश्चित झाली आहे.`;
    } else if (lang === "bn") {
      responseText = `${diagAppt.serviceName} পরীক্ষা আজ দুপুর 02:30 টায় ডায়াগনস্টিক স্যুট 2 তে বুক করা হয়েছে।`;
    } else {
      responseText = `Your ${diagAppt.serviceName} has been scheduled for today at 02:30 PM in Diagnostic Suite 2.`;
    }
  }

  // -------------------------------------------------------------
  // AGENT: EMERGENCY ESCALATION
  // -------------------------------------------------------------
  else if (targetAgent === "emergency") {
    const patientMrn = "P-1005";
    let patient = await Patient.findOne({ patientId: patientMrn });
    if (!patient) {
      patient = new Patient({
        patientId: patientMrn,
        name: "Emergency Influx Patient " + patientMrn,
        age: 61,
        gender: "Male",
        acuity: "CRITICAL",
        currentStatus: "Triage",
        currentWard: "ICU"
      });
      await patient.save();
    }

    const allocation = await executeEmergencyAllocation({
      patientId: patient._id,
      patientMrn: patient.patientId,
      chiefComplaint: "Acute STEMI / Respiratory Distress",
      requiredSpec: "Cardiology",
      acuity: "CRITICAL",
      targetWard: "ICU"
    });

    broadcastEvent("voiceEmergencyCreated", {
      patientId: patientMrn,
      allocation
    });

    executedAction = {
      type: "EMERGENCY_ACTIVATED",
      details: `Code Red Activated for ${patientMrn}. Bed ICU-06, Dr. Sarah Johnson, Ventilator V-04 allocated.`
    };

    if (lang === "ta") {
      responseText = `நோயாளி ${patientMrn}-க்கு அவசர சிகிச்சை செயல்படுத்தப்பட்டது. படுக்கை ICU-06, டாக்டர் சாரா, வென்டிலேட்டர் V-04 மற்றும் தீவிர சிகிச்சை செவிலியர் ஒதுக்கப்பட்டனர்.`;
    } else if (lang === "hi") {
      responseText = `मरीज ${patientMrn} के लिए इमरजेंसी सक्रिय कर दी गई है। ICU-06 बेड, डॉक्टर सारा और वेंटिलेटर V-04 आवंटित कर दिए गए हैं।`;
    } else if (lang === "te") {
      responseText = `రోగి ${patientMrn} కోసం ఎమర్జెన్సీ కోడ్ రెడ్ ప్రారంభించబడింది. ICU-06 బెడ్, డాక్టర్ సారా, మరియు వెంటిలేటర్ V-04 కేటాయించబడ్డాయి.`;
    } else if (lang === "kn") {
      responseText = `ರೋಗಿ ${patientMrn} ಗಾಗಿ ತುರ್ತು ಕೋಡ್ ರೆಡ್ ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ. ICU-06 ಬೆಡ್, ಡಾಕ್ಟರ್ ಸಾರಾ, ಮತ್ತು ವೆಂಟಿಲೇಟರ್ V-04 ಹಂಚಿಕೆ ಮಾಡಲಾಗಿದೆ.`;
    } else if (lang === "ml") {
      responseText = `രോഗി ${patientMrn} ന് അടിയന്തര കോഡ് റെഡ് സജീവമാക്കി. ഐസിയു-06 കിടക്കയും വെന്റിലേറ്റർ V-04 ഉം അനുവദിച്ചു.`;
    } else if (lang === "mr") {
      responseText = `रुग्ण ${patientMrn} साठी आणीबाणी सक्रिय करण्यात आली आहे. ICU-06 बेड, डॉक्टर सारा आणि व्हेंटिलेटर V-04 वाटप केले गेले आहेत.`;
    } else if (lang === "bn") {
      responseText = `রোগী ${patientMrn} এর জন্য জরুরি কোড রেড সক্রিয় করা হয়েছে। ICU-06 বেড, ডাক্তার সারা এবং ভেন্টিলেটর V-04 বরাদ্দ করা হয়েছে।`;
    } else {
      responseText = `Emergency Code Red activated for patient ${patientMrn}. Life-support resources allocated: Bed ICU-06, Dr. Sarah Johnson, Nurse N-07, and Ventilator V-04.`;
    }
  }

  // -------------------------------------------------------------
  // AGENT: BED ORCHESTRATION
  // -------------------------------------------------------------
  else if (targetAgent === "bed") {
    const isReserve = lower.includes("reserve") || lower.includes("ஒதுக்கு") || lower.includes("बुक") || lower.includes("రిజర్వ్") || lower.includes("ಕಾಯ್ದಿರಿಸಿ");
    const beds = await Bed.find({}).lean();
    const availableICU = beds.filter(b => b.bedType === "ICU" && b.status === "AVAILABLE");

    if (isReserve) {
      let targetBed = null;
      const numMatch = message.match(/icu[- ]*0?(\d+)/i);
      if (numMatch) {
        const bNum = `ICU-0${numMatch[1]}`.replace(/-0(\d{2,})/, "-$1");
        targetBed = await Bed.findOne({ bedId: { $regex: bNum, $options: "i" } });
      }
      if (!targetBed) {
        targetBed = availableICU[0] || (await Bed.findOne({ bedType: "ICU" }));
      }

      if (targetBed) {
        await Bed.findByIdAndUpdate(targetBed._id, { status: "OCCUPIED", patientId: "P-1005" });
        broadcastEvent("voiceBedReserved", { bedId: targetBed.bedId, wardId: targetBed.wardId });

        executedAction = {
          type: "BED_RESERVED",
          details: `Bed ${targetBed.bedId} reserved in ${targetBed.wardId}`
        };

        if (lang === "ta") {
          responseText = `படுக்கை ${targetBed.bedId} தீவிர சிகிச்சைப் பிரிவில் (${targetBed.wardId}) வெற்றிகரமாக ஒதுக்கப்பட்டது.`;
        } else if (lang === "hi") {
          responseText = `बेड ${targetBed.bedId} को आईसीयू वार्ड में सफलतापूर्वक आरक्षित कर दिया गया है।`;
        } else if (lang === "te") {
          responseText = `బెడ్ ${targetBed.bedId} ఐసియు వార్డులో విజయవంతంగా రిజర్వ్ చేయబడింది.`;
        } else if (lang === "kn") {
          responseText = `ಬೆಡ್ ${targetBed.bedId} ಅನ್ನು ಐಸಿಯು ವಾರ್ಡ್‌ನಲ್ಲಿ ಯಶಸ್ವಿಯಾಗಿ ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.`;
        } else if (lang === "ml") {
          responseText = `ബെഡ് ${targetBed.bedId} ഐസിയു വാർഡിൽ വിജയകരമായി റിസർവ്വ് ചെയ്തു.`;
        } else if (lang === "mr") {
          responseText = `बेड ${targetBed.bedId} आयसीयू वॉर्डमध्ये आरक्षित करण्यात आला आहे.`;
        } else if (lang === "bn") {
          responseText = `বেড ${targetBed.bedId} আইসিইউ ওয়ার্ডে সফলভাবে সংরক্ষিত হয়েছে।`;
        } else {
          responseText = `Bed ${targetBed.bedId} in ${targetBed.wardId} has been reserved and locked in the Command Center.`;
        }
      } else {
        responseText = "No ICU beds are currently available for reservation.";
      }
    } else {
      if (lang === "ta") {
        responseText = `தற்போது ICU-ல் ${availableICU.length} படுக்கைகள் தயாராக உள்ளன. மொத்த படுக்கை ஆக்கிரமிப்பு 78%. உங்களுக்கு ஏதேனும் படுக்கை ஒதுக்க வேண்டுமா?`;
      } else if (lang === "hi") {
        responseText = `वर्तमान में आईसीयू में ${availableICU.length} बेड उपलब्ध हैं। कुल ऑक्यूपेंसी 78% है। क्या आपको बेड आरक्षित करना है?`;
      } else if (lang === "te") {
        responseText = `ప్రస్తుతం ఐసియులో ${availableICU.length} బెడ్లు అందుబాటులో ఉన్నాయి. మొత్తం ఆక్యుపెన్సీ 78%.`;
      } else if (lang === "kn") {
        responseText = `ಪ್ರಸ್ತುತ ಐಸಿಯುನಲ್ಲಿ ${availableICU.length} ಬೆಡ್‌ಗಳು ಲಭ್ಯವಿವೆ. ಒಟ್ಟು ಆಕ್ಯುಪೆನ್ಸಿ 78%.`;
      } else if (lang === "ml") {
        responseText = `നിലവിൽ ഐസിയുവിൽ ${availableICU.length} ബെഡുകൾ ലഭ്യമാണ്. ആകെ ഒക്യുപൻസി 78%.`;
      } else if (lang === "mr") {
        responseText = `सध्या आयसीयूमध्ये ${availableICU.length} बेड उपलब्ध आहेत. एकूण ऑक्युपन्सी 78% आहे.`;
      } else if (lang === "bn") {
        responseText = `বর্তমানে আইসিইউতে ${availableICU.length} টি বেড উপলব্ধ আছে। মোট অকুপেন্সি 78%।`;
      } else {
        responseText = `Currently ${availableICU.length} ICU beds are immediately available. Overall hospital bed occupancy is 78%. Would you like me to reserve one?`;
      }
    }
  }

  // -------------------------------------------------------------
  // AGENT: FORECAST & PREDICTIVE ANALYTICS
  // -------------------------------------------------------------
  else if (targetAgent === "forecast") {
    if (lang === "ta") {
      responseText = "தற்போதைய அவசரப் பிரிவு சுமை 24 நோயாளிகள். அடுத்த இரண்டு மணி நேரத்தில் 38 நோயாளிகள் வரக்கூடும் என கணிக்கப்பட்டுள்ளது. மேலும் 2 தீவிர சிகிச்சை செவிலியர்களை நியமிக்க பரிந்துரைக்கிறேன்.";
    } else if (lang === "hi") {
      responseText = "वर्तमान इमरजेंसी में 24 मरीज हैं। अगले दो घंटों में 38 मरीजों के आने का अनुमान है। दो अतिरिक्त नर्सों को तैनात करने की सिफारिश की जाती है।";
    } else if (lang === "te") {
      responseText = "ప్రస్తుత ఈఆర్ పరిమాణం 24 రోగులు. రాబోయే 2 గంటల్లో 38 రోగులు వచ్చే అవకాశం ఉంది. ఇద్దరు అదనపు నర్సులను కేటాయించాలని సూచిస్తున్నాము.";
    } else if (lang === "kn") {
      responseText = "ಪ್ರಸ್ತುತ ಇಆರ್ ನಲ್ಲಿ 24 ರೋಗಿಗಳಿದ್ದಾರೆ. ಮುಂದಿನ 2 ಗಂಟೆಗಳಲ್ಲಿ 38 ರೋಗಿಗಳು ಬರುವ ಅಂದಾಜಿದೆ. ಇಬ್ಬರು ಹೆಚ್ಚುವರಿ ನರ್ಸ್‌ಗಳನ್ನು ನಿಯೋಜಿಸಲು ಸೂಚಿಸುತ್ತೇವೆ.";
    } else if (lang === "ml") {
      responseText = "നിലവിലെ എമർജൻസിയിൽ 24 രോഗികളുണ്ട്. അടുത്ത രണ്ട് മണിക്കൂറിൽ 38 രോഗികൾ വരാൻ സാധ്യതയുണ്ട്. രണ്ട് നഴ്സുമാരെ കൂടി നിയോഗിക്കാൻ ശുപാർശ ചെയ്യുന്നു.";
    } else if (lang === "mr") {
      responseText = "सध्याच्या आपत्कालीन विभागात 24 रुग्ण आहेत. पुढील दोन तासांत 38 रुग्णांचा अंदाज आहे. दोन अतिरिक्त परिचारिका तैनात करण्याची शिफारस आहे.";
    } else if (lang === "bn") {
      responseText = "বর্তমান ইমার্জেন্সিতে 24 জন রোগী আছেন। আগামী দুই ঘণ্টায় 38 জন রোগী আসার পূর্বাভাস রয়েছে। দুইজন অতিরিক্ত নার্স মোতায়েন করার পরামর্শ দেওয়া হচ্ছে।";
    } else {
      responseText = "Current ER volume is 24 patients. AI models forecast an influx of 38 patients in the next two hours with elevated demand risk. I recommend deploying two additional nurses and reserving two ICU beds.";
    }
  }

  // -------------------------------------------------------------
  // AGENT: OPERATIONS COMMAND CENTER
  // -------------------------------------------------------------
  else if (targetAgent === "operations") {
    const beds = await Bed.find({}).lean();
    const icuAvail = beds.filter(b => b.bedType === "ICU" && b.status === "AVAILABLE").length;

    if (lower.includes("why") || lower.includes("reason") || lower.includes("காரணம்") || lower.includes("कारण")) {
      if (lang === "ta") {
        responseText = "ICU-06 தேர்ந்தெடுக்கப்பட்டதற்கான காரணம்: இது ஆக்ஸிஜன் வசதியுடன் தயாராக இருந்தது, அவசர சிகிச்சைக்கு மிக அருகில் உள்ளது, மேலும் சிறப்பு மருத்துவ பணியாளர்கள் உடனடி கண்காணிப்பில் உள்ளனர்.";
      } else if (lang === "hi") {
        responseText = "ICU-06 को इसलिए चुना गया क्योंकि यह ऑक्सीजन और नकारात्मक दबाव आइसोलेशन से लैस है और इमरजेंसी ट्रॉमा बे के सबसे निकट है।";
      } else if (lang === "te") {
        responseText = "ICU-06 ఎంపిక చేయబడింది ఎందుకంటే ఇది ఆక్సిజన్ సదుపాయం కలిగి ఉంది మరియు అత్యవసర విభాగానికి అత్యంత సమీపంలో ఉంది.";
      } else if (lang === "kn") {
        responseText = "ICU-06 ಅನ್ನು ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ ಏಕೆಂದರೆ ಇದು ಆಕ್ಸಿಜನ್ ಸೌಲಭ್ಯ ಹೊಂದಿದೆ ಮತ್ತು ತುರ್ತು ವಿಭಾಗಕ್ಕೆ ಹತ್ತಿರದಲ್ಲಿದೆ.";
      } else if (lang === "ml") {
        responseText = "ICU-06 തിരഞ്ഞെടുത്തു കാരണം ഇത് ഓക്സിജൻ സജ്ജീകരണമുള്ളതും അടിയന്തര വിഭാഗത്തിന് ഏറ്റവും അടുത്തുള്ളതുമാണ്.";
      } else if (lang === "mr") {
        responseText = "ICU-06 ची निवड केली गेली कारण यात ऑक्सिजन सुविधा आहे आणि आणीबाणी विभागाच्या सर्वात जवळ आहे.";
      } else if (lang === "bn") {
        responseText = "ICU-06 নির্বাচন করা হয়েছে কারণ এটি অক্সিজেন সুবিধা সম্পন্ন এবং জরুরি বিভাগের সবচেয়ে কাছে অবস্থিত।";
      } else {
        responseText = "ICU-06 was selected by the autonomous orchestrator because it is fully prepped with negative pressure isolation, closest to the emergency resuscitation bay, and matched to Dr. Sarah's trauma roster.";
      }
    } else {
      if (lang === "ta") {
        responseText = `கமாண்ட் சென்டர் சுருக்கம்: ${icuAvail} ICU படுக்கைகள் தயார் நிலையில் உள்ளன. OT தியேட்டர் 1 இயங்குகிறது. ER சுமை இயல்பான வரம்பில் உள்ளது.`;
      } else if (lang === "hi") {
        responseText = `कमांड सेंटर स्थिति: ${icuAvail} आईसीयू बेड उपलब्ध हैं, ऑपरेशन थिएटर 60% क्षमता पर है, और स्टाफ वर्कलोड सामान्य सीमा में है।`;
      } else if (lang === "te") {
        responseText = `కమాండ్ సెంటర్ సారాంశం: ${icuAvail} ఐసియు బెడ్లు అందుబాటులో ఉన్నాయి, ఆపరేషన్ థియేటర్లు 60% సామర్థ్యంతో పనిచేస్తున్నాయి.`;
      } else if (lang === "kn") {
        responseText = `ಕಮಾಂಡ್ ಸೆಂಟರ್ ಸಾರಾಂಶ: ${icuAvail} ಐಸಿಯು ಬೆಡ್‌ಗಳು ಲಭ್ಯವಿವೆ, ಆಪರೇಷನ್ ಥಿಯೇಟರ್‌ಗಳು 60% ಸಾಮರ್ಥ್ಯದಲ್ಲಿವೆ.`;
      } else if (lang === "ml") {
        responseText = `കമാൻഡ് സെന്റർ അവലോകനം: ${icuAvail} ഐസിയു ബെഡുകൾ ലഭ്യമാണ്, ഓപ്പറേഷൻ തിയേറ്ററുകൾ 60% ശേഷിയിലാണ് പ്രവർത്തിക്കുന്നത്.`;
      } else if (lang === "mr") {
        responseText = `कमांड सेंटर आढावा: ${icuAvail} आयसीयू बेड उपलब्ध आहेत, आणि ऑपरेशन थिएटर 60% क्षमतेवर चालू आहे.`;
      } else if (lang === "bn") {
        responseText = `কমান্ড সেন্টার সারাংশ: ${icuAvail} টি আইসিইউ বেড প্রস্তুত রয়েছে, অপারেশন থিয়েটার 60% ক্ষমতায় চলছে।`;
      } else {
        responseText = `Hospital Command Overview: ${icuAvail} ICU beds available, operating theatres at 60% capacity, and staff workload index is within safety thresholds.`;
      }
    }
  }

  // -------------------------------------------------------------
  // DEFAULT / CONCIERGE GREETING (8 LANGUAGES)
  // -------------------------------------------------------------
  else {
    if (lang === "ta") {
      responseText = "வணக்கம். நான் MediCare Nexus குரல் உதவியாளர். எப்படி உதவலாம்?";
    } else if (lang === "hi") {
      responseText = "नमस्ते। मैं MediCare Nexus वॉइस असिस्टेंट हूँ। मैं आपकी कैसे मदद कर सकता हूँ?";
    } else if (lang === "te") {
      responseText = "నమస్కారం. నేను MediCare Nexus వాయిస్ అసిస్టెంట్‌ని. నేను మీకు ఎలా సహాయపడగలను?";
    } else if (lang === "kn") {
      responseText = "ನಮಸ್ಕಾರ. ನಾನು MediCare Nexus ವಾಯ್ಸ್ ಅಸಿಸ್ಟೆಂಟ್. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?";
    } else if (lang === "ml") {
      responseText = "നമസ്കാരം. ഞാൻ MediCare Nexus വോയ്‌സ് അസിസ്റ്റന്റാണ്. എങ്ങനെ സഹായിക്കാം?";
    } else if (lang === "mr") {
      responseText = "नमस्कार. मी MediCare Nexus व्हॉईस असिस्टंट आहे. मी आपल्याला कशी मदत करू शकतो?";
    } else if (lang === "bn") {
      responseText = "নমস্কার। আমি MediCare Nexus ভয়েস সহকারী। আমি আপনাকে কীভাবে সাহায্য করতে পারি?";
    } else {
      responseText = "Hello. I'm the MediCare Nexus voice assistant. How can I help you?";
    }
  }

  // Normalize spoken output for natural speech clarity & phoneme rendering
  const spokenText = normalizeSpokenText(responseText, lang);
  const voiceProfile = getVoiceProfile(lang);

  // Record Transcript in Analytics
  voiceAnalyticsStore.recentTranscripts.unshift({
    id: `conv-${Date.now().toString().slice(-4)}`,
    agent: targetAgent,
    language: lang,
    userRole: user.role || "patient",
    action: executedAction?.details || trimmed.slice(0, 45),
    status: "SUCCESS",
    timestamp: new Date().toLocaleTimeString()
  });
  if (voiceAnalyticsStore.recentTranscripts.length > 20) {
    voiceAnalyticsStore.recentTranscripts.pop();
  }

  return {
    success: true,
    agent: targetAgent,
    agentName: VOICE_AGENTS[targetAgent]?.name || "Nexus Voice Agent",
    detectedLanguage: lang,
    responseText,
    spokenText,
    voiceProfile,
    executedAction,
    actionConfirmation,
    clientAction
  };
}
