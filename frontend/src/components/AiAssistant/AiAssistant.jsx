// src/components/AiAssistant/AiAssistant.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  Sparkles,
  Send,
  X,
  User,
  Heart,
  ChevronRight,
  ClipboardList,
} from "lucide-react";

// Mapping of patient symptoms/keywords to doctor specializations and diagnostic tests
const specializationMapping = {
  Cardiologist: {
    keywords: ["heart", "chest pain", "cardiac", "pulse", "rhythm", "breathless", "palpitation", "coronary", "blood pressure", "hypertension"],
    symptoms: "heart-related issues, chest pain, palpitations, high blood pressure, or breathing difficulty",
    test: "Lipid Profile"
  },
  Neurologist: {
    keywords: ["headache", "migraine", "brain", "nerve", "stroke", "epilepsy", "seizure", "numbness", "dizzy", "dizziness", "paralysis", "memory"],
    symptoms: "migraines, chronic headaches, nerve pain, seizures, or dizziness",
    test: "Thyroid Profile (T3, T4, TSH)"
  },
  Pediatrician: {
    keywords: ["child", "baby", "kid", "pediatric", "fever child", "infant", "growth child", "vaccine kid", "toddler"],
    symptoms: "infant, child, or toddler health issues, pediatric vaccinations, and childhood development",
    test: "Complete Blood Count (CBC)"
  },
  "Orthopedic Surgeon": {
    keywords: ["bone", "joint", "fracture", "muscle pain", "sprain", "ortho", "spine", "back pain", "knee", "shoulder", "ligament", "accident"],
    symptoms: "bone fractures, joint pain, back or spine issues, knee problems, or sports injuries",
    test: "X-Ray Chest"
  },
  Dermatologist: {
    keywords: ["skin", "rash", "acne", "pimple", "itch", "pigmentation", "hair fall", "dandruff", "eczema", "allergy skin", "nail"],
    symptoms: "acne, skin rashes, itching, hair fall, dandruff, or skin allergies",
    test: "Complete Blood Count (CBC)"
  },
  Psychiatrist: {
    keywords: ["mood", "anxiety", "depression", "mental", "behavior", "psychiatric", "sleep", "stress", "adhd", "bipolar"],
    symptoms: "severe mood changes, chronic anxiety, depression, sleep disorders, or behavioral changes",
    test: "Complete Blood Count (CBC)"
  },
  Psychologist: {
    keywords: ["therapy", "stress", "relationship", "counseling", "grief", "anxiety mild", "depression talk", "talk therapy", "mental health"],
    symptoms: "emotional stress, relationship difficulties, mental health counseling, or mild anxiety/depression",
    test: "Complete Blood Count (CBC)"
  },
  Gynecologist: {
    keywords: ["pregnancy", "period", "menstruation", "gyne", "womens health", "fertility", "infertility", "uterus", "ovary", "pcos"],
    symptoms: "pregnancy care, menstrual cycle issues, women's reproductive health, or fertility concerns",
    test: "Ultrasound Whole Abdomen"
  },
  Oncologist: {
    keywords: ["cancer", "tumor", "chemo", "chemotherapy", "oncology", "malignant", "biopsy"],
    symptoms: "cancer diagnosis, tumor evaluation, chemotherapy, or cancer treatment plans",
    test: "Complete Blood Count (CBC)"
  },
  "ENT Specialist": {
    keywords: ["ear", "nose", "throat", "sinus", "tonsil", "hearing", "snoring", "allergy cold", "throat pain", "ent"],
    symptoms: "ear infections, hearing loss, sinus congestion, tonsil issues, or persistent sore throat",
    test: "Complete Blood Count (CBC)"
  },
  "General Physician": {
    keywords: ["fever", "cold", "cough", "flu", "weakness", "body pain", "stomach ache", "infection", "headache mild", "viral", "fatigue", "general checkup"],
    symptoms: "general illness, common cold, flu, mild fever, body fatigue, or overall wellness checkups",
    test: "Complete Blood Count (CBC)"
  },
  Pulmonologist: {
    keywords: ["lung", "breathing", "asthma", "copd", "cough blood", "bronchitis", "respiratory", "wheezing"],
    symptoms: "chronic asthma, breathing difficulties, lung infections, or respiratory conditions",
    test: "X-Ray Chest"
  },
  Dentist: {
    keywords: ["tooth", "teeth", "dental", "braces", "root canal", "cavity", "gum", "bleeding gums", "mouth", "smile"],
    symptoms: "tooth cavities, root canal procedures, dental braces, or gum bleeding",
    test: "Complete Blood Count (CBC)"
  },
  Physiotherapist: {
    keywords: ["rehab", "exercise", "physical therapy", "injury recovery", "muscle sprain", "posture", "back stiffness", "joints stiffness"],
    symptoms: "muscle rehabilitation, injury recovery, posture correction, or joint stiffness",
    test: "Complete Blood Count (CBC)"
  },
  "Eye Specialist": {
    keywords: ["eye", "vision", "cataract", "blurry", "glasses", "spectacles", "lens", "conjunctivitis", "itchy eye"],
    symptoms: "vision problems, blurry vision, cataracts, eye irritation, or prescription glasses",
    test: "Complete Blood Count (CBC)"
  },
  Gastroenterologist: {
    keywords: ["stomach", "digestion", "acid", "acidity", "gas", "constipation", "diarrhea", "liver", "endoscopy", "gastro"],
    symptoms: "acidity, severe gas, stomach digestion issues, constipation, or liver concerns",
    test: "Liver Function Test (LFT)"
  },
  Urologist: {
    keywords: ["urine", "urinary", "kidney stone", "prostate", "uti", "bladder"],
    symptoms: "urinary tract infections (UTI), kidney stones, or bladder/prostate issues",
    test: "Kidney Function Test (KFT)"
  },
  Nutritionist: {
    keywords: ["diet", "weight", "obesity", "nutrition", "fat", "calories", "meal plan", "lose weight", "gain weight"],
    symptoms: "weight loss or gain guidance, personalized diet charts, nutrition consults, or healthy meal plans",
    test: "Lipid Profile"
  },
  Radiologist: {
    keywords: ["mri", "ct scan", "ultrasound", "x-ray check", "imaging", "scan result"],
    symptoms: "diagnosing scans, MRI, CT scans, ultrasounds, or body imaging interpretation",
    test: "Ultrasound Whole Abdomen"
  },
  Nephrologist: {
    keywords: ["kidney", "dialysis", "renal", "kidney failure", "protein urine"],
    symptoms: "kidney health, dialysis, renal function issues, or chronic kidney concerns",
    test: "Kidney Function Test (KFT)"
  }
};

const serviceMappings = [
  {
    name: "Complete Blood Count (CBC)",
    keywords: ["blood cell", "blood count", "cbc", "anemia", "infection blood", "weakness blood"],
    recommendedSpecialty: "General Physician"
  },
  {
    name: "Lipid Profile",
    keywords: ["cholesterol", "lipid", "fat blood", "coronary fat", "heart fat"],
    recommendedSpecialty: "Cardiologist"
  },
  {
    name: "Thyroid Profile (T3, T4, TSH)",
    keywords: ["thyroid", "tsh", "t3", "t4", "goiter", "hormone thyroid"],
    recommendedSpecialty: "General Physician"
  },
  {
    name: "Liver Function Test (LFT)",
    keywords: ["liver", "bilirubin", "lft", "jaundice", "hepatitis"],
    recommendedSpecialty: "Gastroenterologist"
  },
  {
    name: "Kidney Function Test (KFT)",
    keywords: ["kidney check", "creatinine", "kft", "urea", "renal test"],
    recommendedSpecialty: "Nephrologist"
  },
  {
    name: "X-Ray Chest",
    keywords: ["chest x-ray", "lung x-ray", "pneumonia chest", "x-ray ribs"],
    recommendedSpecialty: "Pulmonologist"
  },
  {
    name: "Ultrasound Whole Abdomen",
    keywords: ["ultrasound", "abdomen scan", "stomach scan", "kidney stone ultrasound", "gallbladder ultrasound"],
    recommendedSpecialty: "Gastroenterologist"
  },
  {
    name: "HbA1c (Glycated Haemoglobin)",
    keywords: ["diabetes blood", "sugar average", "hba1c", "glycated", "3 month sugar"],
    recommendedSpecialty: "General Physician"
  }
];

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I am your Medicare AI Assistant. 🩺\n\nDescribe your symptoms or health concern below, and I will recommend diagnostic tests and matching doctors for you.",
    },
  ]);

  const [doctorsList, setDoctorsList] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const messagesEndRef = useRef(null);

  // Load doctors and services from backend
  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
    
    // Fetch doctors
    fetch(`${API_BASE}/api/doctors`)
      .then((res) => res.json())
      .then((json) => {
        const items = json?.data || json?.doctors || [];
        setDoctorsList(items);
      })
      .catch((err) => console.error("Error fetching doctors for AI:", err));

    // Fetch services
    fetch(`${API_BASE}/api/services`)
      .then((res) => res.json())
      .then((json) => {
        const items = json?.data || [];
        setServicesList(items);
      })
      .catch((err) => console.error("Error fetching services for AI:", err));
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    const queryText = inputText.trim();
    setInputText("");

    // Add user message
    setMessages((prev) => [...prev, { sender: "user", text: queryText }]);

    // Analyze symptoms
    const q = queryText.toLowerCase();
    let matchedSpec = null;
    let maxScore = 0;
    let matchedTestName = null;
    let matchedServiceObj = null;

    // 1. Check if user described a specific test/service first
    let foundServiceMatch = null;
    for (const service of serviceMappings) {
      for (const keyword of service.keywords) {
        if (q.includes(keyword)) {
          foundServiceMatch = service;
          break;
        }
      }
      if (foundServiceMatch) break;
    }

    if (foundServiceMatch) {
      matchedTestName = foundServiceMatch.name;
      matchedSpec = foundServiceMatch.recommendedSpecialty;
    } else {
      // 2. Perform symptom keyword matching to find specialization
      Object.keys(specializationMapping).forEach((spec) => {
        let score = 0;
        specializationMapping[spec].keywords.forEach((keyword) => {
          if (q.includes(keyword)) {
            score += 1;
          }
        });
        if (score > maxScore) {
          maxScore = score;
          matchedSpec = spec;
        }
      });
    }

    // 3. Determine recommended test
    if (matchedSpec && !matchedTestName) {
      matchedTestName = specializationMapping[matchedSpec].test;
    }

    // Default Fallback
    if (!matchedSpec) {
      matchedSpec = "General Physician";
      matchedTestName = "Complete Blood Count (CBC)";
    }

    // 4. Find matched service object from fetched services
    if (matchedTestName && servicesList.length > 0) {
      matchedServiceObj = servicesList.find((s) =>
        (s.name || "").toLowerCase().includes(matchedTestName.toLowerCase())
      );
    }

    // 5. Get recommended doctors list
    const recommendedDocs = doctorsList
      .filter((d) => {
        const spec = (d.specialization || d.speciality || "").toLowerCase();
        return spec === matchedSpec.toLowerCase();
      })
      .map((d) => {
        const id = d._id || d.id;
        const available =
          typeof d.availability === "string"
            ? d.availability.toLowerCase() === "available"
            : d.availability === true || d.available === true;
        return {
          id,
          name: d.name,
          specialization: d.specialization || d.speciality,
          image: d.imageUrl || d.image || "/placeholder-doctor.jpg",
          available,
        };
      });

    // 6. Formulate Bot Reply
    setTimeout(() => {
      let botText = "";
      if (foundServiceMatch) {
        botText = `Based on your request, I recommend booking the **${matchedTestName}** test. For this check, consulting a **${matchedSpec}** is advised. Here are our specialists:`;
      } else {
        botText = `Based on your description, I recommend consulting a **${matchedSpec}** (specialist in ${
          specializationMapping[matchedSpec]?.symptoms || "general medicine"
        }).\n\nI also advise getting a **${matchedTestName}** test done.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: botText,
          recommendedDoctors: recommendedDocs,
          matchedService: matchedServiceObj || (matchedTestName ? { name: matchedTestName } : null),
        },
      ]);
    }, 600);
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 z-[9999] w-14 h-14 rounded-full flex items-center justify-center 
        bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xl hover:shadow-2xl 
        transition-all duration-300 transform hover:scale-110 active:scale-95 group focus:outline-none"
        title="AI Health Assistant"
        aria-label="Toggle AI Health Assistant"
      >
        {isOpen ? (
          <X size={24} className="transition-transform duration-300 rotate-90" />
        ) : (
          <div className="relative">
            <MessageSquare size={24} />
            <Sparkles size={12} className="absolute -top-2 -right-2 text-yellow-300 animate-pulse" />
          </div>
        )}
        {/* Pulse effect */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-emerald-500 opacity-20 animate-ping z-[-1]" />
        )}
      </button>

      {/* Assistant panel */}
      <div
        className={`fixed bottom-24 left-6 z-[9999] w-[370px] h-[520px] max-w-[calc(100vw-2rem)]
        bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] 
        border border-emerald-100/50 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-left
        ${isOpen ? "scale-100 opacity-100 pointer-events-auto" : "scale-75 opacity-0 pointer-events-none"}`}
      >
        {/* Panel Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Sparkles size={18} className="text-yellow-300" />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-wide">MediCare AI</h2>
              <p className="text-[10px] text-emerald-100/90 font-medium">Test & Doctor Assistant</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors focus:outline-none"
            aria-label="Close panel"
          >
            <X size={16} />
          </button>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-emerald-50/15">
          {messages.map((msg, idx) => (
            <div key={idx} className="flex flex-col">
              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm whitespace-pre-line
                ${
                  msg.sender === "user"
                    ? "self-end bg-emerald-600 text-white rounded-tr-none"
                    : "self-start bg-white text-slate-700 rounded-tl-none border border-emerald-50"
                }`}
              >
                {msg.text}
              </div>

              {/* Recommended Test Card */}
              {msg.sender === "bot" && msg.matchedService && (
                <div className="self-start w-[85%] bg-gradient-to-br from-emerald-50/80 to-teal-50/40 rounded-xl p-3.5 mt-2 border border-emerald-100 shadow-sm flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="text-emerald-600 shrink-0" size={16} />
                    <span className="font-bold text-xs text-slate-800">Diagnostic Service</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <span className="font-semibold text-xs text-slate-700 line-clamp-1">{msg.matchedService.name}</span>
                    {msg.matchedService._id || msg.matchedService.id ? (
                      <Link
                        to={`/services/${msg.matchedService._id || msg.matchedService.id}`}
                        onClick={() => setIsOpen(false)}
                        className="text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1.5 rounded-lg shrink-0 transition-colors"
                      >
                        Book Test
                      </Link>
                    ) : (
                      <Link
                        to="/services"
                        onClick={() => setIsOpen(false)}
                        className="text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1.5 rounded-lg shrink-0 transition-colors"
                      >
                        View Tests
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Recommended Doctors list */}
              {msg.sender === "bot" && msg.recommendedDoctors && msg.recommendedDoctors.length > 0 && (
                <div className="self-start w-[85%] mt-2 space-y-2">
                  <div className="flex items-center gap-1.5 px-1">
                    <Heart className="text-rose-500 shrink-0 animate-pulse" size={13} fill="currentColor" />
                    <span className="font-bold text-[10px] text-slate-500 uppercase tracking-wider">Recommended Experts</span>
                  </div>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {msg.recommendedDoctors.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-emerald-100 transition-all duration-300"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={doc.image}
                            alt={doc.name}
                            className="w-8 h-8 rounded-lg object-cover bg-slate-100 border border-slate-100"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/placeholder-doctor.jpg";
                            }}
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-[11px] text-slate-800 truncate">{doc.name}</h4>
                            <p className="text-[9px] text-slate-400 truncate">{doc.specialization}</p>
                          </div>
                        </div>
                        {doc.available ? (
                          <Link
                            to={`/doctors/${doc.id}`}
                            onClick={() => setIsOpen(false)}
                            className="w-7 h-7 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center transition-colors shrink-0"
                            title="Book Appointment"
                          >
                            <ChevronRight size={16} />
                          </Link>
                        ) : (
                          <span className="text-[8px] font-bold text-slate-400 bg-slate-50 px-1.5 py-1 rounded shrink-0">
                            Busy
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-emerald-50 flex items-center gap-2 shadow-inner">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Describe your health issue..."
            className="flex-1 border border-emerald-100 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 
            focus:ring-emerald-500/80 focus:border-transparent bg-emerald-50/5 placeholder-slate-400 text-slate-700"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 focus:outline-none shrink-0
            ${
              inputText.trim()
                ? "bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer hover:scale-105 active:scale-95"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </>
  );
}
