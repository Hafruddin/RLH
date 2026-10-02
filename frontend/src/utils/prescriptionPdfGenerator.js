// frontend/src/utils/prescriptionPdfGenerator.js
import jsPDF from "jspdf/dist/jspdf.umd.min.js";

export function generatePrescriptionPdf(rxData) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const primaryColor = [14, 116, 144]; // cyan-700
  const darkColor = [15, 23, 42]; // slate-900
  const grayColor = [100, 116, 139]; // slate-500
  const redColor = [225, 29, 72]; // rose-600

  // 1. Hospital Header Bar
  doc.setFillColor(...darkColor);
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("MEDICARE NEXUS HOSPITAL & RESEARCH CENTRE", 14, 11);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(45, 212, 191); // teal-400
  doc.text("Autonomous Hospital Resource Orchestration Platform · NABH & JCI Accredited", 14, 17);

  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text("100 Feet Ring Road, Phase 2, Bangalore - 560103 | Emergency: 108 | support@medicare.com", 14, 23);

  // 2. Doctor Info & Rx Metadata
  doc.setTextColor(...darkColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Dr. Sarah Johnson, MD, DM (Cardiology)", 14, 38);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text("Senior Consultant Interventional Cardiologist", 14, 43);
  doc.text("Reg No: KMC-48291-A | OPD Cabin 102 (Floor 1)", 14, 47);

  // Right-aligned Rx Meta
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryColor);
  doc.text(`Prescription ID: ${rxData?.rxId || "RX-2026-8812"}`, pageWidth - 14, 38, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text(`Date: ${rxData?.date || new Date().toLocaleDateString("en-GB")}`, pageWidth - 14, 43, { align: "right" });
  doc.text(`Visit ID: ${rxData?.visitId || "VST-2026-8812"}`, pageWidth - 14, 47, { align: "right" });

  // Divider
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, 52, pageWidth - 14, 52);

  // 3. Patient Details Card Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(14, 56, pageWidth - 28, 24, 2, 2, "F");
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, 56, pageWidth - 28, 24, 2, 2, "D");

  doc.setTextColor(...darkColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("PATIENT INFORMATION", 18, 62);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Name: Harsh Tripathi (${rxData?.patientId || "P-101"})`, 18, 68);
  doc.text(`Age / Gender: 34 Y / Male`, 18, 73);
  doc.text(`Blood Group: O Positive (O+)`, 18, 77);

  doc.text(`ABHA Health ID: 91-8273-4412-9901`, 95, 68);
  doc.text(`Contact: +91 98765 43210`, 95, 73);
  doc.text(`Insurance: Star Health (Pre-Approved)`, 95, 77);

  // Red Flag Allergy on Right
  doc.setFillColor(255, 241, 242);
  doc.setDrawColor(254, 205, 211);
  doc.roundedRect(pageWidth - 78, 59, 60, 18, 1, 1, "FD");
  doc.setTextColor(...redColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("CRITICAL ALLERGY ALERT:", pageWidth - 75, 65);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("PENICILLIN & AMOXICILLIN", pageWidth - 75, 70);
  doc.text("Severe Anaphylaxis Risk", pageWidth - 75, 74);

  // 4. Clinical Diagnosis & Vitals
  let currentY = 88;
  doc.setTextColor(...darkColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("CLINICAL DIAGNOSIS & REASON FOR VISIT:", 14, currentY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text("Essential Hypertension (Stage 1), Mild Dyslipidemia, Post-Triage Cardiovascular Screening.", 14, currentY + 5);

  currentY += 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text("Recorded Vitals: BP: 120/80 mmHg | Pulse: 72 bpm | SpO2: 98% | Temp: 98.6°F | Weight: 74 kg", 14, currentY);

  // 5. Rx Symbol & Medicines Table Header
  currentY += 10;
  doc.setTextColor(...primaryColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Rx", 14, currentY);

  doc.setFontSize(9);
  doc.setTextColor(...darkColor);
  doc.text("PRESCRIBED MEDICATIONS", 26, currentY - 1);

  currentY += 4;
  // Table Header
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(14, currentY, pageWidth - 28, 8, "F");
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, currentY, pageWidth - 28, 8, "D");

  doc.setTextColor(...darkColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("#", 17, currentY + 5.5);
  doc.text("MEDICATION & STRENGTH", 24, currentY + 5.5);
  doc.text("DOSAGE / FREQUENCY", 90, currentY + 5.5);
  doc.text("TIMING / INSTRUCTIONS", 135, currentY + 5.5);
  doc.text("DURATION", pageWidth - 16, currentY + 5.5, { align: "right" });

  currentY += 8;

  // Medicines List
  const medicines = [
    {
      name: "Tab. Atorvastatin Calcium",
      strength: "20 mg",
      dosage: "1 Tablet (0-0-1)",
      timing: "Once daily at bedtime after food",
      duration: "30 Days (30 Tab)",
      notes: "Lipid management. Avoid grapefruit juice."
    },
    {
      name: "Tab. Metoprolol Succinate ER",
      strength: "25 mg",
      dosage: "1 Tablet (1-0-0)",
      timing: "Once daily morning after breakfast",
      duration: "30 Days (30 Tab)",
      notes: "Blood pressure regulation. Monitor resting pulse."
    },
    {
      name: "Cap. Aspirin (Ecosprin)",
      strength: "75 mg",
      dosage: "1 Capsule (0-1-0)",
      timing: "Once daily afternoon after lunch",
      duration: "30 Days (30 Cap)",
      notes: "Antiplatelet cardioprotective therapy."
    },
    {
      name: "Cap. Cholecalciferol (Vitamin D3)",
      strength: "60,000 IU",
      dosage: "1 Capsule weekly",
      timing: "Sunday morning after heavy meal / milk",
      duration: "8 Weeks (8 Cap)",
      notes: "Bone density & cardiovascular metabolic support."
    },
    {
      name: "Tab. Pantoprazole Sodium",
      strength: "40 mg",
      dosage: "1 Tablet (1-0-0)",
      timing: "Once daily early morning 30 min before food",
      duration: "14 Days (14 Tab)",
      notes: "Gastroprotection as advised."
    }
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  medicines.forEach((med, idx) => {
    // Alternating row background
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, currentY, pageWidth - 28, 12, "F");
    }
    doc.setDrawColor(241, 245, 249);
    doc.line(14, currentY + 12, pageWidth - 14, currentY + 12);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...darkColor);
    doc.text(String(idx + 1), 17, currentY + 5);
    doc.text(`${med.name} ${med.strength}`, 24, currentY + 5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(med.notes, 24, currentY + 9.5);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(14, 116, 144);
    doc.text(med.dosage, 90, currentY + 5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    doc.text(med.timing, 135, currentY + 5);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(med.duration, pageWidth - 16, currentY + 5, { align: "right" });

    currentY += 12;
  });

  // 6. Clinical Advice & Investigation Orders
  currentY += 6;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, currentY, pageWidth - 28, 24, 2, 2, "F");
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, pageWidth - 28, 24, 2, 2, "D");

  doc.setTextColor(...darkColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("LIFESTYLE GUIDELINES & CLINICAL ORDERS:", 18, currentY + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text("• Low sodium cardiac diet (< 2.5g sodium/day). Avoid fried foods, processed meats, and trans fats.", 18, currentY + 11);
  doc.text("• 30-45 minutes brisk walking at least 5 days a week. Maintain adequate hydration.", 18, currentY + 16);
  doc.text("• Diagnostic Orders: 12-Lead Electrocardiogram & 2D Echocardiography (Ground Floor Diagnostics Suite).", 18, currentY + 21);

  currentY += 28;

  // 7. Follow-Up & Next Appointment
  doc.setTextColor(...primaryColor);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("NEXT FOLLOW-UP REVIEW:", 14, currentY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...darkColor);
  doc.text("After 14 Days (17 Oct 2026) with repeat fasting Lipid Profile & Resting Blood Pressure records.", 14, currentY + 4.5);

  // 8. Sign-off & Hospital Stamp
  currentY += 16;
  doc.setDrawColor(203, 213, 225);
  doc.line(pageWidth - 75, currentY + 12, pageWidth - 14, currentY + 12);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...darkColor);
  doc.text("Dr. Sarah Johnson, MD, DM", pageWidth - 14, currentY + 16, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...grayColor);
  doc.text("Consultant Interventional Cardiologist", pageWidth - 14, currentY + 20, { align: "right" });
  doc.text("Digitally Verified e-Signature · MediCare Nexus EHR", pageWidth - 14, currentY + 24, { align: "right" });

  // Verification QR note on bottom left
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...grayColor);
  doc.text("QR Verification: Scanned via ABHA Health Locker", 14, currentY + 18);
  doc.text("Security Hash: SHA256:7a9f82bc19402e389d0012e84", 14, currentY + 22);

  // 9. Footer Line
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 282, pageWidth - 14, 282);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(...grayColor);
  doc.text("This is a digitally generated medical prescription under the Ayushman Bharat Digital Mission (ABDM).", 14, 286);
  doc.text(`Generated on ${new Date().toLocaleString("en-GB")} | MediCare Nexus Platform`, pageWidth - 14, 286, { align: "right" });

  // Save PDF
  const filename = `Medicare_Nexus_Prescription_Harsh_Tripathi_P101.pdf`;
  doc.save(filename);
  return filename;
}
