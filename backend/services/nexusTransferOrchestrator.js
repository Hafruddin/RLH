// backend/services/nexusTransferOrchestrator.js
// Patient Movement & Clinical Transfer Orchestration for MediCare Nexus
// Implements: TRANSFER_REQUESTED -> TRANSFER_APPROVED -> IN_TRANSIT -> ARRIVED -> ASSIGNED
// Synchronizes bed occupancy, releases source beds into cleaning workflows, and recalculates workload.

import { nexusStore } from "./nexusStore.js";
import { broadcastEvent } from "./eventHub.js";

export class NexusTransferOrchestrator {
  constructor() {
    this.transfers = [];
    this.initDefaultTransfers();
  }

  initDefaultTransfers() {
    this.transfers = [
      {
        transferId: "TRF-P101-01",
        patientId: "P-101",
        patientName: "Vikram Malhotra",
        sourceDepartment: "General",
        sourceWard: "WARD-GEN-A",
        sourceBedId: "GEN-A-02",
        targetDepartment: "Emergency",
        targetWard: "WARD-EMG",
        targetBedId: "ER-02",
        status: "ARRIVED",
        priority: "CRITICAL",
        clinicalReason: "Sudden respiratory distress requiring emergency intubation & telemetry monitoring",
        requestedBy: "Sister Maria (Ward In-Charge Gen-A)",
        requestedAt: new Date(Date.now() - 3600000).toISOString(),
        approvedBy: "Dr. Sarah Johnson (ED In-Charge)",
        approvedAt: new Date(Date.now() - 3300000).toISOString(),
        inTransitAt: new Date(Date.now() - 2400000).toISOString(),
        arrivedAt: new Date(Date.now() - 600000).toISOString(),
        arrivalConfirmedBy: "Nurse Anita Roy (Emergency RN)",
        assignedAt: new Date(Date.now() - 500000).toISOString(),
        currentStageDisplay: "Arrived at Emergency Care Bay ER-02",
        auditLog: [
          { stage: "TRANSFER_REQUESTED", timestamp: new Date(Date.now() - 3600000).toISOString(), actor: "Ward In-Charge", note: "Initiated clinical transfer request due to SpO2 drop to 84%." },
          { stage: "TRANSFER_APPROVED", timestamp: new Date(Date.now() - 3300000).toISOString(), actor: "Dr. Sarah Johnson", note: "Emergency transfer authorized; Bed ER-02 pre-reserved." },
          { stage: "IN_TRANSIT", timestamp: new Date(Date.now() - 2400000).toISOString(), actor: "Orderly Transport Team", note: "Patient in mobile transit with portable oxygen cylinder." },
          { stage: "ARRIVED", timestamp: new Date(Date.now() - 600000).toISOString(), actor: "Nurse Anita Roy", note: "Physical arrival verified at ED Bay ER-02. Vital monitoring established." },
          { stage: "ASSIGNED", timestamp: new Date(Date.now() - 500000).toISOString(), actor: "Nexus Orchestrator", note: "Source bed GEN-A-02 released to CLEANING workflow. Staff requirements recalculated." }
        ]
      }
    ];
  }

  getTransfers() {
    return this.transfers;
  }

  getTransferById(transferId) {
    return this.transfers.find((t) => t.transferId === transferId);
  }

  getPatientTransfer(patientId) {
    return this.transfers.find((t) => t.patientId === patientId);
  }

  /**
   * Stage 1: Request Transfer
   */
  requestTransfer({
    patientId = "P-101",
    patientName = "Patient P-101",
    sourceDepartment = "General",
    sourceWard = "WARD-GEN-A",
    sourceBedId = "GEN-A-02",
    targetDepartment = "Emergency",
    targetWard = "WARD-EMG",
    targetBedId = "ER-02",
    clinicalReason = "Clinical escalation requiring emergency intervention",
    priority = "CRITICAL",
    requestedBy = "Ward In-Charge",
  }) {
    const transferId = `TRF-${Date.now().toString().slice(-6)}`;
    const transfer = {
      transferId,
      patientId,
      patientName,
      sourceDepartment,
      sourceWard,
      sourceBedId,
      targetDepartment,
      targetWard,
      targetBedId,
      status: "TRANSFER_REQUESTED",
      priority,
      clinicalReason,
      requestedBy,
      requestedAt: new Date().toISOString(),
      approvedBy: null,
      approvedAt: null,
      inTransitAt: null,
      arrivedAt: null,
      arrivalConfirmedBy: null,
      assignedAt: null,
      currentStageDisplay: `Transfer Requested: ${sourceDepartment} -> ${targetDepartment}`,
      auditLog: [
        {
          stage: "TRANSFER_REQUESTED",
          timestamp: new Date().toISOString(),
          actor: requestedBy,
          note: `Clinical transfer initiated from ${sourceBedId} (${sourceWard}) to ${targetDepartment}.`,
        },
      ],
    };

    this.transfers.unshift(transfer);

    broadcastEvent("patientTransferRequested", {
      transferId,
      patientId,
      from: sourceDepartment,
      to: targetDepartment,
      priority,
    });

    return { success: true, transfer };
  }

  /**
   * Stage 2: Approve Transfer
   */
  approveTransfer(transferId, approvedBy = "Supervising Physician") {
    const transfer = this.getTransferById(transferId);
    if (!transfer) return { success: false, message: "Transfer record not found" };

    transfer.status = "TRANSFER_APPROVED";
    transfer.approvedBy = approvedBy;
    transfer.approvedAt = new Date().toISOString();
    transfer.currentStageDisplay = "Transfer Approved — Awaiting Orderly Escort";
    transfer.auditLog.push({
      stage: "TRANSFER_APPROVED",
      timestamp: new Date().toISOString(),
      actor: approvedBy,
      note: `Transfer approved. Pre-allocating receiving bed ${transfer.targetBedId || "in target ward"}.`,
    });

    // Mark target bed RESERVED
    if (transfer.targetBedId) {
      const targetBed = nexusStore.beds.find((b) => b.bedId === transfer.targetBedId);
      if (targetBed) {
        targetBed.status = "RESERVED";
        targetBed.patientId = transfer.patientId;
      }
    }

    broadcastEvent("patientTransferApproved", { transferId, approvedBy });
    return { success: true, transfer };
  }

  /**
   * Stage 3: In-Transit
   */
  markInTransit(transferId, orderlyName = "Medical Transport Team") {
    const transfer = this.getTransferById(transferId);
    if (!transfer) return { success: false, message: "Transfer record not found" };

    transfer.status = "IN_TRANSIT";
    transfer.inTransitAt = new Date().toISOString();
    transfer.currentStageDisplay = `In Transit: En route to ${transfer.targetDepartment}`;
    transfer.auditLog.push({
      stage: "IN_TRANSIT",
      timestamp: new Date().toISOString(),
      actor: orderlyName,
      note: "Patient escorted in transit with active clinical telemetry.",
    });

    broadcastEvent("patientTransferInTransit", { transferId });
    return { success: true, transfer };
  }

  /**
   * Stage 4: Arrived & Confirmed by Receiving Staff
   * Section 13: Only after confirmed arrival should receiving bed become occupied,
   * source bed released into cleaning workflow, and workload recalculated.
   */
  confirmArrival(transferId, confirmedBy = "Receiving Nurse In-Charge") {
    const transfer = this.getTransferById(transferId);
    if (!transfer) return { success: false, message: "Transfer record not found" };

    const now = new Date().toISOString();
    transfer.status = "ARRIVED";
    transfer.arrivedAt = now;
    transfer.arrivalConfirmedBy = confirmedBy;
    transfer.assignedAt = now;
    transfer.currentStageDisplay = `Arrived & Under Care in ${transfer.targetDepartment} (Bed ${transfer.targetBedId})`;

    transfer.auditLog.push({
      stage: "ARRIVED",
      timestamp: now,
      actor: confirmedBy,
      note: `Physical arrival confirmed at ${transfer.targetDepartment}. Patient safely placed in Bed ${transfer.targetBedId}.`,
    });

    transfer.auditLog.push({
      stage: "ASSIGNED",
      timestamp: now,
      actor: "Nexus Orchestration Layer",
      note: `Receiving bed ${transfer.targetBedId} marked OCCUPIED. Source bed ${transfer.sourceBedId} transitioned to DISCHARGE_PENDING -> CLEANING workflow. Staff requirements updated.`,
    });

    // 1. Target bed becomes OCCUPIED
    if (transfer.targetBedId) {
      const targetBed = nexusStore.beds.find((b) => b.bedId === transfer.targetBedId);
      if (targetBed) {
        targetBed.status = "OCCUPIED";
        targetBed.patientId = transfer.patientId;
        targetBed.lastUpdated = now;
      }
    }

    // 2. Source bed released into bed workflow: OCCUPIED -> DISCHARGE_PENDING -> CLEANING
    if (transfer.sourceBedId) {
      const sourceBed = nexusStore.beds.find((b) => b.bedId === transfer.sourceBedId);
      if (sourceBed) {
        sourceBed.status = "CLEANING";
        sourceBed.patientId = null;
        sourceBed.verificationRequired = true;
        sourceBed.lastUpdated = now;
      }
    }

    // 3. Update RTLS 2D map location of patient
    const patientPin = nexusStore.rtlsLocations.find((r) => r.resourceId === transfer.patientId);
    if (patientPin) {
      patientPin.zone = `${transfer.targetDepartment} Bay`;
      patientPin.status = "ARRIVED_ACTIVE";
      patientPin.floor = transfer.targetDepartment === "Emergency" ? 1 : 2;
    }

    broadcastEvent("patientTransferCompleted", {
      transferId,
      patientId: transfer.patientId,
      newBedId: transfer.targetBedId,
      releasedBedId: transfer.sourceBedId,
      confirmedBy,
    });

    return {
      success: true,
      transfer,
      stateChanges: {
        receivingBedOccupied: transfer.targetBedId,
        sourceBedReleasedToCleaning: transfer.sourceBedId,
        patientCurrentLocation: `${transfer.targetDepartment} (Bed ${transfer.targetBedId})`,
      },
    };
  }
}

export const nexusTransferOrchestrator = new NexusTransferOrchestrator();
