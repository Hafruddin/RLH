// utils/mockDb.js

const generateNext7DaysSlots = () => {
  const schedule = {};
  const slots = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateKey = d.toISOString().split("T")[0]; // YYYY-MM-DD
    schedule[dateKey] = slots;
  }
  return schedule;
};

const doctorsData = [
  {
    _id: "6a3820c82cecc9714b826111",
    name: "Dr. Rajesh Kumar",
    specialization: "Cardiologist",
    imageFile: "D6.png",
    experience: "16 years",
    qualifications: "MBBS, MD (General Medicine), DM (Cardiology)",
    location: "Indiranagar, Bangalore",
    about: "Senior Interventional Cardiologist specializing in coronary interventions, hypertension, and preventive cardiac wellness.",
    fee: 800,
    patients: "3.5k+",
    rating: 4.9,
    email: "rajesh.kumar@medicare.com"
  },
  {
    _id: "6a3820c82cecc9714b826112",
    name: "Dr. Suresh Reddy",
    specialization: "Neurologist",
    imageFile: "D7.png",
    experience: "15 years",
    qualifications: "MBBS, DM (Neurology), DNB",
    location: "Koramangala, Bangalore",
    about: "Consultant Neurologist expert in chronic migraines, epilepsy, neuromuscular disorders, and acute stroke management.",
    fee: 900,
    patients: "2.8k+",
    rating: 4.8,
    email: "suresh.reddy@medicare.com"
  },
  {
    _id: "6a3820c82cecc9714b826113",
    name: "Dr. Ananya Deshmukh",
    specialization: "Pediatrician",
    imageFile: "D4.png",
    experience: "11 years",
    qualifications: "MBBS, MD (Pediatrics), DCH",
    location: "Whitefield, Bangalore",
    about: "Child specialist focused on pediatric nutrition, developmental milestones, vaccinations, and seasonal allergies.",
    fee: 600,
    patients: "4.2k+",
    rating: 4.9,
    email: "ananya.deshmukh@medicare.com"
  },
  {
    _id: "6a3820c82cecc9714b826114",
    name: "Dr. Vikram Hegde",
    specialization: "Orthopedic Surgeon",
    imageFile: "D8.png",
    experience: "18 years",
    qualifications: "MBBS, MS (Orthopaedics), M.Ch (Ortho)",
    location: "Jayanagar, Bangalore",
    about: "Expert in robotic joint replacement, arthroscopic knee reconstruction, and sports traumatology.",
    fee: 1000,
    patients: "3.1k+",
    rating: 4.7,
    email: "vikram.hegde@medicare.com"
  },
  {
    _id: "6a3820c82cecc9714b826115",
    name: "Dr. Priya Sharma",
    specialization: "Dermatologist",
    imageFile: "HD5.png",
    experience: "10 years",
    qualifications: "MBBS, MD (Dermatology, Venereology & Leprosy)",
    location: "HSR Layout, Bangalore",
    about: "Clinical and aesthetic dermatologist specializing in acne scar treatments, pigmentation, and hair-loss therapies.",
    fee: 700,
    patients: "2.9k+",
    rating: 4.8,
    email: "priya.sharma@medicare.com"
  },
  {
    _id: "6a3820c82cecc9714b826116",
    name: "Dr. Arvind Swaminathan",
    specialization: "Psychiatrist",
    imageFile: "D9.png",
    experience: "14 years",
    qualifications: "MBBS, MD (Psychiatry), DPM",
    location: "Malleshwaram, Bangalore",
    about: "Neuropsychiatrist treating anxiety disorders, clinical depression, adult ADHD, and stress management.",
    fee: 850,
    patients: "2.2k+",
    rating: 4.6,
    email: "arvind.swami@medicare.com"
  },
  {
    _id: "6a3820c82cecc9714b826117",
    name: "Dr. Sunita Kulkarni",
    specialization: "Gynecologist",
    imageFile: "D5.png",
    experience: "16 years",
    qualifications: "MBBS, MS (Obstetrics & Gynaecology), DGO",
    location: "Bellandur, Bangalore",
    about: "Senior Obstetrician and High-Risk Pregnancy Specialist with vast experience in minimally invasive laparoscopic surgeries.",
    fee: 750,
    patients: "4.5k+",
    rating: 4.9,
    email: "sunita.kulkarni@medicare.com"
  },
  {
    _id: "6a3820c82cecc9714b826118",
    name: "Dr. Karthik Venkatesh",
    specialization: "General Physician",
    imageFile: "D12.png",
    experience: "12 years",
    qualifications: "MBBS, MD (Internal Medicine)",
    location: "BTM Layout, Bangalore",
    about: "Consultant Physician focused on lifestyle diseases, type-2 diabetes reversal, hypertension, and infectious diseases.",
    fee: 500,
    patients: "5.1k+",
    rating: 4.8,
    email: "karthik.v@medicare.com"
  },
  {
    _id: "6a3820c82cecc9714b826119",
    name: "Dr. Sanjay Bhattacharya",
    specialization: "Oncologist",
    imageFile: "D7.png",
    experience: "19 years",
    qualifications: "MBBS, MD (Medicine), DM (Medical Oncology)",
    location: "Sadashivanagar, Bangalore",
    about: "Medical Oncologist with deep expertise in targeted immunotherapy, chemotherapy regimens, and solid tumor oncology.",
    fee: 1200,
    patients: "1.9k+",
    rating: 4.9,
    email: "sanjay.b@medicare.com"
  },
  {
    _id: "6a3820c82cecc9714b82611a",
    name: "Dr. Deepa Ranganathan",
    specialization: "ENT Specialist",
    imageFile: "D10.png",
    experience: "13 years",
    qualifications: "MBBS, MS (ENT), DLO",
    location: "Marathahalli, Bangalore",
    about: "ENT and Head & Neck Surgeon specialized in endoscopic sinus surgery, micro ear surgeries, and allergic rhinitis.",
    fee: 650,
    patients: "3.4k+",
    rating: 4.7,
    email: "deepa.r@medicare.com"
  },
  {
    _id: "6a3820c82cecc9714b82611b",
    name: "Dr. Ishaan Khanna",
    specialization: "Pulmonologist",
    imageFile: "D6.png",
    experience: "12 years",
    qualifications: "MBBS, MD (Pulmonary Medicine), FCCP",
    location: "Electronic City, Bangalore",
    about: "Chest specialist treating bronchial asthma, COPD, post-viral respiratory recovery, and sleep apnea.",
    fee: 750,
    patients: "2.6k+",
    rating: 4.7,
    email: "ishaan.khanna@medicare.com"
  },
  {
    _id: "6a3820c82cecc9714b82611c",
    name: "Dr. Kabir Malhotra",
    specialization: "Gastroenterologist",
    imageFile: "D12.png",
    experience: "17 years",
    qualifications: "MBBS, MD (Medicine), DM (Gastroenterology)",
    location: "JP Nagar, Bangalore",
    about: "Senior Gastroenterologist and Hepatologist performing therapeutic endoscopy, colonoscopy, and fatty liver therapies.",
    fee: 950,
    patients: "3.8k+",
    rating: 4.8,
    email: "kabir.malhotra@medicare.com"
  },
  {
    _id: "6a3820c82cecc9714b82611d",
    name: "Dr. Neha Kapoor",
    specialization: "Dermatologist",
    imageFile: "D5.png",
    experience: "9 years",
    qualifications: "MBBS, DDVL",
    location: "Koramangala, Bangalore",
    about: "Skin health and clinical dermatology expert specializing in eczema, psoriasis, and pediatric skin disorders.",
    fee: 600,
    patients: "2.1k+",
    rating: 4.8,
    email: "neha.kapoor@medicare.com"
  },
  {
    _id: "6a3820c82cecc9714b82611e",
    name: "Dr. Virat Anand",
    specialization: "Orthopedic Surgeon",
    imageFile: "D7.png",
    experience: "14 years",
    qualifications: "MBBS, MS (Ortho)",
    location: "Cunningham Road, Bangalore",
    about: "Spine and joint specialist focusing on conservative spine care, sciatica relief, and arthroscopic procedures.",
    fee: 900,
    patients: "2.5k+",
    rating: 4.7,
    email: "virat.anand@medicare.com"
  },
  {
    _id: "6a3820c82cecc9714b82611f",
    name: "Dr. Jatin Arora",
    specialization: "Cardiologist",
    imageFile: "D8.png",
    experience: "13 years",
    qualifications: "MBBS, MD, DNB (Cardiology)",
    location: "Indiranagar, Bangalore",
    about: "Cardiac electrophysiologist treating arrhythmias, heart failure, and pacemaker implantations.",
    fee: 850,
    patients: "2.7k+",
    rating: 4.8,
    email: "jatin.arora@medicare.com"
  },
  {
    _id: "6a3820c82cecc9714b826120",
    name: "Dr. Aarav Singh",
    specialization: "General Physician",
    imageFile: "D9.png",
    experience: "10 years",
    qualifications: "MBBS, DNB (Family Medicine)",
    location: "Banashankari, Bangalore",
    about: "Primary care physician focusing on fever management, preventive health checkups, and chronic disease care.",
    fee: 500,
    patients: "4.0k+",
    rating: 4.7,
    email: "aarav.singh@medicare.com"
  },
  {
    _id: "6a3820c82cecc9714b826121",
    name: "Dr. Megha Shah",
    specialization: "Gynecologist",
    imageFile: "D10.png",
    experience: "15 years",
    qualifications: "MBBS, DGO, DNB (OBGYN)",
    location: "Whitefield, Bangalore",
    about: "Specialist in PCOS management, adolescent gynecological wellness, and preconception genetic counseling.",
    fee: 700,
    patients: "3.6k+",
    rating: 4.9,
    email: "megha.shah@medicare.com"
  },
  {
    _id: "6a3820c82cecc9714b826122",
    name: "Dr. Aditi Rao",
    specialization: "Pediatrician",
    imageFile: "D4.png",
    experience: "12 years",
    qualifications: "MBBS, MD (Pediatrics)",
    location: "HSR Layout, Bangalore",
    about: "Compassionate pediatrician with expertise in newborn intensive care, childhood asthma, and lactation guidance.",
    fee: 600,
    patients: "3.9k+",
    rating: 4.9,
    email: "aditi.rao@medicare.com"
  },
  {
    _id: "6a3820c82cecc9714b826123",
    name: "Dr. Rohan Mehta",
    specialization: "Neurologist",
    imageFile: "D6.png",
    experience: "14 years",
    qualifications: "MBBS, DM (Neurology)",
    location: "Malleshwaram, Bangalore",
    about: "Consultant neurologist specializing in Parkinson's disease, cognitive decline, memory clinics, and neuropathies.",
    fee: 900,
    patients: "2.4k+",
    rating: 4.7,
    email: "rohan.mehta@medicare.com"
  },
  {
    _id: "6a3820c82cecc9714b826124",
    name: "Dr. Sneha Verma",
    specialization: "Dermatologist",
    imageFile: "D11.png",
    experience: "8 years",
    qualifications: "MBBS, MD (Dermatology)",
    location: "Koramangala, Bangalore",
    about: "Trichologist and clinical dermatologist specializing in scalp health, alopecia treatments, and skin barrier repair.",
    fee: 650,
    patients: "2.3k+",
    rating: 4.8,
    email: "sneha.verma@medicare.com"
  }
];

const servicesData = [
  {
    _id: "6a3820c92cecc9714b826125",
    name: "Complete Blood Count (CBC)",
    about: "Evaluates your overall health and detects a wide range of disorders, including anemia, infection, and leukemia.",
    shortDescription: "Complete blood count diagnostic test.",
    price: 300,
    available: true,
    imageFile: "S1.png",
    instructions: ["Fasting is not required", "Avoid heavy meals before the test", "Inform doctor of medications"]
  },
  {
    _id: "6a3820c92cecc9714b826126",
    name: "Lipid Profile",
    about: "Measures the amount of cholesterol and other fats in your blood to assess cardiovascular risk.",
    shortDescription: "Cholesterol and cardiovascular risk assessment.",
    price: 500,
    available: true,
    imageFile: "S2.png",
    instructions: ["10-12 hours fasting required", "Only water is allowed during fasting", "Avoid alcohol 24h prior"]
  },
  {
    _id: "6a3820c92cecc9714b826127",
    name: "Thyroid Profile (T3, T4, TSH)",
    about: "Assesses thyroid gland function and helps diagnose thyroid disorders like hypo/hyperthyroidism.",
    shortDescription: "Thyroid gland function evaluation.",
    price: 600,
    available: true,
    imageFile: "S3.png",
    instructions: ["Morning sample preferred", "Fasting is not mandatory"]
  },
  {
    _id: "6a3820c92cecc9714b826128",
    name: "Liver Function Test (LFT)",
    about: "Measures levels of proteins, liver enzymes, and bilirubin in your blood to evaluate liver health.",
    shortDescription: "Liver health and enzyme levels evaluation.",
    price: 700,
    available: true,
    imageFile: "S4.png",
    instructions: ["Fasting preferred but not mandatory", "Avoid alcohol 24 hours prior"]
  },
  {
    _id: "6a3820c92cecc9714b826129",
    name: "Kidney Function Test (KFT)",
    about: "Evaluates how well your kidneys are working by measuring urea, creatinine, and electrolytes.",
    shortDescription: "Kidney performance and creatinine evaluation.",
    price: 800,
    available: true,
    imageFile: "S5.png",
    instructions: ["Drink plenty of water before the test", "Fasting not required"]
  },
  {
    _id: "6a3820c92cecc9714b82612a",
    name: "X-Ray Chest",
    about: "Produces images of the heart, lungs, airways, blood vessels, and the bones of the spine and chest.",
    shortDescription: "Chest and lungs imaging diagnostic.",
    price: 400,
    available: true,
    imageFile: "S6.png",
    instructions: ["Remove metal objects, jewelry before the test", "Inform technician if pregnant"]
  },
  {
    _id: "6a3820c92cecc9714b82612b",
    name: "Ultrasound Whole Abdomen",
    about: "Uses sound waves to produce pictures of the organs within the abdomen, including liver, gallbladder, kidneys, spleen.",
    shortDescription: "Abdominal organs ultrasound scan.",
    price: 1200,
    available: true,
    imageFile: "S7.png",
    instructions: ["Fasting of 6 hours required", "Full bladder required for pelvic scan (drink 4-5 glasses of water)"]
  },
  {
    _id: "6a3820c92cecc9714b82612c",
    name: "HbA1c (Glycated Haemoglobin)",
    about: "Measures your average blood sugar levels over the past 3 months to monitor diabetes control.",
    shortDescription: "Average blood sugar levels monitoring.",
    price: 450,
    available: true,
    imageFile: "S8.png",
    instructions: ["Fasting not required", "Can be done at any time of day"]
  }
];

const rewriteImageUrl = (imageFile, req) => {
  const hostName = req.get('host') || "";
  const protocol = (hostName.includes('localhost') || hostName.includes('127.0.0.1')) ? req.protocol : 'https';
  return `${protocol}://${hostName}/assets/${imageFile}`;
};

const _today = new Date().toISOString().split("T")[0];
const _tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

export const mockAppointments = [
  {
    _id: "appt_sarah_01",
    id: "appt_sarah_01",
    patientName: "Rahul Kumar",
    mobile: "9876543210",
    age: 38,
    gender: "Male",
    doctorId: "6a3820c82cecc9714b826111",
    doctorName: "Dr. Sarah Johnson",
    speciality: "Cardiologist",
    date: _today,
    time: "09:30 AM",
    fees: 700,
    status: "Completed",
    payment: { method: "Online", status: "Paid", amount: 700 },
    notes: "Routine ECG & post-stress test consultation. Stable.",
    owner: "major_admin_id",
    createdBy: "user_patient_p1001",
    createdAt: new Date(Date.now() - 3600000 * 4),
  },
  {
    _id: "appt_sarah_02",
    id: "appt_sarah_02",
    patientName: "Priya Sharma",
    mobile: "9876543211",
    age: 29,
    gender: "Female",
    doctorId: "6a3820c82cecc9714b826111",
    doctorName: "Dr. Sarah Johnson",
    speciality: "Cardiologist",
    date: _today,
    time: "10:30 AM",
    fees: 700,
    status: "Completed",
    payment: { method: "Online", status: "Paid", amount: 700 },
    notes: "Mild sinus tachycardia. Echo ordered, prescribed beta-blockers.",
    owner: "major_admin_id",
    createdBy: "user_patient_p1002",
    createdAt: new Date(Date.now() - 3600000 * 3),
  },
  {
    _id: "appt_sarah_03",
    id: "appt_sarah_03",
    patientName: "Arun Raj",
    mobile: "9876543212",
    age: 45,
    gender: "Male",
    doctorId: "6a3820c82cecc9714b826111",
    doctorName: "Dr. Sarah Johnson",
    speciality: "Cardiologist",
    date: _today,
    time: "11:30 AM",
    fees: 700,
    status: "Confirmed",
    payment: { method: "Online", status: "Paid", amount: 700 },
    notes: "Post-angioplasty 3-month follow-up. Check stent patency.",
    owner: "major_admin_id",
    createdBy: "user_patient_p1003",
    createdAt: new Date(Date.now() - 3600000 * 2),
  },
  {
    _id: "appt_sarah_04",
    id: "appt_sarah_04",
    patientName: "Meena Devi",
    mobile: "9876543213",
    age: 52,
    gender: "Female",
    doctorId: "6a3820c82cecc9714b826111",
    doctorName: "Dr. Sarah Johnson",
    speciality: "Cardiologist",
    date: _today,
    time: "02:00 PM",
    fees: 700,
    status: "Confirmed",
    payment: { method: "Online", status: "Paid", amount: 700 },
    notes: "Hypertension Stage 2 and exertional dyspnea. Lipid profile review.",
    owner: "major_admin_id",
    createdBy: "user_patient_p1004",
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    _id: "appt_sarah_05",
    id: "appt_sarah_05",
    patientName: "Sunita Rao",
    mobile: "9876543215",
    age: 34,
    gender: "Female",
    doctorId: "6a3820c82cecc9714b826111",
    doctorName: "Dr. Sarah Johnson",
    speciality: "Cardiologist",
    date: _today,
    time: "03:00 PM",
    fees: 700,
    status: "Pending",
    payment: { method: "Cash", status: "Pending", amount: 700 },
    notes: "Intermittent palpitations and dizziness.",
    owner: "major_admin_id",
    createdBy: "user_patient_p1006",
    createdAt: new Date(),
  },
  {
    _id: "appt_sarah_06",
    id: "appt_sarah_06",
    patientName: "David Miller",
    mobile: "9876543216",
    age: 62,
    gender: "Male",
    doctorId: "6a3820c82cecc9714b826111",
    doctorName: "Dr. Sarah Johnson",
    speciality: "Cardiologist",
    date: _tomorrow,
    time: "10:00 AM",
    fees: 700,
    status: "Confirmed",
    payment: { method: "Online", status: "Paid", amount: 700 },
    notes: "Heart failure NYHA Class II management.",
    owner: "major_admin_id",
    createdBy: "user_patient_p1007",
    createdAt: new Date(),
  },
  {
    _id: "appt_sarah_07",
    id: "appt_sarah_07",
    patientName: "Ananya Patel",
    mobile: "9876543217",
    age: 26,
    gender: "Female",
    doctorId: "6a3820c82cecc9714b826111",
    doctorName: "Dr. Sarah Johnson",
    speciality: "Cardiologist",
    date: _tomorrow,
    time: "11:30 AM",
    fees: 700,
    status: "Confirmed",
    payment: { method: "Cash", status: "Pending", amount: 700 },
    notes: "Holter monitor test interpretation.",
    owner: "major_admin_id",
    createdBy: "user_patient_p1008",
    createdAt: new Date(),
  },
  {
    _id: "appt_chen_01",
    id: "appt_chen_01",
    patientName: "Rohan Gupta",
    mobile: "9876543220",
    age: 42,
    gender: "Male",
    doctorId: "6a3820c82cecc9714b826112",
    doctorName: "Dr. Michael Chen",
    speciality: "Neurologist",
    date: _today,
    time: "10:00 AM",
    fees: 900,
    status: "Confirmed",
    payment: { method: "Online", status: "Paid", amount: 900 },
    notes: "Refractory migraine evaluation.",
    owner: "major_admin_id",
    createdBy: "user_patient_p1010",
    createdAt: new Date(),
  },
  {
    _id: "appt_wang_01",
    id: "appt_wang_01",
    patientName: "Emma Wilson",
    mobile: "9876543230",
    age: 28,
    gender: "Female",
    doctorId: "6a3820c82cecc9714b826117",
    doctorName: "Dr. Lisa Wang",
    speciality: "Gynecologist",
    date: _today,
    time: "09:00 AM",
    fees: 800,
    status: "Confirmed",
    payment: { method: "Online", status: "Paid", amount: 800 },
    notes: "Routine antenatal checkup - 24 weeks.",
    owner: "major_admin_id",
    createdBy: "user_patient_p1012",
    createdAt: new Date(),
  },
  {
    _id: "appt_aniket_01",
    id: "appt_aniket_01",
    patientName: "Harsh Tripathi",
    mobile: "9876543241",
    age: 32,
    gender: "Male",
    doctorId: "doc-4",
    doctorName: "Dr. Aniket Roy",
    speciality: "Dermatology & Skin Care",
    token: "#01",
    tokenNumber: 1,
    date: _today,
    time: "10:00 AM",
    fees: 700,
    status: "Completed",
    payment: { method: "Online", status: "Paid", amount: 700 },
    notes: "General Checkup • Token #1",
    owner: "major_admin_id",
    createdBy: "user_patient_ht1",
    createdAt: new Date(Date.now() - 3600000 * 3),
  },
  {
    _id: "appt_aniket_02",
    id: "appt_aniket_02",
    patientName: "Harshit Verma",
    mobile: "9876543242",
    age: 27,
    gender: "Male",
    doctorId: "doc-4",
    doctorName: "Dr. Aniket Roy",
    speciality: "Dermatology & Skin Care",
    token: "#02",
    tokenNumber: 2,
    date: _today,
    time: "10:30 AM",
    fees: 700,
    status: "Completed",
    payment: { method: "Online", status: "Paid", amount: 700 },
    notes: "Skin Rash / Allergy • Token #2",
    owner: "major_admin_id",
    createdBy: "user_patient_hv2",
    createdAt: new Date(Date.now() - 3600000 * 2),
  },
  {
    _id: "appt_aniket_03",
    id: "appt_aniket_03",
    patientName: "Suresh Patel",
    mobile: "9876543243",
    age: 41,
    gender: "Male",
    doctorId: "doc-4",
    doctorName: "Dr. Aniket Roy",
    speciality: "Dermatology & Skin Care",
    token: "#03",
    tokenNumber: 3,
    date: _today,
    time: "11:00 AM",
    fees: 700,
    status: "Completed",
    payment: { method: "Online", status: "Paid", amount: 700 },
    notes: "Consultation • Token #3",
    owner: "major_admin_id",
    createdBy: "user_patient_sp3",
    createdAt: new Date(Date.now() - 3600000),
  }
];

export const createMockAppointment = (data) => {
  const newAppt = {
    _id: "mockappt_" + Math.random().toString(36).substr(2, 9),
    id: "mockappt_" + Math.random().toString(36).substr(2, 9),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...data,
  };
  mockAppointments.push(newAppt);
  return newAppt;
};

export const getMockAppointments = (filter = {}) => {
  let list = [...mockAppointments];
  if (filter.doctorId) {
    list = list.filter((a) => String(a.doctorId) === String(filter.doctorId));
  }
  if (filter.createdBy) {
    list = list.filter((a) => String(a.createdBy) === String(filter.createdBy));
  }
  if (filter.status) {
    list = list.filter((a) => a.status === filter.status);
  }
  return list;
};

export const updateMockAppointment = (query = {}, update = {}) => {
  const appt = mockAppointments.find((a) => {
    if (query.sessionId && a.sessionId !== query.sessionId) return false;
    if (query.doctorId && String(a.doctorId) !== String(query.doctorId)) return false;
    if (query.mobile && a.mobile !== query.mobile) return false;
    if (query.patientName && a.patientName !== query.patientName) return false;
    return true;
  });

  if (appt) {
    Object.keys(update).forEach((key) => {
      if (typeof update[key] === 'object' && update[key] !== null && !(update[key] instanceof Date) && !Array.isArray(update[key])) {
        appt[key] = { ...appt[key], ...update[key] };
      } else {
        appt[key] = update[key];
      }
    });
    appt.updatedAt = new Date();
  }
  return appt;
};

export const getMockDoctors = (req) => {
  return doctorsData.map((d) => {
    const appts = mockAppointments.filter((a) => String(a.doctorId) === String(d._id));
    const appointmentsTotal = appts.length;
    const appointmentsCompleted = appts.filter((a) => ["Confirmed", "Completed"].includes(a.status)).length;
    const appointmentsCanceled = appts.filter((a) => a.status === "Canceled").length;
    const earnings = appts.filter((a) => ["Confirmed", "Completed"].includes(a.status)).reduce((sum, a) => sum + (a.fees || 0), 0);

    return {
      _id: d._id,
      id: d._id,
      name: d.name,
      specialization: d.specialization,
      fee: d.fee,
      imageUrl: rewriteImageUrl(d.imageFile, req),
      appointmentsTotal,
      appointmentsCompleted,
      appointmentsCanceled,
      earnings,
      availability: "Available",
      schedule: generateNext7DaysSlots(),
      patients: d.patients,
      rating: d.rating,
      about: d.about,
      experience: d.experience,
      qualifications: d.qualifications,
      location: d.location,
      success: d.success,
      raw: {
        ...d,
        imageUrl: rewriteImageUrl(d.imageFile, req),
        schedule: generateNext7DaysSlots()
      }
    };
  });
};

export const getMockDoctorById = (id, req) => {
  const d = doctorsData.find((doc) => String(doc._id) === String(id));
  if (!d) return null;
  const appts = mockAppointments.filter((a) => String(a.doctorId) === String(d._id));
  const appointmentsTotal = appts.length;
  const appointmentsCompleted = appts.filter((a) => ["Confirmed", "Completed"].includes(a.status)).length;
  const appointmentsCanceled = appts.filter((a) => a.status === "Canceled").length;
  const earnings = appts.filter((a) => ["Confirmed", "Completed"].includes(a.status)).reduce((sum, a) => sum + (a.fees || 0), 0);

  return {
    ...d,
    imageUrl: rewriteImageUrl(d.imageFile, req),
    availability: "Available",
    schedule: generateNext7DaysSlots(),
    appointmentsTotal,
    appointmentsCompleted,
    appointmentsCanceled,
    earnings
  };
};

export const getMockServices = (req) => {
  return servicesData.map((s) => ({
    _id: s._id,
    name: s.name,
    about: s.about,
    shortDescription: s.shortDescription,
    price: s.price,
    available: s.available,
    imageUrl: rewriteImageUrl(s.imageFile, req),
    dates: Object.keys(generateNext7DaysSlots()),
    slots: generateNext7DaysSlots(),
    instructions: s.instructions,
    totalAppointments: 0,
    completed: 0,
    canceled: 0
  }));
};

export const getMockServiceById = (id, req) => {
  const s = servicesData.find((svc) => String(svc._id) === String(id));
  if (!s) return null;
  return {
    ...s,
    imageUrl: rewriteImageUrl(s.imageFile, req),
    dates: Object.keys(generateNext7DaysSlots()),
    slots: generateNext7DaysSlots()
  };
};
