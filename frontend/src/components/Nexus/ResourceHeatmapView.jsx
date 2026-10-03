// frontend/src/components/Nexus/ResourceHeatmapView.jsx
import React, { useState, useMemo } from "react";
import {
  Bed,
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Users,
  Monitor,
  Wrench,
  X,
  Sparkles,
  RefreshCw,
  Plus,
  ArrowRight,
  Filter,
  Check,
  Search,
  Eye,
  FileText,
  Stethoscope,
  HeartPulse,
  UserCheck,
  ClipboardList
} from "lucide-react";

// Initial Bed Data Matrix with Complete Clinical Occupancy Records
const INITIAL_BEDS = [
  {
    ward: "General Ward",
    floor: "1st Floor",
    beds: [
      { id: "Bed 101", status: "AVAILABLE", occupant: null, cleaner: null, notes: "Sanitized & ready for immediate clinical intake" },
      {
        id: "Bed 102",
        status: "OCCUPIED",
        patientId: "PID-10101",
        patientName: "Harsh Tripathi",
        age: 34,
        gender: "Male",
        admittedAt: "03 Oct 2026, 08:30 AM",
        admittedDuration: "4 hours 15 mins ago",
        admissionReason: "Severe retrosternal chest pain with diaphoresis; admitted for continuous 12-lead ECG telemetry monitoring and post-ECG cardiac enzyme titration",
        diagnosis: "Acute Coronary Syndrome (NSTEMI Rule-out)",
        doctor: "Dr. Sarah Johnson (Cardiology)",
        nurse: "Nurse Priya M.",
        vitals: { bp: "128/84 mmHg", hr: "76 bpm", spo2: "98%", temp: "98.6 °F" },
        occupant: "Harsh Tripathi (PID-10101)",
        notes: "Cardiac telemetry active. Troponin-I repeat scheduled for 02:00 PM."
      },
      { id: "Bed 103", status: "AVAILABLE", occupant: null, cleaner: null, notes: "Sanitized & verified by Floor Supervisor" },
      { id: "Bed 104", status: "CLEANING", occupant: null, cleaner: "Cleaning Staff 2", notes: "Terminal UV-C disinfection in progress (ETA 10m)" },
      { id: "Bed 105", status: "AVAILABLE", occupant: null, cleaner: null, notes: "Ready for walk-in OPD admission" },
      { id: "Bed 106", status: "AVAILABLE", occupant: null, cleaner: null, notes: "Oxygen pipeline & suction port verified" },
    ]
  },
  {
    ward: "General Ward",
    floor: "2nd Floor",
    beds: [
      {
        id: "Bed 201",
        status: "PENDING",
        patientId: "PID-20104",
        patientName: "Rajesh Verma",
        age: 46,
        gender: "Male",
        admittedAt: "03 Oct 2026, 09:15 AM",
        admittedDuration: "Transfer Pending from ER",
        admissionReason: "Acute hypovolemia secondary to severe food poisoning & gastroenteritis; transferred from ER Bay 02 for IV rehydration and electrolyte correction",
        diagnosis: "Severe Acute Gastroenteritis with Moderate Dehydration",
        doctor: "Dr. Vikram Hegde (Trauma & ER)",
        nurse: "Nurse Fatima S.",
        vitals: { bp: "112/70 mmHg", hr: "88 bpm", spo2: "97%", temp: "99.4 °F" },
        occupant: "Rajesh Verma (PID-20104)",
        notes: "Awaiting bed turnover confirmation and IV line setup"
      },
      { id: "Bed 202", status: "AVAILABLE", occupant: null, cleaner: null, notes: "Inspected by Nurse Anita. Linen sterile." },
      {
        id: "Bed 203",
        status: "OCCUPIED",
        patientId: "PID-10203",
        patientName: "Elena Rostova",
        age: 29,
        gender: "Female",
        admittedAt: "02 Oct 2026, 03:45 PM",
        admittedDuration: "21 hours ago",
        admissionReason: "Post-arthroscopic ACL reconstruction recovery; admitted for continuous cryotherapy, neurovascular leg checks, and analgesia titration",
        diagnosis: "Right Knee ACL Rupture (Post-Surgical Day 1)",
        doctor: "Dr. Rajesh Gupta (Orthopedics Lead)",
        nurse: "Nurse Fatima S.",
        vitals: { bp: "118/76 mmHg", hr: "72 bpm", spo2: "99%", temp: "98.4 °F" },
        occupant: "Elena Rostova (PID-10203)",
        notes: "Wound dry and intact. Post-op physiotherapy consultation planned at 03:00 PM."
      },
      { id: "Bed 204", status: "AVAILABLE", occupant: null, cleaner: null, notes: "Sanitized, sanitized mattress, ready for intake" },
      { id: "Bed 205", status: "CLEANING", occupant: null, cleaner: "Cleaning Staff 1", notes: "Routine terminal wash and fresh antimicrobial linen deployment" },
      { id: "Bed 206", status: "AVAILABLE", occupant: null, cleaner: null, notes: "Telemetry monitor connected and calibrated" },
    ]
  },
  {
    ward: "ICU",
    floor: "3rd Floor",
    beds: [
      {
        id: "Bed 301",
        status: "OCCUPIED",
        patientId: "PID-30101",
        patientName: "Vikram Singh",
        age: 62,
        gender: "Male",
        admittedAt: "02 Oct 2026, 11:20 PM",
        admittedDuration: "13 hours ago",
        admissionReason: "Post-CABG 3-vessel coronary bypass hemodynamic stabilization; admitted for invasive arterial line blood pressure monitoring and inotropic weaning",
        diagnosis: "Coronary Artery Bypass Graft (CABG x3) Post-Op Day 1",
        doctor: "Dr. Sarah Johnson (Cardiology Lead)",
        nurse: "Nurse Sarah Jenkins (Senior ICU Charge)",
        vitals: { bp: "122/78 mmHg", hr: "82 bpm", spo2: "98%", temp: "98.8 °F" },
        occupant: "Vikram Singh (PID-30101)",
        notes: "Arterial Line active. Mediastinal drains minimal (<20ml/hr). Pacing wires secure."
      },
      {
        id: "Bed 302",
        status: "OCCUPIED",
        patientId: "PID-30202",
        patientName: "Mohammed Al-Rashid",
        age: 58,
        gender: "Male",
        admittedAt: "03 Oct 2026, 04:15 AM",
        admittedDuration: "8 hours ago",
        admissionReason: "Acute infective exacerbation of severe COPD with hypercapnic respiratory failure; admitted for non-invasive BiPAP ventilation and bronchodilator nebulization",
        diagnosis: "Severe COPD Exacerbation with Type-2 Respiratory Failure",
        doctor: "Dr. Priya Sharma (Pulmonology)",
        nurse: "Nurse Sarah Jenkins (ICU)",
        vitals: { bp: "134/86 mmHg", hr: "90 bpm", spo2: "94% on BiPAP", temp: "99.1 °F" },
        occupant: "Mohammed Al-Rashid (PID-30202)",
        notes: "BiPAP settings: IPAP 14, EPAP 6, FiO2 40%. Arterial blood gas pH 7.34, pCO2 49 mmHg."
      },
      { id: "Bed 303", status: "AVAILABLE", occupant: null, cleaner: null, notes: "High-spec ventilator V-03 on sterile standby. Negative pressure active." },
      {
        id: "Bed 304",
        status: "OCCUPIED",
        patientId: "PID-30404",
        patientName: "Kavita Reddy",
        age: 48,
        gender: "Female",
        admittedAt: "03 Oct 2026, 06:40 AM",
        admittedDuration: "6 hours ago",
        admissionReason: "Septic shock secondary to acute pyelonephritis; admitted for central venous pressure monitoring, broad-spectrum IV carbapenem, and Noradrenaline titration",
        diagnosis: "Urosepsis with Septic Shock",
        doctor: "Dr. Marcus Bell (Intensivist / Critical Care)",
        nurse: "Nurse Anita Roy (ICU)",
        vitals: { bp: "106/68 mmHg", hr: "94 bpm", spo2: "96%", temp: "101.2 °F" },
        occupant: "Kavita Reddy (PID-30404)",
        notes: "Noradrenaline infusion at 0.08 mcg/kg/min. Serum lactate downtrending (2.1 mmol/L)."
      },
      { id: "Bed 305", status: "EQUIPMENT", occupant: null, cleaner: null, notes: "Defibrillator sensor error — biomedical engineering recalibration requested" },
      { id: "Bed 306", status: "AVAILABLE", occupant: null, cleaner: null, notes: "Negative pressure isolation unit sterile & ready for acute intake" },
    ]
  },
  {
    ward: "Surgery Ward",
    floor: "4th Floor",
    beds: [
      { id: "Bed 401", status: "AVAILABLE", occupant: null, cleaner: null, notes: "Pre-op surgical checklist verified. Bed made." },
      {
        id: "Bed 402",
        status: "PENDING",
        patientId: "PID-40201",
        patientName: "Amit Saxena",
        age: 41,
        gender: "Male",
        admittedAt: "03 Oct 2026, 10:10 AM",
        admittedDuration: "PACU Recovery in OT-1",
        admissionReason: "Post-laparoscopic cholecystectomy intake; transferring from PACU recovery for overnight surgical observation and wound inspection",
        diagnosis: "Symptomatic Cholelithiasis (Post-Op Lap Chole)",
        doctor: "Dr. Rajesh Gupta (General Surgery)",
        nurse: "Nurse Priya M.",
        vitals: { bp: "120/78 mmHg", hr: "74 bpm", spo2: "99%", temp: "98.6 °F" },
        occupant: "Amit Saxena (PID-40201)",
        notes: "Awaiting PACU discharge criteria score > 9. Bed oxygen and IV stand verified."
      },
      { id: "Bed 403", status: "AVAILABLE", occupant: null, cleaner: null, notes: "Ready for post-surgical elective intake" },
      { id: "Bed 404", status: "AVAILABLE", occupant: null, cleaner: null, notes: "IV Infusion pump tested and calibrated" },
      {
        id: "Bed 405",
        status: "OCCUPIED",
        patientId: "PID-40502",
        patientName: "Priya Menon",
        age: 38,
        gender: "Female",
        admittedAt: "02 Oct 2026, 02:30 PM",
        admittedDuration: "22 hours ago",
        admissionReason: "Post-operative laparoscopic appendectomy recovery; admitted for IV antibiotic completion, abdominal drainage monitoring, and oral diet advancement",
        diagnosis: "Acute Suppurative Appendicitis (Post-Appendectomy Day 1)",
        doctor: "Dr. Aniket Roy (General Surgery)",
        nurse: "Nurse Sneha R.",
        vitals: { bp: "116/74 mmHg", hr: "70 bpm", spo2: "99%", temp: "98.4 °F" },
        occupant: "Priya Menon (PID-40502)",
        notes: "Oral liquids tolerated well. Pain controlled on oral Paracetamol. Discharge planned tomorrow morning."
      },
      { id: "Bed 406", status: "AVAILABLE", occupant: null, cleaner: null, notes: "Wound care sterile kit and telemetry lead docked" },
    ]
  },
  {
    ward: "Pediatrics",
    floor: "5th Floor",
    beds: [
      { id: "Bed 501", status: "AVAILABLE", occupant: null, cleaner: null, notes: "Pediatric cot ready with safety rails" },
      { id: "Bed 502", status: "AVAILABLE", occupant: null, cleaner: null, notes: "Parent attendant sleeper couch sanitized and prepped" },
      { id: "Bed 503", status: "CLEANING", occupant: null, cleaner: "Cleaning Staff 3", notes: "Deep pediatric UV sterilization in progress" },
      { id: "Bed 504", status: "AVAILABLE", occupant: null, cleaner: null, notes: "Pediatric finger pulse oximeter verified" },
      { id: "Bed 505", status: "AVAILABLE", occupant: null, cleaner: null, notes: "Sanitized & verified by Floor Nurse" },
      {
        id: "Bed 506",
        status: "PENDING",
        patientId: "PID-50601",
        patientName: "Baby Aarav Mehta",
        age: 4,
        gender: "Male",
        admittedAt: "03 Oct 2026, 10:00 AM",
        admittedDuration: "Admission from OPD-Peds",
        admissionReason: "High-grade viral pyrexia with febrile seizure episode; admitted for 24-hour pediatric neurological observation and IV antipyretics",
        diagnosis: "Simple Febrile Convulsion with Viral Upper Respiratory Infection",
        doctor: "Dr. Meera Iyer (Pediatric Specialist)",
        nurse: "Nurse Maya V.",
        vitals: { bp: "95/60 mmHg", hr: "108 bpm", spo2: "99%", temp: "100.4 °F" },
        occupant: "Baby Aarav Mehta (PID-50601)",
        notes: "Patient conscious, oriented to mother. Seizure precaution protocol initiated."
      },
    ]
  },
  {
    ward: "Maternity",
    floor: "6th Floor",
    beds: [
      {
        id: "Bed 601",
        status: "OCCUPIED",
        patientId: "PID-60101",
        patientName: "Sunita Sharma",
        age: 28,
        gender: "Female",
        admittedAt: "01 Oct 2026, 09:00 PM",
        admittedDuration: "39 hours ago",
        admissionReason: "Postnatal Day 2 maternal recovery following uncomplicated full-term vaginal delivery; admitted for lactation guidance and maternal-infant bonding observation",
        diagnosis: "Post-Term Normal Vaginal Delivery (Healthy Baby Girl, 3.2 kg)",
        doctor: "Dr. Vikram Nair (Obstetrics & Gynecology)",
        nurse: "Nurse Sneha R.",
        vitals: { bp: "114/72 mmHg", hr: "68 bpm", spo2: "99%", temp: "98.6 °F" },
        occupant: "Sunita Sharma (PID-60101)",
        notes: "Uterus well contracted, lochia rubra normal. Pediatrician cleared newborn for discharge tomorrow."
      },
      { id: "Bed 602", status: "AVAILABLE", occupant: null, cleaner: null, notes: "Fetal Doppler ultrasound unit sterile and ready" },
      { id: "Bed 603", status: "AVAILABLE", occupant: null, cleaner: null, notes: "Electric delivery cot verified with newborn warmer" },
      { id: "Bed 604", status: "CLEANING", occupant: null, cleaner: "Cleaning Staff 2", notes: "Post-discharge room sanitization" },
      { id: "Bed 605", status: "AVAILABLE", occupant: null, cleaner: null, notes: "Maternity private suite ready for intake" },
      {
        id: "Bed 606",
        status: "OCCUPIED",
        patientId: "PID-60602",
        patientName: "Ananya K.",
        age: 31,
        gender: "Female",
        admittedAt: "03 Oct 2026, 07:15 AM",
        admittedDuration: "5 hours 30 mins ago",
        admissionReason: "Active labor progression (cervical dilation 6cm, regular uterine contractions every 3 mins); admitted for continuous intrapartum CTG cardiotocography",
        diagnosis: "Primigravida in Active Labor at 39 Weeks Gestation",
        doctor: "Dr. Vikram Nair (Obstetrics)",
        nurse: "Nurse Sneha R.",
        vitals: { bp: "122/80 mmHg", hr: "84 bpm", spo2: "98%", temp: "98.7 °F" },
        occupant: "Ananya K. (PID-60602)",
        notes: "CTG shows reactive fetal heart rate pattern with no decelerations. Epidural analgesia active."
      },
    ]
  }
];

// OT Matrix Data
const INITIAL_OT = [
  {
    ward: "General Surgery",
    floor: "OT Suite 1",
    beds: [
      { id: "Slot 1 (08:00)", status: "OCCUPIED", occupant: "Laparoscopic Cholecystectomy", doctor: "Dr. Rajesh Gupta", notes: "In progress — 45 mins elapsed" },
      { id: "Slot 2 (10:30)", status: "AVAILABLE", occupant: null, notes: "Sterilized & draped" },
      { id: "Slot 3 (13:00)", status: "PENDING", occupant: "Hernioplasty", doctor: "Dr. Aniket Roy", notes: "Awaiting patient pre-medication" },
      { id: "Slot 4 (15:30)", status: "AVAILABLE", occupant: null, notes: "Ready for scheduling" },
      { id: "Slot 5 (18:00)", status: "AVAILABLE", occupant: null, notes: "Evening slot open" },
      { id: "Emergency", status: "AVAILABLE", occupant: null, notes: "Standby for trauma triage" },
    ]
  },
  {
    ward: "Cardiac Suite",
    floor: "OT Suite 2",
    beds: [
      { id: "Slot 1 (08:00)", status: "OCCUPIED", occupant: "CABG 3-Vessel Bypass", doctor: "Dr. Sarah Johnson", notes: "On pump — estimated end: 12:30 PM" },
      { id: "Slot 2 (10:30)", status: "EQUIPMENT", occupant: null, notes: "Heart-lung machine inspection due" },
      { id: "Slot 3 (13:00)", status: "AVAILABLE", occupant: null, notes: "Ready for afternoon valve repair" },
      { id: "Slot 4 (15:30)", status: "CLEANING", occupant: null, cleaner: "OT Sanitization Team", notes: "Air filtration exchange" },
      { id: "Slot 5 (18:00)", status: "AVAILABLE", occupant: null, notes: "Emergency backup suite" },
      { id: "Emergency", status: "OCCUPIED", occupant: "Aortic Dissection Emergency", doctor: "Dr. Sarah Johnson", notes: "Code Red in OT-2" },
    ]
  },
  {
    ward: "Orthopedics",
    floor: "OT Suite 3",
    beds: [
      { id: "Slot 1 (08:00)", status: "AVAILABLE", occupant: null, notes: "C-Arm checked and calibrated" },
      { id: "Slot 2 (10:30)", status: "OCCUPIED", occupant: "Total Knee Replacement", doctor: "Dr. Rajesh Gupta", notes: "Implant positioned, cement curing" },
      { id: "Slot 3 (13:00)", status: "CLEANING", occupant: null, cleaner: "Staff 1", notes: "Post-op clean down" },
      { id: "Slot 4 (15:30)", status: "AVAILABLE", occupant: null, notes: "Ready" },
      { id: "Slot 5 (18:00)", status: "AVAILABLE", occupant: null, notes: "Available" },
      { id: "Emergency", status: "AVAILABLE", occupant: null, notes: "Fracture reduction on call" },
    ]
  },
  {
    ward: "Neuro Suite",
    floor: "OT Suite 4",
    beds: [
      { id: "Slot 1 (08:00)", status: "OCCUPIED", occupant: "Craniotomy for SDH", doctor: "Dr. Marcus Bell", notes: "Microsurgical microscope active" },
      { id: "Slot 2 (10:30)", status: "OCCUPIED", occupant: "Spinal Decompression", doctor: "Dr. Marcus Bell", notes: "Intraoperative neuro-monitoring" },
      { id: "Slot 3 (13:00)", status: "AVAILABLE", occupant: null, notes: "Ready" },
      { id: "Slot 4 (15:30)", status: "CLEANING", occupant: null, notes: "Clean down" },
      { id: "Slot 5 (18:00)", status: "AVAILABLE", occupant: null, notes: "Available" },
      { id: "Emergency", status: "AVAILABLE", occupant: null, notes: "Neuro standby" },
    ]
  }
];

// Equipment Matrix Data
const INITIAL_EQUIPMENT = [
  {
    ward: "Ventilators (ICU)",
    floor: "Floor 3",
    beds: [
      { id: "V-01", status: "OCCUPIED", occupant: "Assigned Bed 302 (Al-Rashid)", notes: "FiO2 45%, PEEP 8 cmH2O" },
      { id: "V-02", status: "OCCUPIED", occupant: "Assigned Bed 301 (V. Singh)", notes: "Synchronized SIMV mode" },
      { id: "V-03", status: "AVAILABLE", occupant: null, notes: "Battery 100%, circuit sterile" },
      { id: "V-04", status: "EQUIPMENT", occupant: null, notes: "Sensor calibration drift alert" },
      { id: "V-05", status: "AVAILABLE", occupant: null, notes: "Checked by Biomed Team" },
      { id: "V-06", status: "AVAILABLE", occupant: null, notes: "Portable transport model" },
    ]
  },
  {
    ward: "Defibrillators",
    floor: "All Floors",
    beds: [
      { id: "DEF-01 (ER)", status: "AVAILABLE", occupant: null, notes: "Daily test pass: 200J ready" },
      { id: "DEF-02 (ICU)", status: "OCCUPIED", occupant: "Bedside ICU-01", notes: "Pacing pads attached" },
      { id: "DEF-03 (OT)", status: "AVAILABLE", occupant: null, notes: "Sterile internal paddles ready" },
      { id: "DEF-04 (Floor 1)", status: "AVAILABLE", occupant: null, notes: "AED ready in lobby" },
      { id: "DEF-05 (Floor 4)", status: "AVAILABLE", occupant: null, notes: "Checked at 08:00 AM" },
      { id: "DEF-06 (Floor 6)", status: "PENDING", occupant: null, notes: "Battery replacement scheduled" },
    ]
  },
  {
    ward: "Dialysis Units",
    floor: "Floor 2",
    beds: [
      { id: "DIA-01", status: "OCCUPIED", occupant: "Patient Hemodialysis (P-112)", notes: "Heparin infusion active" },
      { id: "DIA-02", status: "OCCUPIED", occupant: "Emergency SDo2 Filter", notes: "Filter pressure normal" },
      { id: "DIA-03", status: "AVAILABLE", occupant: null, notes: "Prime & rinse cycle done" },
      { id: "DIA-04", status: "CLEANING", occupant: null, cleaner: "Staff 3", notes: "Chemical disinfection cycle" },
      { id: "DIA-05", status: "AVAILABLE", occupant: null, notes: "Ready" },
      { id: "DIA-06", status: "AVAILABLE", occupant: null, notes: "Backup unit" },
    ]
  }
];

// Staff Matrix Data
const INITIAL_STAFF = [
  {
    ward: "ICU Nursing",
    floor: "Shift A (Morning)",
    beds: [
      { id: "Nurse Sarah Jenkins", status: "OCCUPIED", occupant: "Bed 301 & 302", notes: "Senior ICU Charge Nurse" },
      { id: "Nurse Anita Roy", status: "OCCUPIED", occupant: "Bed 304 (Sepsis)", notes: "Arterial line monitoring" },
      { id: "Nurse David Lee", status: "AVAILABLE", occupant: null, notes: "Float pool cover" },
      { id: "Nurse Rachel Adams", status: "CLEANING", occupant: null, notes: "Medication prep counter" },
      { id: "Nurse Emily Chen", status: "AVAILABLE", occupant: null, notes: "Intake triage ready" },
      { id: "Nurse Kevin Patel", status: "PENDING", occupant: null, notes: "Shift handover in progress" },
    ]
  },
  {
    ward: "Ward Nursing",
    floor: "Floors 1-3",
    beds: [
      { id: "Nurse Priya M.", status: "OCCUPIED", occupant: "General Ward 101-106", notes: "Vitals round ongoing" },
      { id: "Nurse John K.", status: "AVAILABLE", occupant: null, notes: "Discharge desk" },
      { id: "Nurse Fatima S.", status: "OCCUPIED", occupant: "General Ward 201-206", notes: "IV antibiotic administration" },
      { id: "Nurse Ravi T.", status: "CLEANING", occupant: null, notes: "Inventory restock" },
      { id: "Nurse Maya V.", status: "AVAILABLE", occupant: null, notes: "On desk" },
      { id: "Nurse Sneha R.", status: "AVAILABLE", occupant: null, notes: "Ready" },
    ]
  },
  {
    ward: "Attending Doctors",
    floor: "Specialists",
    beds: [
      { id: "Dr. Sarah Johnson", status: "OCCUPIED", occupant: "OT-2 & ICU-301", notes: "Interventional Cardiology" },
      { id: "Dr. Rajesh Gupta", status: "OCCUPIED", occupant: "OT-3 Knee Arthroplasty", notes: "Orthopedics Lead" },
      { id: "Dr. Priya Sharma", status: "AVAILABLE", occupant: "OPD Cabin 104", notes: "General Medicine Consults" },
      { id: "Dr. Vikram Hegde", status: "OCCUPIED", occupant: "ER Resuscitation Bay 03", notes: "Trauma Specialist on Duty" },
      { id: "Dr. Marcus Bell", status: "AVAILABLE", occupant: "ICU Floor 3", notes: "Intensivist / Critical Care" },
      { id: "Dr. Vikram Nair", status: "OCCUPIED", occupant: "Maternity Ward 606", notes: "Obstetrician on delivery call" },
    ]
  }
];

// Rooms Matrix Data
const INITIAL_ROOMS = [
  {
    ward: "OPD Consultation",
    floor: "Floor 1",
    beds: [
      { id: "Cabin 101", status: "AVAILABLE", occupant: null, notes: "Dr. Aniket Roy" },
      { id: "Cabin 102", status: "OCCUPIED", occupant: "Harsh Tripathi (P-101)", notes: "Dr. Sarah Johnson — In Session" },
      { id: "Cabin 103", status: "AVAILABLE", occupant: null, notes: "Dr. Rajesh Gupta" },
      { id: "Cabin 104", status: "OCCUPIED", occupant: "Token #02 Cons.", notes: "Dr. Priya Sharma" },
      { id: "Cabin 105", status: "CLEANING", occupant: null, notes: "Sanitizing" },
      { id: "Cabin 106", status: "AVAILABLE", occupant: null, notes: "Ready for afternoon clinic" },
    ]
  },
  {
    ward: "Isolation Suites",
    floor: "Floor 2",
    beds: [
      { id: "Room 201", status: "OCCUPIED", occupant: "Airborne Precaution (P-114)", notes: "Negative pressure -2.5 Pa" },
      { id: "Room 202", status: "AVAILABLE", occupant: null, notes: "Antechamber sterile" },
      { id: "Room 203", status: "CLEANING", occupant: null, notes: "Formalin fumigation underway" },
      { id: "Room 204", status: "OCCUPIED", occupant: "Neutropenic Precaution", notes: "HEPA positive pressure" },
      { id: "Room 205", status: "AVAILABLE", occupant: null, notes: "Verified" },
      { id: "Room 206", status: "AVAILABLE", occupant: null, notes: "Ready" },
    ]
  }
];

export default function ResourceHeatmapView() {
  const [activeTab, setActiveTab] = useState("Beds"); // "Beds" | "OT" | "Equipment" | "Staff" | "Rooms"
  const [selectedDept, setSelectedDept] = useState("All Departments");
  const [selectedFloor, setSelectedFloor] = useState("All Floors");
  const [resourceTypeFilter, setResourceTypeFilter] = useState("Beds");

  // State matrices
  const [bedsData, setBedsData] = useState(INITIAL_BEDS);
  const [otData, setOtData] = useState(INITIAL_OT);
  const [equipmentData, setEquipmentData] = useState(INITIAL_EQUIPMENT);
  const [staffData, setStaffData] = useState(INITIAL_STAFF);
  const [roomsData, setRoomsData] = useState(INITIAL_ROOMS);

  // Recent Alerts State (from reference image)
  const [alerts, setAlerts] = useState([
    {
      id: "ALT-01",
      time: "11:32 AM",
      resource: "Bed 102 (General Ward)",
      issue: "Occupied (expected available)",
      staff: "Nurse A",
      action: "Verify",
      actionColor: "bg-red-500 hover:bg-red-600 text-white",
      status: "ACTIVE"
    },
    {
      id: "ALT-02",
      time: "11:20 AM",
      resource: "Bed 105 (General Ward)",
      issue: "Cleaning pending",
      staff: "Cleaning Staff 2",
      action: "Mark Done",
      actionColor: "bg-amber-400 hover:bg-amber-500 text-slate-950 font-black",
      status: "ACTIVE"
    },
    {
      id: "ALT-03",
      time: "10:45 AM",
      resource: "OT-2",
      issue: "Equipment not ready",
      staff: "OT Staff 1",
      action: "Resolve",
      actionColor: "bg-purple-600 hover:bg-purple-700 text-white",
      status: "ACTIVE"
    }
  ]);

  // Modal States
  const [selectedTile, setSelectedTile] = useState(null); // When user clicks ANY tile in matrix
  const [quickActionModal, setQuickActionModal] = useState(null); // "bed-details" | "assign-cleaning" | "equipment-request" | "patient-journey" | "all-alerts"
  const [showAdmitForm, setShowAdmitForm] = useState(false);
  const [admitForm, setAdmitForm] = useState({
    patientId: "PID-89210",
    patientName: "",
    age: "42",
    gender: "Male",
    admittedAt: "Today, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    admissionReason: "",
    doctor: "Dr. Sarah Johnson (Cardiology)",
    diagnosis: ""
  });

  const admitPatientToBed = (bedId, patientPayload) => {
    setBedsData(prev => prev.map(row => ({
      ...row,
      beds: row.beds.map(b => b.id === bedId ? {
        ...b,
        status: "OCCUPIED",
        occupant: `${patientPayload.patientName} (${patientPayload.patientId})`,
        patientId: patientPayload.patientId,
        patientName: patientPayload.patientName,
        age: patientPayload.age || 45,
        gender: patientPayload.gender || "Male",
        admittedAt: patientPayload.admittedAt,
        admittedDuration: "Just admitted",
        admissionReason: patientPayload.admissionReason,
        diagnosis: patientPayload.diagnosis || "Acute Clinical Intake",
        doctor: patientPayload.doctor,
        nurse: "Nurse On Duty",
        vitals: { bp: "120/80 mmHg", hr: "72 bpm", spo2: "98%", temp: "98.6 °F" },
        notes: `Admitted on ${patientPayload.admittedAt}. Admission reason: ${patientPayload.admissionReason}`
      } : b)
    })));
    triggerToast(`✓ Patient ${patientPayload.patientName} (${patientPayload.patientId}) admitted to ${bedId}!`);
  };

  const dischargePatientFromBed = (bedId) => {
    setBedsData(prev => prev.map(row => ({
      ...row,
      beds: row.beds.map(b => b.id === bedId ? {
        ...b,
        status: "CLEANING",
        patientId: null,
        patientName: null,
        occupant: null,
        cleaner: "Sanitation Squad 1",
        notes: `Patient discharged at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Terminal UV-C cleaning initiated.`
      } : b)
    })));
    triggerToast(`✓ Patient discharged from ${bedId}. Bed queued for sanitization.`);
    if (selectedTile) {
      setSelectedTile(prev => ({
        ...prev,
        tile: {
          ...prev.tile,
          status: "CLEANING",
          patientId: null,
          patientName: null,
          occupant: null,
          cleaner: "Sanitation Squad 1",
          notes: `Patient discharged. Terminal UV-C cleaning initiated.`
        }
      }));
    }
  };
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Get current active matrix
  const currentMatrix = useMemo(() => {
    switch (activeTab) {
      case "OT": return otData;
      case "Equipment": return equipmentData;
      case "Staff": return staffData;
      case "Rooms": return roomsData;
      default: return bedsData;
    }
  }, [activeTab, bedsData, otData, equipmentData, staffData, roomsData]);

  // Filter matrix by department and floor
  const filteredMatrix = useMemo(() => {
    return currentMatrix.filter(row => {
      const matchDept = selectedDept === "All Departments" || row.ward.toLowerCase().includes(selectedDept.toLowerCase());
      const matchFloor = selectedFloor === "All Floors" || row.floor.toLowerCase().includes(selectedFloor.toLowerCase());
      return matchDept && matchFloor;
    });
  }, [currentMatrix, selectedDept, selectedFloor]);

  // Calculate dynamic Summary Counts from active matrix
  const summaryCounts = useMemo(() => {
    let available = 0;
    let pending = 0;
    let occupied = 0;
    let maintenance = 0;

    currentMatrix.forEach(row => {
      row.beds.forEach(b => {
        if (b.status === "AVAILABLE") available++;
        else if (b.status === "PENDING" || b.status === "CLEANING") pending++;
        else if (b.status === "OCCUPIED") occupied++;
        else if (b.status === "EQUIPMENT" || b.status === "MAINTENANCE") maintenance++;
      });
    });

    return { available, pending, occupied, maintenance };
  }, [currentMatrix]);

  // Helper for Tile Style based on status (Exact to reference image)
  const getTileStyle = (status) => {
    switch (status) {
      case "AVAILABLE":
        return {
          bg: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs",
          label: "Available",
          iconColor: "text-white",
          dotColor: "bg-emerald-300"
        };
      case "OCCUPIED":
        return {
          bg: "bg-red-500 hover:bg-red-600 text-white shadow-xs",
          label: "Occupied",
          iconColor: "text-white",
          dotColor: "bg-red-300"
        };
      case "CLEANING":
        return {
          bg: "bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold shadow-xs",
          label: "Cleaning",
          iconColor: "text-slate-900",
          dotColor: "bg-amber-700"
        };
      case "PENDING":
        return {
          bg: "bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold shadow-xs",
          label: "Pending",
          iconColor: "text-slate-900",
          dotColor: "bg-amber-700"
        };
      case "EQUIPMENT":
        return {
          bg: "bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold shadow-xs",
          label: "Equipment",
          iconColor: "text-slate-900",
          dotColor: "bg-purple-700"
        };
      default:
        return {
          bg: "bg-slate-300 hover:bg-slate-400 text-slate-800",
          label: "Unknown",
          iconColor: "text-slate-700",
          dotColor: "bg-slate-500"
        };
    }
  };

  // Action handlers
  const handleAlertAction = (alert) => {
    if (alert.action === "Mark Done") {
      // Find Bed 105 and update to AVAILABLE
      setBedsData(prev => prev.map(row => ({
        ...row,
        beds: row.beds.map(b => b.id === "Bed 105" ? { ...b, status: "AVAILABLE", notes: "Cleaning marked complete" } : b)
      })));
      triggerToast("✓ Bed 105 cleaning verified! Status updated to AVAILABLE.");
    } else if (alert.action === "Resolve") {
      setOtData(prev => prev.map(row => ({
        ...row,
        beds: row.beds.map(b => b.id.includes("OT-2") || b.id.includes("Slot 2") ? { ...b, status: "AVAILABLE", notes: "Equipment resolved" } : b)
      })));
      triggerToast("✓ OT-2 equipment resolved and cleared for operation.");
    } else {
      triggerToast(`✓ Alert for ${alert.resource} verified by Staff on duty.`);
    }

    // Dismiss alert
    setAlerts(prev => prev.filter(a => a.id !== alert.id));
  };

  const updateTileStatus = (wardIndex, bedId, newStatus) => {
    const updater = (prev) => prev.map(row => ({
      ...row,
      beds: row.beds.map(b => b.id === bedId ? { ...b, status: newStatus } : b)
    }));

    if (activeTab === "Beds") setBedsData(updater);
    else if (activeTab === "OT") setOtData(updater);
    else if (activeTab === "Equipment") setEquipmentData(updater);
    else if (activeTab === "Staff") setStaffData(updater);
    else if (activeTab === "Rooms") setRoomsData(updater);

    if (selectedTile) {
      setSelectedTile(prev => ({ ...prev, tile: { ...prev.tile, status: newStatus } }));
    }
    triggerToast(`✓ ${bedId} updated to ${newStatus}`);
  };

  return (
    <div className="space-y-5 text-slate-800 animate-fade-in font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-slate-900 text-white shadow-2xl border border-emerald-500/40 text-xs font-bold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. Header & Filtering Controls (Exact Layout to Reference Image)
      ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Staff Resource Heat Map
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View the real-time status of beds, equipment and other resources under your responsibility.
          </p>
        </div>

        {/* Dropdown Filters & Timestamp */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Department */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Department</label>
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition"
            >
              <option>All Departments</option>
              <option>General Ward</option>
              <option>ICU</option>
              <option>Surgery</option>
              <option>Pediatrics</option>
              <option>Maternity</option>
            </select>
          </div>

          {/* Floor / Ward */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Floor / Ward</label>
            <select
              value={selectedFloor}
              onChange={e => setSelectedFloor(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition"
            >
              <option>All Floors</option>
              <option>1st Floor</option>
              <option>2nd Floor</option>
              <option>3rd Floor</option>
              <option>4th Floor</option>
              <option>5th Floor</option>
              <option>6th Floor</option>
            </select>
          </div>

          {/* Resource Type */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Resource Type</label>
            <select
              value={resourceTypeFilter}
              onChange={e => {
                setResourceTypeFilter(e.target.value);
                setActiveTab(e.target.value);
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition"
            >
              <option value="Beds">Beds</option>
              <option value="OT">OT</option>
              <option value="Equipment">Equipment</option>
              <option value="Staff">Staff</option>
              <option value="Rooms">Rooms</option>
            </select>
          </div>

          {/* Live Date / Time Badge */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-center shrink-0 self-end sm:self-auto">
            <div className="flex items-center gap-1.5 text-slate-800 font-bold text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>27 Sep 2026</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium">11:42 AM</div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. Resource Type Tabs (Beds | OT | Equipment | Staff | Rooms)
      ────────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold no-scrollbar">
        {[
          { id: "Beds", label: "Beds", icon: Bed },
          { id: "OT", label: "OT", icon: Activity },
          { id: "Equipment", label: "Equipment", icon: Monitor },
          { id: "Staff", label: "Staff", icon: Users },
          { id: "Rooms", label: "Rooms", icon: Sparkles }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setResourceTypeFilter(tab.id);
              }}
              className={`px-5 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-xs ${
                isActive
                  ? "bg-blue-600 text-white shadow-md font-black"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. Main 2-Column Split: Matrix Grid (Left) + Sidebar Widgets (Right)
      ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 items-start">
        {/* LEFT COLUMN: Heatmap Grid Table + Recent Alerts (Span 3 Cols) */}
        <div className="xl:col-span-3 space-y-5">
          {/* Heatmap Matrix Grid Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-center border-separate border-spacing-2">
                <thead>
                  <tr className="text-xs font-black text-slate-700">
                    <th className="text-left font-black p-2 text-slate-900 text-xs w-36">
                      {activeTab === "Beds" ? "Ward / Floor" : activeTab === "OT" ? "Suite / Specialty" : activeTab === "Equipment" ? "Category / Ward" : activeTab === "Staff" ? "Role / Ward" : "Wing / Specialty"}
                    </th>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <th key={i} className="p-2 font-black text-xs text-slate-800">
                        {activeTab === "Beds" ? `Bed 10${i}` : activeTab === "OT" ? `Slot ${i}` : activeTab === "Equipment" ? `Unit 0${i}` : activeTab === "Staff" ? `Station ${i}` : `Room 0${i}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredMatrix.map((row, rowIdx) => (
                    <tr key={row.ward + row.floor}>
                      {/* Row Label (Ward + Floor) */}
                      <td className="text-left p-2 align-middle">
                        <div className="font-extrabold text-xs text-slate-900 leading-tight">
                          {row.ward}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          ({row.floor})
                        </div>
                      </td>

                      {/* 6 Status Tiles */}
                      {row.beds.map((b, colIdx) => {
                        const style = getTileStyle(b.status);
                        return (
                          <td key={b.id} className="p-1">
                            <button
                              onClick={() => setSelectedTile({ row, tile: b, rowIdx, colIdx })}
                              className={`w-full h-16 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-150 transform hover:scale-[1.03] active:scale-95 cursor-pointer ${style.bg}`}
                              title={`${b.id}: ${b.status} — Click for full details`}
                            >
                              <Bed className={`w-4 h-4 ${style.iconColor}`} />
                              <span className="text-[10px] font-black uppercase tracking-tight">
                                {style.label}
                              </span>
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>* Click on any bed tile above to inspect details, admit patient, or reassign cleaners.</span>
              <span className="font-bold text-slate-600">Showing {filteredMatrix.length} Wards · 36 Resource Units</span>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              Recent Alerts Section (Exact match to bottom left of reference)
          ────────────────────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <h3 className="font-black text-sm text-slate-900">Recent Alerts</h3>
              </div>
              <button
                onClick={() => setQuickActionModal("all-alerts")}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-slate-400 text-[10px] uppercase font-bold border-b border-slate-100">
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Resource</th>
                    <th className="py-2.5 px-3">Issue</th>
                    <th className="py-2.5 px-3">Responsible Staff</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {alerts.map(alt => (
                    <tr key={alt.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 font-medium text-slate-500 whitespace-nowrap">{alt.time}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{alt.resource}</td>
                      <td className="py-3 px-3 text-slate-700">{alt.issue}</td>
                      <td className="py-3 px-3 text-slate-500">{alt.staff}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleAlertAction(alt)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer shadow-xs ${alt.actionColor}`}
                        >
                          {alt.action}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {alerts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400 font-medium">
                        ✓ All alerts cleared. No pending operational exceptions.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Resource Summary, Legend, Quick Actions (Span 1 Col) */}
        <div className="space-y-5">
          {/* 1. Resource Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-slate-900 flex items-center justify-center text-white text-[9px] font-black">
                ⊞
              </div>
              <h3 className="font-black text-sm text-slate-900">Resource Summary</h3>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center">
              {/* Available */}
              <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-xs">
                <div className="text-xl font-black">{summaryCounts.available}</div>
                <div className="text-[10px] font-bold mt-0.5 opacity-90">Available</div>
              </div>

              {/* Pending */}
              <div className="p-2 rounded-xl bg-amber-400 text-slate-950 shadow-xs">
                <div className="text-xl font-black">{summaryCounts.pending}</div>
                <div className="text-[10px] font-black mt-0.5">Pending</div>
              </div>

              {/* Occupied */}
              <div className="p-2 rounded-xl bg-red-500 text-white shadow-xs">
                <div className="text-xl font-black">{summaryCounts.occupied}</div>
                <div className="text-[10px] font-bold mt-0.5 opacity-90">Occupied</div>
              </div>

              {/* Maintenance */}
              <div className="p-2 rounded-xl bg-slate-300 text-slate-800 shadow-xs">
                <div className="text-xl font-black">{summaryCounts.maintenance}</div>
                <div className="text-[10px] font-bold mt-0.5">Maintenance</div>
              </div>
            </div>
          </div>

          {/* 2. Status Legend Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600" />
              <h3 className="font-black text-sm text-slate-900">Status Legend</h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-bold text-slate-900">Available</span>
                </div>
                <span className="text-slate-400 text-[11px]">Ready / Verified</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-400 shrink-0" />
                  <span className="font-bold text-slate-900">Pending</span>
                </div>
                <span className="text-slate-400 text-[11px]">Awaiting action / Cleaning</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-red-500 shrink-0" />
                  <span className="font-bold text-slate-900">Occupied</span>
                </div>
                <span className="text-slate-400 text-[11px]">In use</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-purple-600 shrink-0" />
                  <span className="font-bold text-slate-900">Equipment</span>
                </div>
                <span className="text-slate-400 text-[11px]">Equipment not ready</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-slate-400 shrink-0" />
                  <span className="font-bold text-slate-900">Unknown</span>
                </div>
                <span className="text-slate-400 text-[11px]">Not updated</span>
              </div>
            </div>
          </div>

          {/* 3. Quick Actions Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-600 flex items-center justify-center text-white text-[9px] font-black">
                ⚡
              </div>
              <h3 className="font-black text-sm text-slate-900">Quick Actions</h3>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setQuickActionModal("bed-details")}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-800 text-xs font-bold transition flex items-center gap-2.5 cursor-pointer"
              >
                <Bed className="w-4 h-4 text-blue-600 shrink-0" />
                <span>View Bed Details</span>
              </button>

              <button
                onClick={() => setQuickActionModal("assign-cleaning")}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-800 text-xs font-bold transition flex items-center gap-2.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-cyan-600 shrink-0" />
                <span>Assign Cleaning Staff</span>
              </button>

              <button
                onClick={() => setQuickActionModal("equipment-request")}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-800 text-xs font-bold transition flex items-center gap-2.5 cursor-pointer"
              >
                <Wrench className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Raise Equipment Request</span>
              </button>

              <button
                onClick={() => setQuickActionModal("patient-journey")}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-800 text-xs font-bold transition flex items-center gap-2.5 cursor-pointer"
              >
                <Users className="w-4 h-4 text-blue-600 shrink-0" />
                <span>View Patient Journey</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODAL 1: INNER INTERFACE FOR TILE CLICK (PATIENT BED RECORD)
      ────────────────────────────────────────────────────────────── */}
      {selectedTile && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8 animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase text-blue-600 tracking-wider">
                  {selectedTile.row.ward} · {selectedTile.row.floor}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5 flex items-center gap-2">
                  <Bed className="w-5 h-5 text-blue-600" />
                  <span>{selectedTile.tile.id} Record</span>
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedTile(null);
                  setShowAdmitForm(false);
                }}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Status Pill */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <span className="font-bold text-slate-600">Bed Operational Status:</span>
              <span className={`px-3 py-1 rounded-full font-black text-xs ${
                selectedTile.tile.status === "AVAILABLE"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : selectedTile.tile.status === "OCCUPIED"
                  ? "bg-red-100 text-red-800 border border-red-300"
                  : selectedTile.tile.status === "CLEANING"
                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                  : "bg-purple-100 text-purple-900 border border-purple-300"
              }`}>
                ● {selectedTile.tile.status}
              </span>
            </div>

            {/* CASE 1: BED IS OCCUPIED (Show Detailed Patient Identity, Bed-Taken Time, Reason) */}
            {selectedTile.tile.status === "OCCUPIED" && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-red-50/70 via-white to-slate-50 border border-red-200/90 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-red-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-mono font-black text-xs tracking-wider shadow-xs">
                      {selectedTile.tile.patientId || "PID-10101"}
                    </span>
                    <span className="font-black text-slate-900 text-sm">
                      {selectedTile.tile.patientName || selectedTile.tile.occupant || "Admitted Patient"}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {selectedTile.tile.gender || "Male"}, {selectedTile.tile.age ? `${selectedTile.tile.age} yrs` : "Adult"}
                  </span>
                </div>

                {/* Bed Taken / Admission Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>Bed Taken / Admitted Time</span>
                    </div>
                    <div className="font-extrabold text-slate-900 text-xs mt-1">
                      {selectedTile.tile.admittedAt || "Today, 08:30 AM"}
                    </div>
                    <div className="text-[10px] text-blue-600 font-semibold mt-0.5">
                      {selectedTile.tile.admittedDuration || "Active admission (~4 hrs elapsed)"}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[10px] uppercase">
                      <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Attending Specialist</span>
                    </div>
                    <div className="font-extrabold text-slate-900 text-xs mt-1">
                      {selectedTile.tile.doctor || "Dr. Sarah Johnson"}
                    </div>
                    <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                      Lead Physician in Charge
                    </div>
                  </div>
                </div>

                {/* Clinical Reason Patient Took the Bed */}
                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs">
                  <span className="text-[10px] font-black uppercase text-amber-900 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Reason Patient Took Bed / Admission Indication
                  </span>
                  <p className="text-amber-950 font-bold text-xs mt-1 leading-relaxed">
                    {selectedTile.tile.admissionReason || selectedTile.tile.notes || "Continuous clinical monitoring, vital stabilization, and acute medical observation."}
                  </p>
                  {selectedTile.tile.diagnosis && (
                    <div className="mt-2 pt-2 border-t border-amber-200/80 text-[11px] text-amber-900 flex items-center justify-between">
                      <span><strong>Working Diagnosis:</strong> {selectedTile.tile.diagnosis}</span>
                      <span className="font-mono text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">ICD-10 Linked</span>
                    </div>
                  )}
                </div>

                {/* Vitals Telemetry */}
                {selectedTile.tile.vitals && (
                  <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                    <div className="p-2 rounded-xl bg-white border border-slate-200">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">Blood Pressure</span>
                      <span className="font-extrabold text-slate-900 text-xs">{selectedTile.tile.vitals.bp}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-slate-200">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">Heart Rate</span>
                      <span className="font-extrabold text-slate-900 text-xs">{selectedTile.tile.vitals.hr}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-slate-200">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">SpO2 Oxygen</span>
                      <span className="font-extrabold text-blue-700 text-xs">{selectedTile.tile.vitals.spo2}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-slate-200">
                      <span className="text-[9px] text-slate-400 font-bold block uppercase">Temperature</span>
                      <span className="font-extrabold text-slate-900 text-xs">{selectedTile.tile.vitals.temp}</span>
                    </div>
                  </div>
                )}

                {/* Discharge and Vacate Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      dischargePatientFromBed(selectedTile.tile.id);
                      setSelectedTile(null);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>Discharge Patient & Mark Cleaning</span>
                  </button>
                  <button
                    onClick={() => {
                      updateTileStatus(selectedTile.rowIdx, selectedTile.tile.id, "AVAILABLE");
                      setSelectedTile(null);
                    }}
                    className="py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Mark Available
                  </button>
                </div>
              </div>
            )}

            {/* CASE 2: BED IS PENDING TRANSFER / INCOMING PATIENT */}
            {selectedTile.tile.status === "PENDING" && (
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                  <span className="font-black text-amber-950 text-sm">
                    Incoming Patient Transfer Pending
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 font-mono font-bold text-[11px]">
                    {selectedTile.tile.patientId || "PID-20104"}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <div><strong>Patient:</strong> {selectedTile.tile.patientName || selectedTile.tile.occupant}</div>
                  <div><strong>Scheduled Intake:</strong> {selectedTile.tile.admittedAt || "Today, 10:15 AM"}</div>
                  <div><strong>Transfer Reason:</strong> {selectedTile.tile.admissionReason || selectedTile.tile.notes}</div>
                  <div><strong>Attending Doctor:</strong> {selectedTile.tile.doctor || "Dr. Vikram Hegde"}</div>
                </div>
                <button
                  onClick={() => {
                    updateTileStatus(selectedTile.rowIdx, selectedTile.tile.id, "OCCUPIED");
                    triggerToast(`✓ Patient accepted into ${selectedTile.tile.id}. Status: OCCUPIED.`);
                    setSelectedTile(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition cursor-pointer shadow-xs"
                >
                  Accept Patient & Mark Bed Occupied →
                </button>
              </div>
            )}

            {/* CASE 3: BED IS CLEANING */}
            {selectedTile.tile.status === "CLEANING" && (
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold">
                  <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
                  <span>Sanitization & Terminal UV Cleaning in Progress</span>
                </div>
                <p className="text-slate-600">
                  Assigned Team: <strong>{selectedTile.tile.cleaner || "Sanitation Squad 2"}</strong> · ETA: ~8 mins until sterile verification.
                </p>
                <button
                  onClick={() => {
                    updateTileStatus(selectedTile.rowIdx, selectedTile.tile.id, "AVAILABLE");
                    triggerToast(`✓ Cleaning verified! ${selectedTile.tile.id} is now AVAILABLE for admission.`);
                    setSelectedTile(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer shadow-xs"
                >
                  Verify Cleaning & Mark Available
                </button>
              </div>
            )}

            {/* CASE 4: BED IS AVAILABLE (Clean & Ready + Inline Admit Patient Form) */}
            {selectedTile.tile.status === "AVAILABLE" && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Bed is Sanitized & Ready for Immediate Intake</span>
                  </div>
                  <button
                    onClick={() => setShowAdmitForm(!showAdmitForm)}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer"
                  >
                    {showAdmitForm ? "Hide Form" : "+ Admit Patient"}
                  </button>
                </div>

                {showAdmitForm ? (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs animate-fade-in">
                    <span className="font-black text-slate-900 block text-xs uppercase tracking-wide">
                      Admit Patient to {selectedTile.tile.id}
                    </span>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Patient ID</label>
                        <input
                          type="text"
                          value={admitForm.patientId}
                          onChange={e => setAdmitForm(p => ({ ...p, patientId: e.target.value }))}
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Patient Name</label>
                        <input
                          type="text"
                          value={admitForm.patientName}
                          onChange={e => setAdmitForm(p => ({ ...p, patientName: e.target.value }))}
                          className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-900"
                          placeholder="e.g. Ramesh Kumar"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Admission Time</label>
                      <input
                        type="text"
                        value={admitForm.admittedAt}
                        onChange={e => setAdmitForm(p => ({ ...p, admittedAt: e.target.value }))}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900 font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Reason Patient Took Bed / Symptoms</label>
                      <textarea
                        rows={2}
                        value={admitForm.admissionReason}
                        onChange={e => setAdmitForm(p => ({ ...p, admissionReason: e.target.value }))}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-900"
                        placeholder="e.g. Acute retrosternal pain, continuous telemetry observation, oxygen therapy..."
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Attending Doctor</label>
                      <select
                        value={admitForm.doctor}
                        onChange={e => setAdmitForm(p => ({ ...p, doctor: e.target.value }))}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-900"
                      >
                        <option value="Dr. Sarah Johnson (Cardiology)">Dr. Sarah Johnson (Cardiology)</option>
                        <option value="Dr. Rajesh Gupta (Orthopedics)">Dr. Rajesh Gupta (Orthopedics)</option>
                        <option value="Dr. Vikram Hegde (Trauma & ER)">Dr. Vikram Hegde (Trauma & ER)</option>
                        <option value="Dr. Marcus Bell (Critical Care / ICU)">Dr. Marcus Bell (Critical Care / ICU)</option>
                        <option value="Dr. Priya Sharma (Internal Medicine)">Dr. Priya Sharma (Internal Medicine)</option>
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        const name = admitForm.patientName.trim() || "Emergency Inpatient";
                        const reason = admitForm.admissionReason.trim() || "Acute medical observation and vital monitoring";
                        admitPatientToBed(selectedTile.tile.id, {
                          patientId: admitForm.patientId,
                          patientName: name,
                          age: admitForm.age || 42,
                          gender: admitForm.gender || "Male",
                          admittedAt: admitForm.admittedAt,
                          admissionReason: reason,
                          doctor: admitForm.doctor,
                          diagnosis: "Clinical Intake"
                        });
                        setSelectedTile(null);
                        setShowAdmitForm(false);
                      }}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition cursor-pointer shadow-md"
                    >
                      Confirm Admission & Occupy Bed →
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAdmitForm(true)}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Admit Patient to {selectedTile.tile.id}</span>
                  </button>
                )}
              </div>
            )}

            {/* Quick Status Override Buttons */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-400 block">Override Status Directly:</span>
              <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                <button
                  onClick={() => updateTileStatus(selectedTile.rowIdx, selectedTile.tile.id, "AVAILABLE")}
                  className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer text-center"
                >
                  Available
                </button>
                <button
                  onClick={() => updateTileStatus(selectedTile.rowIdx, selectedTile.tile.id, "CLEANING")}
                  className="py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black transition cursor-pointer text-center"
                >
                  Cleaning
                </button>
                <button
                  onClick={() => updateTileStatus(selectedTile.rowIdx, selectedTile.tile.id, "OCCUPIED")}
                  className="py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white transition cursor-pointer text-center"
                >
                  Occupied
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 2: QUICK ACTION - VIEW BED DETAILS
      ────────────────────────────────────────────────────────────── */}
      {quickActionModal === "bed-details" && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bed className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-lg text-slate-900">Hospital Bed Capacity Inspector</h3>
              </div>
              <button onClick={() => setQuickActionModal(null)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-emerald-800 font-bold block">Total Operational Beds</span>
                <span className="text-2xl font-black text-emerald-900">36 Beds</span>
              </div>
              <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                <span className="text-red-800 font-bold block">Current Occupancy Rate</span>
                <span className="text-2xl font-black text-red-900">22% (6 In Use)</span>
              </div>
            </div>

            <div className="space-y-2 text-xs max-h-60 overflow-y-auto pr-1">
              {bedsData.flatMap(w => w.beds.map(b => ({ ...b, ward: w.ward, floor: w.floor }))).map(b => (
                <div key={b.id + b.ward} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">{b.id}</span> · <span className="text-slate-500">{b.ward} ({b.floor})</span>
                    {b.occupant && <div className="text-[11px] text-blue-700 font-medium">Occupant: {b.occupant}</div>}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                    b.status === "AVAILABLE" ? "bg-emerald-100 text-emerald-800" : b.status === "OCCUPIED" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-900"
                  }`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setQuickActionModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer hover:bg-black"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 3: QUICK ACTION - ASSIGN CLEANING STAFF
      ────────────────────────────────────────────────────────────── */}
      {quickActionModal === "assign-cleaning" && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-600" />
                <h3 className="font-black text-lg text-slate-900">Assign Cleaning & Sanitation</h3>
              </div>
              <button onClick={() => setQuickActionModal(null)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Ward & Floor</label>
                <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium">
                  <option>General Ward (1st Floor) — Bed 104</option>
                  <option>General Ward (2nd Floor) — Bed 205</option>
                  <option>Pediatrics (5th Floor) — Bed 503</option>
                  <option>Maternity (6th Floor) — Bed 604</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Available Sanitation Crew</label>
                <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium">
                  <option>Cleaning Staff 1 (On Duty, Free)</option>
                  <option>Cleaning Staff 2 (Terminal Sanitization Specialist)</option>
                  <option>Cleaning Staff 3 (UV Disinfection Crew)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Protocol Priority</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" className="p-2 rounded-xl bg-amber-50 border border-amber-300 font-bold text-amber-900 text-center">
                    ⚡ Urgent Turnaround
                  </button>
                  <button type="button" className="p-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700 text-center">
                    Standard Disinfection
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setQuickActionModal(null);
                triggerToast("✓ Cleaning staff dispatched! Target bed turnover ETA: 12 minutes.");
              }}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs cursor-pointer shadow-md"
            >
              Confirm Dispatch
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 4: QUICK ACTION - RAISE EQUIPMENT REQUEST
      ────────────────────────────────────────────────────────────── */}
      {quickActionModal === "equipment-request" && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-lg text-slate-900">Emergency Equipment Requisition</h3>
              </div>
              <button onClick={() => setQuickActionModal(null)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Required Asset Type</label>
                <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium">
                  <option>High-Spec Ventilator (Adult SIMV)</option>
                  <option>Crash Cart Defibrillator (200J Biphasic)</option>
                  <option>Dialysis Unit (Mobile)</option>
                  <option>Syringe Infusion Pump</option>
                  <option>Multi-Parameter Telemetry Monitor</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Destination Location</label>
                <input
                  type="text"
                  defaultValue="ICU Bed 305 — 3rd Floor"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Clinical Urgency</label>
                <select className="w-full px-3 py-2 bg-red-50 border border-red-200 text-red-900 font-bold rounded-xl">
                  <option>Code Red (Immediate 3-min transport)</option>
                  <option>Urgent Clinical Need (&lt; 15 mins)</option>
                  <option>Standard Elective Requisition</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => {
                setQuickActionModal(null);
                triggerToast("✓ Equipment request dispatched to Biomedical Central Pool! Tracking #EQ-8812.");
              }}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer shadow-md"
            >
              Submit Equipment Request
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 5: QUICK ACTION - VIEW PATIENT JOURNEY
      ────────────────────────────────────────────────────────────── */}
      {quickActionModal === "patient-journey" && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-lg text-slate-900">Active Inpatient Journeys</h3>
              </div>
              <button onClick={() => setQuickActionModal(null)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Harsh Tripathi (P-101)</span>
                  <span className="text-blue-700">Bed 102 · Floor 1</span>
                </div>
                <p className="text-slate-500">Journey JRN-2026-8812: Blood profile done, CT Angiography pending in queue.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Elena Rostova (P-102)</span>
                  <span className="text-purple-700">Bed 203 · Floor 2</span>
                </div>
                <p className="text-slate-500">Journey JRN-2026-8815: X-Ray ready, waiting for Dr. Rajesh Gupta review.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Mohammed Al-Rashid (P-103)</span>
                  <span className="text-red-700">ICU Bed 302 · Floor 3</span>
                </div>
                <p className="text-slate-500">Journey JRN-2026-8820: BiPAP ventilation active, continuous SpO2 telemetry.</p>
              </div>
            </div>

            <button
              onClick={() => setQuickActionModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL 6: VIEW ALL RECENT ALERTS
      ────────────────────────────────────────────────────────────── */}
      {quickActionModal === "all-alerts" && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="font-black text-lg text-slate-900">All Operational Exception Alerts</h3>
              </div>
              <button onClick={() => setQuickActionModal(null)} className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs max-h-72 overflow-y-auto">
              {alerts.map(alt => (
                <div key={alt.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 font-mono text-[10px]">{alt.time}</span>
                    <div className="font-bold text-slate-900">{alt.resource}</div>
                    <div className="text-slate-600 text-[11px]">{alt.issue} (Staff: {alt.staff})</div>
                  </div>
                  <button
                    onClick={() => handleAlertAction(alt)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${alt.actionColor}`}
                  >
                    {alt.action}
                  </button>
                </div>
              ))}
              {alerts.length === 0 && (
                <div className="p-6 text-center text-slate-400 font-bold">
                  Zero active alerts. All resources operating normally.
                </div>
              )}
            </div>

            <button
              onClick={() => setQuickActionModal(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
