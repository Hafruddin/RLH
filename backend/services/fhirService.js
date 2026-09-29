// backend/services/fhirService.js
// Standard FHIR R4 JSON Transformation Adapter Layer
// Formats internal MediCare Nexus records into FHIR-compliant resources

import Patient from "../models/Patient.js";
import Bed from "../models/Bed.js";
import EmergencyEvent from "../models/EmergencyEvent.js";

export async function toFhirPatient(patientId) {
  const patient = await Patient.findOne({ patientId });
  if (!patient) return null;

  return {
    resourceType: "Patient",
    id: patient.patientId,
    meta: {
      versionId: "1",
      lastUpdated: patient.updatedAt || new Date().toISOString(),
      profile: ["http://hl7.org/fhir/StructureDefinition/Patient"],
      adapter: "MediCare Nexus FHIR Integration Layer (Prototype Adapter)"
    },
    identifier: [
      {
        use: "official",
        system: "urn:oid:medicare-nexus:patient-mrn",
        value: patient.patientId
      }
    ],
    active: true,
    name: [
      {
        use: "official",
        text: patient.name,
        family: patient.name.split(" ").slice(-1)[0] || "",
        given: patient.name.split(" ").slice(0, -1)
      }
    ],
    telecom: [
      {
        system: "phone",
        value: patient.contact || "+91 9800000000",
        use: "mobile"
      }
    ],
    gender: (patient.gender || "unknown").toLowerCase(),
    extension: [
      {
        url: "http://hl7.org/fhir/StructureDefinition/patient-bloodGroup",
        valueString: patient.bloodGroup || "O+"
      },
      {
        url: "http://hl7.org/fhir/StructureDefinition/patient-acuity",
        valueCode: patient.acuity || "MEDIUM"
      },
      {
        url: "http://hl7.org/fhir/StructureDefinition/patient-currentWard",
        valueString: patient.currentWard || "Unassigned"
      },
      {
        url: "http://hl7.org/fhir/StructureDefinition/patient-currentBed",
        valueString: patient.currentBed || "Unassigned"
      }
    ]
  };
}

export async function toFhirEncounter(patientId) {
  const patient = await Patient.findOne({ patientId });
  const emergency = await EmergencyEvent.findOne({ patientId }).sort({ createdAt: -1 });

  return {
    resourceType: "Encounter",
    id: `ENC-${patientId}`,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/Encounter"],
      adapter: "MediCare Nexus FHIR Integration Layer"
    },
    status: patient?.currentStatus === "Discharged" ? "finished" : "in-progress",
    class: {
      system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      code: emergency ? "EMER" : "IMP",
      display: emergency ? "emergency" : "inpatient encounter"
    },
    subject: {
      reference: `Patient/${patientId}`,
      display: patient?.name || "Patient"
    },
    period: {
      start: patient?.admissionTime || new Date().toISOString()
    },
    reasonCode: [
      {
        coding: [
          {
            system: "http://snomed.info/sct",
            code: "394802001",
            display: patient?.department || "Emergency Medicine"
          }
        ]
      }
    ],
    location: [
      {
        location: {
          display: `${patient?.currentWard || "Emergency"} - Bed ${patient?.currentBed || "Pending"}`
        },
        status: "active"
      }
    ]
  };
}

export async function toFhirObservation(patientId) {
  const patient = await Patient.findOne({ patientId });
  const vitals = patient?.vitals || { heartRate: 75, spO2: 98, bp: "120/80" };

  return {
    resourceType: "Observation",
    id: `OBS-VITALS-${patientId}`,
    meta: {
      profile: ["http://hl7.org/fhir/StructureDefinition/vitalsigns"],
      adapter: "MediCare Nexus FHIR Adapter"
    },
    status: "final",
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/observation-category",
            code: "vital-signs",
            display: "Vital Signs"
          }
        ]
      }
    ],
    subject: {
      reference: `Patient/${patientId}`,
      display: patient?.name || "Patient"
    },
    effectiveDateTime: new Date().toISOString(),
    component: [
      {
        code: {
          coding: [{ system: "http://loinc.org", code: "8867-4", display: "Heart rate" }]
        },
        valueQuantity: {
          value: vitals.heartRate,
          unit: "beats/minute",
          system: "http://unitsofmeasure.org",
          code: "/min"
        }
      },
      {
        code: {
          coding: [{ system: "http://loinc.org", code: "59408-5", display: "Oxygen saturation in Arterial blood" }]
        },
        valueQuantity: {
          value: vitals.spO2,
          unit: "%",
          system: "http://unitsofmeasure.org",
          code: "%"
        }
      },
      {
        code: {
          coding: [{ system: "http://loinc.org", code: "85354-9", display: "Blood pressure" }]
        },
        valueString: vitals.bp
      }
    ]
  };
}
