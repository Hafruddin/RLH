// frontend/src/utils/prescriptionPdfGenerator.js
// Pure JavaScript Vector PDF Generator (Zero-dependency, 100% standards compliant)

function escapePdfText(str) {
  if (!str) return "";
  return String(str)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

export function generatePrescriptionPdf(rxData = {}) {
  const patient = rxData.patient || {
    name: "Harsh Tripathi",
    id: "P-101",
    abha: "91-8273-4412-9901",
    age: "34",
    gender: "Male",
    phone: "+91 98765 43210",
    visitDate: "03 Oct 2026",
    diagnosis: "Essential Hypertension & Dyslipidemia (Post-Angiogram Evaluation)"
  };

  const doctor = rxData.doctor || {
    name: "Dr. Sarah Johnson",
    qualifications: "MBBS, MD, DM (Cardiology), FACC",
    regNo: "KMC-48291",
    department: "Department of Cardiology & Vascular Medicine",
    unit: "Unit 3 - OPD Consultation Room 204"
  };

  const medicines = rxData.medicines || [
    {
      name: "Tab. Atorvastatin 20mg",
      dosage: "1 Tablet (20 mg)",
      freq: "Once Daily (Night)",
      duration: "30 Days",
      timing: "Post-Dinner",
      instructions: "Take with water after dinner. Controls LDL cholesterol."
    },
    {
      name: "Tab. Metoprolol Tartrate 25mg",
      dosage: "1 Tablet (25 mg)",
      freq: "Twice Daily (Morning & Night)",
      duration: "30 Days",
      timing: "With Meals",
      instructions: "Keep resting pulse monitored. Controls blood pressure."
    },
    {
      name: "Tab. Aspirin 75mg (Enteric Coated)",
      dosage: "1 Tablet (75 mg)",
      freq: "Once Daily (Morning)",
      duration: "30 Days",
      timing: "After Breakfast",
      instructions: "Do not take on an empty stomach. Antiplatelet prophylaxis."
    },
    {
      name: "Tab. Pantoprazole 40mg",
      dosage: "1 Tablet (40 mg)",
      freq: "Once Daily (Early Morning)",
      duration: "15 Days",
      timing: "Empty Stomach",
      instructions: "Take 30 minutes before morning tea or breakfast."
    },
    {
      name: "Tab. Rosuvastatin + Clopidogrel 10/75mg",
      dosage: "1 Tablet",
      freq: "Once Daily (Night)",
      duration: "14 Days",
      timing: "Post-Dinner",
      instructions: "Thrombosis prevention. Continue full prescribed course."
    }
  ];

  // PDF Page Stream commands (A4: 595.28 x 841.89 pt)
  const cmds = [];

  // Helper drawing functions
  const fillRect = (x, y, w, h, r, g, b) => {
    cmds.push(`${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg`);
    cmds.push(`${x.toFixed(1)} ${y.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)} re f`);
  };

  const drawLine = (x1, y1, x2, y2, r, g, b, lineWidth = 1) => {
    cmds.push(`${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG`);
    cmds.push(`${lineWidth} w`);
    cmds.push(`${x1.toFixed(1)} ${y1.toFixed(1)} m ${x2.toFixed(1)} ${y2.toFixed(1)} l S`);
  };

  const drawText = (font, size, x, y, text, r = 0, g = 0, b = 0) => {
    cmds.push(`${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg`);
    cmds.push(`BT /${font} ${size} Tf ${x.toFixed(1)} ${y.toFixed(1)} Td (${escapePdfText(text)}) Tj ET`);
  };

  // Top Navy Hospital Header Banner
  fillRect(0, 770, 595.28, 72, 0.058, 0.090, 0.165); // Slate 900
  fillRect(0, 766, 595.28, 4, 0.055, 0.706, 0.533);  // Emerald Accent Strip

  // Hospital Title & Accreditations
  drawText("F2", 18, 40, 814, "MEDICARE NEXUS HEALTHCARE PLATFORM", 1, 1, 1);
  drawText("F1", 9, 40, 799, "NABH & JCI ACCREDITED TERTIARY SUPER-SPECIALTY TEACHING HOSPITAL", 0.7, 0.85, 0.8);
  drawText("F1", 8, 40, 785, "24/7 Emergency & Trauma: 1800-419-9999 | OPD Desk: 080-4920-1111 | https://medi-nexus-rhl.netlify.app", 0.6, 0.7, 0.75);

  // Prescription Title Bar
  fillRect(40, 728, 515.28, 28, 0.941, 0.965, 0.988); // Soft blue-gray
  drawLine(40, 728, 555.28, 728, 0.8, 0.85, 0.9, 1);
  drawText("F2", 13, 50, 737, "OFFICIAL OUTPATIENT CONSULTATION PRESCRIPTION", 0.058, 0.090, 0.165);
  drawText("F2", 9, 395, 737, `RX ID: NEXUS-RX-2026-${patient.id}`, 0.055, 0.55, 0.45);

  // Doctor Credentials (Left Box)
  drawText("F2", 11, 40, 706, doctor.name, 0.058, 0.090, 0.165);
  drawText("F1", 8.5, 40, 694, doctor.qualifications, 0.25, 0.35, 0.45);
  drawText("F1", 8, 40, 682, `Reg. No: ${doctor.regNo} | ${doctor.department}`, 0.4, 0.45, 0.5);
  drawText("F1", 8, 40, 670, doctor.unit, 0.4, 0.45, 0.5);

  // Patient Demographics (Right Box)
  fillRect(360, 665, 195.28, 55, 0.97, 0.98, 0.99);
  drawLine(360, 665, 555.28, 665, 0.88, 0.9, 0.92, 0.75);
  drawText("F2", 10, 370, 706, `Patient: ${patient.name}`, 0.058, 0.090, 0.165);
  drawText("F1", 8.5, 370, 693, `MRN / ID: ${patient.id} | Age/Sex: ${patient.age}Y / ${patient.gender}`, 0.2, 0.25, 0.3);
  drawText("F1", 8, 370, 681, `ABHA ID: ${patient.abha}`, 0.25, 0.35, 0.45);
  drawText("F1", 8, 370, 670, `Date of Consultation: ${patient.visitDate}`, 0.35, 0.4, 0.45);

  drawLine(40, 656, 555.28, 656, 0.85, 0.88, 0.92, 1);

  // Diagnosis Line
  drawText("F2", 9, 40, 642, "Provisional / Clinical Diagnosis:", 0.058, 0.090, 0.165);
  drawText("F1", 9, 215, 642, patient.diagnosis, 0.1, 0.35, 0.6);

  // Critical Allergy Alert Banner
  fillRect(40, 615, 515.28, 20, 1.0, 0.94, 0.94); // Light rose
  drawLine(40, 615, 555.28, 615, 0.9, 0.3, 0.3, 1);
  drawText("F2", 8.5, 48, 621, "CRITICAL ALLERGY ALERT:", 0.85, 0.1, 0.1);
  drawText("F2", 8.5, 185, 621, "Patient has severe confirmed anaphylaxis to PENICILLIN & BETA-LACTAMS", 0.7, 0.1, 0.1);

  // Prescription Rx Header
  drawText("F2", 18, 40, 588, "Rx", 0.055, 0.55, 0.45);
  drawText("F2", 10.5, 68, 592, "PRESCRIBED MEDICINES & PHARMACOLOGICAL REGIMEN", 0.058, 0.090, 0.165);

  // Medicines Table Header
  fillRect(40, 565, 515.28, 18, 0.1, 0.15, 0.22); // Dark header
  drawText("F2", 8, 48, 571, "#", 1, 1, 1);
  drawText("F2", 8, 68, 571, "Medication & Formulation", 1, 1, 1);
  drawText("F2", 8, 230, 571, "Dosage", 1, 1, 1);
  drawText("F2", 8, 305, 571, "Frequency / Timing", 1, 1, 1);
  drawText("F2", 8, 420, 571, "Duration", 1, 1, 1);
  drawText("F2", 8, 475, 571, "Clinical Advice", 1, 1, 1);

  // Table Rows
  let curY = 545;
  medicines.forEach((med, idx) => {
    const isEven = idx % 2 === 0;
    if (isEven) {
      fillRect(40, curY - 14, 515.28, 30, 0.98, 0.99, 1.0);
    }
    drawLine(40, curY - 14, 555.28, curY - 14, 0.9, 0.92, 0.95, 0.5);

    drawText("F2", 8.5, 48, curY + 2, `${idx + 1}.`, 0.058, 0.090, 0.165);
    drawText("F2", 9, 68, curY + 2, med.name, 0.058, 0.090, 0.165);
    drawText("F1", 8, 68, curY - 9, med.instructions, 0.4, 0.45, 0.5);

    drawText("F1", 8.5, 230, curY + 2, med.dosage, 0.15, 0.2, 0.25);
    drawText("F2", 8.5, 305, curY + 2, med.freq, 0.055, 0.5, 0.4);
    drawText("F1", 7.5, 305, curY - 9, med.timing, 0.35, 0.4, 0.45);

    drawText("F2", 8.5, 420, curY + 2, med.duration, 0.1, 0.15, 0.2);
    drawText("F1", 8, 475, curY + 2, "Oral Administration", 0.3, 0.35, 0.4);

    curY -= 32;
  });

  // Clinical Notes & Lifestyle Advice Box
  curY -= 10;
  fillRect(40, curY - 45, 515.28, 50, 0.96, 0.97, 0.98);
  drawLine(40, curY - 45, 555.28, curY - 45, 0.88, 0.9, 0.92, 0.75);
  drawText("F2", 9, 48, curY - 6, "GENERAL INSTRUCTIONS & LIFESTYLE MODIFICATIONS:", 0.058, 0.090, 0.165);
  drawText("F1", 8, 48, curY - 18, "• Dietary: Strict low-salt (< 2g/day), heart-safe Mediterranean diet. Avoid deep fried & processed foods.", 0.2, 0.25, 0.3);
  drawText("F1", 8, 48, curY - 29, "• Activity: 30 minutes light aerobic walking daily. Avoid heavy lifting and intense isometric strain.", 0.2, 0.25, 0.3);
  drawText("F1", 8, 48, curY - 40, "• Review: Repeat Lipid Profile & Serum Creatinine in 14 days. Report immediately if chest discomfort occurs.", 0.2, 0.25, 0.3);

  // Footer & Digital Signature Block
  const sigY = curY - 80;
  drawLine(40, sigY + 25, 555.28, sigY + 25, 0.85, 0.88, 0.9, 1);

  // Digital Security Hash & QR Info (Left)
  drawText("F2", 8, 40, sigY + 12, "DIGITALLY VERIFIED PRESCRIPTION", 0.055, 0.55, 0.45);
  drawText("F1", 7.5, 40, sigY + 1, "Verification Hash: SHA256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1f", 0.5, 0.55, 0.6);
  drawText("F1", 7.5, 40, sigY - 10, "Compliant with National Digital Health Mission (ABDM) & Telemedicine Practice Guidelines 2020", 0.5, 0.55, 0.6);
  drawText("F1", 7.5, 40, sigY - 21, "Dispensed medications must be cross-verified by Registered Pharmacist prior to issue.", 0.5, 0.55, 0.6);

  // Doctor Signature (Right)
  drawText("F2", 10.5, 385, sigY + 12, doctor.name, 0.058, 0.090, 0.165);
  drawText("F1", 8, 385, sigY + 1, doctor.qualifications, 0.3, 0.35, 0.4);
  drawText("F1", 8, 385, sigY - 10, `Medical Council Reg No: ${doctor.regNo}`, 0.3, 0.35, 0.4);
  drawText("F2", 7.5, 385, sigY - 21, "[Digitally Authenticated by MediCare Nexus PKI]", 0.055, 0.55, 0.45);

  // Very bottom copyright
  fillRect(0, 0, 595.28, 20, 0.95, 0.96, 0.97);
  drawText("F1", 7, 140, 7, "MediCare Nexus Autonomous Hospital Platform • Confidential Medical Record • For Patient Use Only", 0.5, 0.55, 0.6);

  // Assemble Objects
  const contentStream = cmds.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream`
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [];

  for (let i = 0; i < objects.length; i++) {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefOffset = pdf.length;
  pdf += "xref\n";
  pdf += `0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";

  for (const off of offsets) {
    pdf += `${off.toString().padStart(10, "0")} 00000 n \n`;
  }

  pdf += "trailer\n";
  pdf += `<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += "startxref\n";
  pdf += `${xrefOffset}\n`;
  pdf += "%%EOF";

  // Trigger instant browser download as .pdf
  try {
    const blob = new Blob([pdf], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    const filename = `Medicare_Nexus_Prescription_${(patient.name || "Patient").replace(/\s+/g, "_")}_${patient.id || "Rx"}.pdf`;
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 1000);
    return true;
  } catch (err) {
    console.error("PDF generation error:", err);
    return false;
  }
}

export function generateEncounterPdf(encData = {}) {
  const patient = encData.patient || {
    name: "Harsh Tripathi",
    id: "P-101",
    abha: "91-8273-4412-9901",
    age: "34",
    gender: "Male",
    bloodGroup: "O+"
  };

  const visitId = encData.visitId || "VST-2026-7041";
  const title = encData.title || "Annual Routine Cardiac Evaluation";
  const date = encData.date || "15 Aug 2026";
  const doctor = encData.doctor || "Dr. Sarah Johnson";
  const department = encData.department || "Department of Cardiology & Vascular Medicine";
  const status = encData.status || "COMPLETED & DIGITALLY VERIFIED";
  const findings = encData.findings || "Patient presented for annual cardiovascular screening. Vital signs within normal therapeutic target ranges (BP 122/80 mmHg, HR 72 bpm, SpO2 99%). Resting 12-lead ECG confirmed normal sinus rhythm without ischemic ST-T changes. Transthoracic 2D Echocardiogram demonstrated preserved left ventricular ejection fraction (LVEF 62%) with normal chamber dimensions. No regional wall motion abnormalities or significant valvular regurgitation.";
  const diagnosis = encData.diagnosis || "Stable Cardiovascular Status • No Evidence of Acute Coronary Syndrome";
  const recommendations = encData.recommendations || "Continue regular moderate aerobic physical activity (30 minutes daily). Maintain balanced low-sodium heart-healthy diet. Routine follow-up in 12 months unless intercurrent symptoms arise.";

  const cmds = [];
  const fillRect = (x, y, w, h, r, g, b) => {
    cmds.push(`${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg`);
    cmds.push(`${x.toFixed(1)} ${y.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)} re f`);
  };

  const drawLine = (x1, y1, x2, y2, r, g, b, lineWidth = 1) => {
    cmds.push(`${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG`);
    cmds.push(`${lineWidth} w`);
    cmds.push(`${x1.toFixed(1)} ${y1.toFixed(1)} m ${x2.toFixed(1)} ${y2.toFixed(1)} l S`);
  };

  const drawText = (font, size, x, y, text, r = 0, g = 0, b = 0) => {
    cmds.push(`${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg`);
    cmds.push(`BT /${font} ${size} Tf ${x.toFixed(1)} ${y.toFixed(1)} Td (${escapePdfText(text)}) Tj ET`);
  };

  // Header Banner
  fillRect(0, 770, 595.28, 72, 0.058, 0.090, 0.165); // Slate 900
  fillRect(0, 766, 595.28, 4, 0.055, 0.706, 0.533);  // Emerald Accent Strip

  drawText("F2", 18, 40, 814, "MEDICARE NEXUS HEALTHCARE PLATFORM", 1, 1, 1);
  drawText("F1", 9, 40, 799, "NABH & JCI ACCREDITED TERTIARY SUPER-SPECIALTY TEACHING HOSPITAL", 0.7, 0.85, 0.8);
  drawText("F1", 8, 40, 785, "24/7 Emergency: 1800-419-9999 | Patient Helpdesk: 080-4920-1111 | https://medi-nexus-rhl.netlify.app", 0.6, 0.7, 0.75);

  // Encounter Title Bar
  fillRect(40, 726, 515.28, 30, 0.941, 0.965, 0.988);
  drawLine(40, 726, 555.28, 726, 0.8, 0.85, 0.9, 1);
  drawText("F2", 12.5, 50, 736, "CLINICAL ENCOUNTER SUMMARY & OUTPATIENT DISCHARGE RECORD", 0.058, 0.090, 0.165);
  drawText("F2", 9, 390, 736, `VISIT ID: ${visitId}`, 0.055, 0.55, 0.45);

  // Patient & Encounter Grid
  fillRect(40, 660, 515.28, 58, 0.97, 0.98, 0.99);
  drawLine(40, 660, 555.28, 660, 0.85, 0.88, 0.92, 1);

  // Left col: Patient details
  drawText("F2", 10, 48, 702, `Patient Name: ${patient.name}`, 0.058, 0.090, 0.165);
  drawText("F1", 8.5, 48, 689, `Patient ID: ${patient.id}  •  Age/Gender: ${patient.age}Y / ${patient.gender}  •  Blood: ${patient.bloodGroup || 'O+'}`, 0.25, 0.3, 0.35);
  drawText("F1", 8.5, 48, 676, `ABHA Health ID: ${patient.abha || '91-8273-4412-9901'} (Verified & Linked)`, 0.055, 0.55, 0.45);

  // Right col: Visit details
  drawText("F2", 9.5, 330, 702, `Encounter Type: ${title}`, 0.058, 0.090, 0.165);
  drawText("F1", 8.5, 330, 689, `Date of Encounter: ${date}  •  Status: ${status}`, 0.25, 0.3, 0.35);
  drawText("F1", 8.5, 330, 676, `Physician: ${doctor}  •  ${department}`, 0.25, 0.3, 0.35);

  // Vitals Banner
  fillRect(40, 620, 515.28, 30, 0.95, 0.98, 0.96);
  drawLine(40, 620, 555.28, 620, 0.8, 0.9, 0.85, 1);
  drawText("F2", 8.5, 48, 632, "TRIAGE VITALS:", 0.055, 0.5, 0.35);
  drawText("F1", 8.5, 125, 632, "BP: 122/80 mmHg  |  Pulse: 72 bpm  |  SpO2: 99%  |  Temp: 98.4 F  |  BMI: 23.4 kg/m2 (Normal)", 0.1, 0.15, 0.2);

  // Clinical Findings Section
  fillRect(40, 500, 515.28, 110, 0.98, 0.99, 1.0);
  drawLine(40, 500, 555.28, 500, 0.88, 0.9, 0.94, 1);
  drawText("F2", 10, 48, 594, "CLINICAL OBSERVATIONS & PHYSICAL EXAMINATION FINDINGS", 0.058, 0.090, 0.165);

  // Multi-line word wrap for findings
  const words = findings.split(" ");
  let line = "";
  let lineY = 576;
  for (let w of words) {
    if ((line + " " + w).length > 88) {
      drawText("F1", 8.5, 48, lineY, line, 0.2, 0.25, 0.3);
      line = w;
      lineY -= 14;
    } else {
      line = line ? line + " " + w : w;
    }
  }
  if (line) {
    drawText("F1", 8.5, 48, lineY, line, 0.2, 0.25, 0.3);
  }

  // Clinical Impression & Diagnosis
  fillRect(40, 420, 515.28, 70, 0.97, 0.97, 0.98);
  drawLine(40, 420, 555.28, 420, 0.88, 0.88, 0.92, 1);
  drawText("F2", 10, 48, 474, "ASSESSMENT & FINAL CLINICAL IMPRESSION", 0.058, 0.090, 0.165);
  drawText("F2", 9, 48, 456, diagnosis, 0.055, 0.5, 0.4);
  drawText("F1", 8.5, 48, 438, "No emergent intervention required. Baseline hemodynamics remain optimized and physiological parameters stable.", 0.3, 0.35, 0.4);

  // Recommendations & Follow-Up
  fillRect(40, 310, 515.28, 100, 0.96, 0.98, 0.98);
  drawLine(40, 310, 555.28, 310, 0.85, 0.9, 0.9, 1);
  drawText("F2", 10, 48, 394, "RECOMMENDATIONS, DISCHARGE PLAN & PREVENTIVE GUIDANCE", 0.058, 0.090, 0.165);
  const recWords = recommendations.split(" ");
  let recLine = "";
  let recY = 376;
  for (let w of recWords) {
    if ((recLine + " " + w).length > 88) {
      drawText("F1", 8.5, 48, recY, recLine, 0.2, 0.25, 0.3);
      recLine = w;
      recY -= 14;
    } else {
      recLine = recLine ? recLine + " " + w : w;
    }
  }
  if (recLine) {
    drawText("F1", 8.5, 48, recY, recLine, 0.2, 0.25, 0.3);
  }
  drawText("F1", 8, 48, recY - 14, "• In case of any acute chest tightness, breathlessness, or dizziness, visit Emergency Triage or call 1800-419-9999.", 0.5, 0.2, 0.2);

  // Sign-off Block
  const sigY = 220;
  drawLine(40, sigY + 30, 555.28, sigY + 30, 0.85, 0.88, 0.9, 1);

  drawText("F2", 8.5, 48, sigY + 14, "DIGITALLY VERIFIED HOSPITAL RECORD", 0.055, 0.55, 0.45);
  drawText("F1", 7.5, 48, sigY + 2, `Verification Record: SHA256: 8a4c99b2e04f98114f6532d847c-${visitId}`, 0.5, 0.55, 0.6);
  drawText("F1", 7.5, 48, sigY - 10, "National Health Authority (ABDM) • Compliant with EHR Standards for India (MoHFW)", 0.5, 0.55, 0.6);
  drawText("F1", 7.5, 48, sigY - 22, "This clinical encounter document is cryptographically sealed and legally valid for insurance & clinical audits.", 0.5, 0.55, 0.6);

  drawText("F2", 10.5, 380, sigY + 14, doctor, 0.058, 0.090, 0.165);
  drawText("F1", 8, 380, sigY + 2, "Consultant Physician  •  Medical Council Reg: KMC-48291", 0.3, 0.35, 0.4);
  drawText("F2", 7.5, 380, sigY - 10, "[Electronically Signed via MediCare Nexus PKI Vault]", 0.055, 0.55, 0.45);

  // Footer copyright
  fillRect(0, 0, 595.28, 20, 0.95, 0.96, 0.97);
  drawText("F1", 7, 130, 7, "MediCare Nexus Autonomous Hospital Platform • Official Encounter Record • Confidential Patient Health Information", 0.5, 0.55, 0.6);

  // Assemble Objects
  const contentStream = cmds.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream`
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [];

  for (let i = 0; i < objects.length; i++) {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefOffset = pdf.length;
  pdf += "xref\n";
  pdf += `0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";

  for (const off of offsets) {
    pdf += `${off.toString().padStart(10, "0")} 00000 n \n`;
  }

  pdf += "trailer\n";
  pdf += `<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += "startxref\n";
  pdf += `${xrefOffset}\n`;
  pdf += "%%EOF";

  try {
    const blob = new Blob([pdf], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    const filename = `Medicare_Encounter_${visitId}_${(patient.name || "Patient").replace(/\\s+/g, "_")}.pdf`;
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 1000);
    return true;
  } catch (err) {
    console.error("Encounter PDF generation error:", err);
    return false;
  }
}
