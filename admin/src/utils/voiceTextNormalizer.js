// admin/src/utils/voiceTextNormalizer.js
// MediCare Nexus Voice Quality & Multilingual Pronunciation Normalizer
// Provides: Text normalization, phonetic lexicon mapping, voice profiles, and sentence length enforcement

export const VOICE_PROFILES = {
  en: {
    code: "en",
    locale: "en-US",
    nativeLabel: "English",
    rate: 0.92, // Slower, clearer cadence for hospital operations
    pitch: 1.0,
    stability: 0.75,
    similarityBoost: 0.85,
    voiceId: "21m00Tcm4TlvDq8ikWAM", // Rachel / Clear Operations
    modelId: "eleven_multilingual_v2"
  },
  ta: {
    code: "ta",
    locale: "ta-IN",
    nativeLabel: "தமிழ்",
    rate: 0.90,
    pitch: 1.0,
    stability: 0.75,
    similarityBoost: 0.85,
    voiceId: "pFZP5JQG7iQjIQuC4Bku",
    modelId: "eleven_multilingual_v2"
  },
  hi: {
    code: "hi",
    locale: "hi-IN",
    nativeLabel: "हिन्दी",
    rate: 0.92,
    pitch: 1.0,
    stability: 0.75,
    similarityBoost: 0.85,
    voiceId: "EXAVITQu4vr4xnSDxMaL",
    modelId: "eleven_multilingual_v2"
  },
  te: {
    code: "te",
    locale: "te-IN",
    nativeLabel: "తెలుగు",
    rate: 0.90,
    pitch: 1.0,
    stability: 0.75,
    similarityBoost: 0.85,
    voiceId: "MF3mGyEYCl7XYWbV9V6O",
    modelId: "eleven_multilingual_v2"
  },
  kn: {
    code: "kn",
    locale: "kn-IN",
    nativeLabel: "ಕನ್ನಡ",
    rate: 0.90,
    pitch: 1.0,
    stability: 0.75,
    similarityBoost: 0.85,
    voiceId: "AZnzlk1XvdvUeBnXmlld",
    modelId: "eleven_multilingual_v2"
  },
  ml: {
    code: "ml",
    locale: "ml-IN",
    nativeLabel: "മലയാളം",
    rate: 0.90,
    pitch: 1.0,
    stability: 0.75,
    similarityBoost: 0.85,
    voiceId: "ThT5KcBeYPX3keUQqHPh",
    modelId: "eleven_multilingual_v2"
  },
  mr: {
    code: "mr",
    locale: "mr-IN",
    nativeLabel: "मराठी",
    rate: 0.92,
    pitch: 1.0,
    stability: 0.75,
    similarityBoost: 0.85,
    voiceId: "oWAxZDxUJAwQ20JZT4v2",
    modelId: "eleven_multilingual_v2"
  },
  bn: {
    code: "bn",
    locale: "bn-IN",
    nativeLabel: "বাংলা",
    rate: 0.92,
    pitch: 1.0,
    stability: 0.75,
    similarityBoost: 0.85,
    voiceId: "XrExE9yKIg1WjnnlVkGX",
    modelId: "eleven_multilingual_v2"
  }
};

export const PRONUNCIATION_LEXICON = {
  ta: {
    "Dr. Sarah Johnson": "டாக்டர் சாரா ஜான்சன்",
    "Dr. Michael Chen": "டாக்டர் மைக்கேல் சென்",
    "Dr. Emily Rodriguez": "டாக்டர் எமிலி ரோட்ரிக்ஸ்",
    "Dr. James Wilson": "டாக்டர் ஜேம்ஸ் வில்சன்",
    "Dr. Priya Sharma": "டாக்டர் பிரியா சர்மா",
    "Dr. Rajesh Patel": "டாக்டர் ராஜேஷ் படேல்",
    "Dr.": "டாக்டர்",
    "ICU-06": "ஐ சி யூ ஆறு",
    "WARD-ICU": "ஐ சி யூ வார்டு",
    "V-04": "V நான்கு",
    "P-1005": "P ஒன்று பூஜ்ஜியம் பூஜ்ஜியம் ஐந்து",
    "OT-01": "அறுவை சிகிச்சை அரங்கு ஒன்று",
    "N-07": "செவிலியர் ஏழு",
    "10:30 AM": "காலை பத்து முப்பது",
    "11:45 AM": "காலை பதினொன்று நாற்பத்தைந்து",
    "2:30 PM": "பிற்பகல் இரண்டு முப்பது",
    "CBC": "சி பி சி ரத்தப் பரிசோதனை",
    "ECG": "இ சி ஜி",
    "MRI": "எம் ஆர் ஐ ஸ்கேன்",
    "CT": "சி டி ஸ்கேன்",
    "SpO2": "ஆக்சிஜன் அளவு",
    "78%": "எழுபத்தெட்டு சதவீதம்"
  },
  hi: {
    "Dr. Sarah Johnson": "डॉक्टर सारा जॉनसन",
    "Dr. Michael Chen": "डॉक्टर माइकल चेन",
    "Dr. Emily Rodriguez": "डॉक्टर एमिली रोड्रिगेज",
    "Dr. James Wilson": "डॉक्टर जेम्स विल्सन",
    "Dr. Priya Sharma": "डॉक्टर प्रिया शर्मा",
    "Dr. Rajesh Patel": "डॉक्टर राजेश पटेल",
    "Dr.": "डॉक्टर",
    "ICU-06": "आईसीयू छह",
    "WARD-ICU": "आईसीयू वार्ड",
    "V-04": "V चार",
    "P-1005": "P एक शून्य शून्य पाँच",
    "OT-01": "ऑपरेशन थिएटर एक",
    "N-07": "नर्स सात",
    "10:30 AM": "सुबह दस तीस बजे",
    "11:45 AM": "सुबह ग्यारह पैंतालीस बजे",
    "2:30 PM": "दोपहर दो तीस बजे",
    "CBC": "सी बी सी ब्लड टेस्ट",
    "ECG": "ई सी जी",
    "MRI": "एम आर आई स्कैन",
    "CT": "सी टी स्कैन",
    "SpO2": "ऑक्सीजन स्तर",
    "78%": "अठहत्तर प्रतिशत"
  },
  te: {
    "Dr. Sarah Johnson": "డాక్టర్ సారా జాన్సన్",
    "Dr. Michael Chen": "డాక్టర్ మైఖేల్ చెన్",
    "Dr. Priya Sharma": "డాక్టర్ ప్రియా శర్మ",
    "Dr. Rajesh Patel": "డాక్టర్ రాజేష్ పటేల్",
    "Dr.": "డాక్టర్",
    "ICU-06": "ఐ సి యు ఆరు",
    "WARD-ICU": "ఐ సి యు వార్డు",
    "V-04": "V నాలుగు",
    "P-1005": "P ఒకటి సున్నా సున్నా ఐదు",
    "OT-01": "ఆపరేషన్ థియేటర్ ఒకటి",
    "10:30 AM": "ఉదయం పది ముప్పై",
    "CBC": "సి బి సి రక్త పరీక్ష",
    "ECG": "ఇ సి జి",
    "MRI": "ఎం ఆర్ ఐ స్కాన్",
    "78%": "డెబ్బై ఎనిమిది శాతం"
  },
  kn: {
    "Dr. Sarah Johnson": "ಡಾಕ್ಟರ್ ಸಾರಾ ಜಾನ್ಸನ್",
    "Dr. Michael Chen": "ಡಾಕ್ಟರ್ ಮೈಕೆಲ್ ಚೆನ್",
    "Dr. Priya Sharma": "ಡಾಕ್ಟರ್ ಪ್ರಿಯಾ ಶರ್ಮಾ",
    "Dr.": "ಡಾಕ್ಟರ್",
    "ICU-06": "ಐ ಸಿ ಯು ಆರು",
    "WARD-ICU": "ಐ ಸಿ ಯು ವಾರ್ಡ್",
    "V-04": "V ನಾಲ್ಕು",
    "P-1005": "P ಒಂದು ಸೊನ್ನೆ ಸೊನ್ನೆ ಐದು",
    "OT-01": "ಆಪರೇಷನ್ ಥಿಯೇಟರ್ ಒಂದು",
    "10:30 AM": "ಬೆಳಿಗ್ಗೆ ಹತ್ತು ಮೂವತ್ತು",
    "CBC": "ಸಿ ಬಿ ಸಿ ರಕ್ತ ಪರೀಕ್ಷೆ",
    "ECG": "ಇ ಸಿ ಜಿ",
    "MRI": "ಎಂ ಆರ್ ಐ ಸ್ಕ್ಯಾನ್",
    "78%": "ಎಪ್ಪತ್ತೆಂಟು ಪ್ರತಿಶತ"
  },
  ml: {
    "Dr. Sarah Johnson": "ഡോക്ടർ സാറ ജോൺസൺ",
    "Dr. Michael Chen": "ഡോക്ടർ മൈക്കൽ ചെൻ",
    "Dr. Priya Sharma": "ഡോക്ടർ പ്രിയ ശർമ്മ",
    "Dr.": "ഡോക്ടർ",
    "ICU-06": "ഐ സി യു ആറ്",
    "WARD-ICU": "ഐ സി യു വാർഡ്",
    "V-04": "V നാല്",
    "P-1005": "P ഒന്ന് പൂജ്യം പൂജ്യം അഞ്ച്",
    "OT-01": "ഓപ്പറേഷൻ തിയേറ്റർ ഒന്ന്",
    "10:30 AM": "രാവിലെ പത്ത് മുപ്പത്",
    "CBC": "സി ബി സി രക്തപരിശോധന",
    "ECG": "ഇ സി ജി",
    "MRI": "എം ആർ ഐ സ്കാൻ",
    "78%": "എഴുപത്തെട്ട് ശതമാനം"
  },
  mr: {
    "Dr. Sarah Johnson": "डॉक्टर सारा जॉन्सन",
    "Dr. Michael Chen": "डॉक्टर मायकेल चेन",
    "Dr. Priya Sharma": "डॉक्टर प्रिया शर्मा",
    "Dr.": "डॉक्टर",
    "ICU-06": "आयसीयू सहा",
    "WARD-ICU": "आयसीयू वॉर्ड",
    "V-04": "V चार",
    "P-1005": "P एक शून्य शून्य पाच",
    "OT-01": "ऑपरेशन थिएटर एक",
    "10:30 AM": "सकाळी दहा तीस वाजता",
    "CBC": "सी बी सी रक्त तपासणी",
    "ECG": "ई सी जी",
    "MRI": "एम आर आय स्कॅन",
    "78%": "अठ्ठ्याहत्तर टक्के"
  },
  bn: {
    "Dr. Sarah Johnson": "ডাক্তার সারা জনসন",
    "Dr. Michael Chen": "ডাক্তার মাইকেল চেন",
    "Dr. Priya Sharma": "ডাক্তার প্রিয়া শর্মা",
    "Dr.": "ডাক্তার",
    "ICU-06": "আই সি ইউ ছয়",
    "WARD-ICU": "আই সি ইউ ওয়ার্ড",
    "V-04": "V চার",
    "P-1005": "P এক শূন্য শূন্য পাঁচ",
    "OT-01": "অপারেশন থিয়েটার এক",
    "10:30 AM": "সকাল দশটা ত্রিশ মিনিটে",
    "CBC": "সি বি সি রক্ত পরীক্ষা",
    "ECG": "ই সি জি",
    "MRI": "এম আর আই স্ক্যান",
    "78%": "আটাত্তর শতাংশ"
  },
  en: {
    "Dr.": "Doctor ",
    "ICU-06": "I C U zero six",
    "WARD-ICU": "I C U Ward",
    "V-04": "Ventilator zero four",
    "P-1005": "P one zero zero five",
    "OT-01": "Operating Theatre one",
    "N-07": "Nurse zero seven",
    "SpO2": "S P O two",
    "ECG": "E C G",
    "MRI": "M R I",
    "CT": "C T scan",
    "CBC": "C B C blood test",
    "EHR": "E H R",
    "EMR": "E M R",
    "RTLS": "Real Time Location System",
    "10:30 AM": "ten thirty A M",
    "11:45 AM": "eleven forty-five A M",
    "2:30 PM": "two thirty P M",
    "%": " percent"
  }
};

export function normalizeSpokenText(text = "", lang = "en") {
  if (!text || typeof text !== "string") return "";

  let cleaned = text;

  // 1. Remove markdown characters & technical formatting
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, "$1");
  cleaned = cleaned.replace(/\*([^*]+)\*/g, "$1");
  cleaned = cleaned.replace(/`([^`]+)`/g, "$1");
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  cleaned = cleaned.replace(/[#_~]/g, "");
  cleaned = cleaned.replace(/\{[^}]+\}/g, "");
  cleaned = cleaned.replace(/\b[0-9a-f]{24}\b/gi, "");

  function applyLexicon(targetText, lexicon) {
    let result = targetText;
    const sortedKeys = Object.keys(lexicon).sort((a, b) => b.length - a.length);
    sortedKeys.forEach((key) => {
      const isWord = /^[A-Za-z0-9]+$/.test(key);
      const escaped = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      const pattern = isWord ? `\\b${escaped}\\b` : escaped;
      result = result.replace(new RegExp(pattern, "gi"), lexicon[key]);
    });
    return result;
  }

  // 2. Language-specific lexicon replacement
  cleaned = applyLexicon(cleaned, PRONUNCIATION_LEXICON[lang] || {});

  // 3. Fallback English replacements
  cleaned = applyLexicon(cleaned, PRONUNCIATION_LEXICON.en);

  // 4. Clean dates & numbers
  cleaned = cleaned.replace(/\b2026-10-01\b/g, "October first, twenty twenty-six");
  cleaned = cleaned.replace(/\b2026-09-30\b/g, "September thirtieth, twenty twenty-six");
  cleaned = cleaned.replace(/(\d+)%/g, "$1 percent");

  // 5. Clean excess whitespace
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  // 6. Sentence limit: keep to max 3 sentences
  const sentenceMatches = cleaned.match(/[^.!?]+[.!?]+/g);
  if (sentenceMatches && sentenceMatches.length > 3) {
    cleaned = sentenceMatches.slice(0, 3).join(" ").trim();
  }

  return cleaned;
}

export function getVoiceProfile(lang = "en") {
  return VOICE_PROFILES[lang] || VOICE_PROFILES.en;
}
