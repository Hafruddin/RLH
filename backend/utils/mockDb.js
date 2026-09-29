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
    name: "Dr. Sarah Johnson",
    specialization: "Cardiologist",
    imageFile: "HD1.png",
    experience: "12 years",
    qualifications: "MBBS, MD (Cardiology)",
    location: "City Hospital, Block A",
    about: "Expert in heart rhythm, cardiac care, and coronary interventions.",
    fee: 700,
    success: "98%",
    patients: "2k+",
    rating: 4.9,
    email: "sarah@medicare.com"
  },
  {
    _id: "6a3820c82cecc9714b826112",
    name: "Dr. Michael Chen",
    specialization: "Neurologist",
    imageFile: "HD2.png",
    experience: "15 years",
    qualifications: "MBBS, DM (Neurology)",
    location: "NeuroCare Center, 2nd Floor",
    about: "Expert in migraine, stroke, epilepsy and neuro disorders.",
    fee: 900,
    success: "89%",
    patients: "1.8k+",
    rating: 4.5,
    email: "michael@medicare.com"
  },
  {
    _id: "6a3820c82cecc9714b826113",
    name: "Dr. Emily Rodriguez",
    specialization: "Pediatrician",
    imageFile: "HD3.png",
    experience: "8 years",
    qualifications: "MBBS, DCH",
    location: "Sunrise Pediatrics, Sector 12",
    about: "Child specialist focusing on growth, nutrition, and immunity.",
    fee: 500,
    success: "97%",
    patients: "3.2k+",
    rating: 4.8,
    email: "emily@medicare.com"
  },
  {
    _id: "6a3820c82cecc9714b826114",
    name: "Dr. James Wilson",
    specialization: "Orthopedic Surgeon",
    imageFile: "HD4.png",
    experience: "18 years",
    qualifications: "MBBS, MS (Orthopedics)",
    location: "OrthoPlus Clinic",
    about: "Joint replacement & sports injury expert.",
    fee: 1200,
    success: "92%",
    patients: "1.5k+",
    rating: 4.6,
    email: "james@medicare.com"
  },
  {
    _id: "6a3820c82cecc9714b826115",
    name: "Dr. Priya Sharma",
    specialization: "Dermatologist",
    imageFile: "HD5.png",
    experience: "10 years",
    qualifications: "MBBS, DDV",
    location: "SkinCare Hub, Green Plaza",
    about: "Acne, pigmentation, hair fall & skin treatment specialist.",
    fee: 600,
    success: "94%",
    patients: "2.7k+",
    rating: 4.7,
    email: "priya@medicare.com"
  },
  {
    _id: "6a3820c82cecc9714b826116",
    name: "Dr. Robert Brown",
    specialization: "Psychiatrist",
    imageFile: "HD6.png",
    experience: "20 years",
    qualifications: "MBBS, MD (Psychiatry)",
    location: "MindWell Clinic",
    about: "Mood disorders, anxiety, therapy & behavioral care.",
    fee: 1100,
    success: "90%",
    patients: "3.1k+",
    rating: 4.4,
    email: "robert@medicare.com"
  },
  {
    _id: "6a3820c82cecc9714b826117",
    name: "Dr. Lisa Wang",
    specialization: "Gynecologist",
    imageFile: "HD7.png",
    experience: "11 years",
    qualifications: "MBBS, DGO",
    location: "Women's Health Center",
    about: "Infertility, antenatal & gyne care expert.",
    fee: 750,
    success: "96%",
    patients: "2.4k+",
    rating: 4.9,
    email: "lisa@medicare.com"
  },
  {
    _id: "6a3820c82cecc9714b826118",
    name: "Dr. David Kim",
    specialization: "Oncologist",
    imageFile: "HD8.png",
    experience: "16 years",
    qualifications: "MBBS, DM (Oncology)",
    location: "CancerCare Institute",
    about: "Specialist in chemotherapy, targeted therapy & cancer care.",
    fee: 1500,
    success: "93%",
    patients: "2.9k+",
    rating: 4.6,
    email: "david@medicare.com"
  },
  {
    _id: "6a3820c82cecc9714b826119",
    name: "Dr. Rohan Mehta",
    specialization: "ENT Specialist",
    imageFile: "D2.png",
    experience: "9 years",
    qualifications: "MBBS, MS (ENT)",
    location: "City ENT Clinic",
    about: "Sinus, ear infection, tonsils & throat care.",
    fee: 550,
    success: "95%",
    patients: "1.9k+",
    rating: 4.7,
    email: "rohan@medicare.com"
  },
  {
    _id: "6a3820c82cecc9714b82611a",
    name: "Dr. Kavita Rao",
    specialization: "General Physician",
    imageFile: "D1.png",
    experience: "7 years",
    qualifications: "MBBS",
    location: "Healthy Life Clinic",
    about: "General checkups, infections & viral fever expert.",
    fee: 400,
    success: "97%",
    patients: "2.3k+",
    rating: 4.8,
    email: "kavita@medicare.com"
  },
  {
    _id: "6a3820c82cecc9714b82611b",
    name: "Dr. Sameer Ali",
    specialization: "Pulmonologist",
    imageFile: "D4.png",
    experience: "14 years",
    qualifications: "MBBS, MD (Pulmonary Medicine)",
    location: "LungCare Center",
    about: "Asthma, COPD & lung infection specialist.",
    fee: 900,
    success: "91%",
    patients: "2.1k+",
    rating: 4.5,
    email: "sameer@medicare.com"
  },
  {
    _id: "6a3820c82cecc9714b82611c",
    name: "Dr. Aditi Verma",
    specialization: "Dentist",
    imageFile: "D3.png",
    experience: "6 years",
    qualifications: "BDS, MDS",
    location: "Smile Dental Care",
    about: "Braces, root canal, cleaning & whitening expert.",
    fee: 500,
    success: "96%",
    patients: "1.6k+",
    rating: 4.7,
    email: "aditi@medicare.com"
  },
  {
    _id: "6a3820c82cecc9714b82611d",
    name: "Dr. Neha Kapoor",
    specialization: "Physiotherapist",
    imageFile: "D5.png",
    experience: "9 years",
    qualifications: "BPT, MPT",
    location: "Rehab & Cure Center",
    about: "Sports injuries, muscle pain & recovery.",
    fee: 600,
    success: "94%",
    patients: "2.2k+",
    rating: 4.6,
    email: "neha@medicare.com"
  },
  {
    _id: "6a3820c82cecc9714b82611e",
    name: "Dr. Ishaan Khanna",
    specialization: "Psychologist",
    imageFile: "D6.png",
    experience: "10 years",
    qualifications: "BA, MA Psychology",
    location: "Mind Balance Clinic",
    about: "Therapy, depression, stress & relationship issues.",
    fee: 700,
    success: "90%",
    patients: "1.3k+",
    rating: 4.4,
    email: "ishaan@medicare.com"
  },
  {
    _id: "6a3820c82cecc9714b82611f",
    name: "Dr. Virat Anand",
    specialization: "Eye Specialist",
    imageFile: "D7.png",
    experience: "13 years",
    qualifications: "MBBS, MS (Ophthalmology)",
    location: "Vision Care Hospital",
    about: "Cataract, specs check & full eye treatment.",
    fee: 800,
    success: "95%",
    patients: "2.6k+",
    rating: 4.8,
    email: "virat@medicare.com"
  },
  {
    _id: "6a3820c82cecc9714b826120",
    name: "Dr. Jatin Arora",
    specialization: "Gastroenterologist",
    imageFile: "D8.png",
    experience: "17 years",
    qualifications: "MBBS, DM (Gastro)",
    location: "Digestive Health Clinic",
    about: "Stomach, liver & intestine treatment with GI endoscopy.",
    fee: 1300,
    success: "93%",
    patients: "3.4k+",
    rating: 4.7,
    email: "jatin@medicare.com"
  },
  {
    _id: "6a3820c82cecc9714b826121",
    name: "Dr. Aarav Singh",
    specialization: "Urologist",
    imageFile: "D9.png",
    experience: "12 years",
    qualifications: "MBBS, MS, MCh (Urology)",
    location: "UroPlus Hospital",
    about: "Kidney stones, UTI & prostate treatment.",
    fee: 1400,
    success: "92%",
    patients: "1.8k+",
    rating: 4.5,
    email: "aarav@medicare.com"
  },
  {
    _id: "6a3820c82cecc9714b826122",
    name: "Dr. Megha Shah",
    specialization: "Nutritionist",
    imageFile: "D10.png",
    experience: "8 years",
    qualifications: "BSc, MSc Nutrition",
    location: "FitLife Clinic",
    about: "Weight loss, diabetes diet, PCOS & healthy plans.",
    fee: 500,
    success: "94%",
    patients: "2.0k+",
    rating: 4.7,
    email: "megha@medicare.com"
  },
  {
    _id: "6a3820c82cecc9714b826123",
    name: "Dr. Helena Grace",
    specialization: "Radiologist",
    imageFile: "D11.png",
    experience: "10 years",
    qualifications: "MBBS, MD (Radiology)",
    location: "Metro Diagnostics Center",
    about: "X-ray, MRI, CT-scan, ultrasound diagnostic expert.",
    fee: 1000,
    success: "95%",
    patients: "2.3k+",
    rating: 4.8,
    email: "helena@medicare.com"
  },
  {
    _id: "6a3820c82cecc9714b826124",
    name: "Dr. Kabir Malhotra",
    specialization: "Nephrologist",
    imageFile: "D12.png",
    experience: "14 years",
    qualifications: "MBBS, DM (Nephrology)",
    location: "KidneyCare Institute",
    about: "Kidney specialist: dialysis, transplant, kidney disorders.",
    fee: 1600,
    success: "91%",
    patients: "2.9k+",
    rating: 4.6,
    email: "kabir@medicare.com"
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

export const mockAppointments = [];

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
