// src/components/AiAssistant/AiAssistant.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  Sparkles,
  Send,
  X,
  Heart,
  ChevronRight,
  ClipboardList,
  Calendar,
  Activity,
  ArrowRight,
  Clock,
  PhoneCall
} from "lucide-react";
import { fallbackDoctors } from "../../utils/fallbackDoctors";

// ─── Greeting / small-talk patterns ───────────────────────────────────────────
const GREETING_PATTERNS = [
  /^hi+[!?.]*$/i,
  /^hello+[!?.]*$/i,
  /^hey+[!?.]*$/i,
  /^hii+[!?.]*$/i,
  /^helo+[!?.]*$/i,
  /^good\s*(morning|afternoon|evening|night)[!?.]*$/i,
  /^namaste[!?.]*$/i,
  /^vanakkam[!?.]*$/i,
  /^namaskar[!?.]*$/i,
  /^sup[!?.]*$/i,
  /^what'?s up[!?.]*$/i,
  /^howdy[!?.]*$/i,
];

const THANKS_PATTERNS = [
  /^thank(s| you)+[!?.]*$/i,
  /^thx[!?.]*$/i,
  /^ty[!?.]*$/i,
  /^great[!?.]*$/i,
  /^awesome[!?.]*$/i,
  /^ok(ay)?[!?.]*$/i,
  /^ok thank[s!.]*$/i,
];

const HOW_ARE_YOU_PATTERNS = [
  /how are you/i,
  /how r u/i,
  /how do you do/i,
  /are you (ok|fine|good|well)/i,
];

const HELP_PATTERNS = [
  /what can you (do|help)/i,
  /how (can|do) (you|i)/i,
  /help me/i,
  /what (do|does) (you|this) do/i,
  /i need help/i,
];

// ─── Levenshtein Distance for Typo-Tolerant Matching ─────────────────────────
function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const d = [];
  for (let i = 0; i <= b.length; i++) d[i] = [i];
  for (let j = 0; j <= a.length; j++) d[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        d[i][j] = d[i - 1][j - 1];
      } else {
        d[i][j] = Math.min(
          d[i - 1][j - 1] + 1, // substitution
          d[i][j - 1] + 1,     // insertion
          d[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return d[b.length][a.length];
}

// ─── Common Medical Typos & Colloquial Slang Normalizer ───────────────────────
const COMMON_TYPOS = {
  sugr: "sugar",
  shugar: "sugar",
  shugr: "sugar",
  sugarr: "sugar",
  daibetes: "diabetes",
  diabetis: "diabetes",
  diabtes: "diabetes",
  diabetic: "diabetes",
  diabatic: "diabetes",
  daibetic: "diabetes",
  glukose: "glucose",
  chect: "chest",
  chast: "chest",
  chestpain: "chest pain",
  hart: "heart",
  haert: "heart",
  hrt: "heart",
  cardio: "cardiac",
  pluse: "pulse",
  hedache: "headache",
  headach: "headache",
  headack: "headache",
  migrain: "migraine",
  migren: "migraine",
  dizy: "dizzy",
  dizzi: "dizzy",
  stomak: "stomach",
  stomache: "stomach",
  pet: "stomach",
  acidi: "acidity",
  diarea: "diarrhea",
  diahrea: "diarrhea",
  loosemotion: "loose motion",
  vomting: "vomiting",
  vomit: "vomiting",
  vomitting: "vomiting",
  ortho: "orthopedic",
  orthopedik: "orthopedic",
  fraxcher: "fracture",
  kne: "knee",
  sholder: "shoulder",
  alrgy: "allergy",
  alergy: "allergy",
  allergi: "allergy",
  pimples: "pimple",
  pmple: "pimple",
  itiching: "itch",
  itching: "itch",
  rashes: "rash",
  fevr: "fever",
  fevar: "fever",
  feever: "fever",
  bukhar: "fever",
  bukhaar: "fever",
  caugh: "cough",
  coug: "cough",
  khansi: "cough",
  zukaam: "cold",
  breeth: "breath",
  breathless: "breathing",
  asthm: "asthma",
  astma: "asthma",
  pedia: "pediatric",
  bacha: "child",
  baccha: "child",
  pregnent: "pregnant",
  pregnency: "pregnancy",
  preganant: "pregnant",
  kidny: "kidney",
  mutra: "urine",
  pathri: "stone"
};

function normalizeWithTypos(text) {
  const cleaned = (text || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const rawTokens = cleaned.split(/\s+/).filter(Boolean);
  const normalizedTokens = rawTokens.map((t) => COMMON_TYPOS[t] || t);
  return {
    raw: cleaned,
    tokens: normalizedTokens,
    normalizedString: normalizedTokens.join(" ")
  };
}

// ─── Comprehensive Symptom → Specialization Mapping ───────────────────────────
const specializationMapping = {
  "General Physician": {
    keywords: [
      "sugar", "sugar problem", "diabetes", "diabetic", "daibetes", "diabetis", "diabtes", "glucose", "insulin", "hba1c", "high sugar", "low sugar", "fasting sugar", "random sugar", "blood sugar",
      "fever", "fevr", "fevar", "bukhar", "temperature", "cold", "cough", "flu", "weakness", "body pain", "body ache", "fatigue", "chills", "shivering", "headache mild", "viral", "infection",
      "bp", "blood pressure", "hypertension", "hypotension", "dizziness general", "general checkup", "full body checkup", "health check", "consult physician", "exhaustion", "malaise"
    ],
    symptoms: "blood sugar management, diabetes, fever, viral infections, general weakness, blood pressure, or routine health evaluations",
    test: "HbA1c & Fasting Blood Sugar Panel"
  },
  Cardiologist: {
    keywords: [
      "heart", "hart", "haert", "chest pain", "chestpain", "chect pain", "cardiac", "pulse", "rhythm", "breathless", "palpitation", "palpitations", "coronary", "angina", "heart attack", "ecg", "echo", "cholesterol", "arrhythmia", "shortness of breath"
    ],
    symptoms: "heart-related issues, chest pain, palpitations, shortness of breath, or cardiac monitoring",
    test: "Lipid Profile & 12-Lead ECG"
  },
  Neurologist: {
    keywords: [
      "headache", "head ache", "hedache", "headach", "migraine", "migrain", "migren", "brain", "nerve", "stroke", "epilepsy", "seizure", "fits", "numbness", "tingling", "dizzy", "dizziness", "vertigo", "paralysis", "memory", "confusion", "tremor"
    ],
    symptoms: "chronic migraines, severe headaches, nerve pain, seizures, vertigo, or neurological evaluations",
    test: "Brain MRI & Neurological Assessment"
  },
  "Orthopedic Surgeon": {
    keywords: [
      "bone", "bones", "joint", "joints", "fracture", "muscle pain", "sprain", "ortho", "orthopedic", "spine", "back pain", "backache", "knee", "knee pain", "shoulder", "ligament", "accident", "arthritis", "neck pain", "slip disc"
    ],
    symptoms: "bone fractures, joint pain, spine/backache, knee problems, or sports injuries",
    test: "Digital X-Ray (Chest / Joint) & Bone Density"
  },
  Dermatologist: {
    keywords: [
      "skin", "rash", "rashes", "acne", "pimple", "pimples", "itch", "itching", "itchy", "pigmentation", "hair fall", "hairfall", "hair loss", "dandruff", "eczema", "allergy", "skin allergy", "fungal", "nail", "psoriasis", "dry skin", "blisters"
    ],
    symptoms: "skin rashes, severe acne, itching, hair fall, dandruff, or fungal skin infections",
    test: "Allergy Blood Panel & Skin Scraping Evaluation"
  },
  Gastroenterologist: {
    keywords: [
      "stomach", "stomak", "stomache", "stomach pain", "pet dard", "digestion", "acid", "acidity", "gas", "bloating", "constipation", "diarrhea", "diarrhoea", "diarea", "loose motion", "loose motions", "vomit", "vomiting", "vomting", "nausea", "liver", "jaundice", "endoscopy", "gastro", "ulcer", "food poisoning"
    ],
    symptoms: "stomach pain, severe acidity, gas, indigestion, vomiting, loose motions, or liver concerns",
    test: "Liver Function Test (LFT) & Abdominal Ultrasound"
  },
  Pediatrician: {
    keywords: [
      "child", "baby", "kid", "pediatric", "pediatrician", "infant", "toddler", "vaccine", "vaccination", "child fever", "growth child", "colic", "newborn", "teething"
    ],
    symptoms: "infant, child, or toddler illnesses, growth monitoring, and pediatric vaccinations",
    test: "Complete Blood Count (CBC) & Pediatric Vitals"
  },
  Gynecologist: {
    keywords: [
      "pregnancy", "pregnant", "pregnent", "period", "periods", "menstruation", "menses", "cramps", "pcos", "pcod", "fertility", "infertility", "uterus", "ovary", "women health", "womens health", "white discharge", "gynecology", "delivery"
    ],
    symptoms: "pregnancy care, menstrual cramps, PCOS/PCOD, irregular periods, and reproductive wellness",
    test: "Pelvic Ultrasound & Hormonal Profile"
  },
  Pulmonologist: {
    keywords: [
      "lung", "lungs", "breathing", "breath", "breathless", "breethless", "asthma", "asthm", "copd", "wheezing", "cough blood", "bronchitis", "respiratory", "chest congestion", "phlegm", "shortness of breath"
    ],
    symptoms: "chronic cough, asthma, wheezing, respiratory distress, and lung infections",
    test: "X-Ray Chest & Pulmonary Function Test (PFT)"
  },
  "ENT Specialist": {
    keywords: [
      "ear", "ears", "ear pain", "earache", "hearing", "nose", "running nose", "blocked nose", "sinus", "sinusitis", "throat", "throat pain", "sore throat", "tonsil", "tonsils", "snoring", "ent", "ear infection"
    ],
    symptoms: "ear infections, hearing issues, sinus congestion, tonsillitis, or persistent sore throat",
    test: "ENT Otoscopy & Throat Swab Analysis"
  },
  Dentist: {
    keywords: [
      "tooth", "teeth", "toothache", "tooth pain", "dental", "braces", "root canal", "rct", "cavity", "cavities", "gum", "gums", "bleeding gums", "mouth ulcer", "wisdom tooth"
    ],
    symptoms: "toothache, cavities, bleeding gums, root canals, or orthodontic braces",
    test: "Dental OPG X-Ray & Oral Screening"
  },
  "Eye Specialist": {
    keywords: [
      "eye", "eyes", "eye pain", "vision", "blurry vision", "blurry", "cataract", "glasses", "spectacles", "lens", "conjunctivitis", "red eye", "itchy eye", "dry eyes"
    ],
    symptoms: "blurry vision, eye strain, cataracts, redness, or prescription glasses evaluation",
    test: "Comprehensive Visual Acuity & Retinal Check"
  },
  Urologist: {
    keywords: [
      "urine", "urinary", "burning urine", "kidney stone", "stone", "prostate", "uti", "bladder", "blood in urine", "urination pain"
    ],
    symptoms: "kidney stones, burning urination, UTI, prostate issues, or bladder concerns",
    test: "Kidney Function Test (KFT) & Renal Ultrasound"
  },
  Nephrologist: {
    keywords: [
      "kidney", "dialysis", "renal", "kidney failure", "creatinine", "protein urine", "swollen feet kidney"
    ],
    symptoms: "kidney health, dialysis, renal function issues, or chronic kidney concerns",
    test: "Kidney Function Test (KFT)"
  },
  Psychiatrist: {
    keywords: [
      "mood", "anxiety", "depression", "depressed", "mental", "behavior", "psychiatric", "sleep", "insomnia", "sleepless", "stress", "adhd", "bipolar", "panic", "panic attack"
    ],
    symptoms: "chronic anxiety, depression, sleep disorders, panic attacks, or emotional stress",
    test: "Complete Blood Count (CBC) & Psychological Evaluation"
  },
  Psychologist: {
    keywords: [
      "therapy", "stress", "relationship", "counseling", "grief", "anxiety mild", "depression talk", "talk therapy", "mental health", "guidance"
    ],
    symptoms: "emotional stress, relationship counseling, mental wellness, or talk therapy",
    test: "Mental Wellness & Cognitive Profile"
  },
  Nutritionist: {
    keywords: [
      "diet", "weight", "obesity", "nutrition", "fat", "calories", "meal plan", "lose weight", "gain weight", "belly fat", "slim"
    ],
    symptoms: "healthy weight management, customized clinical diet plans, and lifestyle nutrition",
    test: "Body Composition Analysis & Lipid Profile"
  },
  Oncologist: {
    keywords: [
      "cancer", "tumor", "tumour", "chemo", "chemotherapy", "oncology", "malignant", "biopsy", "lump", "radiation"
    ],
    symptoms: "tumor evaluation, cancer consultations, oncology second opinions, or chemotherapy review",
    test: "Complete Blood Count (CBC) & Tumor Marker Panel"
  },
  Physiotherapist: {
    keywords: [
      "rehab", "exercise", "physical therapy", "injury recovery", "muscle sprain", "posture", "back stiffness", "joints stiffness", "frozen shoulder"
    ],
    symptoms: "muscle rehabilitation, injury recovery, posture correction, or joint stiffness",
    test: "Musculoskeletal Assessment"
  },
  Radiologist: {
    keywords: [
      "mri", "ct scan", "ultrasound", "x-ray check", "imaging", "scan result"
    ],
    symptoms: "diagnosing scans, MRI, CT scans, ultrasounds, or body imaging interpretation",
    test: "Ultrasound Whole Abdomen"
  }
};

const serviceMappings = [
  {
    name: "HbA1c & Blood Sugar Panel",
    keywords: ["sugar", "diabetes", "glucose", "insulin", "hba1c", "blood sugar", "sugar problem", "sugar level", "high sugar", "diabetic", "sugar check"],
    recommendedSpecialty: "General Physician"
  },
  {
    name: "Complete Blood Count (CBC)",
    keywords: ["blood cell", "blood count", "cbc", "anemia", "infection blood", "weakness blood"],
    recommendedSpecialty: "General Physician"
  },
  {
    name: "Lipid Profile (Cardiac Risk Panel)",
    keywords: ["cholesterol", "lipid", "fat blood", "coronary fat", "heart fat", "cardiac risk"],
    recommendedSpecialty: "Cardiologist"
  },
  {
    name: "Thyroid Profile (T3, T4, TSH)",
    keywords: ["thyroid", "tsh", "t3", "t4", "goiter", "hormone thyroid"],
    recommendedSpecialty: "General Physician"
  },
  {
    name: "Liver Function Test (LFT)",
    keywords: ["liver", "bilirubin", "lft", "jaundice", "hepatitis", "fatty liver"],
    recommendedSpecialty: "Gastroenterologist"
  },
  {
    name: "Kidney Function Test (KFT)",
    keywords: ["kidney check", "creatinine", "kft", "urea", "renal test"],
    recommendedSpecialty: "Urologist"
  },
  {
    name: "Digital X-Ray Chest PA",
    keywords: ["chest x-ray", "lung x-ray", "pneumonia chest", "x-ray ribs"],
    recommendedSpecialty: "Pulmonologist"
  },
  {
    name: "Ultrasound Whole Abdomen",
    keywords: ["ultrasound", "abdomen scan", "stomach scan", "kidney stone ultrasound", "gallbladder ultrasound"],
    recommendedSpecialty: "Gastroenterologist"
  }
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function isGreeting(text) {
  const t = text.trim();
  return GREETING_PATTERNS.some((p) => p.test(t));
}

function isThanks(text) {
  const t = text.trim();
  return THANKS_PATTERNS.some((p) => p.test(t));
}

function isHowAreYou(text) {
  return HOW_ARE_YOU_PATTERNS.some((p) => p.test(text));
}

function isAskingForHelp(text) {
  return HELP_PATTERNS.some((p) => p.test(text));
}

function getGreetingReply() {
  const hour = new Date().getHours();
  const timeGreet =
    hour < 12 ? "Good morning" :
    hour < 17 ? "Good afternoon" :
    "Good evening";

  return `${timeGreet}! 👋 Welcome to **MediCare Nexus**.

I'm your AI Health Assistant. I can help you:

🩺 **Find the right specialist doctor** for your symptoms (even with typos!)
🔬 **Recommend diagnostic lab tests**
📅 **Give you instant 1-click booking links**

Please describe your symptoms below (e.g. *"sugar problem"*, *"chest pain"*, *"migraine"*, or *"backache"*).`;
}

function getThanksReply() {
  return `You're welcome! 😊

If you have more health questions or need to find a doctor, just type your symptoms anytime. Stay healthy! 🌿`;
}

function getHowAreYouReply() {
  return `I'm doing great, thank you for asking! 😊

I'm ready to assist you. Tell me your symptoms and I'll match you to the right specialist with instant booking links.`;
}

function getHelpReply() {
  return `I can help you with the following:

🩺 **Find Specialists** — Describe your symptoms and I'll instantly recommend the right doctor
🔬 **Diagnostic Tests** — I'll suggest relevant lab or imaging tests
📅 **Instant Booking Links** — Direct links to book doctors without waiting

Just type what you're experiencing — for example:
• *"sugar problem"*
• *"severe headache for 2 days"*
• *"chest pain when breathing"*
• *"skin allergy and itching"*`;
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I'm your MediCare AI Assistant. 🩺\n\nDescribe your symptoms below (e.g. \"sugar problem\", \"chest pain\", \"fever\"), and I will instantly recommend the right specialist and diagnostic tests with direct booking links.",
    },
  ]);

  // Pre-seed with fallbackDoctors so links and recommendations appear with ZERO delay
  const [doctorsList, setDoctorsList] = useState(fallbackDoctors);
  const [servicesList, setServicesList] = useState([
    { id: "srv-hba1c", _id: "srv-hba1c", name: "HbA1c & Blood Sugar Panel", price: 450 },
    { id: "srv-cbc", _id: "srv-cbc", name: "Complete Blood Count (CBC)", price: 350 },
    { id: "srv-lipid", _id: "srv-lipid", name: "Lipid Profile (Cardiac Risk Panel)", price: 650 },
    { id: "srv-lft", _id: "srv-lft", name: "Liver Function Test (LFT)", price: 550 },
    { id: "srv-kft", _id: "srv-kft", name: "Kidney Function Test (KFT)", price: 550 },
    { id: "srv-xray", _id: "srv-xray", name: "Digital X-Ray Chest PA", price: 500 },
    { id: "srv-usg", _id: "srv-usg", name: "Ultrasound Whole Abdomen", price: 1200 },
    { id: "srv-thyroid", _id: "srv-thyroid", name: "Thyroid Profile (T3, T4, TSH)", price: 400 }
  ]);
  const messagesEndRef = useRef(null);

  // Load latest live doctors and services from backend
  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

    fetch(`${API_BASE}/api/doctors`)
      .then((res) => res.json())
      .then((json) => {
        const items = json?.data || json?.doctors || [];
        if (items && items.length > 0) {
          setDoctorsList(items);
        }
      })
      .catch((err) => console.warn("AI: using fallback doctors dataset", err));

    fetch(`${API_BASE}/api/services`)
      .then((res) => res.json())
      .then((json) => {
        const items = json?.data || [];
        if (items && items.length > 0) {
          setServicesList(items);
        }
      })
      .catch((err) => console.warn("AI: using fallback services dataset", err));
  }, []);

  // Scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = (e, customText = null) => {
    if (e) e.preventDefault();
    const query = (customText !== null ? customText : inputText).trim();
    if (!query) return;

    if (customText === null) {
      setInputText("");
    }

    // Add user message
    setMessages((prev) => [...prev, { sender: "user", text: query }]);

    // ── 1. Detect greetings / small-talk FIRST ──────────────────────────────
    if (isGreeting(query)) {
      setTimeout(() => {
        setMessages((prev) => [...prev, { sender: "bot", text: getGreetingReply() }]);
      }, 100);
      return;
    }

    if (isThanks(query)) {
      setTimeout(() => {
        setMessages((prev) => [...prev, { sender: "bot", text: getThanksReply() }]);
      }, 100);
      return;
    }

    if (isHowAreYou(query)) {
      setTimeout(() => {
        setMessages((prev) => [...prev, { sender: "bot", text: getHowAreYouReply() }]);
      }, 100);
      return;
    }

    if (isAskingForHelp(query)) {
      setTimeout(() => {
        setMessages((prev) => [...prev, { sender: "bot", text: getHelpReply() }]);
      }, 100);
      return;
    }

    // ── 2. Too short (< 2 chars) — ask for more detail ─────────────────────
    if (query.length < 2) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "Could you please describe your health concern in a bit more detail? For example: *\"sugar problem\"*, *\"headache and fever\"*, or *\"chest pain\"*.",
          },
        ]);
      }, 100);
      return;
    }

    // ── 3. Typo-Tolerant & Fuzzy Symptom Analysis ───────────────────────────
    const { tokens, normalizedString } = normalizeWithTypos(query);

    let matchedSpec = null;
    let maxScore = 0;
    let matchedTestName = null;
    let matchedServiceObj = null;

    // Check for specific test/service keywords first
    let foundServiceMatch = null;
    for (const service of serviceMappings) {
      for (const keyword of service.keywords) {
        if (normalizedString.includes(keyword)) {
          foundServiceMatch = service;
          break;
        }
      }
      if (foundServiceMatch) break;
    }

    if (foundServiceMatch) {
      matchedTestName = foundServiceMatch.name;
      matchedSpec = foundServiceMatch.recommendedSpecialty;
      maxScore = 20; // High confidence match
    } else {
      // Keyword & Fuzzy scoring across all specializations
      Object.keys(specializationMapping).forEach((spec) => {
        let score = 0;
        const config = specializationMapping[spec];

        // 1. Direct phrase or substring match (+6 points per match)
        config.keywords.forEach((keyword) => {
          if (normalizedString.includes(keyword)) {
            score += 6;
          }
        });

        // 2. Token match & Levenshtein typo-tolerant fuzzy matching (+4 exact, +3 fuzzy)
        tokens.forEach((t) => {
          if (t.length < 3) return;
          config.keywords.forEach((keyword) => {
            const kwWords = keyword.split(" ");
            kwWords.forEach((kw) => {
              if (t === kw) {
                score += 4;
              } else if (kw.length >= 4 && levenshtein(t, kw) <= (kw.length <= 5 ? 1 : 2)) {
                score += 3; // Typo match! e.g., "sugr" -> "sugar", "chect" -> "chest"
              }
            });
          });
        });

        if (score > maxScore) {
          maxScore = score;
          matchedSpec = spec;
        }
      });
    }

    // Fallback: If no match was found, but user expressed health concern, safely route to General Physician
    if (!matchedSpec || maxScore === 0) {
      const genericHealthTerms = ["pain", "problem", "doctor", "sick", "ache", "hurt", "ill", "not feeling well", "disease", "treatment", "medicine", "tablets", "checkup"];
      const hasGenericIntent = genericHealthTerms.some((term) => normalizedString.includes(term));
      if (hasGenericIntent) {
        matchedSpec = "General Physician";
        matchedTestName = "Complete Blood Count (CBC) & General Vitals";
        maxScore = 5;
      }
    }

    // If completely unrecognizable input (e.g. random gibberish like "asdfgh") — ask for clarification
    if (!matchedSpec || maxScore === 0) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: `I couldn't quite identify your symptoms from that query.\n\nCould you describe what you're experiencing? For example:\n• **"sugar problem"** or **"diabetes"**\n• **"chest pain and palpitations"**\n• **"severe headache"**\n• **"stomach acidity or vomiting"**\n\nI'll immediately recommend the right specialist doctor with direct booking links.`,
          },
        ]);
      }, 100);
      return;
    }

    // Determine recommended diagnostic test
    if (matchedSpec && !matchedTestName) {
      matchedTestName = specializationMapping[matchedSpec]?.test || "Complete Blood Count (CBC)";
    }

    // Find matched service object
    if (matchedTestName && servicesList.length > 0) {
      matchedServiceObj = servicesList.find((s) =>
        (s.name || "").toLowerCase().includes(matchedTestName.toLowerCase().split(" ")[0])
      );
    }

    // Get recommended doctors for this specialty
    let recommendedDocs = doctorsList
      .filter((d) => {
        const spec = (d.specialization || d.speciality || "").toLowerCase();
        return spec === matchedSpec.toLowerCase() || spec.includes(matchedSpec.toLowerCase()) || matchedSpec.toLowerCase().includes(spec);
      })
      .slice(0, 3)
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
          available: available !== false,
          rating: d.rating || 4.9,
          experience: d.experience || "12+ years"
        };
      });

    // If no doctor matching exact specialty is available, fallback to top available specialists
    if (recommendedDocs.length === 0 && doctorsList.length > 0) {
      recommendedDocs = doctorsList.slice(0, 2).map((d) => ({
        id: d._id || d.id,
        name: d.name,
        specialization: d.specialization || d.speciality || "General Physician",
        image: d.imageUrl || d.image || "/placeholder-doctor.jpg",
        available: true,
        rating: d.rating || 4.9,
        experience: d.experience || "10+ years"
      }));
    }

    // Formulate immediate reply with faster response (~100ms)
    setTimeout(() => {
      let botText = "";
      if (foundServiceMatch) {
        botText = `I recommend booking the **${matchedTestName}** test for your concern.\n\nFor clinical consultation and evaluation, consulting a **${matchedSpec}** is advised.`;
        if (recommendedDocs.length > 0) {
          botText += "\n\nAvailable specialists ready for immediate consultation:";
        }
      } else {
        botText = `Based on your symptoms, I recommend consulting a **${matchedSpec}** — specialist in ${
          specializationMapping[matchedSpec]?.symptoms || "this condition"
        }.\n\nI also suggest getting a **${matchedTestName}** test done for a thorough evaluation.`;
        if (recommendedDocs.length > 0) {
          botText += "\n\nAvailable specialists ready for immediate consultation:";
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: botText,
          matchedSpec,
          recommendedDoctors: recommendedDocs,
          matchedService: matchedServiceObj || (matchedTestName ? { name: matchedTestName } : null),
        },
      ]);
    }, 100);
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ bottom: "max(1.5rem, calc(env(safe-area-inset-bottom, 0px) + 0.75rem))" }}
        className="fixed left-6 z-[9999] w-14 h-14 rounded-full flex items-center justify-center 
        bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xl hover:shadow-2xl 
        hover:scale-105 active:scale-95 transition-all duration-300 group focus:outline-none 
        ring-4 ring-emerald-500/20 cursor-pointer"
        aria-label="Open AI Assistant"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
        <Sparkles className="group-hover:rotate-12 transition-transform duration-300" size={24} />
      </button>

      {/* Chat Window */}
      <div
        style={{ bottom: "max(5.5rem, calc(env(safe-area-inset-bottom, 0px) + 4.75rem))" }}
        className={`fixed left-6 z-[9999] w-[90vw] sm:w-[380px] h-[520px] max-h-[80vh] 
        bg-white rounded-3xl shadow-2xl border border-emerald-100/60 flex flex-col 
        overflow-hidden transition-all duration-300 origin-bottom-left backdrop-blur-lg
        ${isOpen ? "scale-100 opacity-100 pointer-events-auto" : "scale-75 opacity-0 pointer-events-none"}`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Sparkles size={18} className="text-yellow-300" />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-wide flex items-center gap-1.5">
                <span>MediCare AI</span>
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping inline-block" />
              </h2>
              <p className="text-[10px] text-emerald-100/90 font-medium">Health & Doctor Assistant</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors focus:outline-none cursor-pointer"
            aria-label="Close panel"
          >
            <X size={16} />
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-emerald-50/15">
          {messages.map((msg, idx) => (
            <div key={idx} className="flex flex-col">
              {/* Bubble */}
              <div
                className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs whitespace-pre-line
                ${
                  msg.sender === "user"
                    ? "self-end bg-emerald-600 text-white rounded-tr-none font-medium"
                    : "self-start bg-white text-slate-800 rounded-tl-none border border-emerald-100/80"
                }`}
              >
                {msg.text}
              </div>

              {/* Diagnostic Service Card */}
              {msg.sender === "bot" && msg.matchedService && (
                <div className="self-start w-[88%] bg-gradient-to-br from-emerald-50 to-teal-50/60 rounded-xl p-3 mt-2 border border-emerald-200/80 shadow-xs flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="text-emerald-700 shrink-0" size={15} />
                    <span className="font-bold text-[11px] text-emerald-950">Recommended Diagnostic Test</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <span className="font-semibold text-xs text-slate-800 line-clamp-1">{msg.matchedService.name}</span>
                    <Link
                      to={msg.matchedService._id || msg.matchedService.id ? `/services/${msg.matchedService._id || msg.matchedService.id}` : "/services"}
                      onClick={() => setIsOpen(false)}
                      className="text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1.5 rounded-lg shrink-0 transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                    >
                      <span>Book Test</span>
                      <ArrowRight size={11} />
                    </Link>
                  </div>
                </div>
              )}

              {/* Recommended Doctors with Fast Direct Links */}
              {msg.sender === "bot" && msg.recommendedDoctors && msg.recommendedDoctors.length > 0 && (
                <div className="self-start w-[88%] mt-2 space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1.5">
                      <Heart className="text-rose-500 shrink-0 animate-pulse" size={12} fill="currentColor" />
                      <span className="font-bold text-[10px] text-slate-500 uppercase tracking-wider">Recommended Doctors</span>
                    </div>
                    {msg.matchedSpec && (
                      <Link
                        to={`/doctors?speciality=${encodeURIComponent(msg.matchedSpec)}`}
                        onClick={() => setIsOpen(false)}
                        className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-0.5"
                      >
                        <span>View all</span>
                        <ChevronRight size={12} />
                      </Link>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    {msg.recommendedDoctors.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:border-emerald-300 transition-all duration-200"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={doc.image}
                            alt={doc.name}
                            className="w-9 h-9 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/placeholder-doctor.jpg";
                            }}
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-[11px] text-slate-900 truncate">{doc.name}</h4>
                            <p className="text-[10px] text-emerald-700 font-medium truncate">{doc.specialization}</p>
                          </div>
                        </div>

                        {/* Immediate Direct Booking Button */}
                        <Link
                          to={`/doctors/${doc.id}`}
                          onClick={() => setIsOpen(false)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1 transition-all shadow-xs shrink-0 cursor-pointer active:scale-95"
                          title={`Book Appointment with ${doc.name}`}
                        >
                          <span>Book</span>
                          <ChevronRight size={12} />
                        </Link>
                      </div>
                    ))}
                  </div>

                  {/* Quick Action Links Bar */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <Link
                      to={msg.matchedSpec ? `/doctors?speciality=${encodeURIComponent(msg.matchedSpec)}` : "/doctors"}
                      onClick={() => setIsOpen(false)}
                      className="px-2.5 py-1 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Calendar size={11} />
                      <span>All {msg.matchedSpec || "Specialist"} Doctors →</span>
                    </Link>
                    <Link
                      to="/services"
                      onClick={() => setIsOpen(false)}
                      className="px-2.5 py-1 rounded-md bg-cyan-100 hover:bg-cyan-200 text-cyan-800 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      <Activity size={11} />
                      <span>Diagnostic Tests →</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 1-Tap Quick Symptom Chips */}
        <div className="px-3 pt-2 pb-1 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => handleSend(null, "sugar problem")}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-semibold hover:bg-emerald-100 transition cursor-pointer"
          >
            🩺 Sugar Problem
          </button>
          <button
            type="button"
            onClick={() => handleSend(null, "chest pain")}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-[10px] font-semibold hover:bg-rose-100 transition cursor-pointer"
          >
            ❤️ Chest Pain
          </button>
          <button
            type="button"
            onClick={() => handleSend(null, "severe headache")}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-[10px] font-semibold hover:bg-purple-100 transition cursor-pointer"
          >
            🧠 Headache
          </button>
          <button
            type="button"
            onClick={() => handleSend(null, "fever and cold")}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-semibold hover:bg-amber-100 transition cursor-pointer"
          >
            🤒 Fever & Cold
          </button>
          <button
            type="button"
            onClick={() => handleSend(null, "back and knee pain")}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-semibold hover:bg-blue-100 transition cursor-pointer"
          >
            🦴 Joint Pain
          </button>
        </div>

        {/* Text Input & Send */}
        <form onSubmit={(e) => handleSend(e)} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 shadow-inner">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Describe your health concern (e.g. sugar problem)..."
            className="flex-1 border border-emerald-200/80 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 
            focus:ring-emerald-500/80 focus:border-transparent bg-emerald-50/10 placeholder-slate-400 text-slate-800 font-medium"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 focus:outline-none shrink-0
            ${
              inputText.trim()
                ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-95 shadow-xs"
                : "bg-slate-100 text-slate-300 cursor-not-allowed"
            }`}
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </>
  );
}
