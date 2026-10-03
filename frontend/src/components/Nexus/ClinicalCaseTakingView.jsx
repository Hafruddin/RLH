// frontend/src/components/Nexus/ClinicalCaseTakingView.jsx
// Clinical Case-Taking Module — General History & Physical Examination

import React, { useState, useEffect, useMemo } from "react";
import {
  ClipboardList,
  FilePlus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  User,
  HeartPulse,
  Activity,
  Calendar,
  AlertCircle,
  Eye,
  Edit3,
  Trash2,
  Printer,
  Download,
  Plus,
  X,
  Stethoscope,
  Microscope,
  FileText,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Check,
  RefreshCw,
  Sparkles
} from "lucide-react";

// Initial Demo Cases
const DEFAULT_DEMO_CASES = [
  {
    caseId: "CASE-2026-001",
    patientId: "P-101",
    status: "Completed",
    patientDetails: {
      name: "Harsh Tripathi",
      age: 34,
      gender: "Male",
      dob: "1992-05-14",
      phone: "+91 98765 43210",
      email: "harsh.tripathi@email.com",
      address: "Flat 402, Green Glen Heights, Outer Ring Road, Bangalore - 560103"
    },
    chiefComplaint: [
      {
        complaint: "Episodic throbbing headache localized to right frontotemporal region",
        duration: "3 weeks",
        severity: "Moderate",
        onset: "Gradual",
        relatedSymptoms: "Mild nausea, photophobia, blurred vision during peaks"
      }
    ],
    historyOfPresentIllness: "Patient reports recurrent unilateral pulsating headaches occurring 2-3 times per week, typically commencing in late morning. Each episode lasts 4-6 hours. Preceded by mild visual blurring and heightened sensitivity to ambient indoor light. Aggravated by prolonged screen exposure and physical exertion. Partial relief with rest in a darkened room.",
    pastHistory: {
      previousIllnesses: "Mild essential hypertension (diagnosed 2024)",
      previousHospitalizations: "None",
      previousSurgeries: "Appendectomy (2018)",
      previousSimilarComplaints: "Occasional tension headaches during university",
      chronicConditions: "Hypertension (controlled on monotherapy)"
    },
    medicationHistory: {
      currentMedications: "Tab. Metoprolol Succinate 25mg OD morning",
      previousMedications: "Tab. Paracetamol 650mg SOS",
      dosage: "25mg",
      frequency: "Once Daily",
      duration: "14 months",
      medicationAllergies: "Penicillin (erythematous rash, bronchospasm risk)"
    },
    familyHistory: {
      familyDiseases: "Maternal history of classic migraine; Father has hypertension and Type 2 Diabetes",
      hereditaryConditions: "None known",
      relevantFamilyHistory: "No history of epilepsy, stroke, or aneurysms"
    },
    personalHistory: {
      diet: "Non-Vegetarian",
      appetite: "Normal",
      sleep: "Disturbed (avg 6 hrs/night due to screen work)",
      bowelHabits: "Regular",
      bladderHabits: "Normal",
      physicalActivity: "Sedentary desk job",
      smoking: "Non-smoker",
      alcohol: "Occasional social (1-2 units/month)",
      otherHabits: "High caffeine intake (4-5 cups coffee/day)"
    },
    vitals: {
      temp: 98.6,
      bpSystolic: 124,
      bpDiastolic: 82,
      pulse: 74,
      respRate: 16,
      spo2: 99,
      weight: 72,
      height: 175,
      bmi: 23.5,
      bmiCategory: "Normal"
    },
    clinicalExamination: {
      general: "Conscious, oriented to time, place, and person. Well-nourished. No pallor, icterus, cyanosis, clubbing, lymphadenopathy, or pedal edema.",
      cvs: "S1, S2 audible normal. No murmurs or gallop.",
      rs: "Bilateral vesicular breath sounds clear. No added wheeze or rhonchi.",
      abdomen: "Soft, non-tender, no organomegaly, normal active bowel sounds.",
      cns: "Higher mental functions intact. Cranial nerves II-XII normal. Motor power 5/5 all limbs. Sensory intact. Neck supple, Kernig and Brudzinski signs negative.",
      other: "Fundoscopy: Bilateral optic discs sharp, no papilledema."
    },
    investigations: [
      {
        name: "Complete Blood Count (CBC)",
        date: "2026-09-20",
        result: "Hb: 14.8 g/dL, TLC: 7,400/uL, Platelets: 2.4 Lakhs",
        range: "Hb: 13-17 g/dL",
        remarks: "Within normal limits"
      },
      {
        name: "MRI Brain (Plain)",
        date: "2026-09-22",
        result: "Normal intracranial morphology. No intracranial hemorrhage, acute infarct, or space occupying lesion.",
        range: "Normal",
        remarks: "Secondary causes ruled out"
      }
    ],
    clinicalAssessment: {
      findings: "Unilateral frontotemporal throbbing headache with photophobia and nausea in a normotensive young adult with normal neurological examination.",
      provisionalDiagnosis: "Migraine without Aura (ICD-10 G43.0)",
      differentialDiagnosis: "Tension-type headache, Cervicogenic headache, Medication-overuse headache",
      impression: "Classic episodic migraine. Advised lifestyle modifications, sleep hygiene, and trigger management."
    },
    notes: {
      clinicalNotes: "Patient counseled regarding migraine triggers (screen glare, caffeine withdrawal, irregular sleep). Advised maintaining a headache diary.",
      followUp: "Review after 4 weeks or SOS if headache severity escalates.",
      remarks: "Avoid NSAIDs in empty stomach; maintain adequate hydration."
    },
    createdBy: "Dr. Sarah Johnson (Cardiology & Internal Medicine)",
    createdAt: "2026-09-25T10:30:00.000Z",
    updatedAt: "2026-09-25T11:15:00.000Z"
  },
  {
    caseId: "CASE-2026-002",
    patientId: "P-102",
    status: "Draft",
    patientDetails: {
      name: "Elena Rostova",
      age: 42,
      gender: "Female",
      dob: "1984-08-11",
      phone: "+91 98765 43212",
      email: "elena.rostova@email.com",
      address: "12th Main, Indiranagar, Bangalore - 560038"
    },
    chiefComplaint: [
      {
        complaint: "Right knee pain and joint stiffness on weight-bearing",
        duration: "6 weeks",
        severity: "Moderate",
        onset: "Gradual",
        relatedSymptoms: "Morning joint stiffness lasting 20 minutes, crepitus when climbing stairs"
      }
    ],
    historyOfPresentIllness: "42-year-old female presents with insidious onset right knee discomfort over 6 weeks. Pain is dull and aching, worse towards evening and following prolonged standing or descending stairs. No acute trauma, redness, or lock knee sensation.",
    pastHistory: {
      previousIllnesses: "Hypothyroidism (diagnosed 2019)",
      previousHospitalizations: "Obstetric delivery (2015)",
      previousSurgeries: "Cesarean section (2015)",
      previousSimilarComplaints: "Mild bilateral knee fatigue during marathon training 3 years ago",
      chronicConditions: "Primary Hypothyroidism"
    },
    medicationHistory: {
      currentMedications: "Tab. Thyroxine 50 mcg OD empty stomach morning",
      previousMedications: "Tab. Paracetamol 650mg SOS",
      dosage: "50 mcg",
      frequency: "Once Daily",
      duration: "5 years",
      medicationAllergies: "No known drug allergies (NKDA)"
    },
    familyHistory: {
      familyDiseases: "Mother has bilateral knee osteoarthritis; Father has gout",
      hereditaryConditions: "None",
      relevantFamilyHistory: "Familial tendency for early joint degeneration"
    },
    personalHistory: {
      diet: "Vegetarian",
      appetite: "Normal",
      sleep: "7 hours restful",
      bowelHabits: "Regular",
      bladderHabits: "Normal",
      physicalActivity: "Moderate (walking 30 mins daily)",
      smoking: "Non-smoker",
      alcohol: "Non-drinker",
      otherHabits: "None"
    },
    vitals: {
      temp: 98.4,
      bpSystolic: 118,
      bpDiastolic: 76,
      pulse: 68,
      respRate: 15,
      spo2: 99,
      weight: 68,
      height: 162,
      bmi: 25.9,
      bmiCategory: "Overweight"
    },
    clinicalExamination: {
      general: "Well-oriented, comfortable at rest. No pallor, icterus, cyanosis, or edema.",
      cvs: "S1, S2 audible normal.",
      rs: "Chest clear bilaterally.",
      abdomen: "Soft, non-tender.",
      cns: "Grossly intact.",
      other: "Right knee: Mild medial joint line tenderness. Fine crepitus during active flexion-extension. No joint effusion or localized warmth. Range of motion 0° to 125°. Anterior/posterior drawer and McMurray tests negative."
    },
    investigations: [
      {
        name: "Digital X-Ray Right Knee (AP & Lateral Weight-bearing)",
        date: "2026-09-26",
        result: "Mild medial compartment joint space narrowing, early subchondral sclerosis. Kellgren-Lawrence Grade 1-2.",
        range: "Normal joint space",
        remarks: "Consistent with early degenerative osteoarthritis"
      }
    ],
    clinicalAssessment: {
      findings: "Unilateral medial knee joint tenderness and crepitus with radiological medial space narrowing.",
      provisionalDiagnosis: "Early Primary Osteoarthritis Right Knee (Kellgren-Lawrence Grade 2)",
      differentialDiagnosis: "Medial meniscus degenerative tear, Pes anserine bursitis, Patellofemoral pain syndrome",
      impression: "Early knee osteoarthritis suitable for conservative management and physical therapy."
    },
    notes: {
      clinicalNotes: "Recommended quadriceps strengthening exercises, avoidance of deep squatting and cross-legged sitting.",
      followUp: "Review after 6 weeks.",
      remarks: "Topical NSAID gel prescribed for acute flare-ups."
    },
    createdBy: "Dr. Rajesh Gupta (Orthopedics)",
    createdAt: "2026-09-26T14:20:00.000Z",
    updatedAt: "2026-09-26T15:00:00.000Z"
  },
  {
    caseId: "CASE-2026-003",
    patientId: "P-103",
    status: "Completed",
    patientDetails: {
      name: "Mohammed Al-Rashid",
      age: 58,
      gender: "Male",
      dob: "1968-03-22",
      phone: "+91 98765 43214",
      email: "alrashid@email.com",
      address: "8th Cross, Koramangala 4th Block, Bangalore - 560034"
    },
    chiefComplaint: [
      {
        complaint: "Generalized fatigue, increased thirst (polydipsia) and nocturnal urination",
        duration: "2 months",
        severity: "Mild",
        onset: "Insidious",
        relatedSymptoms: "Occasional blurred vision, tingling in toes"
      }
    ],
    historyOfPresentIllness: "58-year-old male with progressive fatigue over 2 months. Waking 3-4 times per night for urination. Noticeable increase in water intake. Denies fever, weight loss, or dysuria.",
    pastHistory: {
      previousIllnesses: "Dyslipidemia (2021)",
      previousHospitalizations: "None",
      previousSurgeries: "None",
      previousSimilarComplaints: "None",
      chronicConditions: "Dyslipidemia, metabolic syndrome"
    },
    medicationHistory: {
      currentMedications: "Tab. Atorvastatin 20mg OD bedtime",
      previousMedications: "None",
      dosage: "20mg",
      frequency: "Once Daily",
      duration: "3 years",
      medicationAllergies: "NKDA"
    },
    familyHistory: {
      familyDiseases: "Strong paternal history of Type 2 Diabetes Mellitus",
      hereditaryConditions: "Cardiovascular disease in father and brother",
      relevantFamilyHistory: "Father died of myocardial infarction at age 62"
    },
    personalHistory: {
      diet: "Non-Vegetarian",
      appetite: "Increased (polyphagia)",
      sleep: "Interrupted by nocturia",
      bowelHabits: "Normal",
      bladderHabits: "Nocturia 3-4 times per night",
      physicalActivity: "Sedentary",
      smoking: "Former smoker (quit 2020)",
      alcohol: "None",
      otherHabits: "None"
    },
    vitals: {
      temp: 98.2,
      bpSystolic: 138,
      bpDiastolic: 88,
      pulse: 80,
      respRate: 16,
      spo2: 98,
      weight: 84,
      height: 172,
      bmi: 28.4,
      bmiCategory: "Overweight"
    },
    clinicalExamination: {
      general: "Acanthosis nigricans noted over nape of neck and axillae. No peripheral edema or diabetic foot ulcers.",
      cvs: "S1, S2 audible normal. No murmurs.",
      rs: "Vesicular breath sounds clear bilaterally.",
      abdomen: "Central adiposity. Soft, non-tender.",
      cns: "Monofilament 10g testing normal bilaterally. Vibration sense intact at medial malleolus.",
      other: "Peripheral pulses (dorsalis pedis, posterior tibial) well palpable bilaterally."
    },
    investigations: [
      {
        name: "Fasting Blood Sugar (FBS)",
        date: "2026-09-27",
        result: "184 mg/dL",
        range: "70-100 mg/dL",
        remarks: "Elevated"
      },
      {
        name: "HbA1c (Glycated Hemoglobin)",
        date: "2026-09-27",
        result: "8.6%",
        range: "<5.7% Normal, >=6.5% Diabetes",
        remarks: "Confirmatory for Type 2 Diabetes"
      },
      {
        name: "Serum Creatinine & eGFR",
        date: "2026-09-27",
        result: "0.9 mg/dL, eGFR >90 mL/min",
        range: "0.7-1.3 mg/dL",
        remarks: "Normal renal function"
      }
    ],
    clinicalAssessment: {
      findings: "Symptomatic hyperglycemia with elevated HbA1c in a patient with metabolic syndrome.",
      provisionalDiagnosis: "Type 2 Diabetes Mellitus — newly diagnosed (ICD-10 E11.9)",
      differentialDiagnosis: "Impaired Fasting Glucose, Latent Autoimmune Diabetes in Adults (LADA)",
      impression: "Uncontrolled Type 2 Diabetes requiring oral hypoglycemic therapy and medical nutrition therapy."
    },
    notes: {
      clinicalNotes: "Initiated Tab. Metformin 500mg BD after meals. Diabetic dietary chart provided. Self-monitoring of blood glucose (SMBG) demonstrated.",
      followUp: "Review with fasting & post-prandial blood glucose log in 2 weeks; repeat HbA1c in 3 months.",
      remarks: "Referred for dilated fundus screening and baseline microalbuminuria test."
    },
    createdBy: "Dr. Priya Sharma (General Medicine)",
    createdAt: "2026-09-27T09:15:00.000Z",
    updatedAt: "2026-09-27T10:00:00.000Z"
  }
];

export default function ClinicalCaseTakingView() {
  // Navigation View: "dashboard" | "new-case" | "case-details"
  const [currentView, setCurrentView] = useState("dashboard");

  // Cases List (initialized from localStorage with fallback)
  const [cases, setCases] = useState(() => {
    try {
      const saved = localStorage.getItem("nexus_clinical_cases");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_DEMO_CASES;
  });

  // Save to localStorage whenever cases change
  useEffect(() => {
    try {
      localStorage.setItem("nexus_clinical_cases", JSON.stringify(cases));
    } catch (e) {
      console.error(e);
    }
  }, [cases]);

  // Selected Case for Viewing
  const [selectedCase, setSelectedCase] = useState(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [genderFilter, setGenderFilter] = useState("All");

  // Notification Toast
  const [toast, setToast] = useState("");
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  // -------------------------------------------------------------
  // FORM STATE (Structured Sections A to L)
  // -------------------------------------------------------------
  const emptyForm = {
    caseId: "",
    patientId: "",
    status: "Draft",
    patientDetails: {
      name: "",
      age: "",
      gender: "Male",
      dob: "",
      phone: "",
      email: "",
      address: ""
    },
    chiefComplaint: [
      { complaint: "", duration: "", severity: "Moderate", onset: "Gradual", relatedSymptoms: "" }
    ],
    historyOfPresentIllness: "",
    pastHistory: {
      previousIllnesses: "",
      previousHospitalizations: "",
      previousSurgeries: "",
      previousSimilarComplaints: "",
      chronicConditions: ""
    },
    medicationHistory: {
      currentMedications: "",
      previousMedications: "",
      dosage: "",
      frequency: "",
      duration: "",
      medicationAllergies: ""
    },
    familyHistory: {
      familyDiseases: "",
      hereditaryConditions: "",
      relevantFamilyHistory: ""
    },
    personalHistory: {
      diet: "Non-Vegetarian",
      appetite: "Normal",
      sleep: "Normal",
      bowelHabits: "Regular",
      bladderHabits: "Normal",
      physicalActivity: "Moderate",
      smoking: "Non-smoker",
      alcohol: "Non-drinker",
      otherHabits: ""
    },
    vitals: {
      temp: 98.6,
      bpSystolic: 120,
      bpDiastolic: 80,
      pulse: 72,
      respRate: 16,
      spo2: 98,
      weight: 70,
      height: 170,
      bmi: 24.2,
      bmiCategory: "Normal"
    },
    clinicalExamination: {
      general: "",
      cvs: "",
      rs: "",
      abdomen: "",
      cns: "",
      other: ""
    },
    investigations: [
      { name: "", date: new Date().toISOString().split("T")[0], result: "", range: "", remarks: "" }
    ],
    clinicalAssessment: {
      findings: "",
      provisionalDiagnosis: "",
      differentialDiagnosis: "",
      impression: ""
    },
    notes: {
      clinicalNotes: "",
      followUp: "",
      remarks: ""
    },
    createdBy: "Dr. Sarah Johnson (Consultant Physician)",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [editingCaseId, setEditingCaseId] = useState(null);

  // Automatic BMI Calculation
  const calculateBmi = (weightKg, heightCm) => {
    const w = parseFloat(weightKg);
    const h = parseFloat(heightCm);
    if (!w || !h || h <= 0) return { bmi: 0, category: "N/A" };
    const heightM = h / 100;
    const bmiVal = parseFloat((w / (heightM * heightM)).toFixed(1));
    let cat = "Normal";
    if (bmiVal < 18.5) cat = "Underweight";
    else if (bmiVal >= 25.0 && bmiVal < 30.0) cat = "Overweight";
    else if (bmiVal >= 30.0) cat = "Obese";
    return { bmi: bmiVal, category: cat };
  };

  const handleVitalChange = (field, val) => {
    setFormData(prev => {
      const nextVitals = { ...prev.vitals, [field]: val };
      if (field === "weight" || field === "height") {
        const { bmi, category } = calculateBmi(
          field === "weight" ? val : prev.vitals.weight,
          field === "height" ? val : prev.vitals.height
        );
        nextVitals.bmi = bmi;
        nextVitals.bmiCategory = category;
      }
      return { ...prev, vitals: nextVitals };
    });
  };

  // Chief Complaint Handlers
  const addComplaint = () => {
    setFormData(prev => ({
      ...prev,
      chiefComplaint: [
        ...prev.chiefComplaint,
        { complaint: "", duration: "", severity: "Moderate", onset: "Gradual", relatedSymptoms: "" }
      ]
    }));
  };

  const removeComplaint = (idx) => {
    setFormData(prev => ({
      ...prev,
      chiefComplaint: prev.chiefComplaint.filter((_, i) => i !== idx)
    }));
  };

  const updateComplaint = (idx, field, val) => {
    setFormData(prev => ({
      ...prev,
      chiefComplaint: prev.chiefComplaint.map((c, i) => i === idx ? { ...c, [field]: val } : c)
    }));
  };

  // Investigation Handlers
  const addInvestigation = () => {
    setFormData(prev => ({
      ...prev,
      investigations: [
        ...prev.investigations,
        { name: "", date: new Date().toISOString().split("T")[0], result: "", range: "", remarks: "" }
      ]
    }));
  };

  const removeInvestigation = (idx) => {
    setFormData(prev => ({
      ...prev,
      investigations: prev.investigations.filter((_, i) => i !== idx)
    }));
  };

  const updateInvestigation = (idx, field, val) => {
    setFormData(prev => ({
      ...prev,
      investigations: prev.investigations.map((item, i) => i === idx ? { ...item, [field]: val } : item)
    }));
  };

  // Form Validation
  const validateForm = () => {
    const errs = {};
    if (!formData.patientId.trim()) errs.patientId = "Patient ID is required.";
    if (!formData.patientDetails.name.trim()) errs.patientName = "Patient Name is required.";
    const ageNum = parseInt(formData.patientDetails.age, 10);
    if (!formData.patientDetails.age || isNaN(ageNum) || ageNum <= 0 || ageNum > 130) {
      errs.age = "Please enter a valid age between 1 and 130.";
    }
    if (!formData.patientDetails.gender) errs.gender = "Gender is required.";

    const hasComplaint = formData.chiefComplaint.some(c => c.complaint.trim().length > 0);
    if (!hasComplaint) errs.chiefComplaint = "At least one Chief Complaint is required.";

    if (!formData.historyOfPresentIllness.trim()) {
      errs.historyOfPresentIllness = "History of Present Illness (HPI) is required.";
    }

    // Physiological Range Validations
    const pulse = parseFloat(formData.vitals.pulse);
    if (pulse && (pulse < 30 || pulse > 220)) errs.pulse = "Pulse must be between 30 and 220 bpm.";

    const spo2 = parseFloat(formData.vitals.spo2);
    if (spo2 && (spo2 < 50 || spo2 > 100)) errs.spo2 = "SpO2 must be between 50% and 100%.";

    const weight = parseFloat(formData.vitals.weight);
    if (weight && (weight < 1 || weight > 300)) errs.weight = "Weight must be between 1 and 300 kg.";

    const height = parseFloat(formData.vitals.height);
    if (height && (height < 30 || height > 250)) errs.height = "Height must be between 30 and 250 cm.";

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Save Case (Draft or Submit)
  const handleSaveCase = (targetStatus) => {
    if (targetStatus === "Completed" && !validateForm()) {
      showToast("⚠ Please correct validation errors before submitting.");
      return;
    }

    const newCaseId = editingCaseId || `CASE-2026-${String(cases.length + 1).padStart(3, "0")}`;
    const timestamp = new Date().toISOString();

    const caseToSave = {
      ...formData,
      caseId: newCaseId,
      status: targetStatus,
      updatedAt: timestamp,
      createdAt: editingCaseId ? formData.createdAt : timestamp
    };

    if (editingCaseId) {
      setCases(prev => prev.map(c => c.caseId === editingCaseId ? caseToSave : c));
      showToast(`✓ Case ${newCaseId} successfully updated (${targetStatus}).`);
    } else {
      setCases(prev => [caseToSave, ...prev]);
      showToast(`✓ New Case ${newCaseId} successfully recorded as ${targetStatus}.`);
    }

    setEditingCaseId(null);
    setFormData(emptyForm);
    setCurrentView("dashboard");
  };

  // Edit Case
  const handleEditCase = (c) => {
    setFormData(c);
    setEditingCaseId(c.caseId);
    setCurrentView("new-case");
  };

  // Delete Case
  const handleDeleteCase = (caseId) => {
    if (window.confirm(`Are you sure you want to delete case ${caseId}?`)) {
      setCases(prev => prev.filter(c => c.caseId !== caseId));
      if (selectedCase && selectedCase.caseId === caseId) setSelectedCase(null);
      showToast(`✓ Case ${caseId} deleted.`);
    }
  };

  // Print Case Details
  const handlePrintCase = () => {
    window.print();
  };

  // Export Case JSON
  const handleExportCase = (c) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(c, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `${c.caseId}_Clinical_Record.json`);
    dlAnchor.click();
    showToast(`✓ ${c.caseId} exported successfully.`);
  };

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    const total = cases.length;
    const draft = cases.filter(c => c.status === "Draft").length;
    const inReview = cases.filter(c => c.status === "In Review").length;
    const completed = cases.filter(c => c.status === "Completed").length;
    return { total, draft, inReview, completed };
  }, [cases]);

  // Filtered Cases
  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const matchSearch =
        c.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.patientDetails.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.chiefComplaint.some(comp => comp.complaint.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = statusFilter === "All" || c.status === statusFilter;
      const matchGender = genderFilter === "All" || c.patientDetails.gender === genderFilter;

      return matchSearch && matchStatus && matchGender;
    });
  }, [cases, searchTerm, statusFilter, genderFilter]);

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in font-sans">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-slate-900 text-white shadow-2xl border border-emerald-500/40 text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & MODULE CONTEXT BANNER
      ────────────────────────────────────────────────────────────── */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-cyan-500/10 via-blue-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <ClipboardList className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Clinical Case-Taking & History Module
              </h1>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                EHR Clinical Record
              </span>
            </div>
            <p className="text-slate-400 text-xs max-w-3xl leading-relaxed">
              Standardized clinical history taking and examination protocol: chief complaints, history of present illness, past medical/surgical history, medication allergies, systemic examination, and vitals telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setFormData(emptyForm);
                setEditingCaseId(null);
                setCurrentView("new-case");
              }}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-black text-xs transition flex items-center gap-2 shadow-md cursor-pointer"
            >
              <FilePlus className="w-4 h-4" />
              <span>Record New Case</span>
            </button>

            <button
              onClick={() => setCurrentView("dashboard")}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                currentView === "dashboard"
                  ? "bg-slate-800 text-white border border-slate-700"
                  : "bg-slate-800/60 hover:bg-slate-800 text-slate-300"
              }`}
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>My Cases</span>
            </button>
          </div>
        </div>

        {/* Safety Disclaimer Banner */}
        <div className="mt-4 p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-cyan-300 flex items-center gap-2 font-medium">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>
            <strong>Clinical Safety Protocol:</strong> This module is an assistive documentation tool for registered clinical practitioners. Final medical assessments and prescriptions require professional clinical discretion.
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. DASHBOARD VIEW: SUMMARY METRICS & CASES LIST
      ────────────────────────────────────────────────────────────── */}
      {currentView === "dashboard" && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Clinical Cases</span>
              <div className="text-3xl font-black text-slate-900 mt-1">{summaryMetrics.total}</div>
              <span className="text-[10px] text-slate-400 font-medium">Across all departments</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Draft Cases</span>
              <div className="text-3xl font-black text-amber-600 mt-1">{summaryMetrics.draft}</div>
              <span className="text-[10px] text-amber-600 font-medium">Pending physician completion</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">In Review</span>
              <div className="text-3xl font-black text-blue-600 mt-1">{summaryMetrics.inReview}</div>
              <span className="text-[10px] text-blue-600 font-medium">Awaiting lab / radiology sync</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Completed Cases</span>
              <div className="text-3xl font-black text-emerald-600 mt-1">{summaryMetrics.completed}</div>
              <span className="text-[10px] text-emerald-600 font-medium">Finalized clinical records</span>
            </div>
          </div>

          {/* Search, Filter Toolbar & Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-600" />
                <h2 className="text-base font-black text-slate-900">Recorded Patient Cases</h2>
                <span className="text-xs text-slate-400 font-semibold">({filteredCases.length} cases found)</span>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Search Input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search Case ID, Patient, Complaint..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-cyan-500 w-64"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="In Review">In Review</option>
                  <option value="Completed">Completed</option>
                </select>

                {/* Gender Filter */}
                <select
                  value={genderFilter}
                  onChange={e => setGenderFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
                >
                  <option value="All">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Cases Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-[10px] font-bold uppercase">
                    <th className="py-3 px-3">Case ID</th>
                    <th className="py-3 px-3">Patient Details</th>
                    <th className="py-3 px-3">Chief Complaint</th>
                    <th className="py-3 px-3">Created Date</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCases.map(c => (
                    <tr key={c.caseId} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-3 font-mono font-black text-cyan-800">
                        {c.caseId}
                        <span className="block text-[10px] text-slate-400 font-normal">ID: {c.patientId}</span>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-extrabold text-slate-900 text-sm">{c.patientDetails.name}</div>
                        <div className="text-slate-500 text-[11px]">
                          {c.patientDetails.age} Y · {c.patientDetails.gender} · {c.patientDetails.phone}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 max-w-xs">
                        <div className="font-semibold text-slate-800 truncate" title={c.chiefComplaint[0]?.complaint}>
                          {c.chiefComplaint[0]?.complaint || "Not specified"}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Duration: {c.chiefComplaint[0]?.duration} · {c.chiefComplaint[0]?.severity}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap text-slate-500 font-medium">
                        {new Date(c.createdAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                        <span className="block text-[10px] text-slate-400">
                          {new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          c.status === "Completed"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : c.status === "Draft"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-blue-100 text-blue-800 border border-blue-200"
                        }`}>
                          ● {c.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedCase(c);
                              setCurrentView("case-details");
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                            title="View Full Case"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleEditCase(c)}
                            className="p-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 cursor-pointer"
                            title={c.status === "Draft" ? "Continue Draft" : "Edit Case"}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteCase(c.caseId)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
                            title="Delete Case"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredCases.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                        No clinical cases matched your search or filters. Click "Record New Case" to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. NEW CLINICAL CASE FORM (SECTIONS A TO L)
      ────────────────────────────────────────────────────────────── */}
      {currentView === "new-case" && (
        <form onSubmit={e => { e.preventDefault(); handleSaveCase("Completed"); }} className="space-y-6">
          {/* Form Header Toolbar */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-black uppercase text-cyan-700 tracking-wider">
                {editingCaseId ? `Editing: ${editingCaseId}` : "New Clinical Documentation"}
              </span>
              <h2 className="text-xl font-black text-slate-900">
                {editingCaseId ? `Update Clinical Case Record (${editingCaseId})` : "Comprehensive Clinical Case-Taking Form"}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSaveCase("Draft")}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl cursor-pointer transition"
              >
                Save Draft
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-black text-xs rounded-xl cursor-pointer shadow-md transition"
              >
                Submit & Complete Case
              </button>

              <button
                type="button"
                onClick={() => setCurrentView("dashboard")}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Validation Error Banner */}
          {Object.keys(formErrors).length > 0 && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>Please resolve the following required fields before submitting:</span>
              </div>
              <ul className="list-disc list-inside text-red-700 pl-4">
                {Object.values(formErrors).map((msg, idx) => (
                  <li key={idx}>{msg}</li>
                ))}
              </ul>
            </div>
          )}

          {/* SECTION A — PATIENT DETAILS */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <User className="w-4 h-4 text-cyan-600" />
              <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                Section A — Patient Details
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Patient ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. P-101"
                  value={formData.patientId}
                  onChange={e => setFormData({ ...formData, patientId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Harsh Tripathi"
                  value={formData.patientDetails.name}
                  onChange={e => setFormData({ ...formData, patientDetails: { ...formData.patientDetails, name: e.target.value } })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Age (Years) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 34"
                  min="0"
                  max="130"
                  value={formData.patientDetails.age}
                  onChange={e => setFormData({ ...formData, patientDetails: { ...formData.patientDetails, age: e.target.value } })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.patientDetails.gender}
                  onChange={e => setFormData({ ...formData, patientDetails: { ...formData.patientDetails, gender: e.target.value } })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.patientDetails.dob}
                  onChange={e => setFormData({ ...formData, patientDetails: { ...formData.patientDetails, dob: e.target.value } })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={formData.patientDetails.phone}
                  onChange={e => setFormData({ ...formData, patientDetails: { ...formData.patientDetails, phone: e.target.value } })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="patient@example.com"
                  value={formData.patientDetails.email}
                  onChange={e => setFormData({ ...formData, patientDetails: { ...formData.patientDetails, email: e.target.value } })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Address / Locality</label>
                <input
                  type="text"
                  placeholder="City, State"
                  value={formData.patientDetails.address}
                  onChange={e => setFormData({ ...formData, patientDetails: { ...formData.patientDetails, address: e.target.value } })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>
            </div>
          </div>

          {/* SECTION B — CHIEF COMPLAINT */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-cyan-600" />
                <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                  Section B — Chief Complaints <span className="text-red-500">*</span>
                </h3>
              </div>

              <button
                type="button"
                onClick={addComplaint}
                className="px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Another Complaint
              </button>
            </div>

            <div className="space-y-3">
              {formData.chiefComplaint.map((comp, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-700">Complaint #{idx + 1}</span>
                    {formData.chiefComplaint.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeComplaint(idx)}
                        className="text-red-500 hover:text-red-700 text-xs font-bold"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div className="sm:col-span-2">
                      <label className="font-bold text-slate-600 block mb-1">Chief Complaint</label>
                      <input
                        type="text"
                        placeholder="e.g. Throbbing frontotemporal headache"
                        value={comp.complaint}
                        onChange={e => updateComplaint(idx, "complaint", e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-semibold"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Duration</label>
                      <input
                        type="text"
                        placeholder="e.g. 3 weeks"
                        value={comp.duration}
                        onChange={e => updateComplaint(idx, "duration", e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-semibold"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Severity</label>
                      <select
                        value={comp.severity}
                        onChange={e => updateComplaint(idx, "severity", e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-semibold"
                      >
                        <option value="Mild">Mild</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Severe">Severe</option>
                        <option value="Very Severe">Very Severe</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Onset</label>
                      <select
                        value={comp.onset}
                        onChange={e => updateComplaint(idx, "onset", e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-semibold"
                      >
                        <option value="Gradual">Gradual</option>
                        <option value="Acute / Sudden">Acute / Sudden</option>
                        <option value="Chronic Episodic">Chronic Episodic</option>
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="font-bold text-slate-600 block mb-1">Related Symptoms</label>
                      <input
                        type="text"
                        placeholder="e.g. Nausea, photophobia, phonophobia"
                        value={comp.relatedSymptoms}
                        onChange={e => updateComplaint(idx, "relatedSymptoms", e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-semibold"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION C — HISTORY OF PRESENT ILLNESS (HPI) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <FileText className="w-4 h-4 text-cyan-600" />
              <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                Section C — History of Present Illness (HPI) <span className="text-red-500">*</span>
              </h3>
            </div>

            <p className="text-xs text-slate-500">
              Detail onset, progression, character, associated symptoms, previous episodes, aggravating factors, and relieving factors.
            </p>

            <textarea
              rows={5}
              placeholder="e.g. Patient reports recurrent unilateral pulsating headaches occurring 2-3 times per week..."
              value={formData.historyOfPresentIllness}
              onChange={e => setFormData({ ...formData, historyOfPresentIllness: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium leading-relaxed focus:outline-cyan-500"
            />
          </div>

          {/* SECTION D — PAST HISTORY */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Clock className="w-4 h-4 text-cyan-600" />
              <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                Section D — Past History
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Previous Illnesses</label>
                <input
                  type="text"
                  placeholder="e.g. Jaundice (2016), Typhoid (2020)"
                  value={formData.pastHistory.previousIllnesses}
                  onChange={e => setFormData({ ...formData, pastHistory: { ...formData.pastHistory, previousIllnesses: e.target.value } })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Previous Hospitalizations</label>
                <input
                  type="text"
                  placeholder="e.g. 3 days hospital stay for dengue fever (2022)"
                  value={formData.pastHistory.previousHospitalizations}
                  onChange={e => setFormData({ ...formData, pastHistory: { ...formData.pastHistory, previousHospitalizations: e.target.value } })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Previous Surgeries</label>
                <input
                  type="text"
                  placeholder="e.g. Appendectomy under GA (2018)"
                  value={formData.pastHistory.previousSurgeries}
                  onChange={e => setFormData({ ...formData, pastHistory: { ...formData.pastHistory, previousSurgeries: e.target.value } })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Previous Similar Complaints</label>
                <input
                  type="text"
                  placeholder="e.g. Similar episodic episodes 2 years ago"
                  value={formData.pastHistory.previousSimilarComplaints}
                  onChange={e => setFormData({ ...formData, pastHistory: { ...formData.pastHistory, previousSimilarComplaints: e.target.value } })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Known Chronic Conditions</label>
                <input
                  type="text"
                  placeholder="e.g. Hypertension, Diabetes, Asthma, Thyroid Disorder"
                  value={formData.pastHistory.chronicConditions}
                  onChange={e => setFormData({ ...formData, pastHistory: { ...formData.pastHistory, chronicConditions: e.target.value } })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* SECTION E — MEDICATION HISTORY */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Activity className="w-4 h-4 text-cyan-600" />
              <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                Section E — Medication History & Allergies
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Current Medications</label>
                <input
                  type="text"
                  placeholder="e.g. Tab. Metoprolol 25mg OD, Tab. Atorvastatin 20mg"
                  value={formData.medicationHistory.currentMedications}
                  onChange={e => setFormData({ ...formData, medicationHistory: { ...formData.medicationHistory, currentMedications: e.target.value } })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Dosage & Frequency</label>
                <input
                  type="text"
                  placeholder="e.g. 25mg Once Daily"
                  value={formData.medicationHistory.dosage}
                  onChange={e => setFormData({ ...formData, medicationHistory: { ...formData.medicationHistory, dosage: e.target.value } })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="sm:col-span-3 p-3 rounded-xl bg-red-50 border border-red-200">
                <label className="font-black text-red-900 block mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  Medication Allergies (High Clinical Impact)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Penicillin, Sulfa drugs, NSAIDs, or NKDA (No Known Drug Allergies)"
                  value={formData.medicationHistory.medicationAllergies}
                  onChange={e => setFormData({ ...formData, medicationHistory: { ...formData.medicationHistory, medicationAllergies: e.target.value } })}
                  className="w-full px-3 py-2 bg-white border border-red-300 rounded-xl font-bold text-red-900"
                />
              </div>
            </div>
          </div>

          {/* SECTION F & G — FAMILY & PERSONAL HISTORY */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* SECTION F — FAMILY HISTORY */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <Users className="w-4 h-4 text-cyan-600" />
                <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                  Section F — Family History
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Family Diseases</label>
                  <input
                    type="text"
                    placeholder="e.g. Maternal migraine, Paternal hypertension"
                    value={formData.familyHistory.familyDiseases}
                    onChange={e => setFormData({ ...formData, familyHistory: { ...formData.familyHistory, familyDiseases: e.target.value } })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hereditary / Genetic Conditions</label>
                  <input
                    type="text"
                    placeholder="e.g. Thalassemia trait, early CAD"
                    value={formData.familyHistory.hereditaryConditions}
                    onChange={e => setFormData({ ...formData, familyHistory: { ...formData.familyHistory, hereditaryConditions: e.target.value } })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* SECTION G — PERSONAL HISTORY */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                <User className="w-4 h-4 text-cyan-600" />
                <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                  Section G — Personal History
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Diet</label>
                  <select
                    value={formData.personalHistory.diet}
                    onChange={e => setFormData({ ...formData, personalHistory: { ...formData.personalHistory, diet: e.target.value } })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                  >
                    <option>Vegetarian</option>
                    <option>Non-Vegetarian</option>
                    <option>Vegan</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-600 block mb-1">Appetite</label>
                  <select
                    value={formData.personalHistory.appetite}
                    onChange={e => setFormData({ ...formData, personalHistory: { ...formData.personalHistory, appetite: e.target.value } })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                  >
                    <option>Normal</option>
                    <option>Reduced</option>
                    <option>Increased</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-600 block mb-1">Sleep</label>
                  <select
                    value={formData.personalHistory.sleep}
                    onChange={e => setFormData({ ...formData, personalHistory: { ...formData.personalHistory, sleep: e.target.value } })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                  >
                    <option>Normal</option>
                    <option>Disturbed</option>
                    <option>Insomnia</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-600 block mb-1">Smoking</label>
                  <select
                    value={formData.personalHistory.smoking}
                    onChange={e => setFormData({ ...formData, personalHistory: { ...formData.personalHistory, smoking: e.target.value } })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                  >
                    <option>Non-smoker</option>
                    <option>Former Smoker</option>
                    <option>Current Smoker</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-600 block mb-1">Alcohol</label>
                  <select
                    value={formData.personalHistory.alcohol}
                    onChange={e => setFormData({ ...formData, personalHistory: { ...formData.personalHistory, alcohol: e.target.value } })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                  >
                    <option>Non-drinker</option>
                    <option>Occasional</option>
                    <option>Regular</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-600 block mb-1">Physical Activity</label>
                  <select
                    value={formData.personalHistory.physicalActivity}
                    onChange={e => setFormData({ ...formData, personalHistory: { ...formData.personalHistory, physicalActivity: e.target.value } })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                  >
                    <option>Sedentary</option>
                    <option>Moderate</option>
                    <option>Active</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION H — VITALS (WITH AUTOMATIC BMI CALCULATION) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-500" />
                <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                  Section H — Vitals & Telemetry (Auto-Computed BMI)
                </h3>
              </div>
              <span className="text-xs font-black text-cyan-700 bg-cyan-50 px-2.5 py-0.5 rounded-full">
                BMI: {formData.vitals.bmi || "—"} ({formData.vitals.bmiCategory})
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 block mb-1">Temp (°F)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.vitals.temp}
                  onChange={e => handleVitalChange("temp", e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">BP Sys (mmHg)</label>
                <input
                  type="number"
                  value={formData.vitals.bpSystolic}
                  onChange={e => handleVitalChange("bpSystolic", e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">BP Dia (mmHg)</label>
                <input
                  type="number"
                  value={formData.vitals.bpDiastolic}
                  onChange={e => handleVitalChange("bpDiastolic", e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Pulse (bpm)</label>
                <input
                  type="number"
                  value={formData.vitals.pulse}
                  onChange={e => handleVitalChange("pulse", e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Resp Rate (/m)</label>
                <input
                  type="number"
                  value={formData.vitals.respRate}
                  onChange={e => handleVitalChange("respRate", e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">SpO2 (%)</label>
                <input
                  type="number"
                  value={formData.vitals.spo2}
                  onChange={e => handleVitalChange("spo2", e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.vitals.weight}
                  onChange={e => handleVitalChange("weight", e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">Height (cm)</label>
                <input
                  type="number"
                  value={formData.vitals.height}
                  onChange={e => handleVitalChange("height", e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>
            </div>
          </div>

          {/* SECTION I — CLINICAL EXAMINATION */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Stethoscope className="w-4 h-4 text-cyan-600" />
              <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                Section I — Systemic Clinical Examination
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">General Physical Examination</label>
                <textarea
                  rows={3}
                  placeholder="Pallor, Icterus, Cyanosis, Clubbing, Lymphadenopathy, Edema..."
                  value={formData.clinicalExamination.general}
                  onChange={e => setFormData({ ...formData, clinicalExamination: { ...formData.clinicalExamination, general: e.target.value } })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Cardiovascular System (CVS)</label>
                <textarea
                  rows={3}
                  placeholder="S1, S2, murmurs, apex beat..."
                  value={formData.clinicalExamination.cvs}
                  onChange={e => setFormData({ ...formData, clinicalExamination: { ...formData.clinicalExamination, cvs: e.target.value } })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Respiratory System (RS)</label>
                <textarea
                  rows={3}
                  placeholder="Bilateral breath sounds, wheezing, crepitations..."
                  value={formData.clinicalExamination.rs}
                  onChange={e => setFormData({ ...formData, clinicalExamination: { ...formData.clinicalExamination, rs: e.target.value } })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Abdominal Examination (P/A)</label>
                <textarea
                  rows={3}
                  placeholder="Soft, non-tender, organomegaly, bowel sounds..."
                  value={formData.clinicalExamination.abdomen}
                  onChange={e => setFormData({ ...formData, clinicalExamination: { ...formData.clinicalExamination, abdomen: e.target.value } })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Central Nervous System (CNS)</label>
                <textarea
                  rows={3}
                  placeholder="Higher functions, cranial nerves, motor, sensory, reflexes..."
                  value={formData.clinicalExamination.cns}
                  onChange={e => setFormData({ ...formData, clinicalExamination: { ...formData.clinicalExamination, cns: e.target.value } })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Other / Local System Examination</label>
                <textarea
                  rows={3}
                  placeholder="Joint examination, local swelling, musculoskeletal..."
                  value={formData.clinicalExamination.other}
                  onChange={e => setFormData({ ...formData, clinicalExamination: { ...formData.clinicalExamination, other: e.target.value } })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* SECTION J — INVESTIGATIONS */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Microscope className="w-4 h-4 text-cyan-600" />
                <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                  Section J — Diagnostic & Laboratory Investigations
                </h3>
              </div>

              <button
                type="button"
                onClick={addInvestigation}
                className="px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Investigation
              </button>
            </div>

            <div className="space-y-3">
              {formData.investigations.map((inv, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs items-center">
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Test Name</label>
                    <input
                      type="text"
                      placeholder="e.g. CBC, Serum Creatinine"
                      value={inv.name}
                      onChange={e => updateInvestigation(idx, "name", e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Date</label>
                    <input
                      type="date"
                      value={inv.date}
                      onChange={e => updateInvestigation(idx, "date", e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Result</label>
                    <input
                      type="text"
                      placeholder="e.g. 14.8 g/dL"
                      value={inv.result}
                      onChange={e => updateInvestigation(idx, "result", e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Reference Range & Remarks</label>
                    <input
                      type="text"
                      placeholder="e.g. 13-17 g/dL (Normal)"
                      value={inv.range}
                      onChange={e => updateInvestigation(idx, "range", e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div className="text-right">
                    {formData.investigations.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInvestigation(idx)}
                        className="text-red-500 hover:text-red-700 text-xs font-bold pt-4"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION K — CLINICAL ASSESSMENT */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <FileCheck className="w-4 h-4 text-cyan-600" />
              <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                Section K — Clinical Assessment & Differential Diagnosis
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Clinical Findings Summary</label>
                <textarea
                  rows={2}
                  placeholder="Summary of pertinent positive and negative clinical findings..."
                  value={formData.clinicalAssessment.findings}
                  onChange={e => setFormData({ ...formData, clinicalAssessment: { ...formData.clinicalAssessment, findings: e.target.value } })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Provisional Clinical Diagnosis</label>
                <input
                  type="text"
                  placeholder="e.g. Migraine without Aura (ICD-10 G43.0)"
                  value={formData.clinicalAssessment.provisionalDiagnosis}
                  onChange={e => setFormData({ ...formData, clinicalAssessment: { ...formData.clinicalAssessment, provisionalDiagnosis: e.target.value } })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Differential Diagnoses</label>
                <input
                  type="text"
                  placeholder="e.g. Tension-type headache, Cervicogenic headache"
                  value={formData.clinicalAssessment.differentialDiagnosis}
                  onChange={e => setFormData({ ...formData, clinicalAssessment: { ...formData.clinicalAssessment, differentialDiagnosis: e.target.value } })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Clinical Impression & Management Plan</label>
                <textarea
                  rows={2}
                  placeholder="Summary clinical rationale and proposed patient care trajectory..."
                  value={formData.clinicalAssessment.impression}
                  onChange={e => setFormData({ ...formData, clinicalAssessment: { ...formData.clinicalAssessment, impression: e.target.value } })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* SECTION L — CASE NOTES */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <FileText className="w-4 h-4 text-cyan-600" />
              <h3 className="font-black text-sm text-slate-900 uppercase tracking-wider">
                Section L — Clinical Notes & Follow-Up Advice
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Clinical Notes & Counseling</label>
                <textarea
                  rows={3}
                  placeholder="Patient counseling, lifestyle advice, diet restrictions..."
                  value={formData.notes.clinicalNotes}
                  onChange={e => setFormData({ ...formData, notes: { ...formData.notes, clinicalNotes: e.target.value } })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Follow-Up Schedule & Red Flags</label>
                <textarea
                  rows={3}
                  placeholder="Next follow-up timing, warning signs requiring immediate emergency revisit..."
                  value={formData.notes.followUp}
                  onChange={e => setFormData({ ...formData, notes: { ...formData.notes, followUp: e.target.value } })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Form Actions Bottom Bar */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Assigned Clinician: <strong>{formData.createdBy}</strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentView("dashboard")}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleSaveCase("Draft")}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Save as Draft
              </button>

              <button
                type="submit"
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-black text-xs rounded-xl cursor-pointer shadow-md"
              >
                Submit & Complete Record
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. CASE DETAILS VIEW (PRINT & EXPORT CAPABLE)
      ────────────────────────────────────────────────────────────── */}
      {currentView === "case-details" && selectedCase && (
        <div className="space-y-6 animate-scale-in">
          {/* Top Actions Bar */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView("dashboard")}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                title="Back to Cases"
              >
                <X className="w-4 h-4" />
              </button>

              <div>
                <span className="text-[10px] font-black uppercase text-cyan-700 font-mono">
                  {selectedCase.caseId} · Patient: {selectedCase.patientId}
                </span>
                <h2 className="text-xl font-black text-slate-900">
                  {selectedCase.patientDetails.name}'s Clinical Record
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEditCase(selectedCase)}
                className="px-3.5 py-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit Case
              </button>

              <button
                onClick={handlePrintCase}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Print Case
              </button>

              <button
                onClick={() => handleExportCase(selectedCase)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Export JSON
              </button>
            </div>
          </div>

          {/* Printable Structured Record Document */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs space-y-6 print:border-none print:p-0">
            {/* Header Document Strip */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-5">
              <div>
                <div className="text-xs font-black uppercase text-cyan-800 tracking-wider">MediCare Nexus Healthcare Platform</div>
                <h1 className="text-2xl font-black text-slate-900 mt-0.5">Clinical Case-Taking & Evaluation Report</h1>
                <p className="text-xs text-slate-500 mt-1">Recorded by: {selectedCase.createdBy}</p>
              </div>

              <div className="text-right">
                <span className="font-mono text-sm font-black text-cyan-900 block">{selectedCase.caseId}</span>
                <span className="text-[10px] text-slate-400 block">
                  Date: {new Date(selectedCase.createdAt).toLocaleDateString()}
                </span>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  selectedCase.status === "Completed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                }`}>
                  {selectedCase.status}
                </span>
              </div>
            </div>

            {/* Section A: Patient Details */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-600" /> Patient Demographics
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs p-3 bg-slate-50 rounded-xl">
                <div><span className="text-slate-400 block text-[10px] uppercase font-bold">Name</span><strong>{selectedCase.patientDetails.name}</strong></div>
                <div><span className="text-slate-400 block text-[10px] uppercase font-bold">Age / Gender</span><strong>{selectedCase.patientDetails.age} Y / {selectedCase.patientDetails.gender}</strong></div>
                <div><span className="text-slate-400 block text-[10px] uppercase font-bold">Contact</span><strong>{selectedCase.patientDetails.phone}</strong></div>
                <div><span className="text-slate-400 block text-[10px] uppercase font-bold">Patient ID</span><strong className="font-mono">{selectedCase.patientId}</strong></div>
              </div>
            </div>

            {/* Section B & C: Complaints & HPI */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-1 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-cyan-600" /> Chief Complaints & HPI
              </h3>
              <div className="space-y-2 text-xs">
                {selectedCase.chiefComplaint.map((comp, i) => (
                  <div key={i} className="p-3 bg-cyan-50/50 rounded-xl border border-cyan-100 flex justify-between items-start">
                    <div>
                      <strong className="text-slate-900 text-sm">{comp.complaint}</strong>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Related symptoms: {comp.relatedSymptoms || "None"}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-cyan-200 text-cyan-900 font-bold text-[10px]">
                      Duration: {comp.duration} ({comp.severity})
                    </span>
                  </div>
                ))}

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">History of Present Illness (HPI)</span>
                  <p className="text-slate-700 leading-relaxed font-medium">{selectedCase.historyOfPresentIllness}</p>
                </div>
              </div>
            </div>

            {/* Section D & E: Past & Medication History */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <h4 className="font-black text-slate-900 uppercase text-[11px]">Past Medical & Surgical History</h4>
                <div><span className="text-slate-400">Previous Illnesses:</span> <strong>{selectedCase.pastHistory.previousIllnesses || "None"}</strong></div>
                <div><span className="text-slate-400">Surgeries:</span> <strong>{selectedCase.pastHistory.previousSurgeries || "None"}</strong></div>
                <div><span className="text-slate-400">Chronic Conditions:</span> <strong>{selectedCase.pastHistory.chronicConditions || "None"}</strong></div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                <h4 className="font-black text-slate-900 uppercase text-[11px]">Medications & Allergies</h4>
                <div><span className="text-slate-400">Current Medications:</span> <strong>{selectedCase.medicationHistory.currentMedications || "None"}</strong></div>
                <div className="p-2 rounded bg-red-50 text-red-900 font-bold">
                  Allergies: {selectedCase.medicationHistory.medicationAllergies || "NKDA"}
                </div>
              </div>
            </div>

            {/* Section H: Vitals & Telemetry */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-1 flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-rose-500" /> Vitals Telemetry & Physical Metrics
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border"><span className="text-[10px] text-slate-400 block">Temperature</span><strong>{selectedCase.vitals.temp} °F</strong></div>
                <div className="p-2.5 bg-slate-50 rounded-xl border"><span className="text-[10px] text-slate-400 block">Blood Pressure</span><strong>{selectedCase.vitals.bpSystolic}/{selectedCase.vitals.bpDiastolic}</strong></div>
                <div className="p-2.5 bg-slate-50 rounded-xl border"><span className="text-[10px] text-slate-400 block">Pulse</span><strong>{selectedCase.vitals.pulse} bpm</strong></div>
                <div className="p-2.5 bg-slate-50 rounded-xl border"><span className="text-[10px] text-slate-400 block">SpO2</span><strong>{selectedCase.vitals.spo2}%</strong></div>
                <div className="p-2.5 bg-slate-50 rounded-xl border"><span className="text-[10px] text-slate-400 block">Height / Weight</span><strong>{selectedCase.vitals.height}cm / {selectedCase.vitals.weight}kg</strong></div>
                <div className="p-2.5 bg-cyan-50 rounded-xl border border-cyan-200 col-span-2"><span className="text-[10px] text-cyan-800 block">BMI & Category</span><strong className="text-cyan-900">{selectedCase.vitals.bmi} ({selectedCase.vitals.bmiCategory})</strong></div>
              </div>
            </div>

            {/* Section I: Clinical Examination */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-1 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-cyan-600" /> Physical & Systemic Examination
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl"><span className="font-bold text-slate-900 block mb-0.5">General:</span> {selectedCase.clinicalExamination.general || "NAD"}</div>
                <div className="p-2.5 bg-slate-50 rounded-xl"><span className="font-bold text-slate-900 block mb-0.5">CVS:</span> {selectedCase.clinicalExamination.cvs || "NAD"}</div>
                <div className="p-2.5 bg-slate-50 rounded-xl"><span className="font-bold text-slate-900 block mb-0.5">RS:</span> {selectedCase.clinicalExamination.rs || "NAD"}</div>
                <div className="p-2.5 bg-slate-50 rounded-xl"><span className="font-bold text-slate-900 block mb-0.5">Abdomen:</span> {selectedCase.clinicalExamination.abdomen || "NAD"}</div>
                <div className="p-2.5 bg-slate-50 rounded-xl"><span className="font-bold text-slate-900 block mb-0.5">CNS:</span> {selectedCase.clinicalExamination.cns || "NAD"}</div>
                <div className="p-2.5 bg-slate-50 rounded-xl"><span className="font-bold text-slate-900 block mb-0.5">Other / Local:</span> {selectedCase.clinicalExamination.other || "NAD"}</div>
              </div>
            </div>

            {/* Section K & L: Assessment, Diagnosis & Notes */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="font-black text-slate-900 uppercase text-xs">Clinical Impression & Diagnosis</h4>
                <span className="font-bold text-cyan-800">Provisional: {selectedCase.clinicalAssessment.provisionalDiagnosis}</span>
              </div>
              <div><span className="text-slate-400 font-bold block text-[10px] uppercase">Differential Diagnosis</span><p className="text-slate-800">{selectedCase.clinicalAssessment.differentialDiagnosis || "None listed"}</p></div>
              <div><span className="text-slate-400 font-bold block text-[10px] uppercase">Plan & Counseling</span><p className="text-slate-800 leading-relaxed">{selectedCase.notes.clinicalNotes}</p></div>
              <div><span className="text-slate-400 font-bold block text-[10px] uppercase">Follow-Up Schedule</span><p className="text-slate-800 font-bold">{selectedCase.notes.followUp}</p></div>
            </div>

            {/* Sign-off Strip */}
            <div className="pt-6 border-t border-slate-200 flex justify-between items-end text-xs">
              <div className="text-slate-400 text-[10px]">
                Report Generated via MediCare Nexus Clinical Documentation Subsystem
              </div>
              <div className="text-right">
                <div className="font-black text-slate-900">{selectedCase.createdBy}</div>
                <div className="text-[10px] text-slate-400">Authenticated Medical Practitioner</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
